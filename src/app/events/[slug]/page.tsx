import Nav from "@/components/Nav";
import QuoteForm from "@/components/QuoteForm";
import { getSiteContent } from "@/lib/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const BASE_URL = "https://gathering-hub-cms.vercel.app";

const eventPages = {
  "baby-showers": {
    eyebrow: "Baby Showers in Ithaca, MI",
    title: "A Warm, Easy Space for Baby Showers",
    description:
      "Host a baby shower with room for gifts, photos, homemade food, and custom desserts in a fully private downtown Ithaca venue.",
    price: "Weekend showers from $250",
    bestFor: ["Gift tables and dessert displays", "Family photos and games", "In-house food and custom sweets"],
    seoDescription: "Plan a baby shower at The Gathering Hub, a private downtown Ithaca, MI venue with tables, chairs, AV, in-house food, and custom desserts.",
  },
  graduations: {
    eyebrow: "Graduation Parties in Ithaca, MI",
    title: "Celebrate the Graduate Without Hosting at Home",
    description:
      "Give family and friends a comfortable private space with homemade food, custom cookies, photos, and a relaxed open-house style graduation celebration.",
    price: "Graduation gatherings from $250",
    bestFor: ["Open-house flow", "Food and dessert tables", "Guests of all ages"],
    seoDescription: "Book The Gathering Hub for graduation parties in Ithaca, MI with a private venue, in-house food, custom desserts, tables, chairs, and AV.",
  },
  birthdays: {
    eyebrow: "Birthday Party Venue in Ithaca, MI",
    title: "A Private Birthday Party Space That Feels Special",
    description:
      "From milestone birthdays to casual family celebrations, The Gathering Hub gives you a private space with homemade food and custom cake or cookie options.",
    price: "Birthday rentals from $150",
    bestFor: ["Milestone birthdays", "Dinner and dessert setups", "Custom printed cakes and cookies"],
    seoDescription: "Host a birthday party at The Gathering Hub, a private Ithaca, MI venue with tables, chairs, AV, in-house food, and custom desserts.",
  },
  "celebrations-of-life": {
    eyebrow: "Celebration of Life Venue in Ithaca, MI",
    title: "A Thoughtful Place to Gather With Family",
    description:
      "A calm, private setting for sharing a homemade meal, honoring memories, and spending time together without worrying about setup, cooking, or cleanup.",
    price: "Private gatherings from $150",
    bestFor: ["Family meals", "Photo and memory tables", "Quiet, supportive gatherings"],
    seoDescription: "Gather for a celebration of life at The Gathering Hub in Ithaca, MI, a private venue with in-house food, flexible setup, and cleanup handled.",
  },
  "corporate-events": {
    eyebrow: "Corporate Events in Ithaca, MI",
    title: "A Better Room for Work Gatherings",
    description:
      "Use The Gathering Hub for team meals, customer appreciation nights, small meetings, workshops, and local business celebrations with food handled in-house.",
    price: "Weekday business rentals from $150",
    bestFor: ["Team lunches", "Workshops and meetings", "Customer appreciation events"],
    seoDescription: "Book The Gathering Hub for corporate events, team lunches, workshops, and small business gatherings with in-house food in downtown Ithaca, MI.",
  },
  "private-events": {
    eyebrow: "Private Event Venue in Ithaca, MI",
    title: "Make the Whole Space Yours",
    description:
      "For reunions, game nights, bridal showers, dinners, and community gatherings, the space and in-house food adapt to the event you want to host.",
    price: "Private rentals from $150",
    bestFor: ["Reunions and game nights", "Private dinners", "Community gatherings"],
    seoDescription: "The Gathering Hub is a private event venue in downtown Ithaca, MI for reunions, dinners, showers, parties, community gatherings, and in-house food.",
  },
} as const;

