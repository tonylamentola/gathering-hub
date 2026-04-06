import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY } from "@/lib/kv";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const TOKENS_PER_REWRITE = 1500;
const TOKENS_PER_SUGGESTION = 1000;
const TOKENS_PER_POST_SUGGESTION = 2000;
const ADMIN_PASSWORD = "GatheringHub2026!";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString("utf8");
    return decoded === ADMIN_PASSWORD;
  } catch { return false; }
}

async function getContentData(): Promise<Record<string, unknown>> {
  try {
    const kvData = await kv.get<Record<string, unknown>>(CONTENT_KEY);
    if (kvData) return kvData;
  } catch {
    // Fall back to the local file in dev or when KV is not configured.
  }
  // Fallback to static file
  const raw = readFileSync(CONTENT_PATH, "utf8");
  return JSON.parse(raw);
}

async function saveContentData(data: Record<string, unknown>): Promise<void> {
  try {
    await kv.set(CONTENT_KEY, data);
  } catch {
    // Local/dev fallback keeps AI tools usable without KV.
  }
}

function getBusinessProfile(contentData: Record<string, unknown>) {
  const settings = (contentData.settings ?? {}) as Record<string, string>;
  const aiProfile = (contentData.aiProfile ?? {}) as Record<string, string>;
  const events = Array.isArray(contentData.events) ? contentData.events as Array<Record<string, string>> : [];
  const amenities = Array.isArray(contentData.amenities) ? contentData.amenities as Array<Record<string, string>> : [];
  const activeAnnouncements = Array.isArray(contentData.announcements)
    ? (contentData.announcements as Array<Record<string, unknown>>).filter((item) => item.active)
    : [];

  return {
    siteName: settings.siteName || "The Gathering Hub",
    location: settings.address || "Ithaca, Michigan",
    phone: settings.phone || "",
    email: settings.email || "",
    facebook: settings.facebook || "",
    tone: aiProfile.tone || "Warm, welcoming, professional, community-focused",
    audience: aiProfile.audience || "Local families, hosts, and organizers planning private events",
    approvedFacts: aiProfile.approvedFacts || "",
    avoidClaims: aiProfile.avoidClaims || "",
    seasonalFocus: aiProfile.seasonalFocus || "",
    voiceProfile: aiProfile.voiceProfile || "",
    writingDo: aiProfile.writingDo || "",
    writingAvoid: aiProfile.writingAvoid || "",
    eventTitles: events.map((event) => event.title).filter(Boolean),
    amenityTitles: amenities.map((amenity) => amenity.title).filter(Boolean),
    activeAnnouncementTitles: activeAnnouncements.map((item) => String(item.title || "")).filter(Boolean),
  };
}

