const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xl font-semibold text-[color:var(--color-text)]">DSIQ</p>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--color-muted)]">
            Your AI coach for skills, opportunities, and action.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Links
          </p>
          <div className="flex flex-col gap-3">
            {footerLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Legal
          </p>
          <div className="flex flex-col gap-3">
            {legalLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-brand)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-line)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-[color:var(--color-muted)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>Powered by DSIQ</span>
          <span>Part of the SMAJ Ecosystem</span>
        </div>
      </div>
    </footer>
  );
}
