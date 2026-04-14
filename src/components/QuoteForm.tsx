"use client";

import { useState } from "react";

type QuoteFormProps = {
  safeEmail: string;
};

export default function QuoteForm({ safeEmail }: QuoteFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("Birthday Party");
  const [preferredDate, setPreferredDate] = useState("");
  const [guestCount, setGuestCount] = useState("Under 20");
  const [foodNeeds, setFoodNeeds] = useState("Not sure yet");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, eventType, preferredDate, guestCount, foodNeeds, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send inquiry.");
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send inquiry.");
    }
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={fieldStyle}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={fieldStyle}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={fieldStyle}
          />
        </div>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={fieldStyle}>
          <option>Birthday Party</option>
          <option>Baby Shower</option>
          <option>Graduation</option>
          <option>Celebration of Life</option>
          <option>Bridal Shower</option>
          <option>Corporate Event</option>
          <option>Private Dinner</option>
          <option>Community Event</option>
          <option>Other</option>
        </select>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
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
        </div>
        <select value={foodNeeds} onChange={(e) => setFoodNeeds(e.target.value)} style={fieldStyle}>
          <option>Not sure yet</option>
          <option>Venue only</option>
          <option>Snacks or dessert table</option>
          <option>Meal / cafe favorites</option>
          <option>Bring our own food</option>
          <option>Need help deciding</option>
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
        <button type="submit" className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "📅 Send Quote Request"}
        </button>
        {status === "sent" && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#1f7a3a", fontWeight: 700 }}>
            Request received. We&apos;ll follow up soon.
          </div>
        )}
        {status === "error" && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#b91c1c", fontWeight: 700 }}>
            {error} You can still email {safeEmail}.
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          Your details are sent directly to The Gathering Hub for follow-up.
        </div>
      </div>
    </form>
  );
}
