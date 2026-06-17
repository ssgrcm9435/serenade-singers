"use client";

import { useEffect, useState } from "react";

type UserInfo = {
  verified: boolean;
  type: "Member" | "Volunteer";
  memberId: string;
  fullName: string;
  gmail: string;
  voicePart?: string;
};

type LearningVideo = {
  category: string;
  title: string;
  youtubeUrl: string;
  description: string;
  sortOrder: number;
};

type HubItem = Record<string, any>;

const menuItems = [
  "Overview",
  "Announcements",
  "Events",
  "Learning Center",
  "Members Directory",
  "Financial Transparency",
  "Documents",
  "Official T-Shirt",
];

function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

export default function MemberHubPage() {
  const [gmail, setGmail] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeSection, setActiveSection] = useState("Overview");
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [announcements, setAnnouncements] = useState<HubItem[]>([]);
  const [events, setEvents] = useState<HubItem[]>([]);
  const [financialReports, setFinancialReports] = useState<HubItem[]>([]);
  const [documents, setDocuments] = useState<HubItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  useEffect(() => {
    const saved = localStorage.getItem("ss_learning_user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
        loadHubData(savedUser.type);
      } catch {}
    }
  }, []);

  async function post(action: string, payload: Record<string, any> = {}) {
    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  }

  async function loadHubData(type: "Member" | "Volunteer") {
    if (!apiUrl) return;

    const [videoData, announcementData, eventData, financeData, documentData] =
      await Promise.all([
        post("getLearningVideos", { audience: type }),
        post("getAnnouncements"),
        post("getEvents"),
        post("getFinancialReports"),
        post("getDocuments"),
      ]);

    if (videoData.success) setVideos(videoData.videos || []);
    if (announcementData.success) setAnnouncements(announcementData.items || []);
    if (eventData.success) setEvents(eventData.items || []);
    if (financeData.success) setFinancialReports(financeData.items || []);
    if (documentData.success) setDocuments(documentData.items || []);
  }

  async function verifyAccess() {
    setMessage("");
    setUser(null);

    if (!gmail.trim()) return setMessage("Please enter your registered Gmail address.");
    if (!apiUrl) return setMessage("Apps Script URL is missing.");

    setLoading(true);
    try {
      const verifyData = await post("checkMemberOrVolunteer", { gmail });

      if (!verifyData.verified) {
        setMessage(verifyData.message || "Access denied.");
        return;
      }

      setUser(verifyData);
      localStorage.setItem("ss_learning_user", JSON.stringify(verifyData));
      await loadHubData(verifyData.type);
      setMessage("Access granted.");
    } catch {
      setMessage("Unable to verify access. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const groupedVideos = videos.reduce<Record<string, LearningVideo[]>>((acc, v) => {
    const category = v.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(v);
    return acc;
  }, {});

  const totalIncome = financialReports.reduce((sum, f) => sum + Number(f.income || 0), 0);
  const totalExpense = financialReports.reduce((sum, f) => sum + Number(f.expense || 0), 0);
  const balance = totalIncome - totalExpense;

  if (!user?.verified) {
    return (
      <main style={main}>
        <div style={loginWrap}>
          <p style={eyebrow}>SERENADE SINGERS</p>
          <h1 style={title}>Members Hub</h1>
          <p style={subtitle}>
            Private community portal for registered Serenade Singers Members and Volunteers.
          </p>

          <section style={card}>
            <h2 style={sectionTitle}>Verify Access</h2>
            <p style={muted}>
              Please enter your registered Gmail address to access the Members Hub.
            </p>

            <div style={row}>
              <input
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter registered Gmail address"
                style={input}
              />
              <button onClick={verifyAccess} disabled={loading} style={button}>
                {loading ? "Verifying..." : "Verify Access"}
              </button>
            </div>

            {message && <p style={notice}>{message}</p>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={main}>
      <div className="member-hub-shell" style={shell}>
        <aside style={sidebar}>
          <p style={sidebarEyebrow}>SERENADE SINGERS</p>
          <h2 style={sidebarTitle}>Members Hub</h2>

          <div style={profileCard}>
            <div style={avatar}>
              {user.fullName?.charAt(0) || "S"}
            </div>
            <div>
              <p style={profileName}>{user.fullName}</p>
              <p style={profileMeta}>{user.memberId}</p>
              <p style={profileMeta}>{user.type} · {user.voicePart || "-"}</p>
            </div>
          </div>

          <nav style={nav}>
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                style={{
                  ...navButton,
                  ...(activeSection === item ? navButtonActive : {}),
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section style={content}>
          <div style={topBar}>
            <div>
              <p style={eyebrow}>MEMBER AREA</p>
              <h1 style={pageTitle}>{activeSection}</h1>
            </div>
            <div style={statusBadge}>Access Granted</div>
          </div>

          {activeSection === "Overview" && (
            <>
              <section style={summaryGrid}>
                <Stat title="Announcements" value={announcements.length} />
                <Stat title="Events" value={events.length} />
                <Stat title="Learning Videos" value={videos.length} />
                <Stat title="Documents" value={documents.length} />
                <Stat title="Income" value={`${totalIncome.toLocaleString()} Ks`} />
                <Stat title="Expense" value={`${totalExpense.toLocaleString()} Ks`} />
                <Stat title="Balance" value={`${balance.toLocaleString()} Ks`} />
              </section>

              <section style={card}>
                <h2 style={sectionTitle}>Welcome, {user.fullName}</h2>
                <p style={muted}>
                  This is your private Serenade Singers Members Hub. Use the sidebar to access announcements,
                  events, learning resources, financial transparency, documents, and official T-shirt services.
                </p>
              </section>
            </>
          )}

          {activeSection === "Announcements" && (
            <Section title="Announcements">
              {announcements.length === 0 ? <Empty /> : announcements.map((a, i) => (
                <InfoCard key={i} title={a.title} text={a.content} meta={a.category} />
              ))}
            </Section>
          )}

          {activeSection === "Events" && (
            <Section title="Events">
              {events.length === 0 ? <Empty /> : events.map((e, i) => (
                <InfoCard
                  key={i}
                  title={e.eventName}
                  text={e.description}
                  meta={`${e.eventDate || ""} ${e.eventTime || ""} · ${e.location || ""}`}
                />
              ))}
            </Section>
          )}

          {activeSection === "Financial Transparency" && (
            <Section title="Financial Transparency">
              {financialReports.length === 0 ? <Empty /> : financialReports.map((f, i) => (
                <InfoCard
                  key={i}
                  title={f.description}
                  text={f.purpose}
                  meta={`Income: ${f.income || 0} Ks · Expense: ${f.expense || 0} Ks · Balance: ${f.balance || 0} Ks`}
                />
              ))}
            </Section>
          )}

          {activeSection === "Documents" && (
            <Section title="Documents">
              {documents.length === 0 ? <Empty /> : documents.map((d, i) => (
                <article key={i} style={infoCard}>
                  <h4 style={infoTitle}>{d.title}</h4>
                  <p style={metaText}>{d.category}</p>
                  <p style={muted}>{d.description}</p>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...button, display: "inline-block", marginTop: 14, textDecoration: "none" }}
                  >
                    Open Document
                  </a>
                </article>
              ))}
            </Section>
          )}

          {activeSection === "Learning Center" && (
            <Section title="Learning Center">
              {videos.length === 0 ? <Empty /> : Object.entries(groupedVideos).map(([category, items]) => (
                <div key={category} style={{ marginTop: 28 }}>
                  <h4 style={categoryTitle}>{category}</h4>
                  <div style={grid}>
                    {items.map((video) => (
                      <article key={video.title} style={infoCard}>
                        <div style={videoBox}>
                          <iframe src={getYouTubeEmbedUrl(video.youtubeUrl)} title={video.title} allowFullScreen style={iframe} />
                        </div>
                        <h5 style={infoTitle}>{video.title}</h5>
                        <p style={muted}>{video.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {activeSection === "Members Directory" && (
            <Section title="Members Directory">
              <p style={muted}>Members Directory will be connected in the next update.</p>
            </Section>
          )}

          {activeSection === "Official T-Shirt" && (
            <Section title="Official T-Shirt">
              <p style={muted}>Access Official T-Shirt registration and payment information here.</p>
              <a
                href="/tshirt-registration"
                style={{ ...button, display: "inline-block", marginTop: 16, textDecoration: "none" }}
              >
                Open T-Shirt Registration
              </a>
            </Section>
          )}
        </section>
      </div>

      {loading && <div style={overlay}><div style={spinner} /><h2>Verifying Access...</h2></div>}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 860px) {
          .member-hub-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

function InfoCard({ title, text, meta }: { title?: string; text?: string; meta?: string }) {
  return (
    <article style={infoCard}>
      <h4 style={infoTitle}>{title || "-"}</h4>
      {meta && <p style={metaText}>{meta}</p>}
      <p style={muted}>{text || ""}</p>
    </article>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <article style={statCard}>
      <p style={statLabel}>{title}</p>
      <h3 style={statValue}>{value}</h3>
    </article>
  );
}

function Empty() {
  return <p style={muted}>No data available yet.</p>;
}

const main = { minHeight: "100vh", background: "#f8f6f2", color: "#061A2F" };
const loginWrap = { maxWidth: 900, margin: "0 auto", padding: "72px 24px" };
const shell = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: 28,
  maxWidth: 1380,
  margin: "0 auto",
  padding: "32px 24px",
} as React.CSSProperties;
const sidebar = {
  position: "sticky" as const,
  top: 24,
  alignSelf: "start",
  background: "#061A2F",
  color: "white",
  borderRadius: 30,
  padding: 24,
  minHeight: "calc(100vh - 64px)",
  boxShadow: "0 22px 60px rgba(6,26,47,0.18)",
};
const content = { minWidth: 0 };
const eyebrow = { fontWeight: 900, letterSpacing: "0.18em", color: "#C9A24A", fontSize: 13 };
const title = { marginTop: 16, fontSize: 46, lineHeight: 1.1, fontWeight: 950 };
const pageTitle = { marginTop: 8, fontSize: 42, lineHeight: 1.1, fontWeight: 950 };
const subtitle = { marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 };
const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: 28,
  marginTop: 28,
  boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
};
const sectionTitle = { fontSize: 30, fontWeight: 950 };
const row = { display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 18 };
const input = { border: "1px solid #cbd5e1", borderRadius: 16, padding: "14px 16px", fontSize: 15, flex: 1, minWidth: 260 };
const button = { background: "#061A2F", color: "white", border: 0, borderRadius: 16, padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const muted = { marginTop: 8, color: "#64748b", lineHeight: 1.8 };
const notice = { marginTop: 16, fontWeight: 800, color: "#b91c1c" };
const sidebarEyebrow = { color: "#C9A24A", fontWeight: 900, letterSpacing: "0.15em", fontSize: 12 };
const sidebarTitle = { marginTop: 8, fontSize: 28, fontWeight: 950 };
const profileCard = { display: "flex", gap: 14, alignItems: "center", marginTop: 24, padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.08)" };
const avatar = { width: 48, height: 48, borderRadius: "50%", background: "#C9A24A", color: "#061A2F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: 22 };
const profileName = { margin: 0, fontWeight: 900 };
const profileMeta = { margin: "4px 0 0", color: "#cbd5e1", fontSize: 13 };
const nav = { display: "grid", gap: 8, marginTop: 24 };
const navButton = { textAlign: "left" as const, border: 0, borderRadius: 16, padding: "13px 14px", background: "transparent", color: "#e2e8f0", fontWeight: 800, cursor: "pointer" };
const navButtonActive = { background: "#C9A24A", color: "#061A2F" };
const topBar = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" };
const statusBadge = { background: "#ecfdf5", color: "#047857", border: "1px solid #bbf7d0", borderRadius: 999, padding: "10px 16px", fontWeight: 900 };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 28 };
const statCard = { background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: 22, boxShadow: "0 12px 30px rgba(15,23,42,0.04)" };
const statLabel = { margin: 0, color: "#64748b", fontWeight: 800 };
const statValue = { margin: "10px 0 0", fontSize: 24, fontWeight: 950 };
const infoCard = { padding: 20, borderRadius: 22, border: "1px solid #e2e8f0", background: "#f8fafc", marginTop: 14 };
const infoTitle = { margin: 0, fontSize: 20, fontWeight: 950 };
const metaText = { marginTop: 8, color: "#C9A24A", fontWeight: 900 };
const categoryTitle = { fontSize: 24, fontWeight: 950 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 16 };
const videoBox = { position: "relative" as const, width: "100%", paddingTop: "56.25%", borderRadius: 18, overflow: "hidden", background: "#e2e8f0" };
const iframe = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", border: 0 };
const overlay = { position: "fixed" as const, inset: 0, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, zIndex: 99999, gap: 16 };
const spinner = { width: 64, height: 64, border: "6px solid #e5e7eb", borderTop: "6px solid #061A2F", borderRadius: "50%", animation: "spin 1s linear infinite" };
