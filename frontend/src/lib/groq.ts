export type GroqChatMessage = {
  role: "model" | "user";
  text: string;
};

const CHAT_API_URL = "https://dsiq.onrender.com/api/chat";
const CHAT_TIMEOUT_MS = 20000;
const RESPONSE_FORMATTING_INSTRUCTION = [
  "DSIQ response formatting rules:",
  "Use short paragraphs.",
  "Use line breaks between points.",
  "Use numbered lists for steps.",
  "Use bullet points for examples.",
  "Never return long unbroken paragraphs.",
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
      text: RESPONSE_FORMATTING_INSTRUCTION,
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
