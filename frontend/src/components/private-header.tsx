"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { DsiqLogo } from "@/components/dsiq-logo";

const privateNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coach", label: "Coach" },
  { href: "/missions", label: "Missions" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

export function PrivateHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <DsiqLogo href="/dashboard" />

          <nav className="hidden items-center gap-7 lg:flex">
            {privateNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[color:var(--color-muted)] transition hover:text-[color:var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-[color:var(--color-line)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-3 text-[color:var(--color-text)] lg:hidden"
            aria-label={isOpen ? "Close private menu" : "Open private menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em]">
              {isOpen ? "CLOSE" : "MENU"}
            </span>
          </button>
        </div>

        {isOpen ? (
          <div className="mt-4 rounded-[1.75rem] border border-[color:var(--color-line)] bg-white p-4 shadow-[0_18px_40px_rgba(11,37,39,0.08)] lg:hidden">
            <nav className="flex flex-col gap-2">
              {privateNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-[color:var(--color-line)] pt-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full rounded-full border border-[color:var(--color-line)] px-5 py-3 text-center text-sm font-medium text-[color:var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
