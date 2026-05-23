import Link from "next/link";

type DsiqLogoProps = {
  href: string;
};

export function DsiqLogo({ href }: DsiqLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center" aria-label="DSIQ home">
      <span className="text-base font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text)]">
        DSIQ
      </span>
    </Link>
  );
}
