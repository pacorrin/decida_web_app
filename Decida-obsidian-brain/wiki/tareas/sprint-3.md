---
type: tareas
tags: [decida, tareas, sprint-3, suscripcion, freemium]
updated: 2026-09-29
---

# Sprint 3 — tareas

**Fechas objetivo**: 7 sep – 20 sep 2026 · **Estado**: 🟦 en curso (S3-01 hecha en local el 29 sep; sin commit).
Reglas de negocio de la suscripción y el freemium: [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]]. Aquí solo va qué hacer, dónde y cuándo se da por hecho.

Las tareas están en el orden recomendado de ejecución. Cada una está pensada para caber en una sesión corta.

## Antes de empezar

- [x] S3-00 Commitear los cambios de notas del 7 sep (modelo de suscripción) que siguen sin commit en `Decida-obsidian-brain/`.

## 1. Suscripción y freemium (prioridad 1)

- [x] **S3-01 Estado de suscripción en la cuenta.** Agregar a `users` en `prisma/schema.prisma` el estatus, el nivel y la fecha de fin del periodo pagado (prefijo `user_`, como el resto del modelo). Sincronizar con `pnpm db:push`.
  - Hecho cuando: el esquema está sincronizado, el cliente de Prisma está regenerado y una cuenta nueva queda como freemium por defecto.
  - Hecho el 2026-09-29: enum `subscription_status` y campos `user_subscription_*` en `users`. `pnpm db:push` + `pnpm db:generate`. Las 5 cuentas locales quedaron en `none`. Sin lógica de acceso (eso es S3-02).
- [ ] **S3-02 Verificación única de acceso completo.** Un helper (p. ej. en `src/lib/subscription/`) que responda si la cuenta tiene acceso completo: suscripción activa, o cancelada pero todavía dentro del periodo pagado.
  - Hecho cuando: tiene tests en Vitest (`pnpm test`) para activa, cancelada dentro del periodo, cancelada vencida y sin suscripción.
- [ ] **S3-03 Vista recortada del reporte.** Modo recortado en `src/components/onboarding/result-report.tsx`: recomendación, semáforos de las 6 dimensiones y el riesgo principal. El resto de las secciones se cubre con un bloque de CTA a suscripción, reusando el estilo de `/ejemplo`.
  - Hecho cuando: el mismo reporte se ve completo o recortado según un solo parámetro.
- [ ] **S3-04 Aplicar el gate en las dos vistas del reporte.** `src/app/analizar/resultado/page.tsx` y `src/app/cuenta/(dashboard)/evaluaciones/[id]/page.tsx` usan S3-02 para decidir el modo.
  - Hecho cuando: una cuenta sin suscripción ve la vista recortada en las dos rutas, y al activar la suscripción ve completas todas sus evaluaciones, incluidas las viejas.
- [ ] **S3-05 Límite de 1 evaluación activa.** Guard en `startAssessmentForCurrentUser` (`src/app/analizar/actions.ts`) y en el paso `contacto`: si la cuenta ya tiene una evaluación y no tiene acceso completo, llevar a la pantalla de planes.
  - Hecho cuando: una cuenta freemium no puede iniciar una segunda evaluación y una suscrita sí.
- [ ] **S3-06 Pantalla «Elige tu plan».** Rediseñar el paso de pago (`src/app/analizar/pago/page.tsx`, `src/components/onboarding/payment-step.tsx`) de pago único simulado a freemium contra suscripción de $99/mes. Suscribirse sigue siendo simulado, pero ahora actualiza la suscripción de la **cuenta** (hoy `savePayment` solo marca el assessment como pagado).
  - Hecho cuando: suscribirse desde esa pantalla activa la suscripción y desbloquea los reportes.
- [ ] **S3-07 Cancelar suscripción desde `/cuenta`.** Acción en `src/app/cuenta/(dashboard)/perfil/` que marca la suscripción como cancelada al fin del periodo, sin cortar el acceso de inmediato.
  - Hecho cuando: después de cancelar se sigue viendo todo hasta la fecha de fin, y pasada esa fecha se vuelve a la vista recortada.
- [ ] **S3-08 Pruebas del flujo completo.** Cubrir el gate, el desbloqueo retroactivo, el límite de 1 evaluación y la cancelación (Vitest, y Playwright con `pnpm test:e2e` para el recorrido freemium → suscripción).

## 2. Desbloquear la beta

- [ ] **S3-09 Dominio propio en Resend.** Verificar el dominio en resend.com/domains y cambiar `RESEND_FROM_EMAIL`. No es código, lo haces tú. Hoy el remitente de pruebas solo entrega a tu correo, así que nadie más puede registrarse.
  - Hecho cuando: una cuenta con un correo que no es el tuyo recibe el código de verificación.

## 3. Visibilidad para la beta

- [ ] **S3-10 Monitoreo de errores con Sentry** (decidido el 2026-09-28). Instalar con `npx @sentry/wizard -i nextjs` (servidor, navegador y server actions) y conectar `logReportGenerationError` para que los reportes fallidos lleguen como alerta. El DSN va como variable de entorno (en Railway cuando se despliegue, ver S4-00).
  - Hecho cuando: un error forzado en local aparece en el panel de Sentry.
- [ ] **S3-11 Analytics del embudo.** Hoy no hay ninguna herramienta instalada. Eventos mínimos: visita a la landing, clic en el CTA, cuenta creada, onboarding completado, reporte visto y clic en suscribirse.
  - Hecho cuando: un recorrido completo de prueba deja los 6 eventos registrados.

## 4. Landing y copy

- [ ] **S3-12 CTA del modelo freemium.** Cambiar el «$99 MXN» de pago único en `src/components/landing/hero-section.tsx`, `final-cta-section.tsx`, `pricing-section.tsx`, `site-header.tsx` y `src/app/ejemplo/page.tsx`.
- [ ] **S3-13 Quitar la promesa de reembolso.** Revisar `src/components/onboarding/report-error-state.tsx`, `src/lib/onboarding/copy.ts`, `src/components/landing/pricing-section.tsx` y `src/app/terminos/page.tsx`. `docs/REFUND_PROCESS.md` queda obsoleto.
- [ ] **S3-15 Confirmar si la landing se da por cerrada.** Al 28 sep no hay cambios de código sin commit, así que el trabajo de landing que estaba en curso parece estar ya commiteado. Solo falta confirmarlo.

## 5. Al final del sprint

- [ ] **S3-14 PDF real del reporte.** `arep_pdf_url` existe en el esquema, pero no hay generador. Es herramienta de suscriptor, así que no bloquea la beta.

## Fuera de este sprint hasta que haya decisión

- `pfit_avoided_activities` («actividades que evita»): espera D-01 de [[tablero#Decisiones tuyas pendientes (bloquean tareas)]].
- Pregunta de modelo de ingreso: espera D-02.

## Deuda técnica conocida (no bloquea)

- Error de eslint `set-state-in-effect` en `src/components/onboarding/idea-confirmation.tsx`.
- La migración de `prisma/migrations/` está desincronizada con `schema.prisma`; para desarrollo se usa `pnpm db:push`.
- Por verificar: si `/mis-evaluaciones` (`src/app/mis-evaluaciones/`) sigue activo en paralelo a `/cuenta`, o si ya se puede retirar.

## Ver también
[[tablero]] · [[../decisiones/plan-lanzamiento-60-90-dias]] · [[../experiencia/reporte-de-resultado]] · [[../producto/pricing-y-gtm]] · [[../arquitectura/modulo-de-usuarios-y-autenticacion]]
