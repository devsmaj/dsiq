"use client";

import Link from "next/link";
import { Bot, CheckCircle2, Compass, TrendingUp } from "lucide-react";

import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";
import { ProfileStatePanel } from "@/components/profile-state-panel";
import {
  buildCoachMessages,
  buildOpportunityGroups,
  buildProgressMetrics,
  buildWeeklyTasks,
} from "@/lib/personalization";
import { useUserProfile } from "@/lib/use-user-profile";

export default function DashboardPage() {
  const { answers, authMessage, hasAnswers, isProfileLoading, profileError, user } =
    useUserProfile();
  const coachMessage = buildCoachMessages(answers).find(
    (message) => message.role === "coach",
  );
  const weeklyTasks = buildWeeklyTasks(answers).slice(0, 3);
  const opportunity = buildOpportunityGroups(answers)[0];
  const progressMetrics = buildProgressMetrics(answers);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Builder";

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                Welcome section
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Welcome back, {displayName}. Your next move is already taking shape.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/78">
                DSIQ is tracking your coaching context, weekly missions, best-fit
                opportunities, and progress signals in one focused workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/coach" className="btn-primary bg-[#ffffff] text-[#0d3d3a] hover:bg-[#ffffff]">
                  Ask Coach
                </Link>
                <Link href="/missions" className="btn-secondary border-white/25 text-white hover:border-white hover:text-white">
                  View Missions
                </Link>
              </div>
            </article>

            <article className="surface-card p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    Coach message card
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[color:var(--color-text)]">
                    Today&apos;s advice
                  </h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-8 text-[color:var(--color-muted)]">
                {coachMessage?.text}
              </p>
              <div className="mt-6 flex items-center gap-2 text-[color:var(--color-brand)]">
                <span className="typing-dot" />
                <span className="typing-dot [animation-delay:120ms]" />
                <span className="typing-dot [animation-delay:240ms]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  AI ready
                </span>
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <article className="surface-card p-8 lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    Weekly missions card
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                    Priority checklist
                  </h2>
                </div>
                <CheckCircle2 className="h-6 w-6 text-[color:var(--color-brand)]" aria-hidden="true" />
              </div>
              <div className="mt-6 space-y-3">
                {weeklyTasks.map((task) => (
                  <label
                    key={task}
                    className="flex items-start gap-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-4 py-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-[color:var(--color-line)] accent-[color:var(--color-brand)]"
                    />
                    <span className="text-sm leading-7 text-[color:var(--color-text)]">
                      {task}
                    </span>
                  </label>
                ))}
              </div>
            </article>

            <article className="opportunity-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                    Opportunity card
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                    {opportunity.title}
                  </h2>
                </div>
                <Compass className="h-6 w-6 text-[color:var(--color-brand)]" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm leading-8 text-[color:var(--color-muted)]">
                {opportunity.items[0]}
              </p>
              <Link href="/opportunities" className="mt-6 inline-flex text-sm font-semibold text-[color:var(--color-brand)]">
                Explore opportunities
              </Link>
            </article>
          </section>

          <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                  Progress overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                  Your consistency signals
                </h2>
              </div>
              <TrendingUp className="h-6 w-6 text-[color:var(--color-brand)]" aria-hidden="true" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {progressMetrics.map((metric) => (
                <article key={metric.label} className="stat-card bg-[color:var(--color-surface-strong)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[color:var(--color-text)]">
                    {metric.value}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                    {metric.note}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {isProfileLoading ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Loading"
                body="We are loading your personalized dashboard context."
              />
            </div>
          ) : null}

          {profileError ? (
            <div className="mt-6">
              <ProfileStatePanel title="Profile Error" body={profileError} tone="error" />
            </div>
          ) : null}

          {!isProfileLoading && !profileError && !hasAnswers ? (
            <div className="mt-6">
              <ProfileStatePanel
                title="Finish Onboarding"
                body="Your dashboard works with starter content, but DSIQ becomes much sharper after onboarding."
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
