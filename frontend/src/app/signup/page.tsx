"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";

  if (code.includes("email-already-in-use")) {
    return "An account already exists with this email.";
  }

  if (code.includes("invalid-email")) {
    return "Enter a valid email address.";
  }

  if (code.includes("weak-password")) {
    return "Use a password with at least 6 characters.";
  }

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return "Sign-up was cancelled.";
  }

  if (message) {
    return message;
  }

  return "We could not create your account. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const { loginWithApple, loginWithGoogle, signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await signup({ fullName, email, password });
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");

    try {
      setIsLoading(true);
      await loginWithGoogle();
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAppleSignup() {
    setError("");

    try {
      setIsLoading(true);
      await loginWithApple();
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start your DSIQ path with a coach, missions, and opportunity tracking."
    >
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isLoading}
        className="mb-5 flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-5 py-3 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-[#4285f4]">
          G
        </span>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={handleAppleSignup}
        disabled={isLoading}
        className="mb-5 flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-5 py-3 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-black">
          A
        </span>
        Continue with Apple
      </button>

      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
        or
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--color-text)]">Full name</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoComplete="name"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            placeholder="Your name"
          />
        </label>

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

        <label className="block">
          <span className="text-sm font-medium text-[color:var(--color-text)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            placeholder="At least 6 characters"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[color:var(--color-text)]">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            placeholder="Repeat your password"
          />
        </label>

        {error ? (
          <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[var(--radius-md)] bg-[color:var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        Already have account?{" "}
        <Link href="/login" className="font-semibold text-[color:var(--color-brand)]">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
