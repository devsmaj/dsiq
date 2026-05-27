import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

const privacySections = [
  {
    title: "What Data DSIQ Collects",
    body: "DSIQ may collect the information you provide, such as your name, email, role, goals, onboarding answers, learning preferences, and profile details.",
  },
  {
    title: "Authentication Information",
    body: "When you sign in, we use authentication information to create and protect your account. If you use Google login, Google helps confirm your identity.",
  },
  {
    title: "Chat and Usage Data",
    body: "We may store your chats, saved conversations, learning activity, and product interactions so DSIQ can personalize your experience and help you continue where you left off.",
  },
  {
    title: "Cookies and Local Storage",
    body: "DSIQ may use browser storage to remember sessions, preferences, recent activity, and features that make the app feel faster and more personal.",
  },
  {
    title: "How Data Is Used",
    body: "We use data to provide the app, personalize your AI teacher experience, improve learning recommendations, support account access, and understand how the product is performing.",
  },
  {
    title: "Security Protection",
    body: "We use reasonable security practices and trusted services to help protect user data. No online service can guarantee perfect security, but we design DSIQ with privacy and safety in mind.",
  },
  {
    title: "Third-Party Services",
    body: "DSIQ may use trusted services such as Firebase for authentication and data storage, and Google login when you choose to sign in with Google.",
  },
  {
    title: "User Rights",
    body: "You can review, update, or correct your profile information where the product allows it. You can also contact DSIQ if you need help with your account or data.",
  },
  {
    title: "Data Deletion Request",
    body: "If you want your account or personal data deleted, contact the DSIQ team through the contact page or official support channel. We will review and respond to the request.",
  },
  {
    title: "Contact Information",
    body: "For privacy questions, data requests, or account concerns, contact the DSIQ team through the contact page or the official support channel provided by DSIQ.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            How DSIQ protects your information.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-muted)] sm:text-lg">
            DSIQ is built around trust. This page explains what we collect, why
            we use it, and how you stay in control.
          </p>
        </section>

        <section className="mt-9 space-y-8 sm:mt-12">
          {privacySections.map((section) => (
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
