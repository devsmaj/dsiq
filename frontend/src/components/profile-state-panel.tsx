"use client";

import Link from "next/link";

type ProfileStatePanelProps = {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  tone?: "default" | "error";
};

export function ProfileStatePanel({
  title,
  body,
  actionHref,
  actionLabel,
  tone = "default",
}: ProfileStatePanelProps) {
  const isError = tone === "error";

  return (
    <section
      className={`rounded-[2rem] border px-6 py-5 shadow-[0_18px_50px_rgba(11,37,39,0.08)] ${
        isError
          ? "border-[#e8b5b5] bg-[#fff5f5]"
          : "border-[color:var(--color-line)] bg-white"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-[0.18em] ${
          isError ? "text-[#9b3c3c]" : "text-[color:var(--color-muted)]"
        }`}
      >
        {title}
      </p>
      <p
        className={`mt-3 text-sm leading-7 ${
          isError ? "text-[#7a2d2d]" : "text-[color:var(--color-text)]"
        }`}
      >
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-full bg-[color:var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-strong)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
