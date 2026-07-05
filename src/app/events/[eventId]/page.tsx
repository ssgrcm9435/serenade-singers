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
  folderId?: string;
  media: MediaItem[];
};

function getLocalCover(folderId: string) {
  return `/events/${folderId}/cover-1.jpg`;
}

export default function EventGalleryPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);

    getEventMedia(params.eventId as string)
      .then((data) => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [params.eventId]);

  const media = useMemo(() => event?.media || [], [event]);
  const folderId = params.eventId as string;
  const cover = getLocalCover(folderId);

  useEffect(() => {
    if (active !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  function next() {
    if (active === null || media.length === 0) return;
    setActive((active + 1) % media.length);
  }

  function prev() {
    if (active === null || media.length === 0) return;
    setActive((active - 1 + media.length) % media.length);
  }

  return (
    <main style={styles.page}>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 680px) {
          button[style] {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
      <section style={styles.hero}>
        <img
          src={cover}
          alt={event?.title || folderId}
          style={styles.cover}
          onError={(e) => {
            e.currentTarget.src = `/events/${folderId}/cover.jpg`;
          }}
        />

        <div style={styles.heroOverlay}>
          <p style={styles.kicker}>Serenade Singers Gallery</p>
          <h1 style={styles.title}>{event?.title || folderId}</h1>
          <p style={styles.description}>
            Photos and videos will appear below. Tap any item to view full screen and slide.
          </p>
        </div>
      </section>

      {loading && (
        <section style={styles.loadingArea}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading photos and videos...</p>

          <div style={styles.skeletonGrid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        </section>
      )}

      {!loading && media.length === 0 && (
        <section style={styles.empty}>
          <p>No gallery media found yet.</p>
        </section>
      )}

      {!loading && media.length > 0 && (
        <section style={styles.gallery}>
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
                <img
                  src={item.thumbnailUrl}
                  alt={item.fileName}
                  style={styles.media}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div style={styles.videoThumb}>
                  <img
                    src={item.thumbnailUrl}
                    alt={item.fileName}
                    style={styles.media}
                    loading="lazy"
                    decoding="async"
                  />
                  <span style={styles.playBadge}>▶</span>
                </div>
              )}

              <div style={styles.hoverOverlay}>
                <span>View</span>
              </div>
            </button>
          ))}
        </section>
      )}

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
              <img
                src={media[active].thumbnailUrl}
                alt={media[active].fileName}
                style={styles.fullImage}
              />
            ) : (
              <iframe
                src={media[active].embedUrl}
                style={styles.fullVideo}
                allow="autoplay"
                allowFullScreen
              />
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
  page: {
    minHeight: "100vh",
    background: "#f8f6f2",
    paddingBottom: 80,
  },
  hero: {
    position: "relative",
    minHeight: "min(62vh, 620px)",
    overflow: "hidden",
    background: "#061A2F",
  },
  cover: {
    maxWidth: "96vw",
    height: "min(62vh, 620px)",
    objectFit: "contain",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "clamp(24px, 6vw, 72px)",
    background: "linear-gradient(to top, rgba(6,26,47,.88), rgba(6,26,47,.1))",
    color: "#ffffff",
  },
  kicker: {
    margin: 0,
    color: "#F8D77A",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: 13,
  },
  title: {
    margin: "10px 0",
    fontSize: "clamp(2rem, 6vw, 4.8rem)",
    fontWeight: 950,
    lineHeight: 1.05,
  },
  description: {
    maxWidth: 760,
    margin: 0,
    lineHeight: 1.8,
    color: "#E2E8F0",
  },
  loadingArea: {
    maxWidth: 1180,
    margin: "34px auto 0",
    padding: "0 18px",
    textAlign: "center",
  },
  spinner: {
    width: 42,
    height: 42,
    margin: "0 auto 12px",
    borderRadius: "50%",
    border: "4px solid #e2e8f0",
    borderTopColor: "#061A2F",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontWeight: 900,
  },
  skeletonGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  skeleton: {
    height: 190,
    borderRadius: 20,
    background: "linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0)",
  },
  empty: {
    maxWidth: 1180,
    margin: "50px auto",
    padding: 24,
    color: "#64748b",
    fontWeight: 900,
    textAlign: "center",
  },
  gallery: {
    maxWidth: 1180,
    margin: "34px auto 0",
    padding: "0 18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gridAutoRows: 180,
    gap: 12,
  },
  card: {
    position: "relative",
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
    maxWidth: "96vw",
    maxHeight: "78vh",
    objectFit: "contain",
    display: "block",
  },
  videoThumb: {
    position: "relative",
    maxWidth: "96vw",
    maxHeight: "78vh",
    background: "#0f172a",
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
  hoverOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(6,26,47,.28)",
    color: "#ffffff",
    fontWeight: 950,
    opacity: 0,
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    background: "rgba(2,6,23,.96)",
    zIndex: 9999,
    display: "grid",
    gridTemplateColumns: "56px minmax(0,1fr) 56px",
    alignItems: "center",
    justifyItems: "center",
    padding: 12,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  lightboxContent: {
    maxWidth: "96vw",
    maxHeight: "78vh",
    maxWidth: "none",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
  },
  fullImage: {
    maxWidth: "96vw",
    height: "calc(100dvh - 96px)",
    maxWidth: "100%",
    maxHeight: "calc(100dvh - 90px)",
    objectFit: "contain",
    borderRadius: 18,
    display: "block",
  },
  fullVideo: {
    maxWidth: "96vw",
    height: "calc(100dvh - 90px)",
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
    fontSize: 58,
    cursor: "pointer",
  },
  next: {
    border: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: 58,
    cursor: "pointer",
  },
};
