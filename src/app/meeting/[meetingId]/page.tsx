"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "https://serenade-backend-ly1w.onrender.com";

type RemoteStream = {
  socketId: string;
  stream: MediaStream;
  fullName?: string;
};

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = String(params.meetingId || "");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<any>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});

  const [participantId, setParticipantId] = useState("");
  const [status, setStatus] = useState("Checking access...");
  const [approved, setApproved] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  function getAccess() {
    try {
      return JSON.parse(sessionStorage.getItem("ss_meeting_access") || "{}");
    } catch {
      return {};
    }
  }

  function createPeerConnection(targetSocketId: string) {
    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    streamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current as MediaStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          meetingId,
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => {
        if (prev.some((x) => x.socketId === targetSocketId)) return prev;
        return [...prev, { socketId: targetSocketId, stream: remoteStream }];
      });
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  }

  async function makeOffer(targetSocketId: string) {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current?.emit("webrtc-offer", {
      meetingId,
      targetSocketId,
      offer,
    });
  }

  async function startCamera() {
    try {
      if (streamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setStatus("Camera and microphone started.");

      socketRef.current?.emit("join-meeting", {
        meetingId,
        fullName: getAccess().fullName || "Serenade Member",
      });
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

  async function requestWaitingRoom() {
    const access = getAccess();

    if (!access.meetingId || access.meetingId !== meetingId) {
      window.location.href = "/meeting";
      return;
    }

    setStatus("Waiting for host approval.");

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
        setStatus("Approved. Click Start Camera.");
        await logJoin();
        connectSocket();
      }

      if (me.status === "REJECTED") {
        clearInterval(pollRef.current);
        setStatus("Rejected by host.");
      }
    }, 2500);
  }

  function connectSocket() {
    if (socketRef.current) return;

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Connected to meeting server.");
    });

    socket.on("existing-participants", async (data) => {
      if (!streamRef.current) return;

      for (const participant of data.participants || []) {
        if (participant.socketId !== socket.id) {
          await makeOffer(participant.socketId);
        }
      }
    });

    socket.on("participant-joined", async (participant) => {
      if (!streamRef.current) return;

      if (participant.socketId !== socket.id) {
        await makeOffer(participant.socketId);
      }
    });

    socket.on("webrtc-offer", async (data) => {
      const pc = createPeerConnection(data.fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        meetingId,
        targetSocketId: data.fromSocketId,
        answer,
      });
    });

    socket.on("webrtc-answer", async (data) => {
      const pc = peerConnectionsRef.current[data.fromSocketId];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("ice-candidate", async (data) => {
      const pc = peerConnectionsRef.current[data.fromSocketId];
      if (!pc || !data.candidate) return;
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on("participant-left", (data) => {
      peerConnectionsRef.current[data.socketId]?.close();
      delete peerConnectionsRef.current[data.socketId];
      setRemoteStreams((prev) => prev.filter((x) => x.socketId !== data.socketId));
    });

    socket.on("host-mute-all", () => {
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setAudioOn(false);
      setStatus("Host muted all participants.");
    });

    socket.on("host-end-meeting", () => {
      leaveMeeting();
    });

    socket.on("host-remove-participant", () => {
      leaveMeeting();
    });
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

    socketRef.current?.emit("leave-meeting", { meetingId });
    socketRef.current?.disconnect();

    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};

    streamRef.current?.getTracks().forEach((track) => track.stop());

    await logLeave();

    sessionStorage.removeItem("ss_meeting_access");
    window.location.href = "/meeting";
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setStatus("Meeting link copied.");
  }

  useEffect(() => {
    requestWaitingRoom();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      socketRef.current?.disconnect();
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [meetingId]);

  return (
    <main style={page}>
      <header style={topbar}>
        <div>
          <p style={brand}>SERENADE MEET</p>
          <h1 style={meetingTitle}>{meetingId}</h1>
        </div>

        <div style={topActions}>
          <span style={statusPill}>{status}</span>
          <button onClick={copyLink} style={lightButton}>Copy Link</button>
          <button onClick={leaveMeeting} style={leaveButton}>Leave</button>
        </div>
      </header>

      <section style={layout}>
        <div style={stage}>
          {!approved ? (
            <div style={waitingCard}>
              <div style={waitingIcon}>♪</div>
              <h2 style={{ margin: 0 }}>Waiting for Host Approval</h2>
              <p style={muted}>Your request has been sent to the host. Please stay on this page.</p>
              <p style={smallText}>Meeting ID: {meetingId}</p>
              <button onClick={leaveMeeting} style={leaveButton}>Cancel Request</button>
            </div>
          ) : (
            <>
              <div style={videoGrid}>
                <div style={videoFrame}>
                  <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
                  <div style={nameBadge}>You</div>
                </div>

                {remoteStreams.map((item) => (
                  <RemoteVideo key={item.socketId} item={item} />
                ))}
              </div>

              <div style={toolbar}>
                <button onClick={startCamera} style={toolButton}>Start Camera</button>
                <button onClick={toggleAudio} style={toolButton}>{audioOn ? "Mute" : "Unmute"}</button>
                <button onClick={toggleVideo} style={toolButton}>{videoOn ? "Camera Off" : "Camera On"}</button>
                <button style={toolButton}>Share Screen</button>
                <button style={toolButton}>Raise Hand</button>
                <button onClick={leaveMeeting} style={leaveButton}>Leave</button>
              </div>
            </>
          )}
        </div>

        <aside style={sidebar}>
          <section style={sideCard}>
            <h3 style={sideTitle}>Participants</h3>
            <div style={participant}>You</div>
            {remoteStreams.map((r) => (
              <div key={r.socketId} style={participant}>Guest {r.socketId.slice(0, 5)}</div>
            ))}
            {participantId && <div style={participant}>Request ID: {participantId.slice(0, 8)}</div>}
          </section>

          <section style={sideCard}>
            <h3 style={sideTitle}>Meeting Chat</h3>
            <div style={chatBox}>No messages yet.</div>
            <div style={chatInputRow}>
              <input placeholder="Type message..." style={chatInput} />
              <button style={sendButton}>Send</button>
            </div>
          </section>
        </aside>
      </section>

      <Link href="/member-hub" style={backLink}>← Back to Members Hub</Link>
    </main>
  );
}

function RemoteVideo({ item }: { item: RemoteStream }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = item.stream;
  }, [item.stream]);

  return (
    <div style={videoFrame}>
      <video ref={ref} autoPlay playsInline style={videoStyle} />
      <div style={nameBadge}>Guest {item.socketId.slice(0, 5)}</div>
    </div>
  );
}

