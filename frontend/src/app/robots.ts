import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/coach", "/missions", "/opportunities", "/progress", "/profile", "/settings"],
    },
    sitemap: "https://dsiq.app/sitemap.xml",
  };
}
