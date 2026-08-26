---
type: decision-log
tags: [decida, roadmap, lanzamiento, gtm, usuarios]
updated: 2026-08-26
---

# Plan de lanzamiento — 60/90 días

Auditoría de código vs. diseño (2026-08-05), puntos críticos, plan de trabajo y estrategia comercial. Revisado el mismo día tras feedback del usuario: **se prioriza el módulo de usuarios/cuentas y dashboard de historial sobre el pago real**, que baja de prioridad mientras se cierra la etapa de desarrollo inicial y se decide el modelo de cobro. Fuentes: código verificado directamente + [[evolucion-del-producto]] + [[../producto/pricing-y-gtm]] + [[../arquitectura/manejo-de-errores-y-reembolsos]] + [[../arquitectura/historial-de-evaluaciones]].

## Ventana objetivo y cómo usar las fechas

**Inicio de referencia: lunes 2026-08-10** (arranca el lunes siguiente a la fecha en que se escribió este plan, 2026-08-05). **Fin objetivo: domingo 2026-11-01** (84 días / 12 semanas — dentro de la ventana de 60-90 días pedida, con margen).

Si el trabajo real empieza en otra fecha, desplaza todas las fechas de abajo por la diferencia de días — la estructura de semanas/sprints no cambia, solo el calendario. Usa la columna **Estado** de la tabla de sprints para marcar avance real; compáralo contra la columna **Fechas objetivo** para saber de un vistazo si vas adelantado, a tiempo o atrasado:
- 🟢 **A tiempo** — el sprint cerró (o va on-track) dentro de su ventana de fechas.
- 🟡 **Atención** — el sprint se retrasó pero menos de una semana; no requiere replanear el resto del plan todavía.
- 🔴 **Atrasado** — más de una semana de retraso; recalcula las fechas de los sprints siguientes antes de seguir, para que el plan siga siendo honesto.

## Decisión de producto (2026-08-05)
> El pago real se pospone deliberadamente. Prioridad: cerrar desarrollo del núcleo (cuentas + dashboard) primero; el modelo de cobro (por análisis único, suscripción, planes Starter/Pro/Expert de [[../producto/pricing-y-gtm]]) todavía requiere análisis del usuario antes de comprometerse a una implementación. El pago simulado se mantiene mientras tanto.

