"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "https://serenade-backend-ly1w.onrender.com";

export default function HostMeetingPage() {
  const params = useParams();
  const meetingId = String(params.meetingId || "");

  const [meeting, setMeeting] = useState<any>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [message, setMessage] = useState("Loading host controls...");

  async function loadMeeting() {
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setMeeting(data);
    } catch {
      setMessage("Cannot load meeting details.");
    }
  }

  async function loadWaitingRoom() {
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/waiting-room`, {
        cache: "no-store",
      });
      const data = await res.json();
      setWaitingList(Array.isArray(data) ? data : []);
      setMessage("Waiting room refreshed.");
    } catch {
      setMessage("Cannot load waiting room.");
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/history`, {
        cache: "no-store",
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function loadAnalytics() {
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/analytics`, {
        cache: "no-store",
      });
      const data = await res.json();
      setAnalytics(data);
    } catch {}
  }

  async function approve(p: any) {
    try {
      await fetch(`${BACKEND_URL}/meetings/waiting-room/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: p.id }),
      });

      setMessage(`${p.fullName || "Participant"} approved.`);
      await loadWaitingRoom();
    } catch {
      setMessage("Approve failed.");
    }
  }

  async function reject(p: any) {
    try {
      await fetch(`${BACKEND_URL}/meetings/waiting-room/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: p.id }),
      });

      setMessage(`${p.fullName || "Participant"} rejected.`);
      await loadWaitingRoom();
    } catch {
      setMessage("Reject failed.");
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage("Copied.");
  }

  async function refreshAll() {
    await Promise.all([
      loadMeeting(),
      loadWaitingRoom(),
      loadHistory(),
      loadAnalytics(),
    ]);
  }

  useEffect(() => {
    refreshAll();

    const timer = setInterval(() => {
      loadWaitingRoom();
      loadAnalytics();
    }, 4000);

    return () => clearInterval(timer);
  }, [meetingId]);

  const pending = waitingList.filter((p) => p.status === "PENDING");
  const approved = waitingList.filter((p) => p.status === "APPROVED");
  const rejected = waitingList.filter((p) => p.status === "REJECTED");

  return (
    <main style={page}>
      <header style={topbar}>
        <div>
          <p style={brand}>SERENADE MEET HOST</p>
          <h1 style={title}>{meeting?.title || "Host Control Panel"}</h1>
          <p style={muted}>Meeting ID: {meetingId}</p>
        </div>

        <div style={topActions}>
          <button onClick={() => copy(meetingId)} style={button}>Copy ID</button>
          <button onClick={() => copy(meeting?.passcode || "")} style={button}>Copy Passcode</button>
          <button onClick={() => copy(`${window.location.origin}/meeting/${meetingId}`)} style={button}>Copy Link</button>
          <Link href={`/meeting/${meetingId}`} target="_blank" style={linkButton}>Open Room</Link>
        </div>
      </header>

      {message && <div style={notice}>{message}</div>}

      <section style={grid}>
        <div style={mainColumn}>
          <section style={card}>
            <div style={sectionHeader}>
              <div>
                <h2 style={sectionTitle}>Waiting Room</h2>
                <p style={muted}>Approve participants before they enter the meeting.</p>
              </div>
              <button onClick={loadWaitingRoom} style={button}>Refresh</button>
            </div>

            {pending.length === 0 ? (
              <div style={emptyBox}>No participants waiting.</div>
            ) : (
              <div style={list}>
                {pending.map((p) => (
                  <article key={p.id} style={personCard}>
                    <div>
                      <h3 style={personName}>{p.fullName || "Participant"}</h3>
                      <p style={muted}>Member ID: {p.memberId || "N/A"}</p>
                      <p style={muted}>Requested: {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</p>
                    </div>

                    <div style={personActions}>
                      <button onClick={() => approve(p)} style={approveButton}>Approve</button>
                      <button onClick={() => reject(p)} style={rejectButton}>Reject</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Approved Participants</h2>
            {approved.length === 0 ? (
              <div style={emptyBox}>No approved participants yet.</div>
            ) : (
              approved.map((p) => (
                <div key={p.id} style={compactRow}>
                  <strong>{p.fullName || "Participant"}</strong>
                  <span>Approved</span>
                </div>
              ))
            )}
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Meeting History</h2>
            {history.length === 0 ? (
              <div style={emptyBox}>No activity yet.</div>
            ) : (
              history.slice(-10).reverse().map((h) => (
                <div key={h.id} style={compactRow}>
                  <strong>{h.action}</strong>
                  <span>{h.createdAt ? new Date(h.createdAt).toLocaleString() : "-"}</span>
                </div>
              ))
            )}
          </section>
        </div>

        <aside style={sideColumn}>
          <section style={card}>
            <h2 style={sectionTitle}>Meeting Details</h2>
            <p><strong>ID:</strong> {meetingId}</p>
            <p><strong>Passcode:</strong> {meeting?.passcode || "-"}</p>
            <p><strong>Status:</strong> {meeting?.status || "-"}</p>
            <p><strong>Waiting Room:</strong> {meeting?.waitingRoom ? "Enabled" : "Disabled"}</p>
            <p><strong>Start:</strong> {meeting?.startTime ? new Date(meeting.startTime).toLocaleString() : "-"}</p>
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Analytics</h2>
            <div style={statGrid}>
              <div style={statBox}><strong>{pending.length}</strong><span>Pending</span></div>
              <div style={statBox}><strong>{approved.length}</strong><span>Approved</span></div>
              <div style={statBox}><strong>{rejected.length}</strong><span>Rejected</span></div>
              <div style={statBox}><strong>{analytics?.totalLogs || 0}</strong><span>Logs</span></div>
            </div>
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Host Actions</h2>
            <button onClick={refreshAll} style={fullButton}>Refresh All</button>
            <Link href="/admin-dashboard" style={fullLink}>Back to Admin</Link>
          </section>
        </aside>
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #061A2F 0%, #07111f 100%)",
  color: "#ffffff",
  padding: 22,
};

const topbar = {
  maxWidth: 1280,
  margin: "0 auto 18px",
  padding: 20,
  borderRadius: 24,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.13)",
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const brand = {
  margin: 0,
  color: "#D4AF37",
  fontWeight: 900,
  letterSpacing: 1.5,
  fontSize: 13,
};

const title = {
  margin: "6px 0",
  fontSize: 30,
};

const muted = {
  color: "rgba(255,255,255,0.68)",
  margin: "5px 0",
};

const topActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
};

const notice = {
  maxWidth: 1280,
  margin: "0 auto 18px",
  padding: 14,
  borderRadius: 16,
  background: "rgba(212,175,55,0.18)",
  color: "#FDE68A",
  fontWeight: 900,
};

const grid = {
  maxWidth: 1280,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 360px",
  gap: 18,
};

const mainColumn = {
  display: "grid",
  gap: 18,
};

const sideColumn = {
  display: "grid",
  gap: 18,
  alignContent: "start",
};

const card = {
  padding: 20,
  borderRadius: 24,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.13)",
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const sectionTitle = {
  margin: "0 0 8px",
};

const list = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const personCard = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const personName = {
  margin: "0 0 6px",
};

const personActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
};

const button = {
  border: 0,
  borderRadius: 999,
  padding: "10px 14px",
  background: "#D4AF37",
  color: "#061A2F",
  fontWeight: 900,
  cursor: "pointer",
};

const linkButton = {
  ...button,
  textDecoration: "none",
};

const approveButton = {
  ...button,
  background: "#22C55E",
  color: "#052E16",
};

const rejectButton = {
  ...button,
  background: "#EF4444",
  color: "#ffffff",
};

const fullButton = {
  ...button,
  width: "100%",
  marginBottom: 10,
};

const fullLink = {
  ...button,
  display: "block",
  textAlign: "center" as const,
  textDecoration: "none",
};

const emptyBox = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(0,0,0,0.2)",
  color: "rgba(255,255,255,0.66)",
};

const compactRow = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 10,
};

const statGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const statBox = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(0,0,0,0.22)",
  display: "grid",
  gap: 4,
};
