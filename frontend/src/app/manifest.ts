import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DSIQ",
    short_name: "DSIQ",
    description:
      "Your AI coach for skills, opportunities, and action.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#10A37F",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
