"use server";

import fs from "fs";
import path from "path";
import Link from "next/link";
import type { CSSProperties } from "react";

type LocalEvent = {
  id: string;
  covers: string[];
};

function getLocalEvents(): LocalEvent[] {
  const eventsDir = path.join(process.cwd(), "public", "events");

  if (!fs.existsSync(eventsDir)) return [];

  return fs
    .readdirSync(eventsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(eventsDir, entry.name);
      const covers = fs
        .readdirSync(dir)
        .filter((file) => /^cover[-\w]*\.(jpg|jpeg|png|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b))
        .map((file) => `/events/${entry.name}/${file}`);

      return { id: entry.name, covers };
    })
    .filter((event) => event.covers.length > 0)
    .sort((a, b) => b.id.localeCompare(a.id));
}

export default async function RecentEventGallery() {
  const events = getLocalEvents();

  if (events.length === 0) return null;

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Recent Events</p>
            <h2 style={styles.title}>Serenade Singers Event Gallery</h2>
            <p style={styles.description}>
              Fast local event covers on the homepage. Open an event to load photos and videos from Google Drive.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} style={styles.card}>
              <img src={event.covers[0]} alt={event.id} style={styles.cover} />
              <div style={styles.overlay}>
                <p style={styles.eventId}>{event.id}</p>
                <span style={styles.open}>Open Gallery</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  section: { padding: "70px 20px", background: "#f8f6f2" },
  inner: { maxWidth: 1180, margin: "0 auto" },
  header: { marginBottom: 24 },
  kicker: {
    margin: 0,
    color: "#C9A24A",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: 13,
  },
  title: {
    margin: "8px 0",
    color: "#061A2F",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 950,
  },
  description: { margin: 0, color: "#64748b", lineHeight: 1.8, maxWidth: 760 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
  },
  card: {
    position: "relative",
    display: "block",
    overflow: "hidden",
    borderRadius: 24,
    background: "#e2e8f0",
    minHeight: 260,
    textDecoration: "none",
    boxShadow: "0 18px 45px rgba(6,26,47,0.10)",
  },
  cover: {
    width: "100%",
    height: "100%",
    minHeight: 260,
    objectFit: "cover",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 22,
    background: "linear-gradient(to top, rgba(6,26,47,.82), rgba(6,26,47,.08))",
    color: "#ffffff",
  },
  eventId: { margin: 0, fontSize: 22, fontWeight: 950 },
  open: { marginTop: 8, fontWeight: 900, color: "#F8D77A" },
};
