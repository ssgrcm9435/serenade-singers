"use server";

import fs from "fs";
import path from "path";
import Link from "next/link";
import type { CSSProperties } from "react";

type LocalEvent = {
  id: string;
  images: string[];
};

function getLocalEvents(): LocalEvent[] {
  const root = path.join(process.cwd(), "public", "events");
  if (!fs.existsSync(root)) return [];

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(root, entry.name);
      const images = fs
        .readdirSync(dir)
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b))
        .map((file) => `/events/${entry.name}/${file}`);

      return { id: entry.name, images };
    })
    .filter((event) => event.images.length > 0)
    .sort((a, b) => b.id.localeCompare(a.id));
}

export default async function RecentEventGallery() {
  const events = getLocalEvents();

  if (!events.length) return null;

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <p style={styles.kicker}>Recent Events</p>
        <h2 style={styles.title}>Serenade Singers Event Gallery</h2>
        <p style={styles.description}>
          Browse event previews instantly from local images. Open each event to view the full Google Drive gallery.
        </p>

        <div style={styles.eventList}>
          {events.map((event) => {
            const preview = event.images.slice(0, 8);

            return (
              <Link key={event.id} href={`/events/${event.id}`} style={styles.eventCard}>
                <div style={styles.previewGrid}>
                  {preview.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${event.id} preview ${index + 1}`}
                      style={{
                        ...styles.previewImage,
                        ...(index === 0 ? styles.mainImage : {}),
                      }}
                    />
                  ))}
                </div>

                <div style={styles.footer}>
                  <div>
                    <h3 style={styles.eventId}>{event.id}</h3>
                    <p style={styles.count}>{event.images.length} local preview images</p>
                  </div>
                  <span style={styles.open}>Open Gallery →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  section: {
    padding: "70px 20px",
    background: "#f8f6f2",
  },
  inner: {
    maxWidth: 1180,
    margin: "0 auto",
  },
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
  description: {
    margin: "0 0 24px",
    color: "#64748b",
    lineHeight: 1.8,
    maxWidth: 760,
  },
  eventList: {
    display: "grid",
    gap: 28,
  },
  eventCard: {
    display: "block",
    background: "#ffffff",
    border: "1px solid #ece7dd",
    borderRadius: 28,
    padding: 18,
    textDecoration: "none",
    boxShadow: "0 18px 45px rgba(6,26,47,0.08)",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridAutoRows: 150,
    gap: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 18,
    display: "block",
    background: "#e2e8f0",
  },
  mainImage: {
    gridColumn: "span 2",
    gridRow: "span 2",
  },
  footer: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  eventId: {
    margin: 0,
    color: "#061A2F",
    fontSize: 22,
    fontWeight: 950,
  },
  count: {
    margin: "4px 0 0",
    color: "#64748b",
    fontWeight: 700,
  },
  open: {
    color: "#C9A24A",
    fontWeight: 950,
  },
};
