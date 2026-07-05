"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "Lumi";
  content: string;
  time: string;
};

const suggestions = [
  "Member ဘယ်လိုလျှောက်ရမလဲ?",
  "Volunteer ဘယ်လိုလျှောက်ရမလဲ?",
  "Voice Range Test ဘယ်လိုလုပ်ရမလဲ?",
  "12-Key Voice Practice ဆိုတာဘာလဲ?",
  "Meeting ဘယ်လိုဝင်ရမလဲ?",
  "Serenade Singers အကြောင်းပြောပြပါ",
];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMessage(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    const isUrl = /^https?:\/\/[^\s]+$/.test(part);
    if (!isUrl) return <span key={index}>{part}</span>;

    const cleanUrl = part.replace(/[.,)]$/, "");
    return (
      <a
        key={index}
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2563eb", fontWeight: 800, textDecoration: "underline", wordBreak: "break-all" }}
      >
        {cleanUrl}
      </a>
    );
  });
}

export default function AILumiPage() {
  const [lumiIntroReady, setLumiIntroReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLumiIntroReady(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "Lumi",
      content: "မင်္ဂလာပါ။ Serenade Singers Lumi မှ ကြိုဆိုပါတယ်။ လိုအပ်သောအချက်အလက်များကို မေးမြန်းနိုင်ပါသည်။",
      time: nowTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function sendMessage(customText?: string) {
    const text = (customText || input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text, time: nowTime() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "Lumi",
          content: data.answer || data.error || "Lumi cannot answer this question right now.",
          time: nowTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "Lumi", content: "Connection error. Please try again later.", time: nowTime() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.shell}>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }

        @keyframes aiDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <header style={styles.chatHeader}>
        <div>
          <p style={styles.kicker}>Serenade Singers</p>
          <h1 style={styles.title}>Lumi</h1>
        </div>
      </header>

      <div style={styles.faqRow}>
        {suggestions.map((item) => (
          <button key={item} onClick={() => sendMessage(item)} style={styles.faqChip}>
            {item}
          </button>
        ))}
      </div>

      <section style={styles.messages}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background: message.role === "user" ? "#061A2F" : "#FFFFFF",
                color: message.role === "user" ? "#FFFFFF" : "#0F172A",
                border: message.role === "user" ? "none" : "1px solid #E2E8F0",
              }}
            >
              <div>{renderMessage(message.content)}</div>
              <small style={styles.time}>{message.time}</small>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, ...styles.typingBubble }}>
              <span>Typing</span>
              <span style={styles.dots}>
                <span style={styles.dotOne}>•</span>
                <span style={styles.dotTwo}>•</span>
                <span style={styles.dotThree}>•</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <section style={styles.inputBar}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your question..."
          style={styles.textarea}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ ...styles.sendButton, opacity: loading || !input.trim() ? 0.6 : 1 }}
        >
          Send
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: "calc(100dvh - 96px)",
    minHeight: 0,
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#F8FAFC",
  },
  chatHeader: {
    flexShrink: 0,
    padding: "10px 16px",
    borderBottom: "1px solid #E2E8F0",
    background: "#FFFFFF",
  },
  kicker: {
    margin: 0,
    color: "#64748B",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "2px 0 0",
    color: "#061A2F",
    fontSize: 20,
    fontWeight: 950,
  },
  faqRow: {
    flexShrink: 0,
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "10px 12px",
    background: "#F8FAFC",
  },
  faqChip: {
    flexShrink: 0,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overscrollBehavior: "contain",
  },
  messageRow: { display: "flex", width: "100%" },
  bubble: {
    maxWidth: "84%",
    padding: "12px 14px",
    borderRadius: 18,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    fontSize: 15,
  },
  time: { display: "block", marginTop: 7, opacity: 0.65, fontSize: 11 },
  typingBubble: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontWeight: 800,
  },
  dots: { marginLeft: 8, display: "inline-flex", gap: 3 },
  dotOne: { animation: "aiDotBounce 1s infinite ease-in-out" },
  dotTwo: { animation: "aiDotBounce 1s infinite ease-in-out 0.15s" },
  dotThree: { animation: "aiDotBounce 1s infinite ease-in-out 0.3s" },
  inputBar: {
    flexShrink: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 82px",
    gap: 10,
    padding: "10px 12px max(10px, env(safe-area-inset-bottom))",
    borderTop: "1px solid #E2E8F0",
    background: "#FFFFFF",
  },
  textarea: {
    width: "100%",
    minWidth: 0,
    minHeight: 44,
    maxHeight: 96,
    resize: "none",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid #CBD5E1",
    outline: "none",
    fontSize: 15,
    lineHeight: 1.45,
  },
  sendButton: {
    border: "none",
    borderRadius: 14,
    background: "#061A2F",
    color: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    fontSize: 15,
  },
};


const lumiAvatarStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #061a2f, #12355b)",
  border: "2px solid rgba(201,162,74,.75)",
  boxShadow: "0 12px 28px rgba(6,26,47,.18)",
  color: "#f8d77a",
  fontSize: 22,
  fontWeight: 900,
};

const lumiTypingStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "#64748b",
  fontWeight: 800,
};
