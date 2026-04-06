import Nav from "@/components/Nav";
import content from "../../../../data/content.json";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

type SiteSettings = {
  facebook?: string;
};

const blogPosts = (content.blogPosts ?? []) as BlogPost[];
const settings = ((content as unknown as { settings?: SiteSettings }).settings ?? {}) as SiteSettings;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
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
        <div>© 2025 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="tel:9894002175">(989) 400-2175</a>
          <a href="mailto:thegatheringhub2025@outlook.com">Email</a>
          <a href={settings.facebook || "#"} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>
    </>
  );
}
