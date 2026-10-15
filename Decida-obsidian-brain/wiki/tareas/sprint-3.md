---
type: tareas
tags: [decida, tareas, sprint-3, suscripcion, freemium]
updated: 2026-09-29
---

# Sprint 3 — tareas

**Fechas objetivo**: 7 sep – 20 sep 2026 · **Estado**: 🟦 en curso (S3-01 a S3-04 hechas en local el 29 sep).
Reglas de negocio de la suscripción y el freemium: [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]]. Aquí solo va qué hacer, dónde y cuándo se da por hecho.

Las tareas están en el orden recomendado de ejecución. Cada una está pensada para caber en una sesión corta.

## Antes de empezar

- [x] S3-00 Commitear los cambios de notas del 7 sep (modelo de suscripción) que siguen sin commit en `Decida-obsidian-brain/`.

## 1. Suscripción y freemium (prioridad 1)

- [x] **S3-01 Estado de suscripción en la cuenta.** Agregar a `users` en `prisma/schema.prisma` el estatus, el nivel y la fecha de fin del periodo pagado (prefijo `user_`, como el resto del modelo). Sincronizar con `pnpm db:push`.
  - Hecho cuando: el esquema está sincronizado, el cliente de Prisma está regenerado y una cuenta nueva queda como freemium por defecto.
  - Hecho el 2026-09-29: enum `subscription_status` y campos `user_subscription_*` en `users`. `pnpm db:push` + `pnpm db:generate`. Las 5 cuentas locales quedaron en `none`. Sin lógica de acceso (eso es S3-02).
- [x] **S3-02 Verificación única de acceso completo.** Un helper (p. ej. en `src/lib/subscription/`) que responda si la cuenta tiene acceso completo: suscripción activa, o cancelada pero todavía dentro del periodo pagado.
  - Hecho cuando: tiene tests en Vitest (`pnpm test`) para activa, cancelada dentro del periodo, cancelada vencida y sin suscripción.
  - Hecho el 2026-09-29: `hasFullAccess` en `src/lib/subscription/access.ts`. Ocho casos en Vitest con `now` fijo. `past_due` pierde el acceso de inmediato, sin días de gracia. Ninguna pantalla la usa todavía (S3-03 y S3-04).
- [x] **S3-03 Vista recortada del reporte.** Modo recortado en `src/components/onboarding/result-report.tsx`: recomendación, semáforos de las 6 dimensiones y el riesgo principal. El resto de las secciones se cubre con un bloque de CTA a suscripción, reusando el estilo de `/ejemplo`.
  - Hecho cuando: el mismo reporte se ve completo o recortado según un solo parámetro.
  - Hecho el 2026-09-29: prop `access` (`"full"` por defecto, `"free"` a mano). En free, el índice solo lista lo visible y el texto bloqueado no va en el HTML. El botón apunta a `/analizar/pago`. Ninguna página lo pasa todavía (S3-04).
- [x] **S3-04 Aplicar el gate en las dos vistas del reporte.** `src/app/analizar/resultado/page.tsx` y `src/app/cuenta/(dashboard)/evaluaciones/[id]/page.tsx` usan S3-02 para decidir el modo.
  - Hecho cuando: una cuenta sin suscripción ve la vista recortada en las dos rutas, y al activar la suscripción ve completas todas sus evaluaciones, incluidas las viejas.
  - Hecho el 2026-09-29: las dos páginas llaman `hasFullAccess`. Probado `none` (gratis), `active` vigente (completo), `canceled` con fecha futura (completo) y con fecha de ayer (gratis). La cuenta de prueba volvió a `none`.
- [x] **S3-05 Límite de 1 evaluación activa.** Guard en `startAssessmentForCurrentUser` (`src/app/analizar/actions.ts`) y en el paso `contacto`: si la cuenta ya tiene una evaluación y no tiene acceso completo, llevar a la pantalla de planes.
  - Hecho cuando: una cuenta freemium no puede iniciar una segunda evaluación y una suscrita sí.
  - Hecho el 2026-10-14 (código y tests unitarios; falta probarlo a mano en el navegador): `decideAssessmentStart` en `src/lib/subscription/limits.ts`, usado por `ensureAssessmentForCurrentUser`. Sin suscripción: la primera evaluación se crea, una sin terminar se retoma y, con una terminada, redirige a `/analizar/pago?limite=1` con aviso. El paso `contacto` ahora siempre pasa por la acción si hay sesión.
