"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "http://localhost:3000";

export default function HostMeetingPage({ params }: { params: { meetingId: string } }) {
  const meetingId = params.meetingId;
  const socketRef = useRef<Socket | null>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notice, setNotice] = useState("");

  async function loadAnalytics() {
    const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/analytics`);
    const data = await res.json();
    setAnalytics(data);
  }

  async function loadHistory() {
    const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/history`);
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  }

  async function loadWaitingRoom() {
    const res = await fetch(`${BACKEND_URL}/meetings/${meetingId}/waiting-room`);
    const data = await res.json();
    setWaitingList(Array.isArray(data) ? data : []);
  }

  async function approve(p: any) {
    await fetch(`${BACKEND_URL}/meetings/waiting-room/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: p.id }),
    });

    socketRef.current?.emit("waiting-room-approved", {
      meetingId,
      socketId: p.socketId,
    });

    loadWaitingRoom();
    loadHistory();
    loadAnalytics();
  }

  async function reject(p: any) {
    await fetch(`${BACKEND_URL}/meetings/waiting-room/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: p.id }),
    });

    socketRef.current?.emit("waiting-room-rejected", {
      meetingId,
      socketId: p.socketId,
    });

    loadWaitingRoom();
  }

  function muteAll() {
    socketRef.current?.emit("host-mute-all", { meetingId });
    setNotice("Mute all command sent.");
  }

  function endMeeting() {
    socketRef.current?.emit("host-end-meeting", { meetingId });
    setNotice("Meeting ended for everyone.");
  }

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-host-room", { meetingId });
    });

    socket.on("waiting-room-request", () => {
      loadWaitingRoom();
      setNotice("New participant is waiting.");
    });

    loadWaitingRoom();

    return () => {
      socket.disconnect();
    };
  }, [meetingId]);

  return (
    <main style={{ minHeight: "100vh", background: "#061A2F", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href={`/meeting/${meetingId}`} style={{ color: "#D4AF37", fontWeight: 900 }}>
          ← Back to Meeting
        </Link>

        <h1>Host Control Panel</h1>
        <p style={{ opacity: 0.75 }}>Meeting ID: {meetingId}</p>

        {notice && <p style={{ background: "#D4AF37", color: "#061A2F", padding: 12, borderRadius: 12, fontWeight: 900 }}>{notice}</p>}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <button onClick={muteAll} style={button}>Mute All</button>
          <button onClick={endMeeting} style={{ ...button, background: "#EF4444", color: "#fff" }}>End Meeting</button>
          <button onClick={loadWaitingRoom} style={button}>Refresh Waiting Room</button>
          <button onClick={loadHistory} style={button}>Refresh History</button>
          <button onClick={loadAnalytics} style={button}>Refresh Analytics</button>
        </div>

        <h2>Meeting Analytics</h2>

        {analytics ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            <div style={card}><strong>Join Events</strong><p>{analytics.totalJoinEvents}</p></div>
            <div style={card}><strong>Leave Events</strong><p>{analytics.totalLeaveEvents}</p></div>
            <div style={card}><strong>Total Logs</strong><p>{analytics.totalLogs}</p></div>
          </div>
        ) : (
          <p>No analytics loaded.</p>
        )}

        <h2>Waiting Room</h2>

        {waitingList.length === 0 ? (
          <p>No participants waiting.</p>
        ) : (
          waitingList.map((p) => (
            <div key={p.id} style={card}>
              <div>
                <strong>{p.fullName}</strong>
                <p style={{ margin: "4px 0", opacity: 0.75 }}>
                  {p.memberId || "No Member ID"} · {p.status}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => approve(p)} style={button}>Approve</button>
                <button onClick={() => reject(p)} style={{ ...button, background: "#EF4444", color: "#fff" }}>Reject</button>
              </div>
            </div>
          ))
        )}

        <h2 style={{ marginTop: 32 }}>Meeting History</h2>

        {history.length === 0 ? (
          <p>No meeting activity yet.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} style={card}>
              <div>
                <strong>{item.action}</strong>
                <p style={{ margin: "4px 0", opacity: 0.75 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const button = {
  border: 0,
  borderRadius: 999,
  padding: "10px 16px",
  background: "#D4AF37",
  color: "#061A2F",
  fontWeight: 900,
  cursor: "pointer",
};

const card = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: 16,
  marginBottom: 12,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};
