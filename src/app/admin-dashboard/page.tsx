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
];

type Row = Record<string, any>;

export default function AdminDashboardPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard Summary");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<Record<string, Row[]>>({
    members: [],
    volunteers: [],
    shirtOrders: [],
    payments: [],
    financialReports: [],
    announcements: [],
    events: [],
    documents: [],
    learningVideos: [],
    learningArticles: [],
  });

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  async function login() {
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const loginData = await res.json();

      if (!loginData.success) {
        setMessage(loginData.message || "Login failed.");
        return;
      }

      setLoggedIn(true);
      await loadDashboardData();
    } catch {
      setMessage("Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboardData() {
    if (!apiUrl) {
      setMessage("Apps Script URL is missing.");
      return;
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ action: "getAdminDashboardData" }),
    });

    const result = await res.json();

    if (!result.success) {
      setMessage(result.message || "Unable to load dashboard data.");
      return;
    }

    setData(result);
  }

  const totalIncome = sum(data.financialReports, "Income");
  const totalExpense = sum(data.financialReports, "Expense");
  const balance = totalIncome - totalExpense;

  if (!loggedIn) {
    return (
      <main style={main}>
        <div style={container}>
          <p style={eyebrow}>SERENADE SINGERS</p>
          <h1 style={title}>Admin Dashboard</h1>
          <p style={subtitle}>Secure administration area for Serenade Singers management.</p>

          <section style={card}>
            <h2 style={sectionTitle}>Admin Login</h2>

            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" style={{ ...input, width: "100%", marginTop: 18 }} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" type="password" style={{ ...input, width: "100%", marginTop: 14 }} />

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
        <p style={subtitle}>Live dashboard connected to Google Sheets.</p>

        <section style={card}>
          <h2 style={sectionTitle}>Dashboard Menu</h2>

          <select value={activeSection} onChange={(e) => setActiveSection(e.target.value)} style={{ ...input, width: "100%", marginTop: 18 }}>
            {sections.map((s) => <option key={s}>{s}</option>)}
          </select>

          <button onClick={loadDashboardData} style={{ ...button, marginTop: 16 }}>
            Refresh Data
          </button>
        </section>

        {activeSection === "Dashboard Summary" && (
          <section style={grid}>
            <Stat title="Members" value={data.members.length} />
            <Stat title="Volunteers" value={data.volunteers.length} />
            <Stat title="T-Shirt Orders" value={data.shirtOrders.length} />
            <Stat title="Payments" value={data.payments.length} />
            <Stat title="Income" value={`${totalIncome.toLocaleString()} Ks`} />
            <Stat title="Expense" value={`${totalExpense.toLocaleString()} Ks`} />
            <Stat title="Balance" value={`${balance.toLocaleString()} Ks`} />
            <Stat title="Announcements" value={data.announcements.length} />
            <Stat title="Events" value={data.events.length} />
            <Stat title="Documents" value={data.documents.length} />
          </section>
        )}

        {activeSection === "Members" && <DataTable title="Members" rows={data.members} />}
        {activeSection === "Volunteers" && <DataTable title="Volunteers" rows={data.volunteers} />}
        {activeSection === "T-Shirt Orders" && <DataTable title="T-Shirt Orders" rows={data.shirtOrders} />}
        {activeSection === "Payments" && <DataTable title="Payments" rows={data.payments} />}
        {activeSection === "Finance" && <DataTable title="Finance" rows={data.financialReports} />}
        {activeSection === "Announcements" && <DataTable title="Announcements" rows={data.announcements} />}
        {activeSection === "Events" && <DataTable title="Events" rows={data.events} />}
        {activeSection === "Documents" && <DataTable title="Documents" rows={data.documents} />}
        {activeSection === "Learning Center" && (
          <>
            <DataTable title="Learning Videos" rows={data.learningVideos} />
            <DataTable title="Learning Articles" rows={data.learningArticles} />
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <article style={statCard}>
      <p style={statLabel}>{title}</p>
      <h3 style={statValue}>{value}</h3>
    </article>
  );
}

function DataTable({ title, rows }: { title: string; rows: Row[] }) {
  const headers = rows.length ? Object.keys(rows[0]) : [];

  return (
    <section style={card}>
      <h2 style={sectionTitle}>{title}</h2>

      {rows.length === 0 ? (
        <p style={muted}>No data available.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 18 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {headers.map((h) => (
                    <td key={h} style={td}>{String(row[h] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function sum(rows: Row[], key: string) {
  return rows.reduce((total, row) => {
    const value = Number(String(row[key] || "0").replace(/,/g, ""));
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

const main = { minHeight: "100vh", background: "#faf8f3", color: "#061A2F" };
const container = { maxWidth: 1200, margin: "0 auto", padding: "56px 24px" };
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
const statValue = { marginTop: 10, fontSize: 26, fontWeight: 900 };
const th = { background: "#061A2F", color: "white", padding: 12, textAlign: "left" as const, whiteSpace: "nowrap" as const };
const td = { padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" as const };
