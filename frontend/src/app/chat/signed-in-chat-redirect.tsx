"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { getPostAuthPath } from "@/lib/auth-routing";

export function SignedInChatRedirect() {
  const { user, isLoading, authMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestChat = searchParams.get("guest") === "true";

  useEffect(() => {
    async function routeSignedInCompletedUsers() {
      if (isLoading || !user || isGuestChat) {
        return;
      }

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/dsiq/chat") {
        router.replace("/dsiq/chat");
      }
    }

    void routeSignedInCompletedUsers();
  }, [authMode, isGuestChat, isLoading, router, user]);

  return null;
}
