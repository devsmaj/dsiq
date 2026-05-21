import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://dsiq.app"),
  title: {
    default: "DSIQ | Your AI coach for skills, opportunities, and action",
    template: "%s | DSIQ",
  },
  description:
    "DSIQ helps students, developers, freelancers, and entrepreneurs discover the right path, take action, and stay consistent.",
  applicationName: "DSIQ",
  keywords: [
    "AI coach",
    "career guidance",
    "weekly missions",
    "opportunity discovery",
    "student growth",
    "freelancer support",
    "skill roadmap",
  ],
  openGraph: {
    title: "DSIQ | Your AI coach for skills, opportunities, and action",
    description:
      "DSIQ helps students, developers, freelancers, and entrepreneurs discover the right path, take action, and stay consistent.",
    url: "https://dsiq.app",
    siteName: "DSIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSIQ | Your AI coach for skills, opportunities, and action",
    description:
      "DSIQ helps students, developers, freelancers, and entrepreneurs discover the right path, take action, and stay consistent.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
