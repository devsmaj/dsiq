"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Check,
  Copy,
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  ImageIcon,
  LogOut,
  Menu,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  SquarePen,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { PrivateRoute } from "@/components/private-route";
import { openSettingsHelpPopup } from "@/components/settings-help-popup";
import { getPostAuthPath } from "@/lib/auth-routing";
import {
  createPrivateChat,
  listPrivateChats,
  loadPrivateChatMessages,
  savePrivateChatMessage,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { askGemini, type GeminiChatMessage } from "@/lib/gemini";
import { useKeyboardOffset } from "@/lib/use-keyboard-offset";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/chat?panel=search", icon: Search },
  { label: "AI Mentor", href: "/dsiq/chat?panel=mentor", icon: Bot },
  {
    label: "Learning Roadmap",
    href: "/dsiq/chat?panel=roadmap",
    icon: GraduationCap,
  },
  { label: "Projects", href: "/dsiq/chat?panel=projects", icon: FolderKanban },
  { label: "Saved Chats", href: "/dsiq/chat?panel=saved", icon: FileText },
] as const;


const collapsedItems = [
  sidebarItems[0],
  sidebarItems[1],
  sidebarItems[2],
  sidebarItems[3],
  sidebarItems[4],
] as const;

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
  const { answers, isProfileLoading, profile, profileError, user } =
    useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isChatActionsOpen, setIsChatActionsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<GeminiChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [privateChats, setPrivateChats] = useState<PrivateChatSummary[]>([]);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestMessageRef = useRef<HTMLDivElement | null>(null);
  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Saleh";
  const profileImageUrl =
    profile?.profileImageUrl || answers?.profileImageUrl || user?.photoURL || "";

  useKeyboardOffset();

  useEffect(() => {
    async function routeIncompleteUsers() {
      if (!user || isProfileLoading || profileError) {
        return;
      }

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/onboarding") {
        router.replace("/onboarding");
      }
    }

    void routeIncompleteUsers();
  }, [authMode, isProfileLoading, profileError, router, user]);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending, error]);

  useEffect(() => {
    async function loadChats() {
      if (!user) {
        setPrivateChats([]);
        return;
      }

      try {
        setIsChatsLoading(true);
        setPrivateChats(await listPrivateChats(user.uid));
      } catch (loadError) {
        console.warn("Private chats loading failed.", loadError);
      } finally {
        setIsChatsLoading(false);
      }
    }

    void loadChats();
  }, [user]);

  async function refreshPrivateChats() {
    if (!user) {
      return;
    }

    try {
      setPrivateChats(await listPrivateChats(user.uid));
    } catch (loadError) {
      console.warn("Private chats refresh failed.", loadError);
    }
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message || isSending) {
      return;
    }

    if (!user) {
      setError("Sign in again to save and continue your chat.");
      return;
    }

    setError("");
    setActionStatus("");
    setIsChatActionsOpen(false);
    setPrompt("");
    setIsSending(true);

    const userMessage: GeminiChatMessage = {
      role: "user",
      text: message,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const chatId = currentChatId || (await createPrivateChat(user.uid, message));
      setCurrentChatId(chatId);
      await savePrivateChatMessage({
        chatId,
        message: userMessage,
        uid: user.uid,
      });
      void refreshPrivateChats();

      const response = await askGemini(nextMessages);
      const modelMessage: GeminiChatMessage = {
        role: "model",
        text: response,
      };

      setMessages((current) => [
        ...current,
        modelMessage,
      ]);
      await savePrivateChatMessage({
        chatId,
        message: modelMessage,
        uid: user.uid,
      });
      void refreshPrivateChats();
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

  function startNewChat() {
    setCurrentChatId(null);
    setMessages([]);
    setPrompt("");
    setError("");
    setActionStatus("");
    setIsChatActionsOpen(false);
    setIsUploadPanelOpen(false);
    window.requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
  }

  async function openPrivateChat(chatId: string, mobile = false) {
    if (!user || isSending) {
      return;
    }

    try {
      setError("");
      setActionStatus("");
      setIsChatActionsOpen(false);
      setIsChatsLoading(true);
      setCurrentChatId(chatId);
      setMessages(await loadPrivateChatMessages(user.uid, chatId));
      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    } catch (loadError) {
      console.warn("Private chat opening failed.", loadError);
      setError("We could not open that saved chat right now.");
    } finally {
      setIsChatsLoading(false);
    }
  }

  function getChatText() {
    return messages
      .map((message) => {
        const label = message.role === "user" ? "You" : "DSIQ";
        return `${label}: ${message.text}`;
      })
      .join("\n\n");
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function copyModelMessage(index: number, text: string) {
    try {
      await copyText(text);
      setCopiedMessageIndex(index);
      window.setTimeout(() => {
        setCopiedMessageIndex((current) => (current === index ? null : current));
      }, 1400);
    } catch {
      setActionStatus("Copy is not available in this browser.");
    }
  }

  function draftToEmail() {
    const body = encodeURIComponent(getChatText());
    const subject = encodeURIComponent("DSIQ chat draft");
    setIsChatActionsOpen(false);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function exportToDocs() {
    const title =
      privateChats.find((chat) => chat.id === currentChatId)?.title ||
      "DSIQ chat";
    const content = `# ${title}\n\n${getChatText()}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setIsChatActionsOpen(false);
    setActionStatus("Chat exported.");
  }

  function addToProject() {
    if (currentChatId) {
      window.sessionStorage.setItem("dsiq.pending-project-chat", currentChatId);
    }

    setIsChatActionsOpen(false);
    setActionStatus("Chat is ready to add to a project.");
    router.push("/dsiq/chat?panel=projects");
  }

  async function shareChat() {
    const text = getChatText();
    const shareData = {
      title: "DSIQ chat",
      text,
    };

    try {
      if ("share" in navigator) {
        await navigator.share(shareData);
        setActionStatus("Share sheet opened.");
      } else {
        await copyText(text);
        setActionStatus("Chat copied for sharing.");
      }
    } catch {
      setActionStatus("Share was cancelled.");
    } finally {
      setIsChatActionsOpen(false);
    }
  }

  function appendAttachmentNames(files: FileList | null) {
    if (!files?.length || isSending) {
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

  function openSettingsFromProfile() {
    setIsProfileMenuOpen(false);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
    openSettingsHelpPopup();
  }

  const ProfileAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
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
        {getInitials(displayName) || "S"}
      </span>
    );
  };

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

        <nav className="mt-7 flex flex-1 flex-col gap-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isNewChat = item.label === "New Chat";

            if (isNewChat) {
              return (
                <button
                  key={item.label}
                  type="button"
                  title={expanded ? undefined : item.label}
                  onClick={() => {
                    startNewChat();
                    if (mobile) {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                  className={`flex min-h-11 items-center rounded-2xl text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-white ${
                    expanded ? "gap-3 px-3" : "justify-center px-0"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {expanded ? <span>{item.label}</span> : null}
                </button>
              );
            }

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

              {privateChats.length ? (
                <div className="flex flex-col gap-1">
                  {privateChats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => void openPrivateChat(chat.id, mobile)}
                      className={`rounded-2xl px-3 py-2.5 text-left transition hover:bg-white ${
                        currentChatId === chat.id ? "bg-white" : ""
                      }`}
                    >
                      <span className="block truncate text-sm font-medium text-[color:var(--color-text)]">
                        {chat.title}
                      </span>
                      {chat.lastMessage ? (
                        <span className="mt-0.5 block truncate text-xs text-[color:var(--color-muted)]">
                          {chat.lastMessage}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-3 text-xs leading-5 text-[color:var(--color-muted)]">
                  Your saved chats will appear here.
                </p>
              )}
            </div>
          ) : null}
        </nav>

        <div className="relative border-t border-[color:var(--color-line)] pt-3">
          {isProfileMenuOpen ? (
            <div className="absolute bottom-16 left-0 z-50 w-64 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() => setIsProfileMenuOpen(false)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="px-3 py-3">
                <p className="text-sm font-semibold text-[color:var(--color-text)]">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                  Free Plan
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  if (mobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                Profile
              </Link>
              <button
                type="button"
                onClick={openSettingsFromProfile}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </button>
              <button
                type="button"
                onClick={openSettingsFromProfile}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Help
              </button>
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
            <ProfileAvatar />
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

            {messages.length ? (
              <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 lg:right-8 lg:top-6">
                <button
                  type="button"
                  aria-label="New chat"
                  onClick={startNewChat}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <SquarePen className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="More chat actions"
                    aria-expanded={isChatActionsOpen}
                    onClick={() => setIsChatActionsOpen((value) => !value)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)]"
                  >
                    <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {isChatActionsOpen ? (
                    <div className="absolute right-0 top-12 z-40 w-56 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 text-left shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                      <button
                        type="button"
                        onClick={draftToEmail}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Draft to email
                      </button>
                      <button
                        type="button"
                        onClick={exportToDocs}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Export to docs
                      </button>
                      <button
                        type="button"
                        onClick={addToProject}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <FolderKanban className="h-4 w-4" aria-hidden="true" />
                        Add to project
                      </button>
                      <button
                        type="button"
                        onClick={() => void shareChat()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Share
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-8 pt-24 sm:px-8 lg:pt-10">
              <div className="mx-auto flex w-full max-w-[820px] flex-1 flex-col justify-center text-center">
                <p className="mx-auto max-w-2xl text-sm leading-7 text-[color:var(--color-muted)] sm:text-base">
                  DSIQ is ready to guide your skills, projects, missions, and
                  opportunities.
                </p>

                {messages.length ? (
                  <div className="mx-auto mt-8 flex max-h-64 w-full max-w-[760px] flex-col gap-4 overflow-y-auto text-left">
                    {messages.map((message, index) => (
                      <article
                        key={`${message.role}-${index}`}
                        className={`max-w-[82%] text-sm leading-7 text-[color:var(--color-text)] ${
                          message.role === "user"
                            ? "ml-auto text-right"
                            : "mr-auto text-left"
                        }`}
                      >
                        {message.text}
                        {message.role === "model" ? (
                          <button
                            type="button"
                            onClick={() => void copyModelMessage(index, message.text)}
                            className="mt-2 flex h-8 items-center gap-2 rounded-full px-2 text-xs font-medium text-[color:var(--color-muted)] transition hover:bg-white hover:text-[color:var(--color-text)]"
                          >
                            {copiedMessageIndex === index ? (
                              <Check className="h-4 w-4 text-[color:var(--color-brand-strong)]" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedMessageIndex === index ? "Copied" : "Copy"}
                          </button>
                        ) : null}
                      </article>
                    ))}
                    {isSending ? (
                      <div className="mr-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[color:var(--color-muted)]">
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
                ) : null}

                {error ? (
                  <p className="mx-auto mt-5 max-w-[760px] rounded-[1rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                {actionStatus ? (
                  <p className="mx-auto mt-5 max-w-[760px] rounded-[1rem] bg-[color:var(--color-brand-soft)] px-4 py-3 text-left text-sm text-[color:var(--color-text)]">
                    {actionStatus}
                  </p>
                ) : null}
              </div>

              <div
                className="sticky z-30 mx-auto w-full max-w-[820px] lg:static lg:-mt-32"
                style={{
                  bottom:
                    "calc(1rem + env(safe-area-inset-bottom) + var(--dsiq-keyboard-offset, 0px))",
                }}
              >
                <form
                  onSubmit={submitPrompt}
                  className="rounded-[30px] bg-white px-5 py-4 text-left shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsUploadPanelOpen((value) => !value)}
                        aria-label="Add attachment"
                        aria-expanded={isUploadPanelOpen}
                        disabled={isSending}
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
                      disabled={isSending}
                      placeholder="Ask DSIQ"
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isSending}
                      aria-label={isListening ? "Stop voice input" : "Start voice input"}
                      className={`inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
                      disabled={isSending || !prompt.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
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

