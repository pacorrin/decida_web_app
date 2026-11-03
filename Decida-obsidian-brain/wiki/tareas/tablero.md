---
type: tareas
tags: [decida, tareas, sprints, seguimiento]
updated: 2026-09-29
---

# Tablero de tareas

Solo tareas y estado de avance. Las reglas de negocio y el porqué de cada decisión viven en [[../decisiones/plan-lanzamiento-60-90-dias]] y en las páginas de producto; aquí no se repiten.

Fechas: se mantienen las **originales del plan** (decisión del 2026-09-28). El retraso se lee comparando la fecha objetivo contra el estado.

Leyenda: ⬜ Pendiente · 🟦 En curso · 🟢 Cerrado · 🔴 Atrasado

## Estado por sprint (al 2026-09-28)

| Sprint | Fechas objetivo | Foco | Estado | Detalle |
|---|---|---|---|---|
| 1 | 10 ago – 23 ago | Cuentas, login, email | 🟢 Cerrado (lo único pendiente, el dominio de Resend, pasó a S3-09) | — |
| 2 | 24 ago – 6 sep | Dashboard `/cuenta` + pulir onboarding | 🟢 Cerrado el 2 sep | — |
| 3 | 7 sep – 20 sep | Suscripción + freemium, hardening para la beta | 🟦 En curso (S3-01 a S3-04 hechas el 29 sep, S3-05 a S3-08 el 14 oct, S3-10 a S3-13 el 15 oct) | [[sprint-3]] |
| 4 | 21 sep – 11 oct | Beta cerrada con cuentas reales | 🔴 No ha arrancado (depende del Sprint 3) | [[#Sprint 4 — Beta cerrada]] |
| 5 | 12 oct – 1 nov | Pago real, panel admin, lanzamiento | ⬜ Pendiente | [[#Sprint 5 — Cierre y lanzamiento]] |

## Orden recomendado para retomar

1. **Suscripción y freemium**: S3-01 a S3-08 ya están en local, con pruebas (Vitest + e2e, ver [[sprint-3]]); falta commitear y probar en un entorno compartido.
2. **Dominio propio en Resend** (S3-09): sin él no puede registrarse nadie más que tú, así que bloquea la beta. Guía lista en [[correo-transaccional-resend]]; falta tu verificación del dominio.
3. ~~Monitoreo de errores con Sentry y analytics del embudo~~ (S3-10 y S3-11 hechas el 15 oct; se sigue puliendo la analítica).
4. ~~Landing y copy con el modelo nuevo~~ (S3-12 y S3-13 hechas el 15 oct).
5. **PDF real** (S3-14), al final: no es necesario para arrancar la beta.

## Sprint 4 — Beta cerrada

- [ ] S4-00 **Desplegar en Railway** (decidido el 2026-09-28: primera tarea de la beta, antes de invitar usuarios; todo se prueba antes en local). Postgres en Railway, variables de entorno (`DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, DSN de Sentry) y dominio.
  - Ojo: la migración de `prisma/migrations/` está desincronizada con `schema.prisma` (le faltan `asmt_name` y `asmt_phone`). Hay que regenerar una migración limpia antes del primer despliegue.
  - Hecho cuando: el flujo completo (registro → onboarding → reporte) funciona en la URL de Railway.
  - **Notas de despliegue (checklist de variables y pasos):**
    - **Sentry:** `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN` (mismo valor; la pública se incrusta al construir, así que debe existir **antes del build**) y `SENTRY_AUTH_TOKEN` para subir source maps. El token ya existe: el wizard lo guardó en `.env.sentry-build-plugin` (local, ignorado por git). Hay que copiar su valor a una variable de Railway a mano; si no se quiere reutilizar, se genera uno nuevo en Sentry → Settings → Auth Tokens. Nunca pegarlo en chat ni commitearlo.
    - **PostHog:** `NEXT_PUBLIC_POSTHOG_KEY` (clave pública `phc_…`, también antes del build) y `NEXT_PUBLIC_POSTHOG_HOST`.
    - **Resend:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `RESEND_BILLING_FROM_EMAIL` con el dominio ya verificado (ver [[../arquitectura/correo-transaccional-resend]]).
    - **Stripe (S3-16):** `STRIPE_SECRET_KEY` (clave `sk_test_…`; `sk_live_…` al pasar a producción real), `STRIPE_WEBHOOK_SECRET` (`whsec_…` del endpoint de producción) y, opcional, `STRIPE_PRICE_ID`. Además, crear en Stripe el webhook de producción: Developers → Webhooks → URL `https://<dominio-de-railway>/api/stripe/webhook` con los eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` e `invoice.payment_failed`; el secreto de firma del endpoint va en `STRIPE_WEBHOOK_SECRET`. Verificar que `NEXT_PUBLIC_APP_URL` sea la URL pública. Guía completa en [[../arquitectura/pagos-con-stripe]].
    - **Base de datos y IA:** `DATABASE_URL` del Postgres de Railway y `OPENAI_API_KEY`.
    - **Migración (hecho el 2026-10-16):** `prisma/migrations/` se regeneró como una sola migración base, `20261016000000_baseline`, que reemplaza a la vieja de junio (que solo traía 7 de las 14 tablas: faltaban `users`, sesiones, códigos de verificación, historial, etc., además de `asmt_name`, `asmt_phone` y los cambios de `payments`). Verificada aplicándola en una base vacía y comparando contra `schema.prisma`: sin diferencias. En Railway se aplica con `pnpm db:deploy` (`prisma migrate deploy`) antes de arrancar. Cada cambio de schema desde aquí necesita su propia migración (`prisma migrate dev`), no `db:push`.
    - **Tu base local** (`decida`) se creó con `db:push` y conserva el registro de la migración vieja en `_prisma_migrations`; por eso `prisma migrate dev` te pedirá reiniciarla. Sigue usando `pnpm db:push` en local, o recrea la base si quieres alinearla.
    - **Después del despliegue:** repetir la prueba de Resend con un correo ajeno, forzar un error para confirmar que llega a Sentry en producción y revisar que lleguen los eventos del embudo a PostHog.
- [ ] S4-01 Definir el grupo de beta (quiénes y cuántos) y cómo se les invita.
- [ ] S4-02 Invitar al grupo y confirmar que cada persona pudo crear su cuenta.
- [ ] S4-03 Recoger feedback sobre el valor del reporte, la cuenta y el historial.
- [ ] S4-04 Revisar el embudo de la beta con los analytics de S3-11.
- [ ] S4-05 Decidir los niveles de suscripción superiores al de $99 (trabajo tuyo, no de desarrollo).

## Sprint 5 — Cierre y lanzamiento

- [x] S5-01 Integrar el cobro recurrente real (Stripe o Mercado Pago) y que el webhook actualice la suscripción de la cuenta. Adelantada a S3-16 (2026-10-16, Stripe; falta probarla con claves reales, ver [[../arquitectura/pagos-con-stripe]]).
- [ ] S5-02 Panel de administración mínimo.
- [ ] S5-03 Lanzamiento público controlado.

## Después de la beta (pendientes que no bloquean el lanzamiento)

- [ ] **Cifra v1 (finanzas personales)**: construida en `dev` el 2026-10-30, **sin pasar a `main`**. Antes de publicar: revisión legal de datos financieros, decidir si se anuncia, y confirmar la migración `20261101000000_cifra` en Railway. Detalle y pendientes en [[../arquitectura/cifra-finanzas-personales]].

- [ ] **Facturación y CFDI** (decidido el 2026-10-29: no se factura en la beta). Al formalizar la plataforma: formalización fiscal con un contador, captura de datos de facturación en la cuenta, emisión del CFDI y todo lo relacionado con el SAT. Detalle y orden en [[../decisiones/facturacion-y-cfdi-despues-de-la-beta]].
- [ ] **Revisión legal de los términos** (vencimiento de créditos y reembolsos). Sigue abierta; es independiente de la facturación.
- [ ] Reescribir los e2e de suscripción que aún apuntan al modelo anterior y revisar la vista móvil.

## Decisiones tuyas pendientes (bloquean tareas)

- [ ] D-01 Opciones y peso de «actividades que evita» (`pfit_avoided_activities`). Bloquea su implementación.
- [ ] D-02 Decidir si la pregunta de modelo de ingreso entra antes o después de la beta.
- [ ] D-03 Qué se siente pobre hoy en «pulir la idea» (mejora A). Bloquea su alcance.
- [ ] D-04 Sesión de alcance del chat sobre el reporte (mejora B). Propuesta para después de la beta.
- [ ] D-05 Niveles de suscripción superiores al de $99 (es la misma tarea que S4-05).

## Ver también
[[prueba-onboarding-2026-10-16]] · [[sprint-3]] · [[../decisiones/plan-lanzamiento-60-90-dias]] · [[../producto/roadmap-y-backlog]] · [[../producto/pricing-y-gtm]] · [[../overview]]
