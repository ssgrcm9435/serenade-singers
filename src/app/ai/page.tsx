"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
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



function renderMessage(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    const isUrl = /^https?:\/\/[^\s]+$/.test(part);

    if (isUrl) {
      const cleanUrl = part.replace(/[.,)]$/, "");

      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#2563eb",
            fontWeight: 800,
            textDecoration: "underline",
            wordBreak: "break-all",
          }}
        >
          {cleanUrl}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "မင်္ဂလာပါ။ Serenade Singers အကြောင်း၊ Member Registration၊ Volunteer၊ Choir၊ Voice Test၊ Events နှင့် Meetings များအကြောင်း မေးမြန်းနိုင်ပါတယ်။",
      time: nowTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
          role: "assistant",
          content:
            data.answer ||
            data.error ||
            "AI Assistant cannot answer this question right now.",
          time: nowTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please try again later.",
          time: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <style jsx global>{`
        @media (max-width: 640px) {
          main {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          textarea {
            min-height: 58px !important;
            font-size: 15px !important;
          }

          button {
            font-size: 15px !important;
          }
        }

        @media (max-width: 420px) {
          textarea::placeholder {
            font-size: 14px;
          }
        }
      `}</style>
      <style jsx global>{`
        @keyframes aiDotBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Serenade Singers Support</p>
          <h1 style={styles.title}>🤖 AI Assistant</h1>
          <p style={styles.subtitle}>
            Membership, volunteer registration, choir information, voice test,
            voice practice, meetings, events and support questions များကို
            မေးမြန်းနိုင်ပါသည်။
          </p>
        </div>
      </section>

      <section style={styles.suggestionBox}>
        {suggestions.map((item) => (
          <button key={item} onClick={() => sendMessage(item)} style={styles.suggestion}>
            {item}
          </button>
        ))}
      </section>

      <section style={styles.chatBox}>
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
                ...styles.message,
                background: message.role === "user" ? "#061A2F" : "#F8FAFC",
                color: message.role === "user" ? "#FFFFFF" : "#0F172A",
                border: message.role === "user" ? "none" : "1px solid #E2E8F0",
              }}
            >
              <div style={styles.messageContent}>{renderMessage(message.content)}</div>
              <div style={styles.messageFooter}>
                <span>{message.time}</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={{ ...styles.message, ...styles.typing }}>
              <span>AI is typing</span>
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

      <section style={styles.inputArea}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask Serenade Singers AI..."
          style={styles.textarea}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={styles.sendButton}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: "50px auto", padding: 24 },
  hero: { marginBottom: 22 },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#EEF2FF",
    color: "#1E3A8A",
    fontWeight: 800,
    marginBottom: 12,
  },
  title: { fontSize: "2.5rem", fontWeight: 900, color: "#061A2F", margin: 0 },
  subtitle: { maxWidth: 780, color: "#475569", lineHeight: 1.8, marginTop: 12 },
  suggestionBox: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  suggestion: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 700,
    cursor: "pointer",
  },
  chatBox: {
    height: "min(560px, 52dvh)",
    overflowY: "auto",
    border: "1px solid #E2E8F0",
    borderRadius: 24,
    padding: 20,
    background: "#FFFFFF",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  messageRow: { display: "flex" },
  message: {
    maxWidth: "82%",
    padding: "14px 16px",
    borderRadius: 18,
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
  },
  messageContent: { fontSize: 15.5 },
  messageFooter: {
    display: "flex",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 10,
    fontSize: 12,
    opacity: 0.8,
  },
  typing: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontWeight: 700,
  },
  dots: { marginLeft: 8, display: "inline-flex", gap: 3 },
  dotOne: { animation: "aiDotBounce 1s infinite ease-in-out" },
  dotTwo: { animation: "aiDotBounce 1s infinite ease-in-out 0.15s" },
  dotThree: { animation: "aiDotBounce 1s infinite ease-in-out 0.3s" },
  inputArea: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 118px",
    gap: 12,
    marginTop: 18,
    alignItems: "stretch",
    width: "100%",
    position: "sticky",
    bottom: 0,
    background: "#faf9f6",
    paddingTop: 12,
    paddingBottom: "max(12px, env(safe-area-inset-bottom))",
  },
  textarea: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    minHeight: 64,
    resize: "vertical",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #CBD5E1",
    fontSize: 16,
    lineHeight: 1.6,
    outline: "none",
  },
  sendButton: {
    width: "100%",
    minWidth: 0,
    padding: "14px 24px",
    borderRadius: 16,
    border: "none",
    background: "#061A2F",
    color: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
  },
};
