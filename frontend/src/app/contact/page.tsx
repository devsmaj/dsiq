"use client";

import { useState } from "react";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

const contactLinks = [
  { label: "Email", value: "hello@dsiq.app", href: "mailto:hello@dsiq.app" },
  { label: "Instagram", value: "@dsiq.app", href: "https://instagram.com/dsiq.app" },
  { label: "X", value: "@dsiq_app", href: "https://x.com/dsiq_app" },
];

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, subject, and message.");
      return;
    }

    try {
      setIsSubmitting(true);

      const mailtoSubject = encodeURIComponent(form.subject.trim());
      const mailtoBody = encodeURIComponent(
        `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`
      );

      window.location.href = `mailto:hello@dsiq.app?subject=${mailtoSubject}&body=${mailtoBody}`;

      setSuccess("Your email app should now open with your message pre-filled.");
      setForm(initialFormState);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not send your message right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

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

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-[1.25rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <input
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-[1.25rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="w-full rounded-[1.25rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />
              <textarea
                placeholder="Tell us what you need"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm leading-7 text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand)]"
              />

              {error ? (
                <p className="rounded-[1.25rem] border border-[#e8b5b5] bg-[#fff5f5] px-4 py-3 text-sm text-[#7a2d2d]">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-[1.25rem] border border-[color:var(--color-brand-soft)] bg-[color:var(--color-brand-soft)]/30 px-4 py-3 text-sm text-[color:var(--color-text)]">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[color:var(--color-brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,122,102,0.22)] transition hover:bg-[color:var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Email and social links
            </p>
            <div className="mt-6 space-y-4">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="block rounded-[1.5rem] bg-[color:var(--color-surface)] px-5 py-4 transition hover:bg-[color:var(--color-brand-soft)]/35"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    {link.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text)]">
                    {link.value}
                  </p>
                </a>
              ))}
            </div>

            <p className="mt-6 text-sm leading-8 text-[color:var(--color-muted)]">
              This static site opens your email app with a pre-filled message. If nothing opens,
              email us directly at hello@dsiq.app.
            </p>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
