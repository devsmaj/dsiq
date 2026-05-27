"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, ImageIcon, Mic, Plus, Send, SquarePen } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import {
  createFirebaseChat,
  saveFirebaseChatMessage,
} from "@/lib/firebase-chat-store";
import { askGemini, type GeminiChatMessage } from "@/lib/gemini";
import { dsiqLogoSrc } from "@/lib/public-asset";

const GUEST_CHAT_KEY = "dsiq.guest.chat";
const LOGGED_IN_CHAT_KEY = "dsiq.current.public-chat-id";

type SpeechRecognitionResultLike = {
  0?: {
    transcript?: string;
  };
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };

const quickActions = [
  {
    label: "Write pitch",
    prompt:
      "Help me write a short opportunity pitch. Ask what I am applying for, then draft a polished version.",
  },
  {
    label: "Build plan",
    prompt:
      "Create a 7-day action plan for my goal with daily tasks, time estimates, and a clear first step.",
  },
  {
    label: "Find matches",
    prompt:
      "Help me find opportunities that match my skills, location, budget, and available time.",
  },
  {
    label: "Learn path",
    prompt:
      "Create a learning roadmap for my goal with beginner, intermediate, and portfolio milestones.",
  },
];

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
  const shouldUseGuestChat = searchParams.get("guest") === "true";
  const { isLoading: isAuthLoading, user } = useAuth();
  const isGuest = shouldUseGuestChat || !user;
  const [messages, setMessages] = useState<GeminiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [error, setError] = useState("");
  const handledInitialQuestion = useRef(false);
  const chatIdRef = useRef<string | null>(null);
  const latestMessageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    if (initialQuestion || (!shouldUseGuestChat && (isAuthLoading || user))) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessages(readGuestMessages());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [initialQuestion, isAuthLoading, shouldUseGuestChat, user]);

  useEffect(() => {
    if (!isGuest || messages.length === 0) {
      return;
    }

    window.sessionStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(messages));
  }, [isGuest, messages]);

  useEffect(() => {
    if (
      !initialQuestion ||
      handledInitialQuestion.current ||
      (isAuthLoading && !shouldUseGuestChat)
    ) {
      return;
    }

    handledInitialQuestion.current = true;
    void sendMessage(initialQuestion);
    // sendMessage intentionally stays outside deps so the query is handled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, isAuthLoading, shouldUseGuestChat]);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending, error]);

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

    try {
      const chatId = await getLoggedInChatId();
      if (!chatId) {
        return;
      }

      await saveFirebaseChatMessage({
        chatId,
        message,
        uid: user.uid,
      });
    } catch (saveError) {
      console.warn("Public chat message save failed.", saveError);
    }
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

  function handleQuickAction(promptText: string) {
    if (isSending) {
      return;
    }

    setInput(promptText);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function appendAttachmentNames(files: FileList | null) {
    if (!files?.length || isSending) {
      return;
    }

    const names = Array.from(files)
      .map((file) => file.name)
      .join(", ");

    setInput((current) =>
      current.trim()
        ? `${current.trim()} Attached: ${names}`
        : `Attached: ${names}`,
    );
    setIsUploadPanelOpen(false);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function handleVoiceInput() {
    if (isSending) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript || "";
      }

      const spokenText = transcript.trim();
      if (!spokenText) {
        return;
      }

      setInput((current) =>
        current.trim() ? `${current.trim()} ${spokenText}` : spokenText,
      );
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };
    recognition.onerror = () => {
      setError("Voice input could not start. Please try again.");
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    setError("");
    setIsListening(true);
    recognition.start();
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <header className="shrink-0 border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-medium tracking-tight"
            aria-label="DSIQ home"
          >
            <img
              src={dsiqLogoSrc}
              alt=""
              className="h-8 w-8 object-contain"
            />
            <span>DSIQ</span>
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
                className="hidden h-10 items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium !text-white transition hover:bg-black sm:inline-flex"
              >
                Log in
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="public-chat-layout mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-4 sm:px-6">
        {isGuest ? (
          <div className="mb-4 shrink-0 rounded-[1.25rem] border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm text-[color:var(--color-muted)] shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <Link
              href="/login"
              className="font-semibold text-[color:var(--color-text)] underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to save your chats, missions, and progress.
          </div>
        ) : null}

        <div className="public-chat-messages min-h-0 flex-1 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center pt-8 text-center sm:pt-0">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
                  Ask DSIQ anything.
                </h1>
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  Guest chats are temporary in this browser session.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleQuickAction(action.prompt)}
                      disabled={isSending}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#cfd4dc] bg-white px-4 text-sm font-semibold text-[#202124] shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:border-[#9aa0a6] hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`max-w-3xl text-sm leading-7 ${
                    message.role === "user"
                      ? "ml-auto px-1 py-2 text-right text-[color:var(--color-text)]"
                      : "px-1 py-2 text-[color:var(--color-text)]"
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
              <div ref={latestMessageRef} />
            </div>
          )}

          {error ? (
            <p className="mt-4 rounded-[1rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="public-chat-composer mt-4 shrink-0 rounded-[30px] bg-white px-5 py-4 shadow-[0_18px_44px_rgba(15,23,42,0.08),0_2px_10px_rgba(15,23,42,0.05)]"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadPanelOpen((value) => !value)}
                aria-label="Add attachment"
                aria-expanded={isUploadPanelOpen}
                disabled={isSending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
              {isUploadPanelOpen ? (
                <div className="absolute bottom-12 left-0 z-30 w-56 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isSending}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    Upload photos
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Upload files
                  </button>
                </div>
              ) : null}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => appendAttachmentNames(event.target.files)}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => appendAttachmentNames(event.target.files)}
              />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isSending}
              placeholder="Ask DSIQ"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isSending}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isListening
                  ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]"
                  : "text-[#303134] hover:bg-[color:var(--color-surface-strong)]"
              }`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? (
                <span className="flex h-5 items-center gap-0.5" aria-hidden="true">
                  <span className="recording-wave" />
                  <span className="recording-wave [animation-delay:110ms]" />
                  <span className="recording-wave [animation-delay:220ms]" />
                  <span className="recording-wave [animation-delay:330ms]" />
                </span>
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
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
