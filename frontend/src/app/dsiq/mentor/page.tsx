"use client";

import Link from "next/link";
import {
  Bot,
  FileText,
  GraduationCap,
  Menu,
  Save,
  Search,
  SquarePen,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChatComposer } from "@/components/chat-composer";
import { PrivateRoute } from "@/components/private-route";
import {
  createPrivateChat,
  listPrivateChats,
  loadPrivateChatMessages,
  savePrivateChatMessage,
  updatePrivateChatBookmark,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { askGroq, type GroqChatMessage } from "@/lib/groq";
import { dsiqLogoSrc } from "@/lib/public-asset";
import {
  createRoadmapFromAiResponse,
  isRoadmapRequest,
  saveRoadmap,
} from "@/lib/roadmap-store";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/chat?panel=search", icon: Search },
  {
    label: "Learning Roadmap",
    href: "/dsiq/roadmap",
    icon: GraduationCap,
  },

  { label: "Saved Chats", href: "/dsiq/saved", icon: FileText },
] as const;

const collapsedItems = [
  sidebarItems[0],
  sidebarItems[1],
  sidebarItems[2],
  sidebarItems[3],
] as const;




const collapsedTooltipClass =
  "pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#111111] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition group-hover:opacity-100 group-focus-visible:opacity-100";

const CHAT_TYPE = "teacher" as const;

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

function getProfileRoleLabel(role?: string | null) {
  const trimmedRole = role?.trim();
  return trimmedRole || "Member";
}

function createClientMessageId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `message-${window.crypto.randomUUID()}`;
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getChatTypeLabel(chat: PrivateChatSummary) {
  return chat.chatType === "teacher" ? "🎓 AI Teacher" : "💬 Normal Chat";
}

function getChatHref(chat: PrivateChatSummary) {
  const path = chat.chatType === "teacher" ? "/dsiq/mentor" : "/dsiq/chat";
  return `${path}?chatId=${encodeURIComponent(chat.id)}`;
}

