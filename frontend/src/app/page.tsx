import type { Metadata } from "next";

import { HomeChat } from "@/components/home-chat";

export const metadata: Metadata = {
  title: "DSIQ | Your AI coach for skills, opportunities, and action",
  description:
    "DSIQ helps you stop guessing your next move with AI guidance for skills, opportunities, and action.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DSIQ | Your AI coach for skills, opportunities, and action",
    description:
      "DSIQ helps you stop guessing your next move with AI guidance for skills, opportunities, and action.",
    url: "https://dsiq.app/",
  },
};

export default function Home() {
  return <HomeChat />;
}
