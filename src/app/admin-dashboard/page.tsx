"use client";

import { useState } from "react";

const sections = [
  "Dashboard Summary",
  "Members",
  "Volunteers",
  "T-Shirt Orders",
  "Payments",
  "Finance",
  "Announcements",
  "Events",
  "Documents",
  "Learning Center",
  "Email Center",
];

export default function AdminDashboardPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard Summary");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Login failed.");
        return;
      }

      sessionStorage.setItem("ss_admin_login", "true");
      setLoggedIn(true);
    } catch {
      setMessage("Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return (
      <main style={main}>
        <div style={container}>
          <p style={eyebrow}>SERENADE SINGERS</p>
          <h1 style={title}>Admin Dashboard</h1>
          <p style={subtitle}>Secure administration area for Serenade Singers management.</p>

          <section style={card}>
            <h2 style={sectionTitle}>Admin Login</h2>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin username"
              style={{ ...input, width: "100%", marginTop: 18 }}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              type="password"
              style={{ ...input, width: "100%", marginTop: 14 }}
            />

            <button onClick={login} disabled={loading} style={{ ...button, width: "100%", marginTop: 18 }}>
              {loading ? "Checking..." : "Login"}
            </button>

            {message && <p style={error}>{message}</p>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={main}>
      <div style={container}>
        <p style={eyebrow}>SERENADE SINGERS</p>
        <h1 style={title}>Admin Dashboard</h1>
        <p style={subtitle}>Management dashboard for members, finance, events, documents, learning center, and emails.</p>

        <section style={card}>
          <h2 style={sectionTitle}>Dashboard Menu</h2>

          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            style={{ ...input, width: "100%", marginTop: 18 }}
          >
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </section>

        {activeSection === "Dashboard Summary" && (
          <section style={grid}>
            <Stat title="Members" value="View" />
            <Stat title="Volunteers" value="View" />
            <Stat title="T-Shirt Orders" value="View" />
            <Stat title="Payments" value="Pending" />
            <Stat title="Finance" value="Reports" />
            <Stat title="Email Center" value="Ready" />
          </section>
        )}

        {activeSection !== "Dashboard Summary" && (
          <section style={card}>
            <h2 style={sectionTitle}>{activeSection}</h2>
            <p style={muted}>
              {activeSection} management module is ready for the next update.
              This section will connect to Google Sheets and Apps Script APIs.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <article style={statCard}>
      <p style={statLabel}>{title}</p>
      <h3 style={statValue}>{value}</h3>
    </article>
  );
}

const main = { minHeight: "100vh", background: "#faf8f3", color: "#061A2F" };
const container = { maxWidth: 1120, margin: "0 auto", padding: "56px 24px" };
const eyebrow = { fontWeight: 800, letterSpacing: "0.18em", color: "#C9A24A" };
const title = { marginTop: 16, fontSize: 44, lineHeight: 1.1, fontWeight: 900 };
const subtitle = { marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 };
const card = { background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, marginTop: 32, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" };
const sectionTitle = { fontSize: 30, fontWeight: 900 };
const input = { border: "1px solid #cbd5e1", borderRadius: 16, padding: "14px 16px", fontSize: 15 };
const button = { background: "#061A2F", color: "white", border: 0, borderRadius: 16, padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const error = { marginTop: 14, color: "#b91c1c", fontWeight: 800 };
const muted = { marginTop: 14, color: "#64748b", lineHeight: 1.8 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 32 };
const statCard = { background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: 24 };
const statLabel = { color: "#64748b", fontWeight: 800 };
const statValue = { marginTop: 10, fontSize: 28, fontWeight: 900 };
