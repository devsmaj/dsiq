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

function buildMailtoUrl(form: FormState) {
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    "",
    form.message,
  ].join("\n");

  return `mailto:hello@dsiq.app?subject=${encodeURIComponent(
    form.subject,
  )}&body=${encodeURIComponent(body)}`;
}

function saveFallbackSubmission(form: FormState) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = "dsiq.contact-submissions";
  const existing = window.localStorage.getItem(storageKey);
  const submissions = existing ? (JSON.parse(existing) as unknown[]) : [];

  window.localStorage.setItem(
    storageKey,
    JSON.stringify([
      ...submissions,
      {
        ...form,
        submittedAt: new Date().toISOString(),
      },
    ]),
  );
}

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

      saveFallbackSubmission(form);
      const mailtoSubject = encodeURIComponent(form.subject.trim());
      const mailtoBody = encodeURIComponent(
        `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`,
      );

      window.location.href = `mailto:hello@dsiq.app?subject=${mailtoSubject}&body=${mailtoBody}`;

      setSuccess("Your email app should now open with your message pre-filled.");
      setForm(initialFormState);
    } catch {
      saveFallbackSubmission(form);
      window.location.href = buildMailtoUrl(form);
      setSuccess(
        "Your email app is opening with this message. We also saved a local copy in this browser.",
      );
      setForm(initialFormState);
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
        <section className="rounded-[2rem] border border-[color:var(--color-line)] bg-white px-8 py-12 text-[color:var(--color-text)] shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Reach out if you want to collaborate, ask questions, or partner.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
            DSIQ is growing, and we are open to conversations around community,
            product feedback, education, and opportunities.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Contact form
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#4c6fff] focus:ring-4 focus:ring-[#4c6fff]/10"
              />
              <input
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#4c6fff] focus:ring-4 focus:ring-[#4c6fff]/10"
              />
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="w-full rounded-full border border-[color:var(--color-line)] bg-white px-5 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#4c6fff] focus:ring-4 focus:ring-[#4c6fff]/10"
              />
              <textarea
                placeholder="Tell us what you need"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-[color:var(--color-line)] bg-white px-5 py-3 text-sm leading-7 text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#4c6fff] focus:ring-4 focus:ring-[#4c6fff]/10"
              />

              {error ? (
                <p className="rounded-[1.25rem] border border-[#e8b5b5] bg-[#fff5f5] px-4 py-3 text-sm text-[#7a2d2d]">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-[1.25rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-4 py-3 text-sm text-[color:var(--color-text)]">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#111111] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
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
                  className="block rounded-[1.5rem] bg-[color:var(--color-surface-strong)] px-5 py-4 transition hover:bg-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
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
