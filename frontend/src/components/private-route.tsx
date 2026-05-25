"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router, user]);

  // If this route is private, but the user is authenticated,
  // render immediately (avoids any onboarding “loop” from guards).
  if (!isLoading && user) {
    return <>{children}</>;
  }

  if (isLoading || !user) {

    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 text-center shadow-[0_18px_50px_rgba(11,37,39,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Checking access
          </p>
          <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
            Loading your DSIQ workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
