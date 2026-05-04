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

function escapeXml(value?: string) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapText(value: string | undefined, maxChars: number, maxLines: number) {
  const words = (value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function formatDateLabel(date?: string) {
  if (!date) return "";
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function makeTspans(lines: string[], x: number, y: number, lineHeight: number) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${y + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
}

function buildLocalFlyerSvg({
  title,
  date,
  time,
  price,
  details,
  description,
  aspect,
  siteName,
  styleNote,
}: {
  title: string;
  date?: string;
  time?: string;
  price?: string;
  details?: string;
  description?: string;
  aspect: "landscape" | "square" | "portrait";
  siteName?: string;
  styleNote?: string;
}) {
  const size =
    aspect === "landscape"
      ? { width: 1200, height: 900, titleChars: 22, bodyChars: 46 }
      : aspect === "square"
        ? { width: 1080, height: 1080, titleChars: 20, bodyChars: 40 }
        : { width: 1080, height: 1350, titleChars: 18, bodyChars: 36 };
  const brandName = siteName?.trim() || "The Gathering Hub";
  const dateLabel = formatDateLabel(date);
  const meta = [dateLabel, time, price].filter(Boolean).join("  |  ");
  const titleLines = wrapText(title, size.titleChars, 4);
  const bodyLines = wrapText(description || details || styleNote || "Join us for a special event at The Gathering Hub.", size.bodyChars, 4);
  const detailLines = wrapText(details && details !== description ? details : "", size.bodyChars, 2);
  const logoSize = aspect === "portrait" ? 138 : 116;
  const logoX = size.width - logoSize - 74;
  const logoY = 62;
  const titleY = aspect === "portrait" ? 370 : 292;
  const bodyY = titleY + titleLines.length * 94 + 62;
  const metaY = size.height - 210;
  const footerY = size.height - 82;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#172155"/>
      <stop offset="58%" stop-color="#26357c"/>
      <stop offset="100%" stop-color="#101733"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f6d878"/>
      <stop offset="100%" stop-color="#c9a84c"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#050816" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${size.width - 180}" cy="120" r="${aspect === "portrait" ? 290 : 230}" fill="#33469b" opacity="0.28"/>
  <circle cx="90" cy="${size.height - 80}" r="${aspect === "portrait" ? 310 : 230}" fill="#c9a84c" opacity="0.11"/>
  <rect x="42" y="42" width="${size.width - 84}" height="${size.height - 84}" rx="34" fill="none" stroke="#f6d878" stroke-width="3" opacity="0.72"/>
  <rect x="70" y="70" width="${size.width - 140}" height="${size.height - 140}" rx="24" fill="#ffffff" opacity="0.045"/>
  <circle cx="${logoX + logoSize / 2}" cy="${logoY + logoSize / 2}" r="${logoSize / 2}" fill="#ffffff" opacity="0.96"/>
  <circle cx="${logoX + logoSize / 2}" cy="${logoY + logoSize / 2}" r="${logoSize / 2 - 10}" fill="#25357c"/>
  <circle cx="${logoX + logoSize / 2}" cy="${logoY + logoSize / 2}" r="${logoSize / 2 - 28}" fill="none" stroke="#ffffff" stroke-width="7"/>
  <text x="${logoX + logoSize / 2}" y="${logoY + logoSize / 2 - 6}" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${aspect === "portrait" ? 20 : 17}" font-weight="800">THE</text>
  <text x="${logoX + logoSize / 2}" y="${logoY + logoSize / 2 + 24}" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${aspect === "portrait" ? 22 : 18}" font-weight="800">HUB</text>
  <text x="82" y="112" fill="#f6d878" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="5">${escapeXml(brandName.toUpperCase())}</text>
  <rect x="82" y="154" width="96" height="6" rx="3" fill="url(#gold)"/>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="${aspect === "portrait" ? 86 : 72}" font-weight="700" fill="#ffffff" filter="url(#shadow)">
    ${makeTspans(titleLines, 82, titleY, aspect === "portrait" ? 94 : 80)}
  </text>
  <text font-family="Arial, Helvetica, sans-serif" font-size="${aspect === "portrait" ? 35 : 30}" fill="#eef2ff" opacity="0.92">
    ${makeTspans(bodyLines, 88, bodyY, aspect === "portrait" ? 48 : 42)}
  </text>
  ${detailLines.length ? `<text font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#dbe4ff" opacity="0.78">${makeTspans(detailLines, 88, bodyY + bodyLines.length * 48 + 34, 38)}</text>` : ""}
  <rect x="82" y="${metaY - 62}" width="${size.width - 164}" height="124" rx="24" fill="#ffffff" opacity="0.11" stroke="#f6d878" stroke-opacity="0.35"/>
  <text x="${size.width / 2}" y="${metaY + 10}" text-anchor="middle" fill="#f6d878" font-family="Arial, Helvetica, sans-serif" font-size="${aspect === "portrait" ? 36 : 31}" font-weight="800">${escapeXml(meta || "Details coming soon")}</text>
  <text x="${size.width / 2}" y="${footerY}" text-anchor="middle" fill="#ffffff" opacity="0.76" font-family="Arial, Helvetica, sans-serif" font-size="25">121 S Pine River St, Ithaca, MI 48847</text>
</svg>`;
}

function saveLocalFlyer(svg: string) {
  return {
    url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    filename: `flyer-${Date.now()}.svg`,
  };
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!OPENROUTER_KEY) {
      const localFlyer = saveLocalFlyer(buildLocalFlyerSvg({
        title,
        date,
        time,
        price,
        details,
        description,
        aspect,
        siteName,
        styleNote,
      }));
      return NextResponse.json({ ...localFlyer, model: "local-svg-flyer" });
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
      const localFlyer = saveLocalFlyer(buildLocalFlyerSvg({
        title,
        date,
        time,
        price,
        details,
        description,
        aspect,
        siteName,
        styleNote,
      }));
      return NextResponse.json({ ...localFlyer, model: "local-svg-flyer", fallbackReason: data?.error?.message || "OpenRouter flyer generation failed" });
    }

    const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl || typeof imageUrl !== "string") {
      const localFlyer = saveLocalFlyer(buildLocalFlyerSvg({
        title,
        date,
        time,
        price,
        details,
        description,
        aspect,
        siteName,
        styleNote,
      }));
      return NextResponse.json({ ...localFlyer, model: "local-svg-flyer", fallbackReason: "No flyer image returned" });
    }

    const parsed = stripDataUrlPrefix(imageUrl);
    if (!parsed) {
      const localFlyer = saveLocalFlyer(buildLocalFlyerSvg({
        title,
        date,
        time,
        price,
        details,
        description,
        aspect,
        siteName,
        styleNote,
      }));
      return NextResponse.json({ ...localFlyer, model: "local-svg-flyer", fallbackReason: "Unexpected image format returned" });
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
