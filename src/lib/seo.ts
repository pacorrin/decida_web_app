import type { Metadata } from "next";

export const SITE_NAME = "Decida";
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Decida: diagnóstico de viabilidad de tu idea de negocio",
};

/** URL pública del sitio, sin diagonal final. Se lee al llamar, no al importar. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Solo el dominio real se indexa. En local y en cualquier dirección de prueba
 * (p. ej. la de Railway) el robots bloquea todo para no duplicar contenido.
 */
export function isIndexableSite(): boolean {
  try {
    const host = new URL(siteUrl()).hostname;
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".railway.app");
  } catch {
    return false;
  }
}

/**
 * Páginas públicas que se indexan. `lastModified` es la fecha del último cambio
 * REAL de contenido de esa página (no de código ni de analítica): Google solo
 * confía en esa fecha si es exacta. Actualízala al cambiar el contenido.
 */
export const PUBLIC_PAGES = [
  { path: "", lastModified: "2026-10-28" },
  { path: "/cifra", lastModified: "2026-10-30" },
  { path: "/ejemplo", lastModified: "2026-10-15" },
  { path: "/privacidad", lastModified: "2026-10-30" },
  { path: "/terminos", lastModified: "2026-10-28" },
] as const;

/** Metadatos de una página pública: título, descripción, canónica, Open Graph y Twitter. */
export function pageMetadata(input: {
  title: string;
  description: string;
  /** Ruta de la página ("" para la raíz). */
  path: string;
}): Metadata {
  const { title, description, path } = input;
  const canonical = path === "" ? "/" : path;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_MX",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
