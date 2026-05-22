"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthPageGuard } from "@/components/auth-page-guard";
import { useAuth } from "@/components/auth-provider";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { authMessage, signup } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      await signup({ fullName, email, password });
      router.replace("/onboarding");
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to create account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageGuard>
      <main className="hero-grid flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(11,37,39,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="bg-[linear-gradient(160deg,#0b2527_0%,#11484a_48%,#007a66_100%)] px-8 py-12 text-white lg:px-12 lg:py-16">
            <Link href="/" className="inline-flex items-center">
              <span className="text-lg font-semibold tracking-[0.18em]">
                DSIQ
              </span>
            </Link>

            <div className="mt-16 max-w-md space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                Create account
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance">
                Start your growth path with DSIQ.
              </h1>
              <p className="text-base leading-8 text-white/78">
                Create your account to unlock onboarding, AI coaching, weekly
                missions, and opportunity recommendations.
              </p>
            </div>
          </section>

          <section className="px-8 py-12 lg:px-12 lg:py-16">
            <div className="mx-auto w-full max-w-md">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Signup
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-text)]">
                  Create your DSIQ account
                </h2>
                <p className="text-sm leading-7 text-[color:var(--color-muted)]">
                  Get started with your email and set up your account.
                </p>
              </div>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create password"
                  className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
                />

                {authMessage ? (
                  <p className="rounded-2xl bg-[color:var(--color-brand-soft)]/45 px-4 py-3 text-sm text-[color:var(--color-text)]">
                    {authMessage}
                  </p>
                ) : null}

                {error ? (
                  <p className="rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[color:var(--color-brand)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-8 text-sm text-[color:var(--color-muted)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[color:var(--color-brand)]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </AuthPageGuard>
  );
}
