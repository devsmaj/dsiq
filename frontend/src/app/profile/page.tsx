"use client";

import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";
import { ProfileStatePanel } from "@/components/profile-state-panel";
import { useUserProfile } from "@/lib/use-user-profile";

export default function ProfilePage() {
  const { answers, authMessage, hasAnswers, isProfileLoading, profileError, user } =
    useUserProfile();

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
          <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Profile
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Your saved identity, goals, and growth inputs.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
              This page gives you a quick view of the details DSIQ is using to
              personalize your path and recommendations.
            </p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Name
              </p>
              <p className="mt-4 text-2xl font-semibold text-[color:var(--color-text)]">
                {user?.displayName || "Not set"}
              </p>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Email
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {user?.email || "Not available"}
              </p>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Goals
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {answers?.goal || "Not answered yet"}
              </p>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Skills
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {answers?.skills || "Not answered yet"}
              </p>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Interests
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {answers?.interest || "Not answered yet"}
              </p>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Budget
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {answers?.budget || "Not answered yet"}
              </p>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Time available
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {answers?.time || "Not answered yet"}
              </p>

              <button
                type="button"
                className="mt-8 rounded-full border border-[color:var(--color-line)] px-6 py-3.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
              >
                Edit profile
              </button>
            </article>
          </section>

          {isProfileLoading ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Loading"
                body="We are loading your saved profile."
              />
            </div>
          ) : null}

          {profileError ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Profile Error"
                body={profileError}
                tone="error"
              />
            </div>
          ) : null}

          {!isProfileLoading && !profileError && !hasAnswers ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Finish Onboarding"
                body="Your account exists, but your full profile is still missing the onboarding answers DSIQ uses to personalize everything else."
                actionHref="/onboarding"
                actionLabel="Complete Onboarding"
              />
            </div>
          ) : null}

          {authMessage ? (
            <div className="mt-6">
              <ProfileStatePanel title="Auth Mode" body={authMessage} />
            </div>
          ) : null}
        </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
