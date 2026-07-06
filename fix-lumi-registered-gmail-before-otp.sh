#!/usr/bin/env bash
set -euo pipefail

echo "Fixing Lumi OTP security: only registered Gmail can receive OTP..."

python3 - <<'PY'
from pathlib import Path
import re

p = Path("TShirt.gs")
if not p.exists():
    raise FileNotFoundError("TShirt.gs not found")

text = p.read_text()

secure_fn = r'''
function isRegisteredGmailForLumi_(gmail) {
  const checked = checkMemberOrVolunteer_(gmail);

  if (!checked || !checked.verified) {
    return {
      success: false,
      registered: false,
      message: "This Gmail is not registered as a Serenade Singers Member or Volunteer.",
    };
  }

  return {
    success: true,
    registered: true,
    memberId: checked.memberId || "",
    fullName: checked.fullName || "",
    type: checked.type || "",
    gmail: normalizeEmail_(gmail),
  };
}

function sendOtpToRegisteredGmailOnly_(body) {
  const gmail = normalizeEmail_(body.gmail || "");

  if (!gmail) {
    return {
      success: false,
      message: "Registered Gmail is required.",
    };
  }

  const registered = isRegisteredGmailForLumi_(gmail);

  if (!registered.registered) {
    return registered;
  }

  return sendOtp_(body);
}
'''

if "function isRegisteredGmailForLumi_" not in text:
    text += "\n" + secure_fn

patterns = [
    (
        '''    if (action === "sendOtp") {
      return json_(sendOtp_(body));
    }''',
        '''    if (action === "sendOtp") {
      return json_(sendOtpToRegisteredGmailOnly_(body));
    }'''
    ),
    (
        '''if (action === "sendOtp") {
      return json_(sendOtp_(body));
    }''',
        '''if (action === "sendOtp") {
      return json_(sendOtpToRegisteredGmailOnly_(body));
    }'''
    ),
]

changed = False
for old, new in patterns:
    if old in text:
      text = text.replace(old, new)
      changed = True

if not changed:
    text = re.sub(
        r'return\s+json_\(sendOtp_\(body\)\);',
        'return json_(sendOtpToRegisteredGmailOnly_(body));',
        text,
        count=1
    )

p.write_text(text)
print("TShirt.gs OTP security updated.")
PY

npm run build

git add .
git commit -m "Restrict Lumi OTP to registered Gmail"
git push origin main

echo "Done."
echo "Important: copy updated TShirt.gs to Google Apps Script and deploy a new version."
