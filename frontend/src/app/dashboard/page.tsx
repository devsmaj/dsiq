import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";

const missionItems = [
  "Finish portfolio landing page draft",
  "Apply to 2 remote internship roles",
  "Complete one UI case study review",
];

const progressStats = [
  { label: "Consistency streak", value: "12 days" },
  { label: "Missions completed", value: "18" },
  { label: "Goal alignment", value: "84%" },
];

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                Welcome message
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Welcome back, your next best action is ready.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
                DSIQ has prepared your coach advice, mission focus, opportunity
                match, and progress snapshot for today.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Today&apos;s coach advice
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                Focus on visible progress, not perfect preparation.
              </h2>
              <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
                Finish one public-facing proof of work today, then send it out.
                Momentum grows when your effort becomes visible.
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Weekly mission summary
              </p>
              <div className="mt-6 space-y-4">
                {missionItems.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-2xl bg-[color:var(--color-surface)] px-4 py-4"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-sm font-semibold text-[color:var(--color-brand)]">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-7 text-[color:var(--color-text)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Recommended opportunity
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                Junior product designer fellowship
              </h2>
              <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
                Best fit for your current goals, skill profile, and available
                time. DSIQ recommends preparing a focused case study and
                applying this week.
              </p>
              <div className="mt-6 inline-flex rounded-full bg-[color:var(--color-cream)] px-4 py-2 text-sm font-semibold text-[color:var(--color-brand)]">
                Match score: 91%
              </div>
            </article>
          </section>

          <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Progress overview
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {progressStats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-[1.5rem] bg-[color:var(--color-surface)] p-6"
                >
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[color:var(--color-text)]">
                    {stat.value}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
