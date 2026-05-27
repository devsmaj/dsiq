import Link from "next/link";

import { dsiqLogoSrc } from "@/lib/public-asset";

type DsiqLogoProps = {
  href: string;
};

export function DsiqLogo({ href }: DsiqLogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2"
      aria-label="DSIQ home"
    >
      <img
        src={dsiqLogoSrc}
        alt=""
        className="h-8 w-8 object-contain"
      />
      <span className="text-base font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text)]">
        DSIQ
      </span>
    </Link>
  );
}
