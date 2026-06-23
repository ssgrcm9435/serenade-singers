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
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});

  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("Ready to join meeting");
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [notice, setNotice] = useState("");
  const [accessChecked, setAccessChecked] = useState(false);

  function createPeerConnection(targetSocketId: string) {
    const socket = socketRef.current;
    const localStream = streamRef.current;
    if (!socket || !localStream) return null;

    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          meetingId,
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({
        ...prev,
        [targetSocketId]: remoteStream,
      }));
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  }

  async function callParticipant(targetSocketId: string) {
    const socket = socketRef.current;
    const pc = createPeerConnection(targetSocketId);
    if (!socket || !pc) return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc-offer", {
      meetingId,
      targetSocketId,
      offer,
    });
  }

  async function startLocalMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;
    cameraTrackRef.current = stream.getVideoTracks()[0] || null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }

  async function joinMeeting() {
    try {
      setStatus("Starting camera and microphone...");
      await startLocalMedia();

      const socket = io(SIGNALING_URL, { transports: ["websocket"] });
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
        socket.emit("join-meeting-chat", {
          meetingId,
          fullName: "Serenade Member",
        });
      });

      socket.on("existing-participants", async (data) => {
        const existing = data.participants || [];
        setParticipants(existing.map((p: any) => p.socketId));

        for (const participant of existing) {
          await callParticipant(participant.socketId);
        }
      });

      socket.on("participant-joined", (data) => {
        setParticipants((prev) =>
          prev.includes(data.socketId) ? prev : [...prev, data.socketId]
        );
      });

      socket.on("participant-left", (data) => {
        peerConnectionsRef.current[data.socketId]?.close();
        delete peerConnectionsRef.current[data.socketId];

        setParticipants((prev) => prev.filter((id) => id !== data.socketId));
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[data.socketId];
          return copy;
        });
      });

      socket.on("webrtc-offer", async (data) => {
        const pc = createPeerConnection(data.fromSocketId);
        if (!pc) return;

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

      socket.on("meeting-chat-message", (data) => {
        setChatMessages((prev) => [...prev, data]);
      });

      socket.on("meeting-chat-system", (data) => {
        setChatMessages((prev) => [
          ...prev,
          {
            senderName: "System",
            message: data.message,
            createdAt: new Date().toISOString(),
          },
        ]);
      });

      socket.on("hand-raised", (data) => {
        setNotice(`${data.fullName || "A participant"} raised hand`);
      });

      socket.on("host-announcement", (data) => {
        setNotice(data.message);
      });

      socket.on("screen-share-started", () => {
        setNotice("Screen sharing started");
      });

      socket.on("screen-share-stopped", () => {
        setNotice("Screen sharing stopped");
      });
    } catch {
      setStatus("Unable to access camera or microphone.");
    }
  }

  function leaveMeeting() {
    socketRef.current?.emit("leave-meeting", { meetingId });
    socketRef.current?.disconnect();

    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    setRemoteStreams({});

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

  async function shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) return;

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setScreenSharing(true);
      socketRef.current?.emit("screen-share-started", { meetingId });

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch {
      setStatus("Unable to start screen sharing.");
    }
  }

  function stopScreenShare() {
    const cameraTrack = cameraTrackRef.current;
    const localStream = streamRef.current;

    if (cameraTrack) {
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(cameraTrack);
      });
    }

    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    setScreenSharing(false);
    socketRef.current?.emit("screen-share-stopped", { meetingId });
  }

  function raiseHand() {
    socketRef.current?.emit("raise-hand", {
      meetingId,
      fullName: "Serenade Member",
    });
    setNotice("You raised your hand");
  }

  function sendChatMessage() {
    if (!chatInput.trim()) return;

    socketRef.current?.emit("meeting-chat-message", {
      meetingId,
      senderName: "Serenade Member",
      message: chatInput.trim(),
    });

    setChatInput("");
  }

  async function copyMeetingLink() {
    await navigator.clipboard.writeText(window.location.href);
    setNotice("Meeting link copied");
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("ss_meeting_access");

    if (!saved) {
      window.location.href = "/meeting";
      return;
    }

    try {
      const access = JSON.parse(saved);

      if (access.meetingId !== meetingId) {
        window.location.href = "/meeting";
        return;
      }

      setAccessChecked(true);
    } catch {
      window.location.href = "/meeting";
    }

    return () => {
      socketRef.current?.disconnect();
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [meetingId]);

  if (!accessChecked) {
    return (
      <main style={main}>
        <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 80 }}>
          <p style={eyebrow}>SERENADE SINGERS MEETING</p>
          <h1 style={title}>Checking meeting access...</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={main}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Link href="/member-hub" style={{ color: "#D4AF37", fontWeight: 900 }}>
          ← Back to Members Hub
        </Link>

        <div style={header}>
          <div>
            <p style={eyebrow}>SERENADE SINGERS MEETING</p>
            <h1 style={title}>{meetingId}</h1>
            <p style={{ opacity: 0.8 }}>{status}</p>
          </div>

          <button onClick={copyMeetingLink} style={controlButton}>
            Copy Link
          </button>
        </div>

        <section style={grid}>
          <div style={videoPanel}>
            <div style={videoGrid}>
              <div style={{ position: "relative" }}>
                <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
                <NameBadge label="You" />
              </div>

              {Object.entries(remoteStreams).map(([socketId, stream]) => (
                <RemoteVideo key={socketId} stream={stream} socketId={socketId} />
              ))}
            </div>

            <div style={controls}>
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

              {!screenSharing ? (
                <button onClick={shareScreen} style={controlButton}>
                  Share Screen
                </button>
              ) : (
                <button onClick={stopScreenShare} style={dangerButton}>
                  Stop Share
                </button>
              )}

              <button onClick={raiseHand} style={controlButton}>
                Raise Hand
              </button>
            </div>
          </div>

          <aside style={sidePanel}>
            {notice && <div style={noticeBox}>{notice}</div>}

            <h2 style={{ marginTop: 0 }}>Participants</h2>
            <div style={{ marginTop: 12 }}>
              <div style={participantCard}>You</div>
              {participants.map((id) => (
                <div key={id} style={participantCard}>
                  Participant {id.slice(0, 6)}
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 24 }}>Meeting Chat</h2>
            <div style={chatBox}>
              {chatMessages.length === 0 ? (
                <p style={{ opacity: 0.65 }}>No messages yet.</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <strong style={{ color: "#D4AF37" }}>
                      {msg.senderName || "Member"}
                    </strong>
                    <p style={{ margin: "4px 0 0", opacity: 0.9 }}>
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChatMessage();
                }}
                placeholder="Type message..."
                style={chatInputStyle}
              />
              <button onClick={sendChatMessage} style={primaryButton}>
                Send
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function RemoteVideo({ stream, socketId }: { stream: MediaStream; socketId: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ position: "relative" }}>
      <video ref={ref} autoPlay playsInline style={videoStyle} />
      <NameBadge label={`Participant ${socketId.slice(0, 6)}`} />
    </div>
  );
}

