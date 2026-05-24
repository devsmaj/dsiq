"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = createChatCompletion;
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
function isValidMessage(message) {
    if (!message || typeof message !== "object") {
        return false;
    }
    const candidate = message;
    return ((candidate.role === "model" || candidate.role === "user") &&
        typeof candidate.text === "string" &&
        candidate.text.trim().length > 0);
}
function readResponseText(data) {
    return data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();
}
async function createChatCompletion(request, response) {
    const body = request.body ?? {};
    const messages = Array.isArray(body.messages)
        ? body.messages.filter(isValidMessage)
        : body.message?.trim()
            ? [{ role: "user", text: body.message.trim() }]
            : [];
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
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
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
    });
    if (!geminiResponse.ok) {
        const errorMessage = geminiResponse.status === 429
            ? "Gemini quota or rate limit was reached. Please try again later."
            : "DSIQ could not reach Gemini right now. Please try again.";
        return response
            .status(geminiResponse.status === 429 ? 429 : 502)
            .json({ error: errorMessage });
    }
    const data = (await geminiResponse.json());
    const text = readResponseText(data);
    if (!text) {
        return response
            .status(502)
            .json({ error: "DSIQ did not return a response. Please try again." });
    }
    return response.json({ text });
}
