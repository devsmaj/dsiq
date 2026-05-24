import { NextResponse } from "next/server";

const DSIQ_SYSTEM_PROMPT = `You are DSIQ, an AI Opportunity Coach and Accountability Assistant designed for students, developers, freelancers, and entrepreneurs.

Your goal is to help users:
- discover opportunities
- create plans
- learn skills
- stay consistent
- take action

Keep responses:
- practical
- intelligent
- simple
- motivational
- action-focused

If user gives little information, ask simple follow-up questions first.

Never give identical fixed responses to everyone.
Adapt answers based on user goals, skills, time, interests, and budget.`;

function isValidMessage(message) {
  return (
    message &&
    typeof message === "object" &&
    (message.role === "model" || message.role === "user") &&
    typeof message.text === "string" &&
    message.text.trim().length > 0
  );
}

function readResponseText(data) {
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isValidMessage)
    : body.message?.trim()
      ? [{ role: "user", text: body.message.trim() }]
      : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini is not configured on the server." },
      { status: 500 },
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: DSIQ_SYSTEM_PROMPT }],
        },
        contents: messages.slice(-20).map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorMessage =
      response.status === 429
        ? "Gemini quota or rate limit was reached. Please try again later."
        : "DSIQ could not reach Gemini right now. Please try again.";

    return NextResponse.json(
      { error: errorMessage },
      { status: response.status === 429 ? 429 : 502 },
    );
  }

  const data = await response.json();
  const text = readResponseText(data);

  if (!text) {
    return NextResponse.json(
      { error: "DSIQ did not return a response. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ text });
}
