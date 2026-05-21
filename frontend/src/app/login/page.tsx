export default function LoginPage() {
  return (
    <main className="hero-grid flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(11,37,39,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[linear-gradient(160deg,#0b2527_0%,#11484a_48%,#007a66_100%)] px-8 py-12 text-white lg:px-12 lg:py-16">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-base font-bold text-white">
              D
            </span>
            <span className="text-lg font-semibold tracking-[0.18em]">DSIQ</span>
          </a>

          <div className="mt-16 max-w-md space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Sign in to continue your growth path.
            </h1>
            <p className="text-base leading-8 text-white/78">
              Return to your coach, missions, progress tracking, and next best
              opportunities.
            </p>
          </div>

          <div className="mt-12 grid gap-4">
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-medium text-white">Coach check-ins</p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Pick up where you left off with your latest action advice.
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-medium text-white">Weekly missions</p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Track progress, recover missed tasks, and stay consistent.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                Login
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-text)]">
                Access your DSIQ account
              </h2>
              <p className="text-sm leading-7 text-[color:var(--color-muted)]">
                Use your email and password to continue.
              </p>
            </div>

            <form className="mt-10 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[color:var(--color-text)]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[color:var(--color-text)]"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-[color:var(--color-brand)]"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[color:var(--color-line)] text-[color:var(--color-brand)]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[color:var(--color-muted)]"
                >
                  Keep me signed in on this device
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[color:var(--color-brand)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)]"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 rounded-3xl bg-[color:var(--color-surface)] p-5">
              <p className="text-sm text-[color:var(--color-muted)]">
                New to DSIQ?{" "}
                <a
                  href="/signup"
                  className="font-semibold text-[color:var(--color-brand)]"
                >
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
