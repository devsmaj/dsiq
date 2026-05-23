"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";

import { AuthShell } from "@/components/auth-shell";
import { auth } from "@/lib/firebase";

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code.includes("invalid-email")) {
    return "Enter a valid email address.";
  }

  if (code.includes("user-not-found")) {
    return "No account exists with this email.";
  }

  return "We could not send the reset email. Please try again.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!auth) {
      setError("Firebase is not configured yet.");
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link sent. Check your email for the next step.");
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and DSIQ will send a secure reset link."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--color-text)]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            placeholder="you@example.com"
          />
        </label>

        {message ? (
          <p className="rounded-[var(--radius-md)] border border-[color:var(--color-brand)]/30 bg-[color:var(--color-brand-soft)] px-4 py-3 text-sm text-[color:var(--color-text)]">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[var(--radius-md)] bg-[color:var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        <Link href="/login" className="font-semibold text-[color:var(--color-brand)]">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
