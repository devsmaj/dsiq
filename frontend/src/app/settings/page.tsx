"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { PrivateFooter } from "@/components/private-footer";
import { PrivateHeader } from "@/components/private-header";
import { PrivateRoute } from "@/components/private-route";

export default function SettingsPage() {
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState({
    coach: true,
    missions: true,
    opportunities: false,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const { authMessage, authMode, deleteAccount, logout, user } = useAuth();

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);

    if (deleteConfirmation.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm account deletion.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      router.replace("/signup");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "We could not delete your account right now.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <PrivateHeader />

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
          <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] p-8 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Settings
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Manage your account, preferences, and session controls.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
              Keep your workspace aligned with how you want DSIQ to communicate,
              notify, and store your experience.
            </p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Account
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
                {user?.email || "No email available"}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                Auth mode: {authMode === "firebase" ? "Firebase" : "Local demo"}
              </p>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Language
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["English", "French", "Arabic"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLanguage(option)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      language === option
                        ? "bg-[color:var(--color-brand)] text-white"
                        : "border border-[color:var(--color-line)] text-[color:var(--color-text)]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Notification preferences
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { key: "coach", label: "Coach reminders" },
                  { key: "missions", label: "Mission check-ins" },
                  { key: "opportunities", label: "Opportunity updates" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[color:var(--color-surface)] px-4 py-4"
                  >
                    <span className="text-sm font-medium text-[color:var(--color-text)]">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof typeof notifications]
                      }
                      onChange={(event) =>
                        setNotifications((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-[color:var(--color-line)] text-[color:var(--color-brand)]"
                    />
                  </label>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#e8b5b5] bg-[#fff5f5] p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9b3c3c]">
                Delete account
              </p>
              <p className="mt-4 text-sm leading-8 text-[#7a2d2d]">
                This action removes your current account session permanently. In
                local demo mode it clears your local DSIQ data from this browser.
                In Firebase mode it also removes your saved DSIQ user record, and
                you may be asked to log in again before deletion.
              </p>
              <label className="mt-6 block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b3c3c]">
                  Type DELETE to confirm
                </span>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder="DELETE"
                  className="mt-3 w-full rounded-[1.25rem] border border-[#e0b9b9] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[#b88484] focus:border-transparent focus:ring-0"
                />
              </label>
              {deleteError ? (
                <p className="mt-4 rounded-[1.25rem] border border-[#e0b9b9] bg-white px-4 py-3 text-sm text-[#7a2d2d]">
                  {deleteError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="mt-6 rounded-full border border-[#d7a8a8] bg-white px-6 py-3.5 text-sm font-semibold text-[#9b3c3c] transition hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingAccount ? "Deleting account..." : "Delete Account"}
              </button>
            </article>
          </section>

          <section className="mt-6 rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Logout
            </p>
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-base font-semibold text-[color:var(--color-text)]">
                  End your current session
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                  You can always sign back in to continue with your saved
                  dashboard, profile, and onboarding data.
                </p>
                {authMessage ? (
                  <p className="mt-3 rounded-2xl bg-[color:var(--color-brand-soft)]/45 px-4 py-3 text-sm text-[color:var(--color-text)]">
                    {authMessage}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </section>
        </main>

        <PrivateFooter />
      </div>
    </PrivateRoute>
  );
}
