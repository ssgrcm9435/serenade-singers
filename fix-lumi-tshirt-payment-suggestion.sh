#!/usr/bin/env bash
set -euo pipefail

echo "Fixing Lumi T-Shirt Order, Payment, and Suggestion workflows..."

python3 - <<'PY'
from pathlib import Path
import re

api = Path("src/app/api/lumi-signup/route.ts")
if not api.exists():
    raise FileNotFoundError("Missing src/app/api/lumi-signup/route.ts")

text = api.read_text()

new_allowed = '''const ALLOWED_ACTIONS = new Set([
  "sendOtp",
  "verifyOtp",
  "member",
  "volunteer",
  "checkMemberOrVolunteer",
  "submitShirtOrder",
  "submitTshirtPayment",
  "submitSuggestion",
]);'''

text = re.sub(
    r"const ALLOWED_ACTIONS\s*=\s*new Set\(\[[\s\S]*?\]\);",
    new_allowed,
    text,
    count=1,
)

api.write_text(text)
print("Updated /api/lumi-signup allowed actions.")
PY

python3 - <<'PY'
from pathlib import Path

p = Path("TShirt.gs")
if not p.exists():
    raise FileNotFoundError("Missing TShirt.gs")

text = p.read_text()

suggestion_fn = r'''
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
    body.adminRemark || ""
  ]);

  return {
    success: true,
    message: "Your suggestion has been submitted successfully.",
    suggestionId: suggestionId,
    status: "Pending Review"
  };
}
'''

if "function submitSuggestion_" not in text:
    text += "\n" + suggestion_fn

payment_block = '''    if (action === "submitTshirtPayment") {
      return json_(submitTshirtPayment_(body));
    }'''

suggestion_block = '''    if (action === "submitSuggestion") {
      return json_(submitSuggestion_(body));
    }'''

if 'action === "submitSuggestion"' not in text:
    if payment_block in text:
        text = text.replace(payment_block, payment_block + "\n\n" + suggestion_block)
    else:
        marker = "const action = body.action;"
        if marker in text:
            text = text.replace(
                marker,
                marker + '''

    if (action === "submitSuggestion") {
      return json_(submitSuggestion_(body));
    }''',
                1,
            )
        else:
            print("WARNING: Could not auto-insert submitSuggestion route. Add it manually inside doPost.")

p.write_text(text)
print("Updated TShirt.gs suggestion backend.")
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
If the user wants to order an official shirt, T-shirt, uniform, အကျီ, or တီရှပ်, start the T-Shirt Order workflow.
Ask for registered Gmail first, send OTP, verify OTP, then collect size, quantity, and remark.
Submit using submitShirtOrder.

If the user wants to submit payment, receipt, screenshot, ငွေလွှဲ, or ငွေချေ, start the T-Shirt Payment workflow.
Ask for registered Gmail first, send OTP, verify OTP, then collect order ID, payment method, amount, transaction reference, and screenshot URL.
Submit using submitTshirtPayment.

If the user wants to send feedback, suggestion, complaint, အကြံပြုစာ, or အကြံပေးချင်တယ်, start the Suggestion workflow.
Ask for registered Gmail first, send OTP, verify OTP, then collect category and message.
Submit using submitSuggestion.

Reply in Myanmar if the user writes in Myanmar.
Reply in English if the user writes in English.
Never submit order, payment, or suggestion without registered Gmail verification.
`;
TS

npm run build

git add .
git commit -m "Add Lumi T-shirt payment and suggestion workflows"
git push origin main

echo "Done."
echo "Copy updated TShirt.gs to Google Apps Script and deploy new version."
