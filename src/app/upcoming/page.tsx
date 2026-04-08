"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";

const fallbackUpcoming = [
  {
    id: "fallback-upcoming-1",
    title: "Bingo Night",
    date: "",
    description: "Watch this space for upcoming bingo nights, community fun, and public happenings at The Gathering Hub.",
    imageUrl: "",
    imageAspect: "portrait",
  },
];

const fallbackLifePhotos = [
  { id: "fallback-life-1", imageUrl: "/uploads/1775365063798-xp8ohwtk3b.jpeg", imageAspect: "landscape", caption: "Our event venue ready for a memorable gathering." },
  { id: "fallback-life-2", imageUrl: "/uploads/1775365063800-w4x3jcou9hq.jpeg", imageAspect: "landscape", caption: "A warm welcome at The Gathering Hub in Ithaca." },
  { id: "fallback-life-3", imageUrl: "/uploads/1775365063799-5g3cs93mz1w.jpeg", imageAspect: "landscape", caption: "A fun night at the Hub with room for community events." },
];

function getAspectRatioValue(aspect?: string) {
  if (aspect === "square") return "1 / 1";
  if (aspect === "portrait") return "4 / 5";
  return "4 / 3";
}

function getCropStyle(crop?: { zoom?: number; x?: number; y?: number }) {
  return {
    objectPosition: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
    transform: `scale(${crop?.zoom ?? 1})`,
    transformOrigin: "center center",
  };
}

export default function UpcomingPage() {
  const [upcomingItems, setUpcomingItems] = useState(fallbackUpcoming);
  const [lifePhotos, setLifePhotos] = useState(fallbackLifePhotos);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.upcomingItems) && data.upcomingItems.length > 0) {
          setUpcomingItems(data.upcomingItems);
        }
        if (Array.isArray(data.lifeAtHubPhotos) && data.lifeAtHubPhotos.length > 0) {
          setLifePhotos(data.lifeAtHubPhotos);
        }
      })
      .catch(() => {
        // Keep fallback content.
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
          --cream: #faf8f4;
        }
        .page-header {
          background: linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-light) 100%);
          padding: 140px 24px 60px;
          padding-top: calc(72px + 68px);
          text-align: center;
        }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          color: white;
          margin-bottom: 12px;
        }
        .page-header p { font-size: 17px; color: rgba(255,255,255,0.72); max-width: 560px; margin: 0 auto; }
        .upcoming-section, .life-section { padding: 72px 24px; }
        .upcoming-section { background: var(--cream); }
        .life-section { background: white; }
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
          margin-bottom: 36px;
          font-size: 15px;
          max-width: 620px;
          margin-left: auto;
          margin-right: auto;
        }
        .upcoming-grid, .life-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1140px;
          margin: 0 auto;
        }
        .upcoming-card, .life-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(36,49,117,0.1);
          box-shadow: 0 8px 28px rgba(15,21,56,0.06);
        }
        .upcoming-image, .life-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
        }
        .upcoming-body, .life-body { padding: 18px; }
        .eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }
        .upcoming-title, .life-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--navy-dark);
          margin-bottom: 8px;
        }
        .upcoming-date {
          font-size: 12px;
          font-weight: 700;
          color: var(--gold);
          margin-bottom: 10px;
        }
        .upcoming-copy, .life-copy {
          font-size: 14px;
          color: #334155;
          line-height: 1.65;
        }
      `}</style>

      <div className="page-header">
        <h1>Upcoming at the Hub</h1>
        <p>See what’s coming up next at The Gathering Hub, from bingo nights and public happenings to community events and featured moments.</p>
      </div>

      <section className="upcoming-section">
        <h2 className="section-title">What’s Coming Up</h2>
        <p className="section-sub">This is the easy place for guests to spot bingo, karaoke, special nights, flyers, and public happenings.</p>
        <div className="upcoming-grid">
          {upcomingItems.map((item) => (
            <div key={item.id} className="upcoming-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="upcoming-image" loading="lazy" style={{ aspectRatio: getAspectRatioValue(item.imageAspect), ...getCropStyle((item as { imageCrop?: { zoom?: number; x?: number; y?: number } }).imageCrop) }} />}
              <div className="upcoming-body">
                <div className="eyebrow">Upcoming</div>
                <div className="upcoming-title">{item.title}</div>
                {item.date && <div className="upcoming-date">{new Date(item.date).toLocaleDateString()}</div>}
                <div className="upcoming-copy">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="life-section">
        <h2 className="section-title">Life at the Hub</h2>
        <p className="section-sub">A look at the people, atmosphere, and moments that make the space feel special.</p>
        <div className="life-grid">
          {lifePhotos.map((photo) => (
            <div key={photo.id} className="life-card">
              <img src={photo.imageUrl} alt={photo.caption} className="life-image" loading="lazy" style={{ aspectRatio: getAspectRatioValue(photo.imageAspect), ...getCropStyle((photo as { imageCrop?: { zoom?: number; x?: number; y?: number } }).imageCrop) }} />
              <div className="life-body">
                <div className="eyebrow">Life at the Hub</div>
                <div className="life-copy">{photo.caption}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
