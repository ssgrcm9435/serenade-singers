"use client";

import { useState } from "react";

type Row = Record<string, any>;

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
        <div style={loginWrap}>
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
      <div className="admin-shell" style={shell}>
        <aside style={sidebar}>
          <p style={sidebarEyebrow}>SERENADE SINGERS</p>
          <h2 style={sidebarTitle}>Admin Panel</h2>

          <div style={adminCard}>
            <div style={adminAvatar}>A</div>
            <div>
              <p style={adminName}>Administrator</p>
              <p style={adminMeta}>Management Access</p>
            </div>
          </div>

          <nav style={nav}>
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  ...navButton,
                  ...(activeSection === section ? navButtonActive : {}),
                }}
              >
                {section}
              </button>
            ))}
          </nav>

          <button onClick={loadDashboardData} style={refreshButton}>
            Refresh Data
          </button>
        </aside>

        <section style={content}>
          <div style={topBar}>
            <div>
              <p style={eyebrow}>ADMIN AREA</p>
              <h1 style={pageTitle}>{activeSection}</h1>
            </div>
            <div style={statusBadge}>Live Sheet Data</div>
          </div>

          {activeSection === "Dashboard Summary" && (
            <section style={summaryGrid}>
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
              <Stat title="Learning Videos" value={data.learningVideos.length} />
              <Stat title="Learning Articles" value={data.learningArticles.length} />
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
          {activeSection === "Email Center" && (
            <section style={card}>
              <h2 style={sectionTitle}>Email Center</h2>
              <p style={muted}>
                Email templates are available in Apps Script. Sending controls will be added in the next update.
              </p>
            </section>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .admin-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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

const main = { minHeight: "100vh", background: "#f8f6f2", color: "#061A2F" };
const loginWrap = { maxWidth: 900, margin: "0 auto", padding: "72px 24px" };
const shell = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: 28,
  maxWidth: 1460,
  margin: "0 auto",
  padding: "32px 24px",
} as React.CSSProperties;
const sidebar = {
  position: "sticky" as const,
  top: 24,
  alignSelf: "start",
  background: "#061A2F",
  color: "white",
  borderRadius: 30,
  padding: 24,
  minHeight: "calc(100vh - 64px)",
  boxShadow: "0 22px 60px rgba(6,26,47,0.18)",
};
const content = { minWidth: 0 };
const eyebrow = { fontWeight: 900, letterSpacing: "0.18em", color: "#C9A24A", fontSize: 13 };
const title = { marginTop: 16, fontSize: 46, lineHeight: 1.1, fontWeight: 950 };
const pageTitle = { marginTop: 8, fontSize: 42, lineHeight: 1.1, fontWeight: 950 };
const subtitle = { marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 };
const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: 28,
  marginTop: 28,
  boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
};
const sectionTitle = { fontSize: 30, fontWeight: 950 };
const input = { border: "1px solid #cbd5e1", borderRadius: 16, padding: "14px 16px", fontSize: 15 };
const button = { background: "#061A2F", color: "white", border: 0, borderRadius: 16, padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const error = { marginTop: 14, color: "#b91c1c", fontWeight: 800 };
const muted = { marginTop: 14, color: "#64748b", lineHeight: 1.8 };
const sidebarEyebrow = { color: "#C9A24A", fontWeight: 900, letterSpacing: "0.15em", fontSize: 12 };
const sidebarTitle = { marginTop: 8, fontSize: 28, fontWeight: 950 };
const adminCard = { display: "flex", gap: 14, alignItems: "center", marginTop: 24, padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.08)" };
const adminAvatar = { width: 48, height: 48, borderRadius: "50%", background: "#C9A24A", color: "#061A2F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: 22 };
const adminName = { margin: 0, fontWeight: 900 };
const adminMeta = { margin: "4px 0 0", color: "#cbd5e1", fontSize: 13 };
const nav = { display: "grid", gap: 8, marginTop: 24 };
const navButton = { textAlign: "left" as const, border: 0, borderRadius: 16, padding: "13px 14px", background: "transparent", color: "#e2e8f0", fontWeight: 800, cursor: "pointer" };
const navButtonActive = { background: "#C9A24A", color: "#061A2F" };
const refreshButton = { marginTop: 22, width: "100%", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "13px 14px", fontWeight: 900, cursor: "pointer" };
const topBar = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" };
const statusBadge = { background: "#ecfdf5", color: "#047857", border: "1px solid #bbf7d0", borderRadius: 999, padding: "10px 16px", fontWeight: 900 };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginTop: 28 };
const statCard = { background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: 22, boxShadow: "0 12px 30px rgba(15,23,42,0.04)" };
const statLabel = { margin: 0, color: "#64748b", fontWeight: 800 };
const statValue = { margin: "10px 0 0", fontSize: 24, fontWeight: 950 };
const th = { background: "#061A2F", color: "white", padding: 12, textAlign: "left" as const, whiteSpace: "nowrap" as const };
const td = { padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" as const };
