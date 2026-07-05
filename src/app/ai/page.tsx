"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import LumiHeaderMascot from "@/components/LumiHeaderMascot";

type ChatMessage = {
  id: number;
  role: "user" | "lumi";
  content: string;
  time: string;
  status?: "delivered" | "seen";
  photoPreview?: string;
};

type SignupType = "member" | "volunteer";
type SignupStep =
  | "type"
  | "fullName"
  | "gmail"
  | "otp"
  | "phone"
  | "viberPhone"
  | "telegramContact"
  | "age"
  | "gender"
  | "nrcOrPassport"
  | "address"
  | "voiceType"
  | "experience"
  | "program"
  | "profilePhoto"
  | "volunteerCategory"
  | "specificRole"
  | "availability"
  | "portfolio"
  | "confirm";

type SignupDraft = {
  type?: SignupType;
  fullName: string;
  gmail: string;
  otp: string;
  phone: string;
  viberPhone: string;
  telegramContact: string;
  age: string;
  gender: string;
  nrcOrPassport: string;
  address: string;
  voiceType: string;
  experience: string;
  program: string;
  profilePhoto: string;
  profilePhotoName: string;
  volunteerCategory: string;
  specificRole: string;
  availability: string;
  portfolio: string;
};

const emptyDraft: SignupDraft = {
  fullName: "",
  gmail: "",
  otp: "",
  phone: "",
  viberPhone: "",
  telegramContact: "",
  age: "",
  gender: "",
  nrcOrPassport: "",
  address: "",
  voiceType: "",
  experience: "",
  program: "",
  profilePhoto: "",
  profilePhotoName: "",
  volunteerCategory: "",
  specificRole: "",
  availability: "",
  portfolio: "",
};

