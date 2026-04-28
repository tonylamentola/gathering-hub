import Nav from "@/components/Nav";
import { getSiteContent } from "@/lib/content";
import type { Metadata } from "next";

type GalleryPhoto = {
  id: string;
  title?: string;
  name?: string;
  caption?: string;
  description?: string;
  imageUrl?: string;
  imageAspect?: string;
  imageCrop?: { zoom?: number; x?: number; y?: number };
};

const fallbackGalleryPhotos: GalleryPhoto[] = [
  {
    id: "fallback-gallery-1",
    title: "Downtown Ithaca Venue",
    caption: "The Gathering Hub storefront and event space in downtown Ithaca.",
    imageUrl: "/images/hero-main.jpg",
    imageAspect: "landscape",
  },
  {
    id: "fallback-gallery-2",
    title: "Welcoming Interior",
    caption: "A warm, flexible space for showers, birthdays, graduations, dinners, and community gatherings.",
    imageUrl: "/images/venue-interior.jpg",
    imageAspect: "landscape",
  },
  {
    id: "fallback-gallery-3",
    title: "Food And Desserts",
    caption: "Homemade food and desserts prepared in-house through Heather's licensed kitchen.",
    imageUrl: "/images/kitchen.jpg",
    imageAspect: "landscape",
  },
  {
    id: "fallback-gallery-4",
    title: "A Place To Gather",
    caption: "A comfortable setting for guests to settle in, visit, and celebrate.",
    imageUrl: "/images/about-ribbon.jpg",
    imageAspect: "landscape",
  },
];

export const metadata: Metadata = {
  title: "Photo Gallery | The Gathering Hub - Ithaca, MI",
  description: "Browse photos of The Gathering Hub venue, food, desserts, and event moments in downtown Ithaca, Michigan.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Photo Gallery | The Gathering Hub - Ithaca, MI",
    description: "Browse photos of The Gathering Hub venue, food, desserts, and event moments in downtown Ithaca, Michigan.",
    url: "https://gathering-hub-cms.vercel.app/menu",
    images: [{ url: "/images/hero-main.jpg", width: 1200, height: 630, alt: "The Gathering Hub in Ithaca, Michigan" }],
  },
};

function getAspectRatioValue(aspect?: string) {
  if (aspect === "portrait") return "4 / 5";
  if (aspect === "landscape") return "4 / 3";
  return "1 / 1";
}

function getCropStyle(crop?: { zoom?: number; x?: number; y?: number }) {
  return {
    objectPosition: `calc(50% + ${crop?.x ?? 0}px) calc(50% + ${crop?.y ?? 0}px)`,
    transform: `scale(${crop?.zoom ?? 1})`,
    transformOrigin: "center center",
  };
}

const galleryCopy: Record<string, { title: string; caption: string }> = {
  "legacy-life-1": {
    title: "Welcoming Venue Details",
    caption: "Warm light, thoughtful details, and a comfortable setting greet guests before each event begins.",
  },
  "legacy-life-2": {
    title: "A Warm Community Welcome",
    caption: "A friendly, flexible space where family, friends, and neighbors can settle in and feel at home.",
  },
  "legacy-life-4": {
    title: "Community Gathering Space",
    caption: "A polished downtown venue shaped by the families, hosts, and local groups who gather here.",
  },
  life1775702303007: {
    title: "Easter Cookie Workshop",
    caption: "Families and friends came together for a sweet seasonal workshop filled with decorating, laughter, and color.",
  },
  life1775702423170: {
    title: "Halloween Cookie Workshop",
    caption: "A festive workshop with spooky treats, creative decorating, and plenty of room for friends to gather.",
  },
};

function firstSentence(text?: string) {
  if (!text) return "";
  return text.split(/\n|\.(\s|$)/)[0]?.trim() || text.trim();
}

function getGalleryTitle(photo: GalleryPhoto) {
  if (galleryCopy[photo.id]) return galleryCopy[photo.id].title;
  const title = photo.title || photo.name;
  if (title && title !== "The Gathering Hub") return title;

  const caption = firstSentence(photo.caption || photo.description);
  if (/easter/i.test(caption)) return "Easter Cookie Workshop";
  if (/halloween/i.test(caption)) return "Halloween Cookie Workshop";
  if (/cookie/i.test(caption)) return "Cookie Workshop";
  if (/warm welcome|feel at home/i.test(caption)) return "A Warm Welcome";
  if (/community/i.test(caption)) return "Community Moments";
  if (/quiet moment|warm light|details/i.test(caption)) return "Venue Details";
  return "Life at the Hub";
}

