import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY, CONTENT_BACKUP_PREFIX } from "@/lib/kv";
import type { SiteContent } from "@/lib/content";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

function clean(value: unknown) {
  return String(value ?? "").trim().slice(0, 1000);
}

function readLocalContent(): SiteContent {
  return JSON.parse(readFileSync(CONTENT_PATH, "utf8")) as SiteContent;
}

async function readContent(): Promise<SiteContent> {
  const hasKvConfig = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

  if (hasKvConfig) {
    try {
      const kvData = await kv.get<SiteContent>(CONTENT_KEY);
      if (kvData) return kvData;
    } catch {
      // Fall through to file for local/dev resilience.
    }
  }

  return readLocalContent();
}

async function writeContent(content: SiteContent) {
  const hasKvConfig = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

  if (hasKvConfig) {
    try {
      const existing = await kv.get(CONTENT_KEY);
      if (existing) await kv.set(`${CONTENT_BACKUP_PREFIX}${Date.now()}`, existing);
      await kv.set(CONTENT_KEY, content);
      return;
    } catch {
      // Fall through to local write.
    }
  }

  writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inquiry = {
      id: `inq${Date.now()}`,
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      eventType: clean(body.eventType),
      preferredDate: clean(body.preferredDate),
      guestCount: clean(body.guestCount),
      foodNeeds: clean(body.foodNeeds),
      message: clean(body.message),
      createdAt: new Date().toISOString(),
      status: "new" as const,
    };

    if (!inquiry.name || (!inquiry.email && !inquiry.phone)) {
      return NextResponse.json({ error: "Please include your name and either email or phone." }, { status: 400 });
    }

    const content = await readContent();
    const inquiries = Array.isArray(content.inquiries) ? content.inquiries : [];
    await writeContent({ ...content, inquiries: [inquiry, ...inquiries].slice(0, 200) });

    return NextResponse.json({ ok: true, inquiry });
  } catch {
    return NextResponse.json({ error: "Unable to save inquiry." }, { status: 500 });
  }
}
