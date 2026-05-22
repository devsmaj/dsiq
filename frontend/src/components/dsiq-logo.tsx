import Link from "next/link";

type DsiqLogoProps = {
  href: string;
};

export function DsiqLogo({ href }: DsiqLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label="DSIQ home">
      <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-[color:var(--color-brand)] text-sm font-black text-white shadow-[0_12px_32px_rgba(16,163,127,0.26)]">
        D
      </span>
      <span className="text-sm font-semibold uppercase text-[color:var(--color-text)]">
        DSIQ
      </span>
    </Link>
  );
}
