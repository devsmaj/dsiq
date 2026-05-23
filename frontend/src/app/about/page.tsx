import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn why DSIQ exists, who it helps, and how it connects to the SMAJ Ecosystem mission.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About DSIQ",
    description:
      "Learn why DSIQ exists, who it helps, and how it connects to the SMAJ Ecosystem mission.",
    url: "https://dsiq.app/about",
  },
};

const featureCards = [
  "AI opportunity analysis tailored to your goals",
  "Weekly missions that turn plans into real progress",
  "Accountability coaching that keeps you moving",
  "Learning roadmaps built around your time and budget",
];

const targetUsers = ["Students", "Developers", "Freelancers", "Entrepreneurs"];

const steps = [
  "Answer a few simple questions about your goals, skills, interests, and time.",
  "Receive a practical AI path with clear opportunities that fit your reality.",
  "Follow weekly missions, coaching prompts, and progress checkpoints.",
];

export default function AboutPage() {
  return (
    <div className="bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <PublicHeader />

      <main>
        <section className="hero-grid overflow-hidden">
          <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="space-y-8">
              <span className="inline-flex rounded-full border border-[color:var(--color-brand-soft)] bg-white/80 px-4 py-2 text-sm font-medium text-[color:var(--color-brand)]">
                Your AI coach for skills, opportunities, and action
              </span>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                  Stop guessing your next move. Start building a path that fits
                  you.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--color-muted)]">
                  DSIQ helps you discover what to learn, which opportunities to
                  pursue, and what action to take next with focused AI guidance.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-center text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.26)] transition hover:bg-[color:var(--color-brand-strong)]"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-full border border-[color:var(--color-line)] px-7 py-4 text-center text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--color-brand-soft)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_rgba(11,37,39,0.12)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-text)]">
                      DSIQ Coach
                    </p>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      Personal roadmap preview
                    </p>
                  </div>
                  <span className="rounded-full bg-[color:var(--color-cream)] px-3 py-1 text-xs font-semibold text-[color:var(--color-brand)]">
                    Live AI
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-[color:var(--color-surface-strong)] p-4">
                    <p className="text-sm font-medium text-[color:var(--color-text)]">
                      Goal
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                      Build income through design, frontend skills, and remote
                      opportunities in the next 90 days.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-[color:var(--color-line)] p-4">
                      <p className="text-sm font-medium text-[color:var(--color-text)]">
                        This week
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                        Complete 3 portfolio tasks and apply to 2 remote
                        opportunities.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-[color:var(--color-line)] p-4">
                      <p className="text-sm font-medium text-[color:var(--color-text)]">
                        Best fit
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                        Product design gigs, scholarships, and startup
                        internships.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[color:var(--color-text)] p-5 text-white">
                    <p className="text-sm font-medium text-white/80">
                      Coach advice
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">
                      You do not need more random courses. You need a focused
                      path, clear missions, and consistent action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Problem
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Most people want progress but do not know the right next action.
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
              They jump between skills, opportunities, and motivational content
              without a clear system. That leads to confusion, inconsistency,
              and wasted time.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[color:var(--color-text)] p-8 text-white shadow-[0_20px_60px_rgba(11,37,39,0.18)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Solution
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              DSIQ turns ambition into a guided, accountable action plan.
            </h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              With onboarding, coaching, personalized missions, and opportunity
              matching, DSIQ helps users move from uncertainty to direction.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              How DSIQ Works
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              A simple path from questions to consistent growth.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step}
                className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-7 shadow-[0_18px_40px_rgba(11,37,39,0.05)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-lg font-semibold text-[color:var(--color-brand)]">
                  0{index + 1}
                </span>
                <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">
                  {step}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                Features
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Built for direction, momentum, and accountability.
              </h2>
            </div>
            <Link
              href="/features"
              className="text-sm font-semibold text-[color:var(--color-brand)]"
            >
              Explore all features
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <article
                key={feature}
                className="rounded-[2rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-brand)] text-white">
                    +
                  </span>
                  <p className="text-lg leading-8 text-[color:var(--color-text)]">
                    {feature}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#0b2527_0%,#11484a_100%)] px-8 py-12 text-white lg:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Target Users
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {targetUsers.map((user) => (
                <span
                  key={user}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium"
                >
                  {user}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Pricing Preview
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              Start free, upgrade when you need deeper guidance.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                Free
              </p>
              <p className="mt-5 text-4xl font-semibold">NGN 0</p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
                Basic onboarding, limited coach prompts, and early opportunity
                recommendations.
              </p>
            </article>

            <article className="rounded-[2rem] bg-[color:var(--color-brand)] p-8 text-white shadow-[0_22px_50px_rgba(0,122,102,0.24)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Pro
              </p>
              <p className="mt-5 text-4xl font-semibold">Premium</p>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Full AI coaching, stronger accountability, weekly missions, and
                personalized opportunity analysis.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-8">
          <div className="rounded-[2.5rem] border border-[color:var(--color-line)] bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(11,37,39,0.08)] lg:px-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Call To Action
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
              Build your next chapter with guidance that matches your reality.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-muted)]">
              DSIQ helps you move from confusion to clear action with coaching,
              missions, and opportunities designed around your goals.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-strong)]"
              >
                Create Account
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[color:var(--color-line)] px-7 py-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
