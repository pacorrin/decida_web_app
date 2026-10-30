import { SITE_NAME, siteUrl } from "@/lib/seo";

/** Datos estructurados de la marca y el sitio, para que los buscadores la identifiquen. */
export function SiteJsonLd() {
  const url = siteUrl();
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url,
      logo: `${url}/email/logo.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url,
      inLanguage: "es-MX",
    },
  ];
  return (
    <script
      type="application/ld+json"
      // `<` escapado para que ningún valor pueda cerrar la etiqueta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
