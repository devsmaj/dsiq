"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { getPostAuthPath } from "@/lib/auth-routing";

export function SignedInChatRedirect() {
  const { user, isLoading, authMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function routeSignedInCompletedUsers() {
      if (isLoading || !user) {
        return;
      }

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/dsiq/chat") {
        router.replace("/dsiq/chat");
      }
    }

    void routeSignedInCompletedUsers();
  }, [authMode, isLoading, router, user]);

  return null;
}
