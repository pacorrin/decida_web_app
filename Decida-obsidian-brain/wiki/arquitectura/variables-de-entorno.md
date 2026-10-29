---
type: arquitectura
tags: [decida, configuracion, entorno, openai, stripe]
updated: 2026-10-29
---

# Variables de entorno

Inventario completo de las variables que lee el código. La versión con tablas está en el `README.md` del repo y la plantilla es `.env.example`. **Si agregas una variable al código, actualiza las tres cosas.** Las `NEXT_PUBLIC_*` se incrustan al compilar: en Railway deben existir antes del build. Cambiar una variable exige reiniciar `pnpm dev`.

## Las que se pierden de vista
Estas **no estaban** en `.env.example` hasta el 2026-10-29 y tienen un valor por defecto en el código:

| Variable | Valor por defecto | Qué controla |
|---|---|---|
| `OPENAI_MODEL_RESEARCH` | `gpt-4.1-mini` | Búsquedas web generales de la investigación |
| `OPENAI_MODEL_RESEARCH_OFFICIAL` | `gpt-4.1` | Tamaño de mercado con dominios oficiales. **Debe ser `gpt-4.1`**: los modelos mini devuelven 400 con ese filtro |
| `OPENAI_MODEL_RESEARCH_STRUCTURE` | `gpt-4o-mini` | Ordena lo hallado en la ficha de mercado |
| `OPENAI_MODEL_JUDGE` | `gpt-4.1` | Juez LLM de los evals (no es de la app) |
| `REPORT_RESEARCH_MAX_SEARCHES` | `5` | Búsquedas web por reporte |
| `REPORT_RESEARCH_MAX_COST_USD` | `0.30` | Tope de costo de la investigación |
| `REPORT_RESEARCH_MAX_OUTPUT_TOKENS` | `1500` | Tokens de salida por búsqueda |
| `REPORT_RESEARCH_TIMEOUT_MS` | `40000` | Tiempo máximo por búsqueda |
| `REPORT_RESEARCH_SEARCH_FEE_USD` | `0.03` | Tarifa estimada por búsqueda (la real es $0.01) |
| `REPORT_DEFAULT_MARKET_COUNTRY(_CODE)` | `México` / `MX` | Mercado cuando la idea no lo indica |

## Modelos de OpenAI (quién usa cuál)
| Función | Variable | Por defecto |
|---|---|---|
| Redacción de las secciones y resumen de la idea | `OPENAI_MODEL_NARRATIVE` | `gpt-4o-mini` |
| Interpretación de puntajes y revisión | `OPENAI_MODEL_REASONING` (+ `OPENAI_REASONING_EFFORT`, `medium`) | `gpt-5-mini` |
| Búsquedas web generales | `OPENAI_MODEL_RESEARCH` | `gpt-4.1-mini` |
| Tamaño de mercado (fuentes oficiales) | `OPENAI_MODEL_RESEARCH_OFFICIAL` | `gpt-4.1` |
| Ficha de mercado | `OPENAI_MODEL_RESEARCH_STRUCTURE` | `gpt-4o-mini` |

- **Alerta:** `o4-mini` fue **dado de baja** (404). Con él la revisión fallaba y la interpretación caía en reglas fijas **sin avisar**. Las llamadas de razonamiento tienen respaldo silencioso; las de redacción no.
- **Precios verificados el 2026-10-29** (USD por millón de tokens, entrada/salida): `gpt-4o-mini` 0.15/0.60 · `gpt-5-mini` 0.25/2.00 · `gpt-4.1-mini` 0.40/1.60 · `gpt-4.1` 2.00/8.00. Búsqueda web: $10 por 1,000 llamadas. Viven en `MODEL_PRICES_USD_PER_M` (`src/lib/ai/research/config.ts`), que solo **estima** costos.
- **Costo real medido** de un reporte con investigación: ≈ $0.13 USD (tokens ~$0.08 + 5 búsquedas a $0.01); el código muestra ~$0.23 por usar $0.03 por búsqueda.

## Reporte
| Variable | Por defecto |
|---|---|
| `REPORT_REVIEW_ENABLED` | `true` |
| `REPORT_REVIEW_MAX_ISSUES` | `6` |
| `REPORT_REVIEW_MAX_REWRITES` | `4` |
| `REPORT_RESEARCH_ENABLED` | `posthog` (`true` / `false` / flag `report-research`) |

## Stripe, correo y monitoreo
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_EXPLORA`, `STRIPE_PRICE_VALIDA`, `STRIPE_PRICE_ESCALA`. Todo es **por organización y por modo**. Detalle de los planes: [[../decisiones/modelo-de-creditos-hibrido]] y [[pagos-con-stripe]].
- **Resend:** `RESEND_API_KEY` (obligatoria solo en producción), `RESEND_FROM_EMAIL`, `RESEND_BILLING_FROM_EMAIL`. Ver [[correo-transaccional-resend]].
- **Sentry:** `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (solo build).
- **PostHog:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
- **Base y app:** `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY`.

## Para producción (Railway)
Checklist al desplegar: `DATABASE_URL`, `OPENAI_API_KEY`, **`OPENAI_MODEL_REASONING=gpt-5-mini`**, `NEXT_PUBLIC_APP_URL`, claves de Stripe de **modo real**, los tres `STRIPE_PRICE_*` de modo real y el endpoint de webhook con sus 6 eventos, `RESEND_API_KEY`, Sentry y PostHog (antes del build), y `REPORT_RESEARCH_ENABLED=true` (o el flag en PostHog).

## Retiradas
`STRIPE_PRICE_ID` (suscripción única de $99), `STRIPE_PRICE_CREDITS_1/3/10` (paquetes de pago único) y `SUBSCRIPTIONS_ENABLED` ya no existen.
