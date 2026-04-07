"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "GatheringHub2026!";
const TOKENS_PER_REWRITE = 1500;
const TOKENS_PER_SUGGESTION = 1000;
const TOKENS_PER_POST_SUGGESTION = 2000;

type ContentData = {
  settings: { siteName: string; phone: string; email: string; address: string };
  aiProfile?: {
    tone: string;
    audience: string;
    approvedFacts: string;
    avoidClaims: string;
    seasonalFocus: string;
    voiceProfile?: string;
    writingDo?: string;
    writingAvoid?: string;
  };
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
  fullDraft?: string;
  whyThisFits?: string;
};

type PostRegenerateMode = "fresh" | "new_topic" | "more_polished" | "more_friendly";
type EventSuggestion = {
  emoji: string;
  title: string;
  description: string;
  seasons?: string[];
};

const EVENT_IDEA_BANK: EventSuggestion[] = [
  { emoji: "🍼", title: "Baby Showers", description: "A warm, easy space for showers with room for gifts, desserts, and time together.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "🎓", title: "Graduation Parties", description: "Celebrate graduates with a flexible setup for family photos, food, and a relaxed open-house flow.", seasons: ["spring", "summer"] },
  { emoji: "💍", title: "Bridal Showers", description: "Create a charming setting for showers, brunches, and meaningful time with family and friends.", seasons: ["spring", "summer", "fall"] },
  { emoji: "🎂", title: "Birthday Gatherings", description: "A comfortable venue for milestone birthdays, family parties, and casual celebrations of all sizes.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "👶", title: "Family Celebrations", description: "Host reunions, anniversaries, and other family occasions in a welcoming space that feels easy to enjoy.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "🤝", title: "Community Gatherings", description: "Bring neighbors, volunteers, or local groups together for meetings, celebrations, and shared events.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "🏢", title: "Small Business Events", description: "Use the space for team celebrations, customer appreciation nights, workshops, or simple business gatherings.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "🍽️", title: "Private Dinners", description: "Offer a cozy setting for private meals, rehearsal dinners, and special evenings built around good food and conversation.", seasons: ["fall", "winter", "spring"] },
  { emoji: "🌸", title: "Seasonal Brunches", description: "A bright, welcoming setup for spring brunches, Mother's Day gatherings, and daytime celebrations.", seasons: ["spring"] },
  { emoji: "🎄", title: "Holiday Parties", description: "Give families, friends, and local groups a festive space for end-of-year gatherings and seasonal celebrations.", seasons: ["fall", "winter"] },
  { emoji: "🎨", title: "Creative Workshops", description: "Host small classes, craft nights, or community workshops in a space that feels relaxed and inviting.", seasons: ["spring", "summer", "fall", "winter"] },
  { emoji: "🛍️", title: "Vendor Pop-Ups", description: "Welcome local makers, specialty vendors, and community shopping events with a flexible event setup.", seasons: ["spring", "summer", "fall"] },
];

function normalizeContent(content: ContentData): ContentData {
  return {
    ...content,
    aiProfile: content.aiProfile ?? {
      tone: "Warm, welcoming, professional, community-focused",
      audience: "Families, local hosts, community organizers, and people planning private events in the Ithaca area",
      approvedFacts: "",
      avoidClaims: "",
      seasonalFocus: "",
      voiceProfile: "",
      writingDo: "",
      writingAvoid: "",
    },
    events: content.events ?? [],
    amenities: content.amenities ?? [],
    reviews: content.reviews ?? [],
    announcements: content.announcements ?? [],
    blogPosts: content.blogPosts ?? [],
    tokenBudget: content.tokenBudget ?? {
      monthlyLimit: 50000,
      used: 0,
      resetMonth: new Date().toISOString().slice(0, 7),
    },
  };
}

function getSeasonForDate(date: Date) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

function buildEventIdeaSuggestions(content: ContentData, previousTitles: string[]): EventSuggestion[] {
  const season = getSeasonForDate(new Date());
  const existingTitles = new Set(content.events.map((event) => event.title.trim().toLowerCase()));
  const recentTitles = new Set(previousTitles.map((title) => title.trim().toLowerCase()));

  const seasonMatches = EVENT_IDEA_BANK.filter((idea) => {
    const title = idea.title.trim().toLowerCase();
    return !existingTitles.has(title) && !recentTitles.has(title) && (!idea.seasons || idea.seasons.includes(season));
  });

  const fallbackMatches = EVENT_IDEA_BANK.filter((idea) => {
    const title = idea.title.trim().toLowerCase();
    return !existingTitles.has(title) && !recentTitles.has(title);
  });

  const pool = seasonMatches.length >= 3 ? seasonMatches : fallbackMatches;
  return pool.slice(0, 4);
}

function AdminPageInner() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<"overview" | "blog" | "events" | "reviews" | "announcements" | "amenities">("overview");
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
  const [postRegenerateMode, setPostRegenerateMode] = useState<PostRegenerateMode>("fresh");
  const [postRetryMenuOpen, setPostRetryMenuOpen] = useState(false);
  const [postSuggestProgress, setPostSuggestProgress] = useState(0);
  const [buildingVoice, setBuildingVoice] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState("");
  const [voiceToolsOpen, setVoiceToolsOpen] = useState(false);

  // Event editor
  const [newEvent, setNewEvent] = useState({ title: "", emoji: "🎉", description: "" });
  // AI Suggest events
  const [suggestingEvents, setSuggestingEvents] = useState(false);
  const [eventSuggestions, setEventSuggestions] = useState<EventSuggestion[]>([]);
  const [eventSuggestionHistory, setEventSuggestionHistory] = useState<string[]>([]);
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

  function openPublicPath(pathname: string) {
    if (typeof window === "undefined") return;
    window.open(pathname, "_blank", "noopener,noreferrer");
  }

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

  useEffect(() => {
    if (!suggestingPost) {
      setPostSuggestProgress(0);
      return;
    }
    setPostSuggestProgress(12);
    const interval = window.setInterval(() => {
      setPostSuggestProgress((current) => {
        if (current >= 88) return current;
        return Math.min(88, current + (current < 40 ? 10 : current < 70 ? 6 : 3));
      });
    }, 280);
    return () => window.clearInterval(interval);
  }, [suggestingPost]);

  async function loadContent() {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setContent(normalizeContent(data));
    } catch {
      console.error("Failed to load content");
    }
  }

  async function handleBuildVoiceProfile() {
    if (!content) return;
    setBuildingVoice(true);
    setVoiceMsg("Building a voice profile from the site...");
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action: "build_voice_profile" }),
      });
      const data = await res.json();
      if (data.aiProfile) {
        const updated = { ...content, aiProfile: { ...content.aiProfile, ...data.aiProfile } };
        setContent(updated);
        await saveContent(updated);
        setVoiceMsg("✅ Voice profile updated.");
      } else {
        setVoiceMsg("❌ Voice build failed.");
      }
    } catch {
      setVoiceMsg("❌ Voice build failed.");
    }
    setBuildingVoice(false);
    setTimeout(() => setVoiceMsg(""), 4000);
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

  async function handleSuggestPost(mode: PostRegenerateMode = "fresh") {
    if (!content) return;
    const remaining = content.tokenBudget.monthlyLimit - content.tokenBudget.used;
    if (remaining < TOKENS_PER_POST_SUGGESTION) {
      setPostSuggestMsg("❌ Not enough token budget.");
      return;
    }
    setSuggestingPost(true);
    setPostRegenerateMode(mode);
    setPostRetryMenuOpen(false);
    setPostSuggestMsg(
      mode === "fresh"
        ? "🔍 Generating SEO post idea..."
        : mode === "new_topic"
          ? "🔄 Trying a different topic..."
          : mode === "more_polished"
            ? "✨ Making it more polished..."
            : "😊 Making it feel more welcoming..."
    );
    setPostSuggestionOpen(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          content: "The Gathering Hub, event venue, Ithaca MI",
          action: "suggest_post",
          regenerateMode: mode,
          previousSuggestion: postSuggestion
            ? {
                title: postSuggestionTitle || postSuggestion.title,
                seoTitle: postSuggestion.seoTitle,
                seoDescription: postSuggestion.seoDescription,
                whyThisFits: postSuggestion.whyThisFits,
              }
            : null,
        }),
      });
      const data = await res.json();
      if (data.suggestion?.title) {
        setPostSuggestion(data.suggestion);
        setPostSuggestionTitle(data.suggestion.title);
        setPostSuggestionOpen(true);
        setPostSuggestProgress(100);
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
    const starter = postSuggestion.fullDraft?.trim()
      ? postSuggestion.fullDraft
      : `${postSuggestionTitle}\n\n${outlineText}\n\n[Start writing here...]`;
    setBlogTitle(postSuggestionTitle);
    setBlogExcerpt(postSuggestion.seoDescription || "");
    setBlogBody(starter);
    setPostSuggestionOpen(false);
    setPostSuggestion(null);
    setPostSuggestMsg("");
    setPostRetryMenuOpen(false);
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
    setPostSuggestion(null);
    setPostSuggestionOpen(false);
    setPostRetryMenuOpen(false);
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
      setEventSuggestMsg("❌ Not enough monthly idea refreshes left.");
      return;
    }
    setSuggestingEvents(true);
    setEventSuggestMsg("✨ Pulling together fresh event ideas...");
    const suggestions = buildEventIdeaSuggestions(content, eventSuggestionHistory);
    if (suggestions.length > 0) {
      setEventSuggestions(suggestions);
      setEventSuggestionHistory((current) => [...current, ...suggestions.map((idea) => idea.title)].slice(-24));
      const updated = {
        ...content,
        tokenBudget: { ...content.tokenBudget, used: content.tokenBudget.used + TOKENS_PER_SUGGESTION },
      };
      setContent(updated);
      setEventSuggestMsg("");
    } else {
      setEventSuggestMsg("❌ You’ve already seen the current event idea bank. Add one or two, then rotate again later.");
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
    background: "radial-gradient(circle at top left, rgba(201,168,76,0.12), transparent 24%), radial-gradient(circle at top right, rgba(84,102,190,0.18), transparent 28%), linear-gradient(180deg, #0d1020 0%, #11162a 42%, #0c1120 100%)",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(25,32,54,0.94) 0%, rgba(18,24,44,0.96) 100%)",
    borderRadius: 18,
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.03)",
    backdropFilter: "blur(14px)",
    marginBottom: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(9,12,24,0.78)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 12,
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
  };

  const btnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #d4b25b 0%, #b88f33 100%)",
    color: "#10172f",
    border: "none",
    borderRadius: 12,
    padding: "11px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    minHeight: 44,
    boxShadow: "0 12px 28px rgba(201,168,76,0.22)",
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
    background: "linear-gradient(180deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.1) 100%)",
    color: "#f2d78c",
    border: "1px solid rgba(201,168,76,0.28)",
    borderRadius: 12,
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    minHeight: 44,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
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
        <div style={{ ...cardStyle, width: "100%", maxWidth: 460, textAlign: "center", padding: "34px 30px 30px", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            inset: "auto -30px -40px auto",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 72%)",
            pointerEvents: "none",
          }} />
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f3d57b", fontWeight: 700, marginBottom: 12 }}>
            Customer Portal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#c9a84c", marginBottom: 8 }}>
            The Gathering Hub
          </h1>
          <p style={{ color: "rgba(255,255,255,0.56)", margin: "0 auto 28px", maxWidth: 320, lineHeight: 1.65 }}>
            Update your site, publish new posts, and keep everything feeling current without touching the code.
          </p>
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
              Enter Portal →
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

  const tokenBudget = content.tokenBudget;
  const tokenRemaining = tokenBudget.monthlyLimit - tokenBudget.used;
  const tokenPct = Math.round((tokenRemaining / tokenBudget.monthlyLimit) * 100);
  const monthlyAiActions = Math.max(1, Math.floor(tokenBudget.monthlyLimit / TOKENS_PER_REWRITE));
  const aiActionsUsed = Math.min(monthlyAiActions, Math.ceil(tokenBudget.used / TOKENS_PER_REWRITE));
  const aiActionsRemaining = Math.max(0, monthlyAiActions - aiActionsUsed);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const blogPostsThisMonth = content.blogPosts.filter((post) => {
    const published = new Date(post.publishedAt);
    return published.getMonth() === currentMonth && published.getFullYear() === currentYear;
  }).length;
  const monthlyBlogDraftLimit = 4;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "blog", label: "Blog" },
    { id: "events", label: "Events" },
    { id: "announcements", label: "Quick Updates" },
    { id: "amenities", label: "Venue" },
    { id: "reviews", label: "Reviews" },
  ] as const;

  const ghostBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.82)",
    borderRadius: 12,
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    backdropFilter: "blur(8px)",
  };

  const usageCard: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.025) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "14px 16px",
    minWidth: 180,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  };

  function renderSectionIntro(
    title: string,
    description: string,
    actions?: React.ReactNode,
    usage?: React.ReactNode,
  ) {
    return (
      <div style={{ ...cardStyle, marginBottom: 24, padding: "24px 24px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 68%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9a84c", fontWeight: 700, marginBottom: 8 }}>
              Customer Portal
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{description}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {actions}
          </div>
        </div>
        {usage && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            {usage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={adminStyle}>
      {/* Sticky top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(12,16,31,0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
      }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#d4b25b", fontSize: 19, fontWeight: 700 }}>The Gathering Hub</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Customer Portal</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {saveMsg && <span style={{ fontSize: 13 }}>{saveMsg}</span>}
          <span style={{
            background: tokenPct > 30 ? "rgba(201,168,76,0.12)" : "rgba(248,113,113,0.12)",
            color: tokenPct > 30 ? "#f3d57b" : "#f87171",
            border: `1px solid ${tokenPct > 30 ? "rgba(201,168,76,0.3)" : "rgba(248,113,113,0.3)"}`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            AI helps left: {aiActionsRemaining} / {monthlyAiActions}
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
            background: "rgba(14,19,36,0.88)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 24px 10px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            position: "relative",
          }}
          className="admin-nav"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? "linear-gradient(135deg, #d4b25b 0%, #b88f33 100%)" : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "#10172f" : "rgba(255,255,255,0.62)",
                border: tab === t.id ? "none" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 999,
                padding: "0 18px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: 40,
                flexShrink: 0,
                boxShadow: tab === t.id ? "0 10px 22px rgba(201,168,76,0.2)" : "none",
              }}
            >
              {t.label}
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

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px 56px" }}>

        {tab === "overview" && (
          <div>
            {renderSectionIntro(
              "Overview",
              "Everything important in one place. Update your site, keep an eye on monthly AI usage, and jump into the area you want to change.",
              <>
                <button onClick={() => openPublicPath("/")} style={ghostBtn}>View Live Site</button>
                <button onClick={() => setTab("blog")} style={btnStyle}>Write New</button>
              </>,
              <>
                <div style={usageCard}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Monthly AI help</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{aiActionsRemaining} / {monthlyAiActions}</div>
                </div>
                <div style={usageCard}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Blog posts this month</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{Math.min(blogPostsThisMonth, monthlyBlogDraftLimit)} / {monthlyBlogDraftLimit}</div>
                </div>
              </>,
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
              <div style={{ ...cardStyle, background: "linear-gradient(160deg, rgba(201,168,76,0.16) 0%, rgba(29,37,64,0.96) 65%)" }}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{aiActionsRemaining}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>AI Helps Left This Month</div>
                <div style={{ marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${tokenPct}%`, height: "100%", background: tokenPct > 30 ? "#c9a84c" : "#f87171", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>Resets monthly with your plan</div>
              </div>
              <div style={{ ...cardStyle, background: "linear-gradient(160deg, rgba(73,124,214,0.12) 0%, rgba(25,32,54,0.96) 65%)" }}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{blogPostsThisMonth}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Posts Published This Month</div>
              </div>
              <div style={{ ...cardStyle, background: "linear-gradient(160deg, rgba(95,170,135,0.12) 0%, rgba(25,32,54,0.96) 65%)" }}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{content.events.length}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Event Types</div>
              </div>
              <div style={{ ...cardStyle, background: "linear-gradient(160deg, rgba(152,110,197,0.12) 0%, rgba(25,32,54,0.96) 65%)" }}>
                <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{content.reviews.length}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Reviews</div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 18 }}>
                <button onClick={() => setTab("blog")} style={{ ...ghostBtn, justifyContent: "flex-start", padding: "14px 16px", minHeight: 72, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f3d57b", fontWeight: 700 }}>Start Here</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Write or generate a new post</span>
                </button>
                <button onClick={() => setTab("events")} style={{ ...ghostBtn, justifyContent: "flex-start", padding: "14px 16px", minHeight: 72, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f3d57b", fontWeight: 700 }}>Seasonal</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Refresh events and updates</span>
                </button>
                <button onClick={() => openPublicPath("/")} style={{ ...ghostBtn, justifyContent: "flex-start", padding: "14px 16px", minHeight: 72, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f3d57b", fontWeight: 700 }}>Live Site</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Preview what guests see</span>
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>🤖 AI Voice Tools</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                    Keep this tucked away unless you’re tuning how the AI writes. It helps the assistant stay on-brand without taking over the page.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setVoiceToolsOpen((open) => !open)}
                    style={ghostBtn}
                  >
                    {voiceToolsOpen ? "Hide Robot Notes" : "Show Robot Notes"}
                  </button>
                  <button
                    onClick={handleBuildVoiceProfile}
                    style={ghostBtn}
                    disabled={buildingVoice}
                  >
                    {buildingVoice ? "Building..." : "Build Voice From Site"}
                  </button>
                </div>
              </div>
              {voiceMsg && <div style={{ fontSize: 13, color: voiceMsg.startsWith("✅") ? "#4ade80" : voiceMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 12 }}>{voiceMsg}</div>}
              {voiceToolsOpen && (
                <>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Business tone</label>
                  <input
                    style={inputStyle}
                    value={content.aiProfile?.tone ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, tone: e.target.value } })}
                    placeholder="Warm, polished, family-friendly, community-focused"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Target audience</label>
                  <input
                    style={inputStyle}
                    value={content.aiProfile?.audience ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, audience: e.target.value } })}
                    placeholder="Who the content should speak to"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Approved facts AI may use</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    value={content.aiProfile?.approvedFacts ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, approvedFacts: e.target.value } })}
                    placeholder="Confirmed facts, services, offerings, or recurring themes that are safe to mention"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Claims AI must avoid</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    value={content.aiProfile?.avoidClaims ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, avoidClaims: e.target.value } })}
                    placeholder="Anything that should never be promised or invented"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Seasonal priorities</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 70, resize: "vertical", marginBottom: 0 }}
                    value={content.aiProfile?.seasonalFocus ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, seasonalFocus: e.target.value } })}
                    placeholder="Current priorities for this season or quarter"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", margin: "16px 0 6px" }}>Voice character</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    value={content.aiProfile?.voiceProfile ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, voiceProfile: e.target.value } })}
                    placeholder="Who the site sounds like in plain English"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>What the writing should do</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    value={content.aiProfile?.writingDo ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, writingDo: e.target.value } })}
                    placeholder="Helpful habits to keep the voice consistent"
                  />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>What the writing should avoid</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical", marginBottom: 12 }}
                    value={content.aiProfile?.writingAvoid ?? ""}
                    onChange={(e) => setContent({ ...content, aiProfile: { ...content.aiProfile!, writingAvoid: e.target.value } })}
                    placeholder="Salesy habits, risky claims, and things that break trust"
                  />
                  <button
                    onClick={() => content && saveContent(content)}
                    style={btnStyle}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Robot Notes"}
                  </button>
                </>
              )}
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
            {renderSectionIntro(
              editingPost ? "Edit Blog Post" : "Blog",
              "Write a post yourself, generate a starting draft with AI, or polish what you already wrote before publishing it.",
              <>
                <button
                  onClick={() => handleSuggestPost("fresh")}
                  disabled={suggestingPost || tokenRemaining < TOKENS_PER_POST_SUGGESTION}
                  style={aiBtn}
                >
                  {suggestingPost ? "Thinking..." : "Generate New"}
                </button>
                <button
                  onClick={() => {
                    setBlogTitle("");
                    setBlogBody("");
                    setBlogExcerpt("");
                    setEditingPost(null);
                    setPostSuggestion(null);
                    setPostSuggestionOpen(false);
                    setPostSuggestMsg("");
                    setPostRetryMenuOpen(false);
                  }}
                  style={btnStyle}
                >
                  Write New
                </button>
                <button onClick={() => openPublicPath("/blog")} style={ghostBtn}>View Live Blog</button>
              </>,
              <>
                <div style={usageCard}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Blog posts this month</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{Math.min(blogPostsThisMonth, monthlyBlogDraftLimit)} / {monthlyBlogDraftLimit}</div>
                </div>
                <div style={usageCard}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>AI help left</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{aiActionsRemaining} / {monthlyAiActions}</div>
                </div>
              </>,
            )}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Need help getting started? Use AI to make a first draft, then edit it in your own voice.</span>
              </div>
              {postSuggestMsg && (
                <div style={{ fontSize: 13, color: postSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{postSuggestMsg}</div>
              )}
              {suggestingPost && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
                    <div
                      style={{
                        width: `${postSuggestProgress}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #c9a84c 0%, #f3d57b 100%)",
                        transition: "width 260ms ease",
                        boxShadow: "0 0 18px rgba(201,168,76,0.35)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
                    Building a draft in your brand voice and checking for SEO fit.
                  </div>
                </div>
              )}
              {postSuggestionOpen && postSuggestion && (
                <div style={{ background: "linear-gradient(160deg, rgba(201,168,76,0.08) 0%, rgba(30,38,63,0.96) 62%)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "22px", marginBottom: 20, boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#f3d57b", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Editorial Draft</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.58)", maxWidth: 420 }}>
                        A suggested post shaped around your voice, local search intent, and what feels timely for the business right now.
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "6px 12px", fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                      SEO-guided draft
                    </div>
                  </div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Title (editable)</label>
                  <input
                    style={{ ...inputStyle, marginBottom: 12 }}
                    value={postSuggestionTitle}
                    onChange={(e) => setPostSuggestionTitle(e.target.value)}
                  />
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Talking points</div>
                  <ul style={{ margin: "0 0 12px 0", padding: "0 0 0 18px" }}>
                    {postSuggestion.outline.map((item, i) => (
                      <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>SEO Title</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 10, fontStyle: "italic" }}>{postSuggestion.seoTitle}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>SEO Description</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 16 }}>{postSuggestion.seoDescription}</div>
                  {postSuggestion.whyThisFits && (
                    <>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Why this fits</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginBottom: 16 }}>{postSuggestion.whyThisFits}</div>
                    </>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    <button onClick={applyPostSuggestion} style={btnStyle}>Accept</button>
                    <button
                      onClick={() => {
                        setPostSuggestionOpen(false);
                        setPostRetryMenuOpen(false);
                      }}
                      style={ghostBtn}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setPostRetryMenuOpen((open) => !open)}
                      style={ghostBtn}
                    >
                      Retry
                    </button>
                  </div>
                  {postRetryMenuOpen && (
                    <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Retry options</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleSuggestPost("new_topic")}
                          disabled={suggestingPost || tokenRemaining < TOKENS_PER_POST_SUGGESTION}
                          style={ghostBtn}
                        >
                          New topic
                        </button>
                        <button
                          onClick={() => handleSuggestPost("more_polished")}
                          disabled={suggestingPost || tokenRemaining < TOKENS_PER_POST_SUGGESTION}
                          style={ghostBtn}
                        >
                          Change tone
                        </button>
                        <button
                          onClick={() => handleSuggestPost("more_friendly")}
                          disabled={suggestingPost || tokenRemaining < TOKENS_PER_POST_SUGGESTION}
                          style={ghostBtn}
                        >
                          More friendly
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(!postSuggestionOpen || editingPost || blogTitle || blogBody || blogExcerpt) && (
                <>
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
                        style={ghostBtn}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    Monthly AI help left: <strong style={{ color: "#c9a84c" }}>{aiActionsRemaining}</strong> of {monthlyAiActions}
                  </div>
                  {polishMsg && <div style={{ marginTop: 12, fontSize: 14, color: polishMsg.startsWith("✅") ? "#4ade80" : polishMsg.startsWith("✨") ? "#c9a84c" : "#f87171" }}>{polishMsg}</div>}
                </>
              )}
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
            {renderSectionIntro(
              "Events",
              "Show the kinds of gatherings you host, rotate through strong booking ideas, and keep this page focused on what people can actually reserve here.",
              <>
                <button
                  onClick={handleSuggestEvents}
                  disabled={suggestingEvents || tokenRemaining < TOKENS_PER_SUGGESTION}
                  style={aiBtn}
                >
                  {suggestingEvents ? "Gathering ideas..." : eventSuggestions.length > 0 ? "Rotate Ideas" : "Generate Event Ideas"}
                </button>
                <button onClick={() => openPublicPath("/events")} style={ghostBtn}>View Live Events</button>
              </>,
              <div style={usageCard}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Idea refreshes left</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{aiActionsRemaining} / {monthlyAiActions}</div>
              </div>,
            )}

            {eventSuggestMsg && (
              <div style={{ fontSize: 13, color: eventSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{eventSuggestMsg}</div>
            )}

            {eventSuggestions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Pick an idea to pre-fill the event card with booking-friendly copy:</div>
                {eventSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-card"
                    style={suggestionCard}
                    onClick={() => setNewEvent({ ...newEvent, emoji: s.emoji, title: s.title, description: s.description })}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 22 }}>{s.emoji}</span>
                        <div style={{ fontWeight: 600, color: "#c9a84c" }}>{s.title}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Use this</div>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{s.description}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add Your Own Event Idea</h3>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
                <input style={inputStyle} placeholder="Emoji" value={newEvent.emoji} onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })} />
                <input style={inputStyle} placeholder="Event idea title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <input style={inputStyle} placeholder="Short booking-friendly description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              <button onClick={addEvent} style={btnStyle}>Save Event Idea</button>
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
            {renderSectionIntro(
              "Reviews",
              "Keep the best social proof on the site. Add a new review, remove outdated ones, and keep this section current.",
              <button onClick={() => openPublicPath("/")} style={ghostBtn}>View Live Site</button>,
            )}
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
            {renderSectionIntro(
              "Quick Updates",
              "Use this for timely notices guests should see right now, like holiday hours, booking reminders, specials, or temporary changes on the homepage.",
              <>
                <button
                  onClick={handleSuggestAnnouncements}
                  disabled={suggestingAnnouncements || tokenRemaining < TOKENS_PER_SUGGESTION}
                  style={aiBtn}
                >
                  {suggestingAnnouncements ? "Writing..." : "Generate Notice"}
                </button>
                <button onClick={() => openPublicPath("/")} style={ghostBtn}>View Homepage</button>
              </>,
              <div style={usageCard}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Notice refreshes left</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{aiActionsRemaining} / {monthlyAiActions}</div>
              </div>,
            )}

            {annSuggestMsg && (
              <div style={{ fontSize: 13, color: annSuggestMsg.startsWith("❌") ? "#f87171" : "#c9a84c", marginBottom: 16 }}>{annSuggestMsg}</div>
            )}

            {announcementSuggestions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Pick a notice to pre-fill the form below:</div>
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
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Add a Quick Update</h3>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", marginBottom: 16, lineHeight: 1.6 }}>
                Good uses: holiday hours, private-event closures, booking reminders, seasonal specials, or a short note guests should see before visiting.
              </div>
              <input style={inputStyle} placeholder="Short headline" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                placeholder="Write the short guest-facing notice..."
                value={newAnnouncement.body}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <input type="checkbox" id="active" checked={newAnnouncement.active} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, active: e.target.checked })} />
                <label htmlFor="active" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Active on homepage</label>
              </div>
              <button onClick={addAnnouncement} style={btnStyle}>Save Quick Update</button>
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
            {renderSectionIntro(
              "Venue Details",
              "Update the features and highlights customers should know about when they’re deciding whether to book your space.",
              <button onClick={() => openPublicPath("/")} style={ghostBtn}>View Live Site</button>,
              <div style={usageCard}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>AI help left</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{aiActionsRemaining} / {monthlyAiActions}</div>
              </div>,
            )}
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

export default dynamic(() => Promise.resolve(AdminPageInner), {
  ssr: false,
});
