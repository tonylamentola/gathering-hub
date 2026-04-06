import Nav from "@/components/Nav";
import content from "../../../data/content.json";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | The Gathering Hub",
  description: "Event planning tips, venue news, and inspiration from The Gathering Hub in Ithaca, MI.",
};

export default function BlogPage() {
  const posts = content.blogPosts;

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 130, background: "var(--cream)", minHeight: "70vh" }}>
        <div className="container">
          <div className="section-label">Latest Posts</div>
          <h1 className="section-title">From The Gathering Hub</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>Event planning tips, venue news, and inspiration for your next gathering.</p>

          {posts.length === 0 ? (
            <div style={{ marginTop: 60, textAlign: "center", color: "var(--muted)" }}>
              <p style={{ fontSize: 18 }}>No posts yet — check back soon!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <div key={post.id} className="blog-card">
                  <div className="blog-card-body">
                    <div className="blog-date">{new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`}>Read More →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <div>© 2025 The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="tel:9894002175">(989) 400-2175</a>
          <a href="mailto:thegatheringhub2025@outlook.com">Email</a>
          <a href={content.settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </footer>
    </>
  );
}
