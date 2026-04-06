"use client";
import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "GatheringHub2026!";
const TOKENS_PER_REWRITE = 1500;
const TOKENS_PER_SUGGESTION = 1000;
const TOKENS_PER_POST_SUGGESTION = 2000;

type ContentData = {
  settings: { siteName: string; phone: string; email: string; address: string };
  events: Array<{ id: string; title: string; emoji: string; description: string }>;
  amenities: Array<{ id: string; icon: string; title: string; description: string }>;
  reviews: Array<{ id: string; stars: number; text: string; author: string }>;
  announcements: Array<{ id: string; title: string; body: string; active: boolean }>;
  blogPosts: Array<{ id: string; slug: string; title: string; excerpt: string; body: string; seoTitle: string; seoDescription: string; publishedAt: string }>;
  tokenBudget: { monthlyLimit: number; used: number; resetMonth: string };
};

type PostSuggestion = {
  title: string;
  outline: string[];
  seoTitle: string;
  seoDescription: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<"dashboard" | "blog" | "events" | "reviews" | "announcements" | "amenities">("dashboard");
  const [content, setContent] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Blog editor state
  const [blogTitle, setBlogTitle] = useState("");
  const [blogBody, setBlogBody] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [polishMsg, setPolishMsg] = useState("");
  const [editingPost, setEditingPost] = useState<string | null>(null);

  // Blog post suggestion state
  const [suggestingPost, setSuggestingPost] = useState(false);
  const [postSuggestion, setPostSuggestion] = useState<PostSuggestion | null>(null);
  const [postSuggestionTitle, setPostSuggestionTitle] = useState("");
  const [postSuggestionOpen, setPostSuggestionOpen] = useState(false);
  const [postSuggestMsg, setPostSuggestMsg] = useState("");

  // Event editor
  const [newEvent, setNewEvent] = useState({ title: "", emoji: "🎉", description: "" });
  // AI Suggest events
  const [suggestingEvents, setSuggestingEvents] = useState(false);
  const [eventSuggestions, setEventSuggestions] = useState<Array<{ title: string; description: string }>>([]);
  const [eventSuggestMsg, setEventSuggestMsg] = useState("");
  // Polish states for events
  const [polishingEventId, setPolishingEventId] = useState<string | null>(null);
  const [eventPolishPreview, setEventPolishPreview] = useState<{ id: string; polished: string } | null>(null);

  // Review editor
  const [newReview, setNewReview] = useState({ stars: 5, text: "", author: "" });

  // Announcement editor
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", active: true });
  // AI Suggest announcements
  const [suggestingAnnouncements, setSuggestingAnnouncements] = useState(false);
  const [announcementSuggestions, setAnnouncementSuggestions] = useState<Array<{ text: string }>>([]);
  const [annSuggestMsg, setAnnSuggestMsg] = useState("");
  // Polish states for announcements
  const [polishingAnnId, setPolishingAnnId] = useState<string | null>(null);
  const [annPolishPreview, setAnnPolishPreview] = useState<{ id: string; polished: string } | null>(null);

  // Amenity editor
  const [newAmenity, setNewAmenity] = useState({ icon: "✨", title: "", description: "" });
  // Polish states for amenities
  const [polishingAmId, setPolishingAmId] = useState<string | null>(null);
  const [amPolishPreview, setAmPolishPreview] = useState<{ id: string; polished: string } | null>(null);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check localStorage first (remember me), then sessionStorage
    const lsToken = typeof window !== "undefined" ? localStorage.getItem("gh_auth_token") : null;
    const ssToken = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;
    if (lsToken || ssToken) {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed && !content) loadContent();
  }, [authed]);

  async function loadContent() {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setContent(data);
    } catch {
      console.error("Failed to load content");
    }
  }

  function getAuthToken() {
    return (
      localStorage.getItem("gh_auth_token") ||
      sessionStorage.getItem("admin_token") ||
      btoa(ADMIN_PASSWORD)
    );
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      const token = btoa(pw);
      if (rememberMe) {
        localStorage.setItem("gh_auth_token", token);
      } else {
        sessionStorage.setItem("admin_token", token);
      }
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password. Please try again.");
    }
  }

  function handleSignOut() {
    localStorage.removeItem("gh_auth_token");
    sessionStorage.removeItem("admin_token");
    setAuthed(false);
  }

  async function saveContent(updated: ContentData) {
    setSaving(true);
    setSaveMsg("");
    try {
      const token = getAuthToken();
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setContent(updated);
        setSaveMsg("✅ Saved successfully!");
      } else {
        setSaveMsg("❌ Save failed. Please try again.");
      }
    } catch {
      setSaveMsg("❌ Save failed. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // Generic polish helper
  async function polishText(text: string, tokenCost: number): Promise<string | null> {
    if (!content) return null;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < tokenCost) return null;
    const token = getAuthToken();
    const res = await fetch("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ content: text, action: "polish" }),
    });
    const data = await res.json();
    if (data.polishedContent) {
      const updated = {
        ...content,
        tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + tokenCost },
      };
      setContent(updated);
      return data.polishedContent;
    }
    return null;
  }

  async function handlePolish() {
    if (!content) return;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < TOKENS_PER_REWRITE) {
      setPolishMsg("❌ Not enough token budget remaining this month.");
      return;
    }
    setPolishing(true);
    setPolishMsg("✨ Polishing with AI...");
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: blogBody, title: blogTitle }),
      });
      const data = await res.json();
      if (data.polishedContent) {
        setBlogBody(data.polishedContent);
        if (data.seoTitle) setBlogTitle(data.seoTitle.replace(" | The Gathering Hub", ""));
        if (data.seoDescription) setBlogExcerpt(data.seoDescription);
        const updated = {
          ...content,
          tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + TOKENS_PER_REWRITE },
        };
        setContent(updated);
        await saveContent(updated);
        setPolishMsg("✅ AI polish complete!");
      } else {
        setPolishMsg("❌ Polish failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setPolishMsg("❌ Polish failed. Check your connection.");
    }
    setPolishing(false);
    setTimeout(() => setPolishMsg(""), 5000);
  }

  async function handleSuggestPost() {
    if (!content) return;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < TOKENS_PER_POST_SUGGESTION) {
      setPostSuggestMsg("❌ Not enough token budget.");
      return;
    }
    setSuggestingPost(true);
    setPostSuggestMsg("🔍 Generating SEO post idea...");
    setPostSuggestionOpen(false);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: "The Gathering Hub, event venue, Ithaca MI", action: "suggest_post" }),
      });
      const data = await res.json();
      if (data.suggestion?.title) {
        setPostSuggestion(data.suggestion);
        setPostSuggestionTitle(data.suggestion.title);
        setPostSuggestionOpen(true);
        const updated = {
          ...content,
          tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + TOKENS_PER_POST_SUGGESTION },
        };
        setContent(updated);
        setPostSuggestMsg("");
      } else {
        setPostSuggestMsg("❌ Suggestion failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setPostSuggestMsg("❌ Failed. Check your connection.");
    }
    setSuggestingPost(false);
  }

  function applyPostSuggestion() {
    if (!postSuggestion) return;
    const outlineText = postSuggestion.outline.map((item) => `• ${item}`).join("\n");
    const starter = `${postSuggestionTitle}\n\n${outlineText}\n\n[Start writing here...]`;
    setBlogTitle(postSuggestionTitle);
    setBlogExcerpt(postSuggestion.seoDescription || "");
    setBlogBody(starter);
    setPostSuggestionOpen(false);
    setPostSuggestion(null);
  }

  function saveBlogPost() {
    if (!content || !blogTitle || !blogBody) return;
    const slug = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = editingPost || `bp${Date.now()}`;
    const newPost = {
      id,
      slug,
      title: blogTitle,
      excerpt: blogExcerpt || blogBody.slice(0, 160) + "...",
      body: blogBody,
      seoTitle: `${blogTitle} | The Gathering Hub`,
      seoDescription: blogExcerpt || blogBody.slice(0, 160),
      publishedAt: new Date().toISOString(),
    };
    let posts = [...content.blogPosts];
    if (editingPost) {
      posts = posts.map((p) => (p.id === editingPost ? newPost : p));
    } else {
      posts = [newPost, ...posts];
    }
    const updated = { ...content, blogPosts: posts };
    saveContent(updated);
    setBlogTitle("");
    setBlogBody("");
    setBlogExcerpt("");
    setEditingPost(null);
  }

  function editPost(post: ContentData["blogPosts"][0]) {
    setBlogTitle(post.title);
    setBlogBody(post.body);
    setBlogExcerpt(post.excerpt);
    setEditingPost(post.id);
    setTab("blog");
  }

  function deletePost(id: string) {
    if (!content || !confirm("Delete this post?")) return;
    const updated = { ...content, blogPosts: content.blogPosts.filter((p) => p.id !== id) };
    saveContent(updated);
  }

  function addEvent() {
    if (!content || !newEvent.title) return;
    const updated = {
      ...content,
      events: [...content.events, { id: `ev${Date.now()}`, ...newEvent }],
    };
    saveContent(updated);
    setNewEvent({ title: "", emoji: "🎉", description: "" });
  }

  function deleteEvent(id: string) {
    if (!content || !confirm("Delete this event type?")) return;
    saveContent({ ...content, events: content.events.filter((e) => e.id !== id) });
  }

  async function handleSuggestEvents() {
    if (!content) return;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < TOKENS_PER_SUGGESTION) {
      setEventSuggestMsg("❌ Not enough token budget.");
      return;
    }
    setSuggestingEvents(true);
    setEventSuggestMsg("🤔 Getting AI event ideas...");
    setEventSuggestions([]);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: "business_type", action: "suggest_events" }),
      });
      const data = await res.json();
      if (data.suggestions?.length) {
        setEventSuggestions(data.suggestions);
        const updated = {
          ...content,
          tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + TOKENS_PER_SUGGESTION },
        };
        setContent(updated);
        setEventSuggestMsg("");
      } else {
        setEventSuggestMsg("❌ No suggestions returned: " + (data.error || "Unknown error"));
      }
    } catch {
      setEventSuggestMsg("❌ Failed. Check your connection.");
    }
    setSuggestingEvents(false);
  }

  async function handlePolishEvent(ev: ContentData["events"][0]) {
    setPolishingEventId(ev.id);
    try {
      const polished = await polishText(ev.description, TOKENS_PER_REWRITE);
      if (polished) {
        setEventPolishPreview({ id: ev.id, polished });
      }
    } catch { /* ignore */ }
    setPolishingEventId(null);
  }

  function applyEventPolish(ev: ContentData["events"][0]) {
    if (!content || !eventPolishPreview) return;
    const updated = {
      ...content,
      events: content.events.map((e) =>
        e.id === ev.id ? { ...e, description: eventPolishPreview.polished } : e
      ),
    };
    saveContent(updated);
    setEventPolishPreview(null);
  }

  function addReview() {
    if (!content || !newReview.text) return;
    const updated = {
      ...content,
      reviews: [...content.reviews, { id: `rv${Date.now()}`, ...newReview }],
    };
    saveContent(updated);
    setNewReview({ stars: 5, text: "", author: "" });
  }

  function deleteReview(id: string) {
    if (!content || !confirm("Delete this review?")) return;
    saveContent({ ...content, reviews: content.reviews.filter((r) => r.id !== id) });
  }

  function addAnnouncement() {
    if (!content || !newAnnouncement.title) return;
    const updated = {
      ...content,
      announcements: [...content.announcements, { id: `ann${Date.now()}`, ...newAnnouncement }],
    };
    saveContent(updated);
    setNewAnnouncement({ title: "", body: "", active: true });
  }

  function deleteAnnouncement(id: string) {
    if (!content || !confirm("Delete this announcement?")) return;
    saveContent({ ...content, announcements: content.announcements.filter((a) => a.id !== id) });
  }

  async function handleSuggestAnnouncements() {
    if (!content) return;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < TOKENS_PER_SUGGESTION) {
      setAnnSuggestMsg("❌ Not enough token budget.");
      return;
    }
    setSuggestingAnnouncements(true);
    setAnnSuggestMsg("🤔 Getting AI announcement ideas...");
    setAnnouncementSuggestions([]);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: "business_type", action: "suggest_announcements" }),
      });
      const data = await res.json();
      if (data.suggestions?.length) {
        setAnnouncementSuggestions(data.suggestions);
        const updated = {
          ...content,
          tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + TOKENS_PER_SUGGESTION },
        };
        setContent(updated);
        setAnnSuggestMsg("");
      } else {
        setAnnSuggestMsg("❌ No suggestions returned: " + (data.error || "Unknown error"));
      }
    } catch {
      setAnnSuggestMsg("❌ Failed. Check your connection.");
    }
    setSuggestingAnnouncements(false);
  }

  async function handlePolishAnnouncement(ann: ContentData["announcements"][0]) {
    setPolishingAnnId(ann.id);
    try {
      const polished = await polishText(ann.body, TOKENS_PER_REWRITE);
      if (polished) {
        setAnnPolishPreview({ id: ann.id, polished });
      }
    } catch { /* ignore */ }
    setPolishingAnnId(null);
  }

  function applyAnnPolish(ann: ContentData["announcements"][0]) {
    if (!content || !annPolishPreview) return;
    const updated = {
      ...content,
      announcements: content.announcements.map((a) =>
        a.id === ann.id ? { ...a, body: annPolishPreview.polished } : a
      ),
    };
    saveContent(updated);
    setAnnPolishPreview(null);
  }

  function addAmenity() {
    if (!content || !newAmenity.title) return;
    const amenities = content.amenities || [];
    const updated = {
      ...content,
      amenities: [...amenities, { id: `am${Date.now()}`, ...newAmenity }],
    };
    saveContent(updated);
    setNewAmenity({ icon: "✨", title: "", description: "" });
  }

  function deleteAmenity(id: string) {
    if (!content || !confirm("Delete this amenity?")) return;
    saveContent({ ...content, amenities: (content.amenities || []).filter((a) => a.id !== id) });
  }

  async function handlePolishAmenity(am: ContentData["amenities"][0]) {
    setPolishingAmId(am.id);
    try {
      const polished = await polishText(am.description, TOKENS_PER_REWRITE);
      if (polished) {
        setAmPolishPreview({ id: am.id, polished });
      }
    } catch { /* ignore */ }
    setPolishingAmId(null);
  }

  function applyAmPolish(am: ContentData["amenities"][0]) {
    if (!content || !amPolishPreview) return;
    const updated = {
      ...content,
      amenities: (content.amenities || []).map((a) =>
        a.id === am.id ? { ...a, description: amPolishPreview.polished } : a
      ),
    };
    saveContent(updated);
    setAmPolishPreview(null);
  }

  const adminStyle = {
    minHeight: "100vh",
    background: "#0f1220",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "#1a2035",
    borderRadius: 12,
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0f1220",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 12,
    outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    background: "#c9a84c",
    color: "#1a2459",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    minHeight: 44,
  };

  const dangerBtn: React.CSSProperties = {
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 6,
    padding: "6px 14px",
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  };

  const aiBtn: React.CSSProperties = {
    background: "rgba(201,168,76,0.15)",
    color: "#c9a84c",
    border: "1px solid rgba(201,168,76,0.3)",
    borderRadius: 8,
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    minHeight: 44,
  };

  const suggestionCard: React.CSSProperties = {
    background: "rgba(201,168,76,0.08)",
    border: "1px solid rgba(201,168,76,0.25)",
    borderRadius: 8,
    padding: "14px 16px",
    cursor: "pointer",
    marginBottom: 10,
    transition: "background 0.15s",
  };

  if (!authed) {
    return (
      <div style={{ ...adminStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...cardStyle, width: "100%", maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#c9a84c", marginBottom: 8 }}>
            The Gathering Hub
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>Admin Panel</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, textAlign: "left" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#c9a84c" }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                Remember me
              </label>
            </div>
            {pwError && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{pwError}</p>}
            <button type="submit" style={{ ...btnStyle, width: "100%", padding: "12px" }}>
              Sign In →
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ ...adminStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading content...</p>
      </div>
    );
  }

  const tokenRemaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
  const tokenPct = Math.round((tokenRemaining / content.tokenBudget.monthlyLimit) * 100);

  const tabs = ["dashboard", "blog", "events", "reviews", "announcements", "amenities"] as const;

  return (
    <div style={adminStyle}>
      {/* Sticky top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#1a2035",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#c9a84c", fontSize: 18, fontWeight: 700 }}>The Gathering Hub</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 12 }}>Admin Panel</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {saveMsg && <span style={{ fontSize: 13 }}>{saveMsg}</span>}
          {/* Token balance pill */}
          <span style={{
            background: tokenPct > 30 ? "rgba(201,168,76,0.12)" : "rgba(248,113,113,0.12)",
            color: tokenPct > 30 ? "#c9a84c" : "#f87171",
            border: `1px solid ${tokenPct > 30 ? "rgba(201,168,76,0.3)" : "rgba(248,113,113,0.3)"}`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            Tokens: {tokenRemaining.toLocaleString()} / {content.tokenBudget.monthlyLimit.toLocaleString()}
          </span>
          <a href="/" target="_blank" style={{ color: "#c9a84c", fontSize: 13, textDecoration: "none" }}>View Site →</a>
          <button
            onClick={handleSignOut}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Sticky scrollable Tab nav */}
      <div style={{ position: "sticky", top: 57, zIndex: 99 }}>
        <div
          ref={navRef}
          style={{
            background: "#141928",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 24px",
            display: "flex",
            gap: 4,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            position: "relative",
          }}
          className="admin-nav"
        >
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#c9a84c" : "transparent",
                color: tab === t ? "#1a2459" : "rgba(255,255,255,0.5)",
                border: "none",
                padding: "0 20px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                minHeight: 48,
                flexShrink: 0,
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {/* gradient fade hint */}
        <div style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 48,
          background: "linear-gradient(to right, transparent, #141928)",
          pointerEvents: "none",
        }} />
      </div>

      <style>{`
        .admin-nav::-webkit-scrollbar { display: none; }
        .admin-nav { -ms-overflow-style: none; }
        .suggestion-card:hover { background: rgba(201,168,76,0.18) !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
              <div style={cardStyle}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{tokenRemaining.toLocaleString()}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Tokens Remaining This Month</div>
                <div style={{ marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${tokenPct}%`, height: "100%", background: tokenPct > 30 ? "#c9a84c" : "#f87171", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{content.tokenBudget.used.toLocaleString()} used / {content.tokenBudget.monthlyLimit.toLocaleString()} limit</div>
              </div>
              <div style={cardStyle}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{content.blogPosts.length}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Blog Posts</div>
              </div>
              <div style={cardStyle}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{content.events.length}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Event Types</div>
              </div>
              <div style={cardStyle}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{content.reviews.length}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Reviews</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Blog Posts</h3>
            {content.blogPosts.slice(0, 3).map((post) => (
              <div key={post.id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{new Date(post.publishedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => editPost(post)} style={{ ...btnStyle, padding: "6px 14px", fontSize: 12 }}>Edit</button>
                  <button onClick={() => deletePost(post.id)} style={dangerBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BLOG EDITOR */}
        {tab === "blog" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              {editingPost ? "Edit Blog Post" : "New Blog Post"}
            </h2>
            <div style={cardStyle}>
              {/* Suggest Post */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>AI can suggest a timely SEO post idea:</span>
                <button
                  onClick={handleSuggestPost}
                  disabled={suggestingPost || tokenRemaining < TOKENS_PER_POST_SUGGESTION}
                  style={aiBtn}
                >
                  {suggestingPost ? "Thinking..." : "💡 Suggest Post"}
                </button>
              </div>
              {postSuggestMsg && (
                <div style={{ fontSize: 13, color: postSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{postSuggestMsg}</div>
              )}
              {postSuggestionOpen && postSuggestion && (
                <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "20px", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>💡 AI Post Suggestion</div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Title (editable)</label>
                  <input
                    style={{ ...inputStyle, marginBottom: 12 }}
                    value={postSuggestionTitle}
                    onChange={(e) => setPostSuggestionTitle(e.target.value)}
                  />
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Outline</div>
                  <ul style={{ margin: "0 0 12px 0", padding: "0 0 0 18px" }}>
                    {postSuggestion.outline.map((item, i) => (
                      <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>SEO Title</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 10, fontStyle: "italic" }}>{postSuggestion.seoTitle}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>SEO Description</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 16 }}>{postSuggestion.seoDescription}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={applyPostSuggestion} style={btnStyle}>✏️ Start Writing</button>
                    <button onClick={() => setPostSuggestionOpen(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 14 }}>Dismiss</button>
                  </div>
                </div>
              )}

              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Post Title</label>
              <input style={inputStyle} placeholder="e.g. 5 Tips for Planning a Baby Shower" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} />

              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Excerpt (shown in blog listing)</label>
              <input style={inputStyle} placeholder="Short summary of the post..." value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} />

              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Body Content</label>
              <textarea
                style={{ ...inputStyle, minHeight: 300, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Write your blog post here. Separate paragraphs with a blank line."
                value={blogBody}
                onChange={(e) => setBlogBody(e.target.value)}
              />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={saveBlogPost} style={btnStyle} disabled={saving}>
                  {saving ? "Saving..." : editingPost ? "Save Changes" : "Publish Post"}
                </button>
                <button
                  onClick={handlePolish}
                  disabled={polishing || tokenRemaining < TOKENS_PER_REWRITE}
                  style={{
                    ...btnStyle,
                    background: polishing ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)",
                    color: "#c9a84c",
                    border: "1px solid rgba(201,168,76,0.4)",
                  }}
                >
                  {polishing ? "Polishing..." : "✨ Polish with AI"}
                </button>
                {editingPost && (
                  <button
                    onClick={() => { setBlogTitle(""); setBlogBody(""); setBlogExcerpt(""); setEditingPost(null); }}
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 14 }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Token budget: <strong style={{ color: "#c9a84c" }}>{tokenRemaining.toLocaleString()}</strong> remaining · ~{TOKENS_PER_REWRITE} per AI rewrite
              </div>
              {polishMsg && <div style={{ marginTop: 12, fontSize: 14, color: polishMsg.startsWith("✅") ? "#4ade80" : polishMsg.startsWith("✨") ? "#c9a84c" : "#f87171" }}>{polishMsg}</div>}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>All Posts</h3>
            {content.blogPosts.length === 0 && <p style={{ color: "rgba(255,255,255,0.4)" }}>No posts yet.</p>}
            {content.blogPosts.map((post) => (
              <div key={post.id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{new Date(post.publishedAt).toLocaleDateString()} · /blog/{post.slug}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => editPost(post)} style={{ ...btnStyle, padding: "6px 14px", fontSize: 12 }}>Edit</button>
                  <button onClick={() => deletePost(post.id)} style={dangerBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS EDITOR */}
        {tab === "events" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Event Types</h2>
              <button
                onClick={handleSuggestEvents}
                disabled={suggestingEvents || tokenRemaining < TOKENS_PER_SUGGESTION}
                style={aiBtn}
              >
                {suggestingEvents ? "Thinking..." : "💡 AI Suggest"}
              </button>
            </div>

            {eventSuggestMsg && (
              <div style={{ fontSize: 13, color: eventSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{eventSuggestMsg}</div>
            )}

            {eventSuggestions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Click a suggestion to auto-fill the form:</div>
                {eventSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-card"
                    style={suggestionCard}
                    onClick={() => setNewEvent({ ...newEvent, title: s.title, description: s.description })}
                  >
                    <div style={{ fontWeight: 600, color: "#c9a84c", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{s.description}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add New Event Type</h3>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
                <input style={inputStyle} placeholder="Emoji" value={newEvent.emoji} onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })} />
                <input style={inputStyle} placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <input style={inputStyle} placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              <button onClick={addEvent} style={btnStyle}>Add Event Type</button>
            </div>

            {content.events.map((ev) => (
              <div key={ev.id} style={{ ...cardStyle }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{ev.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{ev.description}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    <button
                      onClick={() => handlePolishEvent(ev)}
                      disabled={polishingEventId === ev.id || tokenRemaining < TOKENS_PER_REWRITE}
                      style={aiBtn}
                    >
                      {polishingEventId === ev.id ? "Polishing..." : "✨ Polish"}
                    </button>
                    <button onClick={() => deleteEvent(ev.id)} style={dangerBtn}>Delete</button>
                  </div>
                </div>
                {eventPolishPreview?.id === ev.id && (
                  <div style={{ marginTop: 14, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 12, color: "#c9a84c", marginBottom: 6, fontWeight: 600 }}>✨ AI Polish Preview</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>{eventPolishPreview.polished}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => applyEventPolish(ev)} style={{ ...btnStyle, padding: "6px 16px", fontSize: 13 }}>Apply</button>
                      <button onClick={() => setEventPolishPreview(null)} style={{ ...dangerBtn }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS EDITOR */}
        {tab === "reviews" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Reviews</h2>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add New Review</h3>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={newReview.stars}
                onChange={(e) => setNewReview({ ...newReview, stars: Number(e.target.value) })}
              >
                {[5, 4, 3].map((n) => <option key={n} value={n}>{n} Stars {"★".repeat(n)}</option>)}
              </select>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                placeholder="Review text..."
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              />
              <input style={inputStyle} placeholder="Author name (e.g. Facebook Reviewer)" value={newReview.author} onChange={(e) => setNewReview({ ...newReview, author: e.target.value })} />
              <button onClick={addReview} style={btnStyle}>Add Review</button>
            </div>

            {content.reviews.map((rv) => (
              <div key={rv.id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#c9a84c", marginBottom: 6 }}>{"★".repeat(rv.stars)}</div>
                  <div style={{ fontStyle: "italic", color: "rgba(255,255,255,0.8)", marginBottom: 8, fontSize: 14 }}>&ldquo;{rv.text}&rdquo;</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>— {rv.author}</div>
                </div>
                <button onClick={() => deleteReview(rv.id)} style={{ ...dangerBtn, flexShrink: 0, marginLeft: 16 }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Announcements</h2>
              <button
                onClick={handleSuggestAnnouncements}
                disabled={suggestingAnnouncements || tokenRemaining < TOKENS_PER_SUGGESTION}
                style={aiBtn}
              >
                {suggestingAnnouncements ? "Thinking..." : "💡 AI Suggest"}
              </button>
            </div>

            {annSuggestMsg && (
              <div style={{ fontSize: 13, color: annSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{annSuggestMsg}</div>
            )}

            {announcementSuggestions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Click a suggestion to auto-fill the form:</div>
                {announcementSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-card"
                    style={suggestionCard}
                    onClick={() => setNewAnnouncement({ ...newAnnouncement, body: s.text })}
                  >
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{s.text}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add Announcement</h3>
              <input style={inputStyle} placeholder="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                placeholder="Announcement body..."
                value={newAnnouncement.body}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <input type="checkbox" id="active" checked={newAnnouncement.active} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, active: e.target.checked })} />
                <label htmlFor="active" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Active (shown on site)</label>
              </div>
              <button onClick={addAnnouncement} style={btnStyle}>Add Announcement</button>
            </div>

            {content.announcements.map((ann) => (
              <div key={ann.id} style={{ ...cardStyle }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{ann.title}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: ann.active ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)", color: ann.active ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
                        {ann.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{ann.body}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button
                      onClick={() => handlePolishAnnouncement(ann)}
                      disabled={polishingAnnId === ann.id || tokenRemaining < TOKENS_PER_REWRITE}
                      style={aiBtn}
                    >
                      {polishingAnnId === ann.id ? "Polishing..." : "✨ Polish"}
                    </button>
                    <button onClick={() => deleteAnnouncement(ann.id)} style={dangerBtn}>Delete</button>
                  </div>
                </div>
                {annPolishPreview?.id === ann.id && (
                  <div style={{ marginTop: 14, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 12, color: "#c9a84c", marginBottom: 6, fontWeight: 600 }}>✨ AI Polish Preview</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>{annPolishPreview.polished}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => applyAnnPolish(ann)} style={{ ...btnStyle, padding: "6px 16px", fontSize: 13 }}>Apply</button>
                      <button onClick={() => setAnnPolishPreview(null)} style={{ ...dangerBtn }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AMENITIES */}
        {tab === "amenities" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Amenities</h2>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add New Amenity</h3>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
                <input style={inputStyle} placeholder="Icon" value={newAmenity.icon} onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })} />
                <input style={inputStyle} placeholder="Amenity Title" value={newAmenity.title} onChange={(e) => setNewAmenity({ ...newAmenity, title: e.target.value })} />
              </div>
              <input style={inputStyle} placeholder="Description" value={newAmenity.description} onChange={(e) => setNewAmenity({ ...newAmenity, description: e.target.value })} />
              <button onClick={addAmenity} style={btnStyle}>Add Amenity</button>
            </div>

            {(content.amenities || []).map((am) => (
              <div key={am.id} style={{ ...cardStyle }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{am.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{am.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{am.description}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    <button
                      onClick={() => handlePolishAmenity(am)}
                      disabled={polishingAmId === am.id || tokenRemaining < TOKENS_PER_REWRITE}
                      style={aiBtn}
                    >
                      {polishingAmId === am.id ? "Polishing..." : "✨ Polish"}
                    </button>
                    <button onClick={() => deleteAmenity(am.id)} style={dangerBtn}>Delete</button>
                  </div>
                </div>
                {amPolishPreview?.id === am.id && (
                  <div style={{ marginTop: 14, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 12, color: "#c9a84c", marginBottom: 6, fontWeight: 600 }}>✨ AI Polish Preview</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>{amPolishPreview.polished}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => applyAmPolish(am)} style={{ ...btnStyle, padding: "6px 16px", fontSize: 13 }}>Apply</button>
                      <button onClick={() => setAmPolishPreview(null)} style={{ ...dangerBtn }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
