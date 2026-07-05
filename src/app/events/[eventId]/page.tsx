"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getEventMedia } from "@/lib/events";

type MediaItem = {
  fileId: string;
  fileName: string;
  type: "image" | "video";
  thumbnailUrl: string;
  embedUrl: string;
};

type EventData = {
  title: string;
  eventId: string;
  media: MediaItem[];
};

export default function EventGalleryPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    getEventMedia(params.eventId as string).then(setEvent).catch(() => setEvent(null));
  }, [params.eventId]);

  const media = useMemo(() => event?.media || [], [event]);

  function next() {
    if (active === null || media.length === 0) return;
    setActive((active + 1) % media.length);
  }

  function prev() {
    if (active === null || media.length === 0) return;
    setActive((active - 1 + media.length) % media.length);
  }

  if (!event) {
    return (
      <main style={styles.loading}>
        <p>Loading gallery...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <p style={styles.kicker}>Serenade Singers Gallery</p>
        <h1 style={styles.title}>{event.title}</h1>
        <p style={styles.description}>Tap any photo or video to view it in full screen.</p>
      </header>

      <section style={styles.masonry}>
        {media.map((item, index) => (
          <button
            key={item.fileId}
            onClick={() => setActive(index)}
            style={{
              ...styles.card,
              ...(index % 7 === 0 ? styles.tallCard : {}),
              ...(index % 5 === 0 ? styles.wideCard : {}),
            }}
          >
            {item.type === "image" ? (
              <img src={item.thumbnailUrl} alt={item.fileName} style={styles.media} />
            ) : (
              <div style={styles.videoThumb}>
                <iframe src={item.embedUrl} style={styles.iframe} allow="autoplay" />
                <span style={styles.playBadge}>▶</span>
              </div>
            )}
          </button>
        ))}
      </section>

      {active !== null && media[active] && (
        <div
          style={styles.lightbox}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null) return;
            const diff = e.changedTouches[0].clientX - touchStart;
            if (diff > 50) prev();
            if (diff < -50) next();
            setTouchStart(null);
          }}
        >
          <button onClick={() => setActive(null)} style={styles.close}>×</button>
          <button onClick={prev} style={styles.prev}>‹</button>

          <div style={styles.lightboxContent}>
            {media[active].type === "image" ? (
              <img src={media[active].thumbnailUrl} alt={media[active].fileName} style={styles.fullImage} />
            ) : (
              <iframe src={media[active].embedUrl} style={styles.fullVideo} allow="autoplay" allowFullScreen />
            )}

            <p style={styles.caption}>
              {active + 1} / {media.length} · {media[active].fileName}
            </p>
          </div>

          <button onClick={next} style={styles.next}>›</button>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "70vh",
    display: "grid",
    placeItems: "center",
    color: "#64748b",
    fontWeight: 800,
  },
  page: {
    background: "#f8f6f2",
    minHeight: "100vh",
    padding: "46px 18px 80px",
  },
  header: {
    maxWidth: 1180,
    margin: "0 auto 28px",
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
    fontSize: "clamp(2rem, 5vw, 4rem)",
    fontWeight: 950,
  },
  description: {
    color: "#64748b",
    lineHeight: 1.8,
  },
  masonry: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gridAutoRows: 190,
    gap: 12,
  },
  card: {
    padding: 0,
    border: "none",
    overflow: "hidden",
    borderRadius: 20,
    background: "#e2e8f0",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(15,23,42,.08)",
  },
  tallCard: { gridRow: "span 2" },
  wideCard: { gridColumn: "span 2" },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  videoThumb: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "#0f172a",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: 0,
    pointerEvents: "none",
  },
  playBadge: {
    position: "absolute",
    inset: 0,
    margin: "auto",
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.92)",
    color: "#061A2F",
    fontWeight: 900,
    fontSize: 22,
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,.92)",
    zIndex: 9999,
    display: "grid",
    gridTemplateColumns: "70px minmax(0,1fr) 70px",
    alignItems: "center",
    padding: 16,
  },
  lightboxContent: {
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
    textAlign: "center",
  },
  fullImage: {
    maxWidth: "100%",
    maxHeight: "82vh",
    objectFit: "contain",
    borderRadius: 18,
  },
  fullVideo: {
    width: "100%",
    height: "78vh",
    border: 0,
    borderRadius: 18,
    background: "#000",
  },
  caption: {
    color: "#e2e8f0",
    marginTop: 12,
    fontSize: 14,
  },
  close: {
    position: "fixed",
    top: 18,
    right: 22,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "#ffffff",
    color: "#061A2F",
    fontSize: 28,
    fontWeight: 900,
    cursor: "pointer",
  },
  prev: {
    border: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: 64,
    cursor: "pointer",
  },
  next: {
    border: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: 64,
    cursor: "pointer",
  },
};
