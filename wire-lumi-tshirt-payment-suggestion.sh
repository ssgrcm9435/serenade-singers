#!/usr/bin/env bash
set -euo pipefail

echo "Wiring Lumi chat UI to T-shirt order, payment, and suggestion workflows..."

python3 - <<'PY'
from pathlib import Path
import re

api = Path("src/app/api/lumi-signup/route.ts")
ai = Path("src/app/ai/page.tsx")
gs = Path("TShirt.gs")

for p in [api, ai, gs]:
    if not p.exists():
        raise FileNotFoundError(f"Missing {p}")

# 1. Allow new Lumi actions
api_text = api.read_text()
api_text = re.sub(
    r'const ALLOWED_ACTIONS\s*=\s*new Set\(\[[\s\S]*?\]\);',
    '''const ALLOWED_ACTIONS = new Set([
  "sendOtp",
  "verifyOtp",
  "member",
  "volunteer",
  "checkMemberOrVolunteer",
  "submitShirtOrder",
  "submitTshirtPayment",
  "submitSuggestion",
]);''',
    api_text,
    count=1,
)
api.write_text(api_text)

# 2. Add Suggestion backend if missing
gs_text = gs.read_text()

if 'action === "submitSuggestion"' not in gs_text:
    gs_text = gs_text.replace(
        '''    if (action === "submitTshirtPayment") {
      return json_(submitTshirtPayment_(body));
    }''',
        '''    if (action === "submitTshirtPayment") {
      return json_(submitTshirtPayment_(body));
    }

    if (action === "submitSuggestion") {
      return json_(submitSuggestion_(body));
    }'''
    )

if "function submitSuggestion_" not in gs_text:
    gs_text += r'''

/*******************************************************
 * LUMI — SUGGESTION / FEEDBACK SUBMISSION
 *******************************************************/

function submitSuggestion_(body) {
  const required = ["gmail", "message"];
  const missing = required.filter(function(key) {
    return !body[key];
  });

  if (missing.length) {
    return {
      success: false,
      message: "Missing required fields: " + missing.join(", "),
    };
  }

  const verified = checkMemberOrVolunteer_(body.gmail);

  if (!verified.verified) {
    return {
      success: false,
      message: "Registered Gmail verification failed.",
    };
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreateSheet_(ss, "Suggestions");

  setupHeaders_(sheet, [
    "Created At",
    "Suggestion ID",
    "Member ID",
    "Full Name",
    "Gmail",
    "Type",
    "Category",
    "Message",
    "Status",
    "Admin Remark"
  ]);

  const suggestionId = "SG-" + Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd-HHmmss"
  );

  sheet.appendRow([
    new Date(),
    suggestionId,
    verified.memberId || "",
    verified.fullName || "",
    normalizeEmail_(body.gmail),
    verified.type || "",
    body.category || "General",
    body.message,
    "Pending Review",
    ""
  ]);

  return {
    success: true,
    message: "Your suggestion has been submitted successfully.",
    suggestionId: suggestionId,
    status: "Pending Review"
  };
}
'''
gs.write_text(gs_text)

# 3. Wire Lumi chat page
text = ai.read_text()

if "type LumiWorkflowStep" not in text:
    text = text.replace(
        '''type SignupDraft = {''',
        '''type LumiWorkflowStep =
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

type SignupDraft = {'''
    )

if "LUMI_WORKFLOW_STEP_KEY" not in text:
    text = text.replace(
        '''const LUMI_STEP_KEY = "serenade_lumi_signup_step_v1";''',
        '''const LUMI_STEP_KEY = "serenade_lumi_signup_step_v1";
const LUMI_WORKFLOW_STEP_KEY = "serenade_lumi_workflow_step_v1";
const LUMI_WORKFLOW_DRAFT_KEY = "serenade_lumi_workflow_draft_v1";'''
    )

text = text.replace(
    '''  "Voice Range Test ဘယ်လိုလုပ်ရမလဲ?",
  "Meeting ဘယ်လိုဝင်ရမလဲ?",''',
    '''  "Official T-shirt မှာချင်တယ်",
  "Payment တင်မယ်",
  "အကြံပြုစာပို့ချင်တယ်",
  "Voice Range Test ဘယ်လိုလုပ်ရမလဲ?",
  "Meeting ဘယ်လိုဝင်ရမလဲ?",'''
)

