"use client";

import { DsiqLogo } from "@/components/dsiq-logo";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[color:var(--color-background)] px-4 py-10 sm:px-6">
      <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
        <DsiqLogo href="/" />
      </div>

      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight text-[color:var(--color-text)]">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-6 text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>

        <div className="w-full">
          {children}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-xs text-[color:var(--color-muted)]">
          <Link href="/terms" className="underline underline-offset-2 hover:text-[color:var(--color-text)]">
            {t("auth.terms")}
          </Link>
          <span>|</span>
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[color:var(--color-text)]">
            {t("auth.privacyPolicy")}
          </Link>
        </div>
      </section>
    </main>
  );
}
