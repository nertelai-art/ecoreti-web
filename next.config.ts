import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les URL del web antic (WordPress) acaben amb barra. Les conservem idèntiques
  // perquè Google no hagi de reindexar res i no es perdi posicionament.
  trailingSlash: true,
  experimental: {
    // Tenim un layout arrel per idioma: sense això, les URL inexistents surten amb la 404 nua de Next.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    // Adreces que WordPress generava i que ja no existiran.
    return [
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-content/uploads/:path*", destination: "/", permanent: true },
      { source: "/feed", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