function getGalleryCaption(photo: GalleryPhoto) {
  if (galleryCopy[photo.id]) return galleryCopy[photo.id].caption;
  const caption = photo.caption || photo.description || "";
  return firstSentence(caption);
}

export default async function GalleryPage() {
  const content = await getSiteContent();
  const lifePhotos = (content.lifeAtHubPhotos?.length ? content.lifeAtHubPhotos : fallbackGalleryPhotos) as GalleryPhoto[];
  const foodPhotos: GalleryPhoto[] = (content.menuItems ?? [])
    .filter((item) => item.imageUrl)
    .slice(0, 6)
    .map((item) => ({
      id: `food-${item.id}`,
      title: item.name,
      caption: item.description,
      imageUrl: item.imageUrl,
      imageAspect: item.imageAspect,
      imageCrop: (item as GalleryPhoto).imageCrop,
    }));
  const galleryPhotos: GalleryPhoto[] = [...lifePhotos, ...foodPhotos];

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
          background: linear-gradient(160deg, rgba(26,36,89,0.9) 0%, rgba(36,49,117,0.82) 58%, rgba(45,61,138,0.76) 100%), url(/images/hero-main.jpg) center/cover;
          padding: 140px 24px 64px;
          padding-top: calc(72px + 68px);
          text-align: center;
        }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          color: white;
          margin-bottom: 12px;
        }
        .page-header h1 em { font-style: normal; color: var(--gold); }
        .page-header p {
          font-size: 17px;
          color: rgba(255,255,255,0.76);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.65;
        }

        .gallery-section { padding: 70px 24px; background: var(--cream); }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--navy-dark);
          text-align: center;
          margin-bottom: 10px;
        }
        .section-sub {
          text-align: center;
          color: #64748b;
          margin: 0 auto 40px;
          font-size: 15px;
          max-width: 620px;
          line-height: 1.65;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1120px;
          margin: 0 auto;
        }
        .gallery-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(36,49,117,0.1);
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(36,49,117,0.12);
        }
        .gallery-img-wrap {
          width: 100%;
          overflow: hidden;
          background: #e8eaf4;
          border-bottom: 3px solid var(--gold);
        }
        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .gallery-card-body { padding: 18px; }
        .gallery-card-body strong {
          display: block;
          color: var(--navy-dark);
          margin-bottom: 6px;
          font-size: 16px;
        }
        .gallery-card-body p {
          font-size: 14px;
          color: #475569;
          line-height: 1.55;
          margin: 0;
        }
        .cta-section { padding: 70px 24px; background: white; text-align: center; }
        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 22px;
          border-radius: 999px;
          background: linear-gradient(135deg, #243175 0%, #1a2459 100%);
          color: white;
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 12px 26px rgba(36,49,117,0.18);
        }
        .cta-button.secondary {
          background: white;
          color: var(--navy-dark);
          border: 1px solid rgba(36,49,117,0.18);
          box-shadow: none;
        }
        footer {
          background: #0f1538;
          color: rgba(255,255,255,0.4);
          padding: 28px 40px;
          text-align: center;
          font-size: 12px;
        }
      `}</style>

      <div className="page-header">
        <h1>Photo <em>Gallery</em></h1>
        <p>A look at the space, food, desserts, and gathering moments that make The Gathering Hub feel warm, polished, and easy to settle into.</p>
      </div>

      <section className="gallery-section">
        <h2 className="section-title">A Space Worth Showing Off</h2>
        <p className="section-sub">
          Photos from the venue, kitchen, featured food, and life at the Hub.
        </p>
        <div className="gallery-grid">
          {galleryPhotos.map((photo) => {
            const title = getGalleryTitle(photo);
            const caption = getGalleryCaption(photo);
            return (
              <article key={photo.id} className="gallery-card">
                {photo.imageUrl && (
                  <div
                    className="gallery-img-wrap"
                    style={{ aspectRatio: getAspectRatioValue(photo.imageAspect) }}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={title}
                      className="gallery-img"
                      loading="lazy"
                      style={getCropStyle(photo.imageCrop)}
                    />
                  </div>
                )}
                <div className="gallery-card-body">
                  <strong>{title}</strong>
                  {caption && <p>{caption}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <h2 className="section-title">Planning Food For An Event?</h2>
        <p className="section-sub">The food menu now lives with the catering options for showers, parties, dinners, and private events.</p>
        <div className="cta-actions">
          <a href="/menu/catering" className="cta-button">View Menu</a>
          <a href="/#contact" className="cta-button secondary">Book Now</a>
        </div>
      </section>

      <footer>
        The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847 · (989) 400-2175
      </footer>
    </>
  );
}
