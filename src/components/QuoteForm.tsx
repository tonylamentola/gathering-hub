"use client";

import { useState } from "react";

type QuoteFormProps = {
  safeEmail: string;
};

export default function QuoteForm({ safeEmail }: QuoteFormProps) {
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("Birthday Party");
  const [preferredDate, setPreferredDate] = useState("");
  const [guestCount, setGuestCount] = useState("Under 20");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subjectName = name.trim() || "Guest";
    const body = [
      `Name: ${name.trim() || ""}`,
      `Event type: ${eventType}`,
      `Preferred date: ${preferredDate || ""}`,
      `Approximate guest count: ${guestCount}`,
      `Message: ${message.trim() || ""}`,
    ].join("\n");

    const mailtoUrl = `mailto:${safeEmail}?subject=${encodeURIComponent(`Event Quote Request — ${subjectName}`)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid rgba(36,49,117,0.15)",
    fontSize: 16,
    fontFamily: "inherit",
    color: "#1a1a2e",
    background: "white",
    boxSizing: "border-box",
    WebkitAppearance: "none",
    appearance: "none",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--border)",
        maxWidth: 640,
        margin: "0 auto 40px",
        padding: 24,
      }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={fieldStyle}
        />
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={fieldStyle}>
          <option>Birthday Party</option>
          <option>Baby Shower</option>
          <option>Graduation</option>
          <option>Bridal Shower</option>
          <option>Private Dinner</option>
          <option>Community Event</option>
          <option>Other</option>
        </select>
        <input
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          style={fieldStyle}
        />
        <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)} style={fieldStyle}>
          <option>Under 20</option>
          <option>20–40</option>
          <option>40–60</option>
          <option>60+</option>
        </select>
        <textarea
          rows={3}
          placeholder="Anything else we should know?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </div>
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button type="submit" className="btn-primary">
          📅 Send Quote Request
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          This will open your email app with the details pre-filled.
        </div>
      </div>
    </form>
  );
}
