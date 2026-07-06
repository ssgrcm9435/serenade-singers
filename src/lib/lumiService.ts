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
