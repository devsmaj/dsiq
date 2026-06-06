"use client";

import Link from "next/link";
import { Bot, FileText, GraduationCap, Menu, Search, SquarePen, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  listPrivateChats,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { dsiqLogoSrc } from "@/lib/public-asset";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/mentor?panel=search", icon: Search },
  { label: "AI Teacher", href: "/dsiq/mentor", icon: Bot },
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

  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "there";
  const profileImageUrl =
    profile?.profileImageUrl || answers?.profileImageUrl || user?.photoURL || "";

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
      <aside className="flex h-full w-[292px] max-w-[calc(100vw-24px)] flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-3 py-4">
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
                  <Link
                    key={chat.id}
                    href={getRecentHref(chat)}
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
                      {getChatTypeIcon(chat)} {getChatTypeLabel(chat)}
                    </span>
                    {chat.lastMessage ? (
                      <span className="mt-0.5 block truncate text-xs text-[color:var(--color-muted)]">
                        {chat.lastMessage}
                      </span>
                    ) : null}
                  </Link>
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
    <main className="min-h-[100dvh] overflow-hidden bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <div className="flex min-h-[100dvh]">
        <div className="hidden lg:block">{renderSidebar()}</div>
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
        <section className="relative min-w-0 flex-1">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="fixed left-4 top-[calc(env(safe-area-inset-top)+1rem)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          {children}
        </section>
      </div>
    </main>
  );
}
