import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ejemplo", "/privacidad", "/terminos"],
      // Páginas privadas o de flujo: no tienen nada que indexar.
      disallow: ["/cuenta", "/analizar", "/api", "/mis-evaluaciones"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
