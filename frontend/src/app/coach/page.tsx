"use client";

import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";
import { ProfileStatePanel } from "@/components/profile-state-panel";
import { buildActionAdvice, buildCoachMessages } from "@/lib/personalization";
import { useUserProfile } from "@/lib/use-user-profile";

export default function CoachPage() {
  const { answers, authMessage, hasAnswers, isProfileLoading, profileError } =
    useUserProfile();
  const coachMessages = buildCoachMessages(answers);
  const actionAdvice = buildActionAdvice(answers);

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  AI chat
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-text)]">
                  Your coach is ready to guide your next move.
                </h1>
              </div>
              <span className="rounded-full bg-[color:var(--color-cream)] px-4 py-2 text-sm font-semibold text-[color:var(--color-brand)]">
                Live session
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {coachMessages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`max-w-2xl rounded-[1.75rem] px-5 py-4 ${
                    message.role === "coach"
                      ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)]"
                      : "ml-auto bg-[color:var(--color-brand)] text-white"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      message.role === "coach"
                        ? "text-[color:var(--color-muted)]"
                        : "text-white/70"
                    }`}
                  >
                    {message.role === "coach" ? "Coach message" : "You"}
                  </p>
                  <p className="mt-3 text-sm leading-8">{message.text}</p>
                </article>
              ))}
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface)] px-4 py-3 text-[color:var(--color-muted)]">
                <span className="typing-dot" />
                <span className="typing-dot [animation-delay:120ms]" />
                <span className="typing-dot [animation-delay:240ms]" />
                <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  Coach thinking
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  placeholder="Ask your coach what to focus on next..."
                  className="w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
                />
                <button
                  type="button"
                  className="rounded-full bg-[color:var(--color-brand)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-strong)]"
                >
                  Send
                </button>
              </div>
            </div>

            {isProfileLoading ? (
              <div className="mt-6">
                <ProfileStatePanel
                  title="Loading"
                  body="We are loading your personalized coaching context."
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
                  body="Your coach can chat right now, but the advice becomes much sharper after you complete your onboarding answers."
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
          </section>

          <section className="space-y-6">
            <article className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.2)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                Action advice
              </p>
              <div className="mt-6 space-y-4">
                {actionAdvice.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Step 0{index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">{item}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Save recommendation
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                Save today&apos;s focus as your primary recommendation.
              </h2>
              <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
                Keep this advice pinned so it appears on your dashboard and weekly
                mission planner.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full border border-[color:var(--color-line)] px-6 py-3.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
              >
                Save Recommendation
              </button>
            </article>
          </section>
        </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
