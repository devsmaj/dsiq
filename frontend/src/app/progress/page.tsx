import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";

const progressMetrics = [
  { label: "Progress score", value: "82", note: "Strong momentum this week" },
  { label: "Completed missions", value: "18", note: "Across recent cycles" },
  { label: "Consistency streak", value: "12 days", note: "Keep the rhythm going" },
  { label: "Goal/action match", value: "84%", note: "Your work matches your direction" },
];

export default function ProgressPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Progress score
            </p>
            <div className="mt-6 flex items-end gap-4">
              <span className="text-6xl font-semibold leading-none">82</span>
              <span className="pb-2 text-base text-white/72">out of 100</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
              Your current score shows that you are building strong momentum
              through repeated action and aligned mission execution.
            </p>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              AI warning or encouragement
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--color-text)]">
              You are progressing well, but consistency is still your biggest
              edge.
            </h1>
            <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
              DSIQ recommends protecting your weekly mission blocks. Small
              missed sessions can quickly reduce long-term momentum.
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {progressMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-7 shadow-[0_18px_50px_rgba(11,37,39,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                {metric.label}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-text)]">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                {metric.note}
              </p>
            </article>
          ))}
        </section>
      </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
