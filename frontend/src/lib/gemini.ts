export type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

const CHAT_API_URL = "https://dsiq.onrender.com/api/chat";

export async function askGemini(messages: GeminiChatMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const userMessage = latestUserMessage?.text?.trim() || "";

  console.log("Calling Render backend", CHAT_API_URL);
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage,
      messages,
    }),
  });
  console.log("Render backend response", response.status, response.ok);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(
      data?.error || "DSIQ could not reach Gemini right now. Please try again.",
    );
  }

  const data = (await response.json()) as { reply?: string; text?: string };

  return (
    data.reply ||
    data.text ||
    "DSIQ did not return a response. Please try again."
  );
}
