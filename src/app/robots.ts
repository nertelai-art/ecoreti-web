import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Obert a tothom, inclosos els rastrejadors d'IA: és el que fa que ens citin (GEO).
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";
  if (!isProduction) {
    // Les previsualitzacions de Vercel no s'han d'indexar.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
