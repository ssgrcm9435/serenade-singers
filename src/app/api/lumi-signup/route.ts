import { NextResponse } from "next/server";

const ALLOWED_ACTIONS = new Set(["sendOtp", "verifyOtp", "member", "volunteer"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body?.action || "").trim();
    const payload = body?.payload && typeof body.payload === "object" ? body.payload : {};

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ success: false, message: "Unsupported Lumi signup action." }, { status: 400 });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json({ success: false, message: "Google Apps Script URL is not configured." }, { status: 500 });
    }

    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid response from Registration service.", detail: text }, { status: 502 });
    }

    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Lumi signup request failed." },
      { status: 500 }
    );
  }
}
