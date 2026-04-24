"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <nav>
      <Link href="/" className="nav-logo">
        <div className="nav-logo-text">
          <div className="name">The Gathering Hub</div>
          <div className="sub">Ithaca, Michigan</div>
        </div>
      </Link>
      <button className="hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <ul className={`nav-links${navOpen ? " open" : ""}`}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/#events">Events</Link></li>
        <li><Link href="/#about">About</Link></li>
        <li><Link href="/menu">Menu & Gallery</Link></li>
        <li><Link href="/menu/catering">Catering Menu</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/#contact" className="nav-cta">Book Now</Link></li>
      </ul>
    </nav>
  );
}
