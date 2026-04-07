import { readFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY } from "@/lib/kv";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

export type SiteSettings = {
  siteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  mapsUrl?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

export type SiteContent = {
  settings?: SiteSettings;
  blogPosts?: BlogPost[];
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const kvData = await kv.get<SiteContent>(CONTENT_KEY);
    if (kvData) return kvData;
  } catch {
    // Fallback for local/dev or missing KV.
  }

  const raw = readFileSync(CONTENT_PATH, "utf8");
  return JSON.parse(raw) as SiteContent;
}
