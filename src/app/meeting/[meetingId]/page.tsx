"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "https://serenade-backend-ly1w.onrender.com";

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = String(params.meetingId || "");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<any>(null);

  const [participantId, setParticipantId] = useState("");
  const [status, setStatus] = useState("Checking access...");
  const [approved, setApproved] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  function getAccess() {
    try {
      return JSON.parse(sessionStorage.getItem("ss_meeting_access") || "{}");
    } catch {
      return {};
    }
  }

  async function requestWaitingRoom() {
    const access = getAccess();

    if (!access.meetingId || access.meetingId !== meetingId) {
      window.location.href = "/meeting";
      return;
    }

    setStatus("Waiting for host approval...");

    const res = await fetch(`${BACKEND_URL}/meetings/waiting-room/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingId,
        fullName: access.fullName || "Serenade Member",
        memberId: access.memberId || "",
      }),
    });

    const data = await res.json();
    setParticipantId(data.id);

    pollRef.current = setInterval(async () => {
      const listRes = await fetch(`${BACKEND_URL}/meetings/${meetingId}/waiting-room`, {
        cache: "no-store",
      });

      const list = await listRes.json();
      const me = Array.isArray(list) ? list.find((x: any) => x.id === data.id) : null;

      if (!me) return;

      if (me.status === "APPROVED") {
        clearInterval(pollRef.current);
        setApproved(true);
        setStatus("Approved. You can start your camera.");
        await logJoin();
      }

      if (me.status === "REJECTED") {
        clearInterval(pollRef.current);
        setStatus("Your request was rejected by the host.");
      }
    }, 2500);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setStatus("Camera or microphone permission denied.");
    }
  }

  function toggleAudio() {
    const stream = streamRef.current;
    if (!stream) return;

    const next = !audioOn;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setAudioOn(next);
  }

  function toggleVideo() {
    const stream = streamRef.current;
    if (!stream) return;

    const next = !videoOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setVideoOn(next);
  }

  async function logJoin() {
    try {
      await fetch(`${BACKEND_URL}/meetings/${meetingId}/join-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {}
  }

  async function logLeave() {
    try {
      await fetch(`${BACKEND_URL}/meetings/${meetingId}/leave-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {}
  }

  async function leaveMeeting() {
    if (pollRef.current) clearInterval(pollRef.current);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    await logLeave();

    sessionStorage.removeItem("ss_meeting_access");
    window.location.href = "/meeting";
  }

  useEffect(() => {
    requestWaitingRoom();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [meetingId]);

  return (
    <main style={main}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/member-hub" style={backLink}>← Back to Members Hub</Link>

        <header style={header}>
          <div>
            <p style={eyebrow}>SERENADE SINGERS MEETING</p>
            <h1 style={title}>{meetingId}</h1>
            <p>{status}</p>
          </div>

          <button onClick={leaveMeeting} style={dangerButton}>
            Leave Meeting
          </button>
        </header>

        {!approved ? (
          <section style={card}>
            <h2>Waiting Room</h2>
            <p>Please wait until the host approves your request.</p>
            <p><strong>Meeting ID:</strong> {meetingId}</p>
            <button onClick={leaveMeeting} style={dangerButton}>
              Cancel / Leave
            </button>
          </section>
        ) : (
          <section style={roomGrid}>
            <div style={videoPanel}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={videoStyle}
              />

              <div style={controls}>
                <button onClick={startCamera} style={button}>Start Camera</button>
                <button onClick={toggleAudio} style={button}>{audioOn ? "Mute" : "Unmute"}</button>
                <button onClick={toggleVideo} style={button}>{videoOn ? "Camera Off" : "Camera On"}</button>
                <button onClick={leaveMeeting} style={dangerButton}>Leave Meeting</button>
              </div>
            </div>

            <aside style={sidePanel}>
              <h2>Participants</h2>
              <div style={participantCard}>You</div>

              <h2 style={{ marginTop: 24 }}>Meeting Chat</h2>
              <div style={chatBox}>Chat foundation is ready.</div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

const main = {
  minHeight: "100vh",
  background: "#061A2F",
  color: "#fff",
  padding: 24,
};

const backLink = {
  color: "#D4AF37",
  fontWeight: 900,
  textDecoration: "none",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  margin: "24px 0",
  flexWrap: "wrap" as const,
};

const eyebrow = {
  color: "#D4AF37",
  fontWeight: 900,
  letterSpacing: 1,
};

const title = {
  fontSize: 36,
  margin: "8px 0",
};

const card = {
  padding: 28,
  borderRadius: 24,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const roomGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
  gap: 20,
};

const videoPanel = {
  padding: 16,
  borderRadius: 24,
  background: "#020617",
  border: "1px solid rgba(255,255,255,0.14)",
};

const videoStyle = {
  width: "100%",
  minHeight: 420,
  borderRadius: 18,
  background: "#000",
  objectFit: "cover" as const,
};

const controls = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap" as const,
  justifyContent: "center",
  marginTop: 16,
};

const button = {
  border: 0,
  borderRadius: 999,
  padding: "12px 18px",
  background: "#D4AF37",
  color: "#061A2F",
  fontWeight: 900,
  cursor: "pointer",
};

const dangerButton = {
  ...button,
  background: "#EF4444",
  color: "#fff",
};

const sidePanel = {
  padding: 20,
  borderRadius: 24,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const participantCard = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.12)",
  fontWeight: 900,
};

const chatBox = {
  minHeight: 220,
  padding: 14,
  borderRadius: 16,
  background: "rgba(0,0,0,0.25)",
  opacity: 0.8,
};
