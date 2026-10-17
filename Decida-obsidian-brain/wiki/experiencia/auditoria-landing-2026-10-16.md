---
type: experiencia
tags: [decida, landing, copy, auditoria, ux-writing]
updated: 2026-10-16
---

# Auditoría de la landing (2026-10-16)

> **Corregido el mismo día** (ver «Cambios aplicados» al final). Quedan pendientes la prueba social y una captura real del reporte, que esperan a tener usuarios de la beta.

Revisión hecha en Chrome (escritorio y 390 px) y contra el código de `src/components/landing/`, antes del despliegue. Complementa [[landing-y-copy]]. Estructura actual: Hero (con tarjeta de ejemplo) → El problema → Cómo decide (3 pasos + 6 dimensiones) → Ejemplo de resultado → ¿Es para ti? → Precio (Gratis / $99 MXN) → FAQ → CTA final → pie.

## Bloquea el despliegue (el texto sería falso o rompe algo)
1. **«En beta, el pago es simulado y no se hace ningún cargo»** (`pricing-section.tsx`) deja de ser cierto con Stripe en vivo. Hacerlo condicional: claves de prueba → «Modo de prueba: no se hace ningún cargo»; claves live → sin ese aviso.
2. **«Plan de validación de dos semanas»** (`REPORT_INCLUDES`): el plan real es de **4 semanas** (así lo genera la IA y lo muestra `/ejemplo`).
3. **Imagen para compartir en SVG** (`og-image.svg`): WhatsApp, LinkedIn, Facebook y X no muestran SVG como vista previa. Hace falta PNG/JPG de 1200×630. Además `og:url` e imágenes salen con `localhost`: definir `metadataBase` con la URL pública.
4. **Contradicción de tiempo:** la landing dice «10–15 minutos» (hero, FAQ, CTA final) y el onboarding muestra «~20 min» desde el paso 2. Elegir un número y unificarlo.
5. **Logo con una «M»** (`public/logo.svg` dibuja una M) junto al nombre «Decida». Parece un resto de otro proyecto.

## Copy que no refleja lo nuevo
- Faltan en el FAQ: ¿es gratis?, ¿cómo funciona la suscripción y cómo se cancela?, ¿qué pasa con mis evaluaciones si cancelo?, ¿mi idea es privada y quién la ve?, ¿se usa IA?, ¿qué pasa si el reporte no se genera? (ya no hay reembolsos: la respuesta debe ser honesta).
- La FAQ dice «una idea por evaluación» y no explica el límite del plan gratis (1 evaluación).
- «Qué incluye tu reporte» lista todo como si el plan gratis lo tuviera; marcar lo que es gratis y lo que es de suscripción.
- El hero promete «avanzar, ajustar o pausar», pero el resultado más común (y el de la tarjeta de ejemplo) es **«validar antes de invertir»**. Alinear con las 4 recomendaciones reales.
- Falta una línea de privacidad cerca del CTA («tu idea es privada») y un correo de contacto (`hello@decida.mx`) en el pie.

## UX writing
- CTA inconsistente: «Analizar mi idea» (encabezado) vs «Analizar mi idea gratis» (resto). Unificar.
- «Mi cuenta» para quien no ha iniciado sesión: mejor «Iniciar sesión».
- «Cómo decide» (menú) es ambiguo: «Cómo funciona».
- «Empezar y suscribirme después» (tarjeta de pago) lleva al mismo lugar que el botón gratis; redundante y confuso.
- «esta idea» en el titular es deíctico; «tu idea» habla a la persona.
- Anglicismos: «side hustle» (FAQ), «Business Viability Assessment» (pie, og:title, twitter:title).
- Mismo ejemplo con dos nombres («Detailing móvil de autos» / «Servicio de detailing móvil») y repetido en la tarjeta del hero y en la sección de ejemplo.
- Los chips del hero se distinguen solo por color; añadir el estado en texto (Favorable / Requiere validación).

## Faltantes de credibilidad
- Sin prueba social, sin quién está detrás y sin muestra visual del reporte real (captura con semáforos).
- Sin `sitemap.xml` ni `robots.txt`.

## Lo que está bien
Tono honesto sin promesas de riqueza, «¿Es para ti?» con límites claros, buen titular del problema («Las ideas no fallan en la cabeza…»), precios gratis-primero, vista móvil limpia.

## Cambios aplicados (2026-10-16)
- **Tiempo:** «15 a 20 minutos» en el hero, el FAQ y el CTA final (coincide con el «~20 min» del onboarding).
- **Logo:** `branding/logo_light.svg` (onda con punto coral) reemplaza a la «M». `public/logo.svg` es el mismo dibujo con el lienzo recortado (viewBox `148 148 626 380`); se actualizaron las 4 apariciones (encabezado, pie, reporte, cuenta). Icono de pestaña: `src/app/icon.svg` y `apple-icon.png` (se borró el `favicon.ico` viejo).
- **Imagen para compartir:** `public/og-image.png` (1200×630, PNG), generada con sharp desde `branding/og-image.svg` (fuente editable). El SVG viejo traía además un carácter roto en «¿Vale…». Los títulos para compartir ya no están en inglés.
- **Aviso de pago condicional** (`pricing-section.tsx` + `isStripeTestMode` en `src/lib/stripe/config.ts`): sin Stripe → «pago simulado»; claves `sk_test_` → «modo de prueba: no se hace ningún cargo real»; claves reales → «Pago seguro con Stripe». Con la clave real ya no aparece nada falso.
- **Reporte:** «plan de validación de cuatro semanas» y cada elemento marcado como Gratis / Parcial gratis / Suscripción.
- **UX writing:** titular «¿Tu idea vale el tiempo y el dinero que le vas a poner?» (también título y descripción de la página); subtítulo con las 4 recomendaciones reales; un solo CTA «Analizar mi idea gratis» en toda la página; «Cómo funciona» y «Entrar» en el menú; la tarjeta de pago ya no tiene un botón redundante; «side hustle» → «negocio secundario»; chips del ejemplo con estado en texto; un solo nombre para el ejemplo.
- **FAQ:** 6 preguntas nuevas (¿es gratis?, suscripción y cancelación, qué pasa con mis evaluaciones, privacidad, IA, reporte que no se genera).
- **Privacidad:** `/privacidad` ahora lista los proveedores (OpenAI, Stripe, Resend, PostHog y Sentry, Railway); antes no decía que el texto de la idea se procesa con OpenAI. **Conviene que lo revise un abogado.**
- **Pie:** contacto `hello@decida.mx`. **SEO:** `sitemap.xml` y `robots.txt` (bloquea `/cuenta`, `/analizar` y `/api`).
- **Al desplegar:** definir `NEXT_PUBLIC_APP_URL` con la URL pública, porque de ahí salen la imagen para compartir, el sitemap y el robots.
