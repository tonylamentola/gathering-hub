import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

function clean(value: unknown, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildText(report: Record<string, string>) {
  return [
    "AI tool error reported from The Gathering Hub admin portal",
    "",
    `Tool: ${report.area}`,
    `Message: ${report.message}`,
    `Details: ${report.details || "None"}`,
    `Page: ${report.pageUrl || "Unknown"}`,
    `Site: ${report.siteName || "The Gathering Hub"}`,
    `Browser: ${report.userAgent || "Unknown"}`,
    `Reported: ${report.createdAt}`,
  ].join("\n");
}

function buildHtml(report: Record<string, string>) {
  const rows = [
    ["Tool", report.area],
    ["Message", report.message],
    ["Details", report.details || "None"],
    ["Page", report.pageUrl || "Unknown"],
    ["Site", report.siteName || "The Gathering Hub"],
    ["Browser", report.userAgent || "Unknown"],
    ["Reported", report.createdAt],
  ]
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1a2459;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${escapeHtml(value).replace(/\n/g, "<br />")}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5;">
      <h1 style="font-size:22px;color:#1a2459;margin:0 0 12px;">AI tool error</h1>
      <p style="margin:0 0 18px;">A customer/admin reported that an AI tool failed inside The Gathering Hub portal.</p>
      <table style="border-collapse:collapse;width:100%;max-width:760px;border:1px solid #e5e7eb;">${rows}</table>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const host = req.headers.get("host") || "";
    const auth = req.headers.get("authorization") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      const forwarded = await fetch("https://thegatheringhub.biz/api/ai-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({
          ...body,
          details: `${clean(body.details, 3600)}\n\nForwarded from local development because localhost has no RESEND_API_KEY.`,
        }),
      });
      const forwardedBody = await forwarded.json().catch(() => ({}));
      return NextResponse.json(forwardedBody, { status: forwarded.status });
    }
    return NextResponse.json({ error: "Error email is not configured.", reportable: false }, { status: 503 });
  }

  const report = {
    area: clean(body.area, 120) || "AI tool",
    message: clean(body.message) || "AI tool failed.",
    details: clean(body.details, 4000),
    pageUrl: clean(body.pageUrl, 500),
    siteName: clean(body.siteName, 120) || "The Gathering Hub",
    userAgent: clean(req.headers.get("user-agent"), 500),
    createdAt: new Date().toISOString(),
  };

  const toEmail = process.env.AI_ERROR_TO_EMAIL || process.env.INQUIRY_TO_EMAIL;
  if (!toEmail) {
    return NextResponse.json({ error: "Tony's error email is not configured.", reportable: false }, { status: 503 });
  }

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
      subject: `Gathering Hub AI error: ${report.area}`,
      text: buildText(report),
      html: buildHtml(report),
    }),
  });

  if (!res.ok) {
    const reason = await res.text().catch(() => "");
    return NextResponse.json({ error: reason || `Resend returned ${res.status}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
