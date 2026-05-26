"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Compass,
  FileText,
  FolderKanban,
  HelpCircle,
  ImageIcon,
  LayoutList,
  LogOut,
  Menu,
  Mic,
  Moon,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  SquarePen,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { PrivateRoute } from "@/components/private-route";
import { getPostAuthPath } from "@/lib/auth-routing";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/chat", icon: Search },
  { label: "AI Mentor", href: "/coach", icon: Bot },
  { label: "Learning Roadmap", href: "/coach", icon: Compass },
  { label: "Projects", href: "/dsiq/chat", icon: FolderKanban },
  { label: "Saved Chats", href: "/dsiq/chat", icon: LayoutList },
] as const;


const collapsedItems = [
  sidebarItems[0],
  sidebarItems[1],
  sidebarItems[2],
  sidebarItems[4],
  sidebarItems[5],
] as const;

const suggestedPrompts = [
  "Build my roadmap",
  "Improve my portfolio",
  "Help me learn programming",
  "Explain my code",
  "Give me a study plan",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DsiqChatPage() {
  const router = useRouter();
  const { authMode, logout } = useAuth();
  const { answers, profile, user } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Saleh";

  useEffect(() => {
    async function routeIncompleteUsers() {
      if (!user) {
        return;
      }

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/onboarding") {
        router.replace("/onboarding");
      }
    }

    void routeIncompleteUsers();
  }, [authMode, router, user]);

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message) {
      return;
    }

    setMessages((current) => [...current, message]);
    setPrompt("");
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
    window.requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
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

  async function handleLogout() {
    setIsLogoutConfirmOpen(false);
    await logout();
    router.replace("/login");
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const expanded = mobile || isSidebarOpen;
    const visibleItems = expanded ? sidebarItems : collapsedItems;

    return (
      <aside
        className={`flex h-full flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-3 py-4 transition-all ${
          expanded ? "w-[292px]" : "w-[76px]"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/dsiq/chat"
            className={`flex h-11 items-center rounded-2xl px-3 text-[color:var(--color-text)] transition hover:bg-white ${
              expanded ? "gap-3" : "w-11 justify-center"
            }`}
            aria-label="DSIQ chat"
          >

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white">
              D
            </span>
            {expanded ? (
              <span className="text-sm font-semibold tracking-[0.02em]">
                DSIQ
              </span>
            ) : null}
          </Link>

          {mobile ? (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-white lg:flex"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={expanded ? undefined : item.label}
                onClick={() => {
                  if (mobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className={`flex min-h-11 items-center rounded-2xl text-sm font-medium text-[color:var(--color-text)] transition hover:bg-white ${
                  expanded ? "gap-3 px-3" : "justify-center px-0"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {expanded ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-[color:var(--color-line)] pt-3">
          {isProfileMenuOpen ? (
            <div className="absolute bottom-16 left-0 z-50 w-64 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
              <div className="px-3 py-3">
                <p className="text-sm font-semibold text-[color:var(--color-text)]">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                  Free Plan
                </p>
              </div>
              {[
                { label: "Profile", href: "/profile", icon: CircleUserRound },
                { label: "Settings", href: "/settings", icon: Settings },
                { label: "Theme", href: "/settings", icon: Moon },
                { label: "Help", href: "/coach", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (mobile) {
                        setIsMobileSidebarOpen(false);
                      }
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsLogoutConfirmOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((value) => !value)}
            className={`flex w-full items-center rounded-2xl text-left transition hover:bg-white ${
              expanded ? "gap-3 px-3 py-3" : "justify-center px-0 py-3"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white">
              {getInitials(displayName) || "S"}
            </span>
            {expanded ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[color:var(--color-text)]">
                  {displayName}
                </span>
                <span className="block text-xs text-[color:var(--color-muted)]">
                  Free
                </span>
              </span>
            ) : null}
          </button>
        </div>
      </aside>
    );
  };

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)]">
        <div className="flex min-h-screen">
          <div className="hidden lg:block">
            <SidebarContent />
          </div>

          {isMobileSidebarOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-black/25"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0">
                <SidebarContent mobile />
              </div>
            </div>
          ) : null}

          <section className="relative flex min-w-0 flex-1 flex-col bg-[color:var(--color-background)]">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="fixed left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-8 pt-24 sm:px-8 lg:justify-center lg:py-10">
              <div className="mx-auto w-full max-w-[820px] text-center">
                <p className="mx-auto max-w-2xl text-sm leading-7 text-[color:var(--color-muted)] sm:text-base">
                  DSIQ is ready to guide your skills, projects, missions, and
                  opportunities.
                </p>

                {messages.length ? (
                  <div className="mx-auto mt-8 flex max-h-64 w-full max-w-[760px] flex-col gap-3 overflow-y-auto text-left">
                    {messages.map((message, index) => (
                      <div
                        key={`${message}-${index}`}
                        className="ml-auto max-w-[82%] rounded-[1.35rem] bg-[#111111] px-4 py-3 text-sm leading-6 text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                      >
                        {message}
                      </div>
                    ))}
                  </div>
                ) : null}

                <form
                  onSubmit={submitPrompt}
                  className="mx-auto mt-8 rounded-[30px] bg-white px-5 py-4 text-left shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsUploadPanelOpen((value) => !value)}
                        aria-label="Add attachment"
                        aria-expanded={isUploadPanelOpen}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <Plus className="h-5 w-5" aria-hidden="true" />
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
                    <input
                      ref={promptInputRef}
                      type="text"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Ask DSIQ"
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)]"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      aria-label={isListening ? "Stop voice input" : "Start voice input"}
                      className={`inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full px-3 transition ${
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
                      aria-label="Send"
                      disabled={!prompt.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>

                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {suggestedPrompts.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-full border border-[color:var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--color-text)] shadow-[0_8px_22px_rgba(0,0,0,0.04)] transition hover:bg-[color:var(--color-surface-strong)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {isLogoutConfirmOpen ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 px-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-confirm-title"
              className="w-full max-w-sm rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2
                id="logout-confirm-title"
                className="mt-4 text-lg font-semibold text-[color:var(--color-text)]"
              >
                Do you want to log out?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                Are you sure you want to log out?
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-5 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-black"
                >
                  Yes
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </PrivateRoute>
  );
}

