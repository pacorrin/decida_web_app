import type { MetadataRoute } from "next";
import { isIndexableSite, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Local o dirección de prueba: que nadie indexe una copia del sitio.
  if (!isIndexableSite()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Cuenta, flujo del análisis y API: privados, no hay nada que indexar.
      disallow: ["/cuenta", "/analizar", "/api", "/mis-evaluaciones"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
