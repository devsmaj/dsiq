import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)] lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-text)]">
            How DSIQ handles your information
          </h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-[color:var(--color-text)]">
            <p>
              DSIQ collects the information you provide during account creation,
              onboarding, and platform usage so we can personalize coaching,
              opportunities, and mission recommendations.
            </p>
            <p>
              We use your data to improve your experience, support account
              access, and understand product performance. We do not intend this
              placeholder policy to serve as final legal advice.
            </p>
            <p>
              Before launch, this page should be replaced with a reviewed legal
              privacy policy covering storage, retention, sharing, and user
              rights in detail.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
