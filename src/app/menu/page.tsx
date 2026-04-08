"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";

const fallbackPhotos = [
  { src: "/uploads/1775364248235-pphenppbah.jpeg", caption: "Warm homemade cookies fresh from our café oven in Ithaca MI.", category: "Food" },
  { src: "/uploads/1775364596605-auu88h6cqgf.jpeg", caption: "Savor our Hub Bites Parmesan Bread, perfect for any event venue.", category: "Food" },
  { src: "/uploads/1775364755623-ze97r4xwh0m.jpeg", caption: "Discover our hand-drawn signature sub, crafted with care in Ithaca MI.", category: "Food" },
  { src: "/uploads/1775364755624-m02hojwg2w.jpeg", caption: "Try our Asian Zing Salad, made fresh at The Gathering Hub café.", category: "Food" },
  { src: "/uploads/1775364755624-17c88k7fp79.jpeg", caption: "Indulge in rich raspberry cheesecake, a homemade delight in Ithaca MI.", category: "Desserts" },
  { src: "/uploads/1775364755625-6ydqx3vb01r.jpeg", caption: "Sweeten your day with our variety of homemade desserts and catering.", category: "Desserts" },
  { src: "/uploads/1775365063795-9a1ndlwdghs.jpeg", caption: "Take homemade desserts to go, perfect for your Ithaca MI event.", category: "Desserts" },
  { src: "/uploads/1775365063796-nkcommvfglh.jpeg", caption: "Enjoy cozy homemade chicken noodle soup at The Gathering Hub café.", category: "Food" },
  { src: "/uploads/1775365063796-0fwru35womi.png", caption: "Curious about the Hub Sub? Visit our event venue in Ithaca MI.", category: "Food" },
  { src: "/uploads/1775365063796-gev1n53efpe.jpeg", caption: "The Gathering Hub logo, symbol of community and quality in Ithaca MI.", category: "Venue" },
  { src: "/uploads/1775365063797-t2nj2g2nwa.jpeg", caption: "Meet the owners behind your favorite Ithaca MI event venue and café.", category: "About" },
  { src: "/uploads/1775365063797-gompbh4stj.jpeg", caption: "Delight in our homemade desserts, crafted with love in Ithaca MI.", category: "Desserts" },
  { src: "/uploads/1775365063798-xp8ohwtk3b.jpeg", caption: "Host your next gathering at our warm, inviting event venue in Ithaca.", category: "Venue" },
  { src: "/uploads/1775365063799-5g3cs93mz1w.jpeg", caption: "Get moving with line dancing fun at The Gathering Hub event venue.", category: "Events" },
  { src: "/uploads/1775365063800-w4x3jcou9hq.jpeg", caption: "Welcome to The Gathering Hub, your cozy event venue in Ithaca MI.", category: "Venue" },
];

const fallbackMenuItems = fallbackPhotos
  .filter((photo) => ["Food", "Desserts"].includes(photo.category))
  .map((photo, index) => ({
    id: `fallback-menu-${index}`,
    name: photo.category === "Desserts" ? "Featured Dessert" : "Featured Favorite",
    description: photo.caption,
    imageUrl: photo.src,
    imageAspect: "square",
    price: "",
    availability: "",
  }));

function getAspectRatioValue(aspect?: string) {
  if (aspect === "portrait") return "4 / 5";
  if (aspect === "landscape") return "4 / 3";
  return "1 / 1";
}