- [x] **S3-06 Pantalla «Elige tu plan».** Rediseñar el paso de pago (`src/app/analizar/pago/page.tsx`, `src/components/onboarding/payment-step.tsx`) de pago único simulado a freemium contra suscripción de $99/mes. Suscribirse sigue siendo simulado, pero ahora actualiza la suscripción de la **cuenta** (hoy `savePayment` solo marca el assessment como pagado).
  - Hecho cuando: suscribirse desde esa pantalla activa la suscripción y desbloquea los reportes.
  - Hecho el 2026-10-14 (código y tests unitarios; ver abajo qué no se probó): `src/lib/subscription/activate.ts` (puras: `buildSimulatedActivation` deja `status=active`, `plan=monthly`, `period_end = ahora + 1 mes`, `provider=simulated`, `canceled_at=null`; `shouldActivate` evita re-activar una suscripción vigente; tests en `__tests__/activate.test.ts`). `savePayment` en `src/app/analizar/actions.ts` ahora actualiza `users` de la cuenta (y deja un registro en `payments` con provider `simulated`), y se agregó `continueFree`. La pantalla (`payment-step.tsx`) muestra dos tarjetas, Gratis y Suscripción $99 MXN/mes, con el banner «Modo beta — pago simulado» y el aviso ámbar de `?limite=1`; se quitó la promesa de reembolso (`PAYMENT_GUARANTEE_COPY` → `PAYMENT_CANCEL_COPY` en `copy.ts`) y el catálogo `PAYMENT_PLANS` Starter/Pro/Expert. **Bloqueo `isPaid`:** `getResumeStep` y `canAccessStep` (`navigation.ts`) ya no exigen pago; perfil/ajuste/productos/evaluación/resultado solo exigen idea confirmada y los prerequisitos de datos. `isPaid` sigue en `assessment-utils.ts` pero sin uso en el flujo. No se cambió el schema. **No probado:** los e2e existentes ya fallaban antes de este cambio (el paso `contacto` ahora pide contraseña y los specs no la llenan), así que quedan para S3-08; el desbloqueo retroactivo de evaluaciones viejas depende de `hasFullAccess` y solo está cubierto por el test de `access.ts`.
- [x] **S3-06b Página de suscripción de la cuenta** (`/cuenta/suscripcion`, 2026-10-14). Los botones «Suscribirme» fuera del onboarding (perfil, candados del reporte, límite de 1 evaluación) llevaban a `/analizar/pago`, que es un paso del onboarding y mandaba a `/analizar/idea`. Ahora todos van a una página propia dentro de `/cuenta`: estado de la suscripción, comparación Gratis vs $99 MXN/mes, suscribirse (simulado), cancelar y reactivar (una cancelada dentro de su periodo se reactiva sin cobro y sin mover `period_end`). Enlazada en la barra lateral y el menú de usuario. `/analizar/pago` queda solo como paso del onboarding.
  - Cambio de datos: `payments.paym_asmt_id` ahora es opcional y se agregó `paym_user_id` (el pago de una suscripción pertenece a la cuenta, no a una evaluación). Sin migración: se sincronizó con `pnpm db:push`.
  - Código: `src/lib/subscription/subscribe.ts` (lógica compartida), `src/app/cuenta/(dashboard)/suscripcion/`, `src/components/account/subscribe-button.tsx`; `PLANS_PATH` ahora apunta a `/cuenta/suscripcion?limite=1`.
  - Pendiente de verificar: la corrida e2e con el servidor reiniciado (el servidor de desarrollo viejo tenía el cliente de Prisma anterior).
- [x] **S3-07 Cancelar suscripción desde `/cuenta`.** Acción en `src/app/cuenta/(dashboard)/perfil/` que marca la suscripción como cancelada al fin del periodo, sin cortar el acceso de inmediato.
  - Hecho cuando: después de cancelar se sigue viendo todo hasta la fecha de fin, y pasada esa fecha se vuelve a la vista recortada.
  - Hecho el 2026-10-14: `planCancellation` y `describeSubscription` en `src/lib/subscription/cancel.ts` (puras, con tests en `__tests__/cancel.test.ts`): solo cancela si el estado es `active`, pone `canceled` + `user_subscription_canceled_at` y **no toca `period_end`**; cancelada, sin suscripción o `past_due` devuelven un mensaje claro. Server action `cancelSubscription` en `src/app/cuenta/(dashboard)/perfil/actions.ts` (usa `getCurrentUser`, `updateMany` con `status = active` en el where para evitar carreras, `revalidatePath`). UI: bloque «Suscripción» en `perfil/page.tsx` y `src/components/account/cancel-subscription.tsx` (confirmación en dos pasos: sin reembolso, acceso hasta la fecha). Sin suscripción o vencida: botón «Suscribirme» hacia `/analizar/pago`. Probado a mano en el navegador con la cuenta de prueba puesta en `active` por SQL: se ve «Activa, se renueva el…», confirma, la BD queda `canceled` con `period_end` intacto y la vista dice «Cancelada, acceso hasta el…». La cuenta volvió a `none`. **No probado:** el paso a vista recortada tras vencer en el navegador (solo cubierto por test unitario con `hasFullAccess`), ni reactivar una cancelada (no hay flujo; ver S3-06), ni el diálogo en móvil.
