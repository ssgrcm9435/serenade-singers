"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "http://localhost:3000";

export default function JoinMeetingPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function joinMeeting() {
    setMessage("");

    if (!meetingId.trim()) {
      setMessage("Please enter Meeting ID.");
      return;
    }

    if (!passcode.trim()) {
      setMessage("Please enter Passcode.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/meetings/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: meetingId.trim().toUpperCase(),
          passcode: passcode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || "Unable to join meeting.");
        return;
      }

      sessionStorage.setItem(
        "ss_meeting_access",
        JSON.stringify({
          meetingId: data.meetingId,
          passcode,
          approvedAt: new Date().toISOString(),
        })
      );

      router.push(`/meeting/${data.meetingId}`);
    } catch {
      setMessage("Meeting server is not available.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(212,175,55,0.18), transparent 34%), #061A2F",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "min(520px, 100%)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
        }}
      >
        <Link href="/member-hub" style={{ color: "#D4AF37", fontWeight: 900 }}>
          ← Back to Members Hub
        </Link>

        <p
          style={{
            marginTop: 28,
            marginBottom: 8,
            color: "#D4AF37",
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          SERENADE SINGERS MEETING
        </p>

        <h1 style={{ margin: "0 0 10px", fontSize: 34 }}>Join Meeting</h1>

        <p style={{ opacity: 0.78, marginBottom: 24 }}>
          Enter the Meeting ID and Passcode provided by the host.
        </p>

        <label style={label}>Meeting ID</label>
        <input
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          placeholder="SSG-XXXX-XXXX"
          style={input}
        />

        <label style={label}>Passcode</label>
        <input
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="6-digit passcode"
          type="password"
          style={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") joinMeeting();
          }}
        />

        <button
          onClick={joinMeeting}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 18,
            border: 0,
            borderRadius: 999,
            padding: "13px 18px",
            background: "#D4AF37",
            color: "#061A2F",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {loading ? "Checking..." : "Join Meeting"}
        </button>

        {message && (
          <p
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 14,
              background: "rgba(239,68,68,0.16)",
              color: "#FCA5A5",
              fontWeight: 800,
            }}
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

const label = {
  display: "block",
  marginBottom: 8,
  marginTop: 14,
  fontSize: 13,
  fontWeight: 900,
  color: "#FDE68A",
};

const input = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.96)",
  color: "#061A2F",
  borderRadius: 16,
  padding: "13px 14px",
  fontSize: 16,
  fontWeight: 800,
  outline: "none",
};
