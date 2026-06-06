"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleUserRound,
  Check,
  Copy,
  FileText,
  GraduationCap,
  HelpCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  Save,
  SquarePen,
  Target,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ChatComposer } from "@/components/chat-composer";
import { PrivateRoute } from "@/components/private-route";
import { openSettingsHelpPopup } from "@/components/settings-help-popup";
import { getPostAuthPath } from "@/lib/auth-routing";
import {
  createPrivateChat,
  deletePrivateChat,
  listPrivateChats,
  loadPrivateChatMessages,
  savePrivateChatMessage,
  updatePrivateChatBookmark,
  updatePrivateChatTitle,
  type PrivateChatMessage,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { askGroq, type GroqChatMessage } from "@/lib/groq";
import { dsiqLogoSrc } from "@/lib/public-asset";
import { useKeyboardOffset } from "@/lib/use-keyboard-offset";
import { useUserProfile } from "@/lib/use-user-profile";

const CHAT_TYPE = "normal" as const;

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

const appVersion = "0.1.0";

const collapsedTooltipClass =
  "pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#111111] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition group-hover:opacity-100 group-focus-visible:opacity-100";

const helpItems = [
  {
    title: "Frequently Asked Questions",
    description: "Find quick answers about chats, saved work, and your AI Teacher.",
    icon: HelpCircle,
  },
  {
    title: "Contact Support",
    description: "Reach the DSIQ team when you need help with your account.",
    icon: CircleUserRound,
  },
  {
    title: "Report a Problem",
    description: "Tell us when something is broken or not working as expected.",
    icon: Target,
  },
  {
    title: "Send Feedback",
    description: "Share what would make DSIQ better for your learning flow.",
    icon: SquarePen,
  },
  {
    title: "App Version",
    description: `DSIQ ${appVersion}`,
    icon: FileText,
  },
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

function toGroqMessages(messages: PrivateChatMessage[]): GroqChatMessage[] {
  return messages.map(({ role, text }) => ({ role, text }));
}

function formatChatUpdatedAt(updatedAtMs: number) {
  if (!updatedAtMs) {
    return "Saved";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAtMs));
}

function getGreeting(name: string, isReturning: boolean) {
  if (isReturning) {
    return `Welcome back, ${name}`;
  }

  const hour = new Date().getHours();
  if (hour < 12) {
    return `Good morning, ${name}`;
  }

  if (hour < 17) {
    return `Good afternoon, ${name}`;
  }

  return `Good evening, ${name}`;
}

function getChatTypeLabel(chat: PrivateChatSummary) {
  return chat.chatType === "teacher" ? "🎓 AI Teacher" : "💬 Normal Chat";
}

function getChatHref(chat: PrivateChatSummary) {
  const path = chat.chatType === "teacher" ? "/dsiq/mentor" : "/dsiq/chat";
  return `${path}?chatId=${encodeURIComponent(chat.id)}`;
}

export default function DsiqChatPage() {
  const router = useRouter();
  const { authMode, logout } = useAuth();
  const { answers, isProfileLoading, profile, profileError, user } =
    useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isChatActionsOpen, setIsChatActionsOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isSavedChatsPanelOpen, setIsSavedChatsPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [savedChatDraftTitles, setSavedChatDraftTitles] = useState<
    Record<string, string>
  >({});
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [privateChats, setPrivateChats] = useState<PrivateChatSummary[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    name: string;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    dataUrl: string;
    name: string;
  } | null>(null);
  const [activeSavedChatMenuId, setActiveSavedChatMenuId] = useState<
    string | null
  >(null);
  const [renamingSavedChatId, setRenamingSavedChatId] = useState<string | null>(
    null,
  );
  const [selectedSavedChatIds, setSelectedSavedChatIds] = useState<string[]>(
    [],
  );
  const [isSavedSelectMode, setIsSavedSelectMode] = useState(false);
  const [deleteSavedChatIds, setDeleteSavedChatIds] = useState<string[]>([]);
  const [confirmingRecentDeleteChatId, setConfirmingRecentDeleteChatId] =
    useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
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
  const profileRoleLabel = getProfileRoleLabel(profile?.role || answers?.role);
  const filteredPrivateChats = privateChats.filter((chat) => {
    const query = chatSearchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      chat.title.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  });
  const currentChat = privateChats.find((chat) => chat.id === currentChatId);
  const isCurrentChatBookmarked = currentChat?.isBookmarked === true;
  const bookmarkedPrivateChats = privateChats.filter(
    (chat) => chat.isBookmarked,
  );
  const hasPreviousProgress = privateChats.length > 0;
  const welcomeActions = [
    {
      label: "Create my roadmap",
      prompt:
        "Create my learning roadmap with clear beginner, intermediate, and portfolio steps.",
    },
    {
      label: "Continue my lesson",
      prompt: "Continue my lesson from where I stopped. Keep it short and practical.",
    },
    {
      label: "Give me today's mission",
      prompt: "Give me today's learning mission with one clear action and a quick check.",
    },
    {
      label: "Test my knowledge",
      prompt: "Test my knowledge with a short quiz, then explain what I miss.",
    },
  ];
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
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    async function loadChats() {
      if (!user) {
        setPrivateChats([]);
        return;
      }

      try {
        setIsChatsLoading(true);
        const nextChats = await listPrivateChats(user.uid);
        setPrivateChats(nextChats);
        setSavedChatDraftTitles(
          Object.fromEntries(nextChats.map((chat) => [chat.id, chat.title])),
        );
      } catch (loadError) {
        console.warn("Private chats loading failed.", loadError);
      } finally {
        setIsChatsLoading(false);
      }
    }

    void loadChats();
  }, [user]);

  useEffect(() => {
    if (!user || isSending || currentChatId) {
      return;
    }

    const chatId = new URLSearchParams(window.location.search).get("chatId");
    if (chatId) {
      void openPrivateChat(chatId);
    }
  }, [currentChatId, isSending, user]);

  async function refreshPrivateChats() {
    if (!user) {
      return;
    }

    try {
      const nextChats = await listPrivateChats(user.uid);
      setPrivateChats(nextChats);
      setSavedChatDraftTitles(
        Object.fromEntries(nextChats.map((chat) => [chat.id, chat.title])),
      );
    } catch (loadError) {
      console.warn("Private chats refresh failed.", loadError);
    }
  }

  async function toggleChatBookmark(chatId: string, isBookmarked?: boolean) {
    if (!user) {
      setActionStatus("Send a message first, then save this chat.");
      return;
    }

    const nextBookmarked = !isBookmarked;
    await updatePrivateChatBookmark({
      chatId,
      isBookmarked: nextBookmarked,
      uid: user.uid,
    });
    await refreshPrivateChats();
    setActionStatus(nextBookmarked ? "Chat saved." : "Chat removed from Saved Chats.");
    setIsChatActionsOpen(false);
    setActiveSavedChatMenuId(null);
  }

  async function toggleCurrentChatBookmark() {
    if (!currentChatId) {
      setActionStatus("Send a message first, then save this chat.");
      return;
    }

    await toggleChatBookmark(currentChatId, isCurrentChatBookmarked);
  }

  async function sendPromptText(rawMessage: string) {
    const trimmedMessage = rawMessage.trim();
    const message = selectedImage
      ? `${trimmedMessage || "Please review this image."}\n\nAttached image: ${selectedImage.name}`
      : trimmedMessage;
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
    setActiveSavedChatMenuId(null);
    setPrompt("");
    setSelectedImage(null);
    setIsSending(true);

    const userMessage: PrivateChatMessage = {
      createdAtMs: Date.now(),
      id: createClientMessageId(),
      imageDataUrl: selectedImage?.dataUrl,
      imageName: selectedImage?.name,
      role: "user",
      text: message,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const chatId =
        currentChatId || (await createPrivateChat(user.uid, message, CHAT_TYPE));
      setCurrentChatId(chatId);
      await savePrivateChatMessage({
        chatId,
        chatType: CHAT_TYPE,
        message: userMessage,
        uid: user.uid,
      });
      void refreshPrivateChats();

      const response = await askGroq(toGroqMessages(nextMessages));
      const modelMessage: PrivateChatMessage = {
        createdAtMs: Date.now(),
        id: createClientMessageId(),
        role: "model",
        text: response,
      };

      setMessages((current) => [
        ...current,
        modelMessage,
      ]);
      await savePrivateChatMessage({
        chatId,
        chatType: CHAT_TYPE,
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
    stopReadAloud();
    setCurrentChatId(null);
    setMessages([]);
    setPrompt("");
    setSelectedImage(null);
    setError("");
    setActionStatus("");
    setIsChatActionsOpen(false);
    setActiveSavedChatMenuId(null);
    setIsSearchPanelOpen(false);
    closeSavedChatsPanel();
  }

  async function openPrivateChat(chatId: string, mobile = false) {
    if (!user || isSending) {
      return;
    }

    try {
      stopReadAloud();
      setError("");
      setActionStatus("");
      setIsChatActionsOpen(false);
      setActiveSavedChatMenuId(null);
      setIsSearchPanelOpen(false);
      closeSavedChatsPanel();
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

  function openSearchPanel(mobile = false) {
    setIsSearchPanelOpen(true);
    setIsSavedChatsPanelOpen(false);
    setChatSearchQuery("");
    setActiveSavedChatMenuId(null);
    if (mobile) {
      setIsMobileSidebarOpen(false);
    }
    void refreshPrivateChats();
  }

  function openSavedChatsPanel(mobile = false) {
    setIsSavedChatsPanelOpen(true);
    setIsSearchPanelOpen(false);
    setActionStatus("");
    setActiveSavedChatMenuId(null);
    setRenamingSavedChatId(null);
    setDeleteSavedChatIds([]);
    if (mobile) {
      setIsMobileSidebarOpen(false);
    }
    void refreshPrivateChats();
  }

  function closeSavedChatsPanel() {
    setIsSavedChatsPanelOpen(false);
    setIsSavedSelectMode(false);
    setSelectedSavedChatIds([]);
    setActiveSavedChatMenuId(null);
    setRenamingSavedChatId(null);
    setDeleteSavedChatIds([]);
  }

  function toggleSavedChatSelection(chatId: string) {
    setSelectedSavedChatIds((current) =>
      current.includes(chatId)
        ? current.filter((id) => id !== chatId)
        : [...current, chatId],
    );
  }

  async function handleSaveSavedChatTitle(chatId: string) {
    if (!user) {
      setActionStatus("Sign in again to rename this chat.");
      return;
    }

    await updatePrivateChatTitle({
      chatId,
      title: savedChatDraftTitles[chatId] || "New chat",
      uid: user.uid,
    });
    setRenamingSavedChatId(null);
    setActiveSavedChatMenuId(null);
    setActionStatus("Chat name saved.");
    await refreshPrivateChats();
  }

  async function exportSavedChat(chat: PrivateChatSummary) {
    if (!user) {
      setActionStatus("Sign in again to export this chat.");
      return;
    }

    const chatMessages = await loadPrivateChatMessages(user.uid, chat.id);
    const content = `# ${chat.title}\n\n${chatMessages
      .map((message) => {
        const label = message.role === "user" ? "You" : "DSIQ";
        return `${label}: ${message.text}`;
      })
      .join("\n\n")}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${chat.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setActiveSavedChatMenuId(null);
    setActionStatus("Saved chat exported.");
  }

  async function handleDeleteSavedChats(chatIds: string[]) {
    if (!user || !chatIds.length) {
      return;
    }

    await Promise.all(
      chatIds.map((chatId) =>
        deletePrivateChat({
          chatId,
          uid: user.uid,
        }),
      ),
    );

    if (currentChatId && chatIds.includes(currentChatId)) {
      stopReadAloud();
      setCurrentChatId(null);
      setMessages([]);
      setPrompt("");
      setError("");
    }

    setDeleteSavedChatIds([]);
    setConfirmingRecentDeleteChatId(null);
    setSelectedSavedChatIds((current) =>
      current.filter((chatId) => !chatIds.includes(chatId)),
    );
    setActiveSavedChatMenuId(null);
    await refreshPrivateChats();
    setActionStatus(
      chatIds.length === 1 ? "Saved chat deleted." : "Saved chats deleted.",
    );
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

  function stopReadAloud(status = "") {
    window.speechSynthesis?.cancel();
    setIsReadingAloud(false);
    if (status) {
      setActionStatus(status);
    }
  }

  function readAloud() {
    setIsChatActionsOpen(false);

    if (isReadingAloud) {
      stopReadAloud("Reading stopped.");
      return;
    }

    const messageToRead =
      [...messages].reverse().find((message) => message.role === "model") ||
      messages[messages.length - 1];
    const text = messageToRead?.text.trim();

    if (!text) {
      setActionStatus("There is no message to read yet.");
      return;
    }

    if (
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      setActionStatus("Read aloud is not available in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-US";
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => {
      setIsReadingAloud(false);
      setActionStatus("Read aloud stopped.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
    setActionStatus("Reading aloud.");
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

  function openHelpFromProfile() {
    setIsProfileMenuOpen(false);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
    setIsHelpOpen(true);
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

  const renderSidebarContent = (mobile = false) => {
    const expanded = mobile || isSidebarOpen;
    const visibleItems = expanded ? sidebarItems : collapsedItems;
    const recentChats = privateChats.slice(0, 3);

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
            const isNewChat = item.label === "New Chat";
            const isSearchChats = item.label === "Search Chats";
            const isSavedChats = item.label === "Saved Chats";

            if (isNewChat) {
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  onClick={() => {
                    startNewChat();
                    if (mobile) {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
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
                  onClick={() => openSearchPanel(mobile)}
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

            if (isSavedChats) {
              return (
                <Link
                  key={item.label}
                  aria-label={item.label}
                  href={item.href}
                  onClick={() => {
                    closeSavedChatsPanel();
                    if (mobile) {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex min-h-11 items-center rounded-2xl text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-white ${
                    expanded ? "gap-3 px-3" : "justify-center px-0"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {expanded ? <span>{item.label}</span> : null}
                  {!expanded ? (
                    <span className={collapsedTooltipClass}>{item.label}</span>
                  ) : null}
                </Link>
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
                } font-medium`}
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
            <div
              className={`border-t border-[color:var(--color-line)] ${
                mobile ? "mt-3 pt-3" : "mt-5 pt-4"
              }`}
            >
              <div
                className={`flex items-center justify-between ${
                  mobile ? "mb-1 px-2" : "mb-2 px-3"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  Recent
                </p>
                {isChatsLoading ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[color:var(--color-muted)] border-t-transparent" />
                ) : null}
              </div>

              {recentChats.length ? (
                <>
                <p className="mb-2 px-3 text-[11px] leading-4 text-[color:var(--color-muted)]">
                  Latest 3 chats. Use Search Chats for full history.
                </p>
                <div className={`flex flex-col ${mobile ? "gap-0.5" : "gap-1"}`}>
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative rounded-2xl transition hover:bg-white ${
                        currentChatId === chat.id ? "bg-white" : ""
                      } ${mobile ? "pr-8" : "pr-10"}`}
                    >
                      {chat.chatType === CHAT_TYPE ? (
                        <button
                          type="button"
                          onClick={() => void openPrivateChat(chat.id, mobile)}
                          className={`block w-full text-left ${
                            mobile ? "px-2 py-2" : "px-3 py-2.5"
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
                          href={getChatHref(chat)}
                          onClick={() => {
                            if (mobile) {
                              setIsMobileSidebarOpen(false);
                            }
                          }}
                          className={`block w-full text-left ${
                            mobile ? "px-2 py-2" : "px-3 py-2.5"
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
                        </Link>
                      )}
                      <button
                        type="button"
                        aria-label={`More actions for ${chat.title}`}
                        aria-expanded={activeSavedChatMenuId === chat.id}
                        onClick={() => {
                          setConfirmingRecentDeleteChatId(null);
                          setActiveSavedChatMenuId((current) =>
                            current === chat.id ? null : chat.id,
                          );
                        }}
                        className={`absolute right-1.5 flex items-center justify-center rounded-full text-[color:var(--color-muted)] opacity-100 transition hover:bg-[color:var(--color-surface-strong)] hover:text-[color:var(--color-text)] ${
                          mobile ? "top-1.5 h-7 w-7" : "top-2 h-8 w-8"
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {activeSavedChatMenuId === chat.id ? (
                        <div className="absolute right-2 top-10 z-50 w-48 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 text-left shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                          {confirmingRecentDeleteChatId === chat.id ? (
                            <div className="space-y-2 px-1 py-1">
                              <p className="px-2 text-xs font-medium text-[color:var(--color-text)]">
                                Delete this chat?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setConfirmingRecentDeleteChatId(null)}
                                  className="h-8 flex-1 rounded-full border border-[color:var(--color-line)] text-xs font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteSavedChats([chat.id])}
                                  className="h-8 flex-1 rounded-full bg-red-600 text-xs font-semibold text-white transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                void toggleChatBookmark(chat.id, chat.isBookmarked)
                              }
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                            >
                              <Save className="h-4 w-4" aria-hidden="true" />
                              {chat.isBookmarked ? "Remove saved chat" : "Save chat"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingRecentDeleteChatId(chat.id)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <p className="px-3 text-xs leading-5 text-[color:var(--color-muted)]">
                  Your latest chats will appear here.
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
                  {profileRoleLabel}
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
                onClick={openHelpFromProfile}
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
            aria-label="Profile"
            onClick={() => setIsProfileMenuOpen((value) => !value)}
            className={`group relative flex w-full items-center rounded-2xl text-left transition hover:bg-white ${
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
                  {profileRoleLabel}
                </span>
              </span>
            ) : null}
            {!expanded ? (
              <span className={collapsedTooltipClass}>Profile</span>
            ) : null}
          </button>
        </div>
      </aside>
    );
  };

  return (
    <PrivateRoute>
      <main className="h-[100dvh] min-h-[100dvh] overflow-hidden bg-[color:var(--color-background)] text-[color:var(--color-text)]">
        <div className="flex h-full min-h-0 overflow-hidden">

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
              <div className="absolute inset-y-0 left-0">
                {renderSidebarContent(true)}
              </div>
            </div>
          ) : null}

          {isSearchPanelOpen ? (
            <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 px-4 py-20 sm:items-center sm:py-8">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-search-title"
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
                <h2
                  id="chat-search-title"
                  className="pr-10 text-base font-semibold"
                >
                  Search Chats
                </h2>
                <p className="mt-1 pr-10 text-xs leading-5 text-[color:var(--color-muted)]">
                  Search all normal and AI Teacher chat history.
                </p>
                <div className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-[color:var(--color-line)] px-4">
                  <Search className="h-4 w-4 text-[color:var(--color-muted)]" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(event) => setChatSearchQuery(event.target.value)}
                    placeholder="Search chats"
                    autoFocus
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-muted)]"
                  />
                </div>

                <div className="mt-4 max-h-80 overflow-y-auto">
                  {filteredPrivateChats.length ? (
                    <div className="flex flex-col gap-1">
                      {filteredPrivateChats.map((chat) => {
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
                            onClick={() => {
                              setIsSearchPanelOpen(false);
                              void openPrivateChat(chat.id);
                            }}
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
                      No chats found.
                    </p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {isSavedChatsPanelOpen ? (
            <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 px-4 py-20 sm:items-center sm:py-8">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="saved-chats-title"
                className="relative w-full max-w-2xl rounded-2xl border border-[color:var(--color-line)] bg-white p-4 text-[color:var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
              >
                <button
                  type="button"
                  aria-label="Close saved chats"
                  onClick={closeSavedChatsPanel}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex items-start justify-between gap-4 pr-10">
                  <div>
                    <h2
                      id="saved-chats-title"
                      className="text-base font-semibold"
                    >
                      Saved Chats
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted)]">
                      Open, rename, export, or delete saved chats.
                    </p>
                  </div>
                  {bookmarkedPrivateChats.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavedSelectMode((current) => !current);
                        setSelectedSavedChatIds([]);
                        setActiveSavedChatMenuId(null);
                        setRenamingSavedChatId(null);
                      }}
                      className="mt-8 inline-flex h-9 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-xs font-semibold transition hover:bg-[color:var(--color-surface-strong)] sm:mt-0"
                    >
                      {isSavedSelectMode ? "Done" : "Select"}
                    </button>
                  ) : null}
                </div>

                {isSavedSelectMode ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[color:var(--color-surface-strong)] px-3 py-3">
                    <span className="text-xs font-semibold text-[color:var(--color-muted)]">
                      {selectedSavedChatIds.length} selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!selectedSavedChatIds.length}
                        onClick={() => setDeleteSavedChatIds(selectedSavedChatIds)}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-[#111111] px-4 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}

                {deleteSavedChatIds.length ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-semibold text-red-700">
                      Delete {deleteSavedChatIds.length === 1 ? "this chat" : "selected chats"}?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700/80">
                      Deleted chats will be hidden from your saved list.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteSavedChatIds([])}
                        className="h-9 flex-1 rounded-full border border-red-200 bg-white text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteSavedChats(deleteSavedChatIds)
                        }
                        className="h-9 flex-1 rounded-full bg-red-600 text-xs font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 max-h-[430px] overflow-y-auto">
                  {bookmarkedPrivateChats.length ? (
                    <div className="flex flex-col gap-2">
                      {bookmarkedPrivateChats.map((chat) => {
                        const isSelected = selectedSavedChatIds.includes(chat.id);
                        const isRenaming = renamingSavedChatId === chat.id;

                        return (
                          <article
                            key={chat.id}
                            className={`relative rounded-2xl border border-[color:var(--color-line)] p-3 ${
                              isSelected ? "bg-[color:var(--color-brand-soft)]" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {isSavedSelectMode ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSavedChatSelection(chat.id)}
                                  className="mt-1 h-4 w-4 accent-[#111111]"
                                  aria-label={`Select ${chat.title}`}
                                />
                              ) : null}

                              <div className="min-w-0 flex-1">
                                {isRenaming ? (
                                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                                    <input
                                      type="text"
                                      value={
                                        savedChatDraftTitles[chat.id] ??
                                        chat.title
                                      }
                                      onChange={(event) =>
                                        setSavedChatDraftTitles((current) => ({
                                          ...current,
                                          [chat.id]: event.target.value,
                                        }))
                                      }
                                      className="h-10 rounded-xl border border-[color:var(--color-line)] px-3 text-sm font-medium outline-none transition focus:border-[#111111]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleSaveSavedChatTitle(chat.id)
                                      }
                                      className="h-10 rounded-full bg-[#111111] px-4 text-xs font-semibold text-white transition hover:bg-black"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRenamingSavedChatId(null);
                                        setSavedChatDraftTitles((current) => ({
                                          ...current,
                                          [chat.id]: chat.title,
                                        }));
                                      }}
                                      className="h-10 rounded-full border border-[color:var(--color-line)] px-4 text-xs font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isSavedSelectMode) {
                                        toggleSavedChatSelection(chat.id);
                                      } else {
                                        void openPrivateChat(chat.id);
                                      }
                                    }}
                                    className="block w-full text-left"
                                  >
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
                                    <span className="mt-2 block text-xs text-[color:var(--color-muted)]">
                                      {formatChatUpdatedAt(chat.updatedAtMs)}
                                    </span>
                                  </button>
                                )}
                              </div>

                              {!isSavedSelectMode ? (
                                <button
                                  type="button"
                                  aria-label="Saved chat actions"
                                  aria-expanded={activeSavedChatMenuId === chat.id}
                                  onClick={() =>
                                    setActiveSavedChatMenuId((current) =>
                                      current === chat.id ? null : chat.id,
                                    )
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-surface-strong)] hover:text-[color:var(--color-text)]"
                                >
                                  <MoreHorizontal
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              ) : null}
                            </div>

                            {activeSavedChatMenuId === chat.id ? (
                              <div className="absolute right-3 top-12 z-30 w-48 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 text-left shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingSavedChatId(chat.id);
                                    setActiveSavedChatMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                                >
                                  <SquarePen className="h-4 w-4" aria-hidden="true" />
                                  Rename chat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void exportSavedChat(chat)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                                >
                                  <FileText className="h-4 w-4" aria-hidden="true" />
                                  Export
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteSavedChatIds([chat.id]);
                                    setActiveSavedChatMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  Delete chat
                                </button>
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-[color:var(--color-surface-strong)] px-4 py-4 text-sm text-[color:var(--color-muted)]">
                      No saved chats yet. Open a chat and choose Save chat.
                    </p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[color:var(--color-background)]">

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="fixed left-4 top-[calc(env(safe-area-inset-top)+1rem)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 lg:right-8 lg:top-6">
              <Link
                href="/dsiq/mentor"
                aria-label="Turn AI Teacher on"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white px-3 text-xs font-semibold text-[color:var(--color-text)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <span>AI Teacher</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                  OFF
                </span>
              </Link>
              {messages.length ? (
                <>
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
                        onClick={readAloud}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                        {isReadingAloud ? "Stop reading" : "Read aloud"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleCurrentChatBookmark()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {isCurrentChatBookmarked ? "Remove saved chat" : "Save chat"}
                      </button>
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
                        onClick={() => void shareChat()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Share
                      </button>
                    </div>
                  ) : null}
                </div>
                </>
              ) : null}
            </div>

            <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:px-8 lg:px-10 lg:pt-8">
              <div className="mx-auto flex min-h-0 w-full max-w-[900px] flex-1 flex-col">

                {!messages.length ? (
                  <div className="flex min-h-0 flex-1 items-center justify-center pb-[calc(140px+env(safe-area-inset-bottom))] pt-4 text-center">
                    <div className="w-full max-w-2xl">
                      <h1 className="text-2xl font-semibold tracking-normal text-[color:var(--color-text)] sm:text-3xl">
                        {getGreeting(displayName, hasPreviousProgress)}
                      </h1>
                      {hasPreviousProgress ? (
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--color-muted)] sm:text-base">
                          Continue your learning journey from where you stopped.
                        </p>
                      ) : (
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--color-muted)] sm:text-base">
                          DSIQ is ready to guide your skills, lessons, missions, and opportunities.
                        </p>
                      )}
                      <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                        {welcomeActions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => void sendPromptText(action.prompt)}
                            disabled={isSending}
                            className="min-h-11 rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:border-[#111111]/30 hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {messages.length ? (
                  <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col gap-4 overflow-y-auto px-1 pb-[calc(120px+env(safe-area-inset-bottom))] text-left lg:pb-28">

                    {messages.map((message, index) => (
                      <article
                        key={message.id}
                        className={`max-w-[82%] text-sm leading-7 text-[color:var(--color-text)] ${
                          message.role === "user"
                            ? "ml-auto text-right"
                            : "ai-message mr-auto text-left"
                        }`}
                      >
                        <p className={message.role === "model" ? "ai-message" : "whitespace-pre-wrap"}>
                          {message.text}
                        </p>
                        {message.imageDataUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage({
                                dataUrl: message.imageDataUrl || "",
                                name: message.imageName || "Uploaded image",
                              });
                              setIsImagePreviewOpen(true);
                            }}
                            className="mt-2 block overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white"
                            aria-label={`Open ${message.imageName || "uploaded image"}`}
                          >
                            <img
                              src={message.imageDataUrl}
                              alt={message.imageName || "Uploaded image"}
                              className="h-28 w-28 object-cover"
                            />
                          </button>
                        ) : null}
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

              <ChatComposer
                docked
                value={prompt}
                onChange={setPrompt}
                onSubmit={(value) => void sendPromptText(value)}
                onVoiceInput={handleVoiceInput}
                isListening={isListening}
                isSending={isSending}
                placeholder="Ask DSIQ"
              />
            </div>
          </section>
        </div>

        {isImagePreviewOpen && previewImage ? (
          <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4">
            <button
              type="button"
              aria-label="Close image preview"
              className="absolute inset-0"
              onClick={() => setIsImagePreviewOpen(false)}
            />
            <div className="relative max-h-full w-full max-w-4xl">
              <button
                type="button"
                onClick={() => setIsImagePreviewOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--color-text)] transition hover:bg-gray-100"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <img
                src={previewImage.dataUrl}
                alt={previewImage.name}
                className="mx-auto max-h-[calc(100dvh-2rem)] max-w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        ) : null}

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

        {isHelpOpen ? (
          <div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/35 px-4 py-8 backdrop-blur-sm sm:items-center"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsHelpOpen(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-title"
              className="w-full max-w-lg rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="help-title"
                    className="text-lg font-semibold text-[color:var(--color-text)]"
                  >
                    Help
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted)]">
                    Quick support options for your DSIQ workspace.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close help"
                  onClick={() => setIsHelpOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 divide-y divide-[color:var(--color-line)]">
                {helpItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="flex w-full items-center gap-3 py-4 text-left transition hover:text-black"
                      onClick={() => {
                        if (item.title === "Contact Support") {
                          window.location.href =
                            "mailto:support@dsiq.app?subject=DSIQ%20Support";
                        }
                      }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[color:var(--color-text)]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[color:var(--color-muted)]">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                Close
              </button>
            </section>
          </div>
        ) : null}
      </main>
    </PrivateRoute>
  );
}
