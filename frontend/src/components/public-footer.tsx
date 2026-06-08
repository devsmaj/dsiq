"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { DsiqLogo } from "@/components/dsiq-logo";

const productLinks = [
  { href: "/about", labelKey: "public.nav.about" },
  { href: "/features", labelKey: "public.nav.features" },
  { href: "/how-it-works", labelKey: "public.nav.howItWorks" },
  { href: "/about#mission", labelKey: "footer.mission" },
];

const communityLinks = [
  { href: "https://github.com/devsmaj/dsiq", label: "GitHub" },
  { href: "https://www.linkedin.com/company/dsiq", label: "LinkedIn" },
  { href: "/contact", labelKey: "public.nav.contact" },
];

const legalLinks = [
  { href: "/privacy", labelKey: "footer.privacy" },
  { href: "/terms", labelKey: "footer.terms" },
];

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <DsiqLogo href="/" />
          <p className="max-w-sm text-sm leading-7 text-[color:var(--color-muted)]">
            {t("footer.description")}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t("footer.product")}
          </p>
          <div className="flex flex-col gap-3">
            {productLinks.map((item) => (
              <Link
                key={item.labelKey}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t("footer.community")}
          </p>
          <div className="flex flex-col gap-3">
            {communityLinks.map((item) => {
              const isExternal = item.href.startsWith("http");
              const label =
                "labelKey" in item && item.labelKey
                  ? t(item.labelKey)
                  : "label" in item
                    ? item.label
                    : "";

              return isExternal ? (
                <a
                  key={label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={item.href}
                  className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t("footer.legal")}
          </p>
          <div className="flex flex-col gap-3">
            {legalLinks.map((item) => (
              <Link
                key={item.labelKey}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-line)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-[color:var(--color-muted)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>© 2026 DSIQ</span>
          <span>{t("footer.ecosystem")}</span>
        </div>
      </div>
    </footer>
  );
}
