import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

const termsSections = [
  {
    title: "Acceptance of Terms",
    body: "By using DSIQ, you agree to use the product responsibly and follow these terms. If you do not agree, you should stop using the service.",
  },
  {
    title: "User Responsibilities",
    body: "You are responsible for the information you provide, the choices you make in your learning journey, and how you use recommendations from DSIQ.",
  },
  {
    title: "Acceptable Use",
    body: "Use DSIQ for learning, planning, projects, and personal growth. Do not use it to harm others, break the law, abuse the platform, or attempt to access accounts or data that do not belong to you.",
  },
  {
    title: "AI-Generated Guidance",
    body: "DSIQ uses AI to provide educational guidance, study support, and productivity suggestions. AI responses may be incomplete or incorrect, so you should review important information before relying on it.",
  },
  {
    title: "Account Security",
    body: "Keep your login details safe and tell us if you believe your account has been accessed without permission. You are responsible for activity that happens through your account.",
  },
  {
    title: "Termination or Suspension",
    body: "We may suspend or limit access if an account is used in a way that risks user safety, platform security, or violates these terms.",
  },
  {
    title: "Updates to Terms",
    body: "As DSIQ grows, these terms may change. When we make meaningful updates, we will make the new version available on this page.",
  },
  {
    title: "Contact Information",
    body: "For questions about these terms, contact the DSIQ team through the contact page or the official support channel provided by DSIQ.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <Link
          href="/"
          className="mb-7 inline-flex rounded-full border border-[color:var(--color-line)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] sm:hidden"
        >
          Back
        </Link>

        <section className="border-b border-[color:var(--color-line)] pb-8 sm:pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            Terms of Use
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Simple rules for using DSIQ.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-muted)] sm:text-lg">
            These terms explain how to use DSIQ in a safe, respectful, and
            productive way. They are written to be clear, not confusing.
          </p>
        </section>

        <section className="mt-9 space-y-8 sm:mt-12">
          {termsSections.map((section) => (
            <article key={section.title} className="border-b border-[color:var(--color-line)] pb-7 last:border-b-0">
              <h2 className="text-xl font-semibold tracking-tight text-[#111111]">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-[color:var(--color-text)]">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
