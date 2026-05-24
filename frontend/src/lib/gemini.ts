export type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

export async function askGemini(messages: GeminiChatMessage[]) {
  const response = await fetch("/api/chat/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(
      data?.error || "DSIQ could not reach Gemini right now. Please try again.",
    );
  }

  const data = (await response.json()) as { text?: string };

  return data.text || "DSIQ did not return a response. Please try again.";
}
