"use client";

import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Mic,
  Plus,
  Settings,
  SlidersHorizontal,
  SquarePen,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const promptModes = ["Write", "Plan", "Research", "Learn"];

export function HomeChat() {
  const [isDesktopDrawerOpen, setIsDesktopDrawerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  function openNewChatDialog() {
    setIsDesktopDrawerOpen(false);
    setIsMobileDrawerOpen(false);
    setIsNewChatDialogOpen(true);
  }

  function startNewChat() {
    setIsNewChatDialogOpen(false);
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-background)] p-0.5 text-[color:var(--color-text)]">
      <div className="flex min-h-[calc(100vh-4px)] overflow-hidden rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-background)]">
        <aside className="relative hidden w-[72px] bg-[color:var(--color-surface-strong)] px-4 py-7 md:block">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text)] transition hover:bg-white"
            aria-label={isDesktopDrawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={isDesktopDrawerOpen}
            onClick={() => setIsDesktopDrawerOpen((value) => !value)}
          >
            {isDesktopDrawerOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
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

              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-2xl border-t border-[color:var(--color-line)] px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                onClick={() => setIsDesktopDrawerOpen(false)}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings & Help
              </Link>
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
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)] md:hidden"
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
                <Link key={item.href} href={item.href} className="transition hover:text-black">
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-sm font-medium text-white transition hover:bg-black"
              >
                Login
              </Link>
            </nav>

            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-black lg:hidden"
            >
              Login
            </Link>
          </header>

          <div className="flex flex-1 flex-col items-center px-5 pb-3 pt-[72px] sm:px-8 lg:pt-[82px]">
            <div className="w-full max-w-[760px]">
              <h1 className="text-[42px] font-normal leading-[1.18] text-[color:var(--color-text)] sm:text-[46px]">
                Meet DSIQ, your personal
                <br className="hidden sm:block" /> AI assistant
              </h1>

              <form className="mt-7 rounded-[30px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]">
                <input
                  type="text"
                  placeholder="Ask DSIQ"
                  className="h-9 w-full bg-transparent text-sm text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)]"
                />

                <div className="mt-5 flex items-center gap-5">
                  <button type="button" aria-label="Add" className="text-[#303134]">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text)]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Tools
                  </button>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-[color:var(--color-text)]"
                  >
                    Flash
                    <span className="h-1.5 w-1.5 rounded-full bg-[#111111]" />
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Microphone" className="text-[#303134]">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {promptModes.map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-5 text-base text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                  >
                    {mode}
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
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="absolute right-3 top-3 flex h-[calc(100dvh-1.5rem)] w-[min(20rem,calc(100vw-1.5rem))] flex-col justify-between rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[color:var(--color-text)]">
                  DSIQ
                </span>
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
              <Link
                href="/settings"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Settings & Help
              </Link>
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
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-black"
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
