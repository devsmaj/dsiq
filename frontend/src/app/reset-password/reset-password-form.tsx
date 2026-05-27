"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";

import { AuthShell } from "@/components/auth-shell";
import { withTimeout } from "@/lib/async-timeout";
import { auth } from "@/lib/firebase";

const SUCCESS_REDIRECT_DELAY_MS = 1200;

type LinkStatus = "checking" | "ready" | "invalid" | "success";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getResetErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  if (code.includes("expired-action-code")) {
    return "This reset link has expired. Request a new password reset link.";
  }

  if (code.includes("invalid-action-code")) {
    return "This reset link is invalid or has already been used.";
  }

  if (code.includes("weak-password")) {
    return "Use a stronger password with at least 6 characters.";
  }

  return "We could not reset your password. Please request a new link and try again.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<LinkStatus>("checking");
  const [oobCode, setOobCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    const resetCode = searchParams.get("oobCode") || "";

    async function verifyResetLink() {
      setStatus("checking");
      setError("");

      if (!auth) {
        setStatus("invalid");
        setError("Firebase is not configured yet.");
        return;
      }

      if (!resetCode) {
        setStatus("invalid");
        setError("This reset link is missing a reset code. Request a new password reset link.");
        return;
      }

      try {
        const email = await withTimeout(
          verifyPasswordResetCode(auth, resetCode),
          undefined,
          "Password reset link verification timed out.",
        );

        if (!isActive) {
          return;
        }

        setOobCode(resetCode);
        setVerifiedEmail(email);
        setStatus("ready");
      } catch (verifyError) {
        if (!isActive) {
          return;
        }

        setStatus("invalid");
        setError(getResetErrorMessage(verifyError));
      }
    }

    void verifyResetLink();

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!auth) {
      setError("Firebase is not configured yet.");
      return;
    }

    if (!oobCode) {
      setError("This reset link is invalid. Request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Use a stronger password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await withTimeout(
        confirmPasswordReset(auth, oobCode, password),
        undefined,
        "Password reset request timed out.",
      );
      setStatus("success");
      setSuccessMessage("Password reset successfully. You can now login.");
      await wait(SUCCESS_REDIRECT_DELAY_MS);
      router.replace("/login");
    } catch (resetError) {
      setError(getResetErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create a new password"
      description="Enter a new password for your DSIQ account."
    >
      {status === "checking" ? (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-4 py-5 text-sm text-[color:var(--color-muted)]">
          <span className="inline-flex items-center justify-center gap-2">
            <LoadingSpinner />
            Checking reset link...
          </span>
        </div>
      ) : null}

      {status === "ready" || status === "success" ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {verifiedEmail ? (
            <p className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm text-[color:var(--color-muted)]">
              Resetting password for{" "}
              <span className="font-semibold text-[color:var(--color-text)]">
                {verifiedEmail}
              </span>
            </p>
          ) : null}

          <label className="block text-left">
            <span className="text-sm font-medium text-[color:var(--color-text)]">
              New password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={status === "success"}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="New password"
            />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-[color:var(--color-text)]">
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={status === "success"}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Confirm password"
            />
          </label>

          {successMessage ? (
            <p className="rounded-[var(--radius-md)] border border-[color:var(--color-brand)]/30 bg-[color:var(--color-brand-soft)] px-4 py-3 text-sm text-[color:var(--color-text)]">
              {successMessage}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || status === "success"}
            className="w-full rounded-[var(--radius-md)] bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <LoadingSpinner />
                Resetting...
              </span>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      ) : null}

      {status === "invalid" ? (
        <div className="space-y-4">
          {error ? (
            <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Request a new reset link
          </Link>
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        <Link
          href="/login"
          className="font-semibold text-[color:var(--color-text)] underline underline-offset-4"
        >
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}

function LoadingSpinner() {
  return (
    <span
      className="block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-label="Loading"
    />
  );
}
