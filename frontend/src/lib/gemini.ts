export type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

export async function askGemini(messages: GeminiChatMessage[]) {
  const endpoint =
    process.env.NEXT_PUBLIC_CHAT_API_URL?.trim() || "/api/chat";
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: latestUserMessage?.text || "",
      messages,
    }),
  });

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