function getCropStyle(crop?: { zoom?: number; x?: number; y?: number }) {
  return {
    objectPosition: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
    transform: `scale(${crop?.zoom ?? 1})`,
    transformOrigin: "center center",
  };
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState(fallbackMenuItems);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to load")))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
          setMenuItems(data.menuItems);
        }
      })
      .catch(() => {
        // Keep fallback content in local/dev or if content load fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Nav />
      <style>{`
        :root {
          --navy: #243175;
          --navy-dark: #1a2459;
          --navy-light: #2d3d8a;
          --gold: #c9a84c;
          --gold-light: #e2c47a;
          --cream: #faf8f4;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; }

        .page-header {
          background: linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-light) 100%);
          padding: 140px 24px 60px;
          padding-top: calc(72px + 68px);
          text-align: center;
        }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900; color: white; margin-bottom: 12px;
        }
        .page-header h1 em { font-style: normal; color: var(--gold); }
        .page-header p { font-size: 17px; color: rgba(255,255,255,0.7); max-width: 500px; margin: 0 auto; }

        .menu-section { padding: 70px 24px; background: var(--cream); }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px; font-weight: 700; color: var(--navy-dark);
          text-align: center; margin-bottom: 10px;
        }
        .section-sub { text-align: center; color: #64748b; margin-bottom: 40px; font-size: 15px; }

        .menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px; max-width: 1100px; margin: 0 auto;
        }
        .menu-card {
          background: white; border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(36,49,117,0.1); transition: all 0.25s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .menu-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(36,49,117,0.12); }
        .menu-card-img {
          width: 100%; aspect-ratio: 4/3; object-fit: cover;
          border-bottom: 3px solid var(--gold);
        }
        .menu-card-body { padding: 18px; }
        .menu-card-body p { font-size: 14px; color: #1a1a2e; line-height: 1.5; }
        .menu-card-cat {
          display: inline-block; font-size: 11px; font-weight: 600;
          color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .gallery-section { padding: 70px 24px; background: white; }

        .gallery-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px; max-width: 1200px; margin: 0 auto;
        }
        .gallery-item {
          position: relative; border-radius: 12px; overflow: hidden;
          aspect-ratio: 4/3; cursor: pointer;
        }
        .gallery-item img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s;
        }
        .gallery-item:hover img { transform: scale(1.05); }
        .gallery-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(26,36,89,0.85));
          color: white; padding: 20px 14px 12px;
          font-size: 13px; font-weight: 500; line-height: 1.4;
        }
        .gallery-overlay .gold-border {
          border-top: 2px solid var(--gold);
          padding-top: 8px;
        }

        /* LIGHTBOX */
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(26,36,89,0.95);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: lbFadeIn 0.2s ease;
        }
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lightbox-inner {
          position: relative; display: flex; flex-direction: column;
          align-items: center; max-width: 90vw; max-height: 90vh;
        }
        .lightbox-img {
          max-width: 100%; max-height: 75vh;
          border-radius: 10px;
          border: 2px solid var(--gold);
          object-fit: contain;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .lightbox-caption {
          margin-top: 16px; color: rgba(255,255,255,0.85);
          font-size: 14px; text-align: center; max-width: 600px; line-height: 1.5;
          border-top: 1px solid rgba(201,168,76,0.4); padding-top: 12px;
        }
        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: white; font-size: 28px; line-height: 1;
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 1001;
          transition: background 0.2s;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.2); }
        .lightbox-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: white; font-size: 22px;
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 1001;
          transition: background 0.2s;
        }
        .lightbox-nav:hover { background: rgba(201,168,76,0.3); }
        .lightbox-nav.prev { left: 16px; }
        .lightbox-nav.next { right: 16px; }
        .lightbox-counter {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 0.1em;
        }

        footer {
          background: #0f1538; color: rgba(255,255,255,0.4);
          padding: 28px 40px; text-align: center; font-size: 12px;
        }

        @media (max-width: 600px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .menu-grid { grid-template-columns: 1fr; }
          .lightbox-nav { display: none; }
        }
      `}</style>

      <div className="page-header">
        <h1>Our <em>Menu</em></h1>
        <p>Homemade food, featured favorites, and simple details guests can check before they visit.</p>
      </div>

      <section className="menu-section">
        <h2 className="section-title">Homemade & Fresh</h2>
        <p className="section-sub">From our kitchen to your table — or your next event</p>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="menu-card-img" loading="lazy" style={{ aspectRatio: getAspectRatioValue(item.imageAspect), ...getCropStyle((item as { imageCrop?: { zoom?: number; x?: number; y?: number } }).imageCrop) }} />}
              <div className="menu-card-body">
                <div className="menu-card-cat">Menu</div>
                <div style={{ fontWeight: 700, color: "var(--navy-dark)", marginBottom: 6 }}>{item.name}</div>
                <p>{item.description}</p>
                {(item.price || item.availability) && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: "#64748b" }}>
                    {item.price && <span>{item.price}</span>}
                    {item.availability && <span>{item.availability}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <h2 className="section-title">See What’s Happening</h2>
        <p className="section-sub">Looking for photos, flyers, or community happenings? Visit Upcoming at the Hub.</p>
        <div style={{ textAlign: "center" }}>
          <a href="/upcoming" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            padding: "0 22px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #243175 0%, #1a2459 100%)",
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 12px 26px rgba(36,49,117,0.18)",
          }}>
            Visit Upcoming at the Hub →
          </a>
        </div>
      </section>

      <footer>
        The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847 · (989) 400-2175
      </footer>

    </>
  );
}