type EventSlug = keyof typeof eventPages;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(eventPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = eventPages[slug as EventSlug];
  if (!page) return {};

  const title = `${page.eyebrow} | The Gathering Hub`;
  const url = `${BASE_URL}/events/${slug}`;

  return {
    title,
    description: page.seoDescription,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title,
      description: page.seoDescription,
      url,
      images: [{ url: "/images/hero-main.jpg", width: 1200, height: 630, alt: "The Gathering Hub in Ithaca, Michigan" }],
    },
  };
}

export default async function EventLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = eventPages[slug as EventSlug];
  if (!page) notFound();

  const content = await getSiteContent();
  const settings = content.settings ?? {};
  const safeEmail = settings.email || "thegatheringhub2025@outlook.com";
  const safePhone = settings.phone || "(989) 400-2175";
  const phoneDigits = safePhone.replace(/\D/g, "");

  return (
    <>
      <Nav />
      <section
        className="hero"
        style={{
          minHeight: "auto",
          paddingTop: 132,
          paddingBottom: 82,
          backgroundImage: "linear-gradient(160deg, rgba(26,36,89,0.86) 0%, rgba(36,49,117,0.78) 58%, rgba(45,61,138,0.72) 100%), url(/images/hero-main.jpg)",
        }}
      >
        <div className="hero-content">
          <div className="hero-badge">{page.eyebrow}</div>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="hero-ctas">
            <a href="#quote" className="btn-primary">Check Availability</a>
            <a href={`tel:${phoneDigits}`} className="btn-secondary">Call First →</a>
          </div>
          <div className="hero-detail-grid">
            <div className="hero-detail-card"><div>Pricing</div><strong>{page.price}</strong></div>
            <div className="hero-detail-card"><div>Included</div><strong>Tables, chairs, AV, food options</strong></div>
            <div className="hero-detail-card"><div>Use</div><strong>Fully private rental</strong></div>
            <div className="hero-detail-card"><div>Location</div><strong>Downtown Ithaca, MI</strong></div>
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="container">
          <div className="section-label">Why It Works</div>
          <h2 className="section-title">Built Around the Way People Actually Gather</h2>
          <p className="section-sub">You get a private space with the essentials handled, plus homemade food and desserts that help the event feel personal.</p>
          <div className="events-grid">
            {page.bestFor.map((item) => (
              <div key={item} className="event-card">
                <div className="event-card-body">
                  <h3>{item}</h3>
                  <p>Tell us what you are planning, and we will help shape the setup, food, timing, and desserts around the feel of the day.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <div className="section-label">Hard Details</div>
          <h2 className="section-title">Quick Answers Before You Reach Out</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-title">Starting Point</div>
              <div className="pricing-price">{page.price}</div>
              <p>Final pricing depends on date, time, setup, food needs, custom desserts, and guest count.</p>
            </div>
            <div className="pricing-card">
              <div className="pricing-title">Included</div>
              <div className="pricing-price">Full Space</div>
              <p>Tables, chairs, AV, private use, and quote-based in-house food options are available with bookings.</p>
            </div>
            <div className="pricing-card">
              <div className="pricing-title">Food</div>
              <div className="pricing-price">In-House</div>
              <p>Ask about homemade meals, desserts, custom cakes and cookies, and rare direct-to-food printing from JPEG artwork.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="quote">
        <div className="container">
          <div className="section-label">Request a Quote</div>
          <h2 className="section-title">Check Your Date</h2>
          <p className="section-sub">Send the event type, preferred date, guest count, and food or dessert needs so The Gathering Hub can follow up with a helpful quote.</p>
          <QuoteForm safeEmail={safeEmail} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/events" className="btn-secondary">Browse All Events</a>
            <a href={`tel:${phoneDigits}`} className="btn-primary">Call {safePhone}</a>
          </div>
        </div>
      </section>

      <footer>
        <div>© 2026 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href={`tel:${phoneDigits}`}>{safePhone}</a>
          <a href={`mailto:${safeEmail}`}>Email</a>
        </div>
      </footer>
    </>
  );
}
