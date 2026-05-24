"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { AppleIcon, GoogleIcon } from "@/components/provider-icons";

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";

  if (code.includes("invalid-email")) {
    return "Enter a valid email address.";
  }

  if (code.includes("email-already-in-use")) {
    return "An account already exists for this email. Log in instead.";
  }

  if (code.includes("weak-password")) {
    return "Use a stronger password with at least 6 characters.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is incorrect.";
  }

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return "Sign-in was cancelled.";
  }

  if (code.includes("popup-blocked")) {
    return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
  }

  if (code.includes("operation-not-allowed")) {
    return "This sign-in provider is not enabled yet. Enable it in Firebase Authentication.";
  }

  if (code.includes("unauthorized-domain")) {
    return "This domain is not authorized in Firebase Authentication settings.";
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
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
  const { login, loginWithApple, loginWithGoogle, signup, tryDemo } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "demo" | "email" | "google" | null
  >(null);
  const isLoading = loadingAction !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setLoadingAction("email");
      if (isSignup) {
        await signup({ fullName, email, password });
      } else {
        await login({ email, password, rememberMe: true });
      }
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      setLoadingAction("google");
      await loginWithGoogle();
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleAppleLogin() {
    setError("");

    try {
      setLoadingAction("apple");
      await loginWithApple();
      router.replace(getRedirectPath());
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTryDemo() {
    setError("");

    try {
      setLoadingAction("demo");
      await tryDemo();
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <AuthShell
      title={isSignup ? "Sign up" : "Log in"}
      description={
        isSignup
          ? "Create your DSIQ account to save your chats and progress."
          : "Log in to continue your chats, coaching, missions, and progress."
      }
    >
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="mb-3 grid h-12 w-full grid-cols-[1.5rem_1fr_1.5rem] items-center rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        <span>
          {loadingAction === "google" ? "Opening Google..." : "Continue with Google"}
        </span>
        <span />
      </button>

      <button
        type="button"
        onClick={handleAppleLogin}
        disabled={isLoading}
        className="mb-5 grid h-12 w-full grid-cols-[1.5rem_1fr_1.5rem] items-center rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <AppleIcon />
        <span>
          {loadingAction === "apple" ? "Opening Apple..." : "Continue with Apple"}
        </span>
        <span />
      </button>

      <button
        type="button"
        onClick={handleTryDemo}
        disabled={isLoading}
        className="mb-5 h-11 w-full rounded-full text-sm font-medium text-[#111111] underline underline-offset-4 transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === "demo" ? "Opening demo..." : "Try it first"}
      </button>

      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase text-[color:var(--color-text)]">
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
        or
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {isSignup ? (
          <label className="block text-left">
            <span className="sr-only">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
              className="h-12 w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
              placeholder="Full name"
            />
          </label>
        ) : null}

        <label className="block text-left">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="h-12 w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
            placeholder="Email address"
          />
        </label>

        <label className="relative block text-left">
          <span className="sr-only">Password</span>
          <input
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="h-12 w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 pr-12 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
            placeholder="Password"
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 text-[color:var(--color-muted)] transition hover:text-[color:var(--color-text)]"
            onClick={() => setIsPasswordVisible((value) => !value)}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === "email"
            ? "Continuing..."
            : isSignup
              ? "Sign up with email"
              : "Log in with email"}
        </button>
      </form>

      {!isSignup ? (
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[color:var(--color-text)] underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[color:var(--color-text)] underline underline-offset-4"
          >
            Already have an account? Log in
          </Link>
        </div>
      )}

      {error ? (
        <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </AuthShell>
  );
}
