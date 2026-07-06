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

type LumiWorkflowStep =
  | "tshirt_gmail"
  | "tshirt_otp"
  | "tshirt_size"
  | "tshirt_quantity"
  | "tshirt_remark"
  | "payment_gmail"
  | "payment_otp"
  | "payment_order_id"
  | "payment_amount"
  | "payment_method"
  | "payment_screenshot"
  | "payment_remark"
  | "suggestion_gmail"
  | "suggestion_otp"
  | "suggestion_category"
  | "suggestion_message";

type LumiWorkflowDraft = {
  gmail: string;
  otp: string;
  shirtSize: string;
  quantity: string;
  remark: string;
  orderId: string;
  amountPaid: string;
  paymentMethod: string;
  paymentScreenshot: string;
  category: string;
  message: string;
};

const emptyWorkflowDraft: LumiWorkflowDraft = {
  gmail: "",
  otp: "",
  shirtSize: "",
  quantity: "",
  remark: "",
  orderId: "",
  amountPaid: "",
  paymentMethod: "",
  paymentScreenshot: "",
  category: "",
  message: "",
};

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

const LUMI_HISTORY_KEY = "serenade_lumi_chat_history_v1";
const LUMI_DRAFT_KEY = "serenade_lumi_signup_draft_v1";
const LUMI_STEP_KEY = "serenade_lumi_signup_step_v1";
const LUMI_WORKFLOW_STEP_KEY = "serenade_lumi_workflow_step_v1";
const LUMI_WORKFLOW_DRAFT_KEY = "serenade_lumi_workflow_draft_v1";

