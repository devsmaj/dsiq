const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-[color:var(--color-surface)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-brand)] text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,122,102,0.28)]">
            D
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">
              DSIQ
            </span>
            <span className="text-sm text-[color:var(--color-text)]">
              AI coach for action
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[color:var(--color-muted)] transition hover:text-[color:var(--color-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-full border border-[color:var(--color-line)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-text)] transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
          >
            Login
          </a>
          <a
            href="/signup"
            className="rounded-full bg-[color:var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,122,102,0.28)] transition hover:bg-[color:var(--color-brand-strong)]"
          >
            Get Started
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] lg:hidden"
          aria-label="Open menu"
        >
          <span className="text-[10px] font-semibold tracking-[0.2em]">MENU</span>
        </button>
      </div>
    </header>
  );
}
