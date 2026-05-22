import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/features",
    "/how-it-works",
    "/pricing",
    "/contact",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `https://dsiq.app${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
