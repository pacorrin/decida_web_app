---
type: arquitectura
tags: [decida, seo, sitemap, robots, metadatos, indexacion]
updated: 2026-10-29
---

# SEO, sitemap y robots

Fuentes: `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/seo/json-ld.tsx`, `src/lib/__tests__/seo.test.ts`.

## Qué se indexa
Solo las páginas públicas: **`/`**, **`/ejemplo`**, **`/privacidad`** y **`/terminos`** (lista `PUBLIC_PAGES` en `src/lib/seo.ts`). Cuenta, flujo del análisis, API y `/mis-evaluaciones` son privados y el robots los bloquea.

## Sitemap (`/sitemap.xml`)
- URLs absolutas con el dominio de `NEXT_PUBLIC_APP_URL` (en producción `https://decida.mx`).
- Cada página lleva su `lastModified` con la **fecha real del último cambio de contenido** (no de código ni de analítica). Google solo confía en esa fecha si es exacta, así que **hay que actualizarla en `PUBLIC_PAGES` al cambiar el contenido de una página**; no se genera en cada despliegue a propósito.
- Se quitaron `changeFrequency` y `priority`: Google los ignora.

## Robots (`/robots.txt`)
- En el dominio real: permite todo, bloquea `/cuenta`, `/analizar`, `/api` y `/mis-evaluaciones`, y apunta al sitemap.
- **En local y en cualquier dirección de prueba** (`localhost`, `*.railway.app`) bloquea todo y no anuncia sitemap, para que nadie indexe una copia del sitio. Un dominio de producción mal configurado en `NEXT_PUBLIC_APP_URL` también quedaría bloqueado: revisar esa variable si algún día el robots dice `Disallow: /` en producción.

## Metadatos por página
`pageMetadata()` define para cada página pública su título, descripción, **URL canónica**, Open Graph (con `og:url`, nombre del sitio e imagen) y tarjeta de Twitter. Antes `/ejemplo` y las páginas legales heredaban el título de Open Graph de la landing y ninguna tenía canónica. Las páginas privadas siguen con los metadatos del layout raíz.

## Datos estructurados
La landing incluye JSON-LD de `Organization` y `WebSite` (nombre, URL y logo). No se agregó FAQ ni valoraciones: Google limita las FAQ a ciertos sitios y no hay reseñas reales que declarar.

## Cómo verificar en producción
`https://decida.mx/sitemap.xml` y `https://decida.mx/robots.txt`; y la canónica y el Open Graph en el código fuente de cada página.

## Pendiente (lo hace el usuario)
- Dar de alta `decida.mx` en **Google Search Console** y enviar `https://decida.mx/sitemap.xml` (y en Bing Webmaster Tools, si se quiere).
- Confirmar que `og-image.png` (1200×630) representa bien la marca al compartir el enlace.
- Un texto alternativo y títulos únicos ya existen; el contenido de la landing es lo que más pesa en el posicionamiento.

## Ver también
[[despliegue-en-railway]] · [[analitica-y-eventos]] · [[../experiencia/landing-y-copy]] · [[variables-de-entorno]]
