import Nav from "@/components/Nav";
import QuoteForm from "@/components/QuoteForm";
import { getSiteContent } from "@/lib/content";
import type { ReactNode } from "react";

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

type ReviewItem = {
  id: string;
  stars: number;
  text: string;
  author: string;
};

const fallbackEvents: EventItem[] = [
  { id: "event-birthday", emoji: "🎉", title: "Birthday Parties", description: "A private space for birthday dinners, dessert tables, decorations, and the people you actually want around you." },
  { id: "event-baby", emoji: "🍼", title: "Baby Showers", description: "A welcoming downtown Ithaca setting for showers that feel thoughtful, easy, and worth remembering." },
  { id: "event-grad", emoji: "🎓", title: "Graduation Celebrations", description: "Celebrate milestones with a space that works for family, food, photos, and guests of all ages." },
  { id: "event-private", emoji: "🎲", title: "Reunions & Game Nights", description: "Perfect for reunions, game nights, and easygoing gatherings that need more warmth than a standard event room." },
];

const fallbackAmenities: AmenityItem[] = [
  { id: "amenity-tables", icon: "🪑", title: "Tables & Chairs Included", description: "The basics are already here so you can focus on planning the details that matter most." },
  { id: "amenity-av", icon: "🔊", title: "AV Ready", description: "Use the space for music, announcements, slideshows, and the little moments people gather around." },
  { id: "amenity-kitchen", icon: "🍽️", title: "Full Kitchen Access", description: "Bring your own food, prep for guests, and keep the flow of the event feeling easy." },
  { id: "amenity-downtown", icon: "📍", title: "Downtown Ithaca Location", description: "A central location that makes it easy for local guests to find you and settle in." },
];

