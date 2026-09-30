import type { MetadataRoute } from "next";
import { absoluteUrl, locales, routes, type PageKey } from "@/lib/i18n";

const priority: Record<PageKey, number> = {
  home: 1,
  services: 0.9,
  quote: 0.9,
  about: 0.7,
  contact: 0.7,
  legal: 0.2,
  privacy: 0.2,
  cookies: 0.2,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(routes) as PageKey[]).flatMap((key) =>
    locales.map((locale) => ({
      url: absoluteUrl(routes[key][locale]),
      changeFrequency: "monthly" as const,
      priority: priority[key],
      alternates: {
        languages: { "es-ES": absoluteUrl(routes[key].es), "ca-ES": absoluteUrl(routes[key].ca) },
      },
    })),
  );
}
