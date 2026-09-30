---
type: decision-log
tags: [decida, roadmap, lanzamiento, gtm, usuarios]
updated: 2026-09-07
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

## Decisión de producto (2026-09-07) — el modelo de cobro es **suscripción + freemium**
> El usuario definió el modelo que estaba pendiente desde 2026-08-05: **Decida se cobra por suscripción**, no por análisis único. La suscripción más barata es **$99 MXN** (el "Starter" de la hipótesis de Notion). Los demás niveles quedan **pendientes de definir**. Debajo de la suscripción hay una **versión freemium** con captura de datos reducida y resultado recortado, diseñada como embudo hacia la suscripción.
>
> **Qué entra al Sprint 3**: rediseñar las pantallas de pago del modelo "pago único simulado" al modelo "elige plan / suscríbete", y construir el **gating** entre lo que ve un usuario freemium y lo que ve un suscriptor. **El cobro recurrente real (Stripe / Mercado Pago) NO entra al Sprint 3** — sigue simulado (`savePayment`) y su integración se mantiene en el Sprint 5. Ver [[#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]] y [[../producto/pricing-y-gtm#Modelo de cobro decidido (2026-09-07)]].

Esto **reactiva parcialmente el P2 #9** ("pago real") antes de lo previsto, pero solo la capa de producto/UX; la integración de cobro sigue en el Sprint 5.

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
4. ✅ **HECHO** — Score de "Nivel de riesgo" arreglado (commit `43d1112` + trabajo del 2026-08-27). Ver [[../framework/scoring-engine]] y [[../producto/gaps-onboarding-vs-framework#✅ Hallazgo crítico (resuelto): el score de Riesgo estaba roto]].

**P1 — hardening que no depende del modelo de pago:**
5. Generación real de PDF (necesaria para el reporte con o sin pago real).
6. Analytics del funnel.
7. Monitoreo de errores en producción.
8. Cerrar y commitear el trabajo de landing en curso.

**P2 — deliberadamente pospuesto:**
9. Pago real — **modelo de cobro decidido el 2026-09-07: suscripción + freemium** (ver [[#Decisión de producto (2026-09-07) — el modelo de cobro es suscripción + freemium]]). Las **pantallas** de pago y el **gating** freemium/suscriptor se adelantan al Sprint 3; la **integración de cobro recurrente real** (Stripe / Mercado Pago) sigue en el Sprint 5.
10. Panel de administración (soporte/reembolsos) — después del dashboard de usuario, cuando haya volumen real.

## Plan de trabajo (revisado, con fechas)

| Sprint | Semanas | Fechas objetivo | Foco | Entregables | Estado |
|---|---|---|---|---|---|
| 1 | 1-2 | ~~10 ago – 23 ago~~ **inició 5 ago** 2026 | Fundamentos de cuenta | Email transaccional funcionando, tabla `users`, registro/login/reset de password | 🟦 En curso (arrancó 5 días antes de lo previsto) |
| 2 | 3-4 | 24 ago – 6 sep 2026 | Dashboard de usuario + pulir onboarding del análisis | ~~Assessments vinculados a cuenta~~ (adelantado a Sprint 1), ~~`/mis-evaluaciones` → dashboard `/cuenta`~~ (`43d1112`), **cerrar los gaps críticos del onboarding vs. el rubric** (~~dependencias del negocio~~ hecho 2026-08-28; ~~granularidad "¿habló con clientes?"~~ hecho 2026-09-02), ~~corregir errores del paso "Así entendimos tu idea"~~ (`0259101`), ~~catálogo de productos/precios~~ (paso `productos`, 2026-08-28) | 🟢 Cerrado a tiempo (2026-09-02) |
| 3 | 5-6 | 7 sep – 20 sep 2026 | Hardening independiente de pago + modelo de suscripción | PDF real, analytics del funnel, monitoreo de errores, landing cerrada, **+ campos de onboarding pospuestos del Sprint 2** (`pfit_avoided_activities`, modelo de ingreso), **+ rediseño de las pantallas de pago a modelo suscripción + gating freemium** (cobro recurrente real sigue en Sprint 5) | ⬜ Pendiente |
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
- **2026-09-20** — Sprint 3 cerrado: PDF, analytics y monitoreo listos; landing commiteada; **pantallas de pago en modelo suscripción + gating freemium funcionando (cobro simulado)**. Producto listo para invitar gente real.
- **2026-10-11** — Beta cerrada corrida y con feedback recogido; modelo de pricing ya decidido.
- **2026-11-01** — Fin de la ventana de 90 días: pago real integrado, lanzamiento público controlado activo. Meta cualitativa/cuantitativa: retención visible en cuentas (Sprints 1-4) + primeros clientes pagados reales (Sprint 5), según el criterio ya explicado en la nota de abajo.

## Sprint 2 — pulir el onboarding del análisis de idea (agregado 2026-08-05)

Auditoría completa campo por campo contra [[../../raw/notion/17-rubric-6-dimensiones]] y [[../../raw/notion/16-criterios-evaluacion-ideas]] archivada en [[../producto/gaps-onboarding-vs-framework]]. El alcance de los campos que quedaban pendientes se decidió el 2026-08-28 en [[alcance-campos-restantes-sprint-2]] (criterio: solo entra lo que vuelve creíble una dimensión del rubric).

**Imprescindible (arregla señal rota o ausente):**
1. ✅ **HECHO** — Capital disponible + pérdida aceptable de vuelta en el paso `perfil` (commit `43d1112`, spec `.kiro/specs/risk-score-fix/`).
2. ✅ **HECHO** — Score de riesgo reconectado: usa el dato real (`43d1112`) + cruza la inversión declarada contra el techo del rango de capital/pérdida y emite 2 red flags determinísticas (`detectFinancialRedFlags()`, 2026-08-27). Ver [[../framework/scoring-engine#Red flags]] y el log del 2026-08-27.
3. ✅ **HECHO (2026-08-28)** — Dependencias del negocio: grid de checkboxes en el paso `evaluacion`, 6 opciones + "ninguna" (proveedor · 1-2 clientes = mayoría · plataforma externa · permiso/regulación · ubicación física · inventario perecedero), penalización ponderada al `riskScore` (plataforma/permiso +6, resto +3, tope +16) y 3 red flags determinísticas (`detectDependencyRedFlags()`). Verificado end-to-end. Arregla la dimensión 4 (Riesgo), la menos cubierta. Detalle en [[alcance-campos-restantes-sprint-2#Detalle]] y [[../framework/scoring-engine#Penalizaciones al riskScore (alto = más riesgo)]].

**Alto valor, bajo costo:**
4. ✅ **HECHO (2026-09-02)** — Granularidad de "¿ya habló con clientes?": 5 niveles (`ninguno`/`1_3`/`4_10`/`mas_10`/`ya_clientes`) en `mrsk_customer_evidence_level`, gradiente en `commercialScore` (10→38) y en `riskScore` (delta +8…−8, con el signo del término de clientes corregido). Bool `mrsk_has_talked_to_customers` sincronizado por retrocompat. Detalle en [[alcance-campos-restantes-sprint-2#Granularidad «¿habló con clientes?» — HECHA (2026-09-02)]].
5. ✅ **HECHO** — `uncertaintyComfortScore` y `processComfortScore` ya se conectan al `personalFitScore` (commit `43d1112`).

**Movido al Sprint 3 (2026-08-28)** — no arreglan nada roto, no entran al MVP:
- "Actividades que evita" (`pfit_avoided_activities`) — falta definir qué señal debe dar.
- Pregunta de modelo de ingreso (único/recurrente/suscripción/proyecto/comisión) — sin LTV en el motor, el impacto directo es 1 red flag; es enriquecimiento.
- Ver [[#Sprint 3 — campos de onboarding pospuestos]].

**Post-beta** (decisión del usuario, 2026-08-28): **CAC** (costo de adquisición de clientes) — es la estimación menos confiable del assessment y necesita el modelo de ingreso primero. Ver [[alcance-campos-restantes-sprint-2#CAC — NO en esta etapa]].

**Se puede posponer a una iteración posterior** (no bloquea ni rompe nada hoy): pregunta dedicada de escalabilidad real del negocio, restricciones personales, diferenciación explícita, ticket/frecuencia de compra. Detalle completo en [[../producto/gaps-onboarding-vs-framework]].

### ✅ Corregir errores del paso «Así entendimos tu idea» (agregado 2026-08-26, cerrado 2026-08-28)

Punto agregado a pedido del usuario para el paso `confirmacion` del onboarding (`/analizar/confirmacion`, título "Así entendimos tu idea" en `src/lib/onboarding/copy.ts`; UI en `src/components/onboarding/idea-confirmation.tsx`; refinamiento IA en `src/lib/ai/prompts/idea-refinement.ts`).

**Cerrado el 2026-08-28 (confirmado por el usuario):** no hubo una lista separada de bugs — los errores que el usuario tenía en mente quedaron resueltos con el commit **`0259101`**. Ese commit corrige que "Pulir mi idea con IA" (y sobre todo el fallback offline) pegaba las aclaraciones crudas en las tarjetas de "Nuestro entendimiento", dejando texto tipo transcripción. Incluye: prompt de refinamiento reescrito para sintetizar en vez de transcribir, capa de saneo determinística en `openai.ts`, fallback reescrito que teje las aclaraciones en prosa natural, IDs de supuesto únicos (evita que un input de aclaración llene otro), acción nueva "Analizar más" (`rotateIdeaAssumptions`) que solo rota supuestos sin reescribir el resumen, y varios arreglos de a11y/UX. Detalle completo en [[../experiencia/flujo-de-onboarding#El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (2026-08-26)]].

Deuda menor que quedó abierta: `0259101` agrega 1 error nuevo de eslint (`set-state-in-effect` en `idea-confirmation.tsx`, mismo patrón que el preexistente del mismo archivo). No bloquea.

### Datos de negocio adicionales a capturar en el onboarding (agregado 2026-08-26)

Dos campos/secciones nuevas pedidas por el usuario para este sprint, además de los gaps del rubric ya listados arriba:

1. **Costo de adquisición de clientes (CAC)** — **pospuesto a post-beta** (decisión 2026-08-28). Hoy el onboarding captura el *canal* de adquisición (`acquisitionChannel`) pero nada sobre su *costo*. La razón de no meterlo ahora: no es un input puntuado del rubric, necesita el modelo de ingreso (LTV) para no dar falsas alarmas en negocios de suscripción, y la estimación pre-lanzamiento es la menos confiable del assessment. Ver [[alcance-campos-restantes-sprint-2#CAC — NO en esta etapa]].
2. ✅ **HECHO (2026-08-28)** — **Sección de productos/servicios a vender y sus precios.** Paso nuevo `productos` (`/analizar/productos`, entre `ajuste` y `evaluacion`): lista de 1-10 renglones con nombre, tipo (producto/servicio), precio, costo variable y unidades/mes. Decisión: **absorbe** los 3 campos únicos de precio/costo/ventas que estaban en `evaluacion` — el scoring los deriva del blend ponderado por unidades y los escribe en las mismas columnas, más el listado crudo en `finp_products` (JSON). Red flag determinística por producto vendido bajo costo. El reporte muestra tabla de productos con margen por renglón. Verificado end-to-end. Detalle en [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]].

## Sprint 3 — campos de onboarding pospuestos

Tres campos que no entran al MVP (decisión 2026-08-28, ver [[alcance-campos-restantes-sprint-2]]). Ninguno arregla algo roto; se implementan cuando haya una decisión de producto clara y/o feedback de la beta.

### «Actividades que evita» (`pfit_avoided_activities`)
El campo (JSON) ya existe en `prisma/schema.prisma` pero no se captura ni se usa, y no hay decisión de qué señal debería dar. Antes de implementarlo hay que definir:
- **Qué opciones ofrecer**: ¿la misma lista que `ENJOYED_ACTIVITIES_OPTIONS`, o una propia?
- **Cómo afecta el scoring**: regla candidata del rubric — "evita vender + canal de venta directa/presencial → baja Fit personal y Comercial". Confirmar peso y si toca una o dos dimensiones.
- **Dónde va el input**: paso `ajuste` (junto a `enjoyedActivities` en `personal-fit-form.tsx`).

Entregable: decisión documentada + `avoidedActivitiesSchema` en `personalFitSchema` + input + persistencia en `savePersonalFit` + regla en `calculateDeterministicScores` con tests.

### Modelo de ingreso (único / recurrente / suscripción / proyecto / comisión)
Un select (a nivel negocio o por producto en el paso `productos`). Sin LTV en el motor determinístico, el impacto directo es acotado: desbloquea la red flag "quiere reemplazar empleo sin ingresos recurrentes probados" (dimensión 5, hoy incalculable) y mejora la narrativa de la IA. Prerequisito natural del CAC.

### CAC (post-beta, no Sprint 3 fijo)
Ver [[alcance-campos-restantes-sprint-2#CAC — NO en esta etapa]]. Depende del modelo de ingreso y de saber si la gente puede responderlo con sentido.

## Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)

Agregado el 2026-09-07 a pedido del usuario. Cierra la decisión de "modelo de cobro" que estaba abierta desde 2026-08-05. **Solo producto/UX + gating de datos — sin integración de cobro recurrente real** (eso sigue en el Sprint 5; `savePayment` en `src/app/analizar/actions.ts` se mantiene simulado).

### Decisiones tomadas con el usuario (2026-09-07)

| Punto | Decisión |
|---|---|
| **Modelo** | Suscripción, no pago único. Más barata: **$99 MXN** (el "Starter" de [[../producto/pricing-y-gtm]]). Otros niveles: **pendientes de definir** — no se diseñan en este sprint. |
| **Freemium — acceso** | **Requiere cuenta.** El paso `contacto` ya crea la cuenta (flujo existente del módulo de usuarios) — no hay generación anónima. |
| **Freemium — límite** | **1 evaluación activa a la vez.** Para iniciar otra, hay que suscribirse. No es "1 de por vida" ni "1 al mes" — es una sola evaluación gratuita viva por cuenta. |
| **Freemium — captura** | **El onboarding NO se recorta** (decisión 2026-09-07). El usuario freemium completa el flujo entero de 9 pasos, exactamente igual que hoy — la intención es que **vea todos los puntos que se evalúan**. El reporte se genera y se guarda completo como siempre. **Lo único que cambia es qué se le muestra.** Cero cambios en el onboarding, el scoring y el pipeline de IA. |
| **Freemium — resultado** | El reporte **se genera y guarda completo** (mismo pipeline), pero la vista freemium **solo muestra**: card de recomendación (una de las 4 etiquetas) + **snapshot de semáforos de las 6 dimensiones** + **1 riesgo** (el principal). El resto (financiero, fortalezas, plan de validación, análisis por dimensión, fit personal, escalabilidad, tabla de productos) queda **bloqueado con CTA a suscripción**. |
| **Suscriptor** | Ve el reporte completo (las 13 secciones) + herramientas que se vayan sumando (PDF, etc.). **Al pagar se habilita el modo completo de forma retroactiva**: todas las evaluaciones que el usuario ya generó como freemium se desbloquean, no solo las nuevas. El gating mira el estado de suscripción de la cuenta, no un flag por-evaluación. |
| **Periodicidad** | **Suscripción mensual** ($99/mes). |
| **Cancelación / reembolsos** | **Solo cancelación, sin reembolsos.** Al cancelar, el acceso completo se mantiene hasta el **fin del periodo ya pagado** (la fecha límite del último mes pagado); después vuelve a vista freemium. No hay devolución de dinero. |
| **Cobro real** | **Fuera de este sprint.** Pantalla de "elige plan / suscríbete" apunta al flujo simulado. Integración Stripe / Mercado Pago recurrente → Sprint 5. |

### Alcance técnico implicado (dirección, no spec)

Todo el trabajo se concentra en **estado de suscripción + gating de render**. El onboarding, el scoring, el pipeline de IA y el guardado del reporte **no se tocan**.

- **Estado de suscripción en `users`** (o tabla aparte): algo como `subscription_status` / `subscription_tier` / `subscription_current_period_end`. Por ahora lo setea el flujo simulado; en Sprint 5 lo setea el webhook del proveedor. La `subscription_current_period_end` es la que sostiene el "acceso hasta fin de mes pagado" tras cancelar.
- **Gating del reporte** (`src/components/**/result-report.tsx` y la vista `/cuenta/evaluaciones/[id]`): un modo "recortado" que renderiza solo recomendación + semáforos + riesgo principal, con bloques de pago sobre el resto. El reporte completo ya existe en BD — es cuestión de **qué se renderiza**, no de qué se genera. Reusar el lenguaje visual de `/ejemplo`. El gate es **una sola condición**: `¿la cuenta tiene suscripción activa (o dentro del periodo pagado)?` → completo; si no → recortado. Aplica igual a evaluaciones nuevas y viejas → **desbloqueo retroactivo automático** al suscribirse.
- **Límite de "1 evaluación activa"**: guard en `startAssessmentForCurrentUser` / el paso `contacto` — si la cuenta ya tiene una evaluación y no hay suscripción activa, bloquear y llevar a la pantalla de planes. (El onboarding en sí no cambia; lo que se controla es **cuántas veces** se puede iniciar.)
- **Cancelación**: acción que marca la suscripción como "cancelada al final del periodo" sin cortar el acceso de inmediato — el gate sigue devolviendo "completo" mientras `now < subscription_current_period_end`. Sin flujo de reembolso.
- **Pantallas de pago**: el paso `pago` (hoy "pago simulado (beta)") pasa a "elige tu plan" con la suscripción de $99/mes y el freemium como opción visible. Copy de [[../experiencia/landing-y-copy]] y el CTA de la landing ("Analizar mi idea por $99 MXN") hay que revisarlos para el modelo freemium + suscripción.

### Puntos cerrados con el usuario (2026-09-07)

1. **Onboarding freemium**: no se recorta nada — flujo completo, el usuario ve todo lo que se evalúa; solo cambia lo que se le muestra al final. El reporte se guarda completo como siempre.
2. **Evaluaciones freemium viejas**: al pagar se desbloquean **todas** de forma retroactiva (el gate mira el estado de la cuenta, no la evaluación).
3. **Reembolsos / cancelación**: solo cancelación, **sin reembolsos**. Suscripción mensual; el acceso completo se mantiene hasta el fin del periodo pagado y luego revierte a freemium.
4. **Precio $99**: **mensual**.

> ⚠️ **Nota de riesgo estratégico**: esto adelanta superficie de monetización antes de la beta cerrada del Sprint 4. El riesgo es acotado porque **es infraestructura de cobro + gating, no features nuevas ni cambios al motor** — pero el freemium recortado sí es una apuesta de conversión que solo la beta puede validar. Ver [[../producto/prd#Riesgo estratégico]].

## Mejoras de producto pedidas el 2026-09-02 (pendientes de alcance)

Dos ideas nuevas del usuario, planteadas después de cerrar Sprint 2. **Ninguna está aún acotada** — las dos necesitan una sesión de alcance con el usuario (mismo formato que [[alcance-campos-restantes-sprint-2]]: qué entra al MVP, qué se pospone, criterio explícito) antes de estimarlas o meterlas a un sprint fijo. Aquí se registra la intención y las preguntas abiertas, no una solución.

Ambas comparten un mismo hilo: hoy el producto es **una sola pasada** — el usuario responde el onboarding, recibe el reporte y ahí termina la conversación. El usuario quiere abrir un **segundo momento de iteración asistida por IA** en dos puntos del flujo.

### A. Segunda iteración de "pulir la idea" en «Así entendimos tu idea»

El paso `confirmacion` ya tuvo un pase grande en el commit `0259101` (2026-08-26), que arregló que "Pulir mi idea con IA" pegara las aclaraciones crudas como transcripción — ver [[../experiencia/flujo-de-onboarding#El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (2026-08-26)]]. Eso resolvió un **bug**; esto es una **mejora de fondo** sobre la misma acción (`refineIdea` en `src/app/analizar/actions.ts`, prompt en `src/lib/ai/prompts/idea-refinement.ts`).

- **Qué pide el usuario**: que "pulir la idea" mejore de verdad la comprensión y el planteamiento de la idea, no solo que reescriba sin muletillas.
- **Pendiente de que el usuario concrete**: qué se siente pobre hoy en la salida de `refineIdea`. Sin esa lista de dolores puntuales no se puede acotar (igual que las dependencias del negocio necesitaron el detalle de diseño del 2026-08-28 antes de implementarse).
- **Ángulos candidatos a validar con el usuario**: ¿el pulido debería **hacer preguntas de vuelta** cuando la idea es ambigua, en lugar de asumir? ¿Debería señalar explícitamente qué partes de la idea siguen sin sustento? ¿Cuántas rondas de pulido tienen sentido antes de que se vuelva ruido? Relación con "Analizar más" (`rotateIdeaAssumptions`), que hoy solo rota supuestos.
- **Dónde caería**: iteración sobre la fase gratis del onboarding; no toca scoring. Bajo/medio costo según el alcance.

### B. Chat de mejora sobre la página de resultado (post-flujo, asistido por IA)

Una vez terminado el flujo y generado el reporte, el usuario quiere poder **conversar con la IA sobre el resultado** para mejorar los distintos puntos del reporte y de la evaluación.

- **Propósito declarado por el usuario**: que el chat ayude a **identificar los puntos pobres del assessment** — lo que el usuario no especificó, o decidió no especificar — y que **el usuario vea reflejado por qué esos puntos importan**. Es, en esencia, un explorador interactivo de puntos ciegos.
- **Conexión con el diseño**: encaja de lleno con la sección 7 del reporte, "Risks and Blind Spots", que [[../experiencia/reporte-de-resultado]] marca como **la sección más importante**. El chat sería la versión conversacional de esa sección.
- **Dónde viviría**: la vista `/analizar/resultado` (y probablemente también `/cuenta/evaluaciones/[id]`, para retomar una evaluación vieja).

> ⚠️ **Brecha con el diseño original**: el backlog de Notion ([[../../raw/notion/09-product-backlog]]) lista **"chat IA complejo" como explícitamente fuera de alcance** del MVP, y "asesor IA" aparece recién en "Future SaaS". Esta idea reabre ese punto. No es necesariamente un error —el producto ya se ha adelantado a varias "Future Entities" (cuentas, historial)— pero es una divergencia deliberada que hay que decidir a ojos abiertos. Registrada en [[evolucion-del-producto#11. Chat de iteración sobre el reporte — reabre un "fuera de alcance" de Notion (2026-09-02)]].

> ⚠️ **Riesgo estratégico del PRD**: [[../producto/prd#Riesgo estratégico]] advierte contra *"construir demasiada funcionalidad antes de confirmar que la gente paga"*. Un chat con IA sobre el reporte es superficie de producto y **costo de API recurrente por usuario** (ver [[../framework/prompts-de-ia#AI Cost Control (por qué se diseñó así)]]). Candidato natural a: (a) atarlo a un plan de pago (Pro/Expert de [[../producto/pricing-y-gtm]]), y/o (b) posponerlo hasta después de la beta cerrada del Sprint 4, cuando haya señal de que el reporte de una sola pasada ya genera valor suficiente.

- **Preguntas abiertas para la sesión de alcance**:
  - ¿El chat **solo explica** (Q&A de solo lectura sobre por qué un punto importa), o también **deja completar los datos faltantes** y **re-corre el scoring/reporte** con la información nueva? Lo segundo es mucho más grande y toca el motor determinístico.
  - ¿Cómo decide el chat cuáles son "los puntos pobres"? Candidato: aprovechar las señales que ya existen — campos de onboarding sin responder, `ascs_red_flags`, dimensiones con score bajo, `whyItMatters`/`howToReduce` ya generados.
  - ¿Se persiste la conversación? ¿Por assessment, ligada a `user_id`?
  - ¿Límite de mensajes / control de costo? ¿Modelo barato vs. el de razonamiento del reporte?
  - Guardrails: el chat hereda los del reporte (no prometer éxito, no inventar datos de mercado, no asesoría legal/fiscal) — ver [[../framework/prompts-de-ia#Guardrails (nunca decir)]].
- **Tamaño estimado (grueso, sin acotar)**: es la más grande de las dos por mucho. Probablemente **su propio sprint**, no un punto dentro de otro. Si incluye re-correr el scoring, más todavía.

### Ubicación tentativa en el plan

| Mejora | Depende de | Ubicación tentativa |
|---|---|---|
| A · Pulir la idea (2ª iteración) | Que el usuario liste los dolores puntuales | Sprint 3 o una iteración de pulido, según alcance |
| B · Chat sobre el reporte | Sesión de alcance + decisión de pricing + señal de valor de la beta | **Post-Sprint 4** (después de la beta cerrada), o antes solo si se decide como feature de un plan de pago. Su propio sprint. |

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
- **2026-09-07 (v3)**: usuario define el modelo de cobro = **suscripción + freemium** ($99 el nivel más barato, resto pendiente). Las pantallas de pago y el gating freemium/suscriptor se adelantan al Sprint 3; la integración de cobro recurrente real sigue en el Sprint 5.

## Ver también
[[evolucion-del-producto]] · [[../producto/pricing-y-gtm]] · [[../arquitectura/manejo-de-errores-y-reembolsos]] · [[../arquitectura/historial-de-evaluaciones]] · [[../arquitectura/modelo-de-datos]] · [[../overview]]
