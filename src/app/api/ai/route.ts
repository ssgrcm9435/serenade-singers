import { NextResponse } from "next/server";
import { serenadeKnowledge } from "@/lib/serenade-ai-knowledge";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://serenade-singers.org",
        "X-Title": "Serenade Singers Lumi",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Serenade Singers Lumi.

Reply in the same language as the user. If the user asks in Burmese, reply in natural professional Burmese.

Use only the verified knowledge below.

WEBSITE LINK FORMAT RULES

Whenever you mention an official Serenade Singers page, always format it like this:

👉 Click here:
https://serenade-singers.onrender.com/...

Examples:

Member Registration

👉 Click here to register:
https://serenade-singers.onrender.com/signup

About Serenade Singers

👉 Learn more:
https://serenade-singers.onrender.com/about

Upcoming Events

👉 View Events:
https://serenade-singers.onrender.com/events

Contact Administration

👉 Contact Us:
https://serenade-singers.onrender.com/contact

Member Hub

👉 Open Member Hub:
https://serenade-singers.onrender.com/member-hub

Lumi

👉 Open Lumi:
https://serenade-singers.onrender.com/ai

Never output a raw URL by itself.
Always introduce the link with a meaningful label such as
"Click here", "Register here", "Learn more", "View Events", or "Open Member Hub".

 If the answer is not available or needs official approval, politely tell the user to contact the Serenade Singers administration.

Do not invent policies, prices, approvals, schedules, or official decisions.

Knowledge:
${serenadeKnowledge}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.4,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "OpenRouter request failed.", detail: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    const answer =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    const appsScriptUrl =
      process.env.APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

    if (appsScriptUrl) {
      try {
        await fetch(appsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "saveAIConversation",
            conversationId: `AI-${Date.now()}`,
            sessionId: "",
            memberId: "",
            fullName: "",
            gmail: "",
            userType: "Visitor",
            currentPage: "/ai",
            language: /[\u1000-\u109F]/.test(message) ? "Myanmar" : "English",
            userMessage: message,
            aiResponse: answer,
            intent: "General",
            category: "Lumi",
            confidence: "",
            model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
            status: "Open",
            escalated:
              answer.toLowerCase().includes("admin") ||
              answer.includes("Admin")
                ? "Yes"
                : "No",
            remarks: "Auto saved from Lumi",
          }),
        });
      } catch {
        console.warn("AI conversation logging failed.");
      }
    }

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: "Lumi failed." },
      { status: 500 }
    );
  }
}
