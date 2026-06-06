"use client";

import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Menu,
  MoreHorizontal,
  Save,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import {
  deletePrivateChat,
  listPrivateChats,
  updatePrivateChatBookmark,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { dsiqLogoSrc } from "@/lib/public-asset";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/mentor?panel=search", icon: Search },
  { label: "Learning Roadmap", href: "/dsiq/roadmap", icon: GraduationCap },
  { label: "Saved Chats", href: "/dsiq/saved", icon: FileText },
] as const;

function getRecentHref(chat: PrivateChatSummary) {
  const path = chat.chatType === "teacher" ? "/dsiq/mentor" : "/dsiq/chat";
  return `${path}?chatId=${encodeURIComponent(chat.id)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getChatTypeLabel(chat: PrivateChatSummary) {
  return chat.chatType === "teacher" ? "AI Teacher" : "Normal Chat";
}

function getChatTypeIcon(chat: PrivateChatSummary) {
  return chat.chatType === "teacher" ? "🎓" : "💬";
}

export function DsiqAppSidebar({
  activeHref,
  children,
}: {
  activeHref: string;
  children: React.ReactNode;
}) {
  const { answers, profile, user } = useUserProfile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<PrivateChatSummary[]>([]);
  const [activeRecentChatMenuId, setActiveRecentChatMenuId] = useState<string | null>(null);
  const [confirmingRecentDeleteChatId, setConfirmingRecentDeleteChatId] = useState<string | null>(null);

  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "there";
  const profileImageUrl =
    profile?.profileImageUrl || answers?.profileImageUrl || user?.photoURL || "";
  const shellStyle = {
    "--dsiq-sidebar-offset": "292px",
  } as CSSProperties;

  async function refreshRecentChats() {
    if (!user) {
      setRecentChats([]);
      return;
    }

    setRecentChats((await listPrivateChats(user.uid)).slice(0, 3));
  }

  async function toggleRecentChatBookmark(chat: PrivateChatSummary) {
    if (!user) {
      return;
    }

    await updatePrivateChatBookmark({
      chatId: chat.id,
      isBookmarked: !chat.isBookmarked,
      uid: user.uid,
    });
    setActiveRecentChatMenuId(null);
    setConfirmingRecentDeleteChatId(null);
    await refreshRecentChats();
  }

  async function deleteRecentChat(chatId: string) {
    if (!user) {
      return;
    }

    await deletePrivateChat({
      chatId,
      uid: user.uid,
    });
    setActiveRecentChatMenuId(null);
    setConfirmingRecentDeleteChatId(null);
    await refreshRecentChats();
  }

  useEffect(() => {
    async function loadRecentChats() {
      if (!user) {
        setRecentChats([]);
        return;
      }

      setRecentChats((await listPrivateChats(user.uid)).slice(0, 3));
    }

    void loadRecentChats();
  }, [user]);

  function renderSidebar(mobile = false) {
    return (
      <aside className="flex h-[100dvh] w-[292px] max-w-[calc(100vw-24px)] flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-3 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dsiq/chat"
            className="flex h-12 items-center gap-3 rounded-2xl px-3 text-[color:var(--color-text)] transition hover:bg-white"
            aria-label="DSIQ chat"
          >
            <img src={dsiqLogoSrc} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <span className="text-sm font-semibold tracking-[0.02em]">DSIQ</span>
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
          ) : null}
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href.split("?")[0] === activeHref;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (mobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm text-[color:var(--color-text)] transition hover:bg-white ${
                  isActive
                    ? "border border-[#111111]/10 bg-white font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                    : "font-medium"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mt-5 border-t border-[color:var(--color-line)] pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              Recent
            </p>
            <p className="mb-2 px-3 text-[11px] leading-4 text-[color:var(--color-muted)]">
              Latest 3 chats across DSIQ.
            </p>
            {recentChats.length ? (
              <div className="flex flex-col gap-1">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="group relative rounded-2xl pr-10 transition hover:bg-white"
                  >
                    <Link
                      href={getRecentHref(chat)}
                      onClick={() => {
                        if (mobile) {
                          setIsMobileSidebarOpen(false);
                        }
                      }}
                      className="block w-full px-3 py-2.5 text-left"
                    >
                      <span className="block truncate text-sm font-medium text-[color:var(--color-text)]">
                        {chat.title}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold text-[color:var(--color-muted)]">
                        {getChatTypeIcon(chat)} {getChatTypeLabel(chat)}
                      </span>
                      {chat.lastMessage ? (
                        <span className="mt-0.5 block truncate text-xs text-[color:var(--color-muted)]">
                          {chat.lastMessage}
                        </span>
                      ) : null}
                    </Link>
                    <button
                      type="button"
                      aria-label={`More actions for ${chat.title}`}
                      aria-expanded={activeRecentChatMenuId === chat.id}
                      onClick={() => {
                        setConfirmingRecentDeleteChatId(null);
                        setActiveRecentChatMenuId((current) =>
                          current === chat.id ? null : chat.id,
                        );
                      }}
                      className="absolute right-1.5 top-2 flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-surface-strong)] hover:text-[color:var(--color-text)]"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {activeRecentChatMenuId === chat.id ? (
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
                                onClick={() => void deleteRecentChat(chat.id)}
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
                              onClick={() => void toggleRecentChatBookmark(chat)}
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
            ) : (
              <p className="px-3 text-xs leading-5 text-[color:var(--color-muted)]">
                Recent chats will appear here.
              </p>
            )}
          </div>
        </nav>

        <Link
          href="/profile"
          className="mt-3 flex items-center gap-3 border-t border-[color:var(--color-line)] px-3 py-4 transition hover:bg-white"
        >
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white">
              {getInitials(displayName) || "D"}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[color:var(--color-text)]">
              {displayName}
            </span>
            <span className="block text-xs text-[color:var(--color-muted)]">Member</span>
          </span>
        </Link>
      </aside>
    );
  }

  return (
    <main
      className="min-h-[100dvh] overflow-x-hidden bg-[color:var(--color-background)] text-[color:var(--color-text)]"
      style={shellStyle}
    >
      <div className="min-h-[100dvh]">
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:h-[100dvh]">{renderSidebar()}</div>
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-black/25"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0">{renderSidebar(true)}</div>
          </div>
        ) : null}
        <section className="relative min-w-0 lg:pl-[var(--dsiq-sidebar-offset)]">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`fixed left-4 top-[calc(env(safe-area-inset-top)+1rem)] z-40 h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden ${
              isMobileSidebarOpen ? "hidden" : "flex"
            }`}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          {children}
        </section>
      </div>
    </main>
  );
}