const suggestions = [
  "Member signup with Lumi",
  "Volunteer signup with Lumi",
  "Member ဘယ်လိုလျှောက်ရမလဲ?",
  "Volunteer ဘယ်လိုလျှောက်ရမလဲ?",
  "Official T-shirt မှာချင်တယ်",
  "Payment တင်မယ်",
  "အကြံပြုစာပို့ချင်တယ်",
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


function MessageContent({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        const isUrl = /^https?:\/\/[^\s]+$/.test(part);

        if (isUrl) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2563EB",
                fontWeight: 950,
                textDecoration: "underline",
                wordBreak: "break-word",
              }}
            >
              {part}
            </a>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function LumiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLumiTyping, setIsLumiTyping] = useState(true);
  const [signupStep, setSignupStep] = useState<SignupStep | null>(null);
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);
  const [workflowStep, setWorkflowStep] = useState<LumiWorkflowStep | null>(null);
  const [workflowDraft, setWorkflowDraft] = useState<LumiWorkflowDraft>(emptyWorkflowDraft);
  const [busyLabel, setBusyLabel] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(LUMI_HISTORY_KEY);
      const savedDraft = localStorage.getItem(LUMI_DRAFT_KEY);
      const savedStep = localStorage.getItem(LUMI_STEP_KEY);
      const savedWorkflowStep = localStorage.getItem(LUMI_WORKFLOW_STEP_KEY);
      const savedWorkflowDraft = localStorage.getItem(LUMI_WORKFLOW_DRAFT_KEY);

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
          if (savedDraft) setDraft(JSON.parse(savedDraft));
          if (savedStep && savedStep !== "null") setSignupStep(savedStep as SignupStep);
          if (savedWorkflowStep && savedWorkflowStep !== "null") setWorkflowStep(savedWorkflowStep as LumiWorkflowStep);
          if (savedWorkflowDraft) setWorkflowDraft(JSON.parse(savedWorkflowDraft));
          setIsLumiTyping(false);
          return;
        }
      }
    } catch {
      localStorage.removeItem(LUMI_HISTORY_KEY);
      localStorage.removeItem(LUMI_DRAFT_KEY);
      localStorage.removeItem(LUMI_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);
    }

    const timer = window.setTimeout(() => {
      pushLumi(
        "Hello, I'm Lumi.\n\nI can help you with:\n\n• Member Account ဖွင့်မယ်\n• Volunteer Account ဖွင့်မယ်\n• Serenade Singers အကြောင်း လေ့လာမယ်\n\nဒီနေ့ ဘာကူညီပေးရမလဲ?"
      );
      setIsLumiTyping(false);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });

    try {
      localStorage.setItem(LUMI_HISTORY_KEY, JSON.stringify(messages.slice(-80)));
      localStorage.setItem(LUMI_DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem(LUMI_STEP_KEY, JSON.stringify(signupStep));
      localStorage.setItem(LUMI_WORKFLOW_STEP_KEY, JSON.stringify(workflowStep));
      localStorage.setItem(LUMI_WORKFLOW_DRAFT_KEY, JSON.stringify(workflowDraft));
    } catch {
      // Ignore localStorage quota or privacy-mode errors.
    }
  }, [messages, draft, signupStep, workflowStep, workflowDraft, isLumiTyping]);

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

  async function callSignup(action: "sendOtp" | "verifyOtp" | "member" | "volunteer" | "checkMemberOrVolunteer" | "submitShirtOrder" | "submitTshirtPayment" | "submitSuggestion", payload: Record<string, unknown>) {
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


  function includesAny(textValue: string, words: string[]) {
    const lower = textValue.toLowerCase();
    return words.some((word) => lower.includes(word.toLowerCase()));
  }

  const tshirtWords = ["အကျီ", "တီရှပ်", "shirt", "t-shirt", "uniform", "official shirt", "အင်္ကျီ"];
  const paymentWords = ["payment", "ငွေလွှဲ", "ငွေချေ", "receipt", "screenshot", "transfer"];
  const suggestionWords = ["အကြံပြု", "အကြံပေး", "feedback", "suggestion", "complaint", "ပြောချင်တာ"];

  function resetWorkflow() {
    setWorkflowStep(null);
    setWorkflowDraft(emptyWorkflowDraft);
    localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
    localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);
  }

  function startTshirtWorkflow() {
    setSignupStep(null);
    setWorkflowDraft(emptyWorkflowDraft);
    setWorkflowStep("tshirt_gmail");
    pushLumi("Official T-shirt မှာယူခြင်းကို စမယ်။\n\nပထမဆုံး registered Gmail address ရေးပေးပါ။");
  }

  function startPaymentWorkflow() {
    setSignupStep(null);
    setWorkflowDraft(emptyWorkflowDraft);
    setWorkflowStep("payment_gmail");
    pushLumi("Payment submission ကို စမယ်။\n\nပထမဆုံး registered Gmail address ရေးပေးပါ။");
  }

  function startSuggestionWorkflow() {
    setSignupStep(null);
    setWorkflowDraft(emptyWorkflowDraft);
    setWorkflowStep("suggestion_gmail");
    pushLumi("အကြံပြုစာပေးပို့ခြင်းကို စမယ်။\n\nပထမဆုံး registered Gmail address ရေးပေးပါ။");
  }

  async function sendWorkflowOtp(gmail: string, nextStep: LumiWorkflowStep) {
    setBusyLabel("Checking registered Gmail...");
    setIsLumiTyping(true);

    try {
      const registered = await callSignup("checkMemberOrVolunteer", { gmail });

      if (!registered?.success || !registered?.verified) {
        pushLumi(
          registered?.message ||
            "ဒီ Gmail က Serenade Singers Member / Volunteer အဖြစ် registered မလုပ်ထားသေးပါ။ Registered Gmail နဲ့ပြန်စမ်းပေးပါ။"
        );
        return;
      }

      setBusyLabel("Sending Gmail verification code...");

      const result = await callSignup("sendOtp", { gmail });

      if (result.success) {
        setWorkflowDraft((prev) => ({ ...prev, gmail }));
        setWorkflowStep(nextStep);
        pushLumi("Verification code ကို registered Gmail ထဲပို့ပြီးပါပြီ။ OTP code ကို ဒီမှာရေးပေးပါ။");
      } else {
        pushLumi(result.message || "OTP ပို့လို့မရပါ။ Registered Gmail နဲ့ပြန်စမ်းပါ။");
      }
    } catch {
      pushLumi("ဒီ Gmail ကို member / volunteer record ထဲမှာ မတွေ့ပါ။ Registered Gmail နဲ့ပြန်စမ်းပေးပါ။");
    } finally {
      setBusyLabel("");
      setIsLumiTyping(false);
    }
  }

  async function verifyWorkflowOtp(otp: string, nextStep: LumiWorkflowStep, nextMessage: string) {
    setBusyLabel("Verifying Gmail...");
    setIsLumiTyping(true);

    try {
      const otpResult = await callSignup("verifyOtp", { gmail: workflowDraft.gmail, otp });
      if (!otpResult.success) {
        pushLumi(otpResult.message || "Invalid OTP. Please check Gmail and try again.");
        return;
      }

      const registered = await callSignup("checkMemberOrVolunteer", { gmail: workflowDraft.gmail });
      if (!registered.verified) {
        pushLumi(registered.message || "This Gmail is not registered as Member or Volunteer.");
        resetWorkflow();
        return;
      }

      setWorkflowDraft((prev) => ({ ...prev, otp }));
      setWorkflowStep(nextStep);
      pushLumi(nextMessage);
    } catch {
      pushLumi("Verification failed. Please try again.");
    } finally {
      setBusyLabel("");
      setIsLumiTyping(false);
    }
  }

  async function handleWorkflowReply(text: string) {
    if (!workflowStep) return false;

    const value = text.trim();
    const lower = value.toLowerCase();

    if (["cancel", "stop", "reset", "မလုပ်တော့ဘူး", "ရပ်မယ်", "ဖျက်မယ်"].some((word) => lower.includes(word))) {
      resetWorkflow();
      pushLumi("Okay, current Lumi workflow ကို cancel လုပ်ပြီးပါပြီ။");
      return true;
    }

    if (workflowStep.endsWith("_gmail")) {
      if (!isGmail(value)) {
        pushLumi("Registered Gmail address ကိုမှန်အောင်ရေးပေးပါ။ Example: name@gmail.com");
        return true;
      }

      if (workflowStep === "tshirt_gmail") await sendWorkflowOtp(value, "tshirt_otp");
      if (workflowStep === "payment_gmail") await sendWorkflowOtp(value, "payment_otp");
      if (workflowStep === "suggestion_gmail") await sendWorkflowOtp(value, "suggestion_otp");
      return true;
    }

    if (workflowStep === "tshirt_otp") {
      await verifyWorkflowOtp(value, "tshirt_size", "Gmail verified ပါပြီ။\n\nT-shirt size ရေးပေးပါ။ S, M, L, XL, 2XL, 3XL");
      return true;
    }

    if (workflowStep === "tshirt_size") {
      const size = value.toUpperCase();
      if (!["S", "M", "L", "XL", "2XL", "3XL"].includes(size)) {
        pushLumi("Size ကို S, M, L, XL, 2XL, 3XL ထဲက ရွေးပေးပါ။");
        return true;
      }
      setWorkflowDraft((prev) => ({ ...prev, shirtSize: size }));
      setWorkflowStep("tshirt_quantity");
      pushLumi("Quantity ရေးပေးပါ။ 1 ကနေ 5 အတွင်း ဖြစ်ရပါမယ်။");
      return true;
    }

    if (workflowStep === "tshirt_quantity") {
      const quantity = Number(value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
        pushLumi("Quantity ကို 1 ကနေ 5 အတွင်း နံပါတ်နဲ့ရေးပေးပါ။");
        return true;
      }
      setWorkflowDraft((prev) => ({ ...prev, quantity: String(quantity) }));
      setWorkflowStep("tshirt_remark");
      pushLumi("Remark ရှိရင်ရေးပေးပါ။ မရှိရင် None လို့ရေးပါ။");
      return true;
    }

    if (workflowStep === "tshirt_remark") {
      setBusyLabel("Submitting T-shirt order...");
      setIsLumiTyping(true);
      try {
        const result = await callSignup("submitShirtOrder", {
          gmail: workflowDraft.gmail,
          shirtSize: workflowDraft.shirtSize,
          quantity: workflowDraft.quantity,
          remark: value === "None" ? "" : value,
          acceptTerms: "Yes",
        });

        if (result.success) {
          pushLumi(`T-shirt order တင်ပြီးပါပြီ။\n\nOrder ID: ${result.orderId || "Created"}\nStatus: Pending`);
          resetWorkflow();
        } else {
          pushLumi(result.message || "T-shirt order submission failed.");
        }
      } catch {
        pushLumi("T-shirt order connection error. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    if (workflowStep === "payment_otp") {
      await verifyWorkflowOtp(value, "payment_order_id", "Gmail verified ပါပြီ။\n\nPayment တင်မယ့် Order ID ရေးပေးပါ။");
      return true;
    }

    if (workflowStep === "payment_order_id") {
      setWorkflowDraft((prev) => ({ ...prev, orderId: value }));
      setWorkflowStep("payment_amount");
      pushLumi("Amount paid ရေးပေးပါ။ ဥပမာ 18000");
      return true;
    }

    if (workflowStep === "payment_amount") {
      const amount = Number(value.replace(/,/g, ""));
      if (!amount || amount <= 0) {
        pushLumi("Amount ကို နံပါတ်နဲ့မှန်အောင်ရေးပေးပါ။ ဥပမာ 18000");
        return true;
      }
      setWorkflowDraft((prev) => ({ ...prev, amountPaid: String(amount) }));
      setWorkflowStep("payment_method");
      pushLumi("Payment method ရေးပေးပါ။ ဥပမာ KBZ Pay, Wave Pay, AYA Pay, Bank Transfer");
      return true;
    }

    if (workflowStep === "payment_method") {
      setWorkflowDraft((prev) => ({ ...prev, paymentMethod: value }));
      setWorkflowStep("payment_screenshot");
      pushLumi("Payment screenshot URL သို့မဟုတ် receipt image link ရေးပေးပါ။");
      return true;
    }

    if (workflowStep === "payment_screenshot") {
      setWorkflowDraft((prev) => ({ ...prev, paymentScreenshot: value }));
      setWorkflowStep("payment_remark");
      pushLumi("Payment remark ရှိရင်ရေးပါ။ မရှိရင် None လို့ရေးပါ။");
      return true;
    }

    if (workflowStep === "payment_remark") {
      setBusyLabel("Submitting payment...");
      setIsLumiTyping(true);
      try {
        const result = await callSignup("submitTshirtPayment", {
          gmail: workflowDraft.gmail,
          orderId: workflowDraft.orderId,
          amountPaid: workflowDraft.amountPaid,
          paymentMethod: workflowDraft.paymentMethod,
          paymentScreenshot: workflowDraft.paymentScreenshot,
          remarks: value === "None" ? "" : value,
        });

        if (result.success) {
          pushLumi(`Payment တင်ပြီးပါပြီ။\n\nReceipt No: ${result.receiptNo || "Created"}\nStatus: Pending Verification`);
          resetWorkflow();
        } else {
          pushLumi(result.message || "Payment submission failed.");
        }
      } catch {
        pushLumi("Payment connection error. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    if (workflowStep === "suggestion_otp") {
      await verifyWorkflowOtp(value, "suggestion_category", "Gmail verified ပါပြီ။\n\nSuggestion category ရေးပေးပါ။ ဥပမာ General, Event, Member System, Music Class");
      return true;
    }

    if (workflowStep === "suggestion_category") {
      setWorkflowDraft((prev) => ({ ...prev, category: value }));
      setWorkflowStep("suggestion_message");
      pushLumi("အကြံပြုစာ အသေးစိတ်ရေးပေးပါ။");
      return true;
    }

    if (workflowStep === "suggestion_message") {
      setBusyLabel("Submitting suggestion...");
      setIsLumiTyping(true);
      try {
        const result = await callSignup("submitSuggestion", {
          gmail: workflowDraft.gmail,
          category: workflowDraft.category,
          message: value,
        });

        if (result.success) {
          pushLumi(`အကြံပြုစာ တင်ပြီးပါပြီ။\n\nSuggestion ID: ${result.suggestionId || "Created"}\nStatus: Pending Review`);
          resetWorkflow();
        } else {
          pushLumi(result.message || "Suggestion submission failed.");
        }
      } catch {
        pushLumi("Suggestion connection error. Please try again.");
      } finally {
        setBusyLabel("");
        setIsLumiTyping(false);
      }
      return true;
    }

    return false;
  }

  async function handleSignupReply(text: string) {
    if (!signupStep) return false;

    const value = text.trim();
    const lower = value.toLowerCase();

    if (
      [
        "cancel",
        "stop",
        "quit",
        "exit",
        "restart",
        "reset",
        "မလုပ်တော့ဘူး",
        "ရပ်မယ်",
        "မဖြည့်တော့ဘူး",
        "အစကပြန်စမယ်",
        "ဖျက်မယ်",
      ].some((word) => lower.includes(word))
    ) {
      setSignupStep(null);
      setDraft(emptyDraft);

      try {
        localStorage.removeItem(LUMI_DRAFT_KEY);
        localStorage.removeItem(LUMI_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);
      } catch {
        // Ignore browser storage errors.
      }

      pushLumi(
        "Okay, signup process ကို cancel လုပ်ထားပါတယ်။\n\nသိမ်းထားတဲ့ incomplete signup draft ကိုလည်း ဖျက်ပြီးပါပြီ။ ပြန်စချင်ရင် “Member signup with Lumi” သို့မဟုတ် “Volunteer signup with Lumi” ကိုနှိပ်ပါ။"
      );

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
      setBusyLabel("Sending Gmail verification code စစ်ပေးခြင်း code...");
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
      updateAndAsk("program", "profilePhoto", "Profile photo upload လုပ်ပေးခြင်း လုပ်ပေးပါ။ Lumi message ထဲက Upload Profile Photo button ကိုနှိပ်ပါ။");
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
          localStorage.removeItem(LUMI_DRAFT_KEY);
          localStorage.removeItem(LUMI_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);
          localStorage.removeItem(LUMI_DRAFT_KEY);
          localStorage.removeItem(LUMI_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);
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

    if (workflowStep) {
      await handleWorkflowReply(text);
      return;
    }

    if (!signupStep && includesAny(text, tshirtWords)) {
      startTshirtWorkflow();
      return;
    }

    if (!signupStep && includesAny(text, paymentWords)) {
      startPaymentWorkflow();
      return;
    }

    if (!signupStep && includesAny(text, suggestionWords)) {
      startSuggestionWorkflow();
      return;
    }

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
      pushUser(`Profile photo upload လုပ်ပေးခြင်းed: ${file.name}`, base64);
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
    <main data-lumi-page="true" style={styles.shell}>
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
      `}
      </style>

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
              <div style={styles.messageText}><MessageContent text={message.content} /></div>
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
          placeholder={signupStep || workflowStep ? "Reply to Lumi's current question..." : "Type your question..."}
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
    height: "calc(100dvh - 88px)",
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
    padding: "10px 16px",
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
    maxWidth: "min(720px, 78vw)",
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
