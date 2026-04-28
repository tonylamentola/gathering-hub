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
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Gift tables and dessert displays",
        description: "There is room to make the practical pieces feel pretty, from a present table to a dessert setup guests naturally gather around.",
      },
      {
        title: "Family photos and games",
        description: "The space keeps games, photos, and visiting close together so the shower feels warm instead of scattered.",
      },
      {
        title: "In-house food and custom sweets",
        description: "Heather can prepare food, cakes, cookies, and desserts in-house so the menu fits the people you are celebrating.",
      },
    ],
    seoDescription: "Plan a baby shower at The Gathering Hub, a private downtown Ithaca, MI venue with tables, chairs, AV, in-house food, and custom desserts.",
  },
  graduations: {
    eyebrow: "Graduation Parties in Ithaca, MI",
    title: "Celebrate the Graduate Without Hosting at Home",
    description:
      "Give family and friends a comfortable private space with homemade food, custom cookies, photos, and a relaxed open-house style graduation celebration.",
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Open-house flow",
        description: "Guests can come through comfortably, visit with the graduate, grab food, and keep the celebration moving without crowding a home.",
      },
      {
        title: "Food and dessert tables",
        description: "Set up a simple buffet, dessert spread, cake table, or custom cookies that make the day feel personal to the graduate.",
      },
      {
        title: "Guests of all ages",
        description: "The room works for grandparents, kids, classmates, and family friends so everyone has a place to sit and settle in.",
      },
    ],
    seoDescription: "Book The Gathering Hub for graduation parties in Ithaca, MI with a private venue, in-house food, custom desserts, tables, chairs, and AV.",
  },
  birthdays: {
    eyebrow: "Birthday Party Venue in Ithaca, MI",
    title: "A Private Birthday Party Space That Feels Special",
    description:
      "From milestone birthdays to casual family celebrations, The Gathering Hub gives you a private space with homemade food and custom cake or cookie options.",
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Milestone birthdays",
        description: "Give the guest of honor a private room that feels special without asking family to host, clean, or rearrange the house.",
      },
      {
        title: "Dinner and dessert setups",
        description: "Plan the evening around a meal, snacks, cake, or a dessert table with room for guests to eat and mingle.",
      },
      {
        title: "Custom printed cakes and cookies",
        description: "Bring in a photo, logo, or design idea and ask about direct-to-food printing for a birthday detail people will notice.",
      },
    ],
    seoDescription: "Host a birthday party at The Gathering Hub, a private Ithaca, MI venue with tables, chairs, AV, in-house food, and custom desserts.",
  },
  "celebrations-of-life": {
    eyebrow: "Celebration of Life Venue in Ithaca, MI",
    title: "A Thoughtful Place to Gather With Family",
    description:
      "A calm, private setting for sharing a homemade meal, honoring memories, and spending time together without worrying about setup, cooking, or cleanup.",
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Family meals",
        description: "Share a comforting meal in a private setting where the food and room details are handled with care.",
      },
      {
        title: "Photo and memory tables",
        description: "Create space for framed photos, keepsakes, flowers, or a memory display that gives guests a natural place to pause.",
      },
      {
        title: "Quiet, supportive gatherings",
        description: "The room gives family and friends a calm place to sit together, talk, and honor someone without managing a house full of tasks.",
      },
    ],
    seoDescription: "Gather for a celebration of life at The Gathering Hub in Ithaca, MI, a private venue with in-house food, flexible setup, and cleanup handled.",
  },
  "corporate-events": {
    eyebrow: "Corporate Events in Ithaca, MI",
    title: "A Better Room for Work Gatherings",
    description:
      "Use The Gathering Hub for team meals, customer appreciation nights, small meetings, workshops, and local business celebrations with food handled in-house.",
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Team lunches",
        description: "Bring the group together for a meal without squeezing into an office, break room, or noisy restaurant corner.",
      },
      {
        title: "Workshops and meetings",
        description: "Use the tables, seating, Wi-Fi, video display, and sound for trainings, presentations, planning days, or small-group sessions.",
      },
      {
        title: "Customer appreciation events",
        description: "Host clients, partners, or staff in a polished downtown space with food and beverage options available for the occasion.",
      },
    ],
    seoDescription: "Book The Gathering Hub for corporate events, team lunches, workshops, and small business gatherings with in-house food in downtown Ithaca, MI.",
  },
  "private-events": {
    eyebrow: "Private Event Venue in Ithaca, MI",
    title: "Make the Whole Space Yours",
    description:
      "For reunions, game nights, bridal showers, dinners, and community gatherings, the space and in-house food adapt to the event you want to host.",
    price: "$75/hr or $525/day",
    bestFor: [
      {
        title: "Reunions and game nights",
        description: "Spread out with tables for cards, board games, conversation, and the kind of catching up that needs more room than a living room.",
      },
      {
        title: "Private dinners",
        description: "Gather around a meal in a space that feels personal, with food options available through Heather's in-house kitchen.",
      },
      {
        title: "Community gatherings",
        description: "Use the full room for clubs, small celebrations, local groups, or any event that needs a welcoming downtown home base.",
      },
    ],
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
              <div key={item.title} className="event-card">
                <div className="event-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
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
