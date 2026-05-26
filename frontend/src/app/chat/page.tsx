import type { Metadata } from "next";
import { Suspense, useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { PublicChat } from "@/components/public-chat";
import { getPostAuthPath } from "@/lib/auth-routing";
import { useRouter } from "next/navigation";


export const metadata: Metadata = {
  title: "Chat",
  description: "Ask DSIQ in your private chat workspace.",
  alternates: {
    canonical: "/chat",
  },
};

export default function ChatPage() {
  const { user, isLoading, authMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function routeSignedInCompletedUsers() {
      if (isLoading || !user) return;

      const postAuthPath = await getPostAuthPath(user, authMode);
      if (postAuthPath === "/dsiq/chat") {
        router.replace("/dsiq/chat");
      }
    }

    void routeSignedInCompletedUsers();
  }, [authMode, isLoading, router, user]);

  return (
    <Suspense fallback={null}>
      <PublicChat />
    </Suspense>
  );
}


