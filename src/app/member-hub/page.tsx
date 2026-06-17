"use client";

import { useEffect, useState } from "react";

type UserInfo = {
  success: boolean;
  verified: boolean;
  type: "Member" | "Volunteer";
  memberId: string;
  fullName: string;
  gmail: string;
  voicePart?: string;
  message?: string;
};

type LearningVideo = {
  audience: string;
  category: string;
  title: string;
  youtubeUrl: string;
  description: string;
  sortOrder: number;
};

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
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("Learning Center");

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  useEffect(() => {
    const saved = localStorage.getItem("ss_learning_user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
        loadVideos(savedUser.type);
      } catch {}
    }
  }, []);

  async function loadVideos(audience: "Member" | "Volunteer") {
    if (!apiUrl) return;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "getLearningVideos",
          audience,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch {
      setMessage("Unable to load learning videos.");
    }
  }

  async function verifyAccess() {
    setMessage("");
    setUser(null);
    setVideos([]);

    if (!gmail.trim()) {
      setMessage("Please enter your registered Gmail address.");
      return;
    }

    if (!apiUrl) {
      setMessage("Apps Script URL is missing.");
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "checkMemberOrVolunteer",
          gmail,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.verified) {
        setMessage(
          verifyData.message ||
            "Access denied. This Learning Center is only for registered Serenade Singers Members and Volunteers."
        );
        return;
      }

      setUser(verifyData);
      localStorage.setItem("ss_learning_user", JSON.stringify(verifyData));

      await loadVideos(verifyData.type);
      setMessage("Access granted.");
    } catch {
      setMessage("Unable to verify access. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const groupedVideos = videos.reduce<Record<string, LearningVideo[]>>(
    (acc, video) => {
      const category = video.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(video);
      return acc;
    },
    {}
  );

  return (
    <main style={{ minHeight: "100vh", background: "#faf8f3", color: "#061A2F" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ fontWeight: 800, letterSpacing: "0.18em", color: "#C9A24A" }}>
          SERENADE SINGERS
        </p>

        <h1 style={{ marginTop: 16, fontSize: 44, lineHeight: 1.1, fontWeight: 900 }}>
          Members Hub
        </h1>

        <p style={{ marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 }}>
          A private community hub for registered Serenade Singers Members and Volunteers. Verify your Gmail address to access announcements, events, learning resources, financial transparency, documents, and member information.
        </p>

        {!user?.verified && (
          <section style={card}>
            <h2 style={sectionTitle}>Verify Access</h2>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <input
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter registered Gmail address"
                style={input}
              />

              <button
                onClick={verifyAccess}
                disabled={loading}
                style={{
                  ...button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Verifying..." : "Verify Access"}
              </button>
            </div>
          </section>
        )}

        {message && (
          <p style={{ marginTop: 16, fontWeight: 800, color: user?.verified ? "#047857" : "#b91c1c" }}>
            {message}
          </p>
        )}

        {user?.verified && (
          <section style={card}>
            <h2 style={sectionTitle}>✓ Access Granted</h2>
            <p><b>ID:</b> {user.memberId}</p>
            <p><b>Name:</b> {user.fullName}</p>
            <p><b>Type:</b> {user.type}</p>
            <p><b>Voice Part:</b> {user.voicePart || "-"}</p>
          </section>
        )}

        {user?.verified && (
          <section style={card}>
            <h2 style={sectionTitle}>Members Hub Menu</h2>

            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              style={{
                ...input,
                width: "100%",
                marginTop: 18,
                fontWeight: 800,
              }}
            >
              <option>Announcements</option>
              <option>Events</option>
              <option>Learning Center</option>
              <option>Members Directory</option>
              <option>Financial Transparency</option>
              <option>Documents</option>
              <option>Official T-Shirt</option>
            </select>

            {activeSection === "Announcements" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Announcements</h3>
                <p style={mutedText}>Latest notices and official announcements will be shown here.</p>
              </div>
            )}

            {activeSection === "Events" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Events</h3>
                <p style={mutedText}>Upcoming rehearsals, workshops, performances, and official activities will be shown here.</p>
              </div>
            )}

            {activeSection === "Members Directory" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Members Directory</h3>
                <p style={mutedText}>Member list will be available here for verified Serenade Singers members and volunteers.</p>
              </div>
            )}

            {activeSection === "Financial Transparency" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Financial Transparency</h3>
                <p style={mutedText}>Project financial summaries, income, expenses, balances, and purposes of use will be shown here.</p>
              </div>
            )}

            {activeSection === "Documents" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Documents</h3>
                <p style={mutedText}>Constitution, reports, forms, and official documents will be listed here.</p>
                <a href="/constitution" style={{ ...button, display: "inline-block", marginTop: 16, textDecoration: "none" }}>
                  View Constitution
                </a>
              </div>
            )}

            {activeSection === "Official T-Shirt" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Official T-Shirt</h3>
                <p style={mutedText}>Access Official T-Shirt registration and payment information here.</p>
                <a href="/tshirt-registration" style={{ ...button, display: "inline-block", marginTop: 16, textDecoration: "none" }}>
                  Open T-Shirt Registration
                </a>
              </div>
            )}

            {activeSection === "Learning Center" && (
              <div style={hubSection}>
                <h3 style={hubTitle}>Learning Center</h3>

                {videos.length === 0 ? (
                  <p style={{ marginTop: 16, color: "#64748b" }}>
                    No learning videos are available yet.
                  </p>
                ) : (
                  <div style={{ marginTop: 24 }}>
                    {Object.entries(groupedVideos).map(([category, items]) => (
                      <div key={category} style={{ marginTop: 32 }}>
                        <h4 style={{ fontSize: 24, fontWeight: 900 }}>{category}</h4>

                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: 20,
                          marginTop: 16,
                        }}>
                          {items.map((video) => (
                            <article key={video.title} style={videoCard}>
                              <div style={{
                                position: "relative",
                                width: "100%",
                                paddingTop: "56.25%",
                                borderRadius: 18,
                                overflow: "hidden",
                                background: "#e2e8f0",
                              }}>
                                <iframe
                                  src={getYouTubeEmbedUrl(video.youtubeUrl)}
                                  title={video.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: 0,
                                  }}
                                />
                              </div>

                              <h5 style={{ marginTop: 16, fontSize: 19, fontWeight: 900 }}>
                                {video.title}
                              </h5>

                              <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.7 }}>
                                {video.description}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {loading && (
          <div style={overlay}>
            <div style={spinner} />
            <h2 style={{ fontWeight: 900 }}>Verifying Access...</h2>
            <p>Please wait.</p>
          </div>
        )}
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

const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: 28,
  marginTop: 32,
  boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
};

const sectionTitle = {
  fontSize: 30,
  fontWeight: 900,
};

const input = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  padding: "14px 16px",
  fontSize: 15,
  flex: 1,
  minWidth: 260,
};

const button = {
  background: "#061A2F",
  color: "white",
  border: 0,
  borderRadius: 16,
  padding: "14px 22px",
  fontWeight: 900,
};

const videoCard = {
  padding: 18,
  borderRadius: 22,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const hubSection = {
  marginTop: 26,
  padding: 24,
  borderRadius: 22,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const hubTitle = {
  fontSize: 26,
  fontWeight: 900,
};

const mutedText = {
  marginTop: 12,
  color: "#64748b",
  lineHeight: 1.8,
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(255,255,255,0.92)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column" as const,
  zIndex: 99999,
  gap: 16,
};

const spinner = {
  width: 64,
  height: 64,
  border: "6px solid #e5e7eb",
  borderTop: "6px solid #061A2F",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
