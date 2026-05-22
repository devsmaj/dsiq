"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Mic, Plus, Send, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { PrivateRoute } from "@/components/private-route";
import { useUserProfile } from "@/lib/use-user-profile";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coach", label: "AI Coach" },
  { href: "/missions", label: "Missions" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

const quickActions = [
  "Find my best opportunity",
  "Create weekly missions",
  "Check my progress",
  "Build my learning path",
];

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useUserProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials =
    user?.displayName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "S";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#F4F7FB] text-[#111827]">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-[#E5E7EB] bg-[#F4F7FB]/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#111827] transition hover:bg-white"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link href="/dashboard" className="text-lg font-semibold tracking-[0.16em] text-[#111827]">
              DSIQ
            </Link>

            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10A37F] text-sm font-semibold text-white shadow-sm"
            >
              {initials}
            </Link>
          </div>
        </header>

        <div
          className={`fixed inset-0 z-50 bg-black/25 transition-opacity ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[82vw] max-w-80 border-r border-[#E5E7EB] bg-white px-5 py-5 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold tracking-[0.16em]">DSIQ</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#F4F7FB]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#F4F7FB]"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-[#111827] transition hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </aside>

        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-36 pt-24 sm:px-6 lg:px-8">
          <section className="flex flex-1 flex-col justify-center py-8 sm:py-12 lg:py-16">
            <h1 className="mx-auto max-w-5xl text-center text-4xl font-medium leading-tight text-[#111827] sm:text-5xl lg:text-6xl">
              I can help you find opportunities, build your path, and stay accountable.
              What should we do?
            </h1>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mx-auto lg:mt-14 lg:w-full lg:max-w-5xl lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-lg border border-[#E5E7EB] bg-white p-5 text-left text-sm font-medium leading-6 text-[#111827] shadow-sm transition hover:border-[#10A37F] hover:shadow-md"
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#F4F7FB] via-[#F4F7FB] to-transparent px-4 pb-4 pt-8 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E5E7EB] bg-white p-3 shadow-[0_18px_45px_rgba(17,24,39,0.12)]">
            <div className="flex items-end gap-2">
              <button
                type="button"
                aria-label="Add attachment"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#111827]"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>

              <textarea
                rows={1}
                placeholder="Ask DSIQ"
                className="min-h-12 flex-1 resize-none bg-transparent px-1 py-3 text-base text-[#111827] outline-none placeholder:text-[#6B7280]"
              />

              <button
                type="button"
                className="mb-1 hidden rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-[#10A37F] sm:inline-flex"
              >
                Coach
              </button>

              <button
                type="button"
                aria-label="Use microphone"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#111827]"
              >
                <Mic className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label="Send message"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10A37F] text-white transition hover:bg-[#0D8C6D]"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
