export default function ConstitutionPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#faf8f3", color: "#061A2F" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ fontWeight: 800, letterSpacing: "0.18em", color: "#C9A24A" }}>
          SERENADE SINGERS
        </p>

        <h1 style={{ marginTop: 16, fontSize: 44, lineHeight: 1.1, fontWeight: 900 }}>
          Constitution of Serenade Singers
        </h1>

        <p style={{ marginTop: 12, fontSize: 20, color: "#475569" }}>
          Official Organizational Framework
        </p>

        <p style={{ marginTop: 8, color: "#64748b" }}>
          Last Updated: June 2026
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <a
            href="/constitution.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#061A2F",
              color: "white",
              padding: "14px 22px",
              borderRadius: 16,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            📄 Open / Download Constitution PDF
          </a>
        </div>

        <section
          style={{
            marginTop: 36,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
          }}
        >
          <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 18 }}>
            Read Online
          </h2>

          <object
            data="/constitution.pdf"
            type="application/pdf"
            width="100%"
            height="900"
            style={{ borderRadius: 18, border: "1px solid #e2e8f0" }}
          >
            <embed
              src="/constitution.pdf"
              type="application/pdf"
              width="100%"
              height="900"
            />

            <div style={{ padding: 24, background: "#f8fafc", borderRadius: 18 }}>
              <p style={{ fontWeight: 700 }}>
                PDF preview is not supported in this browser.
              </p>
              <p style={{ marginTop: 8 }}>
                Please open or download the Constitution PDF using the button above.
              </p>
            </div>
          </object>
        </section>
      </div>
    </main>
  );
}
