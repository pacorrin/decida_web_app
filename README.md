# Decida

Diagnóstico de viabilidad de ideas de negocio: evalúa una idea contra las condiciones reales de la persona (tiempo, presupuesto, perfil, mercado y riesgo) y entrega una recomendación clara. Los puntajes salen de reglas fijas; la IA interpreta, investiga el mercado con fuentes citadas y redacta el reporte.

**Stack:** Next.js 16 (App Router, React 19) · Prisma 7 sobre PostgreSQL · OpenAI · Stripe (planes mensuales con créditos) · Resend · Sentry · PostHog.

> Este proyecto usa una versión de Next.js con cambios incompatibles. Antes de escribir código, lee la guía correspondiente en `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Empezar

Requisitos: Node, [pnpm](https://pnpm.io) y Docker (para PostgreSQL).

```bash
pnpm install          # también genera el cliente de Prisma
cp .env.example .env  # y completa las variables (ver abajo)
pnpm db:up            # PostgreSQL local (usuario, contraseña y base: decida)
pnpm db:push          # sincroniza la base de desarrollo con prisma/schema.prisma
pnpm dev              # http://localhost:3000
```

`.env` es obligatorio y no se versiona: `pnpm install` falla sin él porque `prisma.config.ts` lee `DATABASE_URL`. Para el webhook de Stripe en local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed,charge.refunded
```

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` / `build` / `start` | Desarrollo, compilación de producción y servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm test` | Pruebas unitarias y de integración (Vitest; algunas usan la base local) |
| `pnpm test:e2e` | Recorridos de extremo a extremo (Playwright) |
| `pnpm db:up` / `db:down` | Enciende o apaga PostgreSQL con Docker |
| `pnpm db:push` | Sincroniza la base de **desarrollo** con el esquema |
| `pnpm db:deploy` | Aplica las migraciones de `prisma/migrations/` (producción) |
| `pnpm db:studio` | Explorador visual de la base |
| `pnpm evals` | Evals del reporte: 15 casos, juez LLM y comparación con el baseline. Cuesta dinero; ver `docs/evals.md` |

## Variables de entorno

Plantilla: [`.env.example`](.env.example). Las que empiezan con `NEXT_PUBLIC_` se incrustan en el navegador al compilar, así que en producción deben existir **antes del build**. Cambiar una variable exige reiniciar `pnpm dev`.

### Base de datos y aplicación
| Variable | Obligatoria | Por defecto | Para qué sirve |
|---|---|---|---|
| `DATABASE_URL` | Sí | — | Conexión a PostgreSQL. Local: `postgresql://decida:decida@localhost:5432/decida?schema=public` |
| `NEXT_PUBLIC_APP_URL` | Recomendada | `http://localhost:3000` | URL pública de la app: enlaces de correos y retornos de Stripe |

### OpenAI (solo servidor)
| Variable | Obligatoria | Por defecto | Para qué sirve |
|---|---|---|---|
| `OPENAI_API_KEY` | Sí | — | Clave de la API |
| `OPENAI_MODEL_NARRATIVE` | No | `gpt-4o-mini` | Redacción de las secciones del reporte y resúmenes de la idea |
| `OPENAI_MODEL_REASONING` | No | `gpt-5-mini` | Razonamiento: interpretación de puntajes y pasada de revisión. Si el modelo falla, la interpretación cae en reglas fijas **sin avisar** (pasó con `o4-mini`, dado de baja) |
| `OPENAI_REASONING_EFFORT` | No | `medium` | Esfuerzo del modelo de razonamiento: `low`, `medium` o `high` |
| `OPENAI_MODEL_RESEARCH` | No | `gpt-4.1-mini` | Búsquedas web generales de la investigación (competidores, precios, costos, canales) |
| `OPENAI_MODEL_RESEARCH_OFFICIAL` | No | `gpt-4.1` | Búsqueda del tamaño de mercado, limitada a dominios oficiales. Debe ser `gpt-4.1`: los modelos mini rechazan ese filtro |
| `OPENAI_MODEL_RESEARCH_STRUCTURE` | No | `gpt-4o-mini` | Ordena lo encontrado en la ficha de mercado |
| `OPENAI_MODEL_JUDGE` | No | `gpt-4.1` | Juez LLM de los evals (no se usa en la app) |

