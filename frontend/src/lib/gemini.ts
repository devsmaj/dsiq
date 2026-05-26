export type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

const CHAT_API_URL = "https://dsiq.onrender.com/api/chat";
const CHAT_TIMEOUT_MS = 20000;

export async function askGemini(messages: GeminiChatMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const userMessage = latestUserMessage?.text?.trim() || "";
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, CHAT_TIMEOUT_MS);
  const body = {
    message: userMessage,
    messages,
  };

  console.log("Sending request to:", CHAT_API_URL);
  console.log("Request body:", body);
  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    console.log("Render backend response", response.status, response.ok);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      throw new Error(
        data?.error ||
          "DSIQ could not reach Gemini right now. Please try again.",
      );
    }

    const data = (await response.json()) as { reply?: string; text?: string };

    return (
      data.reply ||
      data.text ||
      "DSIQ did not return a response. Please try again."
    );
  } catch (error) {
    console.error("Fetch failed:", error);

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
