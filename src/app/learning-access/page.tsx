"use client";

import { useState, useEffect } from "react";

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

  const embedMatch = url.match(/embed\/([^?&]+)/);
  if (embedMatch) return url;

  return url;
}

export default function LearningAccessPage() {
  const [gmail, setGmail] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ss_learning_user");
      if (saved) {
        const user = JSON.parse(saved);
        setUser(user);
      }
    } catch {}
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

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

      try {
        localStorage.setItem(
          "ss_learning_user",
          JSON.stringify(verifyData)
        );
      } catch {}

      const videosRes = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "getLearningVideos",
          audience: verifyData.type,
        }),
      });

      const videosData = await videosRes.json();

      if (!videosData.success) {
        setMessage(videosData.message || "Unable to load learning videos.");
        return;
      }

      setVideos(videosData.videos || []);
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
          Learning Access
        </h1>

        <p style={{ marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 }}>
          This Learning Center is available only to registered Serenade Singers Members and Volunteers.
          Please verify your registered Gmail address to continue.
        </p>

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

          {message && (
            <p style={{ marginTop: 16, fontWeight: 800, color: user?.verified ? "#047857" : "#b91c1c" }}>
              {message}
            </p>
          )}

          {user?.verified && (
            <div style={successBox}>
              <h3 style={{ fontSize: 22, fontWeight: 900 }}>✓ Access Granted</h3>
              <p><b>ID:</b> {user.memberId}</p>
              <p><b>Name:</b> {user.fullName}</p>
              <p><b>Type:</b> {user.type}</p>
              <p><b>Voice Part:</b> {user.voicePart || "-"}</p>
            </div>
          )}
        </section>

        {user?.verified && (
          <section style={card}>
            <h2 style={sectionTitle}>
              {user.type === "Volunteer" ? "Volunteer Learning Center" : "Members Learning Center"}
            </h2>

            {videos.length === 0 ? (
              <p style={{ marginTop: 16, color: "#64748b" }}>
                No learning videos are available yet.
              </p>
            ) : (
              <div style={{ marginTop: 24 }}>
                {Object.entries(groupedVideos).map(([category, items]) => (
                  <div key={category} style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900 }}>
                      {category}
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 20,
                        marginTop: 16,
                      }}
                    >
                      {items.map((video) => (
                        <article key={video.title} style={videoCard}>
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              paddingTop: "56.25%",
                              borderRadius: 18,
                              overflow: "hidden",
                              background: "#e2e8f0",
                            }}
                          >
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

                          <h4 style={{ marginTop: 16, fontSize: 19, fontWeight: 900 }}>
                            {video.title}
                          </h4>

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
    
{user?.verified && (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
    }}
  >
    <button
      onClick={() => {
        localStorage.removeItem("ss_learning_user");
        location.reload();
      }}
      style={{
        background: "#b91c1c",
        color: "white",
        border: 0,
        padding: "10px 16px",
        borderRadius: "12px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>
)}

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

const successBox = {
  marginTop: 20,
  padding: 20,
  borderRadius: 20,
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#064e3b",
  lineHeight: 1.8,
};

const videoCard = {
  padding: 18,
  borderRadius: 22,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
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
