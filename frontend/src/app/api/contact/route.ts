import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;
    const name = payload.name?.trim() || "";
    const email = payload.email?.trim() || "";
    const subject = payload.subject?.trim() || "";
    const message = payload.message?.trim() || "";

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Name, email, subject, and message are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const storageDir = path.join(process.cwd(), ".data");
    const storageFile = path.join(storageDir, "contact-submissions.jsonl");

    await mkdir(storageDir, { recursive: true });
    await appendFile(
      storageFile,
      `${JSON.stringify({
        name,
        email,
        subject,
        message,
        submittedAt: new Date().toISOString(),
      })}\n`,
      "utf8",
    );

    return NextResponse.json({
      message: "Your message was received. We will review it soon.",
    });
  } catch {
    return NextResponse.json(
      { message: "We could not process your message right now." },
      { status: 500 },
    );
  }
}
