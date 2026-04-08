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
  stripeBillingUrl?: string;
  billingPlan?: string;
  billingStatus?: string;
  nextStep?: string;
  onboardingNotes?: string;
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

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageAspect?: "landscape" | "square" | "portrait";
  imageCrop?: { zoom?: number; x?: number; y?: number };
  price?: string;
  availability?: string;
};

export type LifeAtHubPhoto = {
  id: string;
  imageUrl: string;
  imageAspect?: "landscape" | "square" | "portrait";
  imageCrop?: { zoom?: number; x?: number; y?: number };
  caption: string;
};

export type UpcomingItem = {
  id: string;
  title: string;
  date?: string;
  description: string;
  imageUrl?: string;
  imageAspect?: "landscape" | "square" | "portrait";
  imageCrop?: { zoom?: number; x?: number; y?: number };
};

export type SiteContent = {
  settings?: SiteSettings;
  onboarding?: {
    billingLinkReady?: boolean;
    contractShared?: boolean;
    hostingAnswered?: boolean;
    photosReceived?: boolean;
    portalWalkthroughDone?: boolean;
    voiceReviewed?: boolean;
  };
  blogPosts?: BlogPost[];
  menuItems?: MenuItem[];
  lifeAtHubPhotos?: LifeAtHubPhoto[];
  upcomingItems?: UpcomingItem[];
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
