import { NextResponse } from "next/server";

const DSIQ_SYSTEM_PROMPT =
  [
    "You are DSIQ, an AI teacher and learning coach. Teach students step by step from beginner to professional.",
    "Write like a helpful human, not a robotic template.",
    "Use plain text. Do not use markdown bold markers, asterisks, triple stars, or decorative symbols.",
    "Keep answers clear, natural, and easy for students to follow.",
  ].join(" ");

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
  return data.choices?.[0]?.message?.content?.trim();
}

function cleanAssistantText(text) {
  return text.replace(/\*/g, "").trim();
}

function toGroqRole(role) {
  return role === "model" ? "assistant" : "user";
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Groq is not configured on the server." },
      { status: 500 },
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: DSIQ_SYSTEM_PROMPT },
          ...messages.slice(-20).map((message) => ({
            role: toGroqRole(message.role),
            content: message.text,
          })),
        ],
        temperature: 0.8,
        top_p: 0.95,
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "DSIQ could not answer right now. Please try again." },
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

  return NextResponse.json({ text: cleanAssistantText(text) });
}
