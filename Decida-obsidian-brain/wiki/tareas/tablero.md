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
| 3 | 7 sep – 20 sep | Suscripción + freemium, hardening para la beta | 🟦 En curso (S3-01 a S3-04 hechas en local el 29 sep) | [[sprint-3]] |
| 4 | 21 sep – 11 oct | Beta cerrada con cuentas reales | 🔴 No ha arrancado (depende del Sprint 3) | [[#Sprint 4 — Beta cerrada]] |
| 5 | 12 oct – 1 nov | Pago real, panel admin, lanzamiento | ⬜ Pendiente | [[#Sprint 5 — Cierre y lanzamiento]] |

## Orden recomendado para retomar

1. **Suscripción y freemium**: S3-05 a S3-08 de [[sprint-3]] (S3-01 a S3-04 ya están en local).
2. **Dominio propio en Resend** (S3-09): sin él no puede registrarse nadie más que tú, así que bloquea la beta.
3. **Monitoreo de errores con Sentry y analytics del embudo** (S3-10, S3-11).
4. **Landing y copy** con el modelo nuevo (S3-12, S3-13).
5. **PDF real** (S3-14), al final: no es necesario para arrancar la beta.

## Sprint 4 — Beta cerrada

- [ ] S4-00 **Desplegar en Railway** (decidido el 2026-09-28: primera tarea de la beta, antes de invitar usuarios; todo se prueba antes en local). Postgres en Railway, variables de entorno (`DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, DSN de Sentry) y dominio.
  - Ojo: la migración de `prisma/migrations/` está desincronizada con `schema.prisma` (le faltan `asmt_name` y `asmt_phone`). Hay que regenerar una migración limpia antes del primer despliegue.
  - Hecho cuando: el flujo completo (registro → onboarding → reporte) funciona en la URL de Railway.
- [ ] S4-01 Definir el grupo de beta (quiénes y cuántos) y cómo se les invita.
- [ ] S4-02 Invitar al grupo y confirmar que cada persona pudo crear su cuenta.
- [ ] S4-03 Recoger feedback sobre el valor del reporte, la cuenta y el historial.
- [ ] S4-04 Revisar el embudo de la beta con los analytics de S3-11.
- [ ] S4-05 Decidir los niveles de suscripción superiores al de $99 (trabajo tuyo, no de desarrollo).

## Sprint 5 — Cierre y lanzamiento

- [ ] S5-01 Integrar el cobro recurrente real (Stripe o Mercado Pago) y que el webhook actualice la suscripción de la cuenta.
- [ ] S5-02 Panel de administración mínimo.
- [ ] S5-03 Lanzamiento público controlado.

## Decisiones tuyas pendientes (bloquean tareas)

- [ ] D-01 Opciones y peso de «actividades que evita» (`pfit_avoided_activities`). Bloquea su implementación.
- [ ] D-02 Decidir si la pregunta de modelo de ingreso entra antes o después de la beta.
- [ ] D-03 Qué se siente pobre hoy en «pulir la idea» (mejora A). Bloquea su alcance.
- [ ] D-04 Sesión de alcance del chat sobre el reporte (mejora B). Propuesta para después de la beta.
- [ ] D-05 Niveles de suscripción superiores al de $99 (es la misma tarea que S4-05).

## Ver también
[[sprint-3]] · [[../decisiones/plan-lanzamiento-60-90-dias]] · [[../producto/roadmap-y-backlog]] · [[../producto/pricing-y-gtm]] · [[../overview]]