export default function DsiqMentorPage() {
  const { answers, profile, user } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("panel") === "search",
  );
  const [prompt, setPrompt] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [mentorMessages, setMentorMessages] = useState<GroqChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [teacherChats, setTeacherChats] = useState<PrivateChatSummary[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "there";
  const profileImageUrl =
    profile?.profileImageUrl || answers?.profileImageUrl || user?.photoURL || "";
  const role = profile?.role || answers?.role || "student";
  const profileRoleLabel = getProfileRoleLabel(profile?.role || answers?.role);
  const goals = useMemo(
    () =>
      profile?.selectedGoals?.length
        ? profile.selectedGoals
        : answers?.selectedGoals?.length
          ? answers.selectedGoals
          : [],
    [answers, profile],
  );
  const primaryGoal = goals[0] || answers?.goal || answers?.interest || "Learn Programming";
  const currentMission = answers?.skills || "HTML Fundamentals";
  const currentLesson = currentMission;
  const roadmapProgress = 25;
  const filteredTeacherChats = teacherChats.filter((chat) => {
    const query = chatSearchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      chat.title.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  });
  const currentChat = teacherChats.find((chat) => chat.id === currentChatId);
  const isCurrentChatBookmarked = currentChat?.isBookmarked === true;


  const mentorContext = useMemo(
    () =>
      [
        "You are DSIQ Mentor, a calm personal AI teacher for a student.",
        "Do not act like a normal open-ended chat. Teach, focus, guide, and give practical next steps.",
        `Student name: ${displayName}.`,
        `Role: ${role}.`,
        `Selected goals: ${goals.length ? goals.join(", ") : "Not provided"}.`,
        `Age: ${profile?.age || answers?.age || "Not provided"}.`,
        `Current mission: ${currentMission}.`,
        `Current lesson: ${currentLesson}.`,
        "Keep responses clear, supportive, and action-focused.",
        "Always format answers cleanly.",
        "Use short paragraphs with line breaks between points.",
        "Use numbered lists for steps and bullet points for examples.",
        "Never return long unbroken paragraphs.",
        "If giving a list, each item must be on a new line.",
        "If explaining code, use fenced code blocks.",
      ].join("\n"),
    [answers?.age, currentLesson, currentMission, displayName, goals, profile?.age, role],
  );

  useEffect(() => {
    async function loadTeacherChats() {
      if (!user) {
        setTeacherChats([]);
        return;
      }

      try {
        setIsChatsLoading(true);
        setTeacherChats(await listPrivateChats(user.uid));
      } finally {
        setIsChatsLoading(false);
      }
    }

    void loadTeacherChats();
  }, [user]);

  useEffect(() => {
    if (!user || currentChatId) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const chatId = searchParams.get("chatId");
    if (chatId) {
      void openTeacherChat(chatId);
    }
  }, [currentChatId, user]);

  async function refreshTeacherChats() {
    if (!user) {
      return;
    }

    setTeacherChats(await listPrivateChats(user.uid));
  }

  function startNewTeacherChat(mobile = false) {
    setCurrentChatId(null);
    setMentorMessages([]);
    setPrompt("");
    setError("");
    setIsSearchPanelOpen(false);
    if (mobile) {
      setIsMobileSidebarOpen(false);
    }
  }

  async function openTeacherChat(chatId: string, mobile = false) {
    if (!user || isSending) {
      return;
    }

    try {
      setIsChatsLoading(true);
      setError("");
      setIsSearchPanelOpen(false);
      setCurrentChatId(chatId);
      const messages = await loadPrivateChatMessages(user.uid, chatId);
      setMentorMessages(messages.map(({ role, text }) => ({ role, text })));
      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    } catch {
      setError("We could not open that AI Teacher chat right now.");
    } finally {
      setIsChatsLoading(false);
    }
  }

  function openTeacherSearch(mobile = false) {
    setIsSearchPanelOpen(true);
    setChatSearchQuery("");
    if (mobile) {
      setIsMobileSidebarOpen(false);
    }
    void refreshTeacherChats();
  }

  async function toggleCurrentTeacherChatBookmark() {
    if (!user || !currentChatId) {
      setError("Send a message first, then save this AI Teacher chat.");
      return;
    }

    await updatePrivateChatBookmark({
      chatId: currentChatId,
      isBookmarked: !isCurrentChatBookmarked,
      uid: user.uid,
    });
    await refreshTeacherChats();
  }

  async function submitMentorPrompt(value: string) {
    const question = value.trim();
    if (!question || isSending) {
      return;
    }

    setPrompt("");
    setError("");
    setIsSending(true);

    const userMessage: GroqChatMessage = {
      role: "user",
      text: question,
    };
    const nextMessages = [...mentorMessages, userMessage];
    setMentorMessages(nextMessages);

    try {
      if (!user) {
        throw new Error("Sign in again to save and continue your AI Teacher chat.");
      }

      const chatId =
        currentChatId || (await createPrivateChat(user.uid, question, CHAT_TYPE));
      setCurrentChatId(chatId);
      await savePrivateChatMessage({
        chatId,
        chatType: CHAT_TYPE,
        message: {
          ...userMessage,
          createdAtMs: Date.now(),
          id: createClientMessageId(),
        },
        uid: user.uid,
      });

      const answer = await askGroq([
        {
          role: "user",
          text: `${mentorContext}\n\nStudent question: ${question}`,
        },
      ]);
      setMentorMessages((current) => [
        ...current,
        {
          role: "model",
          text: answer,
        },
      ]);
      await savePrivateChatMessage({
        chatId,
        chatType: CHAT_TYPE,
        message: {
          role: "model",
          text: answer,
          createdAtMs: Date.now(),
          id: createClientMessageId(),
        },
        uid: user.uid,
      });

      if (isRoadmapRequest(question)) {
        await saveRoadmap(
          user.uid,
          createRoadmapFromAiResponse({
            answer,
            prompt: question,
          }),
        );
      }
      void refreshTeacherChats();
    } catch (mentorError) {
      setError(
        mentorError instanceof Error
          ? mentorError.message
          : "DSIQ Mentor could not answer right now. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
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
      if (spokenText) {
        setPrompt((current) =>
          current.trim() ? `${current.trim()} ${spokenText}` : spokenText,
        );
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    setError("");
    setIsListening(true);
    recognition.start();
  }

  function renderProfileAvatar(size: "sm" | "md" = "md") {
    const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-xs";

    if (profileImageUrl) {
      return (
        <img
          src={profileImageUrl}
          alt=""
          className={`${sizeClass} shrink-0 rounded-full object-cover`}
        />
      );
    }

    return (
      <span
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#111111] font-semibold text-white`}
      >
        {getInitials(displayName) || "D"}
      </span>
    );
  }

  function renderSidebarContent(mobile = false) {
    const expanded = mobile || isSidebarOpen;
    const visibleItems = expanded ? sidebarItems : collapsedItems;
    const recentChats = teacherChats.slice(0, 3);

    return (
      <aside
        className={`flex h-full flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-3 py-4 transition-all ${
          expanded ? "w-[292px]" : "w-[76px]"
        }`}
      >
        <div
          className={`flex items-center ${
            expanded ? "justify-between" : "justify-center"
          }`}
        >
          {expanded ? (
            <Link
              href="/dsiq/chat"
              className="flex h-12 items-center gap-3 rounded-2xl px-3 text-[color:var(--color-text)] transition hover:bg-white"
              aria-label="DSIQ chat"
            >
              <img
                src={dsiqLogoSrc}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="text-sm font-semibold tracking-[0.02em]">
                DSIQ
              </span>
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="group relative hidden h-12 w-12 items-center justify-center rounded-2xl transition hover:bg-white lg:flex"
            >
              <img
                src={dsiqLogoSrc}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className={collapsedTooltipClass}>Open sidebar</span>
            </button>
          )}

          {mobile ? (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : expanded ? (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-white lg:flex"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav
          className={`mt-7 flex flex-1 flex-col gap-1 ${
            expanded ? "overflow-y-auto" : "overflow-visible"
          }`}
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = false;
            const isNewChat = item.label === "New Chat";
            const isSearchChats = item.label === "Search Chats";

            if (isNewChat) {
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  onClick={() => startNewTeacherChat(mobile)}
                  className={`group relative flex min-h-11 items-center rounded-2xl text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-white ${
                    expanded ? "gap-3 px-3" : "justify-center px-0"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {expanded ? <span>{item.label}</span> : null}
                  {!expanded ? (
                    <span className={collapsedTooltipClass}>{item.label}</span>
                  ) : null}
                </button>
              );
            }

            if (isSearchChats) {
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  onClick={() => openTeacherSearch(mobile)}
                  className={`group relative flex min-h-11 items-center rounded-2xl text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-white ${
                    expanded ? "gap-3 px-3" : "justify-center px-0"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {expanded ? <span>{item.label}</span> : null}
                  {!expanded ? (
                    <span className={collapsedTooltipClass}>{item.label}</span>
                  ) : null}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={expanded ? undefined : item.label}
                onClick={() => {
                  if (mobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className={`group relative flex min-h-11 items-center rounded-2xl text-sm text-[color:var(--color-text)] transition hover:bg-white ${
                  expanded ? "gap-3 px-3" : "justify-center px-0"
                } font-medium ${isActive ? "bg-white" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {expanded ? <span>{item.label}</span> : null}
                {!expanded ? (
                  <span className={collapsedTooltipClass}>{item.label}</span>
                ) : null}
              </Link>
            );
          })}

          {expanded ? (
            <div className="mt-5 border-t border-[color:var(--color-line)] pt-4">
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  Recent
                </p>
                {isChatsLoading ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[color:var(--color-muted)] border-t-transparent" />
                ) : null}
              </div>
              <p className="mb-2 px-3 text-[11px] leading-4 text-[color:var(--color-muted)]">
                Latest 3 chats across DSIQ.
              </p>
              {recentChats.length ? (
                <div className="flex flex-col gap-1">
                  {recentChats.map((chat) =>
                    chat.chatType === CHAT_TYPE ? (
                      <button
                        key={chat.id}
                        type="button"
                        onClick={() => void openTeacherChat(chat.id, mobile)}
                        className={`rounded-2xl px-3 py-2.5 text-left transition hover:bg-white ${
                          currentChatId === chat.id ? "bg-white" : ""
                        }`}
                      >
                      <span className="block truncate text-sm font-medium text-[color:var(--color-text)]">
                        {chat.title}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold text-[color:var(--color-muted)]">
                        {getChatTypeLabel(chat)}
                      </span>
                      {chat.lastMessage ? (
                        <span className="mt-0.5 block truncate text-xs text-[color:var(--color-muted)]">
                          {chat.lastMessage}
                        </span>
                      ) : null}
                      </button>
                    ) : (
                      <Link
                        key={chat.id}
                        href={getChatHref(chat)}
                        onClick={() => {
                          if (mobile) {
                            setIsMobileSidebarOpen(false);
                          }
                        }}
                        className="rounded-2xl px-3 py-2.5 text-left transition hover:bg-white"
                      >
                        <span className="block truncate text-sm font-medium text-[color:var(--color-text)]">
                          {chat.title}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold text-[color:var(--color-muted)]">
                          {getChatTypeLabel(chat)}
                        </span>
                        {chat.lastMessage ? (
                          <span className="mt-0.5 block truncate text-xs text-[color:var(--color-muted)]">
                            {chat.lastMessage}
                          </span>
                        ) : null}
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <p className="px-3 text-xs leading-5 text-[color:var(--color-muted)]">
                  Recent chats will appear here.
                </p>
              )}
            </div>
          ) : null}
        </nav>

        <div className="border-t border-[color:var(--color-line)] pt-3">
          <Link
            href="/profile"
            aria-label={expanded ? undefined : "Profile"}
            className={`group relative flex w-full items-center rounded-2xl text-left transition hover:bg-white ${
              expanded ? "gap-3 px-3 py-3" : "justify-center px-0 py-3"
            }`}
          >
            {renderProfileAvatar()}
            {expanded ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[color:var(--color-text)]">
                  {displayName}
                </span>
                <span className="block text-xs text-[color:var(--color-muted)]">
                  {profileRoleLabel}
                </span>
              </span>
            ) : null}
            {!expanded ? (
              <span className={collapsedTooltipClass}>Profile</span>
            ) : null}
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <PrivateRoute>
      <main className="ai-teacher-page text-[color:var(--color-text)]">
        <div className="flex min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden">
          <div className="hidden lg:block">
            {renderSidebarContent()}
          </div>

          {isMobileSidebarOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-black/25"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 max-w-[calc(100vw-24px)] overflow-x-hidden">
                {renderSidebarContent(true)}
              </div>
            </div>
          ) : null}

          {isSearchPanelOpen ? (
            <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 px-4 py-20 sm:items-center sm:py-8">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="teacher-search-title"
                className="relative w-full max-w-md rounded-2xl border border-[color:var(--color-line)] bg-white p-4 text-[color:var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
              >
                <button
                  type="button"
                  aria-label="Close search chats"
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <h2 id="teacher-search-title" className="pr-10 text-base font-semibold">
                  Search AI Teacher Chats
                </h2>
                <p className="mt-1 pr-10 text-xs leading-5 text-[color:var(--color-muted)]">
                  Search normal and AI Teacher history.
                </p>
                <div className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-[color:var(--color-line)] px-4">
                  <Search className="h-4 w-4 text-[color:var(--color-muted)]" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(event) => setChatSearchQuery(event.target.value)}
                    placeholder="Search AI Teacher chats"
                    autoFocus
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-muted)]"
                  />
                </div>

                <div className="mt-4 max-h-80 overflow-y-auto">
                  {filteredTeacherChats.length ? (
                    <div className="flex flex-col gap-1">
                      {filteredTeacherChats.map((chat) => {
                        const content = (
                          <>
                          <span className="block truncate text-sm font-semibold">
                            {chat.title}
                          </span>
                          <span className="mt-1 block text-[11px] font-semibold text-[color:var(--color-muted)]">
                            {getChatTypeLabel(chat)}
                          </span>
                          {chat.lastMessage ? (
                            <span className="mt-1 block truncate text-xs text-[color:var(--color-muted)]">
                              {chat.lastMessage}
                            </span>
                          ) : null}
                          </>
                        );

                        return chat.chatType === CHAT_TYPE ? (
                          <button
                            key={chat.id}
                            type="button"
                            onClick={() => void openTeacherChat(chat.id)}
                            className="rounded-2xl px-3 py-3 text-left transition hover:bg-[color:var(--color-surface-strong)]"
                          >
                            {content}
                          </button>
                        ) : (
                          <Link
                            key={chat.id}
                            href={getChatHref(chat)}
                            onClick={() => setIsSearchPanelOpen(false)}
                            className="rounded-2xl px-3 py-3 text-left transition hover:bg-[color:var(--color-surface-strong)]"
                          >
                            {content}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-[color:var(--color-surface-strong)] px-4 py-4 text-sm text-[color:var(--color-muted)]">
                      No AI Teacher chats found.
                    </p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          <section className="ai-teacher-content flex-1">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mobile-menu-button flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              href="/dsiq/chat"
              aria-label="Turn AI Teacher off"
              className="fixed right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-40 inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white px-3 text-xs font-semibold text-[color:var(--color-text)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] sm:right-6 lg:right-8"
            >
              <span>AI Teacher</span>
              <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[10px] text-white">
                ON
              </span>
            </Link>

            <div className="ai-teacher-shell">
              <section className="ai-teacher-summary flex flex-col gap-1 rounded-2xl border border-[color:var(--color-line)] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3">
                  {renderProfileAvatar("sm")}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Good to see you, {displayName}.</p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Current goal: {primaryGoal}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Progress: {roadmapProgress}%
                    </p>
                  </div>
                </div>
              </section>


              <article className="ai-teacher-card rounded-2xl border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="teacher-header border-b border-[color:var(--color-line)] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] text-white">
                      <Bot className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold">AI Teacher</h2>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Ask, practice, and continue your lesson.
                      </p>
                    </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleCurrentTeacherChatBookmark()}
                      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[color:var(--color-line)] px-3 text-xs font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {isCurrentChatBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>

                <div className="teacher-messages flex flex-col gap-4 px-4 py-5 sm:px-5">
                  {mentorMessages.length ? (
                    mentorMessages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`max-w-[86%] break-words rounded-2xl px-4 py-3 text-sm leading-7 ${
                          message.role === "user"
                            ? "ml-auto bg-[#111111] text-white"
                            : "ai-message mr-auto border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]"
                        }`}
                      >
                        {message.text}
                      </div>
                    ))
                  ) : (
                    <div className="my-auto mx-auto max-w-sm text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)]">
                        <Bot className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-sm font-semibold">
                        What should we learn next?
                      </p>
                    </div>
                  )}

                  {isSending ? (
                    <div className="mr-auto inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface-strong)] px-4 py-3 text-[color:var(--color-muted)]">
                      <span className="typing-dot" />
                      <span className="typing-dot [animation-delay:120ms]" />
                      <span className="typing-dot [animation-delay:240ms]" />
                      <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em]">
                        Teacher thinking
                      </span>
                    </div>
                  ) : null}

                  {error ? (
                    <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="teacher-input-area min-w-0 w-full">
                  <ChatComposer
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={(value) => void submitMentorPrompt(value)}
                    onVoiceInput={handleVoiceInput}
                    isListening={isListening}
                    isSending={isSending}
                    placeholder="Ask your AI Teacher anything..."
                  />
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </PrivateRoute>
  );
}
