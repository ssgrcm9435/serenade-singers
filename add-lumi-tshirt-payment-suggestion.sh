#!/usr/bin/env bash
set -euo pipefail

echo "Adding Lumi T-Shirt Order, Payment, and Suggestion workflows..."

python3 - <<'PY'
from pathlib import Path

api = Path("src/app/api/lumi-signup/route.ts")

if not api.exists():
    raise FileNotFoundError("src/app/api/lumi-signup/route.ts not found")

text = api.read_text()

old = 'const ALLOWED_ACTIONS = new Set(["sendOtp", "verifyOtp", "member", "volunteer"]);'

new = '''const ALLOWED_ACTIONS = new Set([
  "sendOtp",
  "verifyOtp",
  "member",
  "volunteer",
  "checkMemberOrVolunteer",
  "submitShirtOrder",
  "submitTshirtPayment",
  "submitSuggestion",
]);'''

if old in text:
    text = text.replace(old, new)
elif "submitSuggestion" not in text:
    raise RuntimeError("ALLOWED_ACTIONS format not found. Please update manually.")

api.write_text(text)
print("Updated Lumi API allowed actions.")
PY

cat >> TShirt.gs <<'GS'

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
GS

python3 - <<'PY'
from pathlib import Path

p = Path("TShirt.gs")

if not p.exists():
    raise FileNotFoundError("TShirt.gs not found")

text = p.read_text()

insert_after = '''    if (action === "submitTshirtPayment") {
      return json_(submitTshirtPayment_(body));
    }'''

insert_block = '''    if (action === "submitTshirtPayment") {
      return json_(submitTshirtPayment_(body));
    }

    if (action === "submitSuggestion") {
      return json_(submitSuggestion_(body));
    }'''

if "action === \"submitSuggestion\"" not in text:
    if insert_after in text:
        text = text.replace(insert_after, insert_block)
    else:
        print("WARNING: submitTshirtPayment action block not found. Add submitSuggestion manually in doPost.")

p.write_text(text)
print("Updated Apps Script action routing.")
PY

mkdir -p src/lib

cat > src/lib/lumiService.ts <<'TS'
export type LumiAction =
  | "sendOtp"
  | "verifyOtp"
  | "member"
  | "volunteer"
  | "checkMemberOrVolunteer"
  | "submitShirtOrder"
  | "submitTshirtPayment"
  | "submitSuggestion";

export async function callLumi(
  action: LumiAction,
  payload: Record<string, unknown>
) {
  const res = await fetch("/api/lumi-signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      payload,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Lumi request failed.");
  }

  return data;
}

export const lumiWorkflowIntents = {
  tshirtOrder: [
    "အကျီမှာ",
    "အကျီ မှာချင်တယ်",
    "တီရှပ်မှာ",
    "တီရှပ် မှာချင်တယ်",
    "official shirt",
    "shirt order",
    "t-shirt order",
    "uniform order",
    "serenade singers shirt",
  ],

  tshirtPayment: [
    "ငွေလွှဲ",
    "ငွေချေ",
    "ငွေပေးချေ",
    "payment",
    "payment screenshot",
    "receipt",
    "transfer",
    "ငွေလွှဲပြီးပြီ",
    "ငွေချေပြီးပြီ",
  ],

  suggestion: [
    "အကြံပြုစာ",
    "အကြံပေးချင်တယ်",
    "အကြံပြုချင်တယ်",
    "feedback",
    "suggestion",
    "complaint",
    "recommendation",
    "ပြောချင်တာရှိတယ်",
  ],
};

export const lumiWorkflowRules = `
Lumi Workflow Rules:

1. If the user wants to order an official shirt, T-shirt, uniform, အကျီ, or တီရှပ်:
   Start the T-Shirt Order workflow.
   Ask for registered Gmail first.
   Send OTP.
   Verify OTP.
   Ask for size, quantity, and remark.
   Submit the order using submitShirtOrder.

2. If the user wants to submit payment, receipt, screenshot, ငွေလွှဲ, or ငွေချေ:
   Start the T-Shirt Payment workflow.
   Ask for registered Gmail first.
   Send OTP.
   Verify OTP.
   Ask for order ID, payment method, amount, transaction reference, and screenshot URL.
   Submit payment using submitTshirtPayment.

3. If the user wants to send feedback, suggestion, complaint, အကြံပြုစာ, or အကြံပေးချင်တယ်:
   Start the Suggestion workflow.
   Ask for registered Gmail first.
   Send OTP.
   Verify OTP.
   Ask for category and message.
   Submit using submitSuggestion.

4. Reply in Myanmar if the user writes in Myanmar.
   Reply in English if the user writes in English.
   If the user mixes Myanmar and English, continue naturally in the same mixed style.

5. Never submit order, payment, or suggestion without registered Gmail verification.
`;
TS

npm run build

echo "Done."
echo "Next step: copy updated TShirt.gs to Google Apps Script and deploy a new version."
