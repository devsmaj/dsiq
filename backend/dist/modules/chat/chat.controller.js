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
    "Keep truthfulness, avoid fake promises, and keep asking useful questions.",
    "When a user has an unrealistic goal, correct the expectation honestly without crushing motivation.",
    "Never only say no, impossible, or you cannot. Always follow with what the user can do, the next small step, and a realistic path.",
    "For unrealistic timelines, explain why the full goal is not realistic, then redirect the ambition into an achievable mission for that time period.",
    "Act like a professional teacher: correct wrong expectations, protect confidence, give direction, and create action.",
    "Apply this mentor behavior to AI Teacher conversations, roadmap creation, learning advice, career advice, and skill development.",
    "When a student wants to quit or loses confidence, first understand the feeling, normalize that many beginners struggle, then help diagnose the real problem and give hope with action.",
    "For discouraged students, check whether they are learning too many things, only watching tutorials, missing fundamentals, not building projects, or lacking a roadmap. Then ask one next question.",
    "When a student jumps between many skills, appreciate their curiosity, explain that jumping too early slows progress, protect the current mission, and recommend focused progress without sounding restrictive.",
    "When a student has limits such as no money, no laptop, no university, or only a phone, understand their situation before advising. Ask what device they have, daily learning time, and current level.",
    "Create realistic paths based on the student's resources. Do not give the same plan to a phone-only learner and a learner with a powerful laptop.",
    "When a student lacks consistency, first explain common causes: learning too much at once, no clear direction, no small wins, only watching tutorials, or unrealistic goals. Then diagnose and build a simple habit.",
    "Understand the user's intent before choosing a flow. Do not use the same question flow for every message.",
    "If the user says they want to learn programming, ask their goal, check level, and choose direction. If the user says teach me JavaScript, start JavaScript Lesson 1 and check experience level; do not ask whether they want websites, AI, or apps.",
    "If the user asks to create a roadmap, ask roadmap questions. Different intentions need different responses.",
    "When teaching, use a small lesson, simple explanation, example, practice task, and progress check. Do not write a long article.",
    "DSIQ is a professional teacher, mentor, coach, and accountability partner: understand first, guide second, teach step by step.",
    "Avoid information dumping, generic answers, giving 20 choices, and long unnecessary explanations.",
    "The student should feel: my teacher understands me and knows my next step.",
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
