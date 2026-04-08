"use client";
import { useState } from "react";

export default function Nav() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <nav>
      <a href="/" className="nav-logo">
        <div className="nav-logo-text">
          <div className="name">The Gathering Hub</div>
          <div className="sub">Ithaca, Michigan</div>
        </div>
      </a>
      <button className="hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <ul className={`nav-links${navOpen ? " open" : ""}`}>
        <li><a href="/">Home</a></li>
        <li><a href="/#events">Events</a></li>
        <li><a href="/upcoming">Upcoming</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/menu">Menu</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/#contact" className="nav-cta">Book Now</a></li>
      </ul>
    </nav>
  );
}
