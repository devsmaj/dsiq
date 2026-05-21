import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";

const opportunityGroups = [
  {
    title: "Freelance ideas",
    items: [
      "Landing page design for local brands",
      "Portfolio website builds for creatives",
      "Social media design retainers for startups",
    ],
  },
  {
    title: "Business ideas",
    items: [
      "Micro design studio for founder MVPs",
      "Career portfolio review service for students",
      "Template packs for small business launches",
    ],
  },
  {
    title: "Learning paths",
    items: [
      "Product design fundamentals to case study publishing",
      "Frontend portfolio path for remote-ready work",
      "Personal brand writing for opportunity visibility",
    ],
  },
  {
    title: "Scholarships",
    items: [
      "Creative technology fellowship applications",
      "Design accelerator scholarship opportunities",
      "Youth innovation support programs",
    ],
  },
  {
    title: "Remote jobs",
    items: [
      "Junior UI designer roles at early-stage startups",
      "Remote product support with growth exposure",
      "Contract frontend roles for small global teams",
    ],
  },
  {
    title: "Hackathons",
    items: [
      "Design sprint challenges for founders",
      "Tech community product-building weekends",
      "Innovation competitions with mentorship access",
    ],
  },
];

export default function OpportunitiesPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
        <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            Recommended opportunities
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Explore paths that match your skills, goals, and current season.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            DSIQ organizes your best-fit opportunities into practical groups so
            you can decide where to apply, learn, build, and grow next.
          </p>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {opportunityGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand)]">
                {group.title}
              </p>

              <div className="mt-6 space-y-3">
                {group.items.map((item) => (
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
            </article>
          ))}
        </section>
      </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