function getSeasonalContext(now: Date) {
  const month = now.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

async function openRouterJsonRequest(prompt: string, maxTokens: number, temperature: number) {
  if (!OPENROUTER_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

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
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  return response.json();
}

async function openAiJsonRequest(prompt: string, maxTokens: number, temperature: number) {
  if (!OPENAI_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  return response.json();
}

async function generateJson(prompt: string, maxTokens: number, temperature: number) {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === "openai") {
    return openAiJsonRequest(prompt, maxTokens, temperature);
  }

  if (provider === "openrouter") {
    return openRouterJsonRequest(prompt, maxTokens, temperature);
  }

  if (OPENAI_KEY) {
    return openAiJsonRequest(prompt, maxTokens, temperature);
  }

  if (OPENROUTER_KEY) {
    return openRouterJsonRequest(prompt, maxTokens, temperature);
  }

  throw new Error("No AI provider key configured");
}

function fallbackEventSuggestions(business: ReturnType<typeof getBusinessProfile>, season: string) {
  const seasonalTitle =
    season === "spring" ? "Spring Showers & Celebrations" :
    season === "summer" ? "Summer Gatherings" :
    season === "fall" ? "Fall Parties & Reunions" :
    "Winter Celebrations";

  return [
    {
      title: seasonalTitle,
      description: `A timely page update focused on ${season} events people may be planning around ${business.siteName}.`,
    },
    {
      title: "Family Milestone Events",
      description: "Highlight birthdays, reunions, showers, and other gatherings the venue can host without implying extra services.",
    },
    {
      title: "Community Meetups & Private Rentals",
      description: "Speak to clubs, workshops, and private gatherings in a way that stays broad and believable.",
    },
  ];
}

function fallbackAnnouncementSuggestions(business: ReturnType<typeof getBusinessProfile>, season: string) {
  return [
    { text: `Planning a ${season} event in Ithaca? Reach out to ${business.siteName} to ask about upcoming dates.` },
    { text: `We’re updating the site with fresh event inspiration for the ${season} season. Check back for new ideas and venue updates.` },
    { text: `If you’re organizing a birthday, shower, reunion, or community gathering, our team would love to hear what you’re planning.` },
  ];
}

function fallbackBlogSuggestion(business: ReturnType<typeof getBusinessProfile>, season: string) {
  const localArea = business.location.includes("Ithaca") ? "Ithaca, Michigan" : business.location;
  const keywordPhrase =
    season === "spring" ? "spring event venue in Ithaca, Michigan" :
    season === "summer" ? "summer event venue in Ithaca, Michigan" :
    season === "fall" ? "fall event venue in Ithaca, Michigan" :
    "winter event venue in Ithaca, Michigan";
  const title =
    season === "spring" ? `How to Plan a Spring Event in Ithaca, Michigan` :
    season === "summer" ? `How to Plan a Summer Gathering in Ithaca, Michigan` :
    season === "fall" ? `How to Plan a Fall Event in Ithaca, Michigan` :
    `How to Plan a Winter Gathering in Ithaca, Michigan`;

  return {
    title,
    outline: [
      `Why ${season} gatherings need a clear venue plan`,
      "Questions to ask before booking a local event space",
      "What guests appreciate most at a private event venue",
      `How to contact ${business.siteName} for your next gathering`,
    ],
    seoTitle: `${title} | ${business.siteName} ${localArea}`,
    seoDescription: `Looking for a ${keywordPhrase}? Use these simple planning tips to choose the right space, ask better questions, and host a smoother gathering in ${localArea}.`,
    fullDraft: `${title}

Planning a ${season} gathering in ${localArea} can feel exciting and a little overwhelming at the same time. Between choosing a date, thinking about guest comfort, and finding a space that feels right for the occasion, it helps to start with a simple plan. At ${business.siteName}, we know many hosts are looking for a welcoming place to bring people together in the ${business.location} area.

One of the best first steps is deciding what kind of experience you want your guests to have. Some gatherings feel best when they are relaxed and intimate, while others need a little more room to celebrate, reconnect, or mark a milestone. Thinking about the mood of the event early makes it easier to choose the right setup and ask better questions as you plan.

It also helps to make a short checklist before you reach out to any event venue in Ithaca, Michigan. Consider your preferred date, your general guest count, the type of event you are planning, and any must-haves that matter most to you. Having those basics ready can make the next conversation much smoother and help you compare your options with more confidence.

${business.approvedFacts ? `For ${business.siteName}, a few important points we can confidently share are: ${business.approvedFacts}\n\n` : ""}${business.seasonalFocus ? `Right now, one seasonal focus worth keeping in mind is ${business.seasonalFocus}. That can shape the kind of atmosphere, timing, and event details you choose to emphasize as you plan.\n\n` : ""}If you are starting to think through your next gathering, choosing a local event venue that feels comfortable, flexible, and easy for guests to reach can make a big difference. ${business.siteName} would love to hear what you have in mind and help you take the next step.`,
    whyThisFits: `This topic matches seasonal search intent, includes local SEO language, and stays within confirmed facts about ${business.siteName}.`,
  };
}

function normalizeTopicTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/the gathering hub/g, "")
    .replace(/ithaca,?\s*michigan|ithaca,?\s*mi/g, "")
    .replace(/spring|summer|fall|winter/g, "")
    .replace(/how to|tips for|guide to|planning|hosting|event|gathering/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isTooSimilarTopic(title: string, existingTitles: string[]) {
  const normalized = normalizeTopicTitle(title);
  if (!normalized) return false;
  return existingTitles.some((existing) => {
    const other = normalizeTopicTitle(existing);
    return other && (other === normalized || other.includes(normalized) || normalized.includes(other));
  });
}

function getRetryInstruction(
  regenerateMode: string | undefined,
  previousSuggestion: Record<string, unknown> | null,
) {
  if (regenerateMode === "new_topic") {
    return `Choose a distinctly different topic than the previous suggestion${previousSuggestion?.title ? `, which was "${previousSuggestion.title}"` : ""}.`;
  }
  if (regenerateMode === "more_polished") {
    return `Keep the topic close to the previous idea${previousSuggestion?.title ? `, "${previousSuggestion.title}"` : ""}, but make the draft feel more polished, more refined, and more publication-ready.`;
  }
  if (regenerateMode === "more_friendly") {
    return `Keep the topic close to the previous idea${previousSuggestion?.title ? `, "${previousSuggestion.title}"` : ""}, but make the draft feel warmer, more conversational, and more welcoming while staying professional.`;
  }
  return "Choose the strongest topic for this business and season.";
}

function fallbackVoiceProfile(business: ReturnType<typeof getBusinessProfile>) {
  return {
    tone: "Warm, practical, reassuring, neighborly, and lightly polished",
    audience: business.audience || "Local families and hosts planning events",
    approvedFacts: business.approvedFacts || "Use only confirmed venue details, event types, contact info, and location facts already on the site.",
    avoidClaims: business.avoidClaims || "Do not invent pricing, packages, staff support, availability, catering, capacity, or guarantees. Do not oversell or sound like a commercial.",
    seasonalFocus: business.seasonalFocus || "Helpful seasonal planning ideas for local hosts",
    voiceProfile: "Write like a thoughtful 55-year-old small business owner who knows her community well. She sounds calm, capable, welcoming, and experienced. She gives practical advice, speaks with quiet confidence, and never shares personal life details.",
    writingDo: "Lead with something useful. Sound conversational but tidy. Use plain language, local context, and gentle confidence. Offer helpful planning guidance before any call to action. Keep the business feeling trustworthy, steady, and easy to work with.",
    writingAvoid: "Avoid hype, hard selling, exaggerated promises, trendy slang, and generic marketing fluff. Do not sound pushy, flashy, or overly polished. Do not make the venue sound bigger, fancier, or more full-service than confirmed facts support.",
  };
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, title, action, regenerateMode, previousSuggestion } = body;

    // Read token budget from KV (or fallback to file)
    const contentData = await getContentData();
    const tokenBudget = (contentData.tokenBudget as { monthlyLimit: number; used: number } | undefined) ?? {
      monthlyLimit: 50000,
      used: 0,
    };
    const remaining = tokenBudget.monthlyLimit - tokenBudget.used;
    const business = getBusinessProfile(contentData);
    const existingBlogTitles = Array.isArray(contentData.blogPosts)
      ? (contentData.blogPosts as Array<Record<string, unknown>>)
          .map((post) => String(post.title || ""))
          .filter(Boolean)
      : [];
    const now = new Date();
    const season = getSeasonalContext(now);

    if (action === "build_voice_profile") {
      const existingPosts = Array.isArray(contentData.blogPosts)
        ? (contentData.blogPosts as Array<Record<string, unknown>>).slice(0, 4).map((post) => ({
            title: String(post.title || ""),
            excerpt: String(post.excerpt || ""),
            body: String(post.body || "").slice(0, 500),
          }))
        : [];
      const fallbackProfile = fallbackVoiceProfile(business);
      const prompt = `You are creating a reusable website voice profile for ${business.siteName}, a local event venue in ${business.location}.

Known facts:
- Site name: ${business.siteName}
- Location: ${business.location}
- Event types: ${business.eventTitles.join(", ") || "none listed"}
- Amenities: ${business.amenityTitles.join(", ") || "none listed"}
- Approved facts: ${business.approvedFacts || "none provided"}
- Avoid claims: ${business.avoidClaims || "none provided"}
- Sample existing copy: ${JSON.stringify(existingPosts)}

Goal:
Create a grounded writing voice that feels like a capable small-business owner speaking to local customers. The voice should feel warm and human, with a little personality, but it should not read like a commercial.

Special direction:
- Aim for the voice of a 55-year-old grandma small business owner, without using personal biography details.
- Helpful first, promotional second.
- One gentle call to action is enough.
- The writing should feel trustworthy, steady, and community-minded.
- Do not invent services or commitments.

Return JSON with exactly these keys:
{
  "tone": string,
  "audience": string,
  "approvedFacts": string,
  "avoidClaims": string,
  "seasonalFocus": string,
  "voiceProfile": string,
  "writingDo": string,
  "writingAvoid": string
}
No markdown.`;

      let aiProfile = fallbackProfile;
      try {
        const data = await generateJson(prompt, 700, 0.6);
        const rawText = data.choices?.[0]?.message?.content || "{}";
        const objMatch = rawText.match(/\{[\s\S]*\}/);
        aiProfile = objMatch ? { ...fallbackProfile, ...JSON.parse(objMatch[0]) } : fallbackProfile;
      } catch {
        aiProfile = fallbackProfile;
      }

      contentData.aiProfile = aiProfile;
      await saveContentData(contentData);
      return NextResponse.json({ aiProfile });
    }

    // --- SUGGEST EVENTS ---
    if (action === "suggest_events") {
      if (remaining < TOKENS_PER_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const prompt = `You are helping ${business.siteName}, an event venue in ${business.location}.

Known business facts:
- Existing event types: ${business.eventTitles.join(", ") || "none listed"}
- Known amenities: ${business.amenityTitles.join(", ") || "none listed"}

Task:
Suggest 3 event ideas the site could talk about next.

Rules:
- Do not invent amenities, packages, capacity, services, or pricing.
- Keep each suggestion aligned with what a general event venue can plausibly host.
- Use seasonal relevance when helpful, but do not mention holidays unless they fit the venue naturally.
- Return ONLY a JSON array of objects with keys: title, description.
- No markdown.`;
      let suggestions;
      let source = "ai";
      try {
        const data = await generateJson(prompt, 600, 0.8);
        const rawText = data.choices?.[0]?.message?.content || "[]";
        const arrMatch = rawText.match(/\[[\s\S]*\]/);
        suggestions = arrMatch ? JSON.parse(arrMatch[0]) : [];
      } catch {
        suggestions = fallbackEventSuggestions(business, season);
        source = "fallback";
      }
      tokenBudget.used += TOKENS_PER_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestions, tokensUsed: TOKENS_PER_SUGGESTION, source });
    }

    // --- SUGGEST ANNOUNCEMENTS ---
    if (action === "suggest_announcements") {
      if (remaining < TOKENS_PER_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const prompt = `You are helping ${business.siteName}, an event venue in ${business.location}.
Today is ${now.toDateString()}.

Known business facts:
- Existing event types: ${business.eventTitles.join(", ") || "none listed"}
- Known amenities: ${business.amenityTitles.join(", ") || "none listed"}
- Current active announcements: ${business.activeAnnouncementTitles.join(", ") || "none listed"}

Task:
Suggest 3 timely site announcements.

Rules:
- Keep them useful for this time of year.
- Do not invent discounts, offers, booking policies, or features that are not confirmed.
- Do not promise availability.
- Return ONLY a JSON array of objects with keys: text.
- No markdown.`;
      let suggestions;
      let source = "ai";
      try {
        const data = await generateJson(prompt, 400, 0.8);
        const rawText = data.choices?.[0]?.message?.content || "[]";
        const arrMatch = rawText.match(/\[[\s\S]*\]/);
        suggestions = arrMatch ? JSON.parse(arrMatch[0]) : [];
      } catch {
        suggestions = fallbackAnnouncementSuggestions(business, season);
        source = "fallback";
      }
      tokenBudget.used += TOKENS_PER_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestions, tokensUsed: TOKENS_PER_SUGGESTION, source });
    }

    // --- SUGGEST BLOG POST ---
    if (action === "suggest_post") {
      if (remaining < TOKENS_PER_POST_SUGGESTION) {
        return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
      }
      const prompt = `You are planning one practical blog topic for ${business.siteName}, an event venue in ${business.location}.
Today is ${now.toDateString()}.

Known business facts:
- Existing event types: ${business.eventTitles.join(", ") || "none listed"}
- Known amenities: ${business.amenityTitles.join(", ") || "none listed"}
- Public contact methods: ${[business.phone, business.email, business.facebook].filter(Boolean).join(", ") || "none listed"}
- Brand tone: ${business.tone}
- Audience: ${business.audience}
- Approved facts: ${business.approvedFacts || "none provided"}
- Avoid claims: ${business.avoidClaims || "none provided"}
- Seasonal priorities: ${business.seasonalFocus || "none provided"}
- Voice character: ${business.voiceProfile || "none provided"}
- Writing should do: ${business.writingDo || "none provided"}
- Writing should avoid: ${business.writingAvoid || "none provided"}
- Recent blog topics already used: ${existingBlogTitles.slice(0, 12).join(" | ") || "none yet"}

Task:
Suggest ONE blog topic that fits the business and the time of year.

Rules:
- Base the topic on seasonal customer intent, local event planning, or common venue questions.
- Do not invent packages, services, staff, catering options, capacity, or availability promises.
- Avoid commitments that are not explicitly known.
- Make it genuinely helpful, not generic fluff.
- Do not make the post read like an ad. Helpful first, promotion second.
- Keep the voice warm, practical, and human, with a little personality.
- One gentle call to action near the end is enough.
- ${getRetryInstruction(regenerateMode, previousSuggestion ?? null)}
- Do not repeat or lightly reword any recent blog topic already used.
- Return JSON:
{ "title": string, "outline": [string], "seoTitle": string, "seoDescription": string, "fullDraft": string, "whyThisFits": string }
- No markdown.`;
      let suggestion;
      let source = "ai";
      try {
        const data = await generateJson(prompt, 800, 0.7);
        const rawText = data.choices?.[0]?.message?.content || "{}";
        const objMatch = rawText.match(/\{[\s\S]*\}/);
        suggestion = objMatch ? JSON.parse(objMatch[0]) : {};
      } catch {
        suggestion = fallbackBlogSuggestion(business, season);
        source = "fallback";
      }
      if (suggestion?.title && isTooSimilarTopic(String(suggestion.title), [
        ...existingBlogTitles,
        String(previousSuggestion?.title || ""),
      ].filter(Boolean))) {
        if (regenerateMode === "new_topic") {
          suggestion = {
            ...fallbackBlogSuggestion(business, season),
            title: `Questions to Ask Before Booking an Event Venue in ${business.location.includes("Ithaca") ? "Ithaca, Michigan" : business.location}`,
            seoTitle: `Questions to Ask Before Booking an Event Venue | ${business.siteName}`,
            seoDescription: `Use these practical questions to compare event venues and plan a smoother gathering with confidence in ${business.location}.`,
            whyThisFits: `This alternative avoids repeating recent blog topics and still targets local event-planning search intent.`,
          };
          source = "fallback";
        }
      }
      tokenBudget.used += TOKENS_PER_POST_SUGGESTION;
      contentData.tokenBudget = tokenBudget;
      await saveContentData(contentData);
      return NextResponse.json({ suggestion, tokensUsed: TOKENS_PER_POST_SUGGESTION, source });
    }

    // --- POLISH (default action for blog, events, announcements, amenities) ---
    const tokenCost = TOKENS_PER_REWRITE;
    if (remaining < tokenCost) {
      return NextResponse.json({ error: "Token budget exceeded for this month" }, { status: 429 });
    }

    const prompt = `You are a professional copywriter and SEO expert for The Gathering Hub, an event venue in Ithaca, Michigan.

Voice rules:
- Brand tone: ${business.tone}
- Audience: ${business.audience}
- Voice character: ${business.voiceProfile || "Write like a calm, capable, community-minded small business owner."}
- Writing should do: ${business.writingDo || "Be useful, clear, and trustworthy."}
- Writing should avoid: ${business.writingAvoid || "Avoid hype and invented claims."}

Task: Polish and improve the following blog post content. Make it engaging, warm, and professional. Optimize for local SEO (Ithaca, MI, event venue keywords) without sounding like a commercial.

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
