"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import content from "../../data/content.json";

export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      {/* NAV */}
      {/* HERO */}
      <section className="hero">
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
            <div className="section-label">From Our Kitchen</div>
            <h2 className="section-title" style={{ color: 'var(--navy-dark)' }}>Life at The Hub</h2>
            <p className="section-sub">Homemade food, warm spaces, and moments worth remembering.</p>
          </div>
          <div className="kitchen-scroll">
            {[
              { src: "/uploads/1775364248235-pphenppbah.jpeg", caption: "Fresh-baked cookies" },
              { src: "/uploads/1775364755624-17c88k7fp79.jpeg", caption: "Raspberry cheesecake" },
              { src: "/uploads/1775365063798-xp8ohwtk3b.jpeg", caption: "Our event venue" },
              { src: "/uploads/1775365063796-nkcommvfglh.jpeg", caption: "Homemade chicken soup" },
            ].map((photo, i) => (
              <a key={i} href="/menu" className="kitchen-photo">
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <div className="kitchen-caption">{photo.caption}</div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="/menu" className="btn-secondary" style={{ display: 'inline-block' }}>See Full Menu & Gallery →</a>
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
            {content.events.map((ev) => (
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
            <div className="photo-item large">
              <div className="photo-placeholder tall">
                <span>🏛️</span>
                <p>The Gathering Hub<br />Main Event Space</p>
              </div>
            </div>
            <div className="photo-item">
              <div className="photo-placeholder">
                <span>🎉</span>
                <p>Event Setup</p>
              </div>
            </div>
            <div className="photo-item">
              <div className="photo-placeholder">
                <span>💡</span>
                <p>Interior Lighting</p>
              </div>
            </div>
            <div className="photo-item">
              <div className="photo-placeholder">
                <span>🍽️</span>
                <p>Prep Kitchen</p>
              </div>
            </div>
            <div className="photo-item">
              <div className="photo-placeholder">
                <span>📍</span>
                <p>Downtown Ithaca</p>
              </div>
            </div>
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
            {content.amenities.map((am) => (
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
            {content.reviews.map((rv) => (
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
            <a href={`tel:${content.settings.phone.replace(/\D/g,"")}`} className="contact-card">
              <div className="icon">📞</div>
              <div className="label">Call Us</div>
              <div className="value">{content.settings.phone}</div>
            </a>
            <a href={`mailto:${content.settings.email}`} className="contact-card">
              <div className="icon">✉️</div>
              <div className="label">Email Us</div>
              <div className="value" style={{ fontSize: 13 }}>{content.settings.email}</div>
            </a>
            <a href={content.settings.facebook} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="icon">👥</div>
              <div className="label">Follow Us</div>
              <div className="value">Facebook Page</div>
            </a>
            <a href={content.settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="icon">📍</div>
              <div className="label">Find Us</div>
              <div className="value" style={{ fontSize: 13 }}>121 S Pine River St<br />Ithaca, MI 48847</div>
            </a>
          </div>
          <a href={`mailto:${content.settings.email}?subject=Event Booking Inquiry`} className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            📅 Send a Booking Inquiry
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div>© 2025 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href={`tel:${content.settings.phone.replace(/\D/g,"")}`}>{content.settings.phone}</a>
          <a href={`mailto:${content.settings.email}`}>Email</a>
          <a href={content.settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>

      <a href={`tel:${content.settings.phone.replace(/\D/g,"")}`} className="float-cta">📞 Call to Book</a>

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
