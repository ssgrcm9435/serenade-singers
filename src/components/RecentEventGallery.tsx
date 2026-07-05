"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MediaItem = {
  fileId: string;
  fileName: string;
  type: "image" | "video";
  thumbnailUrl: string;
  embedUrl: string;
};

type MediaEvent = {
  eventId: string;
  title: string;
  folderId: string;
  coverUrl: string;
  photoCount: number;
  videoCount: number;
  media?: MediaItem[];
};

export default function RecentEventGallery() {
  const [event, setEvent] = useState<MediaEvent | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    if (!url) return;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "getFeaturedMediaEvent" }),
    })
      .then((res) => res.json())
      .then((data) => setEvent(data.event || null))
      .catch(() => setEvent(null));
  }, []);

  if (!event) return null;

  const preview = (event.media || []).filter((m) => m.type === "image").slice(0, 6);

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Recent Activity</p>
            <h2 style={styles.title}>{event.title}</h2>
            <p style={styles.description}>
              Photos and videos from our latest Serenade Singers activity.
            </p>
          </div>

          <Link href={`/events/${event.folderId}`} style={styles.button}>
            View Gallery
          </Link>
        </div>

        <Link href={`/events/${event.folderId}`} style={styles.previewGrid}>
          {preview.length > 0 ? (
            preview.map((item, index) => (
              <div key={item.fileId} style={index === 0 ? styles.largeTile : styles.tile}>
                <img src={item.thumbnailUrl} alt={item.fileName} style={styles.image} />
              </div>
            ))
          ) : (
            event.coverUrl && (
              <div style={styles.largeTile}>
                <img src={event.coverUrl} alt={event.title} style={styles.image} />
              </div>
            )
          )}
        </Link>

        <div style={styles.stats}>
          <span>📷 {event.photoCount} Photos</span>
          <span>🎥 {event.videoCount} Videos</span>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { padding: "70px 20px", background: "#f8f6f2" },
  inner: {
    maxWidth: 1180,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 28,
    padding: 28,
    border: "1px solid #ece7dd",
    boxShadow: "0 20px 55px rgba(6,26,47,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 22,
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
    fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
    fontWeight: 950,
  },
  description: { margin: 0, color: "#64748b", lineHeight: 1.8 },
  button: {
    background: "#061A2F",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 900,
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gridAutoRows: 170,
    gap: 10,
    textDecoration: "none",
  },
  largeTile: {
    gridRow: "span 2",
    overflow: "hidden",
    borderRadius: 22,
    background: "#e2e8f0",
  },
  tile: {
    overflow: "hidden",
    borderRadius: 18,
    background: "#e2e8f0",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform .35s ease",
  },
  stats: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 18,
    color: "#061A2F",
    fontWeight: 900,
  },
};
