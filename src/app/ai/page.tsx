"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import LumiHeaderMascot from "@/components/LumiHeaderMascot";

type ChatMessage = {
  id: number;
  role: "user" | "lumi";
  content: string;
  time: string;
  status?: "delivered" | "seen";
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
        style={{
          color: "#2563eb",
          fontWeight: 900,
          textDecoration: "underline",
          wordBreak: "break-all",
        }}
      >
        {cleanUrl}
      </a>
    );
  });
}

export default function LumiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [visibleStatusIndex, setVisibleStatusIndex] = useState<number | null>(null);
  const [isLumiTyping, setIsLumiTyping] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMessages([
        {
          id: Date.now(),
          role: "lumi",
          content:
            "Hello, I'm Lumi.\n\nမင်္ဂလာပါ။ ကျွန်မက Serenade Singers ရဲ့ Lumi ပါ။ Member, volunteer, events, rehearsals, classes, voice assessment နဲ့ website links တွေကို မေးနိုင်ပါတယ်။",
          time: nowTime(),
        },
      ]);
      setIsLumiTyping(false);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLumiTyping]);

  async function sendMessage(customText?: string) {
    const text = (customText || input).trim();
    if (!text || isLumiTyping) return;

    const userId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: "user",
        content: text,
        time: nowTime(),
        status: "delivered",
      },
    ]);

    setInput("");

    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userId ? { ...msg, status: "seen" } : msg))
      );
      setIsLumiTyping(true);
    }, 700);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "lumi",
            content:
              data.answer ||
              data.error ||
              "Lumi cannot answer this question right now. Please try again later.",
            time: nowTime(),
          },
        ]);
        setIsLumiTyping(false);
      }, 900);
    } catch {
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "lumi",
            content: "Connection error. Please try again later.",
            time: nowTime(),
          },
        ]);
        setIsLumiTyping(false);
      }, 900);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
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

        @keyframes lumiDotBounce {
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

      <header style={styles.chatHeader}>
        <div>
          
          
          
        </div>
        <LumiHeaderMascot isTyping={isLumiTyping} />
      </header>

      <div style={styles.faqRow}>
        {suggestions.map((item) => (
          <button
            key={item}
            onClick={() => sendMessage(item)}
            disabled={isLumiTyping}
            style={{ ...styles.faqChip, opacity: isLumiTyping ? 0.55 : 1 }}
          >
            {item}
          </button>
        ))}
      </div>

      <section style={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.messageRow,
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {message.role === "lumi" && <div style={styles.avatar}>♪</div>}

            <div
              style={{
                ...styles.bubble,
                ...(message.role === "user" ? styles.userBubble : styles.lumiBubble),
              }}
            >
              <div style={styles.messageText}>{renderMessage(message.content)}</div>

              <div style={styles.metaRow}>
                <span>{message.time}</span>
                {message.role === "user" && (
                  <span style={styles.status}>
                    {message.status === "seen" ? "" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLumiTyping && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={styles.avatar}>♪</div>
            <div style={{ ...styles.bubble, ...styles.lumiBubble }}>
              <div style={styles.typingLine}>
                <span>Lumi is typing</span>
                <span style={styles.dots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }}>•</span>
                  <span style={{ ...styles.dot, animationDelay: "0.15s" }}>•</span>
                  <span style={{ ...styles.dot, animationDelay: "0.3s" }}>•</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <form onSubmit={handleSubmit} style={styles.inputBar}>
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
          disabled={isLumiTyping}
          style={styles.textarea}
        />

        <button
          type="submit"
          disabled={isLumiTyping || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: isLumiTyping || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    <style dangerouslySetInnerHTML={{ __html: lumiInteractionCss }} />

<style jsx global>{`
  .messageStatus {
    opacity: 0 !important;
    visibility: hidden !important;
    max-height: 0 !important;
    overflow: hidden !important;
    transition: opacity .18s ease, visibility .18s ease, max-height .18s ease;
  }

  .userMessageWrap:hover .messageStatus,
  .userMessageWrap:active .messageStatus,
  .userMessageWrap:focus-within .messageStatus {
    opacity: 1 !important;
    visibility: visible !important;
    max-height: 20px !important;
  }
`}</style>


<style jsx global>{`
  .userMessageBubble {
    position: relative;
    cursor: pointer;
  }

  .premiumMessageMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.72);
  }

  .premiumSeenStatus {
    opacity: 0;
    visibility: hidden;
    color: #c9a24a;
    transition: opacity .18s ease, visibility .18s ease;
  }

  .userMessageBubble:hover .premiumSeenStatus,
  .userMessageBubble:active .premiumSeenStatus,
  .userMessageBubble:focus-within .premiumSeenStatus,
  .userMessageBubble.showStatus .premiumSeenStatus {
    opacity: 1;
    visibility: visible;
  }
`}</style>

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
    padding: "12px 16px",
    borderBottom: "1px solid #E2E8F0",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  kicker: {
    margin: 0,
    color: "#64748B",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "2px 0 0",
    color: "#061A2F",
    fontSize: 24,
    fontWeight: 950,
  },
  subtitle: {
    margin: "2px 0 0",
    color: "#C9A24A",
    fontSize: 13,
    fontWeight: 900,
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
    fontWeight: 850,
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "16px 14px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #061a2f, #12355b)",
    border: "2px solid rgba(201,162,74,.75)",
    color: "#f8d77a",
    fontSize: 20,
    fontWeight: 950,
    flex: "0 0 auto",
  },
  bubble: {
    maxWidth: "min(760px, 82vw)",
    padding: "13px 15px",
    borderRadius: 22,
    boxShadow: "0 14px 34px rgba(6,26,47,.08)",
    whiteSpace: "pre-wrap",
  },
  lumiBubble: {
    background: "#FFFFFF",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderBottomLeftRadius: 8,
  },
  userBubble: {
    background: "#061A2F",
    color: "#FFFFFF",
    border: "none",
    borderBottomRightRadius: 8,
  },
  messageText: {
    fontSize: 15.5,
    lineHeight: 1.75,
    fontWeight: 650,
  },
  metaRow: {
    marginTop: 8,
    display: "flex",
    justifyContent: "center",
    gap: 16,
    color: "#94A3B8",
    fontSize: 11.5,
    fontWeight: 850,
  },
  status: {
    color: "#C9A24A",
  },
  typingLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#64748B",
    fontWeight: 900,
  },
  dots: {
    display: "inline-flex",
    gap: 2,
  },
  dot: {
    display: "inline-block",
    animation: "lumiDotBounce 1s ease-in-out infinite",
    color: "#C9A24A",
    fontSize: 20,
    lineHeight: 1,
  },
  inputBar: {
    flexShrink: 0,
    borderTop: "1px solid #E2E8F0",
    background: "rgba(255,255,255,.96)",
    padding: "10px 12px 14px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
  },
  textarea: {
    minHeight: 48,
    maxHeight: 96,
    resize: "none",
    border: "1px solid #CBD5E1",
    borderRadius: 18,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
  },
  sendButton: {
    alignSelf: "end",
    border: 0,
    borderRadius: 999,
    background: "#061A2F",
    color: "#FFFFFF",
    padding: "0 20px",
    height: 48,
    fontWeight: 950,
    cursor: "pointer",
  },
};


const lumiInteractionCss = `
.userMessageWrap:hover .messageStatus,
.userMessageWrap:focus-within .messageStatus,
.userMessageWrap:active .messageStatus {
  opacity: 1 !important;
  max-height: 20px !important;
}
`;
