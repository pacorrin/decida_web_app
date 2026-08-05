---
type: arquitectura
tags: [decida, stack, tecnico]
updated: 2026-08-05
---

# Stack técnico

Fuente: [[../../raw/notion/08-technical-architecture-v1]] · `package.json` · `AGENTS.md`

## Stack real (código, más específico que la hipótesis de Notion)
- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Prisma 7** sobre **PostgreSQL** (vía `@prisma/adapter-pg`, no el driver directo)
- **OpenAI SDK** (`openai` npm package) para IA — con fallback determinístico si falla (ver [[../framework/scoring-engine]])
- **Zod** para validación de schemas de IA y formularios
- **shadcn** + Tailwind CSS 4 para UI
- **react-markdown** + `remark-gfm` + `rehype-raw` — renderizado markdown en respuestas de IA
- **embla-carousel-react** — carrusel en landing
- **Playwright** — pruebas end-to-end (`test:e2e`)

Esto es notablemente más específico y "productizado" que la hipótesis original de Notion ("Next.js, TypeScript, Server Actions, base de datos simple o JSON, Stripe o Mercado Pago, IA barata, PDF").

## Lo que NO se implementó (vs hipótesis original)
- **Pago real** (Stripe/Mercado Pago): no confirmado en el código — el paso `/analizar/pago` es un **pago simulado (beta)**, con promesa de reembolso si el reporte falla. Ver [[../producto/pricing-y-gtm]].
- **Generación de PDF**: no se confirmó un generador de PDF en la exploración de código realizada para este cerebro — a verificar en una próxima sesión (buscar en `src/lib` o dependencias como `puppeteer`/`react-pdf`).
- **App móvil, multi-tenant, microservicios, Redis, colas**: siguen fuera de alcance, consistente con el diseño original.

## Lo que SÍ se implementó más allá de la hipótesis original
- **Modelo relacional completo** en Prisma (10 entidades normalizadas), no la alternativa JSON simple que Notion sugería para "lanzar rápido". Ver [[modelo-de-datos]].
- **Historial de evaluaciones** con verificación por email (`verification_codes`, `history_sessions`) — Notion lo marcaba explícitamente como fuera de alcance V1. Ver [[historial-de-evaluaciones]].
- **Manejo de errores y reintentos robusto** para la generación de reportes, con logging estructurado. Ver [[manejo-de-errores-y-reembolsos]].
- **Testing E2E con Playwright** — no mencionado en el diseño original.

## Entorno de desarrollo (`AGENTS.md`, gotchas confirmados)
- `.env` requerido y gitignored; sin él, `prisma generate` (postinstall) falla.
- La migración commiteada en `prisma/migrations/` puede quedar desincronizada del schema — usar `pnpm db:push` para sincronizar en desarrollo, no `prisma migrate deploy`.
- `OPENAI_API_KEY` es opcional: el resumen/refinamiento de idea y el reporte tienen fallbacks determinísticos, así que el flujo completa sin IA (con contenido degradado).
- PostgreSQL corre en Docker (`decida-postgres`, puerto 5432, user/pass/db = `decida`).

## Ver también
[[modelo-de-datos]] · [[manejo-de-errores-y-reembolsos]] · [[../framework/scoring-engine]]
