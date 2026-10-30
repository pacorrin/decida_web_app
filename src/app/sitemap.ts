import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, siteUrl } from "@/lib/seo";

/**
 * Solo páginas públicas e indexables, con su fecha real de último cambio. Se
 * omiten `changeFrequency` y `priority`: Google los ignora.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PAGES.map(({ path, lastModified }) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
