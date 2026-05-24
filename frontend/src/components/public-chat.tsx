"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, SquarePen } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import {
  createFirebaseChat,
  saveFirebaseChatMessage,
} from "@/lib/firebase-chat-store";
import { askGemini, type GeminiChatMessage } from "@/lib/gemini";

const GUEST_CHAT_KEY = "dsiq.guest.chat";
const LOGGED_IN_CHAT_KEY = "dsiq.current.public-chat-id";

function readGuestMessages() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedMessages = window.sessionStorage.getItem(GUEST_CHAT_KEY);
  if (!storedMessages) {
    return [];
  }

  try {
    return JSON.parse(storedMessages) as GeminiChatMessage[];
  } catch {
    window.sessionStorage.removeItem(GUEST_CHAT_KEY);
    return [];
  }
}

export function PublicChat() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q")?.trim() || "";
  const { isLoading: isAuthLoading, user } = useAuth();
  const isGuest = !user;
  const [messages, setMessages] = useState<GeminiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const handledInitialQuestion = useRef(false);
  const chatIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthLoading || user) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessages(readGuestMessages());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (!isGuest || messages.length === 0) {
      return;
    }

    window.sessionStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(messages));
  }, [isGuest, messages]);

  useEffect(() => {
    if (isAuthLoading || !initialQuestion || handledInitialQuestion.current) {
      return;
    }

    handledInitialQuestion.current = true;
    void sendMessage(initialQuestion);
    // sendMessage intentionally stays outside deps so the query is handled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, isAuthLoading]);

  async function getLoggedInChatId() {
    if (!user) {
      return null;
    }

    if (chatIdRef.current) {
      return chatIdRef.current;
    }

    const storedChatId = window.sessionStorage.getItem(LOGGED_IN_CHAT_KEY);
    if (storedChatId) {
      chatIdRef.current = storedChatId;
      return storedChatId;
    }

    const chatId = await createFirebaseChat(user.uid);
    if (chatId) {
      chatIdRef.current = chatId;
      window.sessionStorage.setItem(LOGGED_IN_CHAT_KEY, chatId);
    }

    return chatId;
  }

  async function saveMessage(message: GeminiChatMessage) {
    if (isGuest || !user) {
      return;
    }

    const chatId = await getLoggedInChatId();
    if (!chatId) {
      return;
    }

    await saveFirebaseChatMessage({
      chatId,
      message,
      uid: user.uid,
    });
  }

  async function sendMessage(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) {
      return;
    }

    setError("");
    setInput("");
    setIsSending(true);

    const userMessage: GeminiChatMessage = {
      role: "user",
      text: trimmedText,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    await saveMessage(userMessage);

    try {
      const response = await askGemini(nextMessages);
      const modelMessage: GeminiChatMessage = {
        role: "model",
        text: response,
      };

      setMessages((current) => [...current, modelMessage]);
      await saveMessage(modelMessage);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "DSIQ could not answer right now. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setError("");

    if (isGuest) {
      window.sessionStorage.removeItem(GUEST_CHAT_KEY);
      return;
    }

    chatIdRef.current = null;
    window.sessionStorage.removeItem(LOGGED_IN_CHAT_KEY);
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <header className="border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-medium tracking-tight">
            DSIQ
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--color-line)] px-4 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
              New Chat
            </button>
            {!user ? (
              <Link
                href="/login"
                className="hidden text-sm font-medium transition hover:text-black sm:inline"
              >
                Log in
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
        {isGuest ? (
          <div className="mb-5 rounded-[1.25rem] border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm text-[color:var(--color-muted)] shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <Link
              href="/login"
              className="font-semibold text-[color:var(--color-text)] underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to save your chats, missions, and progress.
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Ask DSIQ anything.
                </h1>
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  Guest chats are temporary in this browser session.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`max-w-3xl rounded-[1.5rem] px-5 py-4 text-sm leading-7 ${
                    message.role === "user"
                      ? "ml-auto bg-[#111111] !text-white"
                      : "border border-[color:var(--color-line)] bg-white text-[color:var(--color-text)]"
                  }`}
                >
                  {message.text}
                </article>
              ))}

              {isSending ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[color:var(--color-muted)]">
                  <span className="typing-dot" />
                  <span className="typing-dot [animation-delay:120ms]" />
                  <span className="typing-dot [animation-delay:240ms]" />
                  <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    DSIQ thinking
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {error ? (
            <p className="rounded-[1rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[30px] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask DSIQ"
            className="h-9 w-full bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)]"
          />
          <div className="mt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
