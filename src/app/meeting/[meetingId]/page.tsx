"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { Camera, CameraOff, Mic, MicOff, MonitorUp, MonitorOff, Hand, MessageCircle, Send, Users, LogOut, Shield, Lock, Unlock, UserX } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SIGNALING_URL || "";
type Attendee = { socketId: string; fullName: string; role: "host" | "member" };
type Message = { id: string; senderName: string; content: string; createdAt: string };
type MediaTile = { socketId: string; stream: MediaStream };

async function api(path: string, token: string, options: RequestInit = {}) {
  if (!API) throw new Error("Meeting backend is not configured.");
  const response = await fetch(API + path, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token, ...options.headers },
  });
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(value.message || "Meeting request failed (" + response.status + ").");
  return value;
}

export default function SerenadeMeetingRoom() {
  const { meetingId: param } = useParams<{ meetingId: string }>();
  const meetingId = String(param || "").toUpperCase();
  const router = useRouter();
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const camera = useRef<MediaStream | null>(null);
  const screen = useRef<MediaStream | null>(null);
  const socket = useRef<Socket | null>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({});
  const pendingIce = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const active = useRef(false);
  const admitted = useRef("");
  const hostToken = useRef("");
  const [host, setHost] = useState(false);
  const [approved, setApproved] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Checking meeting access…");
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [remote, setRemote] = useState<MediaTile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<"chat" | "people">("chat");
  const [waiting, setWaiting] = useState<{ id: string; fullName: string; status: string }[]>([]);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copyText, setCopyText] = useState("");
  const [name, setName] = useState("Serenade Member");

  function closePeer(id: string) {
    peers.current[id]?.close();
    delete peers.current[id];
    delete pendingIce.current[id];
    setRemote(prev => prev.filter(v => v.socketId !== id));
  }
  function shutdown() {
    active.current = false;
    socket.current?.disconnect();
    socket.current = null;
    Object.keys(peers.current).forEach(closePeer);
    camera.current?.getTracks().forEach(t => t.stop());
    screen.current?.getTracks().forEach(t => t.stop());
    camera.current = null;
    screen.current = null;
  }

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    async function enterWaitingRoom() {
      const admin = sessionStorage.getItem("ss_admin_meeting_token") || "";
      hostToken.current = admin;
      if (admin) {
        if (!cancelled) { setHost(true); setApproved(true); setName("Serenade Host"); setStatus("Host ready. Join the call."); }
        return;
      }
      let access: { meetingId?: string; accessToken?: string; fullName?: string } = {};
      try { access = JSON.parse(sessionStorage.getItem("ss_meeting_access") || "{}"); } catch {}
      if (access.meetingId !== meetingId || !access.accessToken) {
        router.replace("/meeting?meetingId=" + encodeURIComponent(meetingId));
        return;
      }
      if (!cancelled) setName(access.fullName || "Serenade Member");
      try {
        const request = await api("/meetings/waiting-room/request", access.accessToken, {
          method: "POST",
          body: JSON.stringify({ meetingId, fullName: access.fullName || "Serenade Member" }),
        });
        if (cancelled) return;
        admitted.current = request.accessToken;
        sessionStorage.setItem("ss_meeting_admission_token", request.accessToken);
        if (request.status === "APPROVED") {
          setApproved(true);
          setStatus("Approved. You can join the call.");
          return;
        }
        setStatus("In the waiting room. The host must approve you.");
        async function poll() {
          try {
            const state = await api("/meetings/" + encodeURIComponent(meetingId) + "/waiting-room/status", request.accessToken);
            if (cancelled) return;
            if (state.status === "APPROVED") {
              if (timer) clearInterval(timer);
              setApproved(true);
              setStatus("Approved. You can join the call.");
            } else if (state.status === "REJECTED" || state.status === "ENDED") {
              if (timer) clearInterval(timer);
              setStatus(state.status === "ENDED" ? "This meeting has ended." : "The host declined your request.");
            }
          } catch (err) { if (!cancelled) setStatus((err as Error).message); }
        }
        timer = setInterval(poll, 2500);
      } catch (err) { if (!cancelled) setStatus((err as Error).message); }
    }
    void enterWaitingRoom();
    return () => { cancelled = true; if (timer) clearInterval(timer); shutdown(); };
    // This effect must restart only when the meeting ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, router]);

  useEffect(() => {
    if (connected && localVideo.current) {
      localVideo.current.srcObject = screen.current || camera.current;
    }
  }, [connected, sharing]);

  useEffect(() => {
    if (!host || !approved) return;
    let cancelled = false;
    async function refresh() {
      try {
        const entries = await api("/meetings/" + meetingId + "/waiting-room", hostToken.current);
        if (!cancelled) setWaiting(Array.isArray(entries) ? entries : []);
      } catch { /* host may have signed out */ }
    }
    void refresh();
    const timer = setInterval(refresh, 3500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [meetingId, approved, host]);

  async function getPeer(id: string): Promise<RTCPeerConnection> {
    if (peers.current[id]) return peers.current[id];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peers.current[id] = pc;
    const tracks = camera.current?.getTracks() || [];
    const audio = pc.addTransceiver("audio", { direction: "sendrecv" });
    const video = pc.addTransceiver("video", { direction: "sendrecv" });
    await Promise.all([
      audio.sender.replaceTrack(tracks.find(t => t.kind === "audio") || null),
      video.sender.replaceTrack(screen.current?.getVideoTracks()[0] || tracks.find(t => t.kind === "video") || null),
    ]);
    const inbound = new MediaStream();
    pc.ontrack = e => {
      if (!inbound.getTracks().some(t => t.id === e.track.id)) inbound.addTrack(e.track);
      setRemote(prev => [...prev.filter(t => t.socketId !== id), { socketId: id, stream: inbound }]);
    };
    pc.onicecandidate = e => {
      if (e.candidate) socket.current?.emit("ice-candidate", { meetingId, targetSocketId: id, candidate: e.candidate.toJSON() });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") closePeer(id);
    };
    return pc;
  }

  async function addIce(id: string, candidate: RTCIceCandidateInit) {
    const pc = peers.current[id];
    if (!pc || !pc.remoteDescription) {
      (pendingIce.current[id] ||= []).push(candidate);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* stale candidate */ }
  }
  async function flushIce(id: string) {
    const queued = pendingIce.current[id] || [];
    delete pendingIce.current[id];
    for (const candidate of queued) await addIce(id, candidate);
  }

  async function joinCall() {
    if (!approved || connected || busy) return;
    const token = host ? hostToken.current : admitted.current;
    if (!token) { setStatus("Session expired. Rejoin using the meeting page."); return; }
    setBusy(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: true,
        });
      } catch {
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); }
        catch { stream = new MediaStream(); }
      }
      camera.current = stream;
      setAudioOn(Boolean(stream.getAudioTracks()[0]));
      setVideoOn(Boolean(stream.getVideoTracks()[0]));
      if (localVideo.current) localVideo.current.srcObject = stream;
      const client = io(API + "/meetings", {
        auth: { meetingToken: token }, transports: ["websocket", "polling"],
        reconnection: true, reconnectionAttempts: 8,
      });
      socket.current = client;
      client.on("connect", () => {
        setStatus("Connecting to rehearsal room…");
        client.emit("join-meeting", { meetingId, fullName: name });
      });
      client.on("disconnect", () => { setConnected(false); setStatus("Disconnected. Reconnecting…"); });
      client.on("connect_error", e => setStatus("Signaling connection failed: " + e.message));
      client.on("meeting-error", (p: {message: string}) => setStatus(p.message));
      client.on("existing-participants", async (p: { participants: Attendee[] }) => {
        setConnected(true);
        setStatus("Connected to rehearsal room.");
        for (const attendee of p.participants || []) {
          try {
            const pc = await getPeer(attendee.socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            client.emit("webrtc-offer", { meetingId, targetSocketId: attendee.socketId, offer });
          } catch { setStatus("A participant could not be connected."); }
        }
      });
      client.on("participants-updated", (p: { participants: Attendee[] }) => setAttendees(p.participants || []));
      client.on("webrtc-offer", async (p: { fromSocketId: string; offer: RTCSessionDescriptionInit }) => {
        try {
          const pc = await getPeer(p.fromSocketId);
          await pc.setRemoteDescription(new RTCSessionDescription(p.offer));
          // Signal the answer before processing queued ICE candidates. ICE gathering
          // must never block the SDP answer needed by the offerer to create media tracks.
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          client.emit("webrtc-answer", { meetingId, targetSocketId: p.fromSocketId, answer });
          void flushIce(p.fromSocketId);
        } catch { setStatus("Could not complete incoming call negotiation."); }
      });
      client.on("webrtc-answer", async (p: { fromSocketId: string; answer: RTCSessionDescriptionInit }) => {
        try {
          const pc = peers.current[p.fromSocketId];
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(p.answer));
          await flushIce(p.fromSocketId);
        } catch { setStatus("Could not finish call negotiation."); }
      });
      client.on("ice-candidate", (p: { fromSocketId: string; candidate: RTCIceCandidateInit }) => {
        if (p.candidate) void addIce(p.fromSocketId, p.candidate);
      });
      client.on("participant-left", (p: { socketId: string }) => closePeer(p.socketId));
      client.on("meeting-chat-history", (p: { messages: Message[] }) => setMessages(p.messages || []));
      client.on("meeting-chat-message", (message: Message) => setMessages(prev => [...prev.slice(-149), message]));
      client.on("host-mute-all", () => {
        camera.current?.getAudioTracks().forEach(t => { t.enabled = false; });
        setAudioOn(false);
        setStatus("The host muted all microphones.");
      });
      client.on("host-remove-participant", () => { setStatus("The host removed you from the meeting."); void leave(); });
      client.on("host-end-meeting", () => { setStatus("The host ended the meeting."); void leave(); });
      client.on("meeting-locked", (p: {locked: boolean}) => setLocked(p.locked));
      client.on("hand-raised", (p: {fullName: string; raised: boolean}) => {
        if (p.raised) setStatus(p.fullName + " raised a hand.");
      });
    } catch (err) { setStatus("Unable to join: " + (err as Error).message); }
    finally { setBusy(false); }
  }

  function toggleMic() {
    const tracks = camera.current?.getAudioTracks() || [];
    const next = !audioOn;
    tracks.forEach(track => { track.enabled = next; });
    setAudioOn(next && tracks.length > 0);
  }
  function toggleVideo() {
    const tracks = camera.current?.getVideoTracks() || [];
    const next = !videoOn;
    tracks.forEach(track => { track.enabled = next; });
    setVideoOn(next && tracks.length > 0);
  }
  async function stopShare() {
    const activeScreen = screen.current;
    screen.current = null;
    activeScreen?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    const original = camera.current?.getVideoTracks()[0] || null;
    await Promise.all(Object.values(peers.current).map(async pc => {
      try { await pc.getTransceivers().find(t => t.receiver.track.kind === "video")?.sender.replaceTrack(original); } catch {}
    }));
    if (localVideo.current) localVideo.current.srcObject = camera.current;
    setSharing(false);
  }
  async function shareScreen() {
    if (sharing) { await stopShare(); return; }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screen.current = display;
      const track = display.getVideoTracks()[0];
      track.onended = () => { void stopShare(); };
      await Promise.all(Object.values(peers.current).map(pc =>
        pc.getTransceivers().find(t => t.receiver.track.kind === "video")?.sender.replaceTrack(track)));
      if (localVideo.current) localVideo.current.srcObject = display;
      setSharing(true);
    } catch { setStatus("Screen sharing was cancelled or unavailable."); }
  }
  function sendMessage() {
    if (!socket.current?.connected || !draft.trim()) return;
    socket.current.emit("meeting-chat-message", { meetingId, text: draft.trim().slice(0, 2000) });
    setDraft("");
  }
  function toggleHand() {
    const raised = !handRaised;
    setHandRaised(raised);
    socket.current?.emit("raise-hand", { meetingId, raised });
  }
  async function moderate(id: string, operation: "approve" | "reject") {
    try {
      await api("/meetings/waiting-room/" + operation, hostToken.current, {
        method: "PATCH", body: JSON.stringify({ participantId: id }),
      });
      setWaiting(prev => prev.map(p => p.id === id ? { ...p, status: operation === "approve" ? "APPROVED" : "REJECTED" } : p));
    } catch (err) { setStatus((err as Error).message); }
  }
  async function toggleLock() {
    try {
      await api("/meetings/" + meetingId + (locked ? "/unlock" : "/lock"), hostToken.current, {method: "PATCH"});
      setLocked(!locked);
      socket.current?.emit("host-lock", {meetingId, locked: !locked});
    } catch (err) { setStatus((err as Error).message); }
  }
  async function endMeeting() {
    if (!window.confirm("End this rehearsal for everyone?")) return;
    try {
      await api("/meetings/" + meetingId + "/end", hostToken.current, {method: "PATCH"});
      socket.current?.emit("host-end-meeting", {meetingId});
      void leave();
    } catch (err) { setStatus((err as Error).message); }
  }
  async function leave() {
    if (active.current) return;
    active.current = true;
    if (socket.current?.connected) socket.current.emit("leave-meeting", { meetingId });
    shutdown();
    sessionStorage.removeItem("ss_meeting_admission_token");
    sessionStorage.removeItem("ss_meeting_access");
    router.push(host ? "/admin-dashboard" : "/meeting");
  }
  async function copyInvite() {
    const link = window.location.origin + "/meeting?meetingId=" + encodeURIComponent(meetingId);
    await navigator.clipboard.writeText("Serenade Singers meeting: " + link + "\nMeeting ID: " + meetingId + "\nAsk the host for the passcode.");
    setCopyText("Invitation details copied.");
  }

  const pending = waiting.filter(p => p.status === "PENDING");
  const joined = attendees.length;
  return (
    <main className="ssm">
      <header className="ssm-header">
        <div>
          <Link href={host ? "/admin-dashboard" : "/member-hub"} className="ssm-back">← Serenade Singers</Link>
          <h1>Serenade Meet <span>{host ? "• Host" : "• Member"}</span></h1>
          <p>{meetingId} · {joined} participant{joined === 1 ? "" : "s"}</p>
        </div>
        <div className="ssm-actions">
          <button type="button" onClick={copyInvite} className="ssm-secondary">Copy invitation</button>
          <button type="button" onClick={() => void leave()} className="ssm-danger"><LogOut size={16}/> Leave</button>
        </div>
      </header>
      {copyText && <p role="status" className="ssm-notice">{copyText}</p>}
      <p role="status" className="ssm-status">{status}</p>
      {!approved ? (
        <section className="ssm-wait" aria-live="polite">
          <Shield size={36}/>
          <h2>Waiting for host approval</h2>
          <p>Stay on this page while Serenade Singers management reviews your request.</p>
          <Link href="/meeting">Back to join page</Link>
        </section>
      ) : (
        <div className="ssm-layout">
          <section className="ssm-stage">
            {!connected ? (
              <div className="ssm-wait">
                <Camera size={38}/>
                <h2>Ready for your rehearsal?</h2>
                <p>Camera and microphone permissions are requested only when you join. Audio-only and listen-only participation are supported.</p>
                <button onClick={() => void joinCall()} disabled={busy} className="ssm-primary">{busy ? "Connecting…" : "Join the meeting"}</button>
              </div>
            ) : (
              <div className="ssm-grid">
                <div className="ssm-video">
                  <video autoPlay muted playsInline ref={localVideo}/>
                  <span className="ssm-name">{sharing ? "You • Presenting" : "You"}</span>
                  {!videoOn && !sharing && <div className="ssm-video-fallback">Your camera is off</div>}
                </div>
                {remote.map(tile => <RemoteTile key={tile.socketId} tile={tile} label={attendees.find(p => p.socketId === tile.socketId)?.fullName || "Participant"}/>)}
              </div>
            )}
            <div className="ssm-toolbar">
              <button disabled={!connected || !camera.current?.getAudioTracks().length} onClick={toggleMic} title="Toggle microphone">
                {audioOn ? <Mic size={20}/> : <MicOff size={20}/>}<small>{audioOn ? "Mute" : "Unmute"}</small>
              </button>
              <button disabled={!connected || !camera.current?.getVideoTracks().length} onClick={toggleVideo} title="Toggle camera">
                {videoOn ? <Camera size={20}/> : <CameraOff size={20}/>}<small>{videoOn ? "Stop video" : "Start video"}</small>
              </button>
              <button disabled={!connected} onClick={() => void shareScreen()}>
                {sharing ? <MonitorOff size={20}/> : <MonitorUp size={20}/>}<small>{sharing ? "Stop sharing" : "Share screen"}</small>
              </button>
              <button disabled={!connected} onClick={toggleHand} aria-pressed={handRaised}>
                <Hand size={20}/><small>{handRaised ? "Lower hand" : "Raise hand"}</small>
              </button>
              <button onClick={() => setTab("chat")} aria-pressed={tab === "chat"}><MessageCircle size={20}/><small>Chat</small></button>
              <button onClick={() => setTab("people")} aria-pressed={tab === "people"}><Users size={20}/><small>People</small></button>
            </div>
          </section>
          <aside className="ssm-panel">
            <div className="ssm-tabs">
              <button aria-selected={tab === "chat"} role="tab" onClick={() => setTab("chat")}>Conversation</button>
              <button aria-selected={tab === "people"} role="tab" onClick={() => setTab("people")}>Members ({joined})</button>
            </div>
            {tab === "chat" ? (
              <>
                <div className="ssm-messages" role="log" aria-live="polite">
                  {messages.length === 0 && <p className="ssm-muted">Send a message to everyone in this meeting.</p>}
                  {messages.map(m => <div className="ssm-message" key={m.id}>
                    <strong>{m.senderName}</strong><time>{new Date(m.createdAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</time>
                    <p>{m.content}</p>
                  </div>)}
                </div>
                <form className="ssm-compose" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                  <input value={draft} onChange={e => setDraft(e.target.value)} disabled={!connected} maxLength={2000} placeholder="Message the choir…" aria-label="Chat message"/>
                  <button disabled={!connected || !draft.trim()} type="submit" aria-label="Send message"><Send size={20}/></button>
                </form>
              </>
            ) : (
              <div className="ssm-people">
                {attendees.map(p => <div key={p.socketId} className="ssm-person">
                  <span>{p.role === "host" ? "★" : "♪"} {p.fullName}</span>
                  {host && p.role !== "host" && <button onClick={() => socket.current?.emit("host-remove-participant", {meetingId, socketId:p.socketId})} title="Remove participant"><UserX size={16}/></button>}
                </div>)}
              </div>
            )}
            {host && <section className="ssm-host">
              <h3>Host controls</h3>
              <div className="ssm-host-buttons">
                <button onClick={() => void toggleLock()}>{locked ? <Unlock size={16}/> : <Lock size={16}/>} {locked ? "Unlock" : "Lock"} room</button>
                <button disabled={!connected} onClick={() => socket.current?.emit("host-mute-all", {meetingId})}>Mute all</button>
                <button onClick={() => void endMeeting()} className="ssm-end">End for all</button>
              </div>
              <h4>Waiting room ({pending.length})</h4>
              {pending.length === 0 && <p className="ssm-muted">No pending members.</p>}
              {pending.map(p => <div key={p.id} className="ssm-person">
                <span>{p.fullName}</span>
                <button onClick={() => void moderate(p.id,"approve")}>Admit</button>
                <button onClick={() => void moderate(p.id,"reject")}>Decline</button>
              </div>)}
            </section>}
          </aside>
        </div>
      )}
      <style jsx global>{`
        .ssm{min-height:100vh;background:#081627;color:#f7f7fb;padding:20px;font-family:inherit}
        .ssm button{cursor:pointer;font:inherit;transition:background .15s,border-color .15s}
        .ssm button:disabled{opacity:.45;cursor:not-allowed}
        .ssm-header{max-width:1480px;margin:auto;display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap}
        .ssm-back{color:#e5be6d;font-weight:650;text-decoration:none}
        .ssm-header h1{font-size:clamp(25px,3vw,38px);letter-spacing:-.04em;margin:10px 0 5px}
        .ssm-header h1 span{font-weight:500;font-size:16px;color:#e5be6d}
        .ssm-header p,.ssm-muted{color:#9ba9bc}
        .ssm-actions,.ssm-toolbar,.ssm-host-buttons{display:flex;gap:10px;flex-wrap:wrap}
        .ssm-actions button,.ssm-host-buttons button{border:1px solid #46546b;background:#122742;color:#f8fafc;border-radius:12px;padding:11px 15px;display:flex;align-items:center;gap:7px}
        .ssm-actions .ssm-danger,.ssm-host-buttons .ssm-end{background:#7e222e;border-color:#af3442}
        .ssm-status,.ssm-notice{max-width:1480px;margin:18px auto;padding:12px 16px;border:1px solid #385471;background:#12253b;border-radius:13px;color:#d7e7f6}
        .ssm-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(290px,350px);max-width:1480px;margin:auto;gap:16px}
        .ssm-stage,.ssm-panel,.ssm-wait{border:1px solid #29415c;background:#0c2036;border-radius:20px;min-width:0}
        .ssm-stage{display:flex;flex-direction:column;min-height:540px;padding:14px}
        .ssm-grid{flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));align-content:start;gap:12px}
        .ssm-video{position:relative;min-height:215px;aspect-ratio:16/10;background:#09121e;border-radius:15px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .ssm-video video{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}
        .ssm-name{position:absolute;left:12px;bottom:12px;background:#0a1830ca;padding:6px 11px;border-radius:10px;font-size:14px}
        .ssm-video-fallback{position:absolute;padding:13px;background:#101f33;color:#9ba9bc;border-radius:10px}
        .ssm-toolbar{padding:14px 0 0;justify-content:center;margin-top:auto}
        .ssm-toolbar button{background:#193550;border:1px solid #315374;color:white;min-width:87px;padding:11px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:5px}
        .ssm-toolbar small{font-size:12px}
        .ssm-toolbar button[aria-pressed=true]{background:#846018}
        .ssm-panel{height:min(78vh,820px);min-height:530px;display:flex;flex-direction:column;overflow:hidden}
        .ssm-tabs{display:flex;padding:12px;gap:8px;border-bottom:1px solid #29415c}
        .ssm-tabs button{flex:1;border:0;background:transparent;color:#c3cedc;padding:12px 5px;border-radius:10px}
        .ssm-tabs button[aria-selected=true]{background:#203d59;color:#fff}
        .ssm-messages,.ssm-people{overflow:auto;padding:16px;flex:1;min-height:100px}
        .ssm-message{background:#142b42;margin-bottom:11px;padding:12px;border-radius:12px;overflow-wrap:anywhere}
        .ssm-message strong{color:#edc781}
        .ssm-message time{font-size:11px;color:#9caac0;float:right}
        .ssm-message p{margin:9px 0 0;white-space:pre-wrap;line-height:1.4}
        .ssm-compose{display:flex;padding:12px;gap:8px;border-top:1px solid #29415c}
        .ssm-compose input{background:#132c46;color:#fff;border:1px solid #42607b;border-radius:12px;padding:11px;flex:1;min-width:0}
        .ssm-compose button{border:0;border-radius:12px;padding:11px;background:#d7b56d;color:#082039}
        .ssm-person{display:flex;align-items:center;gap:10px;justify-content:space-between;border-bottom:1px solid #29415c;padding:11px 0}
        .ssm-person button{border:1px solid #47617a;padding:7px 9px;border-radius:8px;background:#23415b;color:white}
        .ssm-host{border-top:1px solid #29415c;padding:13px;max-height:45%;overflow:auto}
        .ssm-host h3,.ssm-host h4{margin:6px 0 13px}
        .ssm-host h4{margin-top:15px}
        .ssm-host-buttons button{font-size:13px;padding:8px}
        .ssm-wait{margin:auto;max-width:530px;padding:40px 30px;text-align:center}
        .ssm-wait svg{color:#e4be70}
        .ssm-wait h2{font-size:27px;margin:18px 0 7px}
        .ssm-wait p{line-height:1.6;color:#b1c2d3}
        .ssm-wait a{color:#e4be70}
        .ssm-primary{background:#e4be70;border:0;padding:13px 24px;border-radius:13px;color:#0d233a;font-weight:800!important;margin-top:10px}
        @media(max-width:900px){.ssm-layout{grid-template-columns:1fr}.ssm-panel{height:460px;min-height:400px}.ssm-stage{min-height:370px}.ssm{padding:12px}.ssm-header{padding:9px}}
      `}</style>
    </main>
  );
}

function RemoteTile({tile,label}:{tile:MediaTile;label:string}) {
  const ref=useRef<HTMLVideoElement|null>(null);
  useEffect(()=>{if(ref.current) ref.current.srcObject=tile.stream},[tile.stream]);
  return <div className="ssm-video"><video ref={ref} autoPlay playsInline/><span className="ssm-name">{label}</span></div>;
}
