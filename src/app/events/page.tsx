import Nav from "@/components/Nav";
import { getSiteContent } from "@/lib/content";
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

const fallbackEvents: EventItem[] = [
  { id: "event-birthday", emoji: "🎉", title: "Birthday Parties", description: "A private space for birthday dinners, dessert tables, custom treats, and the people you actually want around you." },
  { id: "event-baby", emoji: "🍼", title: "Baby Showers", description: "A welcoming downtown Ithaca setting with in-house food and sweets so showers feel thoughtful, easy, and worth remembering." },
  { id: "event-grad", emoji: "🎓", title: "Graduation Celebrations", description: "Celebrate milestones with a space that works for family, food, photos, custom cookies, and guests of all ages." },
  { id: "event-private", emoji: "🥂", title: "Private Gatherings", description: "Perfect for reunions, dinner parties, and special nights where the cooking and cleanup are handled for you." },
];

const fallbackAmenities: AmenityItem[] = [
  { id: "amenity-tables", icon: "🪑", title: "Tables & Chairs Included", description: "The basics are already here so you can focus on planning the details that matter most." },
  { id: "amenity-av", icon: "🔊", title: "AV Ready", description: "Use the space for music, announcements, slideshows, and the little moments people gather around." },
  { id: "amenity-kitchen", icon: "🍽️", title: "Licensed In-House Kitchen", description: "The Gathering Hub is a State of Michigan licensed food facility, with cooking handled in-house by Heather." },
  { id: "amenity-downtown", icon: "📍", title: "Downtown Ithaca Location", description: "A central location that makes it easy for local guests to find you and settle in." },
];

export const metadata: Metadata = {
  title: "Events | The Gathering Hub - Ithaca, MI",
  description: "Book The Gathering Hub for birthdays, baby showers, bridal showers, corporate events, homemade food, and custom desserts in Ithaca, Michigan.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Events | The Gathering Hub - Ithaca, MI",
    description: "Book The Gathering Hub for birthdays, baby showers, bridal showers, corporate events, homemade food, and custom desserts in Ithaca, Michigan.",
    url: "https://gathering-hub-cms.vercel.app/events",
    images: [{ url: "/images/hero-main.jpg", width: 1200, height: 630, alt: "The Gathering Hub in Ithaca, Michigan" }],
  },
};

export default async function EventsPage() {
  const content = await getSiteContent();
  const events = ((content as { events?: EventItem[] }).events?.length
    ? (content as { events?: EventItem[] }).events
    : fallbackEvents) as EventItem[];
  const amenities = ((content as { amenities?: AmenityItem[] }).amenities?.length
    ? (content as { amenities?: AmenityItem[] }).amenities
    : fallbackAmenities) as AmenityItem[];
  const publicAmenities = amenities.map((am) => {
    const text = `${am.title} ${am.description}`.toLowerCase();
    if (!text.includes("kitchen")) return am;
    return {
      ...am,
      title: "Licensed In-House Kitchen",
      description: "The Gathering Hub is a State of Michigan licensed food facility, with cooking handled in-house by Heather.",
    };
  });
  const settings = content.settings ?? {};

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
            From intimate gatherings to larger celebrations, we handle the space, homemade food, custom desserts, and hosting details that help the day feel easy.
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
          <p className="section-sub">Every rental includes the essentials so you can focus on your guests. Food is cooked in-house through Heather&rsquo;s licensed kitchen.</p>
          <div className="amenities-grid">
            {publicAmenities.map((am) => (
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
        <div>© 2026 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href={`tel:${(settings.phone || "(989) 400-2175").replace(/\D/g, "")}`}>{settings.phone || "(989) 400-2175"}</a>
          <a href={`mailto:${settings.email || "thegatheringhub2025@outlook.com"}`}>Email</a>
          <a href={settings.facebook || "#"} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>
    </>
  );
}
