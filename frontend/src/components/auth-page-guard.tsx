"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function AuthPageGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const searchParams = new URLSearchParams(window.location.search);
      router.replace(searchParams.get("next") || "/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <main className="hero-grid flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_30px_90px_rgba(11,37,39,0.12)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Checking session
          </p>
          <p className="mt-4 text-base leading-8 text-[color:var(--color-text)]">
            Loading authentication state...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
