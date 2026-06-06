import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { GlobalLoadingDelay } from "@/components/global-loading-delay";
import { DsiqI18nProvider } from "@/components/i18n-provider";
import { SettingsHelpPopup } from "@/components/settings-help-popup";
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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <DsiqI18nProvider>
            <GlobalLoadingDelay />
            {children}
            <SettingsHelpPopup />
          </DsiqI18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
