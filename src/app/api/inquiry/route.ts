import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { kv, CONTENT_KEY, CONTENT_BACKUP_PREFIX } from "@/lib/kv";
import type { SiteContent } from "@/lib/content";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

function clean(value: unknown) {
  return String(value ?? "").trim().slice(0, 1000);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inquiryRows(inquiry: {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDate: string;
  guestCount: string;
  foodNeeds: string;
  message: string;
}) {
  return [
    ["Name", inquiry.name],
    ["Email", inquiry.email || "Not provided"],
    ["Phone", inquiry.phone || "Not provided"],
    ["Event Type", inquiry.eventType],
    ["Preferred Date", inquiry.preferredDate || "Not provided"],
    ["Guest Count", inquiry.guestCount],
    ["Food Needs", inquiry.foodNeeds],
    ["Message", inquiry.message || "No extra message"],
  ];
}

function buildInquiryText(inquiry: ReturnType<typeof inquiryRows> extends Array<infer _T> ? {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDate: string;
  guestCount: string;
  foodNeeds: string;
  message: string;
  createdAt: string;
} : never) {
  return [
    "New quote request from The Gathering Hub website",
    "",
    ...inquiryRows(inquiry).map(([label, value]) => `${label}: ${value}`),
    `Submitted: ${inquiry.createdAt}`,
  ].join("\n");
}

function buildInquiryHtml(inquiry: Parameters<typeof buildInquiryText>[0]) {
  const rows = inquiryRows(inquiry)
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1a2459;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${escapeHtml(value).replace(/\n/g, "<br />")}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5;">
      <h1 style="font-size:22px;color:#1a2459;margin:0 0 12px;">New quote request</h1>
      <p style="margin:0 0 18px;">A visitor submitted the website form for The Gathering Hub.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;border:1px solid #e5e7eb;">${rows}</table>
      <p style="font-size:12px;color:#64748b;margin-top:18px;">Submitted ${escapeHtml(inquiry.createdAt)}</p>
    </div>
  `;
}

async function sendInquiryEmail(inquiry: Parameters<typeof buildInquiryText>[0], toEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY is not configured." };

  const fromEmail = process.env.INQUIRY_FROM_EMAIL || "The Gathering Hub <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: inquiry.email || undefined,
      subject: `New Gathering Hub quote request: ${inquiry.eventType || "Event"}`,
      text: buildInquiryText(inquiry),
      html: buildInquiryHtml(inquiry),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    return { sent: false, reason: errorText || `Resend returned ${res.status}` };
  }

  return { sent: true };
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
    const toEmail = process.env.INQUIRY_TO_EMAIL || content.settings?.email || "thegatheringhub2025@outlook.com";
    const emailResult = await sendInquiryEmail(inquiry, toEmail);

    return NextResponse.json({ ok: true, inquiry, email: emailResult });
  } catch {
    return NextResponse.json({ error: "Unable to save inquiry." }, { status: 500 });
  }
}
