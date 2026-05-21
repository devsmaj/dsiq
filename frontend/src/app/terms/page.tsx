import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)] lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Terms
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-text)]">
            Terms of use for DSIQ
          </h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-[color:var(--color-text)]">
            <p>
              By using DSIQ, users agree to engage with the platform
              responsibly and understand that recommendations are guidance tools,
              not guarantees of outcomes.
            </p>
            <p>
              Accounts, coaching outputs, and opportunity suggestions may evolve
              as the product changes. Users remain responsible for decisions,
              applications, and actions taken based on platform guidance.
            </p>
            <p>
              Before launch, this placeholder should be replaced with reviewed
              legal terms covering eligibility, limitations, user conduct,
              intellectual property, and liability.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
