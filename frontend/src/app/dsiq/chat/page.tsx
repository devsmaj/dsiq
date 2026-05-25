"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Compass,
  FolderKanban,
  HelpCircle,
  LayoutList,
  Menu,
  Mic,
  Moon,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { PrivateRoute } from "@/components/private-route";
import { getPostAuthPath } from "@/lib/auth-routing";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: Plus },
  { label: "Search Chats", href: "/dsiq/chat", icon: Search },
  { label: "DSIQ Coach", href: "/coach", icon: Bot },
  { label: "Learning Roadmap", href: "/coach", icon: Compass },
  { label: "Weekly Missions", href: "/missions", icon: Target },
  { label: "Projects", href: "/dsiq/chat", icon: FolderKanban },
  { label: "Opportunities", href: "/opportunities", icon: Rocket },
  { label: "Progress Tracker", href: "/progress", icon: TrendingUp },
  { label: "Saved Chats", href: "/dsiq/chat", icon: LayoutList },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const collapsedItems = [
  sidebarItems[0],
  sidebarItems[1],
  sidebarItems[2],
  sidebarItems[4],
  sidebarItems[7],
] as const;

const suggestedPrompts = [
  "Build my roadmap",
  "Create weekly mission",
  "Find opportunities",
  "Improve my portfolio",
  "Help me learn programming",
];

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
  const { answers, isProfileLoading, profile, user } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Saleh";
  const firstName = displayName.split(" ")[0] || "Saleh";

  useEffect(() => {
    async function routeIncompleteUsers() {
      if (!user || isProfileLoading) {
        return;
      }

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/onboarding") {
        router.replace("/onboarding");
      }
    }

    void routeIncompleteUsers();
  }, [authMode, isProfileLoading, router, user]);

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message) {
      return;
    }

    setMessages((current) => [...current, message]);
    setPrompt("");
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
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
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
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
  }

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
              className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-8 pt-24 sm:px-8 lg:justify-center lg:py-10">
              <div className="mx-auto w-full max-w-[820px] text-center">
                <h1 className="text-[32px] font-normal leading-[1.18] tracking-tight sm:text-[40px]">
                  Welcome back, {firstName}.
                  <span className="block">
                    What do you want to work on today?
                  </span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[color:var(--color-muted)] sm:text-base">
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
                  <input
                    type="text"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Ask DSIQ anything..."
                    className="h-9 w-full bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)]"
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Add"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)]"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div className="flex-1" />
                    <button
                      type="button"
                      aria-label="Use microphone"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)]"
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="submit"
                      aria-label="Send"
                      disabled={!prompt.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
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
      </main>
    </PrivateRoute>
  );
}
