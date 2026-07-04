export default function AIAssistantPage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "60px auto",
        padding: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}
      >
        🤖 Serenade Singers AI Assistant
      </h1>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.8,
          marginBottom: 32,
        }}
      >
        Ask anything about Serenade Singers, membership, volunteers,
        choir, voice assessment, meetings, events and more.
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
        }}
      >
        <p style={{ color: "#64748b" }}>
          Conversation will appear here...
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <input
          type="text"
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
          style={{
            padding: "16px 28px",
            borderRadius: 12,
            border: "none",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>

      <p
        style={{
          marginTop: 20,
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        Powered by OpenRouter AI
      </p>
    </main>
  );
}
