"use client";
import Nav from "@/components/Nav";
import content from "../../data/content.json";
import { useEffect, useState } from "react";

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

type SiteSettings = {
  phone?: string;
  email?: string;
  facebook?: string;
  mapsUrl?: string;
};

const events = (content.events ?? []) as EventItem[];
const amenities = (content.amenities ?? []) as AmenityItem[];
const reviews = (content.reviews ?? []) as ReviewItem[];
const settings = ((content as unknown as { settings?: SiteSettings }).settings ?? {}) as SiteSettings;
const safePhone = settings.phone || "(989) 400-2175";
const safeEmail = settings.email || "thegatheringhub2025@outlook.com";
const safeFacebook = settings.facebook || "#";
const safeMapsUrl = settings.mapsUrl || "#";
const heroImage = "/uploads/upload-1775614780498.jpg";
const homepagePhotos = [
  {
    id: "home-photo-1",
    imageUrl: "/uploads/upload-1775614780498.jpg",
    alt: "The Gathering Hub storefront in downtown Ithaca",
    className: "photo-item large",
  },
  {
    id: "home-photo-2",
    imageUrl: "/uploads/1775365063799-5g3cs93mz1w.jpeg",
    alt: "Guests enjoying a gathering at The Gathering Hub",
    className: "photo-item",
  },
  {
    id: "home-photo-3",
    imageUrl: "/uploads/upload-1775616162773.jpg",
    alt: "Dessert slice from The Gathering Hub",
    className: "photo-item",
  },
  {
    id: "home-photo-4",
    imageUrl: "/uploads/IMG_3761.jpeg",
    alt: "Fresh cookies at The Gathering Hub",
    className: "photo-item",
  },
  {
    id: "home-photo-5",
    imageUrl: "/uploads/1775365063798-xp8ohwtk3b.jpeg",
    alt: "Warm interior setup at The Gathering Hub",
    className: "photo-item",
  },
];
const fallbackUpcomingStrip = [
  { id: "fallback-upcoming-1", title: "Upcoming at the Hub", description: "Watch for bingo, featured nights, and community happenings at The Gathering Hub.", imageUrl: "/uploads/1775365063799-5g3cs93mz1w.jpeg" },
  { id: "fallback-upcoming-2", title: "Plan Your Next Visit", description: "Check the latest public happenings and special nights at the Hub.", imageUrl: "/uploads/1775365063798-xp8ohwtk3b.jpeg" },
  { id: "fallback-upcoming-3", title: "Featured Nights", description: "See what’s coming up next and what guests are talking about.", imageUrl: "/uploads/1775365063800-w4x3jcou9hq.jpeg" },
];

