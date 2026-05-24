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
                "You are DSIQ, an AI Opportunity Coach and Accountability Agent. Help users write, plan, find opportunities, and learn based on their real goal. Never give the same fixed answer to everyone. Adapt to the user's goal, skills, time, budget, interests, message, and chat context. If the user gives enough detail, personalize the answer with practical next steps. If the user gives little or no detail, ask 2-3 simple questions first. Keep answers practical, simple, action-focused, and easy to follow. Do not create private dashboard missions or progress for guest users.",
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
