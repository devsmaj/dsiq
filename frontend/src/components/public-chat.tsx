"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ChatComposer } from "@/components/chat-composer";
import {
  createFirebaseChat,
  saveFirebaseChatMessage,
} from "@/lib/firebase-chat-store";
import { askGroq, type GroqChatMessage } from "@/lib/groq";
import { handleLanguagePreferenceCommand } from "@/lib/language-preference-sync";
import { dsiqLogoSrc } from "@/lib/public-asset";
import { useKeyboardOffset } from "@/lib/use-keyboard-offset";
import { useUserProfile } from "@/lib/use-user-profile";

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
    return JSON.parse(storedMessages) as GroqChatMessage[];
  } catch {
    window.sessionStorage.removeItem(GUEST_CHAT_KEY);
    return [];
  }
}

export function PublicChat() {
  useKeyboardOffset();
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q")?.trim() || "";
  const shouldUseGuestChat = searchParams.get("guest") === "true";
  const { isAuthLoading, profile, user } = useUserProfile();
  const isGuest = shouldUseGuestChat || !user;
  const [messages, setMessages] = useState<GroqChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [languagePreferenceOverride, setLanguagePreferenceOverride] = useState<string | null>(null);
  const handledInitialQuestion = useRef(false);
  const chatIdRef = useRef<string | null>(null);
  const latestMessageRef = useRef<HTMLDivElement | null>(null);
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

  async function saveMessage(message: GroqChatMessage) {
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

    const userMessage: GroqChatMessage = {
      role: "user",
      text: trimmedText,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    await saveMessage(userMessage);

    try {
      const languagePreferenceChange = await handleLanguagePreferenceCommand({
        message: trimmedText,
        uid: user?.uid,
      });
      if (languagePreferenceChange) {
        setLanguagePreferenceOverride(languagePreferenceChange.languageCode);
      }
      const response =
        languagePreferenceChange?.reply ||
        (await askGroq(nextMessages, {
          preferredLanguage:
            languagePreferenceChange?.languageCode ||
            languagePreferenceOverride ||
            profile?.languagePreference,
        }));
      const modelMessage: GroqChatMessage = {
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
    <main className="min-h-[100dvh] bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
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
              {t("sidebar.newChat")}
            </button>
            {!user ? (
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium !text-white transition hover:bg-black sm:inline-flex"
              >
                {t("public.signIn")}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="public-chat-layout mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-4 py-4 pb-[calc(150px+env(safe-area-inset-bottom))] sm:px-6">
        {isGuest ? (
          <div className="mb-4 shrink-0 rounded-[1.25rem] border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm text-[color:var(--color-muted)] shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <Link
              href="/login"
              className="font-semibold text-[color:var(--color-text)] underline underline-offset-4"
            >
              {t("public.signIn")}
            </Link>{" "}
            {t("public.signInToSaveSuffix")}
          </div>
        ) : null}

        <div className="public-chat-messages flex-1 pr-1">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center pt-8 text-center sm:pt-0">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
                  {t("chat.askDsiq")}
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

        <ChatComposer
          docked
          value={input}
          onChange={setInput}
          onSubmit={(value, attachments) =>
            void sendMessage(
              attachments.length
                ? `${value.trim() || "Please review these images."}\n\nAttached images: ${attachments.length}`
                : value,
            )
          }
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          isSending={isSending}
          placeholder={t("chat.askDsiq")}
        />
      </section>
    </main>
  );
}
