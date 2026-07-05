import Link from "next/link";

export default function RecentEventGallery() {
  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Recent Activity</p>
            <h2 style={styles.title}>Blind School Visit</h2>
            <p style={styles.description}>
              A community outreach activity by Serenade Singers, sharing music,
              care, and future collaboration with Yangon Blind School.
            </p>
          </div>

          <Link
            href="/events/EVT-2026-001"
            style={styles.button}
          >
            View Gallery
          </Link>
        </div>

        <Link
          href="/events/EVT-2026-001"
          style={styles.coverWrap}
        >
          <img
            src="/events/EVT-2026-001/cover.jpg"
            alt="Blind School Visit"
            style={styles.cover}
          />
          <div style={styles.coverOverlay}>
            <span>Open Gallery</span>
          </div>
        </Link>

        <div style={styles.stats}>
          <span>📷 Photos</span>
          <span>🎥 Videos</span>
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
  description: { margin: 0, color: "#64748b", lineHeight: 1.8, maxWidth: 720 },
  button: {
    background: "#061A2F",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 900,
  },
  coverWrap: {
    position: "relative",
    display: "block",
    overflow: "hidden",
    borderRadius: 22,
    border: "1px solid #e2e8f0",
    background: "#e2e8f0",
    textDecoration: "none",
  },
  cover: {
    width: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    display: "block",
  },
  coverOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(to top, rgba(6,26,47,.55), rgba(6,26,47,.05))",
    color: "#ffffff",
    fontWeight: 950,
    fontSize: 18,
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