const page = { minHeight: "100vh", background: "linear-gradient(135deg, #061A2F 0%, #07111f 100%)", color: "#ffffff", padding: 22 };
const topbar = { maxWidth: 1280, margin: "0 auto 20px", padding: "16px 20px", borderRadius: 24, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" as const };
const brand = { margin: 0, color: "#D4AF37", fontWeight: 900, letterSpacing: 1.5, fontSize: 13 };
const meetingTitle = { margin: "6px 0 0", fontSize: 28, lineHeight: 1.1 };
const topActions = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const };
const statusPill = { padding: "10px 14px", borderRadius: 999, background: "rgba(212,175,55,0.16)", color: "#FDE68A", fontWeight: 900 };
const layout = { maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 20 };
const stage = { minHeight: 620, borderRadius: 28, background: "rgba(2,6,23,0.82)", border: "1px solid rgba(255,255,255,0.12)", padding: 18, display: "flex", flexDirection: "column" as const, justifyContent: "center" };
const waitingCard = { margin: "0 auto", maxWidth: 520, textAlign: "center" as const, padding: 34, borderRadius: 28, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" };
const waitingIcon = { width: 70, height: 70, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#D4AF37", color: "#061A2F", fontSize: 34, fontWeight: 900 };
const muted = { color: "rgba(255,255,255,0.72)" };
const smallText = { color: "rgba(255,255,255,0.6)", fontSize: 14 };
const videoGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, alignContent: "start" };
const videoFrame = { position: "relative" as const, minHeight: 300, borderRadius: 24, overflow: "hidden", background: "#000" };
const videoStyle = { width: "100%", height: "100%", minHeight: 300, objectFit: "cover" as const, background: "#000" };
const nameBadge = { position: "absolute" as const, left: 18, bottom: 18, padding: "8px 12px", borderRadius: 999, background: "rgba(0,0,0,0.58)", fontWeight: 900 };
const toolbar = { marginTop: 16, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" as const };
const toolButton = { border: 0, borderRadius: 999, padding: "12px 16px", background: "#ffffff", color: "#061A2F", fontWeight: 900, cursor: "pointer" };
const lightButton = { ...toolButton };
const leaveButton = { ...toolButton, background: "#EF4444", color: "#ffffff" };
const sidebar = { display: "grid", gap: 16, alignContent: "start" };
const sideCard = { padding: 18, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" };
const sideTitle = { marginTop: 0 };
const participant = { padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.12)", fontWeight: 900, marginBottom: 10 };
const chatBox = { minHeight: 260, padding: 14, borderRadius: 16, background: "rgba(0,0,0,0.22)", color: "rgba(255,255,255,0.68)" };
const chatInputRow = { marginTop: 12, display: "flex", gap: 8 };
const chatInput = { flex: 1, border: 0, borderRadius: 999, padding: "12px 14px" };
const sendButton = { border: 0, borderRadius: 999, padding: "12px 16px", background: "#D4AF37", color: "#061A2F", fontWeight: 900 };
const backLink = { display: "block", maxWidth: 1280, margin: "18px auto 0", color: "#D4AF37", fontWeight: 900, textDecoration: "none" };
