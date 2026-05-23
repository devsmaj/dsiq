"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { DsiqLogo } from "@/components/dsiq-logo";

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
          <DsiqLogo href="/" />

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
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
            <Link
              href="/login"
              className="btn-secondary px-5 py-2.5"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="btn-primary px-5 py-2.5"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] lg:hidden"
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
          <div id="public-mobile-menu" className="mobile-menu-panel mt-4 p-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
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

            <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
              <Link
                href="/login"
                className="btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/login"
                className="btn-primary"
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
