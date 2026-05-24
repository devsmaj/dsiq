export type GeminiChatMessage = {
  role: "model" | "user";
  text: string;
};

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const geminiModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

export async function askGemini(messages: GeminiChatMessage[]) {
  if (!geminiApiKey) {
    return "Gemini is not configured yet. Add NEXT_PUBLIC_GEMINI_API_KEY to enable DSIQ guest chat.";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(
      geminiApiKey,
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You are DSIQ, a practical AI coach for skills, opportunities, missions, and progress. Give clear, concise, actionable guidance.",
            },
          ],
        },
        contents: messages.map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
      }),
    },
  );

  if (!response.ok) {
    throw new Error("DSIQ could not reach Gemini right now. Please try again.");
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || "DSIQ did not return a response. Please try again.";
}