if "workflowStep" not in text[text.find("export default function LumiPage"):text.find("useEffect")]:
    text = text.replace(
        '''  const [signupStep, setSignupStep] = useState<SignupStep | null>(null);
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);''',
        '''  const [signupStep, setSignupStep] = useState<SignupStep | null>(null);
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);
  const [workflowStep, setWorkflowStep] = useState<LumiWorkflowStep | null>(null);
  const [workflowDraft, setWorkflowDraft] = useState<LumiWorkflowDraft>(emptyWorkflowDraft);'''
    )

text = text.replace(
    '''      const savedStep = localStorage.getItem(LUMI_STEP_KEY);''',
    '''      const savedStep = localStorage.getItem(LUMI_STEP_KEY);
      const savedWorkflowStep = localStorage.getItem(LUMI_WORKFLOW_STEP_KEY);
      const savedWorkflowDraft = localStorage.getItem(LUMI_WORKFLOW_DRAFT_KEY);'''
)

text = text.replace(
    '''          if (savedStep && savedStep !== "null") setSignupStep(savedStep as SignupStep);''',
    '''          if (savedStep && savedStep !== "null") setSignupStep(savedStep as SignupStep);
          if (savedWorkflowStep && savedWorkflowStep !== "null") setWorkflowStep(savedWorkflowStep as LumiWorkflowStep);
          if (savedWorkflowDraft) setWorkflowDraft(JSON.parse(savedWorkflowDraft));'''
)

text = text.replace(
    '''      localStorage.removeItem(LUMI_STEP_KEY);''',
    '''      localStorage.removeItem(LUMI_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_STEP_KEY);
      localStorage.removeItem(LUMI_WORKFLOW_DRAFT_KEY);'''
)

text = text.replace(
    '''      localStorage.setItem(LUMI_STEP_KEY, JSON.stringify(signupStep));''',
    '''      localStorage.setItem(LUMI_STEP_KEY, JSON.stringify(signupStep));
      localStorage.setItem(LUMI_WORKFLOW_STEP_KEY, JSON.stringify(workflowStep));
      localStorage.setItem(LUMI_WORKFLOW_DRAFT_KEY, JSON.stringify(workflowDraft));'''
)

text = text.replace(
    '''  }, [messages, draft, signupStep, isLumiTyping]);''',
    '''  }, [messages, draft, signupStep, workflowStep, workflowDraft, isLumiTyping]);'''
)

text = text.replace(
    '''async function callSignup(action: "sendOtp" | "verifyOtp" | "member" | "volunteer", payload: Record<string, unknown>)''',
    '''async function callSignup(action: "sendOtp" | "verifyOtp" | "member" | "volunteer" | "checkMemberOrVolunteer" | "submitShirtOrder" | "submitTshirtPayment" | "submitSuggestion", payload: Record<string, unknown>)'''
)

if "function includesAny" not in text:
    insert = r'''
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
    setBusyLabel("Sending Gmail verification code...");
    setIsLumiTyping(true);

    try {
      const result = await callSignup("sendOtp", { gmail });
      if (result.success) {
        setWorkflowDraft((prev) => ({ ...prev, gmail }));
        setWorkflowStep(nextStep);
        pushLumi("Verification code ကို Gmail ထဲပို့ပြီးပါပြီ။ OTP code ကို ဒီမှာရေးပေးပါ။");
      } else {
        pushLumi(result.message || "OTP ပို့လို့မရပါ။ ပြန်စမ်းပါ။");
      }
    } catch {
      pushLumi("OTP sending failed. Please try again.");
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

'''
    text = text.replace(
        '''  async function handleSignupReply(text: string) {''',
        insert + '''  async function handleSignupReply(text: string) {'''
    )

text = text.replace(
    '''    if (!signupStep && (lower.includes("member signup") || lower.includes("member registration"))) {''',
    '''    if (workflowStep) {
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

    if (!signupStep && (lower.includes("member signup") || lower.includes("member registration"))) {'''
)

text = text.replace(
    '''          placeholder={signupStep ? "Reply to Lumi's current signup question..." : "Type your question..."}''',
    '''          placeholder={signupStep || workflowStep ? "Reply to Lumi's current question..." : "Type your question..."}'''
)

ai.write_text(text)
print("Lumi workflow wiring completed.")
PY

npm run build

git add .
git commit -m "Wire Lumi chat to T-shirt payment and suggestion workflows"
git push origin main

echo "Done. Copy updated TShirt.gs to Google Apps Script and deploy a new version."
