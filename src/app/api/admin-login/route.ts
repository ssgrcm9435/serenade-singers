import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const username = process.env.ADMIN_USERNAME || "";
  const password = process.env.ADMIN_PASSWORD || "";

  if (!username || !password) {
    return NextResponse.json({
      success: false,
      message: "Admin username/password is not configured.",
    });
  }

  if (body.username === username && body.password === password) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({
    success: false,
    message: "Invalid admin credentials.",
  });
}
