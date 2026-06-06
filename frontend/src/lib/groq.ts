import { getAiLanguageInstruction } from "@/lib/i18n/languages";

export type GroqChatMessage = {
  role: "model" | "user";
  text: string;
};

const CHAT_API_URL = "https://dsiq.onrender.com/api/chat";
const CHAT_TIMEOUT_MS = 20000;
const RESPONSE_FORMATTING_INSTRUCTION = [
  "DSIQ response formatting rules:",
  "Answer in short student-friendly chunks.",
  "For normal answers, use a maximum of 4 to 6 short lines.",
  "Use line breaks between points.",
  "Use numbered lists for steps.",
  "Use bullet points for examples.",
  "Never return long unbroken paragraphs.",
  "Always respond in the same language as the user's latest message. Do not force English unless the user asks for English.",
  "Never end every response with the same phrase. Do not repeatedly say 'Do you understand?' or 'Should I continue?'. End naturally based on the user's message, lesson stage, and next best action.",
  "Ask a follow-up only when useful, and make it match the user's message and context.",
  "For roadmaps, format with clear steps and keep each step short.",
  "If giving a list, each item must be on a new line.",
  "If explaining code, use fenced code blocks.",
].join("\n");

export async function askGroq(messages: GroqChatMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const userMessage = latestUserMessage?.text?.trim() || "";
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, CHAT_TIMEOUT_MS);
  const formattedMessages = [
    {
      role: "user" as const,
      text: [RESPONSE_FORMATTING_INSTRUCTION, getAiLanguageInstruction()].join("\n"),
    },
    ...messages,
  ];
  const body = {
    message: userMessage,
    messages: formattedMessages,
  };

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      throw new Error(
        data?.error || "DSIQ could not answer right now. Please try again.",
      );
    }

    const data = (await response.json()) as { reply?: string; text?: string };

    return (
      data.reply ||
      data.text ||
      "DSIQ did not return a response. Please try again."
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("DSIQ is taking too long to respond. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error("Unable to connect to DSIQ server.");
    }

    throw error instanceof Error
      ? error
      : new Error("Unable to connect to DSIQ server.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
