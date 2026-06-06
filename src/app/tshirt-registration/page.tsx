"use client";

import { useState } from "react";

type VerifiedPerson = {
  success: boolean;
  verified: boolean;
  type: "Member" | "Volunteer";
  memberId: string;
  fullName: string;
  gmail: string;
  voicePart?: string;
  message?: string;
};

type SubmitResult = {
  success: boolean;
  orderId?: string;
  status?: string;
  message: string;
};

const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
const quantities = [1, 2, 3, 4, 5];

export default function TshirtRegistrationPage() {
  const [gmail, setGmail] = useState("");
  const [verified, setVerified] = useState<VerifiedPerson | null>(null);
  const [shirtSize, setShirtSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<SubmitResult | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  async function verifyGmail() {
    setMessage("");
    setVerified(null);

    if (!gmail.trim()) {
      setMessage("Please enter your Gmail address.");
      return;
    }

    if (!apiUrl) {
      setMessage("Apps Script URL is missing.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "checkMemberOrVolunteer",
          gmail,
        }),
      });

      const data = await res.json();

      if (!data.verified) {
        setMessage(data.message || "Gmail not found in Serenade Singers records.");
        return;
      }

      setVerified(data);
      setMessage("Verified successfully.");
    } catch {
      setMessage("Unable to verify Gmail. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOrder() {
    setMessage("");

    if (!verified?.verified) {
      setMessage("Please verify your Gmail first.");
      return;
    }

    if (!shirtSize) {
      setMessage("Please select your T-shirt size.");
      return;
    }

    if (!acceptTerms) {
      setMessage("Please accept the Terms & Conditions.");
      return;
    }

    setSubmitting(true);

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

      if (!data.success) {
        setMessage(data.message || "Submission failed.");
        return;
      }

      setSuccess(data);
    } catch {
      setMessage("Unable to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950"><div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-700">
          Serenade Singers
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#061A2F] md:text-6xl">
          Official T-Shirt Registration
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          For registered Serenade Singers Members and Volunteers only. Please verify your Gmail before submitting your T-shirt order.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <img
              src="/images/tshirts/member-black.jpg"
              alt="Members Official Black T-Shirt"
              className="h-64 w-full rounded-2xl object-cover bg-black"
            />
            <h2 className="mt-6 text-2xl font-black text-[#061A2F]">
              Members Official T-Shirt
            </h2>
            <p className="mt-2 text-slate-600">Black Color · Official Serenade Singers Design</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <img
              src="/images/tshirts/volunteer-white.jpg"
              alt="Volunteers Official White T-Shirt"
              className="h-64 w-full rounded-2xl border object-cover bg-white"
            />
            <h2 className="mt-6 text-2xl font-black text-[#061A2F]">
              Volunteers Official T-Shirt
            </h2>
            <p className="mt-2 text-slate-600">White Color · Official Serenade Singers Design</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-[#061A2F]">Size Chart</h2>

          <img
            src="/images/tshirts/size-chart.jpg"
            alt="T-Shirt Size Chart"
            className="mt-5 w-full rounded-3xl border border-slate-200 object-cover"
          />

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-[#061A2F] text-white">
                  <th className="p-3">Size</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Length</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s} className="border-b border-slate-200">
                    <td className="p-3 font-bold">{s}</td>
                    <td className="p-3">Please check sample</td>
                    <td className="p-3">Please check sample</td>
                    <td className="p-3">Please check sample</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-black text-[#061A2F]">Gmail Verification</h2>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="Enter registered Gmail address"
              className="flex-1 rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-[#061A2F]"
            />
            <button
              onClick={verifyGmail}
              disabled={loading}
              className="rounded-2xl bg-[#061A2F] px-8 py-4 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Gmail"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}

          {verified?.verified && (
            <div className="mt-6 grid gap-4 rounded-3xl border border-green-200 bg-green-50 p-6 md:grid-cols-2">
              <p className="font-black text-green-700 md:col-span-2">✓ Verified</p>
              <Info label="ID" value={verified.memberId} />
              <Info label="Full Name" value={verified.fullName} />
              <Info label="Type" value={verified.type} />
              <Info label="Voice Part" value={verified.voicePart || "-"} />
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-[#061A2F]">T-Shirt Order</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="font-bold">Shirt Size</span>
              <select
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4"
              >
                <option value="">Select Size</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4"
              >
                {quantities.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="font-bold">Remark</span>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Optional"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4"
            />
          </label>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-black text-[#061A2F]">Terms & Conditions</h2>

          <ul className="mt-4 space-y-3 leading-8 text-slate-700">
            <li>• ဤ Official T-Shirt သည် Serenade Singers တွင် တရားဝင် မှတ်ပုံတင်ထားသော Members နှင့် Volunteers များအတွက်သာ သီးသန့် ထုတ်လုပ်ထားခြင်း ဖြစ်ပါသည်။</li>
            <li>• T-Shirt အတွက် ကောက်ခံသည့် ငွေပမာဏသည် ထုတ်လုပ်မှုနှင့် ဆက်စပ်သော အမှန်တကယ် ကုန်ကျစရိတ်များအပေါ် အခြေခံထားပြီး အမြတ်အစွန်း ထည့်သွင်းထားခြင်း မရှိပါ။</li>
            <li>• Members Official T-Shirt ကို အမဲရောင် (Black) ဖြင့် ထုတ်လုပ်မည် ဖြစ်ပြီး Volunteers Official T-Shirt ကို အဖြူရောင် (White) ဖြင့် ထုတ်လုပ်မည် ဖြစ်ပါသည်။</li>
            <li>• Registration မတင်သွင်းမီ မိမိ၏ T-Shirt Size ကို သေချာစွာ စစ်ဆေး၍ မှန်ကန်စွာ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်။</li>
            <li>• ထုတ်လုပ်မှုလုပ်ငန်းစဉ် စတင်ပြီးနောက် Size ပြောင်းလဲခြင်း၊ ပြင်ဆင်ခြင်း သို့မဟုတ် ပယ်ဖျက်ခြင်းများကို ဆောင်ရွက်ပေးနိုင်မည် မဟုတ်ပါ။</li>
            <li>• Official T-Shirt များကို Choir Rehearsals, Performances, Workshops, Concerts နှင့် Serenade Singers ၏ တရားဝင် လှုပ်ရှားမှုများတွင် သင့်လျော်စွာ ဝတ်ဆင်အသုံးပြုရန် ဖြစ်ပါသည်။</li>
            <li>• ထုတ်လုပ်မှုအခြေအနေ၊ အရေအတွက် သို့မဟုတ် အခြားလိုအပ်ချက်များအပေါ် မူတည်၍ Serenade Singers မှ ထုတ်လုပ်မှုနှင့် ဖြန့်ဝေမှု အချိန်ဇယားများကို လိုအပ်သလို ပြင်ဆင်ပြောင်းလဲနိုင်ပါသည်။</li>
            <li>• Registration တင်သွင်းခြင်းဖြင့် အထက်ဖော်ပြပါ စည်းမျဉ်းစည်းကမ်းများအား ဖတ်ရှုနားလည်ပြီး သဘောတူလက်ခံကြောင်း အတည်ပြုခြင်း ဖြစ်ပါသည်။</li>
          </ul>

          <label className="mt-6 flex items-start gap-3 font-bold">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            I have read and agree to the Terms & Conditions.
          </label>

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="mt-8 w-full rounded-2xl bg-yellow-600 px-8 py-4 font-black text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit T-Shirt Registration"}
          </button>
        </div>
      </section>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
          <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-black text-[#061A2F]">
              Registration Submitted Successfully
            </h2>
            <p className="mt-4 text-slate-600">Order ID: {success.orderId}</p>
            <p className="mt-1 text-slate-600">Status: {success.status}</p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-6 rounded-2xl bg-[#061A2F] px-8 py-3 font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div></main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-[#061A2F]">{value}</p>
    </div>
  );
}
