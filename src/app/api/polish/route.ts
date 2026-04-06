import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY } from "@/lib/kv";

const OPENROUTER_KEY = "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";
const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const TOKENS_PER_REWRITE = 1500;
const TOKENS_PER_SUGGESTION = 1000;
const TOKENS_PER_POST_SUGGESTION = 2000;
const ADMIN_PASSWORD = "GatheringHub2026!";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString("utf8");
    return decoded === ADMIN_PASSWORD;
  } catch { return false; }
}

async function getContentData(): Promise<Record<string, unknown>> {
  // Try KV first
  const kvData = await kv.get<Record<string, unknown>>(CONTENT_KEY);
  if (kvData) return kvData;
  // Fallback to static file
  const raw = readFileSync(CONTENT_PATH, "utf8");
  return JSON.parse(raw);
}

async function saveContentData(data: Record<string, unknown>): Promise<void> {
  await kv.set(CONTENT_KEY, data);
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, title, action } = body;

    // Read token budget from KV (or fallback to file)
    const contentData = await getContentData();
    const tokenBudget = contentData.tokenBudget as { monthlyLimit: number; used: number };
    const remaining = tokenBudget.monthlyLimit - tokenBudget.used;

    // --- SUGGEST EVENTS ---
    if (action === "suggest_events") {
      if (remaining < TOKENS_PER_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const prompt = `Suggest 3 creative, SEO-friendly event types for an event venue in Ithaca, Michigan called The Gathering Hub. Return ONLY a JSON array of objects with keys: title, description. No markdown.`;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://gathering-hub-cms.vercel.app",
          "X-Title": "The Gathering Hub CMS",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 600,
          temperature: 0.8,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
      }
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "[]";
      const arrMatch = rawText.match(/\[[\s\S]*\]/);
      const suggestions = arrMatch ? JSON.parse(arrMatch[0]) : [];
      tokenBudget.used += TOKENS_PER_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestions, tokensUsed: TOKENS_PER_SUGGESTION });
    }

    // --- SUGGEST ANNOUNCEMENTS ---
    if (action === "suggest_announcements") {
      if (remaining < TOKENS_PER_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const now = new Date();
      const prompt = `Suggest 3 timely announcements for an event venue in Ithaca, Michigan called The Gathering Hub. Today is ${now.toDateString()}. Consider the current season/holidays. Return ONLY a JSON array of objects with keys: text. No markdown.`;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://gathering-hub-cms.vercel.app",
          "X-Title": "The Gathering Hub CMS",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
          temperature: 0.8,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
      }
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "[]";
      const arrMatch = rawText.match(/\[[\s\S]*\]/);
      const suggestions = arrMatch ? JSON.parse(arrMatch[0]) : [];
      tokenBudget.used += TOKENS_PER_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestions, tokensUsed: TOKENS_PER_SUGGESTION });
    }

    // --- SUGGEST BLOG POST ---
    if (action === "suggest_post") {
      if (remaining < TOKENS_PER_POST_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const now = new Date();
      const prompt = `You are an SEO blog writer for The Gathering Hub, an event venue in Ithaca, Michigan. Today is ${now.toDateString()}. Suggest ONE blog post idea that would rank well right now based on the current season/month. Return JSON: { "title": string, "outline": [string], "seoTitle": string, "seoDescription": string }. Make it specific and actionable. No markdown.`;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://gathering-hub-cms.vercel.app",
          "X-Title": "The Gathering Hub CMS",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
      }
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "{}";
      const objMatch = rawText.match(/\{[\s\S]*\}/);
      const suggestion = objMatch ? JSON.parse(objMatch[0]) : {};
      tokenBudget.used += TOKENS_PER_POST_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestion, tokensUsed: TOKENS_PER_POST_SUGGESTION });
    }

    // --- POLISH (default action for blog, events, announcements, amenities) ---
    const tokenCost = TOKENS_PER_REWRITE;
    if (remaining < tokenCost) {
      return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
    }

    const prompt = `You are a professional copywriter and SEO expert for The Gathering Hub, an event venue in Ithaca, Michigan.

Task: Polish and improve the following blog post content. Make it engaging, warm, and professional. Optimize for local SEO (Ithaca, MI, event venue keywords).

Title: ${title || "Blog Post"}
Content: ${content}

Return ONLY a JSON object with these exact fields:
{
  "polishedContent": "The improved blog post body text (paragraphs separated by double newlines)",
  "seoTitle": "SEO-optimized title (include 'The Gathering Hub' and Ithaca MI)",
  "seoDescription": "Meta description for SEO, 150-160 characters"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gathering-hub-cms.vercel.app",
        "X-Title": "The Gathering Hub CMS",
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const raw_text = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = raw_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response", raw: raw_text }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Deduct tokens from budget and save to KV
    tokenBudget.used += tokenCost;
    contentData.tokenBudget = tokenBudget;
    await saveContentData(contentData);

    return NextResponse.json({
      polishedContent: parsed.polishedContent || content,
      seoTitle: parsed.seoTitle || title,
      seoDescription: parsed.seoDescription || "",
      tokensUsed: tokenCost,
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
