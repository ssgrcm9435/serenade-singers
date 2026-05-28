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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <nav className="nav-inner">

        <Link href="/" className="brand-combined">
          <Image
            src="/logo.svg"
            alt="Serenade Singers Icon"
            width={52}
            height={52}
            className="navbar-icon-logo"
          />

          <Image
            src="/hero-logo.png"
            alt="Serenade Singers"
            width={180}
            height={80}
            priority
            className="navbar-full-logo"
          />
        </Link>

        <div
          className={
            mobileMenuOpen
              ? "nav-links mobile-nav-open"
              : "nav-links"
          }
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="mobile-socials">
            <a href={site.facebook} target="_blank">
              Facebook
            </a>

            <a href={site.instagram} target="_blank">
              Instagram
            </a>

            <a href={site.telegram} target="_blank">
              Telegram
            </a>
          </div>
        </div>

        <div className="nav-actions">

          <a
            className="social-icon"
            href={site.facebook}
            target="_blank"
            aria-label="Facebook"
          >
            <Image
              src="/icons/facebook.svg"
              alt="Facebook"
              width={16}
              height={16}
            />
          </a>

          <a
            className="social-icon"
            href={site.instagram}
            target="_blank"
            aria-label="Instagram"
          >
            <Image
              src="/icons/instagram.svg"
              alt="Instagram"
              width={16}
              height={16}
            />
          </a>

          <a
            className="social-icon"
            href={site.telegram}
            target="_blank"
            aria-label="Telegram"
          >
            <Image
              src="/icons/telegram.svg"
              alt="Telegram"
              width={16}
              height={16}
            />
          </a>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>

        </div>
      </nav>
    </header>
  );
}