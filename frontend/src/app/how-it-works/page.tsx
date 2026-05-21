import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

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
        <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] px-8 py-12 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            How It Works
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            DSIQ guides users from first questions to focused action.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            The process is simple: understand the user, generate a path, and
            keep momentum alive through missions and coaching.
          </p>
        </section>

        <section className="mt-6 grid gap-6">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-lg font-semibold text-[color:var(--color-brand)]">
                  0{index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand)]">
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