- [x] **S3-08 Pruebas del flujo completo.** Cubrir el gate, el desbloqueo retroactivo, el límite de 1 evaluación y la cancelación (Vitest, y Playwright con `pnpm test:e2e` para el recorrido freemium → suscripción).
  - Hecho el 2026-10-14. **Cómo correrlas:** `npx vitest run` (92 tests, 11 archivos, ~1 s, sin BD) y `pnpm test:e2e` (14 tests; necesita PostgreSQL en docker, `pnpm db:push` y `.env`; levanta su propio `pnpm dev` si el puerto 3000 está libre; usa OpenAI real si hay `OPENAI_API_KEY`, ~4 min). Ver también [[stack-tecnico]]. **Vitest:** `access.test.ts` (gate: `hasFullAccess` en activa/cancelada/vencida/past_due), `limits.test.ts` (`decideAssessmentStart`), `activate.test.ts`, `cancel.test.ts`, y nuevos `src/lib/onboarding/__tests__/for-user.test.ts` (`ensureAssessmentForCurrentUser` con Prisma y cookies mockeados: anónimo, reusar en curso, crear la gratis, límite sin crear otra, retomar, cookie de otra cuenta, suscriptor activo, cancelada vigente y cancelada vencida), `src/lib/subscription/__tests__/ciclo-de-vida.test.ts` (integración en el tiempo: gratis → suscribirse → cancelar → vencer → re-suscribirse) y `src/app/cuenta/(dashboard)/perfil/__tests__/cancel-subscription.test.ts` (acción `cancelSubscription`: sin sesión, cancela sin tocar `period_end`, sin suscripción, carrera `count: 0`). **Playwright:** nuevo `e2e/subscription-flow.spec.ts` (cuenta nueva → onboarding gratis → reporte recortado con 4 candados y sin contenido de pago → «Analizar una idea» desde `/cuenta` redirige a `/analizar/pago?limite=1` con el aviso y no crea otra evaluación → suscripción simulada ($99, `active`) → la evaluación vieja sale completa → cancelar desde `/cuenta/perfil` (BD `canceled`, `period_end` intacto, sigue completa) → `period_end` al pasado por SQL → vuelve el recorte y el perfil dice «Vencida»). Se repararon `onboarding.spec.ts`, `onboarding-ux-audit.spec.ts` y `multi-idea-history.spec.ts` (llenan `#password`, usan `payment-free`; el test de historial por código de correo se reemplazó por el historial en `/cuenta`, porque `/mis-evaluaciones` ahora redirige ahí; «Analizar otra idea» ahora verifica el límite freemium). Helpers nuevos: `e2e/flow.ts` (onboarding reutilizable), `e2e/test-data.ts` y `e2e/db-helpers.ts` (limpieza por correo en `afterAll`, mover `period_end`). **Resultado real:** 92/92 Vitest; 14/14 e2e en la última corrida completa. **Bugs hallados:** (1) `products-form.tsx` tenía `step="10"` en precio y costo, y el navegador bloqueaba en silencio cualquier valor que no fuera múltiplo de 10 (65, 499, 899…), así que 3 de 6 escenarios no avanzaban del paso Productos; corregido con `step="any"`. (2) Las tarjetas de opción (radios controlados) y el feedback fallaban de forma intermitente si el clic llegaba antes de hidratar; los specs ahora reintentan. **Sobre el «Internal Server Error» en `/analizar/confirmacion`:** no se reprodujo (0 respuestas 500 en ~5 corridas completas, decenas de pasadas por esa ruta); al empezar había un `next dev` huérfano (pid de las 22:20) al 112 % de CPU que no respondía en 60 s, causa más probable del ruido del entorno compartido; se detuvo y el e2e levanta el suyo. **No cubren:** el gate visual del reporte con contenido de IA real (el e2e comprueba candados y ausencia de textos de pago, no el texto redactado, que depende de OpenAI), el vencimiento por el paso real del tiempo (se simula moviendo `period_end` por SQL), reactivar una cancelada desde la UI, móvil, ni el pago real. Quedan en la BD de desarrollo 45 evaluaciones `@decida.test` de julio, anteriores a la limpieza automática.

## 2. Desbloquear la beta

- [ ] **S3-09 Dominio propio en Resend.** Verificar el dominio en resend.com/domains y cambiar `RESEND_FROM_EMAIL`. No es código, lo haces tú. Hoy el remitente de pruebas solo entrega a tu correo, así que nadie más puede registrarse.
  - Hecho cuando: una cuenta con un correo que no es el tuyo recibe el código de verificación.
  - Preparado el 2026-10-14: guía paso a paso en [[correo-transaccional-resend]] (checklist de dominio/DNS, variables, prueba y errores típicos). En código, `src/lib/email/resend.ts` ahora registra en el log un mensaje claro cuando Resend rechaza el envío, y `.env.example` documenta `RESEND_FROM_EMAIL`. **Falta la acción manual tuya**: verificar el dominio en Resend, crear la API key y definir `RESEND_API_KEY` y `RESEND_FROM_EMAIL` (local y Railway). Sin marcar hasta probar con un correo ajeno.

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
