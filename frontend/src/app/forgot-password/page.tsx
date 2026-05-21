"use client";

import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";

import { AuthPageGuard } from "@/components/auth-page-guard";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { configError } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth) {
      setError(configError || "Firebase Auth is not configured yet.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to send reset email.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageGuard>
      <main className="hero-grid flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_30px_90px_rgba(11,37,39,0.12)] lg:p-12">
          <a
            href="/login"
            className="text-sm font-semibold text-[color:var(--color-brand)]"
          >
            Back to login
          </a>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Forgot password
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-text)]">
            Reset your password
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
            Enter the email connected to your DSIQ account and we&apos;ll send
            you reset instructions.
          </p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            />

            {error ? (
              <p className="rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-2xl bg-[color:var(--color-brand-soft)]/45 px-4 py-3 text-sm text-[color:var(--color-text)]">
                {success}
              </p>
            ) : null}

            {configError ? (
              <p className="rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                {configError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || Boolean(configError)}
              className="w-full rounded-full bg-[color:var(--color-brand)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </main>
    </AuthPageGuard>
  );
}
