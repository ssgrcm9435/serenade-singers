#!/usr/bin/env bash
set -euo pipefail

echo "Fixing Lumi: check registered Gmail before sending OTP..."

python3 - <<'PY'
from pathlib import Path
import re

ai = Path("src/app/ai/page.tsx")
if not ai.exists():
    raise FileNotFoundError("Missing src/app/ai/page.tsx")

text = ai.read_text()

old = '''  async function sendWorkflowOtp(gmail: string, nextStep: LumiWorkflowStep) {
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
  }'''

new = '''  async function sendWorkflowOtp(gmail: string, nextStep: LumiWorkflowStep) {
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
  }'''

if old not in text:
    raise RuntimeError("sendWorkflowOtp function format not found. Please check src/app/ai/page.tsx manually.")

text = text.replace(old, new)

ai.write_text(text)
print("Updated Lumi UI Gmail pre-check before OTP.")
PY

python3 - <<'PY'
from pathlib import Path
import re

gs = Path("TShirt.gs")
if not gs.exists():
    raise FileNotFoundError("Missing TShirt.gs")

text = gs.read_text()

secure_fn = r'''
function sendOtpToRegisteredGmailOnly_(body) {
  const gmail = normalizeEmail_(body.gmail || "");

  if (!gmail) {
    return {
      success: false,
      message: "Registered Gmail is required.",
    };
  }

  const checked = checkMemberOrVolunteer_(gmail);

  if (!checked || !checked.verified) {
    return {
      success: false,
      verified: false,
      message: "ဒီ Gmail က Serenade Singers Member / Volunteer အဖြစ် registered မလုပ်ထားသေးပါ။ Registered Gmail နဲ့ပြန်စမ်းပေးပါ။",
    };
  }

  return sendOtp_(body);
}
'''

if "function sendOtpToRegisteredGmailOnly_" not in text:
    text += "\n" + secure_fn

text = re.sub(
    r'return\s+json_\(sendOtp_\(body\)\);',
    'return json_(sendOtpToRegisteredGmailOnly_(body));',
    text,
    count=1
)

gs.write_text(text)
print("Updated Apps Script OTP security.")
PY

npm run build

git add .
git commit -m "Check registered Gmail before Lumi OTP"
git push origin main

echo "Done."
echo "Copy updated TShirt.gs to Google Apps Script and deploy a new version."
