"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-[color:var(--color-surface)]/85 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text)]">
              DSIQ
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
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
            <Link
              href="/login"
              className="rounded-full border border-[color:var(--color-line)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[color:var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,122,102,0.28)] transition hover:bg-[color:var(--color-brand-strong)]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-3 text-[color:var(--color-text)] lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
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
              {navItems.map((item) => (
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

            <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
              <Link
                href="/login"
                className="rounded-full border border-[color:var(--color-line)] px-5 py-3 text-center text-sm font-medium text-[color:var(--color-text)]"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[color:var(--color-brand)] px-5 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
