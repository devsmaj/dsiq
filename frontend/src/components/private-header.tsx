"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DsiqLogo } from "@/components/dsiq-logo";

const privateNavItems = [
  { href: "/dsiq/chat", label: "Chat" },
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
          <DsiqLogo href="/dsiq/chat" />

          <nav className="hidden items-center gap-7 lg:flex">
            {privateNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link"
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
              className="btn-secondary px-5 py-2.5"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] lg:hidden"
            aria-label={isOpen ? "Close private menu" : "Open private menu"}
            aria-expanded={isOpen}
            aria-controls="private-mobile-menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {isOpen ? (
          <div
            id="private-mobile-menu"
            className="mobile-menu-panel mt-4 flex flex-col justify-between p-4 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {privateNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
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
                className="btn-secondary"
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
