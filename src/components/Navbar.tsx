"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { site } from "@/data/site";

const links = [
  ["About", "/about"],
  ["Events", "/events"],
  ["Activities", "/activities"],
  ["Members", "/members"],
  ["Classes", "/classes"],
  ["Blog", "/blog"],
  ["Terms", "/terms"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <nav className="nav-inner">
        <Link href="/" className="brand-combined" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="Serenade Singers Icon" width={52} height={52} className="navbar-icon-logo" />
          <Image src="/hero-logo.png" alt="Serenade Singers" width={180} height={80} priority className="navbar-full-logo" />
        </Link>

        <div className="nav-links desktop-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>

        <div className="nav-actions desktop-actions">
          <a className="social-icon" href={site.facebook} target="_blank" aria-label="Facebook">
            <Image src="/icons/facebook.svg" alt="Facebook" width={16} height={16} />
          </a>
          <a className="social-icon" href={site.instagram} target="_blank" aria-label="Instagram">
            <Image src="/icons/instagram.svg" alt="Instagram" width={16} height={16} />
          </a>
          <a className="social-icon" href={site.telegram} target="_blank" aria-label="Telegram">
            <Image src="/icons/telegram.svg" alt="Telegram" width={16} height={16} />
          </a>
        </div>

        <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? "×" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="mobile-menu-panel">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}

          <div className="mobile-socials">
            <a className="social-icon" href={site.facebook} target="_blank" aria-label="Facebook">
              <Image src="/icons/facebook.svg" alt="Facebook" width={16} height={16} />
            </a>
            <a className="social-icon" href={site.instagram} target="_blank" aria-label="Instagram">
              <Image src="/icons/instagram.svg" alt="Instagram" width={16} height={16} />
            </a>
            <a className="social-icon" href={site.telegram} target="_blank" aria-label="Telegram">
              <Image src="/icons/telegram.svg" alt="Telegram" width={16} height={16} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}