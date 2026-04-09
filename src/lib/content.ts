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
  imageUrl?: string;
  imageAspect?: "landscape" | "square" | "portrait";
  imageCrop?: { zoom?: number; x?: number; y?: number };
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category?: "featured" | "cafe" | "sweets";
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
  events?: Array<{ id: string; emoji: string; title: string; description: string }>;
  amenities?: Array<{ id: string; icon: string; title: string; description: string }>;
  blogPosts?: BlogPost[];
  menuItems?: MenuItem[];
  lifeAtHubPhotos?: LifeAtHubPhoto[];
  upcomingItems?: UpcomingItem[];
  reviews?: Array<{ id: string; stars: number; text: string; author: string }>;
  announcements?: Array<{ id: string; title: string; body: string; active: boolean }>;
};

function readLocalContent(): SiteContent {
  const raw = readFileSync(CONTENT_PATH, "utf8");
  return JSON.parse(raw) as SiteContent;
}

function mergeById<T extends { id: string }>(primary: T[] = [], fallback: T[] = []): T[] {
  const merged = [...primary];
  for (const item of fallback) {
    if (!merged.some((existing) => existing.id === item.id)) {
      merged.push(item);
    }
  }
  return merged;
}

export function mergeSiteContent(primary: SiteContent = {}, fallback: SiteContent = {}): SiteContent {
  return {
    ...fallback,
    ...primary,
    settings: {
      ...(fallback.settings ?? {}),
      ...(primary.settings ?? {}),
    },
    onboarding: {
      ...(fallback.onboarding ?? {}),
      ...(primary.onboarding ?? {}),
    },
    events: mergeById(primary.events, fallback.events),
    amenities: mergeById(primary.amenities, fallback.amenities),
    blogPosts: primary.blogPosts ?? fallback.blogPosts ?? [],
    menuItems: mergeById(primary.menuItems, fallback.menuItems),
    lifeAtHubPhotos: mergeById(primary.lifeAtHubPhotos, fallback.lifeAtHubPhotos),
    upcomingItems: mergeById(primary.upcomingItems, fallback.upcomingItems),
    reviews: mergeById(primary.reviews, fallback.reviews),
    announcements: mergeById(primary.announcements, fallback.announcements),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const hasKvConfig = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  const localContent = readLocalContent();

  if (hasKvConfig) {
    try {
      const kvData = await kv.get<SiteContent>(CONTENT_KEY);
      if (kvData) return mergeSiteContent(kvData, localContent);
    } catch {
      // Fallback for local/dev or missing KV.
    }
  }

  return localContent;
}