Esto invierte el orden P0 original de esta página (que ponía "pago real" primero) — ver histórico de la decisión anterior más abajo en [[#Historial de la priorización]].

## Hallazgos verificados en código (2026-08-05, siguen vigentes)
- `savePayment` (`src/app/analizar/actions.ts:269-306`) marca `asmt_payment_status`/`paym_status` como `paid` incondicionalmente — no llama a ningún proveedor de pago. **Se mantiene así a propósito** mientras se define el modelo de cobro.
- `src/lib/history/verification.ts` genera y persiste un código de 6 dígitos, pero **no existe en todo el repo** ninguna librería de envío de email. `/mis-evaluaciones` está roto end-to-end para cualquier usuario real hoy — este es ahora el bloqueante más urgente porque el nuevo módulo de cuentas depende de poder enviar correos (verificación de registro, recuperación de contraseña).
- `arep_pdf_url` existe en el esquema pero no hay generador de PDF.
- Sin analytics ni monitoreo de errores en producción.

## Módulo de usuarios y cuentas (nuevo, definido con el usuario el 2026-08-05)

Decisiones de alcance tomadas:
- **Dashboard v1 = solo historial de evaluaciones.** Nada de recibos ni de formulario de soporte todavía — se agregan en una iteración posterior una vez que el historial esté validado con usuarios reales.
- **Autenticación evoluciona de código-por-email a cuenta con contraseña.** El mecanismo actual (`verification_codes` + `history_sessions`, passwordless) se reemplaza como método principal de acceso por una cuenta tradicional (email + password). El correo de verificación sigue siendo necesario — ahora para confirmar el email al registrarse y para el flujo de "olvidé mi contraseña", no para el login del día a día.
- **Panel de administración se pospone** hasta después de que el dashboard de usuario esté en producción y haya volumen real de assessments que soportar.

### Alcance técnico implicado (a nivel de dirección, no spec final)
- Tabla `users` nueva (email único, password hasheado, nombre, teléfono, `email_verified_at`) — evoluciona lo que hoy son `verification_codes`/`history_sessions` en vez de descartarlos: el código de verificación se reutiliza para signup y reset de password.
- Vincular `assessments` a una cuenta (`user_id`), no solo al string de email como hoy — probablemente ofreciendo crear cuenta en el mismo paso `contacto` del onboarding (ver [[../experiencia/flujo-de-onboarding]]), donde ya se captura nombre/email/teléfono.
- `/mis-evaluaciones` pasa de "sesión temporal por magic-code" a "dashboard autenticado" — listar todas las evaluaciones del usuario, acceso a cada reporte generado.
- Login/registro/reset de password como flujos nuevos de UI, además del arreglo del envío de email que ya era necesario de todos modos.

Esto conecta directamente con el nivel 2 de éxito de producto de `PRODUCT.md` ("el feedback es lo bastante valioso como para que el usuario pague de nuevo por comparar otra idea") y adelanta parte de las "Future Entities" que el propio diseño original de Notion ya anticipaba (`User`, historial, comparación de ideas) — ver [[../../raw/notion/14-database-design#Future Entities]].

## Puntos críticos, priorizados (revisado)

**P0 — base de identidad y datos (antes de todo lo demás):**
1. Email transaccional real (Resend u otro) — ya no es solo un "nice to have" de historial, es prerequisito de todo el módulo de cuentas (verificación de registro + reset de password).
2. Módulo de usuarios con cuenta y contraseña + vínculo `assessments` ↔ `user_id`.
3. Dashboard de historial de evaluaciones sobre esa cuenta autenticada.
4. **Arreglar el score de "Nivel de riesgo", que está roto en producción** (no solo incompleto): depende de `aprf_acceptable_loss_range`, que ya no se captura, así que hoy devuelve un valor casi constante para cualquier idea. Ver [[../producto/gaps-onboarding-vs-framework#🔴 Hallazgo crítico]].

**P1 — hardening que no depende del modelo de pago:**
5. Generación real de PDF (necesaria para el reporte con o sin pago real).
6. Analytics del funnel.
7. Monitoreo de errores en producción.
8. Cerrar y commitear el trabajo de landing en curso.

**P2 — deliberadamente pospuesto:**
9. Pago real — a la espera de que se defina el modelo de cobro (análisis único vs. suscripción vs. planes).
10. Panel de administración (soporte/reembolsos) — después del dashboard de usuario, cuando haya volumen real.

## Plan de trabajo (revisado, con fechas)

| Sprint | Semanas | Fechas objetivo | Foco | Entregables | Estado |
|---|---|---|---|---|---|
| 1 | 1-2 | ~~10 ago – 23 ago~~ **inició 5 ago** 2026 | Fundamentos de cuenta | Email transaccional funcionando, tabla `users`, registro/login/reset de password | 🟦 En curso (arrancó 5 días antes de lo previsto) |
| 2 | 3-4 | 24 ago – 6 sep 2026 | Dashboard de usuario + pulir onboarding del análisis | ~~Assessments vinculados a cuenta~~ (adelantado a Sprint 1, ver abajo), `/mis-evaluaciones` como dashboard autenticado de historial, **cerrar los gaps del onboarding vs. el framework de 6 dimensiones**, **corregir errores del paso "Así entendimos tu idea"**, y **capturar CAC + catálogo de productos/precios** (ver detalle abajo) | ⬜ Pendiente |
| 3 | 5-6 | 7 sep – 20 sep 2026 | Hardening independiente de pago | PDF real, analytics del funnel, monitoreo de errores, landing cerrada | ⬜ Pendiente |
| 4 | 7-9 | 21 sep – 11 oct 2026 | Beta cerrada con cuentas reales | Grupo pequeño con registro real (pago sigue simulado), feedback sobre valor del historial/cuenta, **en paralelo: análisis y decisión del modelo de pricing** (trabajo del usuario, no de desarrollo) | ⬜ Pendiente |
| 5 | 10-12 | 12 oct – 1 nov 2026 | Cierre y lanzamiento | Integrar pago real según el modelo ya decidido, panel admin mínimo (ahora con volumen real que gestionar), lanzamiento público controlado | ⬜ Pendiente |

*(Actualiza la columna Estado a mano según avances: ⬜ Pendiente → 🟦 En curso → 🟢 Cerrado a tiempo / 🟡 Cerrado con retraso leve / 🔴 Retraso crítico, replanear.)*

## Avance real — Sprint 1 (actualizado 2026-08-05)

Arrancó el mismo día en que se escribió el plan (5 de agosto), 5 días antes de la fecha de referencia — vas adelantado, no atrasado. Entregado en la primera sesión de trabajo:

- **Esquema de datos**: modelos `users` y `user_sessions` en `prisma/schema.prisma`, + 2 nuevos propósitos en el enum `verification_purpose` (`signup_verification`, `password_reset`), reutilizando la tabla `verification_codes` existente en vez de duplicarla. Sincronizado con la base de datos local (`pnpm db:push`).
- **Password hashing**: `src/lib/auth/password.ts` (bcryptjs).
- **Email transaccional**: `src/lib/email/resend.ts` — usa Resend si `RESEND_API_KEY` está configurado; si no, registra el correo en la consola del servidor (fallback de desarrollo, igual que el patrón ya usado para `OPENAI_API_KEY`). **Producción sigue necesitando una cuenta de Resend real** — eso no se puede cerrar solo con código, es una cuenta externa (revisar `.env.example`).
- **Auth completo**: registro con verificación por código → login → cerrar sesión → recuperar/restablecer contraseña, todo en `src/app/cuenta/` + `src/lib/auth/`. Probado de punta a punta en navegador real (registro, verificación, login, reset, y protección de ruta: `/cuenta` sin sesión redirige a login).
- **Type-check y lint limpios** en todo el código nuevo (los errores de lint preexistentes en el repo no tienen relación con estos archivos).

**Ampliado el mismo día — adelantado desde Sprint 2 a pedido del usuario**, tras notar que "Analizar una idea" desde `/cuenta` volvía a pedir datos que la cuenta ya tenía:
- `assessments` vinculado a `users` (`asmt_user_id`).
- **Flujo 1**: usuario logueado nunca vuelve a ver el paso de contacto — `startAssessmentForCurrentUser()` provisiona/retoma el assessment y salta directo a `idea`.
- **Flujo 2**: el paso `contacto` ahora también crea la cuenta inline (correo nuevo) o dirige a login con retorno automático (correo ya registrado, vía `?next=/analizar`).
- **Bug encontrado y corregido en el camino**: la primera versión de Flujo 1 escribía cookies desde un GET/Route Handler prefetcheable por cualquier `<Link>` de la app, creando assessments fantasma en cada prefetch silencioso. Corregido moviendo la mutación a un Server Action disparado solo por clic real. Detalle técnico completo en [[../arquitectura/modulo-de-usuarios-y-autenticacion#🔴 Bug encontrado y corregido en el camino]].
- Los 3 sub-flujos verificados contra la base de datos real (no solo la UI): cuenta existente, cuenta nueva, y usuario ya logueado.

**Ampliado de nuevo el mismo día — dashboard real en `/cuenta`**: al probar, el usuario encontró que un análisis iniciado desde el sistema viejo (`/mis-evaluaciones`) no aparecía ligado a su cuenta nueva. Causa raíz: `/mis-evaluaciones` y `/cuenta` son hoy dos sistemas de identidad paralelos y desconectados — el botón "Analizar otra idea" del sistema viejo no sabe nada de `users`/`asmt_user_id`. Se corrigió el dato de prueba puntual y, como tampoco había ningún lugar en la UI para ver evaluaciones aunque estuvieran bien ligadas, se construyó `/cuenta` con lista real de evaluaciones completadas + `/cuenta/evaluaciones/[id]` con el reporte completo — esto también estaba asignado a Sprint 2. Detalle completo en [[../arquitectura/modulo-de-usuarios-y-autenticacion#Dashboard de historial en /cuenta (mismo día, adelantado de Sprint 2)]].

**Lo que sigue quedando para Sprint 2**: migrar `/mis-evaluaciones` por completo al sistema de cuentas (resuelve el desligamiento de raíz), y decidir si se retira del navbar mientras tanto para no confundir. Mientras Sprint 2 no llegue: usar siempre "Mi cuenta" → "Analizar una idea", no "Mis evaluaciones".

### Puntos extra agregados al Sprint 1 (2026-08-26)

Pulido de UX/robustez sobre lo ya entregado, a pedido del usuario:

1. **Recuperación de contraseña en 3 pantallas** ✅ — el flujo de `/cuenta/recuperar` pasó de una vista con tarjetas apiladas (código + contraseña juntos) a un wizard de 3 pasos que se reemplazan: correo → código → nueva contraseña. Implicó una acción nueva `verifyResetCode` y un helper `checkAuthCode` que valida el código sin gastarlo (solo se consume en el paso final). De paso se blindó `requestPasswordReset` para que un fallo de envío de correo no tire un 500 ni filtre si el correo existe. El paso final, al éxito, ya no muestra formulario: lo reemplaza una card de confirmación esmeralda con ícono (`CheckCircle2`) y un único CTA "Ir a iniciar sesión". Verificado end-to-end en navegador. Detalle en [[../arquitectura/modulo-de-usuarios-y-autenticacion#Recuperación de contraseña en 3 pantallas (2026-08-26)]].
2. _(pendiente de que el usuario liste los demás puntos)_

**Pendiente de decisión del usuario, no de código**: ~~crear la cuenta real de Resend y poner `RESEND_API_KEY`~~ — hecho el 2026-08-06. ~~`RESEND_FROM_EMAIL` en placeholder~~ — actualizado a `onboarding@resend.dev` (remitente de pruebas oficial de Resend, confirmado en su documentación). **Restricción real confirmada en vivo**: ese remitente solo permite enviar a la dirección de correo con la que se creó la cuenta de Resend — cualquier otro destinatario falla (`422`/`403`, intencional por parte de Resend, no un bug). Para registrar cuentas con cualquier correo (necesario antes de la beta cerrada del Sprint 4) hay que verificar un dominio propio en resend.com/domains. Detalle completo en [[../arquitectura/modulo-de-usuarios-y-autenticacion#Pendiente que no es código]].

## Checkpoints clave (fechas duras para revisar tú solo si vas bien)
- **2026-08-23** — Sprint 1 debe estar cerrado: cuentas y email funcionando de verdad.
- **2026-09-06** — Sprint 2 cerrado: dashboard de historial en producción + onboarding pulido con las preguntas críticas del rubric recuperadas + errores del paso "Así entendimos tu idea" corregidos.
- **2026-09-20** — Sprint 3 cerrado: PDF, analytics y monitoreo listos; landing commiteada. Producto listo para invitar gente real.
- **2026-10-11** — Beta cerrada corrida y con feedback recogido; modelo de pricing ya decidido.
- **2026-11-01** — Fin de la ventana de 90 días: pago real integrado, lanzamiento público controlado activo. Meta cualitativa/cuantitativa: retención visible en cuentas (Sprints 1-4) + primeros clientes pagados reales (Sprint 5), según el criterio ya explicado en la nota de abajo.

## Sprint 2 — pulir el onboarding del análisis de idea (agregado 2026-08-05)

Auditoría completa campo por campo contra [[../../raw/notion/17-rubric-6-dimensiones]] y [[../../raw/notion/16-criterios-evaluacion-ideas]] archivada en [[../producto/gaps-onboarding-vs-framework]]. Resumen de lo que entra en este sprint:

**Imprescindible (arregla señal rota o ausente):**
1. Recuperar capital disponible + pérdida aceptable (evaluar versión de menor fricción que la original si esa fue la razón de haberlas quitado).
2. Reconectar el score de riesgo a datos reales una vez recuperadas esas preguntas.
3. Agregar "actividades que evita" (`avoidedActivities`) — el campo en BD ya existe, solo falta el input del formulario.
4. Agregar dependencias del negocio (proveedor, empleados, ubicación, plataforma, inventario, regulación) — mismo caso: campo en BD listo, falta el input.

**Alto valor, bajo costo:**
5. Restaurar granularidad de "¿ya habló con clientes?" (niveles, no solo sí/no).
6. Pregunta de modelo de ingreso (único/recurrente/suscripción/proyecto/comisión).
7. Conectar al scoring los datos que ya se capturan pero se ignoran hoy (`uncertaintyComfortScore`, `processComfortScore`).

**Se puede posponer a una iteración posterior** (no bloquea ni rompe nada hoy): pregunta dedicada de escalabilidad real del negocio, restricciones personales, diferenciación explícita, ticket/frecuencia de compra. Detalle completo en [[../producto/gaps-onboarding-vs-framework]].

### Corregir errores del paso "Así entendimos tu idea" (agregado 2026-08-26)

Punto agregado a pedido del usuario. El paso `confirmacion` del onboarding (`/analizar/confirmacion`, título "Así entendimos tu idea" en `src/lib/onboarding/copy.ts`; UI en `src/components/onboarding/idea-confirmation.tsx`; resumen/refinamiento IA en `src/lib/ai/prompts/idea-summary.ts` e `idea-refinement.ts`) tiene errores que hay que corregir en este sprint.

_Errores concretos pendientes de que el usuario los detalle_ — al recibir el listado, desglosar aquí cada bug con: qué pasa, cómo reproducirlo, y si es de UI, de la llamada a IA (incl. el fallback determinístico cuando no hay `OPENAI_API_KEY`), o de persistencia del resumen/aclaraciones.

### Datos de negocio adicionales a capturar en el onboarding (agregado 2026-08-26)

Dos campos/secciones nuevas pedidas por el usuario para este sprint, además de los gaps del rubric ya listados arriba:

1. **Costo de adquisición de clientes (CAC).** Hoy el onboarding captura el *canal* de adquisición (`acquisitionChannel` en `evaluationMarketSchema`) pero nada sobre su *costo*. Agregar captura de CAC estimado (o los insumos para estimarlo: gasto de marketing esperado ÷ clientes esperados) para poder cruzarlo con el ticket/ingreso y leer la relación CAC vs. margen/LTV. Alimenta [[../framework/dimensiones-de-viabilidad|Viabilidad comercial y financiera]]. Ver gap en [[../producto/gaps-onboarding-vs-framework]].
2. **Sección de productos/servicios a vender y sus precios.** Hoy `evaluationFinancialSchema` captura un único `price`. El usuario quiere una sección donde se listen los productos o servicios que la persona piensa vender, cada uno con su precio, en vez de un solo número. Se relaciona con los puntos ya listados de "modelo de ingreso" y "ticket/frecuencia de compra" — al implementarlo, decidir si esta sección los absorbe o los complementa. Alimenta [[../framework/dimensiones-de-viabilidad|Viabilidad financiera]].

Al implementarlos: revisar `src/lib/onboarding/schemas.ts`, `src/lib/onboarding/steps.ts`, `prisma/schema.prisma` (ver si ya hay columnas aprovechables o hay que migrar) y `src/lib/scoring/types.ts` para conectarlos al cálculo, no solo capturarlos como dato muerto (mismo error que `uncertaintyComfortScore`/`processComfortScore`).

## Estrategias comerciales (sin cambios respecto a la versión anterior)
1. `/ejemplo` como imán de leads.
2. Concierge antes que escala para los primeros 10-20 usuarios.
3. Contenido de casos reales (idea → reporte) en LinkedIn/TikTok.
4. Grupos de nicho de alta intención antes que canales fríos.
5. Partnerships con incubadoras/universidades MX.
6. Loop de referido — ahora más natural de construir porque ya habrá cuentas reales con historial, no solo sesiones temporales.
7. SEO de intención sobre paid ads.

> Nota: con el pago pospuesto, el criterio de éxito "10 clientes pagados" del MVP Plan original se pospone también hasta el Sprint 5. Mientras tanto, el criterio de validación de los Sprints 1-4 debería ser cualitativo: ¿la gente crea cuenta?, ¿vuelve a revisar su historial?, ¿pide crear una segunda evaluación? — señales de retención antes que de monetización.

## Historial de la priorización
- **2026-08-05 (v1)**: pago real como P0 #1, historial/dashboard no mencionado como prioridad nueva (ya existía como feature rota, ver [[../arquitectura/historial-de-evaluaciones]]).
- **2026-08-05 (v2, esta versión)**: usuario pide priorizar módulo de usuarios/cuentas + dashboard de historial; pago baja a P2 explícitamente hasta definir modelo de cobro.

## Ver también
[[evolucion-del-producto]] · [[../producto/pricing-y-gtm]] · [[../arquitectura/manejo-de-errores-y-reembolsos]] · [[../arquitectura/historial-de-evaluaciones]] · [[../arquitectura/modelo-de-datos]] · [[../overview]]
