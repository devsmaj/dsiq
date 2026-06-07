import Link from "next/link";
import { DsiqLogo } from "@/components/dsiq-logo";

const productLinks = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/about#mission", label: "Mission" },
];

const communityLinks = [
  { href: "https://github.com/devsmaj/dsiq", label: "GitHub" },
  { href: "https://www.linkedin.com/company/dsiq", label: "LinkedIn" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <DsiqLogo href="/" />
          <p className="max-w-sm text-sm leading-7 text-[color:var(--color-muted)]">
            Your personal AI teacher for learning, skills, and growth.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Product
          </p>
          <div className="flex flex-col gap-3">
            {productLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Community
          </p>
          <div className="flex flex-col gap-3">
            {communityLinks.map((item) => {
              const isExternal = item.href.startsWith("http");

              return isExternal ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Legal
          </p>
          <div className="flex flex-col gap-3">
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-line)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-[color:var(--color-muted)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>© 2026 DSIQ</span>
          <span>Part of the SMAJ Ecosystem</span>
        </div>
      </div>
    </footer>
  );
}