### Reporte: revisión e investigación
| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `REPORT_REVIEW_ENABLED` | `true` | Pasada de revisión de consistencia; `false` la apaga |
| `REPORT_REVIEW_MAX_ISSUES` | `6` | Con más problemas el reporte se marca «requiere revisión humana» y no se reescribe |
| `REPORT_REVIEW_MAX_REWRITES` | `4` | Máximo de secciones que la revisión reescribe |
| `REPORT_RESEARCH_ENABLED` | `posthog` | Investigación con búsqueda web: `true` siempre, `false` nunca, `posthog` según el flag `report-research` (sin PostHog, apagada) |
| `REPORT_RESEARCH_MAX_SEARCHES` | `5` | Tope de búsquedas web por reporte |
| `REPORT_RESEARCH_MAX_COST_USD` | `0.30` | Tope de costo estimado de la investigación por reporte |
| `REPORT_RESEARCH_MAX_OUTPUT_TOKENS` | `1500` | Tokens de salida máximos por búsqueda |
| `REPORT_RESEARCH_TIMEOUT_MS` | `40000` | Tiempo máximo de cada búsqueda |
| `REPORT_RESEARCH_SEARCH_FEE_USD` | `0.03` | Tarifa **estimada** por búsqueda para el presupuesto (la real de OpenAI es $0.01; se usa más alta como colchón) |
| `REPORT_DEFAULT_MARKET_COUNTRY` | `México` | País del mercado objetivo cuando la idea no lo indica |
| `REPORT_DEFAULT_MARKET_COUNTRY_CODE` | `MX` | Código ISO de ese país |

### Stripe (planes mensuales con créditos)
| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `STRIPE_SECRET_KEY` | No en desarrollo | Clave secreta (`sk_test_...` en pruebas). Sin ella, el plan se activa en modo simulado (desarrollo y e2e) |
| `STRIPE_WEBHOOK_SECRET` | Con Stripe | Firma del webhook (`whsec_...`). Local: lo imprime `stripe listen`; producción: el endpoint en el Dashboard |
| `STRIPE_PRICE_EXPLORA` | Recomendada | `price_...` recurrente mensual de **Explora** ($59 MXN, 200 créditos) |
| `STRIPE_PRICE_VALIDA` | Recomendada | `price_...` de **Valida** ($149, 600 créditos) |
| `STRIPE_PRICE_ESCALA` | Recomendada | `price_...` de **Escala** ($399, 2,000 créditos) |

Sin los `STRIPE_PRICE_*`, Checkout usa precios en línea con los montos del código y el plan se reconoce por la metadata; con ellos se reconoce por el precio que cobra Stripe, también tras un cambio de plan en el portal. Las claves y los productos son **por organización y por modo** (prueba o real).

### Correo (Resend)
| Variable | Obligatoria | Por defecto | Para qué sirve |
|---|---|---|---|
| `RESEND_API_KEY` | Solo en producción | — | Sin ella, en desarrollo los correos se imprimen en la consola del servidor |
| `RESEND_FROM_EMAIL` | No | — | Remitente de códigos de verificación y restablecimiento. Debe ser de un dominio verificado en Resend, p. ej. `Decida <hello@decida.mx>` |
| `RESEND_BILLING_FROM_EMAIL` | No | `Decida <billing@decida.mx>` | Remitente de los correos de cobro del plan (los recibos los manda Stripe) |

### Captcha (Cloudflare Turnstile)
| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Sí, en producción | Clave pública del widget (debe existir antes del build) |
| `TURNSTILE_SECRET_KEY` | Sí, en producción | Clave secreta; el servidor valida con ella el token de cada registro. Sin ella, en producción el formulario se rechaza |
| `TURNSTILE_DISABLED` | No | `true` apaga el captcha. **Solo funciona fuera de producción** (desarrollo y e2e); en producción se ignora |

Cloudflare ofrece claves de prueba que siempre aprueban (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`). El widget se pone en `/analizar/contacto` y `/cuenta/registro`; el widget real debe tener en su lista de hostnames `localhost` y el dominio de producción.

### Monitoreo y analítica
| Variable | Para qué sirve |
|---|---|
| `SENTRY_DSN` | DSN de Sentry para el servidor. Sin DSN, Sentry no envía nada |
| `NEXT_PUBLIC_SENTRY_DSN` | El mismo DSN para el navegador (debe existir antes del build) |
| `SENTRY_AUTH_TOKEN` | Solo para subir source maps durante el build (Sentry → Settings → Auth Tokens) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Token del proyecto de PostHog (público, antes del build) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host de PostHog (público, antes del build) |

### Pruebas y herramientas (no son de la app)
| Variable | Para qué sirve |
|---|---|
| `E2E_BASE_URL` | URL contra la que corre Playwright (`pnpm test:e2e`). Si reutilizas un `pnpm dev` ya abierto, arráncalo con `TURNSTILE_DISABLED=true` |
| `CI` | La define el entorno de CI; Playwright y la subida de source maps la leen |
| `LINEAR_API_KEY` | Solo para `scripts/create-onboarding-linear-items.mjs` |
| `NODE_ENV`, `NEXT_RUNTIME` | Las define Next.js; no se configuran a mano |

## Documentación

- **Cerebro del proyecto (Obsidian):** `Decida-obsidian-brain/` — decisiones, arquitectura, producto y tareas. Empieza por `index.md`. Las variables de entorno también están en `wiki/arquitectura/variables-de-entorno.md`.
- **Pipeline del reporte:** `docs/report-pipeline-current.md` · **Evals:** `docs/evals.md` · **Búsqueda web:** `docs/decision-busqueda.md` · **Resultados por paso:** `docs/resultados-paso-*.md`.
- **Créditos y planes:** `Decida-obsidian-brain/wiki/decisiones/modelo-de-creditos-hibrido.md`.