function LineIcon({ kind, color = "currentColor", size = 38, stroke = 1.8 }: { kind: string; color?: string; size?: number; stroke?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const icons: Record<string, ReactNode> = {
    cake: <><path d="M5 10h14v8H5z" /><path d="M8 10V7" /><path d="M12 10V6" /><path d="M16 10V7" /><path d="M7 14h10" /><path d="M7 18h10" /></>,
    baby: <><rect x="5" y="12" width="5" height="5" rx="1" /><rect x="10" y="7" width="5" height="5" rx="1" /><rect x="15" y="12" width="5" height="5" rx="1" /><path d="M7.5 14.5h0" /><path d="M12.5 9.5h0" /><path d="M17.5 14.5h0" /></>,
    grad: <><path d="m3 9 9-4 9 4-9 4-9-4Z" /><path d="M7 11.5V15c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.5" /><path d="M21 10v5" /></>,
    toast: <><path d="M9 4h6v4a3 3 0 0 1-6 0V4Z" /><path d="M12 11v6" /><path d="M9 21h6" /></>,
    games: <><rect x="5" y="6" width="14" height="14" rx="3" /><path d="M9 11h.01" /><path d="M15 11h.01" /><path d="M9 16h.01" /><path d="M15 16h.01" /></>,
    chair: <><path d="M4 18v-5h3v5" /><path d="M17 18v-5h3v5" /><path d="M8 9h8v4H8z" /><path d="M12 13v5" /><path d="M5 13h14" /><path d="M4 9h2v4H4z" /><path d="M18 9h2v4h-2z" /></>,
    speaker: <><path d="M4 14h4l5 4V6L8 10H4v4Z" /><path d="M17 9a4 4 0 0 1 0 6" /><path d="M19.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
    utensils: <><path d="M6 3v8" /><path d="M4 3v5" /><path d="M8 3v5" /><path d="M6 11v10" /><path d="M14 3v8" /><path d="M18 3v18" /><path d="M14 11h4" /></>,
    pin: <><path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <><path d="M6 4h3l2 5-2 1.5a14 14 0 0 0 4.5 4.5L15 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2Z" /></>,
    mail: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></>,
    users: <><circle cx="9" cy="9" r="3" /><path d="M4 19a5 5 0 0 1 10 0" /><circle cx="17.5" cy="10" r="2.5" /><path d="M15.5 19a4 4 0 0 1 4-3.5" /></>,
  };

  return <svg {...common}>{icons[kind] || icons.pin}</svg>;
}

function eventIconFor(title: string, fallback: string) {
  const text = `${title} ${fallback}`.toLowerCase();
  if (text.includes("baby")) return "baby";
  if (text.includes("grad")) return "grad";
  if (text.includes("birthday")) return "cake";
  if (text.includes("reunion") || text.includes("game")) return "games";
  return "toast";
}

function amenityIconFor(title: string, fallback: string) {
  const text = `${title} ${fallback}`.toLowerCase();
  if (text.includes("chair") || text.includes("table")) return "chair";
  if (text.includes("av") || text.includes("speaker") || text.includes("music")) return "speaker";
  if (text.includes("kitchen") || text.includes("food")) return "utensils";
  return "pin";
}

const images = {
  hero: "/images/hero-main.jpg",
  aboutRibbon: "/images/about-ribbon.jpg",
  upcomingMain: "/images/upcoming-main.jpg",
  venuetoaster: "/images/venuetoaster.jpg",
  outside: "/images/outside.jpg",
  kitchen: "/images/kitchen.jpg",
  venueInterior: "/images/venue-interior.jpg",
};

const homepagePhotos = [
  {
    id: "home-photo-1",
    imageUrl: images.hero,
    alt: "The Gathering Hub storefront in downtown Ithaca",
    className: "photo-item large",
  },
  {
    id: "home-photo-2",
    imageUrl: images.venuetoaster,
    alt: "Exterior sign and storefront view at The Gathering Hub",
    className: "photo-item",
  },
  {
    id: "home-photo-3",
    imageUrl: images.outside,
    alt: "Outside view of The Gathering Hub in downtown Ithaca",
    className: "photo-item",
  },
  {
    id: "home-photo-4",
    imageUrl: images.kitchen,
    alt: "Kitchen and prep area at The Gathering Hub",
    className: "photo-item",
  },
  {
    id: "home-photo-5",
    imageUrl: images.venueInterior,
    alt: "Warm interior setup at The Gathering Hub",
    className: "photo-item",
  },
];

const fallbackUpcomingStrip = [
  { id: "fallback-upcoming-1", title: "Upcoming at the Hub", description: "Watch for bingo, featured nights, and community happenings at The Gathering Hub.", imageUrl: images.upcomingMain, imageAspect: "portrait" as const, date: "" },
  { id: "fallback-upcoming-2", title: "Plan Your Next Visit", description: "Check the latest public happenings and special nights at the Hub.", imageUrl: images.venueInterior, imageAspect: "landscape" as const, date: "" },
  { id: "fallback-upcoming-3", title: "Featured Nights", description: "See what’s coming up next and what guests are talking about.", imageUrl: images.upcomingMain, imageAspect: "portrait" as const, date: "" },
];

function sortUpcomingItems<T extends { date?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = a.date ? new Date(`${a.date}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const bTime = b.date ? new Date(`${b.date}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    return bTime - aTime;
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ guide?: string }>;
}) {
  const params = (await searchParams) || {};
  const reviewMode = params.guide === "1";
  const content = await getSiteContent();

  const settings = content.settings ?? {};
  const events = (content as { events?: EventItem[] }).events?.length
    ? ((content as { events?: EventItem[] }).events as EventItem[])
    : fallbackEvents;
  const amenities = (content as { amenities?: AmenityItem[] }).amenities?.length
    ? ((content as { amenities?: AmenityItem[] }).amenities as AmenityItem[])
    : fallbackAmenities;
  const reviews = ((content as { reviews?: ReviewItem[] }).reviews ?? []) as ReviewItem[];
  const upcomingStrip = content.upcomingItems?.length
    ? sortUpcomingItems(content.upcomingItems).slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl || images.upcomingMain,
        imageAspect: item.imageAspect || "portrait",
        date: item.date || "",
      }))
    : fallbackUpcomingStrip;

  function formatShortDate(date?: string) {
    if (!date) return "Date TBA";
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  const safePhone = settings.phone || "(989) 400-2175";
  const safeEmail = settings.email || "thegatheringhub2025@outlook.com";
  const safeFacebook = settings.facebook?.trim() || "";
  const safeMapsUrl = settings.mapsUrl || "https://maps.google.com/?q=121+S+Pine+River+St,+Ithaca,+MI+48847";
  const siteUrl = "https://gathering-hub-cms.vercel.app";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: "The Gathering Hub",
    image: [`${siteUrl}${images.hero}`, `${siteUrl}${images.aboutRibbon}`],
    url: siteUrl,
    telephone: safePhone,
    email: safeEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: "121 S Pine River St",
      addressLocality: "Ithaca",
      addressRegion: "MI",
      postalCode: "48847",
      addressCountry: "US",
    },
    sameAs: safeFacebook && safeFacebook !== "#" ? [safeFacebook] : undefined,
    description:
      "Private venue rental in downtown Ithaca for birthdays, baby showers, graduations, and special gatherings.",
  };

  return (
    <>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* HERO IMAGE */}
      <section
        className={`hero ${reviewMode ? "review-section" : ""}`}
        style={{
          backgroundImage: `linear-gradient(160deg, rgba(26,36,89,0.82) 0%, rgba(36,49,117,0.78) 55%, rgba(45,61,138,0.74) 100%), url(${images.hero})`,
        }}
      >
        {reviewMode && <div className="review-badge">Hero</div>}
        <div className="hero-content">
          <div className="hero-badge">✨ Downtown Ithaca&rsquo;s Private Event Venue</div>
          <h1>Your People Deserve a <em>Beautiful Space</em></h1>
          <p>Private venue rental for birthdays, baby showers, graduations, and every celebration worth doing right — in the heart of downtown Ithaca.</p>
          <div className="hero-ctas">
            <a href="#contact" className="btn-primary">📅 Check Availability</a>
            <a href="#photos" className="btn-secondary">See the Space →</a>
          </div>
          <div className="hero-trust-line">
            <span>✔ Fully private rental</span>
            <span>✔ Tables, chairs &amp; AV included</span>
            <span>✔ No catering minimums</span>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat"><div className="num">5★</div><div className="lbl">Community Reviews</div></div>
        <div className="stat"><div className="num">Any</div><div className="lbl">Occasion Welcome</div></div>
        <div className="stat"><div className="num">DT</div><div className="lbl">Downtown Ithaca</div></div>
        <div className="stat"><div className="num">Full</div><div className="lbl">AV & Kitchen</div></div>
      </div>

      {/* UPCOMING STRIP IMAGE */}
      <section className={`kitchen-strip ${reviewMode ? "review-section" : ""}`}>
        {reviewMode && <div className="review-badge">Upcoming Strip</div>}
        <div className="container">
          <div className="kitchen-header">
            <div className="section-label">Upcoming Events at The Hub</div>
            <h2 className="section-title" style={{ color: "var(--navy-dark)" }}>What&rsquo;s Happening at The Hub</h2>
            <p className="section-sub">Join us for public happenings, or book your own celebration. Popular dates can fill quickly.</p>
          </div>
          <div className="kitchen-scroll">
            {upcomingStrip.map((item) => (
              <a key={item.id} href="/upcoming" className="kitchen-photo">
                <div className="kitchen-caption-date">{formatShortDate(item.date)}</div>
                <div className="kitchen-caption-title">{item.title}</div>
                <div className="kitchen-caption-copy">{item.description}</div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/upcoming" className="btn-secondary" style={{ display: "inline-block" }}>See Upcoming at the Hub →</a>
          </div>
        </div>
      </section>

      <section className={`events-section ${reviewMode ? "review-section" : ""}`} id="events">
        {reviewMode && <div className="review-badge">Events</div>}
        <div className="container">
          <div className="section-label">Event Types</div>
          <h2 className="section-title">Any Occasion, Perfectly Hosted</h2>
          <p className="section-sub">Whatever you&rsquo;re celebrating, we make the space work for you — so you can focus on the people, not the logistics.</p>
          <div className="events-grid">
            {events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div className="event-card-icon">
                  <LineIcon kind={eventIconFor(ev.title, ev.emoji)} color="var(--gold-light)" size={44} stroke={1.7} />
                </div>
                <div className="event-card-body">
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOMEPAGE GRID IMAGES */}
      <section className={`photos-section ${reviewMode ? "review-section" : ""}`} id="photos">
        {reviewMode && <div className="review-badge">Homepage Grid</div>}
        <div className="container">
          <div className="photos-intro">
            <div className="section-label">The Space</div>
            <h2 className="section-title">A Space Worth Showing Off</h2>
            <p className="section-sub">From dessert tables to cozy gatherings, this is the kind of space that helps people relax, celebrate, and stay awhile.</p>
          </div>
          <div className="photos-grid">
            {homepagePhotos.map((photo) => (
              <div key={photo.id} className={photo.className}>
                <img src={photo.imageUrl} alt={photo.alt} className="photo-image" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT IMAGE */}
      <section className={`about-section ${reviewMode ? "review-section" : ""}`} id="about">
        {reviewMode && <div className="review-badge">About</div>}
        <div className="container">
          <div className="about-grid">
            <div className="about-logo-block">
              <img src={images.aboutRibbon} alt="Ribbon cutting moment at The Gathering Hub" className="about-feature-image" />
            </div>
            <div>
              <div className="section-label">About Us</div>
              <h2 className="section-title">A Venue Made for Your Moments</h2>
              <p className="section-sub">The Gathering Hub was created for real moments: celebrations that matter, events that feel effortless, and memories that last.</p>
              <p style={{ marginTop: 20, fontSize: 15, color: "var(--muted)", lineHeight: 1.7 }}>
                Owned and operated right here in Ithaca, Michigan, we take pride in offering a space that feels both elegant and comfortable. We handle the space so you can focus on the people and the occasion.
              </p>
              <div className="about-address">
                <span style={{ display: "inline-flex", color: "var(--navy)" }}><LineIcon kind="pin" color="currentColor" size={20} stroke={1.9} /></span>
                <div>
                  <strong style={{ color: "var(--navy-dark)" }}>121 S Pine River Street</strong><br />
                  Ithaca, MI 48847<br />
                  <a href={`tel:${safePhone.replace(/\D/g, "")}`} style={{ color: "var(--navy)", fontWeight: 600 }}>{safePhone}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`amenities-section ${reviewMode ? "review-section" : ""}`} id="amenities">
        {reviewMode && <div className="review-badge">Amenities</div>}
        <div className="container">
          <div className="section-label">What&rsquo;s Included</div>
          <h2 className="section-title">The Whole Space Is Yours</h2>
          <p className="section-sub">Every booking includes tables, chairs, AV, and full kitchen access. Just bring your people.</p>
          <div className="amenities-grid">
            {amenities.map((am) => (
              <div key={am.id} className="amenity-card">
                <div className="amenity-icon">
                  <LineIcon kind={amenityIconFor(am.title, am.icon)} color="var(--gold-light)" size={34} stroke={1.7} />
                </div>
                <h4>{am.title}</h4>
                <p>{am.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className={`reviews-section ${reviewMode ? "review-section" : ""}`} id="reviews">
          {reviewMode && <div className="review-badge">Reviews</div>}
          <div className="container">
            <div className="section-label">Reviews</div>
            <h2 className="section-title">Kind Words From Guests</h2>
            <p className="section-sub">Every guest. Every event. We take pride in making your experience exceptional.</p>
            <div className="reviews-grid">
              {reviews.map((rv) => (
                <div key={rv.id} className="review-card">
                  <div className="review-stars">{"★".repeat(rv.stars)}</div>
                  <p className="review-text">&ldquo;{rv.text}&rdquo;</p>
                  <div className="review-author">— {rv.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`contact-section ${reviewMode ? "review-section" : ""}`} id="contact">
        {reviewMode && <div className="review-badge">Contact</div>}
        <div className="container">
          <div className="section-label">Get In Touch</div>
          <h2 className="section-title">Ready to Lock in Your Date?</h2>
          <p className="section-sub">Most weekends fill fast. To get a quote, just include your event type, preferred date, and guest count — we&apos;ll get back to you quickly.</p>
          <QuoteForm safeEmail={safeEmail} />
          <div className="contact-cards">
            <a href={`tel:${safePhone.replace(/\D/g, "")}`} className="contact-card">
              <div className="icon"><LineIcon kind="phone" color="currentColor" size={28} stroke={1.8} /></div>
              <div className="label">Call Us</div>
              <div className="value">{safePhone}</div>
            </a>
            <a href={`mailto:${safeEmail}`} className="contact-card">
              <div className="icon"><LineIcon kind="mail" color="currentColor" size={28} stroke={1.8} /></div>
              <div className="label">Email Us</div>
              <div className="value" style={{ fontSize: 13 }}>{safeEmail}</div>
            </a>
            {safeFacebook && (
              <a href={safeFacebook} target="_blank" rel="noopener noreferrer" className="contact-card">
                <div className="icon"><LineIcon kind="users" color="currentColor" size={28} stroke={1.8} /></div>
                <div className="label">Follow Us</div>
                <div className="value">Facebook Page</div>
              </a>
            )}
            <a href={safeMapsUrl} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="icon"><LineIcon kind="pin" color="currentColor" size={28} stroke={1.8} /></div>
              <div className="label">Find Us</div>
              <div className="value" style={{ fontSize: 13 }}>121 S Pine River St<br />Ithaca, MI 48847</div>
            </a>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href={`mailto:${safeEmail}?subject=Event Booking Inquiry`} className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
              📅 Check Availability
            </a>
            <a href={`mailto:${safeEmail}?subject=Event%20Quote%20Request&body=Hi%20there%2C%0A%0AI%E2%80%99m%20interested%20in%20hosting%20an%20event%20at%20The%20Gathering%20Hub.%0A%0AEvent%20type%3A%20%0APreferred%20date%3A%20%0AGuest%20count%3A%20%0A%0AThanks%21`} className="btn-secondary" style={{ fontSize: 16, padding: "16px 32px" }}>
              Request a Quote
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div>© 2026 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href={`tel:${safePhone.replace(/\D/g, "")}`}>{safePhone}</a>
          <a href={`mailto:${safeEmail}`}>Email</a>
          {safeFacebook && <a href={safeFacebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
        </div>
      </footer>

      <a href={`tel:${safePhone.replace(/\D/g, "")}`} className="float-cta">📞 Call to Book</a>

      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.querySelectorAll('a[href^="#"]').forEach(a => {
          a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
              e.preventDefault();
              window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
            }
          });
        });
      `,
        }}
      />
    </>
  );
}
