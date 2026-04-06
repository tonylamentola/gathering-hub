import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY } from "@/lib/kv";

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
    // Try KV first
    const kvData = await kv.get(CONTENT_KEY);
    if (kvData) {
      return NextResponse.json(kvData);
    }
    // Fallback to static content.json (build-time file)
    const raw = readFileSync(CONTENT_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw));
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
    // Write to KV instead of filesystem
    await kv.set(CONTENT_KEY, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
