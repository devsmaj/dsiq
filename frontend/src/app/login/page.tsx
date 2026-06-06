"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { AppleIcon, GoogleIcon } from "@/components/provider-icons";
import { getPostAuthPath } from "@/lib/auth-routing";

const SUCCESS_REDIRECT_DELAY_MS = 900;
const PREPARING_PROFILE_DELAY_MS = 550;

function getAuthErrorMessage(error: unknown, t: (key: string) => string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";

  if (code.includes("invalid-email")) {
    return t("auth.error.validEmail");
  }

  if (code.includes("email-already-in-use")) {
    return t("auth.error.emailExists");
  }

  if (code.includes("weak-password")) {
    return t("auth.error.weakPassword");
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return t("auth.error.invalidCredential");
  }

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return t("auth.error.cancelled");
  }

  if (code.includes("popup-blocked")) {
    return t("auth.error.popupBlocked");
  }

  if (code.includes("operation-not-allowed")) {
    return t("auth.error.providerDisabled");
  }

  if (code.includes("unauthorized-domain")) {
    return t("auth.error.unauthorizedDomain");
  }

  if (message) {
    return message;
  }

  return t("auth.error.loginFailed");
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getLoginDestination(
  user: { uid: string },
  authMode: "firebase" | "local",
) {
  return getPostAuthPath(user, authMode);
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    authMode,
    isLoading: isAuthLoading,
    loginOrSignupWithEmail,
    loginWithApple,
    loginWithGoogle,
    user,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectMessage, setRedirectMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "demo" | "email" | "google" | null
  >(null);
  const isLoading = loadingAction !== null;

  useEffect(() => {
    async function routeSignedInUserAwayFromLogin() {
      if (isAuthLoading || !user || loadingAction) {
        return;
      }

      router.replace(await getLoginDestination(user, authMode));
    }

    void routeSignedInUserAwayFromLogin();
  }, [authMode, isAuthLoading, loadingAction, router, user]);

  async function routeAfterSuccessfulLogin(nextUser: { uid: string }) {
    const destination = await getLoginDestination(nextUser, authMode);
    const isOnboardingRequired = destination === "/onboarding";

    if (isOnboardingRequired) {
      setRedirectMessage(t("auth.preparingProfile"));
      await wait(PREPARING_PROFILE_DELAY_MS);
      router.replace(destination);
      return;
    }

    setSuccessMessage(t("auth.loginSuccessful"));
    setRedirectMessage(t("auth.redirecting"));
    await wait(SUCCESS_REDIRECT_DELAY_MS);
    router.replace(destination);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setRedirectMessage("");

    try {
      setLoadingAction("email");
      const nextUser = await loginOrSignupWithEmail({ email, password });
      await routeAfterSuccessfulLogin(nextUser);
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError, t));
      setLoadingAction(null);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setSuccessMessage("");
    setRedirectMessage("");

    try {
      setLoadingAction("google");
      const nextUser = await loginWithGoogle();
      await routeAfterSuccessfulLogin(nextUser);
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError, t));
      setLoadingAction(null);
    }
  }

  async function handleAppleLogin() {
    setError("");
    setSuccessMessage("");
    setRedirectMessage("");

    try {
      setLoadingAction("apple");
      const nextUser = await loginWithApple();
      await routeAfterSuccessfulLogin(nextUser);
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError, t));
      setLoadingAction(null);
    }
  }

  return (
    <AuthShell
      title={t("auth.loginTitle")}
      description={t("auth.loginDescription")}
    >
      {successMessage ? <SuccessToast message={successMessage} /> : null}
      {redirectMessage ? <RedirectOverlay message={redirectMessage} /> : null}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="mb-3 grid h-12 w-full grid-cols-[1.5rem_1fr_1.5rem] items-center rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        <span className="inline-flex items-center justify-center gap-2">
          {loadingAction === "google" ? (
            <>
              <LoadingSpinner />
              {t("auth.signingIn")}
            </>
          ) : (
            t("auth.continueWithGoogle")
          )}
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
        <span className="inline-flex items-center justify-center gap-2">
          {loadingAction === "apple" ? (
            <>
              <LoadingSpinner />
              {t("auth.signingIn")}
            </>
          ) : (
            t("auth.continueWithApple")
          )}
        </span>
        <span />
      </button>

      <button
        type="button"
        onClick={() => router.push("/")}
        disabled={isLoading}
        className="mb-5 h-11 w-full rounded-full text-sm font-medium text-[#111111] underline underline-offset-4 transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("auth.tryChat")}
      </button>

      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase text-[color:var(--color-text)]">
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block text-left">
          <span className="sr-only">{t("auth.emailAddress")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="h-12 w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
            placeholder={t("auth.emailAddress")}
          />
        </label>

        <label className="relative block text-left">
          <span className="sr-only">{t("auth.password")}</span>
          <input
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="h-12 w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 pr-12 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-transparent focus:ring-0"
            placeholder={t("auth.password")}
          />
          <button
            type="button"
            aria-label={
              isPasswordVisible ? t("auth.hidePassword") : t("auth.showPassword")
            }
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
          {loadingAction === "email" ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner />
              {t("auth.signingIn")}
            </span>
          ) : (
            t("auth.continue")
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[color:var(--color-text)] underline underline-offset-4"
        >
          {t("auth.forgotPassword")}
        </Link>
      </div>

      {error ? (
        <p className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </AuthShell>
  );
}

function SuccessToast({ message }: { message: string }) {
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-[0_14px_34px_rgba(15,23,42,0.12)] transition">
      {message}
    </div>
  );
}

function RedirectOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 px-5 backdrop-blur-sm transition">
      <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-text)] shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
        <LoadingSpinner />
        {message}
      </div>
    </div>
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
