import Nav from "@/components/Nav";
import content from "../../../data/content.json";
import type { Metadata } from "next";

type EventItem = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

type AmenityItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type SiteSettings = {
  facebook?: string;
};

const events = (content.events ?? []) as EventItem[];
const amenities = (content.amenities ?? []) as AmenityItem[];
const settings = ((content as unknown as { settings?: SiteSettings }).settings ?? {}) as SiteSettings;

export const metadata: Metadata = {
  title: "Events | The Gathering Hub - Ithaca, MI",
  description: "Book The Gathering Hub for birthdays, baby showers, bridal showers, corporate events, and more in Ithaca, Michigan.",
};

export default function EventsPage() {
  return (
    <>
      <Nav />
      {/* Hero */}
      <section style={{ paddingTop: 130, background: "linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 100%)", textAlign: "center", paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div className="container">
          <div className="section-label" style={{ color: "var(--gold-light)" }}>Event Types</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px,6vw,58px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 20 }}>
            Any Occasion, Perfectly Hosted
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 auto 36px" }}>
            From intimate gatherings to larger celebrations, we have the space and amenities to make every event unforgettable.
          </p>
          <a href="/#contact" className="btn-primary">📅 Book Your Event</a>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <div className="events-grid">
            {events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div className="event-card-icon">{ev.emoji}</div>
                <div className="event-card-body">
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="amenities-section">
        <div className="container">
          <div className="section-label">What&rsquo;s Included</div>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-sub">Every rental includes the essentials so you can focus on your event.</p>
          <div className="amenities-grid">
            {amenities.map((am) => (
              <div key={am.id} className="amenity-card">
                <div className="amenity-icon">{am.icon}</div>
                <h4>{am.title}</h4>
                <p>{am.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--cream)", textAlign: "center" }}>
        <div className="container">
          <h2 className="section-title">Ready to Plan Your Event?</h2>
          <p className="section-sub" style={{ margin: "0 auto 36px" }}>Contact us to check availability and get started.</p>
          <a href="/#contact" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>📅 Contact Us Today</a>
        </div>
      </section>

      <footer>
        <div>© 2025 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="tel:9894002175">(989) 400-2175</a>
          <a href="mailto:thegatheringhub2025@outlook.com">Email</a>
          <a href={settings.facebook || "#"} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>
    </>
  );
}
