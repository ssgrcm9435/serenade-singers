"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

const SIGNALING_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:3000";

export default function MeetingRoomPage({
  params,
}: {
  params: { meetingId: string };
}) {
  const meetingId = params.meetingId;
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("Ready to join meeting");
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);

  async function startLocalMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }

  async function joinMeeting() {
    try {
      setStatus("Starting camera and microphone...");
      await startLocalMedia();

      const socket = io(SIGNALING_URL, {
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("Connected to meeting server");
        socket.emit("join-meeting", {
          meetingId,
          fullName: "Serenade Member",
        });
      });

      socket.on("joined-meeting", (data) => {
        setJoined(true);
        setStatus(`Joined meeting: ${data.meetingId}`);
      });

      socket.on("participant-joined", (data) => {
        setParticipants((prev) =>
          prev.includes(data.socketId) ? prev : [...prev, data.socketId]
        );
      });

      socket.on("participant-left", (data) => {
        setParticipants((prev) => prev.filter((id) => id !== data.socketId));
      });

      socket.on("participant-media-updated", (data) => {
        console.log("Participant media updated", data);
      });
    } catch {
      setStatus("Unable to access camera or microphone.");
    }
  }

  function leaveMeeting() {
    socketRef.current?.emit("leave-meeting", { meetingId });
    socketRef.current?.disconnect();

    streamRef.current?.getTracks().forEach((track) => track.stop());

    setJoined(false);
    setParticipants([]);
    setStatus("Left meeting");

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
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
    socketRef.current?.emit("toggle-media", {
      meetingId,
      audio: next,
      video: videoOn,
    });
  }

  function toggleVideo() {
    const stream = streamRef.current;
    if (!stream) return;

    const next = !videoOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });

    setVideoOn(next);
    socketRef.current?.emit("toggle-media", {
      meetingId,
      audio: audioOn,
      video: next,
    });
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#061A2F",
        color: "#ffffff",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/member-hub" style={{ color: "#D4AF37", fontWeight: 800 }}>
          ← Back to Members Hub
        </Link>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p style={{ color: "#D4AF37", fontWeight: 900, letterSpacing: 1 }}>
            SERENADE SINGERS MEETING
          </p>
          <h1 style={{ fontSize: 36, margin: "8px 0" }}>{meetingId}</h1>
          <p style={{ opacity: 0.8 }}>{status}</p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#020617",
              borderRadius: 24,
              padding: 16,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                minHeight: 420,
                background: "#111827",
                borderRadius: 18,
                objectFit: "cover",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              {!joined ? (
                <button onClick={joinMeeting} style={primaryButton}>
                  Join Meeting
                </button>
              ) : (
                <button onClick={leaveMeeting} style={dangerButton}>
                  Leave Meeting
                </button>
              )}

              <button onClick={toggleAudio} style={controlButton}>
                {audioOn ? "Mute" : "Unmute"}
              </button>

              <button onClick={toggleVideo} style={controlButton}>
                {videoOn ? "Camera Off" : "Camera On"}
              </button>
            </div>
          </div>

          <aside
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 24,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Participants</h2>
            <p style={{ opacity: 0.75 }}>
              Online participants will appear here.
            </p>

            <div style={{ marginTop: 16 }}>
              <div style={participantCard}>You</div>

              {participants.map((id) => (
                <div key={id} style={participantCard}>
                  Participant {id.slice(0, 6)}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

const primaryButton = {
  border: 0,
  borderRadius: 999,
  padding: "12px 18px",
  background: "#D4AF37",
  color: "#061A2F",
  fontWeight: 900,
  cursor: "pointer",
};

const dangerButton = {
  ...primaryButton,
  background: "#EF4444",
  color: "#ffffff",
};

const controlButton = {
  ...primaryButton,
  background: "#ffffff",
  color: "#061A2F",
};

const participantCard = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.1)",
  marginBottom: 10,
  fontWeight: 800,
};
