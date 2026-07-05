"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import LumiHeaderMascot from "@/components/LumiHeaderMascot";

type Message = {
  id: number;
  role: "user" | "lumi";
  text: string;
  time: string;
  status?: "delivered" | "seen";
};

const quickQuestions = [
  "Member ဘယ်လိုလျှောက်ရမလဲ?",
  "Volunteer ဘယ်လိုလျှောက်ရမလဲ?",
  "Voice Range Test ဘယ်လိုလုပ်မလဲ?",
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getLumiReply(input: string) {
  const q = input.toLowerCase();

  if (q.includes("member")) {
    return "Member လျှောက်ချင်ရင် Join Us page မှတစ်ဆင့် registration form ဖြည့်နိုင်ပါတယ်။ Choir activities, events, rehearsals နဲ့ community programs တွေမှာ ပါဝင်နိုင်ပါတယ်။";
  }

  if (q.includes("volunteer")) {
    return "Volunteer အဖြစ်ပါဝင်ချင်ရင် administration team ကို contact လုပ်နိုင်ပါတယ်။ Event support, media, teaching support, logistics, outreach စတဲ့ role တွေရှိနိုင်ပါတယ်။";
  }

  if (q.includes("voice") || q.includes("range")) {
    return "Voice Range Test အတွက် သင့် vocal range, current comfortable key, target key, and practice notes တွေကို စစ်ဆေးပြီး member profile ထဲမှာ သိမ်းထားနိုင်ပါတယ်။";
  }

  if (q.includes("event") || q.includes("rehearsal")) {
    return "Events နဲ့ rehearsals တွေကို Events page နဲ့ Members Hub မှာ ကြည့်နိုင်ပါတယ်။ Event gallery မှာ photos/videos တွေလည်း ကြည့်နိုင်ပါတယ်။";
  }

  return "မင်္ဂလာပါ။ ကျွန်မက Lumi ပါ။ Serenade Singers အကြောင်း၊ membership, volunteers, events, rehearsals, classes နဲ့ voice assessment တွေကို မေးနိုင်ပါတယ်။";
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLumiTyping, setIsLumiTyping] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMessages([
        {
          id: Date.now(),
          role: "lumi",
          text: "မင်္ဂလာပါ။ ကျွန်မက Lumi ပါ။ Serenade Singers အကြောင်း၊ member, volunteer, events, rehearsals, classes နဲ့ voice assessment မေးနိုင်ပါတယ်။",
          time: getTime(),
        },
      ]);
      setIsLumiTyping(false);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLumiTyping]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLumiTyping) return;

    const userId = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: userId,
        role: "user",
        text: trimmed,
        time: getTime(),
        status: "delivered",
      },
    ]);

    setInput("");

    window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === userId ? { ...message, status: "seen" } : message
        )
      );
      setIsLumiTyping(true);
    }, 800);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "lumi",
          text: getLumiReply(trimmed),
          time: getTime(),
        },
      ]);
      setIsLumiTyping(false);
    }, 2200);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <p style={styles.kicker}>SERENADE SINGERS</p>
        <h1 style={styles.title}>Lumi</h1>
        <LumiHeaderMascot isTyping={isLumiTyping} />
      </section>

      <div style={styles.quickRow}>
        {quickQuestions.map((question) => (
          <button
            key={question}
            type="button"
            style={styles.quickButton}
            onClick={() => sendMessage(question)}
            disabled={isLumiTyping}
          >
            {question}
          </button>
        ))}
      </div>

      <section style={styles.chatBox}>
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
              <p style={styles.messageText}>{message.text}</p>
              <div style={styles.metaRow}>
                <span>{message.time}</span>
                {message.role === "user" && (
                  <span style={styles.status}>
                    {message.status === "seen" ? "Seen" : "Delivered"}
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
              <div style={styles.typingLine} className="lumiTypingDots">
                <span>Lumi is typing</span>
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </section>

      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          style={styles.input}
          rows={3}
          disabled={isLumiTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <button type="submit" style={styles.sendButton} disabled={isLumiTyping || !input.trim()}>
          Send
        </button>
      </form>
    <style jsx>{`
        .lumiTypingDots i {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #c9a24a;
          display: inline-block;
          animation: lumiDot 1s ease-in-out infinite;
        }

        .lumiTypingDots i:nth-child(3) {
          animation-delay: .15s;
        }

        .lumiTypingDots i:nth-child(4) {
          animation-delay: .3s;
        }

        @keyframes lumiDot {
          0%, 100% { opacity: .35; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    padding: "28px 18px 110px",
    background: "#f8fafc",
    color: "#061a2f",
  },
  header: {
    maxWidth: 960,
    margin: "0 auto",
  },
  kicker: {
    margin: 0,
    color: "#64748b",
    fontWeight: 950,
    letterSpacing: "0.14em",
    fontSize: 14,
  },
  title: {
    margin: "8px 0 0",
    fontSize: "clamp(2.4rem, 8vw, 4.2rem)",
    fontWeight: 950,
    letterSpacing: "-0.05em",
  },
  quickRow: {
    maxWidth: 960,
    margin: "10px auto 18px",
    display: "flex",
    gap: 12,
    overflowX: "auto",
    paddingBottom: 8,
  },
  quickButton: {
    whiteSpace: "nowrap",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#061a2f",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  },
  chatBox: {
    maxWidth: 960,
    minHeight: "46dvh",
    margin: "0 auto",
    display: "grid",
    gap: 14,
    alignContent: "start",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #061a2f, #12355b)",
    border: "2px solid rgba(201,162,74,.75)",
    color: "#f8d77a",
    fontSize: 22,
    fontWeight: 950,
    flex: "0 0 auto",
  },
  bubble: {
    maxWidth: "min(720px, 82vw)",
    borderRadius: 24,
    padding: "16px 18px",
    boxShadow: "0 16px 38px rgba(6,26,47,.08)",
  },
  lumiBubble: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderBottomLeftRadius: 8,
  },
  userBubble: {
    background: "#061a2f",
    color: "#ffffff",
    borderBottomRightRadius: 8,
  },
  messageText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.75,
    fontWeight: 650,
  },
  metaRow: {
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 800,
  },
  status: {
    color: "#c9a24a",
  },
  typingLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#64748b",
    fontWeight: 900,
  },
  form: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "12px 18px 18px",
    background: "rgba(248,250,252,.94)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid #e2e8f0",
  },
  input: {
    display: "block",
    width: "min(960px, 100%)",
    margin: "0 auto 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    outline: "none",
    resize: "none",
    background: "#ffffff",
  },
  sendButton: {
    display: "block",
    width: "min(960px, 100%)",
    margin: "0 auto",
    border: 0,
    borderRadius: 999,
    padding: "12px 18px",
    background: "#061a2f",
    color: "#ffffff",
    fontWeight: 950,
    fontSize: 16,
    cursor: "pointer",
  },
};
