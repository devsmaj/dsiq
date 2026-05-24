import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how DSIQ takes users from account setup to onboarding, AI path generation, weekly missions, and coaching.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How DSIQ Works",
    description:
      "See how DSIQ takes users from account setup to onboarding, AI path generation, weekly missions, and coaching.",
    url: "https://dsiq.app/how-it-works",
  },
};

const steps = [
  {
    title: "Step 1: Create account",
    text: "Start by creating your DSIQ account so your path, missions, and recommendations can be saved over time.",
  },
  {
    title: "Step 2: Answer simple questions",
    text: "Tell DSIQ about your goals, skills, interests, available time, and budget so the system can understand your starting point.",
  },
  {
    title: "Step 3: Get AI path",
    text: "Receive a personalized path with relevant opportunities, skill direction, and recommended next actions.",
  },
  {
    title: "Step 4: Complete missions",
    text: "Follow your weekly missions to make visible progress and stay focused on what matters most.",
  },
  {
    title: "Step 5: Grow with coaching",
    text: "Use the AI coach to stay accountable, recover from missed tasks, and adapt your strategy as you grow.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white px-8 py-12 text-[color:var(--color-text)] shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            How It Works
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            DSIQ guides users from first questions to focused action.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
            The process is simple: understand the user, generate a path, and
            keep momentum alive through missions and coaching.
          </p>
        </section>

        <section className="mt-6 grid gap-6">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)] text-lg font-semibold text-[color:var(--color-text)]">
                  0{index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    {step.title}
                  </p>
                  <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                    {step.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
