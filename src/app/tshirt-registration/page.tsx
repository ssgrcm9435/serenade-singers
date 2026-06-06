"use client";

import { useState } from "react";

const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
const quantities = [1, 2, 3, 4, 5];

export default function TshirtRegistrationPage() {
  const [gmail, setGmail] = useState("");
  const [verified, setVerified] = useState<any>(null);
  const [shirtSize, setShirtSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  async function verifyGmail() {
    setMessage("");
    setVerified(null);

    if (!gmail) return setMessage("Please enter Gmail.");
    if (!apiUrl) return setMessage("Apps Script URL is missing.");

    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ action: "checkMemberOrVolunteer", gmail }),
      });
      const data = await res.json();

      if (!data.verified) return setMessage(data.message || "Gmail not found.");

      setVerified(data);
      setMessage("Verified successfully.");
    } catch {
      setMessage("Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOrder() {

    if (loading) return;
    setMessage("");

    if (!verified?.verified) return setMessage("Please verify Gmail first.");
    if (!shirtSize) return setMessage("Please select shirt size.");
    if (!acceptTerms) return setMessage("Please accept Terms & Conditions.");

    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "submitShirtOrder",
          gmail: verified.gmail,
          shirtSize,
          quantity,
          remark,
          acceptTerms,
        }),
      });

      const data = await res.json();
      if (!data.success) return setMessage(data.message || "Submit failed.");

      setSuccess(data);
    } catch {
      setMessage("Submit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "#faf8f3", minHeight: "100vh", color: "#061A2F" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ fontWeight: 800, letterSpacing: "0.2em", color: "#C9A24A" }}>
          SERENADE SINGERS
        </p>

        <h1 style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 900, marginTop: 16 }}>
          Official T-Shirt Registration
        </h1>

        <p style={{ marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 780 }}>
          For registered Serenade Singers Members and Volunteers only. Please verify your Gmail before submitting your T-shirt order.
        </p>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, marginTop: 40 }}>
          <Card>
            <img src="/images/tshirts/member-black.jpg" alt="Members Official T-Shirt" style={{ width: "100%", borderRadius: 22 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 18 }}>Members Official T-Shirt</h2>
            <p>Black Color · Official Serenade Singers Design</p>
          </Card>

          <Card>
            <img src="/images/tshirts/volunteer-white.jpg" alt="Volunteers Official T-Shirt" style={{ width: "100%", borderRadius: 22 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 18 }}>Volunteers Official T-Shirt</h2>
            <p>White Color · Official Serenade Singers Design</p>
          </Card>
        </section>

        <Card>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Size Chart</h2>
          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#061A2F", color: "white" }}>
                  <th style={th}>Size</th>
                  <th style={th}>Shoulder</th>
                  <th style={th}>Chest</th>
                  <th style={th}>Length</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s}>
                    <td style={td}><b>{s}</b></td>
                    <td style={td}>Check sample</td>
                    <td style={td}>Check sample</td>
                    <td style={td}>Check sample</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>စည်းမျဉ်းစည်းကမ်းများ</h2>
          <ul style={{ marginTop: 18, lineHeight: 2, color: "#334155" }}>
            <li>ဤ Official T-Shirt သည် Serenade Singers တွင် တရားဝင် မှတ်ပုံတင်ထားသော Members နှင့် Volunteers များအတွက်သာ သီးသန့် ထုတ်လုပ်ထားခြင်း ဖြစ်ပါသည်။</li>
            <li>T-Shirt အတွက် ကောက်ခံသည့် ငွေပမာဏသည် ထုတ်လုပ်မှုနှင့် ဆက်စပ်သော အမှန်တကယ် ကုန်ကျစရိတ်များအပေါ် အခြေခံထားပြီး အမြတ်အစွန်း ထည့်သွင်းထားခြင်း မရှိပါ။</li>
            <li>Members Official T-Shirt ကို အမဲရောင်ဖြင့် ထုတ်လုပ်မည် ဖြစ်ပြီး Volunteers Official T-Shirt ကို အဖြူရောင်ဖြင့် ထုတ်လုပ်မည် ဖြစ်ပါသည်။</li>
            <li>Registration မတင်သွင်းမီ မိမိ၏ T-Shirt Size ကို သေချာစွာ စစ်ဆေး၍ မှန်ကန်စွာ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်။</li>
            <li>ထုတ်လုပ်မှုလုပ်ငန်းစဉ် စတင်ပြီးနောက် Size ပြောင်းလဲခြင်း၊ ပြင်ဆင်ခြင်း သို့မဟုတ် ပယ်ဖျက်ခြင်းများကို ဆောင်ရွက်ပေးနိုင်မည် မဟုတ်ပါ။</li>
          </ul>
        </Card>

        <Card>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Gmail Verification</h2>
          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <input value={gmail} onChange={(e) => setGmail(e.target.value)} placeholder="Enter registered Gmail" style={input} />
            <button onClick={verifyGmail} style={button}>{loading ? "Loading..." : "Verify Gmail"}</button>
          </div>

          {message && <p style={{ marginTop: 16, fontWeight: 700 }}>{message}</p>}

          {verified?.verified && (
            <div style={{ marginTop: 20, padding: 18, borderRadius: 18, background: "#ecfdf5", border: "1px solid #bbf7d0" }}>
              <b>✓ Verified</b>
              <p>ID: {verified.memberId}</p>
              <p>Name: {verified.fullName}</p>
              <p>Type: {verified.type}</p>
              <p>Voice Part: {verified.voicePart || "-"}</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>T-Shirt Order</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 18 }}>
            <select value={shirtSize} onChange={(e) => setShirtSize(e.target.value)} style={input}>
              <option value="">Select Size</option>
              {sizes.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={input}>
              {quantities.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>

          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Remark (optional)" style={{ ...input, width: "100%", marginTop: 18, minHeight: 110 }} />

          <label style={{ display: "flex", gap: 10, marginTop: 18, fontWeight: 800 }}>
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            I have read and agree to the Terms & Conditions.
          </label>

          <button
            onClick={submitOrder}
            disabled={loading}
            style={{
              ...button,
              width: "100%",
              marginTop: 24,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit T-Shirt Registration"}
          </button>
        </Card>

        {success && (
          <Card>
            <h2 style={{ fontSize: 28, fontWeight: 900 }}>Registration Submitted Successfully</h2>
            <p>Order ID: {success.orderId}</p>
            <p>Status: {success.status}</p>
          </Card>
        )}
      </div>
    
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            zIndex: 99999,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: "6px solid #e5e7eb",
              borderTop: "6px solid #061A2F",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <h2 style={{fontWeight:900,color:"#061A2F"}}>
            Processing Registration...
          </h2>
          <p>Please wait. Do not close this page.</p>
        </div>
      )}
    </main>

  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, marginTop: 28, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" }}>
      {children}
    </section>
  );
}

const input = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  padding: "14px 16px",
  fontSize: 15,
  flex: 1,
};

const button = {
  background: "#061A2F",
  color: "white",
  border: 0,
  borderRadius: 16,
  padding: "14px 22px",
  fontWeight: 900,
  cursor: "pointer",
};

const th = { padding: 14, textAlign: "left" as const };
const td = { padding: 14, borderBottom: "1px solid #e2e8f0" };


<style jsx global>{`
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`}</style>
