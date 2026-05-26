"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  HOME_CHAT_LOADING_BYPASS_KEY,
  ONBOARDING_CHAT_LOADING_BYPASS_KEY,
} from "@/lib/chat-loading-bypass";

const LOADING_DELAY_MS = 3000;
const CHAT_BYPASS_MAX_AGE_MS = 30000;

function hasActiveHomeChatBypass() {
  if (typeof window === "undefined") {
    return false;
  }

  const bypassStartedAt = Number(
    window.sessionStorage.getItem(HOME_CHAT_LOADING_BYPASS_KEY),
  );

  return (
    Number.isFinite(bypassStartedAt) &&
    Date.now() - bypassStartedAt <= CHAT_BYPASS_MAX_AGE_MS
  );
}

function hasActiveOnboardingChatBypass() {
  if (typeof window === "undefined") {
    return false;
  }

  const bypassStartedAt = Number(
    window.sessionStorage.getItem(ONBOARDING_CHAT_LOADING_BYPASS_KEY),
  );

  return (
    Number.isFinite(bypassStartedAt) &&
    Date.now() - bypassStartedAt <= CHAT_BYPASS_MAX_AGE_MS
  );
}

export function GlobalLoadingDelay() {
  const pathname = usePathname();

  return <RouteLoadingDelay key={pathname} pathname={pathname} />;
}

function RouteLoadingDelay({ pathname }: { pathname: string }) {
  const [shouldBypassHomeChat] = useState(
    () => pathname === "/chat" && hasActiveHomeChatBypass(),
  );
  const [shouldBypassOnboardingChat] = useState(
    () => pathname === "/dsiq/chat" && hasActiveOnboardingChatBypass(),
  );

  useEffect(() => {
    if (shouldBypassHomeChat) {
      window.sessionStorage.removeItem(HOME_CHAT_LOADING_BYPASS_KEY);
    }
    if (shouldBypassOnboardingChat) {
      window.sessionStorage.removeItem(ONBOARDING_CHAT_LOADING_BYPASS_KEY);
    }
  }, [shouldBypassHomeChat, shouldBypassOnboardingChat]);

  if (shouldBypassHomeChat || shouldBypassOnboardingChat) {
    return null;
  }

  return <LoadingDelayOverlay key={pathname} />;
}

function LoadingDelayOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--color-background)]/92 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="text-xl font-semibold tracking-tight text-[color:var(--color-text)]">
          DSIQ
        </span>
        <div className="flex items-center gap-2 text-[color:var(--color-text)]">
          <span className="typing-dot" />
          <span className="typing-dot [animation-delay:120ms]" />
          <span className="typing-dot [animation-delay:240ms]" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