function NameBadge({ label }: { label: string }) {
  return <div style={nameBadge}>{label}</div>;
}

const main = {
  minHeight: "100vh",
  background: "#061A2F",
  color: "#ffffff",
  padding: 24,
};

const header = {
  marginTop: 24,
  marginBottom: 24,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
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

const grid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
  gap: 20,
};

const videoPanel = {
  background: "#020617",
  borderRadius: 24,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.12)",
};

const videoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const videoStyle = {
  width: "100%",
  minHeight: 260,
  background: "#111827",
  borderRadius: 18,
  objectFit: "cover" as const,
};

const controls = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  flexWrap: "wrap" as const,
  marginTop: 16,
};

const sidePanel = {
  background: "rgba(255,255,255,0.06)",
  borderRadius: 24,
  padding: 20,
  border: "1px solid rgba(255,255,255,0.12)",
};

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

const noticeBox = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(212,175,55,0.18)",
  color: "#FDE68A",
  fontWeight: 900,
  marginBottom: 16,
};

const chatBox = {
  height: 230,
  overflowY: "auto" as const,
  background: "rgba(0,0,0,0.18)",
  borderRadius: 16,
  padding: 12,
  marginBottom: 12,
};

const chatInputStyle = {
  flex: 1,
  border: 0,
  borderRadius: 999,
  padding: "10px 12px",
};

const nameBadge = {
  position: "absolute" as const,
  left: 12,
  bottom: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(0,0,0,0.55)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 800,
};
