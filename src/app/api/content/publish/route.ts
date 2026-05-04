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

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (process.env.VERCEL_ENV === "preview" && process.env.ALLOW_PREVIEW_PUBLISH !== "true") {
      return NextResponse.json(
        { error: "Preview deployments can save drafts, but cannot publish live content." },
        { status: 409 },
      );
    }

    const hasKvConfig =
      !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

    if (hasKvConfig) {
      const draft =
        (await kv.get(CONTENT_DRAFT_KEY)) ||
        (await kv.get(CONTENT_PUBLISHED_KEY)) ||
        (await kv.get(CONTENT_KEY));

      if (!draft) {
        return NextResponse.json({ error: "No draft content found" }, { status: 404 });
      }

      const existingPublished = await kv.get(CONTENT_PUBLISHED_KEY);
      if (existingPublished) {
        await kv.set(`${CONTENT_BACKUP_PREFIX}published:${Date.now()}`, existingPublished);
      }

      await kv.set(CONTENT_PUBLISHED_KEY, draft);
      await kv.set(CONTENT_KEY, draft);
      return NextResponse.json({ success: true, publishedAt: new Date().toISOString() });
    }

    const draft = (() => {
      try {
        return readJsonFile(DRAFT_CONTENT_PATH);
      } catch {
        return readJsonFile(CONTENT_PATH);
      }
    })();
    writeFileSync(CONTENT_PATH, JSON.stringify(draft, null, 2), "utf8");
    return NextResponse.json({ success: true, publishedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to publish content" }, { status: 500 });
  }
}
