---
type: arquitectura
tags: [decida, railway, despliegue, produccion, ramas, migraciones]
updated: 2026-10-29
---

# Despliegue en Railway y flujo de ramas

Fuentes: `package.json` (scripts), `prisma.config.ts`, [[variables-de-entorno]], [[vendors-y-costos#Railway]]. Estado al 2026-10-29.

## Flujo de ramas
- **`dev`** es la rama de trabajo: todo cambio se hace y se sube ahí.
- **`main`** es **producción**: Railway despliega desde `main`. Un cambio llega a producción solo con **merge de `dev` a `main`**, y eso dispara un despliegue.
- Antes de pasar algo a `main`: `npx tsc --noEmit`, `npx vitest run` y eslint de lo tocado.

## Proyecto en Railway
| Cosa | Valor |
|---|---|
| Proyecto | `Decida MX` (id `efd1c217-93db-41f8-9b9e-cd5af1bf47ff`) |
| Ambiente | `production` |
| Base de datos | servicio `Postgres` (plantilla de Railway, PostgreSQL 18). **Sin proxy TCP público**: solo se alcanza por la red privada (`postgres.railway.internal`) |
| App | servicio `decida-app`, conectado al repo `pacorrin/decida_web_app`, **rama `main`**; se construye con Railpack (Node y pnpm) |
| Plan | Hobby |

## Migraciones
Las migraciones corren **solas antes de cada despliegue**: el servicio tiene como comando de pre-despliegue `pnpm db:deploy` (`prisma migrate deploy`), que se ejecuta por la red privada contra la base de producción. Si una migración falla, el despliegue falla y la versión anterior sigue sirviendo. Primer despliegue (2026-10-29): se aplicaron las 7 migraciones, hasta `20261030000000_verification_attempts`.

Consecuencia: una migración nueva llega a producción junto con el merge a `main`, no por separado. Probarla antes con `pnpm db:push` en local.

## Variables
- **Ya puestas:** `DATABASE_URL` (por referencia al servicio `Postgres`, `${{Postgres.DATABASE_URL}}`, así no hay contraseñas copiadas) y `OPENAI_MODEL_REASONING=gpt-5-mini`.
- **Pendientes (las carga el usuario):** `OPENAI_API_KEY`; Stripe en modo real (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_EXPLORA`, `STRIPE_PRICE_VALIDA`, `STRIPE_PRICE_ESCALA`); Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_BILLING_FROM_EMAIL`); Sentry (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`); PostHog (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`); Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`); `NEXT_PUBLIC_APP_URL` (el dominio público real); y decidir `REPORT_RESEARCH_ENABLED`.
- **No poner** `TURNSTILE_DISABLED` en producción (se ignora, pero no debe estar).
- Las `NEXT_PUBLIC_*` se incrustan **al construir**: después de cargarlas hay que **redesplegar** para que surtan efecto.
- El webhook de Stripe necesita primero un dominio público para dar de alta su URL; de ahí sale el `whsec_` que vuelve a Railway.

## Operación (comandos útiles)
- Ver estado: `railway deployment list --service decida-app --json`; logs de arranque y migración: `railway logs --service decida-app --deployment`.
- **Redesplegar desde el repo** cuando el último despliegue falló o no se puede reintentar (`railway redeploy` se niega): mutación `serviceInstanceDeployV2` de la API de Railway. `railway up` **no** sirve para esto: sube la carpeta local (la rama `dev`), no `main`.
- **Cambiar el comando de pre-despliegue:** `railway environment edit --service-config` respondió «No changes to apply» y no lo guardó; se hizo con la mutación `environmentPatchCommit` de la API (`deploy.preDeployCommand`).
- Un despliegue puede fallar por la infraestructura de Railway y no por el código (el 2026-10-29 el servicio de construcción respondió «connection refused»): se reintenta.
- No hay acceso por SSH sin una llave configurada en Railway.

## Pendiente
Dominio público y DNS en Hostinger ([[vendors-y-costos#Hostinger]]), cargar las claves, webhook y portal de Stripe en modo real, la compra real de MX$59 con su reembolso, y el límite mensual de gasto en OpenAI. Ver [[seguridad-y-proteccion-de-costos]].

## Ver también
[[variables-de-entorno]] · [[vendors-y-costos]] · [[seguridad-y-proteccion-de-costos]] · [[pagos-con-stripe]] · [[stack-tecnico]]
