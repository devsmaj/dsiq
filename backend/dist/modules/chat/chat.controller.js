"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = createChatCompletion;
const DSIQ_SYSTEM_PROMPT = [
    "DSIQ is not a normal chatbot. DSIQ is a professional AI Teacher and learning coach. Teach students step by step from beginner to professional.",
    "When a beginner asks where to start, do not list many programming languages immediately.",
    "First assess the student's goal, level, time, and confidence. Ask one clear question at a time.",
    "If the student says they know nothing or are starting from zero, do not give a long roadmap, do not explain everything at once, and do not dump options.",
    "For beginner programming questions, first say that you will not choose many languages today, then ask the student's goal.",
    "Offer simple choices: 1. Build websites and apps 2. Create mobile applications 3. Learn AI 4. Get a programming job 5. I don't know yet, help me choose.",
    "Tell the student: First we choose your direction. Then I will create your first mission.",
    "Keep beginner responses short, practical, calm, and teacher-like.",
    "Write like a helpful human, not a robotic template.",
    "Use plain text. Do not use markdown bold markers, asterisks, triple stars, or decorative symbols.",
    "Answer in short student-friendly chunks.",
    "For normal answers, use a maximum of 4 to 6 short lines.",
    "Use bullets and line breaks. Do not write long paragraphs.",
    "After explaining, ask exactly: Do you understand? Should I continue?",
    "For roadmaps, format with clear numbered steps and keep each step short.",
    "When creating a roadmap, mention that DSIQ will save the roadmap separately.",
].join(" ");
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
    return data.choices?.[0]?.message?.content?.trim();
}
function cleanAssistantText(text) {
    return text.replace(/\*/g, "").trim();
}
function toGroqRole(role) {
    return role === "model" ? "assistant" : "user";
}
async function createChatCompletion(request, response) {
    console.log("Incoming chat request");
    const body = request.body ?? {};
    const messages = Array.isArray(body.messages)
        ? body.messages.filter(isValidMessage)
        : body.message?.trim()
            ? [{ role: "user", text: body.message.trim() }]
            : [];
    const latestMessage = [...messages].reverse().find((message) => message.role === "user");
    console.log("Message received", latestMessage?.text || body.message || "");
    if (messages.length === 0) {
        return response.status(400).json({ error: "Message is required." });
    }
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return response
            .status(500)
            .json({ error: "Groq is not configured on the server." });
    }
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    let groqResponse;
    try {
        groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: DSIQ_SYSTEM_PROMPT },
                    ...messages.slice(-20).map((message) => ({
                        role: toGroqRole(message.role),
                        content: message.text,
                    })),
                ],
                temperature: 0.8,
                top_p: 0.95,
            }),
        });
    }
    catch (error) {
        console.error("Groq error:", error);
        return response
            .status(502)
            .json({ error: "DSIQ could not answer right now. Please try again." });
    }
    console.log("Response status:", groqResponse.status);
    if (!groqResponse.ok) {
        const errorText = await groqResponse.text().catch((error) => {
            console.error("Groq error:", error);
            return "";
        });
        console.error("Groq error:", errorText || groqResponse.statusText);
        return response
            .status(groqResponse.status === 429 ? 429 : 502)
            .json({ error: "DSIQ could not answer right now. Please try again." });
    }
    const data = (await groqResponse.json());
    const text = readResponseText(data);
    if (!text) {
        return response
            .status(502)
            .json({ error: "DSIQ did not return a response. Please try again." });
    }
    return response.json({ reply: cleanAssistantText(text) });
}