export default function HomePage() {
  const [upcomingStrip, setUpcomingStrip] = useState(fallbackUpcomingStrip);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.upcomingItems) && data.upcomingItems.length > 0) {
          setUpcomingStrip(
            data.upcomingItems.slice(0, 4).map((item: { id: string; title: string; description: string; imageUrl?: string }) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imageUrl: item.imageUrl || "/uploads/1775365063799-5g3cs93mz1w.jpeg",
            }))
          );
        }
      })
      .catch(() => {
        // Keep fallback strip.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Nav />
      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `linear-gradient(160deg, rgba(26,36,89,0.82) 0%, rgba(36,49,117,0.78) 55%, rgba(45,61,138,0.74) 100%), url(${heroImage})` }}>
        <div className="hero-content">
          <div className="hero-badge">✨ Ithaca&rsquo;s Premier Event Venue</div>
          <h1>Where Every <em>Gathering</em> Becomes a Memory</h1>
          <p>A beautiful, versatile venue in the heart of downtown Ithaca, Michigan — perfect for birthdays, baby showers, bridal showers, corporate events, and more.</p>
          <div className="hero-ctas">
            <a href="#contact" className="btn-primary">📅 Book Your Event</a>
            <a href="#events" className="btn-secondary">See Event Types →</a>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat"><div className="num">100%</div><div className="lbl">5-Star Reviews</div></div>
        <div className="stat"><div className="num">Any</div><div className="lbl">Event Type</div></div>
        <div className="stat"><div className="num">DT</div><div className="lbl">Ithaca Location</div></div>
        <div className="stat"><div className="num">Full</div><div className="lbl">AV & Kitchen</div></div>
      </div>

      {/* LIFE AT THE HUB PHOTO STRIP */}
      <section className="kitchen-strip">
        <div className="container">
          <div className="kitchen-header">
            <div className="section-label">Coming Up</div>
            <h2 className="section-title" style={{ color: 'var(--navy-dark)' }}>Upcoming at The Hub</h2>
            <p className="section-sub">Bingo, public happenings, featured nights, and the kind of moments people will want to circle on the calendar.</p>
          </div>
          <div className="kitchen-scroll">
            {upcomingStrip.map((item) => (
              <a key={item.id} href="/upcoming" className="kitchen-photo">
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
                <div className="kitchen-caption">{item.title}: {item.description}</div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="/upcoming" className="btn-secondary" style={{ display: 'inline-block' }}>See Upcoming at the Hub →</a>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="events-section" id="events">
        <div className="container">
          <div className="section-label">Event Types</div>
          <h2 className="section-title">Any Occasion, Perfectly Hosted</h2>
          <p className="section-sub">From intimate gatherings to larger celebrations, we have the space and amenities to make every event shine.</p>
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

      {/* PHOTOS */}
      <section className="photos-section" id="photos">
        <div className="container">
          <div className="photos-intro">
            <div className="section-label">The Space</div>
            <h2 className="section-title">See The Gathering Hub</h2>
            <p className="section-sub">An elegant, flexible space ready to become the backdrop for your most memorable moments.</p>
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

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-logo-block">
              <p>The Gathering Hub</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Ithaca, Michigan · Est. 2025</p>
            </div>
            <div>
              <div className="section-label">About Us</div>
              <h2 className="section-title">A Venue Made for Your Moments</h2>
              <p className="section-sub">The Gathering Hub was created to give Ithaca a beautiful, welcoming space for the events that matter most. We believe every celebration deserves a special setting — and that&rsquo;s exactly what we provide.</p>
              <p style={{ marginTop: 20, fontSize: 15, color: "var(--muted)", lineHeight: 1.7 }}>
                Owned and operated right here in Ithaca, Michigan, we take pride in giving our guests a space that feels both elegant and comfortable. Whether you&rsquo;re planning an intimate gathering of 10 or a larger event, we&rsquo;ll work with you to make it perfect.
              </p>
              <div className="about-address">
                <span>📍</span>
                <div>
                  <strong style={{ color: "var(--navy-dark)" }}>121 S Pine River Street</strong><br />
                  Ithaca, MI 48847<br />
                  <a href="tel:9894002175" style={{ color: "var(--navy)", fontWeight: 600 }}>(989) 400-2175</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="amenities-section" id="amenities">
        <div className="container">
          <div className="section-label">What&rsquo;s Included</div>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-sub">Your rental includes the essentials so you can focus on enjoying the moment.</p>
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

      {/* REVIEWS */}
      <section className="reviews-section" id="reviews">
        <div className="container">
          <div className="section-label">Reviews</div>
          <h2 className="section-title">100% Recommended</h2>
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

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="section-label">Get In Touch</div>
          <h2 className="section-title">Ready to Book?</h2>
          <p className="section-sub">Reach out to check availability and plan your perfect event.</p>
          <div className="contact-cards">
            <a href={`tel:${safePhone.replace(/\D/g,"")}`} className="contact-card">
              <div className="icon">📞</div>
              <div className="label">Call Us</div>
              <div className="value">{safePhone}</div>
            </a>
            <a href={`mailto:${safeEmail}`} className="contact-card">
              <div className="icon">✉️</div>
              <div className="label">Email Us</div>
              <div className="value" style={{ fontSize: 13 }}>{safeEmail}</div>
            </a>
            <a href={safeFacebook} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="icon">👥</div>
              <div className="label">Follow Us</div>
              <div className="value">Facebook Page</div>
            </a>
            <a href={safeMapsUrl} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="icon">📍</div>
              <div className="label">Find Us</div>
              <div className="value" style={{ fontSize: 13 }}>121 S Pine River St<br />Ithaca, MI 48847</div>
            </a>
          </div>
          <a href={`mailto:${safeEmail}?subject=Event Booking Inquiry`} className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            📅 Send a Booking Inquiry
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div>© 2025 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href={`tel:${safePhone.replace(/\D/g,"")}`}>{safePhone}</a>
          <a href={`mailto:${safeEmail}`}>Email</a>
          <a href={safeFacebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>

      <a href={`tel:${safePhone.replace(/\D/g,"")}`} className="float-cta">📞 Call to Book</a>

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('a[href^="#"]').forEach(a => {
          a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
              e.preventDefault();
              window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
            }
          });
        });
      `}} />
    </>
  );
}
