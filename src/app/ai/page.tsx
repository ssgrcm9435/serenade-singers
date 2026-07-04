"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "မင်္ဂလာပါ။ Serenade Singers အကြောင်း၊ Member Registration၊ Volunteer၊ Choir၊ Voice Test၊ Events နှင့် Meetings များအကြောင်း မေးမြန်းနိုင်ပါတယ်။",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0f172a" }}>
        🤖 Serenade Singers AI Assistant
      </h1>

      <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 28 }}>
        Ask about membership, volunteers, choir, voice assessment, voice
        practice, meetings, events and Serenade Singers information.
      </p>

      <div
        style={{
          height: 520,
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 20,
          background: "#ffffff",
          overflowY: "auto",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
              padding: "14px 16px",
              borderRadius: 16,
              background: message.role === "user" ? "#0f172a" : "#f1f5f9",
              color: message.role === "user" ? "#ffffff" : "#0f172a",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "14px 16px",
              borderRadius: 16,
              background: "#f1f5f9",
              color: "#64748b",
            }}
          >
            AI is thinking...
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Ask Serenade Singers AI..."
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            fontSize: 16,
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "16px 28px",
            borderRadius: 12,
            border: "none",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.65 : 1,
          }}
        >
          Send
        </button>
      </div>

      <p style={{ marginTop: 18, color: "#94a3b8", fontSize: 14 }}>
        Powered by OpenRouter AI
      </p>
    </main>
  );
}
