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
  const lastUserMessageRef = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customText?: string) {
    const text = (customText || input).trim();
    if (!text || loading) return;

    lastUserMessageRef.current = text;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: nowTime() },
    ]);
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

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat ကိုရှင်းပြီးပါပြီ။ Serenade Singers အကြောင်း မေးမြန်းနိုင်ပါတယ်။",
        time: nowTime(),
      },
    ]);
  }

  function regenerate() {
    if (lastUserMessageRef.current) sendMessage(lastUserMessageRef.current);
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main style={styles.page}>
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

        <div style={styles.actions}>
          <button onClick={clearChat} style={styles.lightButton}>Clear Chat</button>
          <button onClick={regenerate} disabled={loading || !lastUserMessageRef.current} style={styles.lightButton}>
            Regenerate
          </button>
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
              <div style={styles.messageContent}>{message.content}</div>
              <div style={styles.messageFooter}>
                <span>{message.time}</span>
                {message.role === "assistant" && (
                  <button onClick={() => copyText(message.content)} style={styles.copyButton}>
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={{ ...styles.message, ...styles.typing }}>
              <span>AI is typing</span>
              <span style={styles.dots}>•••</span>
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

        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={styles.sendButton}>
          {loading ? "Sending..." : "Send"}
        </button>
      </section>

      <p style={styles.footer}>Powered by OpenRouter AI · Conversations may be saved for admin review.</p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "50px auto",
    padding: 24,
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "flex-start",
    marginBottom: 22,
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#EEF2FF",
    color: "#1E3A8A",
    fontWeight: 800,
    marginBottom: 12,
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 900,
    color: "#061A2F",
    margin: 0,
  },
  subtitle: {
    maxWidth: 780,
    color: "#475569",
    lineHeight: 1.8,
    marginTop: 12,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  lightButton: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#061A2F",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  suggestionBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
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
    height: 560,
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
  messageRow: {
    display: "flex",
  },
  message: {
    maxWidth: "82%",
    padding: "14px 16px",
    borderRadius: 18,
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
  },
  messageContent: {
    fontSize: 15.5,
  },
  messageFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
    fontSize: 12,
    opacity: 0.8,
  },
  copyButton: {
    border: "none",
    background: "transparent",
    color: "inherit",
    fontWeight: 800,
    cursor: "pointer",
  },
  typing: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontWeight: 700,
  },
  dots: {
    marginLeft: 8,
    letterSpacing: 3,
  },
  inputArea: {
    display: "flex",
    gap: 12,
    marginTop: 18,
    alignItems: "stretch",
  },
  textarea: {
    flex: 1,
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
    minWidth: 130,
    padding: "14px 24px",
    borderRadius: 16,
    border: "none",
    background: "#061A2F",
    color: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
  },
  footer: {
    marginTop: 16,
    color: "#94A3B8",
    fontSize: 14,
  },
};
