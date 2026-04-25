import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY, CONTENT_BACKUP_PREFIX } from "@/lib/kv";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const ADMIN_PASSWORD = "GatheringHub2026!";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    return decoded === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const raw = readFileSync(CONTENT_PATH, "utf8");
    const localContent = JSON.parse(raw);

    const hasKvConfig =
      !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

    if (hasKvConfig) {
      try {
        const kvData = await kv.get(CONTENT_KEY);
        if (kvData) {
          // KV is authoritative once written — do NOT merge with file.
          // Merging causes deleted items to ghost back from the file.
          return NextResponse.json(kvData);
        }
      } catch {
        // KV unavailable — fall through to local file.
      }
    }

    // No KV data yet — use local file as seed.
    return NextResponse.json(localContent);
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    try {
      try {
        const existing = await kv.get(CONTENT_KEY);
        if (existing) {
          await kv.set(`${CONTENT_BACKUP_PREFIX}${Date.now()}`, existing);
        }
      } catch {
        // Ignore backup failures and still attempt primary save.
      }
      await kv.set(CONTENT_KEY, body);
    } catch {
      // Local/dev fallback so the portal remains editable without KV.
      writeFileSync(CONTENT_PATH, JSON.stringify(body, null, 2), "utf8");
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
