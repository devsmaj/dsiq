import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

const contactLinks = [
  { label: "Email", value: "hello@dsiq.app", href: "mailto:hello@dsiq.app" },
  { label: "Instagram", value: "@dsiq.app", href: "https://instagram.com/dsiq.app" },
  { label: "X", value: "@dsiq_app", href: "https://x.com/dsiq_app" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <section className="rounded-[2rem] bg-[linear-gradient(145deg,#0b2527_0%,#11484a_55%,#007a66_100%)] px-8 py-12 text-white shadow-[0_28px_70px_rgba(11,37,39,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Reach out if you want to collaborate, ask questions, or partner.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            DSIQ is growing, and we are open to conversations around community,
            product feedback, education, and opportunities.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Contact form
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <textarea
                placeholder="How can we help?"
                rows={6}
                className="w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3.5 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <button
                type="submit"
                className="rounded-full bg-[color:var(--color-brand)] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)]"
              >
                Send Message
              </button>
              <p className="text-sm leading-7 text-[color:var(--color-muted)]">
                Form delivery is not connected yet. Use the email link for now.
              </p>
            </form>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Email and social links
            </p>
            <div className="mt-6 space-y-4">
              {contactLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.label === "Email" ? undefined : "_blank"}
                  rel={item.label === "Email" ? undefined : "noopener noreferrer"}
                  className="rounded-2xl bg-[color:var(--color-surface)] px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text)]">
                    {item.value}
                  </p>
                </a>
              ))}
            </div>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
