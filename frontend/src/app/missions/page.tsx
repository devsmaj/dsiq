"use client";

import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";
import { ProfileStatePanel } from "@/components/profile-state-panel";
import {
  buildCompletedTasks,
  buildMissedTasks,
  buildWeeklyTasks,
} from "@/lib/personalization";
import { useUserProfile } from "@/lib/use-user-profile";

export default function MissionsPage() {
  const { answers, authMessage, hasAnswers, isProfileLoading, profileError } =
    useUserProfile();
  const weeklyTasks = buildWeeklyTasks(answers);
  const completedTasks = buildCompletedTasks(answers);
  const missedTasks = buildMissedTasks(answers);

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
          <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Weekly missions
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Your missions turn intention into visible progress.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
              Focus on the highest-leverage tasks first, complete the checklist,
              and let DSIQ adapt your next mission cycle.
            </p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Task checklist
              </p>
              <div className="mt-6 space-y-4">
                {weeklyTasks.map((task) => (
                  <label
                    key={task}
                    className="flex items-start gap-4 rounded-2xl bg-[color:var(--color-surface)] px-4 py-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-[color:var(--color-line)] text-[color:var(--color-brand)]"
                    />
                    <span className="text-sm leading-7 text-[color:var(--color-text)]">
                      {task}
                    </span>
                  </label>
                ))}
              </div>
            </article>

            <div className="space-y-6">
              <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Completed tasks
                </p>
                <div className="mt-6 space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task}
                      className="rounded-2xl border border-[color:var(--color-brand-soft)] bg-[color:var(--color-brand-soft)]/35 px-4 py-4"
                    >
                      <p className="text-sm leading-7 text-[color:var(--color-text)]">
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Missed tasks
                </p>
                <div className="mt-6 space-y-3">
                  {missedTasks.map((task) => (
                    <div
                      key={task}
                      className="rounded-2xl border border-[#f3d2a6] bg-[#fff5e7] px-4 py-4"
                    >
                      <p className="text-sm leading-7 text-[color:var(--color-text)]">
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Generate next missions
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                  Let DSIQ refresh your next mission plan.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-[color:var(--color-muted)]">
                  Your coach can adapt based on completed work, missed tasks, and
                  your newest opportunity focus.
                </p>
              </div>

              <button
                type="button"
                className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)]"
              >
                Generate Next Missions
              </button>
            </div>
          </section>

          {isProfileLoading ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Loading"
                body="We are loading your mission context and past onboarding answers."
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
                body="Your mission planner needs your saved onboarding answers before it can generate focused weekly tasks."
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
