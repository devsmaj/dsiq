import { PrivateRoute } from "@/components/private-route";

const questionCards = [
  {
    title: "Goal question",
    prompt: "What are you trying to achieve in the next 3 to 12 months?",
    helper: "Choose a primary direction so DSIQ can build a focused path.",
    options: [
      "Get a remote job",
      "Start freelancing",
      "Grow a business idea",
      "Learn a high-value skill",
    ],
  },
  {
    title: "Skills question",
    prompt: "Which skills do you already have or want to improve?",
    helper: "This helps the coach match you with realistic next steps.",
    options: [
      "Frontend development",
      "UI/UX design",
      "Writing and content",
      "Marketing and sales",
    ],
  },
  {
    title: "Time question",
    prompt: "How much time can you commit each week?",
    helper: "Your mission plan should fit your real schedule.",
    options: ["1 to 3 hours", "4 to 7 hours", "8 to 12 hours", "12+ hours"],
  },
  {
    title: "Budget question",
    prompt: "What budget can you invest in your growth right now?",
    helper: "DSIQ uses this to suggest accessible tools and opportunities.",
    options: ["No budget", "Low budget", "Moderate budget", "Ready to invest"],
  },
  {
    title: "Interest question",
    prompt: "Which opportunities sound most exciting to you?",
    helper: "This shapes the kinds of recommendations you will see first.",
    options: [
      "Freelance gigs",
      "Scholarships",
      "Remote jobs",
      "Startup opportunities",
    ],
  },
];

export default function OnboardingPage() {
  return (
    <PrivateRoute>
      <main className="hero-grid min-h-screen px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(11,37,39,0.1)]">
            <section className="border-b border-[color:var(--color-line)] px-8 py-10 lg:px-12">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    Onboarding
                  </p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-text)]">
                    Tell DSIQ a little about you.
                  </h1>
                  <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
                    Your answers will shape your AI path, weekly missions, and
                    opportunity recommendations.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-[color:var(--color-surface)] px-5 py-4">
                  <p className="text-sm font-medium text-[color:var(--color-text)]">
                    Step 1 of 1
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                    Quick setup before your dashboard opens.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 px-8 py-10 lg:px-12">
              {questionCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.75rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                      {card.title}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                      {card.prompt}
                    </h2>
                    <p className="text-sm leading-7 text-[color:var(--color-muted)]">
                      {card.helper}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {card.options.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-4 transition hover:border-[color:var(--color-brand)]"
                      >
                        <input
                          type="radio"
                          name={card.title}
                          className="h-4 w-4 border-[color:var(--color-line)] text-[color:var(--color-brand)]"
                        />
                        <span className="text-sm font-medium text-[color:var(--color-text)]">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="border-t border-[color:var(--color-line)] px-8 py-8 lg:px-12">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-[color:var(--color-text)]">
                    Ready to generate your AI path?
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                    Once you continue, DSIQ can create your first roadmap and
                    mission plan.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)]"
                >
                  Generate AI Path
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PrivateRoute>
  );
}
