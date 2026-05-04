import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { kv, CONTENT_BACKUP_PREFIX, CONTENT_DRAFT_KEY, CONTENT_KEY, CONTENT_PUBLISHED_KEY } from "@/lib/kv";
import { isAdminRequest } from "@/lib/admin-auth";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const DRAFT_CONTENT_PATH = path.join(process.cwd(), "data", "content.draft.json");

function readJsonFile(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get("mode") === "published" ? "published" : "draft";
    const localContent = readJsonFile(CONTENT_PATH);

    const hasKvConfig =
      !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

    if (hasKvConfig) {
      try {
        if (mode === "draft") {
          const draftData = await kv.get(CONTENT_DRAFT_KEY);
          if (draftData) return NextResponse.json({ mode, content: draftData });
        }
        const publishedData = await kv.get(CONTENT_PUBLISHED_KEY);
        if (publishedData) return NextResponse.json({ mode, content: publishedData });
        const legacyData = await kv.get(CONTENT_KEY);
        if (legacyData) return NextResponse.json({ mode, content: legacyData });
      } catch {
        // KV unavailable — fall through to local file.
      }
    }

    if (mode === "draft") {
      try {
        return NextResponse.json({ mode, content: readJsonFile(DRAFT_CONTENT_PATH) });
      } catch {
        return NextResponse.json({ mode, content: localContent });
      }
    }

    return NextResponse.json({ mode, content: localContent });
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    try {
      try {
        const existing = await kv.get(CONTENT_DRAFT_KEY);
        if (existing) {
          await kv.set(`${CONTENT_BACKUP_PREFIX}draft:${Date.now()}`, existing);
        }
      } catch {
        // Ignore backup failures and still attempt primary save.
      }
      await kv.set(CONTENT_DRAFT_KEY, body);
    } catch {
      // Local/dev fallback so the portal remains editable without KV.
      writeFileSync(DRAFT_CONTENT_PATH, JSON.stringify(body, null, 2), "utf8");
    }
    return NextResponse.json({ success: true, mode: "draft" });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
