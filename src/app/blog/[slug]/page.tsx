import Nav from "@/components/Nav";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSiteContent, BlogPost, SiteSettings } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const blogPosts = (content.blogPosts ?? []) as BlogPost[];
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found | The Gathering Hub" };
  return {
    title: post.seoTitle || `${post.title} | The Gathering Hub`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const content = await getSiteContent();
  const blogPosts = (content.blogPosts ?? []) as BlogPost[];
  const settings = (content.settings ?? {}) as SiteSettings;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n").filter(Boolean);

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 130, background: "var(--cream)", minHeight: "70vh" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/blog" style={{ color: "var(--navy)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
            ← Back to Blog
          </a>

          <div className="blog-date" style={{ marginBottom: 16 }}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1.2, marginBottom: 32 }}>
            {post.title}
          </h1>

          {post.imageUrl && (
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: 18,
                marginBottom: 24,
                background: "#efe5d3",
                maxHeight: 420,
              }}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: post.imageAspect === "portrait" ? "contain" : "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text)" }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: 24 }}>{para}</p>
            ))}
          </div>

          <div style={{ marginTop: 60, padding: "32px", background: "var(--navy-dark)", borderRadius: 14, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20, fontSize: 16 }}>Ready to book your event at The Gathering Hub?</p>
            <a href="/#contact" className="btn-primary">📅 Book Your Event</a>
          </div>
        </div>
      </section>

      <footer>
        <div>© 2026 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="tel:9894002175">(989) 400-2175</a>
          <a href="mailto:thegatheringhub2025@outlook.com">Email</a>
          <a href={settings.facebook || "#"} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>
    </>
  );
}
