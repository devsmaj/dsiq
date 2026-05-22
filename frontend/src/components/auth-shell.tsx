import { DsiqLogo } from "@/components/dsiq-logo";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] px-4 py-8 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <DsiqLogo href="/" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--color-muted)]">
          Powered by DSIQ. Part of the SMAJ Ecosystem.
        </p>
      </section>
    </main>
  );
}
