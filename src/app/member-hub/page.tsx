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
  const [activeSection, setActiveSection] = useState("Announcements");
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

  return (
    <main style={main}>
      <div style={container}>
        <p style={eyebrow}>SERENADE SINGERS</p>
        <h1 style={title}>Members Hub</h1>
        <p style={subtitle}>
          A private community hub for registered Serenade Singers Members and Volunteers.
        </p>

        {!user?.verified && (
          <section style={card}>
            <h2 style={sectionTitle}>Verify Access</h2>
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
          </section>
        )}

        {message && <p style={notice}>{message}</p>}

        {user?.verified && (
          <>
            <section style={card}>
              <h2 style={sectionTitle}>✓ Access Granted</h2>
              <p><b>ID:</b> {user.memberId}</p>
              <p><b>Name:</b> {user.fullName}</p>
              <p><b>Type:</b> {user.type}</p>
              <p><b>Voice Part:</b> {user.voicePart || "-"}</p>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>Members Hub Menu</h2>
              <select value={activeSection} onChange={(e) => setActiveSection(e.target.value)} style={{ ...input, width: "100%", marginTop: 18 }}>
                <option>Announcements</option>
                <option>Events</option>
                <option>Learning Center</option>
                <option>Members Directory</option>
                <option>Financial Transparency</option>
                <option>Documents</option>
                <option>Official T-Shirt</option>
              </select>

              {activeSection === "Announcements" && (
                <HubSection title="Announcements">
                  {announcements.length === 0 ? <Empty /> : announcements.map((a, i) => (
                    <InfoCard key={i} title={a.title} text={a.content} meta={a.category} />
                  ))}
                </HubSection>
              )}

              {activeSection === "Events" && (
                <HubSection title="Events">
                  {events.length === 0 ? <Empty /> : events.map((e, i) => (
                    <InfoCard key={i} title={e.eventName} text={e.description} meta={`${e.eventDate || ""} ${e.eventTime || ""} · ${e.location || ""}`} />
                  ))}
                </HubSection>
              )}

              {activeSection === "Financial Transparency" && (
                <HubSection title="Financial Transparency">
                  {financialReports.length === 0 ? <Empty /> : financialReports.map((f, i) => (
                    <InfoCard key={i} title={f.description} text={f.purpose} meta={`Income: ${f.income || 0} Ks · Expense: ${f.expense || 0} Ks · Balance: ${f.balance || 0} Ks`} />
                  ))}
                </HubSection>
              )}

              {activeSection === "Documents" && (
                <HubSection title="Documents">
                  {documents.length === 0 ? <Empty /> : documents.map((d, i) => (
                    <article key={i} style={infoCard}>
                      <h4 style={infoTitle}>{d.title}</h4>
                      <p style={muted}>{d.description}</p>
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" style={{ ...button, display: "inline-block", marginTop: 14, textDecoration: "none" }}>
                        Open Document
                      </a>
                    </article>
                  ))}
                </HubSection>
              )}

              {activeSection === "Members Directory" && (
                <HubSection title="Members Directory">
                  <p style={muted}>Members Directory will be connected in the next update.</p>
                </HubSection>
              )}

              {activeSection === "Official T-Shirt" && (
                <HubSection title="Official T-Shirt">
                  <p style={muted}>Access Official T-Shirt registration and payment information here.</p>
                  <a href="/tshirt-registration" style={{ ...button, display: "inline-block", marginTop: 16, textDecoration: "none" }}>
                    Open T-Shirt Registration
                  </a>
                </HubSection>
              )}

              {activeSection === "Learning Center" && (
                <HubSection title="Learning Center">
                  {videos.length === 0 ? <Empty /> : Object.entries(groupedVideos).map(([category, items]) => (
                    <div key={category} style={{ marginTop: 28 }}>
                      <h4 style={{ fontSize: 24, fontWeight: 900 }}>{category}</h4>
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
                </HubSection>
              )}
            </section>
          </>
        )}

        {loading && <div style={overlay}><div style={spinner} /><h2>Verifying Access...</h2></div>}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

function HubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={hubSection}><h3 style={hubTitle}>{title}</h3><div style={{ marginTop: 18 }}>{children}</div></div>;
}

function InfoCard({ title, text, meta }: { title?: string; text?: string; meta?: string }) {
  return <article style={infoCard}><h4 style={infoTitle}>{title || "-"}</h4>{meta && <p style={metaText}>{meta}</p>}<p style={muted}>{text || ""}</p></article>;
}

function Empty() {
  return <p style={muted}>No data available yet.</p>;
}

const main = { minHeight: "100vh", background: "#faf8f3", color: "#061A2F" };
const container = { maxWidth: 1120, margin: "0 auto", padding: "56px 24px" };
const eyebrow = { fontWeight: 800, letterSpacing: "0.18em", color: "#C9A24A" };
const title = { marginTop: 16, fontSize: 44, lineHeight: 1.1, fontWeight: 900 };
const subtitle = { marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 };
const card = { background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, marginTop: 32, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" };
const sectionTitle = { fontSize: 30, fontWeight: 900 };
const row = { display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 18 };
const input = { border: "1px solid #cbd5e1", borderRadius: 16, padding: "14px 16px", fontSize: 15, flex: 1, minWidth: 260 };
const button = { background: "#061A2F", color: "white", border: 0, borderRadius: 16, padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const notice = { marginTop: 16, fontWeight: 800 };
const hubSection = { marginTop: 26, padding: 24, borderRadius: 22, background: "#f8fafc", border: "1px solid #e2e8f0" };
const hubTitle = { fontSize: 26, fontWeight: 900 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 16 };
const infoCard = { padding: 18, borderRadius: 22, border: "1px solid #e2e8f0", background: "white", marginTop: 14 };
const infoTitle = { marginTop: 0, fontSize: 19, fontWeight: 900 };
const muted = { marginTop: 8, color: "#64748b", lineHeight: 1.7 };
const metaText = { marginTop: 8, color: "#C9A24A", fontWeight: 800 };
const videoBox = { position: "relative" as const, width: "100%", paddingTop: "56.25%", borderRadius: 18, overflow: "hidden", background: "#e2e8f0" };
const iframe = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", border: 0 };
const overlay = { position: "fixed" as const, inset: 0, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, zIndex: 99999, gap: 16 };
const spinner = { width: 64, height: 64, border: "6px solid #e5e7eb", borderTop: "6px solid #061A2F", borderRadius: "50%", animation: "spin 1s linear infinite" };
