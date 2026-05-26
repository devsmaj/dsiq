"use client";

import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Menu,
  Mic,
  Plus,
  Send,
  Settings,
  SquarePen,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HOME_CHAT_LOADING_BYPASS_KEY } from "@/lib/chat-loading-bypass";
import { openSettingsHelpPopup } from "@/components/settings-help-popup";

const heroLines = [
  "your AI coach for skills, opportunities, and action",
  "your coach for smarter growth and consistent action",
];

const navItems = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const promptModes = [
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

function shufflePromptModes() {
  const modes = [...promptModes];

  for (let index = modes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [modes[index], modes[swapIndex]] = [modes[swapIndex], modes[index]];
  }

  return modes;
}

export function HomeChat() {
  const router = useRouter();
  const [isDesktopDrawerOpen, setIsDesktopDrawerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heroLineIndex, setHeroLineIndex] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [quickActions] = useState(shufflePromptModes);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroLineIndex((currentIndex) => (currentIndex + 1) % heroLines.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  function openNewChatDialog() {
    setIsDesktopDrawerOpen(false);
    setIsMobileDrawerOpen(false);
    setIsNewChatDialogOpen(true);
  }

  function openSettingsPanel() {
    setIsDesktopDrawerOpen(false);
    setIsMobileDrawerOpen(false);
    openSettingsHelpPopup();
  }

  function startNewChat() {
    setIsNewChatDialogOpen(false);
    router.push("/chat");
  }

  function handlePromptSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message) {
      return;
    }

    window.sessionStorage.setItem(
      HOME_CHAT_LOADING_BYPASS_KEY,
      String(Date.now()),
    );
    router.push(`/chat?guest=true&q=${encodeURIComponent(message)}`);
  }

  function handleQuickPrompt(promptText: string) {
    setPrompt(promptText);
    window.requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
  }

  function appendAttachmentNames(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const names = Array.from(files)
      .map((file) => file.name)
      .join(", ");

    setPrompt((current) =>
      current.trim()
        ? `${current.trim()} Attached: ${names}`
        : `Attached: ${names}`,
    );
    setIsUploadPanelOpen(false);
  }

  function handleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setPrompt((current) =>
        current.trim()
          ? `${current.trim()} Voice input is not supported in this browser.`
          : "Voice input is not supported in this browser.",
      );
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

      setPrompt((current) =>
        current.trim() ? `${current.trim()} ${spokenText}` : spokenText,
      );
      window.requestAnimationFrame(() => {
        promptInputRef.current?.focus();
      });
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-background)] p-0.5 text-[color:var(--color-text)]">
      <div className="flex min-h-[calc(100vh-4px)] overflow-hidden rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-background)]">
        <aside className="relative hidden w-[72px] bg-[color:var(--color-surface-strong)] px-4 py-7 md:block">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white text-[color:var(--color-text)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)]"
            aria-label="Open menu"
            aria-expanded={isDesktopDrawerOpen}
            onClick={() => setIsDesktopDrawerOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          {isDesktopDrawerOpen ? (
            <div className="absolute left-4 top-20 z-40 flex h-[calc(100vh-8rem)] w-72 flex-col justify-between rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <div>
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                    onClick={() => setIsDesktopDrawerOpen(false)}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={openNewChatDialog}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <SquarePen className="h-4 w-4" aria-hidden="true" />
                  New Chat
                </button>
              </div>

              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl border-t border-[color:var(--color-line)] px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                onClick={openSettingsPanel}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings & Help
              </button>
            </div>
          ) : null}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={isMobileDrawerOpen}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] md:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link href="/" className="text-xl font-medium tracking-tight">
                DSIQ
              </Link>
            </div>

            <nav className="hidden items-center gap-5 text-[13px] font-medium text-[color:var(--color-text)] lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:bg-[color:var(--color-surface-strong)] hover:text-black active:bg-[color:var(--color-line)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-black"
              >
                Log in
              </Link>
            </nav>

            <div className="lg:hidden">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-black"
              >
                Log in
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center px-5 pb-3 pt-[72px] sm:px-8 lg:pt-[82px]">
            <div className="w-full max-w-[760px]">
              <h1 className="text-[24px] font-normal leading-[1.18] text-[color:var(--color-text)] sm:text-[34px]">
                <span className="block">Meet DSIQ,</span>
                <span
                  key={heroLines[heroLineIndex]}
                  className="block animate-fade-up"
                >
                  {heroLines[heroLineIndex]}
                </span>
              </h1>

              <form
                className="mt-7 rounded-[30px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
                onSubmit={handlePromptSubmit}
              >
                <input
                  ref={promptInputRef}
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask DSIQ"
                  className="h-9 w-full bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)]"
                />

                <div className="mt-5 flex items-center gap-5">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Add"
                      aria-expanded={isUploadPanelOpen}
                      onClick={() => setIsUploadPanelOpen((value) => !value)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)]"
                    >
                    <Plus className="h-5 w-5" />
                    </button>
                    {isUploadPanelOpen ? (
                      <div className="absolute bottom-12 left-0 z-30 w-56 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                        >
                          <ImageIcon className="h-4 w-4" aria-hidden="true" />
                          Upload photos
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
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
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    className={`inline-flex h-10 items-center justify-center gap-1 rounded-full px-3 transition ${
                      isListening
                        ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]"
                        : "text-[#303134] hover:bg-[color:var(--color-surface-strong)]"
                    }`}
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
                    disabled={!prompt.trim()}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {quickActions.map((mode, index) => (
                  <button
                    type="button"
                    key={mode.label}
                    className="inline-flex min-h-12 animate-fade-up items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm font-medium text-[color:var(--color-text)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:bg-[color:var(--color-surface-strong)] sm:min-h-14 sm:text-base"
                    style={{ animationDelay: `${index * 70}ms` }}
                    onClick={() => handleQuickPrompt(mode.prompt)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-auto text-center text-[11px] leading-5 text-[color:var(--color-muted)]">
              <Link href="/terms" className="underline">
                DSIQ Terms
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="underline">
                DSIQ Privacy Policy
              </Link>{" "}
              apply. DSIQ is AI and can make mistakes.
            </p>
          </div>
        </section>
      </div>

      {isMobileDrawerOpen ? (
        <div className="fixed left-4 top-16 z-50 w-72 md:hidden">
          <aside className="flex min-h-80 flex-col justify-between rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={openNewChatDialog}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <SquarePen className="h-4 w-4" aria-hidden="true" />
                New Chat
              </button>
            </div>

            <div className="space-y-2 border-t border-[color:var(--color-line)] pt-4">
              <Link
                href="/about"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                About DSIQ
              </Link>
              <button
                type="button"
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                onClick={openSettingsPanel}
              >
                Settings & Help
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {isNewChatDialogOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
            className="w-full max-w-sm rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
          >
            <h2 id="new-chat-title" className="text-xl font-semibold text-[color:var(--color-text)]">
              Clear current chat and create new one?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
              When you start a new chat, your different one won&apos;t be saved.{" "}
              <Link href="/login" className="font-semibold text-[color:var(--color-text)] underline underline-offset-4">
                Login
              </Link>{" "}
              to save your future chats.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewChatDialogOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-5 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startNewChat}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-medium !text-white transition hover:bg-black"
              >
                New Chat
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
