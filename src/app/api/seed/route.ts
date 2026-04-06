import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY } from "@/lib/kv";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
// Basic auth: gatheringhub:2026! → base64 = Z2hlcmV0aW5naHViOjIwMjYh
const SEED_AUTH = "Basic Z2hlcmV0aW5naHViOjIwMjYh";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== SEED_AUTH) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = readFileSync(CONTENT_PATH, "utf8");
    const contentData = JSON.parse(raw);
    await kv.set(CONTENT_KEY, contentData);
    return NextResponse.json({ success: true, message: "KV seeded from content.json" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
