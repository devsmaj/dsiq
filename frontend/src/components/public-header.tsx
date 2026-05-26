"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { DsiqLogo } from "@/components/dsiq-logo";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  function showNavigationLoading() {
    setIsNavigating(true);
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
      {isNavigating ? (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[color:var(--color-line)]">
          <span className="block h-full w-1/3 animate-[dsiq-loading-bar_900ms_ease-in-out_infinite] bg-[#111111]" />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <DsiqLogo href="/" />

          <nav className="hidden items-center gap-5 text-[13px] font-medium text-[color:var(--color-text)] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-[color:var(--color-surface-strong)] hover:text-black active:bg-[color:var(--color-line)]"
                onClick={showNavigationLoading}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium !text-white transition hover:bg-black"
            >
              Log in
            </Link>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="public-mobile-menu"
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
            id="public-mobile-menu"
            className="mobile-menu-panel mt-4 flex flex-col justify-between p-4 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] active:bg-[color:var(--color-line)]"
                  onClick={showNavigationLoading}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-[color:var(--color-line)] pt-4">
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-black bg-[#111111] px-5 text-sm font-medium !text-white transition hover:bg-black"
              >
                Log in
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
