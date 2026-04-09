import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ADMIN_PASSWORD = "GatheringHub2026!";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || "";
const FLYER_MODEL = "google/gemini-3.1-flash-image-preview";
const LOGO_PATH = path.join(process.cwd(), "public", "images", "gatheringhub-logo.jpg");

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString("utf8");
    return decoded === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function stripDataUrlPrefix(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

function mimeToExt(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return "png";
}

function buildPrompt({
  title,
  date,
  time,
  price,
  details,
  description,
  variationNote,
  siteName,
  styleNote,
}: {
  title: string;
  date?: string;
  time?: string;
  price?: string;
  details?: string;
  description?: string;
  variationNote?: string;
  siteName?: string;
  styleNote?: string;
}) {
  const brandName = siteName?.trim() || "The Gathering Hub";
  const customStyle = styleNote?.trim();

  return [
    `Design a polished event flyer for ${brandName}.`,
    "Default creative direction unless the user explicitly says otherwise: modern farmhouse vibe, warm upscale community feel, dark blue, white, and marigold gold accents, elegant but approachable typography, and a clean layered composition.",
    `Event title: ${title}.`,
    date ? `Event date: ${date}.` : "No fixed event date provided.",
    time ? `Event time: ${time}.` : "",
    price ? `Ticket or entry price: ${price}.` : "",
    details ? `Longer event details to summarize into flyer-friendly copy: ${details}.` : "",
    description ? `Short event description to work from: ${description}.` : "Keep supporting copy concise and guest-friendly.",
    "Use the provided logo reference as part of the flyer whenever it can be included cleanly. Keep it tasteful and integrated into the layout rather than oversized.",
    "If the reference logo is too detailed for the composition, echo its overall brand feel and still include venue branding in a subtle, polished way.",
    "Use readable hierarchy, flyer-ready text placement, and make it feel like a real local business event graphic rather than generic AI art.",
    "Summarize the event information into concise flyer copy that fits well visually. Preserve the title and provided date, and include time/price/details only when they help the flyer.",
    "Do not add fake prices, fake sponsors, fake addresses, fake websites, or fake social handles.",
    customStyle ? `Additional style note from the user: ${customStyle}.` : "",
    variationNote ? `Requested revision: ${variationNote}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getLogoDataUrl() {
  try {
    const buffer = readFileSync(LOGO_PATH);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!OPENROUTER_KEY) {
    return NextResponse.json({ error: "Missing OpenRouter API key" }, { status: 500 });
  }

  try {
    const {
      title,
      date,
      time,
      price,
      details,
      description,
      variationNote,
      aspect = "portrait",
      siteName,
      styleNote,
    } = (await req.json()) as {
      title?: string;
      date?: string;
      time?: string;
      price?: string;
      details?: string;
      description?: string;
      variationNote?: string;
      aspect?: "landscape" | "square" | "portrait";
      siteName?: string;
      styleNote?: string;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const aspectRatio =
      aspect === "landscape" ? "4:3" : aspect === "square" ? "1:1" : "4:5";

    const logoDataUrl = getLogoDataUrl();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: FLYER_MODEL,
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: aspectRatio,
        },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildPrompt({ title, date, time, price, details, description, variationNote, siteName, styleNote }) },
              ...(logoDataUrl
                ? [{ type: "image_url", image_url: { url: logoDataUrl } }]
                : []),
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "OpenRouter flyer generation failed" }, { status: response.status });
    }

    const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "No flyer image returned" }, { status: 500 });
    }

    const parsed = stripDataUrlPrefix(imageUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Unexpected image format returned" }, { status: 500 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    mkdirSync(uploadDir, { recursive: true });
    const ext = mimeToExt(parsed.mime);
    const filename = `flyer-${Date.now()}.${ext}`;
    writeFileSync(path.join(uploadDir, filename), Buffer.from(parsed.base64, "base64"));

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      model: FLYER_MODEL,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
