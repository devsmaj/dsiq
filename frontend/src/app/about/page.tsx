import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] px-8 py-12 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            About
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            DSIQ exists to help people move from confusion to clear action.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            We believe many talented people do not fail because of lack of
            potential. They struggle because they lack direction, structure,
            and consistent accountability.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Mission
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
              DSIQ helps users discover the right skills, opportunities, and
              actions so they can grow with clarity and consistency.
            </p>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Why DSIQ exists
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
              Too many people jump between random learning, scattered
              opportunities, and unstructured hustle. DSIQ creates a more
              focused path.
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Who it helps
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
              DSIQ is designed for students, developers, freelancers, and
              entrepreneurs who want practical guidance and measurable progress.
            </p>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              SMAJ Ecosystem connection
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
              DSIQ is part of the SMAJ Ecosystem and reflects a broader mission
              to build tools that unlock growth, opportunity, and real-world
              action.
            </p>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
