"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href;
  }

  function handleNavClick() {
    setNavOpen(false);
  }

  return (
    <nav>
      <a href="/" className="nav-logo">
        <img
          src="/images/gatheringhub-logo.jpg"
          alt="The Gathering Hub logo"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.16)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.16)",
          }}
        />
        <div className="nav-logo-text">
          <div className="name">The Gathering Hub</div>
          <div className="sub">Ithaca, Michigan</div>
        </div>
      </a>
      <button
        className="hamburger"
        onClick={() => setNavOpen(!navOpen)}
        aria-label="Menu"
        aria-controls="primary-navigation"
        aria-expanded={navOpen}
      >
        <span /><span /><span />
      </button>
      <ul id="primary-navigation" className={`nav-links${navOpen ? " open" : ""}`}>
        <li><a href="/" onClick={handleNavClick} className={isActive("/") ? "active" : ""}>Home</a></li>
        <li><a href="/#events" onClick={handleNavClick} className={isActive("/#events") ? "active" : ""}>Events</a></li>
        <li><a href="/upcoming" onClick={handleNavClick} className={isActive("/upcoming") ? "active" : ""}>Upcoming</a></li>
        <li><a href="/#about" onClick={handleNavClick} className={isActive("/#about") ? "active" : ""}>About</a></li>
        <li><a href="/gallery" onClick={handleNavClick} className={isActive("/gallery") ? "active" : ""}>Gallery</a></li>
        <li><a href="/menu" onClick={handleNavClick} className={isActive("/menu") ? "active" : ""}>Menu</a></li>
        <li><a href="/blog" onClick={handleNavClick} className={isActive("/blog") ? "active" : ""}>Blog</a></li>
        <li><a href="/#contact" onClick={handleNavClick} className="nav-cta">Book Now</a></li>
      </ul>
    </nav>
  );
}
