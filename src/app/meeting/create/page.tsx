"use client";

import { useState } from "react";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "http://localhost:3000";

export default function CreateMeetingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createMeeting() {
    setMessage("");
    setResult(null);

    if (!title.trim() || !startTime) {
      setMessage("Please enter title and start time.");
      return;
    }

    setLoading(true);

    try {
      const roomName = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now();

      const res = await fetch(`${BACKEND_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startTime: new Date(startTime).toISOString(),
          roomName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Unable to create meeting.");
        return;
      }

      setResult(data);
    } catch {
      setMessage("Meeting server is not available.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage("Copied.");
  }

  return (
    <main style={main}>
      <section style={card}>
        <Link href="/member-hub" style={back}>← Back to Members Hub</Link>

        <p style={eyebrow}>SERENADE SINGERS MEETING</p>
        <h1 style={titleStyle}>Create Meeting</h1>

        <label style={label}>Meeting Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />

        <label style={label}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{...input, minHeight: 90}} />

        <label style={label}>Start Time</label>
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={input} />

        <button onClick={createMeeting} disabled={loading} style={button}>
          {loading ? "Creating..." : "Create Meeting"}
        </button>

        {message && <p style={notice}>{message}</p>}

        {result && (
          <div style={resultBox}>
            <h2>Meeting Created</h2>
            <p><strong>Meeting ID:</strong> {result.meetingId}</p>
            <p><strong>Passcode:</strong> {result.passcode || "No passcode"}</p>

            <button onClick={() => copyText(result.meetingId)} style={button}>Copy Meeting ID</button>
            <button onClick={() => copyText(result.passcode || "")} style={button}>Copy Passcode</button>

            <Link href={`/meeting/${result.meetingId}/host`} style={hostLink}>
              Open Host Panel
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

const main = { minHeight: "100vh", background: "#061A2F", color: "#fff", padding: 24, display: "flex", justifyContent: "center", alignItems: "center" };
const card = { width: "min(560px, 100%)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 28, padding: 28 };
const back = { color: "#D4AF37", fontWeight: 900 };
const eyebrow = { marginTop: 26, color: "#D4AF37", fontWeight: 900, letterSpacing: 1 };
const titleStyle = { fontSize: 34, margin: "8px 0 20px" };
const label = { display: "block", marginTop: 14, marginBottom: 8, color: "#FDE68A", fontWeight: 900 };
const input = { width: "100%", border: 0, borderRadius: 16, padding: "13px 14px", fontSize: 16, fontWeight: 700 };
const button = { marginTop: 14, marginRight: 8, border: 0, borderRadius: 999, padding: "12px 16px", background: "#D4AF37", color: "#061A2F", fontWeight: 900, cursor: "pointer" };
const notice = { marginTop: 16, color: "#FDE68A", fontWeight: 800 };
const resultBox = { marginTop: 22, padding: 18, borderRadius: 20, background: "rgba(0,0,0,.22)" };
const hostLink = { display: "block", marginTop: 16, color: "#D4AF37", fontWeight: 900 };
