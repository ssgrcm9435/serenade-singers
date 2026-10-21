
import { NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function same(a: string, b: string) {
  const aa = createHmac("sha256", "serenade-credential-check").update(a).digest();
  const bb = createHmac("sha256", "serenade-credential-check").update(b).digest();
  return timingSafeEqual(aa, bb);
}

export async function POST(req: Request) {
  const configuredUser = process.env.ADMIN_USERNAME || "";
  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.MEETING_AUTH_SECRET || "";
  if (!configuredUser || !configuredPassword || secret.length < 32) {
    return NextResponse.json({ success: false, message: "Admin meeting configuration is incomplete." }, { status: 503 });
  }
  let body: {username?: string;password?: string};
  try { body = await req.json(); } catch { return NextResponse.json({success:false}, {status:400}); }
  if (!same(body.username || "", configuredUser) || !same(body.password || "", configuredPassword)) {
    return NextResponse.json({ success: false, message: "Invalid admin credentials." }, { status: 401 });
  }
  const claims = { role: "admin", exp: Math.floor(Date.now() / 1000) + 3600, nonce: randomBytes(12).toString("hex") };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return NextResponse.json({ success: true, meetingToken: payload + "." + signature });
}
