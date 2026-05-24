import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore DSIQ features including AI opportunity analysis, weekly missions, coaching, progress tracking, and learning roadmaps.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "DSIQ Features",
    description:
      "Explore DSIQ features including AI opportunity analysis, weekly missions, coaching, progress tracking, and learning roadmaps.",
    url: "https://dsiq.app/features",
  },
};

const featureSections = [
  {
    title: "AI Opportunity Analysis",
    text: "DSIQ evaluates your goals, skills, interests, and constraints to surface opportunities that make sense for your real path.",
  },
  {
    title: "Weekly Missions",
    text: "Get structured tasks each week so your growth is not based on random motivation but on practical momentum.",
  },
  {
    title: "Accountability Coach",
    text: "Stay guided with AI coaching that helps you choose the next action, recover from missed steps, and keep moving forward.",
  },
  {
    title: "Progress Tracking",
    text: "Measure your consistency, completed actions, and goal alignment so you can see what is working over time.",
  },
  {
    title: "Learning Roadmaps",
    text: "Receive practical roadmaps shaped around your time, budget, and current level so learning becomes useful, not overwhelming.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white px-8 py-12 text-[color:var(--color-text)] shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Features
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Everything in DSIQ is designed to turn direction into action.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
            From opportunity analysis to mission planning and progress
            tracking, DSIQ helps users move with more focus and less confusion.
          </p>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {featureSections.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                {item.title}
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {item.text}
              </p>
            </article>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
