import { Request, Response } from "express";

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

type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

type ChatRequestBody = {
  message?: string;
  messages?: GeminiChatMessage[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function isValidMessage(message: unknown): message is GeminiChatMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<GeminiChatMessage>;
  return (
    (candidate.role === "model" || candidate.role === "user") &&
    typeof candidate.text === "string" &&
    candidate.text.trim().length > 0
  );
}

function readResponseText(data: GeminiResponse) {
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
}

export async function createChatCompletion(
  request: Request<unknown, unknown, ChatRequestBody>,
  response: Response,
) {
  console.log("Incoming chat request");

  const body = request.body ?? {};
  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isValidMessage)
    : body.message?.trim()
      ? [{ role: "user" as const, text: body.message.trim() }]
      : [];
  const latestMessage = [...messages].reverse().find((message) => message.role === "user");

  console.log("Message received", latestMessage?.text || body.message || "");

  if (messages.length === 0) {
    return response.status(400).json({ error: "Message is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response
      .status(500)
      .json({ error: "Gemini is not configured on the server." });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  let geminiResponse: globalThis.Response;

  try {
    geminiResponse = await fetch(
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
  } catch (error) {
    console.error("Gemini error:", error);
    return response
      .status(502)
      .json({ error: "DSIQ could not answer right now. Please try again." });
  }

  console.log("Response status:", geminiResponse.status);

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text().catch((error: unknown) => {
      console.error("Gemini error:", error);
      return "";
    });
    console.error("Gemini error:", errorText || geminiResponse.statusText);

    return response
      .status(geminiResponse.status === 429 ? 429 : 502)
      .json({ error: "DSIQ could not answer right now. Please try again." });
  }

  const data = (await geminiResponse.json()) as GeminiResponse;
  const text = readResponseText(data);

  if (!text) {
    return response
      .status(502)
      .json({ error: "DSIQ did not return a response. Please try again." });
  }

  return response.json({ reply: text });
}
