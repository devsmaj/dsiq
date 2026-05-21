import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare the DSIQ free and pro plans, what is included, and common pricing questions before you get started.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "DSIQ Pricing",
    description:
      "Compare the DSIQ free and pro plans, what is included, and common pricing questions before you get started.",
    url: "https://dsiq.app/pricing",
  },
};

const includedItems = [
  "Guided onboarding and AI path generation",
  "Weekly missions and progress check-ins",
  "Opportunity recommendations matched to your goals",
  "Coach insights for focus, accountability, and next steps",
];

const faqItems = [
  {
    question: "Can I start with the free plan?",
    answer:
      "Yes. The free plan is designed to help users experience DSIQ before upgrading for deeper guidance and stronger accountability features.",
  },
  {
    question: "What changes in the Pro plan?",
    answer:
      "Pro unlocks fuller coaching support, richer mission planning, stronger personalization, and deeper opportunity analysis.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Yes. Users can begin with the free experience and move to Pro when they want more advanced support.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] px-8 py-12 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Start free and upgrade when you need stronger coaching support.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            DSIQ is designed to help users get moving quickly, then grow into a
            more personalized and accountable experience over time.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Free plan
            </p>
            <p className="mt-5 text-5xl font-semibold tracking-tight text-[color:var(--color-text)]">
              NGN 0
            </p>
            <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
              A simple way to begin your journey, explore your direction, and
              experience DSIQ guidance.
            </p>
          </article>

          <article className="rounded-[2rem] bg-[color:var(--color-brand)] p-8 text-white shadow-[0_22px_50px_rgba(0,122,102,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              Pro plan
            </p>
            <p className="mt-5 text-5xl font-semibold tracking-tight">
              Premium
            </p>
            <p className="mt-4 text-sm leading-8 text-white/82">
              Deeper coaching, stronger accountability, and more personalized
              mission and opportunity planning.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            What is included
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {includedItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-[color:var(--color-surface)] px-4 py-4"
              >
                <p className="text-sm leading-7 text-[color:var(--color-text)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            FAQ
          </p>
          <div className="mt-6 space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-[color:var(--color-line)] px-5 py-5"
              >
                <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
                  {item.question}
                </h2>
                <p className="mt-3 text-sm leading-8 text-[color:var(--color-muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
