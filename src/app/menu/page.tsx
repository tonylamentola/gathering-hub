import Nav from "@/components/Nav";
import { getSiteContent } from "@/lib/content";
import type { Metadata } from "next";

const fallbackMenuItems = [
  {
    id: "fallback-menu-1",
    name: "Fresh-Baked Cookies",
    description: "Warm homemade cookies fresh from the café oven.",
    imageUrl: "/uploads/1775364248235-pphenppbah.jpeg",
    imageAspect: "square" as const,
    price: "",
    availability: "",
  },
  {
    id: "fallback-menu-2",
    name: "Hub Bites Parmesan Bread",
    description: "A savory favorite that fits well with gatherings, lunches, and shared tables.",
    imageUrl: "/uploads/1775364596605-auu88h6cqgf.jpeg",
    imageAspect: "square" as const,
    price: "",
    availability: "",
  },
  {
    id: "fallback-menu-3",
    name: "Signature Sub",
    description: "A hearty house favorite with a hand-crafted feel and plenty of flavor.",
    imageUrl: "/uploads/1775364755623-ze97r4xwh0m.jpeg",
    imageAspect: "square" as const,
    price: "",
    availability: "",
  },
  {
    id: "fallback-menu-4",
    name: "Raspberry Cheesecake",
    description: "A homemade dessert that feels special enough for celebrations and sweet finishes.",
    imageUrl: "/uploads/1775364755624-17c88k7fp79.jpeg",
    imageAspect: "square" as const,
    price: "",
    availability: "",
  },
];

export const metadata: Metadata = {
  title: "Menu | The Gathering Hub - Ithaca, MI",
  description: "Browse homemade favorites, desserts, and featured menu items from The Gathering Hub in downtown Ithaca, Michigan.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | The Gathering Hub - Ithaca, MI",
    description: "Browse homemade favorites, desserts, and featured menu items from The Gathering Hub in downtown Ithaca, Michigan.",
    url: "https://gathering-hub-cms.vercel.app/menu",
    images: [{ url: "/images/cookies-tray.jpg", width: 1200, height: 630, alt: "Cookies from The Gathering Hub" }],
  },
};

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

function inferMenuCategory(item: { name: string; description: string; category?: string }) {
  if (item.category === "featured" || item.category === "cafe" || item.category === "sweets") return item.category;
  const text = `${item.name} ${item.description}`.toLowerCase();
  if (/(cookie|cheesecake|dessert|sweet|treat|brownie|cupcake|pie|cake)/.test(text)) return "sweets";
  if (/(soup|salad|sub|sandwich|bread|lunch|cafe|bite)/.test(text)) return "cafe";
  return "featured";
}

const menuSections = [
  {
    id: "featured",
    title: "Featured Food",
    sub: "The dishes guests ask about first — the flavors that make a visit feel worth it.",
    label: "Featured Food",
  },
  {
    id: "cafe",
    title: "Cafe Favorites",
    sub: "Soups, subs, and savory staples that make a lunch stop — or a long gathering — feel easy and satisfying.",
    label: "Cafe Favorites",
  },
  {
    id: "sweets",
    title: "Sweet Treats",
    sub: "Homemade cookies, cheesecakes, and desserts worth planning your visit around.",
    label: "Sweet Treats",
  },
] as const;

export default async function MenuPage() {
  const content = await getSiteContent();
  const menuItems = content.menuItems?.length ? content.menuItems : fallbackMenuItems;
  const categorized = menuSections.map((section) => ({
    ...section,
    items: menuItems.filter((item) => inferMenuCategory(item) === section.id),
  })).filter((section) => section.items.length > 0);

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
        .section-sub {
          text-align: center;
          color: #64748b;
          margin: 0 auto 40px;
          font-size: 15px;
          max-width: 620px;
          line-height: 1.65;
        }

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
        footer {
          background: #0f1538; color: rgba(255,255,255,0.4);
          padding: 28px 40px; text-align: center; font-size: 12px;
        }
      `}</style>

      <div className="page-header">
        <h1>Our <em>Menu</em></h1>
        <p>Homemade food, featured favorites, and simple details guests can check before they visit.</p>
      </div>

      <section className="menu-section">
        <h2 className="section-title">Homemade & Fresh</h2>
        <p className="section-sub">
          Everything on the menu is made in-house. From warm cookies to hearty café favorites — this is the food guests keep coming back for.
        </p>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {categorized.map((section, index) => (
            <div key={section.id} style={{ marginBottom: index === categorized.length - 1 ? 0 : 48 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{section.label}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "var(--navy-dark)", marginBottom: 10 }}>{section.title}</h3>
                <p style={{ color: "#64748b", fontSize: 15, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>{section.sub}</p>
              </div>
              <div className="menu-grid">
                {section.items.map((item) => (
                  <div key={item.id} className="menu-card">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="menu-card-img"
                        loading="lazy"
                        style={{
                          aspectRatio: getAspectRatioValue(item.imageAspect),
                          ...getCropStyle((item as { imageCrop?: { zoom?: number; x?: number; y?: number } }).imageCrop),
                        }}
                      />
                    )}
                    <div className="menu-card-body">
                      <div className="menu-card-cat">{section.label}</div>
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
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <h2 className="section-title">See What’s Happening</h2>
        <p className="section-sub" style={{ maxWidth: 560, margin: "0 auto 40px", textAlign: "center" }}>Looking for photos, flyers, or community happenings? Visit Upcoming at the Hub.</p>
        <div style={{ textAlign: "center" }}>
          <a
            href="/upcoming"
            style={{
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
            }}
          >
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