const suggestions = [
  "Member signup with Lumi",
  "Volunteer signup with Lumi",
  "Member ဘယ်လိုလျှောက်ရမလဲ?",
  "Volunteer ဘယ်လိုလျှောက်ရမလဲ?",
  "Voice Range Test ဘယ်လိုလုပ်ရမလဲ?",
  "Meeting ဘယ်လိုဝင်ရမလဲ?",
];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isGmail(value: string) {
  return /^[^\s@]+@gmail\.com$/i.test(value.trim());
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LumiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLumiTyping, setIsLumiTyping] = useState(true);
  const [signupStep, setSignupStep] = useState<SignupStep | null>(null);
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);
  const [busyLabel, setBusyLabel] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      pushLumi(
        "Hello, I'm Lumi.\n\nကျွန်မက Serenade Singers အတွက် အောက်ပါအရာတွေကို ကူညီပေးနိုင်ပါတယ်။\n\n• Member signup ကို step by step ဖြည့်ပေးနိုင်ပါတယ်\n• Volunteer application ဖြည့်ပေးနိုင်ပါတယ်\n• Gmail verification code ပို့ပြီး verify လုပ်ပေးနိုင်ပါတယ်\n• Profile photo upload လုပ်ခိုင်းပြီး registration ပြီးဆုံးအောင် ကူညီပေးနိုင်ပါတယ်\n• Events, meetings, choir information နဲ့ member guidance တွေ မေးလို့ရပါတယ်။\n\nစချင်ရင် “Member signup with Lumi” သို့မဟုတ် “Volunteer signup with Lumi” ကို နှိပ်ပါ။"
      );
      setIsLumiTyping(false);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLumiTyping]);

  function pushUser(content: string, photoPreview?: string) {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, role: "user", content, time: nowTime(), status: "delivered", photoPreview }]);
    window.setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status: "seen" } : msg)));
    }, 600);
  }

  function pushLumi(content: string) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: "lumi", content, time: nowTime() }]);
  }

  async function callSignup(action: "sendOtp" | "verifyOtp" | "member" | "volunteer", payload: Record<string, unknown>) {
    const res = await fetch("/api/lumi-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    return res.json();
  }

  function startSignup(type?: SignupType) {
    setDraft({ ...emptyDraft, type });
    setSignupStep(type ? "fullName" : "type");
    pushLumi(
      type
        ? `${type === "member" ? "Member" : "Volunteer"} signup ကို Lumi နဲ့ စမယ်။\n\nပထမဆုံး Full Name ရေးပေးပါ။`
        : "Lumi signup ကို စမယ်။\n\nMember အနေနဲ့လျှောက်မှာလား၊ Volunteer အနေနဲ့လျှောက်မှာလား?\n\nReply: Member or Volunteer"
    );
  }

  function summaryText(current: SignupDraft) {
    if (current.type === "member") {
      return `Please confirm your Member Registration:

Full Name: ${current.fullName}
Gmail: ${current.gmail}
Phone: ${current.phone}
Viber Phone: ${current.viberPhone}
Telegram: ${current.telegramContact}
Age: ${current.age}
Gender: ${current.gender}
NRC / Passport: ${current.nrcOrPassport}
Address: ${current.address}
Voice Type: ${current.voiceType}
Experience: ${current.experience}
Program: ${current.program}
Profile Photo: ${current.profilePhotoName ? "Uploaded" : "Missing"}

Type Submit to save to Registration, or Cancel to stop.`;
    }

    return `Please confirm your Volunteer Application:

Full Name: ${current.fullName}
Gmail: ${current.gmail}
Phone: ${current.phone}
Telegram: ${current.telegramContact}
Volunteer Category: ${current.volunteerCategory}
Specific Role: ${current.specificRole}
Availability: ${current.availability}
Experience: ${current.experience}
Portfolio: ${current.portfolio || "-"}

Type Submit to save to Registration, or Cancel to stop.`;
  }

  async function handleSignupReply(text: string) {
    if (!signupStep) return false;

    const value = text.trim();
    const lower = value.toLowerCase();

    if (["cancel", "stop", "မလုပ်တော့ဘူး"].includes(lower)) {
      setSignupStep(null);
      setDraft(emptyDraft);
      pushLumi("Okay, signup process ကို cancel လုပ်ထားပါတယ်။ လိုအပ်ရင် Lumi နဲ့ ပြန်စနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "type") {
      if (lower.includes("member")) {
        setDraft((prev) => ({ ...prev, type: "member" }));
        setSignupStep("fullName");
        pushLumi("Member signup ရွေးပြီးပါပြီ။ Full Name ရေးပေးပါ။");
        return true;
      }
      if (lower.includes("volunteer")) {
        setDraft((prev) => ({ ...prev, type: "volunteer" }));
        setSignupStep("fullName");
        pushLumi("Volunteer signup ရွေးပြီးပါပြီ။ Full Name ရေးပေးပါ။");
        return true;
      }
      pushLumi("Please reply Member or Volunteer.");
      return true;
    }

    if (signupStep === "fullName") {
      setDraft((prev) => ({ ...prev, fullName: value }));
      setSignupStep("gmail");
      pushLumi("Gmail address ရေးပေးပါ။ ဥပမာ name@gmail.com");
      return true;
    }

    if (signupStep === "gmail") {
      if (!isGmail(value)) {
        pushLumi("Gmail address ကိုမှန်အောင်ရေးပေးပါ။ Example: name@gmail.com");
        return true;
      }

      const next = { ...draft, gmail: value };
      setDraft(next);
      setBusyLabel("Sending Gmail verification code...");
      setIsLumiTyping(true);

      try {
        const result = await callSignup("sendOtp", { gmail: value });
        if (result.success) {
          setSignupStep("otp");
          pushLumi("Verification code ကို Gmail ထဲပို့ပြီးပါပြီ။ Code ကို ဒီမှာရေးပေးပါ။");
        } else {
          pushLumi(result.message || "OTP ပို့လို့မရပါ။ ပြန်စမ်းပါ။");
        }
      } catch {
        pushLumi("Connection error while sending OTP. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    if (signupStep === "otp") {
      const next = { ...draft, otp: value };
      setDraft(next);
      setBusyLabel("Verifying OTP...");
      setIsLumiTyping(true);

      try {
        const result = await callSignup("verifyOtp", { gmail: next.gmail, otp: value });
        if (!result.success) {
          pushLumi(result.message || "Invalid OTP. Please check Gmail and type the code again.");
        } else {
          setSignupStep("phone");
          pushLumi("Gmail verified ပါပြီ။ Phone number ရေးပေးပါ။");
        }
      } catch {
        pushLumi("OTP verification failed. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    const updateAndAsk = (field: keyof SignupDraft, nextStep: SignupStep, question: string) => {
      const next = { ...draft, [field]: value };
      setDraft(next);
      setSignupStep(nextStep);
      pushLumi(question);
    };

    if (signupStep === "phone") {
      if (draft.type === "member") updateAndAsk("phone", "viberPhone", "Viber phone number ရေးပေးပါ။ မရှိရင် Same လို့ရေးနိုင်ပါတယ်။");
      else updateAndAsk("phone", "telegramContact", "Telegram contact ရေးပေးပါ။ မရှိရင် None လို့ရေးနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "viberPhone") {
      updateAndAsk("viberPhone", "telegramContact", "Telegram contact ရေးပေးပါ။ မရှိရင် None လို့ရေးနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "telegramContact") {
      if (draft.type === "member") updateAndAsk("telegramContact", "age", "Age ရေးပေးပါ။");
      else updateAndAsk("telegramContact", "volunteerCategory", "Volunteer category ရေးပေးပါ။ ဥပမာ Event Support, Media, Admin, Music Support");
      return true;
    }

    if (signupStep === "age") {
      updateAndAsk("age", "gender", "Gender ရေးပေးပါ။");
      return true;
    }

    if (signupStep === "gender") {
      updateAndAsk("gender", "nrcOrPassport", "NRC or Passport number ရေးပေးပါ။");
      return true;
    }

    if (signupStep === "nrcOrPassport") {
      updateAndAsk("nrcOrPassport", "address", "Address ရေးပေးပါ။");
      return true;
    }

    if (signupStep === "address") {
      updateAndAsk("address", "voiceType", "Voice Type ရေးပေးပါ။ ဥပမာ Soprano, Alto, Tenor, Bass, Unknown");
      return true;
    }

    if (signupStep === "voiceType") {
      updateAndAsk("voiceType", "experience", "Choir / music experience ရေးပေးပါ။ Beginner ဆို Beginner လို့ရေးနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "experience") {
      if (draft.type === "member") updateAndAsk("experience", "program", "Program ရေးပေးပါ။ ဥပမာ Choir Member, Vocal Training, Music Education");
      else updateAndAsk("experience", "portfolio", "Portfolio link ရှိရင် ရေးပေးပါ။ မရှိရင် None လို့ရေးနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "program") {
      updateAndAsk("program", "profilePhoto", "Profile photo upload လုပ်ပေးပါ။ Lumi message ထဲက Upload Profile Photo button ကိုနှိပ်ပါ။");
      return true;
    }

    if (signupStep === "volunteerCategory") {
      updateAndAsk("volunteerCategory", "specificRole", "Specific role ရေးပေးပါ။ ဥပမာ Registration desk, Photographer, Admin assistant");
      return true;
    }

    if (signupStep === "specificRole") {
      updateAndAsk("specificRole", "availability", "Availability ရေးပေးပါ။ ဥပမာ Weekend, Weekday evening, Flexible");
      return true;
    }

    if (signupStep === "availability") {
      updateAndAsk("availability", "experience", "Relevant experience ရေးပေးပါ။ မရှိရင် Beginner လို့ရေးနိုင်ပါတယ်။");
      return true;
    }

    if (signupStep === "portfolio") {
      const next = { ...draft, portfolio: value };
      setDraft(next);
      setSignupStep("confirm");
      pushLumi(summaryText(next));
      return true;
    }

    if (signupStep === "profilePhoto") {
      pushLumi("ဒီအဆင့်မှာ text မဟုတ်ဘဲ photo upload လုပ်ရပါမယ်။ Upload Photo ခလုတ်ကိုနှိပ်ပါ။");
      return true;
    }

    if (signupStep === "confirm") {
      if (!["submit", "yes", "confirm", "save", "တင်မယ်", "အတည်ပြု"].some((word) => lower.includes(word))) {
        pushLumi("Submit လုပ်ချင်ရင် Submit လို့ရေးပါ။ မလုပ်တော့ရင် Cancel လို့ရေးပါ။");
        return true;
      }

      setBusyLabel("Finalizing your registration...");
      setIsLumiTyping(true);

      try {
        const action = draft.type === "member" ? "member" : "volunteer";
        const result = await callSignup(action, { ...draft, acceptTerms: "Yes" });
        if (result.success) {
          pushLumi(
            draft.type === "member"
              ? `Member registration successful ပါ။ Member ID: ${result.memberId || "Created"}\n\nRegistration ထဲ save လုပ်ပြီးပါပြီ။ Gmail ကိုလည်း စစ်ပေးပါ။`
              : `Volunteer application successful ပါ။ Volunteer ID: ${result.volunteerId || "Created"}\n\nRegistration ထဲ save လုပ်ပြီးပါပြီ။ Gmail ကိုလည်း စစ်ပေးပါ။`
          );
          setSignupStep(null);
          setDraft(emptyDraft);
        } else {
          pushLumi(result.message || "Submission failed. Please check your information and try again.");
        }
      } catch {
        pushLumi("Submission connection error. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    return false;
  }

  async function sendMessage(customText?: string) {
    const text = (customText || input).trim();
    if (!text || isLumiTyping) return;

    pushUser(text);
    setInput("");

    const lower = text.toLowerCase();

    if (!signupStep && (lower.includes("member signup") || lower.includes("member registration"))) {
      startSignup("member");
      return;
    }

    if (!signupStep && (lower.includes("volunteer signup") || lower.includes("volunteer application"))) {
      startSignup("volunteer");
      return;
    }

    if (!signupStep && (lower.includes("signup with lumi") || lower.includes("register with lumi"))) {
      startSignup();
      return;
    }

    if (signupStep) {
      await handleSignupReply(text);
      return;
    }

    setIsLumiTyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      pushLumi(data.answer || data.error || "Lumi cannot answer this question right now. Please try again later.");
    } catch {
      pushLumi("Connection error. Please try again later.");
    } finally {
      setIsLumiTyping(false);
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushLumi("Please upload an image file only.");
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      pushLumi("Photo file size is too large. Please upload under 2.5 MB.");
      return;
    }

    setBusyLabel("Uploading photo...");
    setIsLumiTyping(true);

    try {
      const base64 = await fileToBase64(file);
      const next = { ...draft, profilePhoto: base64, profilePhotoName: file.name };
      setDraft(next);
      pushUser(`Profile photo uploaded: ${file.name}`, base64);
      setSignupStep("confirm");
      pushLumi(summaryText(next));
    } catch {
      pushLumi("Photo upload failed. Please try another image.");
    } finally {
      setBusyLabel("");
      setIsLumiTyping(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <main style={styles.shell}>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }

        @keyframes lumiDotBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>

      <header style={styles.chatHeader}>
        <LumiHeaderMascot isTyping={isLumiTyping} />
      </header>

      <div style={styles.faqRow}>
        {suggestions.map((item) => (
          <button key={item} onClick={() => sendMessage(item)} disabled={isLumiTyping} style={{ ...styles.faqChip, opacity: isLumiTyping ? 0.55 : 1 }}>
            {item}
          </button>
        ))}
      </div>

      <section style={styles.messages}>
        {messages.map((message) => (
          <div key={message.id} style={{ ...styles.messageRow, justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
            {message.role === "lumi" && <div style={styles.avatar}>♪</div>}
            <div style={{ ...styles.bubble, ...(message.role === "user" ? styles.userBubble : styles.lumiBubble) }}>
              {message.photoPreview && <img src={message.photoPreview} alt="Uploaded preview" style={styles.photoPreview} />}
              <div style={styles.messageText}>{message.content}</div>
              <div style={styles.metaRow}>
                <span>{message.time}</span>
                {message.role === "user" && <span style={styles.status}>{message.status === "seen" ? "Seen" : "Delivered"}</span>}
              </div>
            </div>
          </div>
        ))}

        {signupStep === "profilePhoto" && !isLumiTyping && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={styles.avatar}>♪</div>
            <div style={{ ...styles.bubble, ...styles.lumiBubble }}>
              <div style={styles.messageText}>
                Profile photo ကို upload လုပ်ပေးပါ။ အောက်က button ကိုနှိပ်ပြီး photo ရွေးပါ။
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                style={styles.inlineUploadButton}
              >
                Upload Profile Photo
              </button>
            </div>
          </div>
        )}

        {isLumiTyping && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={styles.avatar}>♪</div>
            <div style={{ ...styles.bubble, ...styles.lumiBubble }}>
              <div style={styles.typingLine}>
                <span>{busyLabel || "Lumi is typing"}</span>
                <span style={styles.dots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }}>•</span>
                  <span style={{ ...styles.dot, animationDelay: "0.15s" }}>•</span>
                  <span style={{ ...styles.dot, animationDelay: "0.3s" }}>•</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoUpload} style={{ display: "none" }} />

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder={signupStep ? "Reply to Lumi's current signup question..." : "Type your question..."}
          disabled={isLumiTyping}
          style={styles.textarea}
        />

        <button type="submit" disabled={isLumiTyping || !input.trim()} style={{ ...styles.sendButton, opacity: isLumiTyping || !input.trim() ? 0.6 : 1 }}>
          Send
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: "calc(100dvh - 96px)",
    minHeight: 0,
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#F8FAFC",
  },
  chatHeader: {
    flexShrink: 0,
    padding: "14px 16px",
    borderBottom: "1px solid #E2E8F0",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  headerText: { textAlign: "center" },
  kicker: {
    margin: 0,
    color: "#64748B",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "2px 0 0",
    color: "#061A2F",
    fontSize: 24,
    fontWeight: 950,
  },
  subtitle: {
    margin: "2px 0 0",
    color: "#C9A24A",
    fontSize: 12,
    fontWeight: 900,
  },
  faqRow: {
    flexShrink: 0,
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "10px 12px",
    background: "#F8FAFC",
  },
  faqChip: {
    flexShrink: 0,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 850,
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "16px 14px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #061a2f, #12355b)",
    border: "2px solid rgba(201,162,74,.75)",
    color: "#f8d77a",
    fontSize: 20,
    fontWeight: 950,
    flex: "0 0 auto",
  },
  bubble: {
    maxWidth: "min(760px, 82vw)",
    borderRadius: 24,
    padding: "13px 15px",
    boxShadow: "0 14px 34px rgba(15,23,42,.08)",
  },
  userBubble: {
    background: "linear-gradient(135deg, #061a2f, #12355b)",
    color: "#FFFFFF",
    borderBottomRightRadius: 8,
  },
  lumiBubble: {
    background: "#FFFFFF",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderBottomLeftRadius: 8,
  },
  messageText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.65,
    fontSize: 15,
    fontWeight: 650,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    marginTop: 8,
    opacity: 0.7,
    fontSize: 11,
    fontWeight: 800,
  },
  status: { color: "#F8D77A" },
  inputBar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    padding: "12px",
    background: "#FFFFFF",
    borderTop: "1px solid #E2E8F0",
  },
  textarea: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    resize: "none",
    border: "1px solid #CBD5E1",
    borderRadius: 18,
    padding: "12px 14px",
    outline: "none",
    fontSize: 15,
    fontWeight: 650,
    color: "#0F172A",
    background: "#F8FAFC",
  },
  sendButton: {
    border: 0,
    borderRadius: 16,
    background: "#061A2F",
    color: "#FFFFFF",
    padding: "13px 18px",
    fontSize: 14,
    fontWeight: 950,
    cursor: "pointer",
  },
  uploadButton: {
    border: "1px solid #C9A24A",
    borderRadius: 16,
    background: "#FFF8E5",
    color: "#7A5B00",
    padding: "13px 14px",
    fontSize: 13,
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  typingLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 900,
    color: "#64748B",
  },
  dots: { display: "inline-flex", gap: 2 },
  dot: {
    display: "inline-block",
    animation: "lumiDotBounce 1s infinite",
  },
  photoPreview: {
    display: "block",
    width: 160,
    maxWidth: "100%",
    borderRadius: 18,
    marginBottom: 10,
    border: "1px solid rgba(255,255,255,.32)",
  },
};
