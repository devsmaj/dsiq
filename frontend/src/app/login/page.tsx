"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";

  if (code.includes("invalid-email")) {
    return "Enter a valid email address.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is incorrect.";
  }

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return "Sign-in was cancelled.";
  }

  if (message) {
    return message;
  }

  return "We could not log you in. Please try again.";
}

function getRedirectPath() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("next") || "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithApple, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      await login({ email, password, rememberMe: true });
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      setIsLoading(true);
      await loginWithGoogle();
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAppleLogin() {
    setError("");

    try {
      setIsLoading(true);
      await loginWithApple();
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue your coaching, missions, and progress tracking."
    >
      <button
        type="button"
        onClick={handleGoogleLogin}
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
        onClick={handleAppleLogin}
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
            autoComplete="current-password"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
            placeholder="Your password"
          />
        </label>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-[color:var(--color-brand)]">
            Forgot password?
          </Link>
        </div>

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
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        Don&apos;t have account?{" "}
        <Link href="/signup" className="font-semibold text-[color:var(--color-brand)]">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
