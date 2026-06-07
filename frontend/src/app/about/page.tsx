import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "About DSIQ",
  description:
    "DSIQ is an AI teacher that helps students, developers, and dreamers move from confusion to clear action.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About DSIQ",
    description:
      "DSIQ is an AI teacher that helps students, developers, and dreamers move from confusion to clear action.",
    url: "https://dsiq.app/about",
  },
};

const helpItems = [
  {
    title: "AI Teacher",
    text: "Ask questions, get explanations, and keep learning with guidance that adapts to where you are.",
    shortLabel: "AI",
  },
  {
    title: "Roadmaps",
    text: "Turn a big goal into a practical path with clear steps, milestones, and next actions.",
    shortLabel: "RM",
  },
  {
    title: "Focus",
    text: "Cut through scattered information and stay centered on the work that matters most right now.",
    shortLabel: "FC",
  },
  {
    title: "Projects",
    text: "Build real things as you learn, so progress becomes visible, useful, and easier to keep.",
    shortLabel: "PR",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)]">
      <PublicHeader />

      <main>
        <section className="hero-grid overflow-hidden">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="space-y-8">
              <span className="inline-flex rounded-full border border-[color:var(--color-line)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-muted)]">
                Building the future of personalized learning
              </span>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                  DSIQ helps learners move from confusion to clear action.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--color-muted)]">
                  DSIQ is an AI teacher created to help students, developers,
                  and dreamers understand what to learn, why it matters, and
                  what to do next.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-full bg-[#111111] px-7 py-4 text-center text-sm font-semibold !text-white shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:bg-black"
                >
                  Start Learning
                </Link>
                <Link
                  href="/features"
                  className="rounded-full border border-[color:var(--color-line)] bg-white px-7 py-4 text-center text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  Explore Features
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-[color:var(--color-line)] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
                <div className="border-b border-[color:var(--color-line)] px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">DSIQ Teacher</p>
                      <p className="text-sm text-[color:var(--color-muted)]">
                        Personalized learning session
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                      AI
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="rounded-[1.5rem] bg-[color:var(--color-surface-strong)] p-5">
                    <p className="text-sm font-medium">Learner goal</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                      I want to become a better developer, but I do not know
                      what to study first.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#111111] p-5 text-white">
                    <p className="text-sm font-medium text-white/80">
                      DSIQ response
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">
                      Start with one focused roadmap, build a small project each
                      week, and use every question as a chance to understand the
                      concept behind the code.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[color:var(--color-line)] p-4">
                      <p className="text-sm font-medium">Next action</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                        Build a simple app and explain each part back to DSIQ.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-[color:var(--color-line)] p-4">
                      <p className="text-sm font-medium">Learning mode</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                        Guided practice with feedback and project milestones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Problem
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Information is everywhere. Guidance is missing.
            </h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--color-muted)]">
              Learners can find endless videos, courses, threads, and tools, but
              still feel stuck when it is time to choose a direction. DSIQ exists
              to turn overwhelming information into a path a person can follow.
            </p>
          </article>

          <article
            id="mission"
            className="scroll-mt-24 rounded-[2rem] bg-[#111111] p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Mission
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Make quality personal education available to anyone, anywhere.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Every learner deserves patient explanations, useful structure, and
              feedback that meets them where they are, not just another pile of
              content to sort through alone.
            </p>
          </article>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              How DSIQ Helps
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              A personal teacher for direction, practice, and momentum.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {helpItems.map((item) => {
              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-7 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)] text-sm font-semibold text-[color:var(--color-text)]">
                    {item.shortLabel}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-8">
          <div className="rounded-[2.5rem] border border-[color:var(--color-line)] bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(0,0,0,0.08)] lg:px-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Vision
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
              A world where every learner has a personal teacher.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-muted)]">
              DSIQ is built for the student chasing clarity, the developer
              sharpening a craft, and the dreamer ready to turn curiosity into
              progress.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#111111] px-7 py-4 text-sm font-semibold !text-white transition hover:bg-black"
              >
                Create Account
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[color:var(--color-line)] px-7 py-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
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
