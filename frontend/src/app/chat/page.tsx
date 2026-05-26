import type { Metadata } from "next";
import { Suspense } from "react";

import { PublicChat } from "@/components/public-chat";

export const metadata: Metadata = {
  title: "Chat",
  description: "Ask DSIQ in your private chat workspace.",
  alternates: {
    canonical: "/chat",
  },
};

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <PublicChat />
    </Suspense>
  );
}

