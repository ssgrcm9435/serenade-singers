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

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "မင်္ဂလာပါ။ Serenade Singers Virtual Assistant မှ ကြိုဆိုပါတယ်။ လိုအပ်သောအချက်အလက်များကို မေးမြန်းနိုင်ပါသည်။",
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
          role: "assistant",
          content:
            data.answer ||
            data.error ||
            "Virtual Assistant cannot answer this question right now.",
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
    <main style={styles.shell}>
      <style jsx global>{`
        html,
        body {
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }

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

      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>Serenade Singers</p>
          <h1 style={styles.title}>Virtual Assistant</h1>
        </div>
      </header>

      <section style={styles.chatArea}>
        <div style={styles.faqRow}>
          {suggestions.map((item) => (
            <button key={item} onClick={() => sendMessage(item)} style={styles.faqChip}>
              {item}
            </button>
          ))}
        </div>

        <div style={styles.messages}>
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
                  borderBottomRightRadius: message.role === "user" ? 6 : 18,
                  borderBottomLeftRadius: message.role === "assistant" ? 6 : 18,
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
        </div>
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
          style={{
            ...styles.sendButton,
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: "100dvh",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#F8FAFC",
  },
  header: {
    flexShrink: 0,
    padding: "14px 18px",
    borderBottom: "1px solid #E2E8F0",
    background: "#FFFFFF",
  },
  kicker: {
    margin: 0,
    color: "#64748B",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "3px 0 0",
    color: "#061A2F",
    fontSize: 22,
    fontWeight: 950,
  },
  chatArea: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  faqRow: {
    flexShrink: 0,
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "12px 14px",
    background: "#F8FAFC",
  },
  faqChip: {
    flexShrink: 0,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    padding: "9px 13px",
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
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overscrollBehavior: "contain",
    scrollBehavior: "smooth",
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "82%",
    padding: "12px 14px",
    borderRadius: 18,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    fontSize: 15,
  },
  time: {
    display: "block",
    marginTop: 7,
    opacity: 0.65,
    fontSize: 11,
  },
  typingBubble: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontWeight: 800,
  },
  dots: {
    marginLeft: 8,
    display: "inline-flex",
    gap: 3,
  },
  dotOne: { animation: "aiDotBounce 1s infinite ease-in-out" },
  dotTwo: { animation: "aiDotBounce 1s infinite ease-in-out 0.15s" },
  dotThree: { animation: "aiDotBounce 1s infinite ease-in-out 0.3s" },
  inputBar: {
    flexShrink: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 86px",
    gap: 10,
    padding: "12px 14px max(12px, env(safe-area-inset-bottom))",
    borderTop: "1px solid #E2E8F0",
    background: "#FFFFFF",
  },
  textarea: {
    width: "100%",
    minWidth: 0,
    minHeight: 46,
    maxHeight: 120,
    resize: "none",
    boxSizing: "border-box",
    padding: "11px 13px",
    borderRadius: 16,
    border: "1px solid #CBD5E1",
    outline: "none",
    fontSize: 15,
    lineHeight: 1.5,
  },
  sendButton: {
    border: "none",
    borderRadius: 16,
    background: "#061A2F",
    color: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    fontSize: 15,
  },
};
