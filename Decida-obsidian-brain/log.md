# Log

Bitácora cronológica append-only. Formato: `## [YYYY-MM-DD] tipo | Título`.

## [2026-08-05] ingest | Construcción inicial del cerebro de Decida

Primera construcción completa del segundo cerebro (patrón LLM Wiki), a petición del usuario. Fuentes ingeridas:

- **Notion**: 18 páginas del espacio "Decida" (hub + 17 subpáginas numeradas: PRD, MVP plan, onboarding/user flow, business viability framework, question bank, AI prompts, pricing/GTM, technical architecture, product backlog, scoring engine, report template, landing copy, UX wireframes, database design, prompt engineering, criterios de evaluación, rubric de las 6 dimensiones). Snapshot completo en `raw/notion/`.
- Se buscó explícitamente si existían minutas de reunión de Decida en Notion — no se encontró ninguna. Se descartaron resultados de otro proyecto ("Pre15na"/"KRONOX DESARROLLO", módulo de comisiones) por no tener relación con Decida.
- **Código fuente**: `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `prisma/schema.prisma`, `src/lib/scoring/`, `src/lib/onboarding/steps.ts`, `src/lib/ai/` (estructura), `docs/IMPLEMENTATION_SUMMARY.md`, `docs/FLOW_DIAGRAMS.md`, `docs/REFUND_PROCESS.md` (título), `package.json`, `git log` completo.

Páginas wiki creadas: 22 (overview, vision-mision-valores, glosario + 5 de producto + 4 de framework + 3 de experiencia + 4 de arquitectura + 1 de marca + 1 de decisiones + 1 de reuniones).

Brechas Notion-vs-código detectadas y registradas en `wiki/decisiones/evolucion-del-producto.md`: reordenamiento del flujo de onboarding (idea/confirmación antes del pago), remoción de preguntas de capital/pérdida aceptable, historial de evaluaciones (non-goal superado), sistema de manejo de errores/reembolsos construido sin precedente en Notion, paso de contacto agregado, testing E2E y feedback survey adelantados respecto al backlog original, soporte de markdown en respuestas IA.

Gaps abiertos dejados explícitos: sin minutas de Decida, sin evidencia de clientes/pagos reales, trabajo de landing en curso no capturado (archivos sin commitear al momento de la ingesta), estado de las red flags de capital/pérdida tras su remoción del onboarding sin confirmar.

Próximos pasos sugeridos (no ejecutados, a la espera de revisión del usuario): ingesta dedicada de landing una vez estabilizado el trabajo en curso; primera minuta de reunión cuando exista, para resolver las preguntas de "por qué" detrás de las decisiones de producto documentadas en `evolucion-del-producto.md`.

## [2026-08-05] query | Auditoría código vs. diseño + plan de lanzamiento 60-90 días

El usuario revisó la v1 del cerebro y pidió: evaluación de estado real vs. diseñado, puntos críticos, plan de trabajo corto, próximos pasos para publicar en 60-90 días, y estrategia comercial. Se verificó código directamente (no solo lo ya sintetizado): `savePayment` confirma pago 100% simulado; se descubrió que `src/lib/history/verification.ts` genera códigos de verificación pero **no hay ninguna librería de envío de email en el repo** — `/mis-evaluaciones` está roto end-to-end para usuarios reales (gap nuevo, no detectado en la ingesta inicial); se confirmó ausencia de generador de PDF, analytics y monitoreo de errores.

Resultado archivado en `wiki/decisiones/plan-lanzamiento-60-90-dias.md`. Actualizar `wiki/arquitectura/historial-de-evaluaciones.md` en la próxima sesión para reflejar el hallazgo de envío de email roto (pendiente al cierre de esta sesión).

Nota operativa: durante esta sesión el usuario abrió el vault en la app de Obsidian, lo que renombró la carpeta de `obsidian-brain/` a `Decida-obsidian-brain/` en la raíz del repo (se agregó `.obsidian/` de configuración local). Se consolidaron aquí los archivos que por error se habían vuelto a escribir en una carpeta `obsidian-brain/` vacía y duplicada, y esa carpeta duplicada se eliminó. El nombre real del vault a partir de ahora es `Decida-obsidian-brain/`.

## [2026-08-05] decision | Repriorización del plan: módulo de usuarios/cuentas antes que pago real

El usuario revisó el plan de lanzamiento y pidió: (1) agregar un módulo de usuarios/cuentas con dashboard para ver evaluaciones anteriores, recibos, soporte y reembolsos; (2) bajar la prioridad del pago real hasta terminar la etapa de desarrollo inicial y decidir el modelo de cobro. Se aclaró el alcance con 3 preguntas: dashboard v1 = solo historial (sin recibos/soporte todavía); autenticación evoluciona de código-por-email a cuenta con contraseña; panel admin se pospone hasta después del dashboard de usuario.

Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (nuevas prioridades P0-P2, plan de 5 sprints reordenado, sección "Módulo de usuarios y cuentas", historial de la priorización) y `wiki/arquitectura/historial-de-evaluaciones.md` (nota de brecha sobre email roto + dirección futura hacia cuenta con password).

Pendiente para próxima sesión: cuando se decida el modelo de cobro (análisis único vs. suscripción vs. planes), documentarlo en `wiki/producto/pricing-y-gtm.md` y actualizar el plan.

## [2026-08-05] query | Auditoría onboarding vs. rubric de 6 dimensiones — bug crítico encontrado

El usuario pidió agregar al Sprint 2 pulir el onboarding del análisis de idea, cubriendo todos los puntos de `raw/notion/17-rubric-6-dimensiones.md` y `raw/notion/16-criterios-evaluacion-ideas.md`. Se leyó `src/lib/onboarding/schemas.ts`, `options.ts` y `src/lib/scoring/types.ts` para comparar campo por campo contra el rubric.

Hallazgo crítico: el score de `risk_level` está roto en producción (no solo incompleto) — depende de `aprf_acceptable_loss_range`, que ya nunca se captura desde que se removieron las preguntas de capital/pérdida (commit `5886b4d`); `scoreFromRange()` cae en un fallback constante (~50) sin importar el riesgo real de la idea. Esto resuelve la "pregunta abierta" que había quedado pendiente en `evolucion-del-producto.md#2`.

Otros gaps confirmados: `avoidedActivities` y `mrsk_business_dependencies` existen en el esquema Prisma pero nunca se capturan en el formulario; `uncertaintyComfortScore` y `processComfortScore` se capturan pero el scoring los ignora; granularidad de "¿habló con clientes?" degradada a booleano vs. los niveles del Question Bank original; sin modelo de ingreso, sin escenarios financieros, sin pregunta dedicada de escalabilidad real del negocio.

Creado: `wiki/producto/gaps-onboarding-vs-framework.md` (mapeo completo por dimensión, priorizado en 3 niveles). Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 2 ampliado con sección dedicada), `wiki/framework/scoring-engine.md` (nota de bug crítico), `wiki/decisiones/evolucion-del-producto.md` (entrada #2 cerrada con el hallazgo).

## [2026-08-05] decision | Fechas concretas agregadas al plan de lanzamiento

El usuario pidió fechas de calendario en vez de "semana 1-2" relativo, para poder ver si va adelantado o atrasado. Se asumió inicio el lunes 2026-08-10 (siguiente lunes tras la fecha de este plan) y fin objetivo el domingo 2026-11-01 (84 días / 12 semanas, dentro de la ventana de 60-90 días pedida originalmente, con margen).

Actualizado `wiki/decisiones/plan-lanzamiento-60-90-dias.md`: fechas objetivo por sprint, columna de Estado para marcar avance a mano (⬜/🟦/🟢/🟡/🔴), y 5 checkpoints de fecha dura (23 ago, 6 sep, 20 sep, 11 oct, 1 nov) para revisión rápida de progreso. Si el usuario arranca en otra fecha, debe desplazar todo el calendario por la diferencia — la estructura de semanas no cambia.

## [2026-08-05] build | Sprint 1 arrancado el mismo día — módulo de cuentas implementado

El usuario pidió empezar el Sprint 1 ("Fundamentos de cuenta") el mismo día en que se cerró el plan, 5 días antes de la fecha de referencia (10 ago). Se implementó y probó de punta a punta en navegador real:

- `prisma/schema.prisma`: modelos `users` y `user_sessions`, enum `verification_purpose` extendido con `signup_verification` y `password_reset` (reutiliza `verification_codes`, no lo duplica). Sincronizado con la base de datos local ya corriendo (`decida-postgres`, sin tocar Docker).
- `src/lib/auth/` (constants, password, verification, users, session-server, schemas) y `src/lib/email/` (resend.ts con fallback de consola en dev, templates.ts).
- `src/app/cuenta/actions.ts` + páginas `registro`, `iniciar-sesion`, `recuperar`, y el panel `/cuenta` (protegido, redirige a login si no hay sesión).
- Probado en el navegador: registro → código de verificación (capturado del log del servidor) → sesión creada → logout → login con la misma contraseña → reset de contraseña (código nuevo, contraseña vieja queda invalidada, login con la nueva funciona) → `/cuenta` sin sesión redirige a `/cuenta/iniciar-sesion`.
- `tsc --noEmit` y `pnpm lint` limpios en todos los archivos nuevos.

Actualizado `wiki/decisiones/plan-lanzamiento-60-90-dias.md`: Sprint 1 pasa a 🟦 En curso con nota de que arrancó adelantado, más sección "Avance real — Sprint 1" con el detalle de lo entregado y lo que falta (vincular `assessments` a `user_id` y migrar `/mis-evaluaciones`, que ya era alcance de Sprint 2, no se adelantó).

Pendiente real, no de código: crear cuenta de Resend y configurar `RESEND_API_KEY` en producción — sin eso el envío de correos sigue siendo solo un log de consola.

## [2026-08-05] document | Módulo de usuarios documentado como página de arquitectura propia

El usuario pidió que el trabajo de código agregado al repo (módulo de cuentas del Sprint 1) quedara documentado en Obsidian de forma propia, no solo mencionado dentro del plan de lanzamiento.

Creado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` — documenta el esquema (`users`, `user_sessions`, extensión de `verification_purpose`), los módulos de código (`src/lib/auth/`, `src/lib/email/`, `src/app/cuenta/`, `src/components/auth/`), las decisiones de diseño (reutilizar `verification_codes` en vez de duplicar, no tocar `src/lib/history/*` para no invadir alcance de Sprint 2), lo verificado en navegador, y qué falta.

Actualizado para enlazar la página nueva: `wiki/arquitectura/modelo-de-datos.md` (tabla de entidades + enum `verification_purpose`), `wiki/arquitectura/stack-tecnico.md` (Resend y bcryptjs agregados al stack real), `wiki/arquitectura/historial-de-evaluaciones.md` (nota de que el reemplazo ya existe, falta la migración), `wiki/overview.md` (mapa del producto + gaps activos + nueva sección "Estado de desarrollo"), `index.md`.

## [2026-08-05] build | Integración de cuentas con el onboarding — 2 flujos nuevos + bug de prefetch corregido

El usuario notó que "Analizar una idea" desde `/cuenta` volvía a pedir datos ya conocidos, y pidió dos flujos: (1) usuario logueado nunca vuelve a ver el paso de contacto, con el assessment ligado a su cuenta; (2) el paso `contacto` sirve para crear la cuenta inline si el correo es nuevo, o pedir login si ya existe (con retorno automático al onboarding).

Implementado: `asmt_user_id` en `assessments` (adelantado desde Sprint 2), `src/lib/onboarding/for-user.ts` (provisiona/retoma assessment para el usuario actual), `startAssessmentForCurrentUser` Server Action, `password` agregado a `contactSchema`, `saveContact` ahora detecta cuenta existente vs. nueva, soporte de `?next=` en login para retomar el onboarding tras autenticar.

Bug real encontrado y corregido en el camino: la primera versión convirtió `/analizar` en un Route Handler que escribía la cookie del assessment directamente en el GET. Next.js hace prefetch automático de cualquier `<Link>` visible, y el CTA "Analizar mi idea" está en el header de casi toda la app — cada prefetch silencioso creaba un assessment fantasma (confirmado en la base de datos: 3 páginas visitadas sin clic = 3 assessments huérfanos). Corregido moviendo la mutación a un Server Action disparado solo por clic real (`startAssessmentForCurrentUser`, patrón `useTransition` ya usado por `AnalyzeAnotherButton`); `/analizar` volvió a ser una página de solo lectura.

Verificado contra la base de datos real (no solo la UI): los 3 sub-flujos (usuario logueado, correo con cuenta existente, correo nuevo) funcionan de punta a punta, y se confirmó que navegar sin hacer clic ya no crea assessments (7→7 tras 3 navegaciones; 7→8 tras el único clic real). `tsc` y `pnpm lint` limpios.

Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` (sección nueva "Integración con el onboarding" + lección de arquitectura sobre GET/prefetch), `wiki/arquitectura/modelo-de-datos.md` (relación `asmt_user_id` ya no es "pendiente"), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 1 ampliado, ítem de Sprint 2 tachado como adelantado), `wiki/experiencia/flujo-de-onboarding.md` (nota sobre el nuevo rol de `contacto`).

Nota operativa: quedaron ~8 assessments de prueba en la BD local ligados a `francisco.test@example.com` (de los intentos fallidos durante la depuración) y 1 usuario/assessment de prueba nuevo (`nueva.persona@example.com`) — datos de prueba inofensivos, no se limpiaron automáticamente.

## [2026-08-05] build | Dashboard real en /cuenta — segundo hallazgo: sistemas de identidad paralelos

Probando el flujo, el usuario reportó que un análisis (usando la cuenta nueva.persona@example.com) no aparecía relacionado a su usuario. Investigación en la base de datos reveló dos cosas: (1) sí existe un análisis completado y bien vinculado (`asmt_user_id` correcto, con reporte generado); (2) había un segundo análisis con el email/nombre correctos pero `asmt_user_id` vacío.

Causa raíz del (2): el usuario había usado "Mis evaluaciones" (navbar), el sistema viejo passwordless que se dejó intacto a propósito. Su botón "Analizar otra idea" (`startNewAssessmentFromHistory` en `src/app/mis-evaluaciones/actions.ts`) copia email/nombre/teléfono pero no tiene ninguna noción del sistema de cuentas nuevo — por diseño, ese código es anterior a hoy. `/mis-evaluaciones` y `/cuenta` son hoy dos sistemas de identidad completamente paralelos y desconectados.

El usuario pidió: arreglar el dato suelto + agregar una lista simple en `/cuenta` ahora, sin esperar a Sprint 2. Se hizo: `UPDATE` puntual del assessment de prueba huérfano; `getUserAssessments()` (`src/app/cuenta/actions.ts`); `AccountAssessmentList` (`src/components/account/assessment-list.tsx`, mismo patrón visual que el `AssessmentList` del sistema viejo); ruta `/cuenta/evaluaciones/[id]` con el reporte completo, protegida por `asmt_user_id === user.user_id`; `/cuenta` ahora muestra la lista real en vez del placeholder.

Verificado en navegador real contra la base de datos: login → `/cuenta` muestra la evaluación completada real (idea, fecha, recomendación "Validar antes de invertir") → clic → reporte completo de 12 secciones se renderiza correctamente en `/cuenta/evaluaciones/[id]`. `tsc` y `pnpm lint` limpios.

No se tocó `/mis-evaluaciones` ni su botón "Analizar otra idea" — sigue sin poner `asmt_user_id`, eso queda para la migración completa de Sprint 2. Mientras tanto, cualquier análisis iniciado desde ahí seguirá quedando desligado de la cuenta nueva si el usuario también tiene sesión ahí en paralelo.

Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` (sección nueva sobre el dashboard + causa raíz de los sistemas paralelos), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 1 ampliado de nuevo, nota de qué falta exactamente para Sprint 2).

## [2026-08-05] build | Rediseño del panel /cuenta: navbar + sidebar tipo dashboard

El usuario pidió rediseñar solo el área autenticada (`/cuenta`): navbar con marca a la izquierda y dropdown de usuario a la derecha (Perfil, Cerrar sesión) — confirmado por pregunta directa que el orden pedido originalmente estaba invertido por error de escritura — más un sidebar con "Análisis realizados" como único ítem por ahora. Páginas públicas (landing, registro, login, recuperar) explícitamente sin cambios.

Implementado con un route group de Next.js (`src/app/cuenta/(dashboard)/`) para que solo el panel autenticado (`page.tsx`, `evaluaciones/[id]/page.tsx`, nuevo `perfil/page.tsx`) herede el nuevo layout, dejando `registro/`, `iniciar-sesion/`, `recuperar/` exactamente como estaban (mismo prefijo de URL `/cuenta`, layouts distintos). Nuevo layout centraliza el guard de autenticación. Nuevo primitivo de UI `src/components/ui/dropdown-menu.tsx` (primer uso de `@base-ui/react/menu` en el proyecto, mismo patrón que `sheet.tsx`). Nueva página de perfil, mínima y de solo lectura (nombre, correo, teléfono).

Verificado en navegador real: navbar y sidebar correctos, dropdown abre con Perfil/Cerrar sesión, perfil muestra los datos de la cuenta, logout desde el dropdown funciona, el detalle de una evaluación sigue renderizando el reporte completo dentro del nuevo chrome, y las páginas públicas (`/cuenta/registro`, `/cuenta/iniciar-sesion`) siguen usando el header/footer de marketing sin ningún cambio. `tsc` y `pnpm lint` limpios.

Creado: `wiki/arquitectura/dashboard-de-cuenta.md`. Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` (link cruzado), `index.md` (catálogo + gap de `/mis-evaluaciones` corregido, ya no dice "users sin vincular" porque eso se resolvió antes en la sesión).

## [2026-08-06] verify | RESEND_API_KEY configurado — encontrado el siguiente bloqueante real

El usuario configuró `RESEND_API_KEY` en `.env` y preguntó qué falta para cerrar Sprint 1. Se verificó con una prueba real (registro con correo nuevo) en vez de asumir que "tener la key" era suficiente: la llamada a Resend efectivamente ocurre (ya no es el fallback de consola), pero falló con `422 validation_error` — "Invalid `to` field... use our testing email address".

Causa: `RESEND_FROM_EMAIL` sigue en el placeholder de `.env.example` (`Decida <onboarding@decida.app>`), y `decida.app` no está verificado como dominio de envío en la cuenta de Resend. Con un dominio sin verificar, Resend solo permite enviar a la propia casilla de la cuenta — cualquier registro con un correo real de usuario fallará hasta que se verifique un dominio (o se use temporalmente el remitente de pruebas de Resend para seguir probando sin esperar el DNS).

Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` y `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` (sección "Pendiente que no es código") con el hallazgo y los dos caminos (remitente de pruebas ahora vs. dominio verificado antes de Sprint 4/lanzamiento).

## [2026-08-06] verify | Remitente de pruebas de Resend configurado y su restricción real confirmada

El usuario preguntó dónde encontrar el "correo remitente de pruebas" de Resend. Se confirmó en la documentación oficial de Resend (vía WebFetch/WebSearch, no de memoria) que no es algo que se busque en el dashboard — es una dirección fija que Resend documenta: `onboarding@resend.dev`. Se actualizó `RESEND_FROM_EMAIL` en `.env` a `Decida <onboarding@resend.dev>`.

Se probó en vivo (registro con correo de prueba distinto al de la cuenta de Resend) y falló igual que antes, con el mismo error 422. Se confirmó vía documentación oficial de Resend (https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) que esto es intencional: `onboarding@resend.dev` solo permite enviar a la dirección de correo con la que se creó la cuenta de Resend — cualquier otro destinatario falla hasta que se verifique un dominio propio en resend.com/domains.

Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` y `wiki/decisiones/plan-lanzamiento-60-90-dias.md` con la restricción confirmada y el paso siguiente (verificar dominio propio, necesario antes de la beta cerrada de Sprint 4).

## [2026-08-06] verify | Primer correo transaccional real enviado con éxito

A pedido del usuario, se probó un registro real con `fcastellanosduarte@gmail.com` (el correo de su cuenta de Resend). Sin errores en el servidor; la UI avanzó correctamente al paso "Confirma tu correo" — confirma que Resend aceptó y envió el correo de verificación de verdad, no el fallback de consola. Este es el primer correo transaccional real que sale de la app.

No se completó el registro (no se tiene acceso al inbox del usuario para leer el código de 6 dígitos) — queda en el paso de verificación, a la espera de que el usuario revise su correo si quiere terminarlo.

Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` con la confirmación de envío real.

## [2026-08-26] build | Puntos extra al Sprint 1 — recuperación de contraseña en 3 pantallas

El usuario pidió agregar puntos nuevos al Sprint 1. Primero: mover el ingreso del código de verificación a su propia pantalla en el flujo de recuperación de contraseña. Elegido (por pregunta directa) el esquema de 3 pantallas: correo → código → nueva contraseña, donde cada tarjeta reemplaza a la anterior en vez de apilarse.

Implementado en el código de la app: `checkAuthCode` en `src/lib/auth/verification.ts` (valida un código sin marcarlo usado — el `verifyAuthCode` que lo consume sigue corriendo solo en el paso final), acción `verifyResetCode` + `verifyResetCodeSchema`, `ResetPasswordForm` reescrito como wizard de 3 pasos con estado `email|code|password`. Hardening incidental encontrado probando: `requestPasswordReset` hacía `throw` si `sendEmail` fallaba (el `422` de Resend con destinatario que no es la casilla de la cuenta) → error 500 + fuga de si el correo existe; ahora va en `try/catch`. `signUp` no se tocó.

Verificado en navegador real contra la BD local: flujo completo con `fcastellanosduarte@gmail.com` (código leído de la BD) → login con la contraseña nueva entra a `/cuenta`; el código se marca `vc_used_at` solo tras el paso final; código incorrecto → error inline sin avanzar; "Usar otro correo" → vuelve al paso 1; correo no entregable → ya no da 500. `tsc` y `pnpm lint` limpios.

Nota operativa: la prueba dejó la contraseña de `fcastellanosduarte@gmail.com` como `DecidaReset2026!` en la BD local de desarrollo.

Actualizado: `wiki/arquitectura/modulo-de-usuarios-y-autenticacion.md` (sección nueva + fila de la tabla de rutas + decisión de diseño), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (subsección "Puntos extra agregados al Sprint 1", con el punto 2 abierto a la espera de que el usuario liste los demás). Cambios de código sin commitear al cierre.

## [2026-08-26] build | Sprint 1 extra — paso final del reset termina en card de confirmación, no en formulario

Segundo ajuste al mismo flujo: el usuario pidió que la última pantalla (nueva contraseña), una vez cambiada la contraseña, reemplace el formulario por una alerta visible con ícono y una card estética, ya que el input y el botón dejan de ser necesarios.

Implementado en `src/components/auth/reset-password-form.tsx`: el estado `step === "password"` se bifurca — si `resetState.success`, se renderiza una `Card` (`role="status"`, tinte esmeralda `border-emerald-500/30 bg-emerald-50/40`) con un badge circular con ring y el ícono `CheckCircle2`, título "Contraseña actualizada", texto de apoyo y el único CTA "Ir a iniciar sesión"; si no, el formulario de siempre. Mismo lenguaje visual que las cards positivas de `/ejemplo`. Sin cambios de servidor.

Verificado en navegador: flujo completo hasta el paso 3 → la card de éxito aparece y el input + botón "Actualizar contraseña" desaparecen. Reconfirmado de paso que el blindaje de `requestPasswordReset` funciona: reset para `nueva.persona@example.com` (verificado, correo que Resend rechaza) avanza al paso de código sin 500. `tsc` y `pnpm lint` limpios. Código sin commitear.

## [2026-08-26] decision | Sprint 2 — agregar corrección de errores del paso "Así entendimos tu idea"

El usuario pidió agregar al Sprint 2 el punto de corregir errores en el paso `confirmacion` del onboarding (`/analizar/confirmacion`, "Así entendimos tu idea"). Solo documentación, sin código todavía — los bugs concretos quedan pendientes de que el usuario los liste.

Actualizado `wiki/decisiones/plan-lanzamiento-60-90-dias.md`: fila del Sprint 2 en la tabla, subsección nueva "Corregir errores del paso «Así entendimos tu idea»" con las rutas de código relevantes (`src/components/onboarding/idea-confirmation.tsx`, `src/lib/onboarding/copy.ts`, `src/lib/ai/prompts/idea-summary.ts` e `idea-refinement.ts`) y un hueco para el desglose de bugs, y el checkpoint del 6 sep.

## [2026-08-26] decision | Sprint 2 — 2 datos de negocio más a capturar en el onboarding: CAC y catálogo de productos/precios

El usuario agregó dos puntos más al Sprint 2: (1) capturar información para el costo de adquisición de clientes (CAC) — hoy el onboarding solo pregunta el canal (`acquisitionChannel`), no su costo; (2) una sección de productos/servicios que se piensan vender con su precio cada uno — hoy `evaluationFinancialSchema` tiene un único `price`.

Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (fila del Sprint 2 + subsección nueva "Datos de negocio adicionales a capturar en el onboarding", con las rutas de código a revisar y la nota de conectarlos al scoring, no dejarlos como dato muerto), `wiki/producto/gaps-onboarding-vs-framework.md` (fila de CAC en dimensión 3 comercial, fila de productos/precios en dimensión 2 financiera, ítems 10-11 en el resumen priorizado). Solo documentación, sin código.

## [2026-08-26] document | Documentado el commit local sin subir — pulido del paso "Así entendimos tu idea"

A pedido del usuario, se documentó el trabajo que está en el árbol de trabajo sin commitear (733 inserciones / 161 borrados en 7 archivos + 2 nuevos). Es pulido del paso `confirmacion` del onboarding y el primer lote del punto de Sprint 2 "corregir errores del paso «Así entendimos tu idea»".

Qué hace ese trabajo, según lectura directa del `git diff`:
- **Bug central corregido**: al pulir la idea con las aclaraciones del usuario, la salida (sobre todo el fallback sin `OPENAI_API_KEY`) pegaba las aclaraciones crudas en las tarjetas de "Nuestro entendimiento" y en el resumen, dejando texto tipo transcripción de Q&A con muletillas meta ("comentaste:", "indicaste:"). El fallback literalmente hacía `cliente_objetivo = <aclaración>`.
- **Tres capas de defensa**: (1) `IDEA_REFINEMENT_SYSTEM_PROMPT` reescrito de "integra" a "REESCRIBE como análisis", con reglas anti-transcripción, mapeo semántico tema→campo y un ejemplo de estilo; ahora recibe el `structuredUnderstanding` actual como input. (2) Saneadores determinísticos nuevos en `openai.ts` (`looksLikeQaDump`, `looksLikeRawClarificationDump`, `sanitizeStructuredUnderstanding`, `sanitizeSummaryNarrative`) que corren sobre la salida real y de fallback. (3) `generateFallbackIdeaRefinement` reescrito: conserva el estructurado previo, teje aclaraciones en prosa por categoría (`weaveClarificationSentence`/`polishClause`), rota supuestos de un pool.
- **Feature nueva "Analizar más"** (`rotateIdeaAssumptions` + `idea-assumptions-rotate.ts` prompt/schema nuevos): regenera solo la lista de supuestos con ángulos frescos, sin tocar el resumen; limpia selección/aclaraciones; badge de "Ronda N".
- **IDs de supuesto únicos** (`ensureUniqueAssumptionIds` en `idea-assumptions.ts` y en el componente): la IA repetía `id`s y eso colapsaba el estado de aclaración (un input llenaba otro).
- **A11y/UX**: skeleton de carga, checkbox+label asociados por `id`, click en el input de aclaración ya no togglea el checkbox, "Lo que pulimos juntos" → "Recomendaciones", flag `busy` unificado, mensajes de error combinados.
- **Schema**: `ideaRefinementSchema.assumptions` `.min(2).max(5)`; flag `RefineIdeaState.assumptionsOnly`; mensajes de éxito distintos IA vs. fallback; `console.error` en fallback.
- **Estado de calidad**: `tsc --noEmit` limpio; eslint agrega **1 error nuevo** `react-hooks/set-state-in-effect` en `idea-confirmation.tsx` (el `useEffect` de `rotateState` copia el patrón del de `refineState`, que ya tenía ese error preexistente — el "un error de eslint preexistente" que menciona `AGENTS.md` vive en este archivo).

Actualizado: `wiki/experiencia/flujo-de-onboarding.md` (sección nueva dedicada al paso `confirmacion`), `wiki/framework/prompts-de-ia.md` (prompt de refinamiento + prompt rotate nuevo + capa de saneo), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (nota de "avance real" en el punto de Sprint 2). No se tocó código ni se commiteó nada.

_(Seguimiento: el usuario luego lo commiteó como `0259101`; las páginas se corrigieron para reflejarlo.)_

## [2026-08-27] build | Sprint 2 — red flags financieras determinísticas + cruce inversión vs. capital en el riskScore

El usuario pidió trabajar el punto del score de riesgo. Al revisar el código se encontró que el **núcleo ya estaba commiteado** (`43d1112`, desde un spec en `.kiro/specs/risk-score-fix/`): capital disponible + pérdida aceptable de vuelta en el paso `perfil`, `saveSituation` las persiste, y `pfit_uncertainty_comfort_score` / `pfit_process_comfort_score` conectados al `personalFitScore` (con columna nueva `pfit_process_comfort_score` ya migrada en la BD, 5 tests en `src/lib/scoring/__tests__/types.test.ts`). Ese spec dejó fuera a propósito el cruce inversión-vs-capital y las red flags financieras — eso es lo que se hizo ahora.

Implementado (sin commitear al cierre):
- **`detectFinancialRedFlags(assessment)`** en `src/lib/scoring/types.ts`: emite las 2 red flags financieras del catálogo de Notion — "inversión inicial > pérdida aceptable" e "inversión inicial > capital disponible" — cruzando `finp_initial_investment` contra el **techo** del rango declarado (`ACCEPTABLE_LOSS_CEILING` / `CAPITAL_RANGE_CEILING`, sincronizados con `options.ts`). Rangos abiertos (`mas_100k` / `mas_500k`) = techo `Infinity`, nunca disparan. Si los rangos no se capturaron (assessments viejos) o no hay inversión declarada → array vacío.
- **`riskScore`** en `calculateDeterministicScores`: penalización de sobre-exposición `+12` (inversión > pérdida tolerable) y/o `+8` (inversión > capital). No cambia la firma pública ni las otras dimensiones.
- **`runScoringPipeline`** (`scoring/index.ts`): las flags determinísticas se anteponen a `interpretation.red_flags` (mutando el objeto para que tanto el `assessment_scores.upsert` como `generateReport` vean la misma lista); dedupe defensivo.
- **Contexto a la IA**: `buildAssessmentContext` (interpret) y `buildContext` (reporte) ahora incluyen inversión inicial + capital declarado + pérdida tolerable. `SCORING_INTERPRET_SYSTEM_PROMPT` gana una instrucción de reflejar la sobre-exposición en `risk_level_signal` + una red flag.
- **Tests**: +9 en `types.test.ts` (7 de `detectFinancialRedFlags`, 2 de la penalización de riskScore). Total 14, todos pasan. `tsc` y eslint limpios en los archivos tocados.

Verificado contra datos reales: se recorrió `runScoringPipeline` sobre un assessment de prueba real (`cmta3xvx6…`, `menos_5k` de pérdida tolerable, inversión $45,000) — `ascs_red_flags` persistido en la BD quedó con la flag determinística primero ("Tu inversión inicial ($45,000) es mayor que lo que dijiste que podrías perder…") + una de la IA reforzándola, `ascs_risk_level_score` = 100, semáforo rojo. Assessments viejos sin los rangos: sin flags, riskScore fallback 50 (preservado).

Actualizado: `wiki/framework/scoring-engine.md`, `wiki/producto/gaps-onboarding-vs-framework.md`, `wiki/decisiones/evolucion-del-producto.md` (#2 → RESUELTO), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (P0#4 + Sprint 2 imprescindible 1/2/7 marcados hechos), `wiki/overview.md` (gaps + estado de desarrollo). De paso se corrigieron las etiquetas "commit pendiente" del pulido de "Así entendimos tu idea" (ya commiteado como `0259101`).

## [2026-08-28] decision | `pfit_avoided_activities` movido del Sprint 2 al Sprint 3

El usuario revisó el avance (score de riesgo, red flags y pulido de "Así entendimos tu idea" ya commiteados: `43d1112`, `936351d`, `0259101`) y decidió sacar del Sprint 2 el punto de "actividades que evita" (`pfit_avoided_activities`), porque **apenas se está definiendo qué se va a hacer con ese campo** — no arregla nada roto hoy, simplemente no existe la captura ni el uso.

Actualizado:
- `wiki/decisiones/plan-lanzamiento-60-90-dias.md`: quitado de la lista "Imprescindible" del Sprint 2 (renumerada); agregado a la fila del Sprint 3 en la tabla; subsección nueva "Sprint 3 — «actividades que evita» (`pfit_avoided_activities`)" con lo que hay que definir antes de implementar (opciones, efecto en scoring, ubicación del input).
- `wiki/producto/gaps-onboarding-vs-framework.md`: fila de "Actividades que evita" en la dimensión 1 marcada como movida a Sprint 3; resumen priorizado renumerado con sección "Movido al Sprint 3".

Sin cambios de código.

## [2026-08-28] decision | Cerrado el punto "corregir errores del paso «Así entendimos tu idea»"

El usuario confirmó que el punto está hecho: no hubo una lista separada de bugs concretos — los errores que tenía en mente quedaron cubiertos por el commit `0259101` (pulido de refinamiento IA + rotación de supuestos, 2026-08-27). No hay commits ni cambios nuevos aparte de ese.

Actualizado:
- `wiki/decisiones/plan-lanzamiento-60-90-dias.md`: subsección renombrada a "✅ Corregir errores del paso «Así entendimos tu idea» (… cerrado 2026-08-28)", con nota de que no hubo catálogo de bugs y `0259101` lo cubrió; se dejó anotada la deuda menor de eslint (`set-state-in-effect`). Fila del Sprint 2 en la tabla con ese ítem tachado (`0259101`), más `/mis-evaluaciones` → `/cuenta` (`43d1112`).
- `wiki/experiencia/flujo-de-onboarding.md`: la sección del paso `confirmacion` ahora dice que **cierra** el punto, no que es "primer lote".
- `wiki/overview.md`: quitado de la lista de pendientes de Sprint 2.

Queda abierto en Sprint 2 sólo: input de `mrsk_business_dependencies`, granularidad de "¿habló con clientes?", modelo de ingreso, CAC, sección de productos/precios. Sin cambios de código.

## [2026-08-28] build | Paso nuevo `productos` en el onboarding — catálogo de productos/servicios (Sprint 2, punto 5)

El usuario pidió agregar un paso "productos y servicios" antes de "Evaluemos los números y el mercado". Se aclararon 3 decisiones con preguntas: (1) el listado **absorbe** los 3 campos únicos de precio/costo/ventas de `evaluacion` (el scoring deriva un blend); (2) por renglón se captura nombre + tipo (producto/servicio) + precio + costo variable + unidades/mes; (3) obligatorio, mín. 1, máx. 10.

Implementado (sin commitear al cierre):
- **Paso** `productos` (order 7, entre `ajuste` y `evaluacion`): `src/lib/onboarding/steps.ts`, `copy.ts`, `src/app/analizar/productos/page.tsx`, `src/components/onboarding/products-form.tsx` (lista dinámica con estado cliente → hidden JSON, preview en vivo de ingresos/utilidad/margen, alerta de venta bajo costo).
- **Datos**: columna JSON `finp_products` en `financial_inputs` (`prisma db push` corrido). `saveProducts` en `actions.ts` parsea con `productsSchema` (Zod), calcula el blend ponderado por unidades con `blendProducts()` (`src/lib/onboarding/products.ts`) y escribe `finp_products` + los 3 derivados (`finp_price_per_sale`, `finp_variable_cost_per_sale`, `finp_estimated_monthly_sales`). El blend es exacto para la utilidad bruta mensual.
- **`evaluacion`**: `evaluationFinancialSchema` y `evaluation-form.tsx` pierden los 3 campos; conserva inversión inicial + costos fijos + mercado.
- **Navegación**: `hasProducts()` en `navigation.ts`; `getResumeStep` manda a `productos` tras `ajuste`; `canAccessStep` con prereqs.
- **Scoring/reporte**: `detectFinancialRedFlags()` emite una red flag por producto con precio ≤ costo variable (`productsBelowCost()`); `generate-report.ts` pasa el listado a los prompts de `business_understanding` y `financial_analysis`; `result-report.tsx` muestra tabla "Productos y servicios" con margen por renglón (rojo si ≤ 0) y etiqueta "promedio (ponderado)" en los inputs cuando hay >1 producto.
- **Tests**: `src/lib/onboarding/__tests__/products.test.ts` (5, cubren blend exacto / units=0 / below-cost / parseo). `vitest` total 19, `tsc` y `eslint` limpios (los 5 errores preexistentes de eslint no son de estos archivos).

Verificado end-to-end con Playwright (cookie sembrada sobre un assessment real `cmtbj31wj…` para saltar el paso de contacto de los e2e, que está roto desde que `contactSchema` pide `password`): el paso renderiza, guarda 2 productos, el blend en BD queda correcto (precio $900, costo $206.67, 30 uds.), `evaluacion` ya no tiene los 3 campos, el guard no deja saltar a `resultado`, y el reporte final muestra la tabla de productos + margen −7% en rojo + la red flag "vende bajo costo" (primera en `ascs_red_flags`, antes de las de la IA). Se instaló `playwright chromium` (no estaba). Se revirtió un bump incidental de `pnpm-lock.yaml`.

Los 3 archivos e2e (`onboarding.spec.ts`, `multi-idea-history.spec.ts`, `onboarding-ux-audit.spec.ts`) se actualizaron para el paso nuevo (`data-testid` en la fila de productos, helper `completarProductos`), aunque la suite ya estaba roja antes por el paso de contacto.

Actualizado: `wiki/experiencia/flujo-de-onboarding.md` (tabla de pasos + sección nueva), `wiki/framework/scoring-engine.md` (red flag + blend), `wiki/producto/gaps-onboarding-vs-framework.md` (dimensión 2 + punto 11 hecho), `wiki/decisiones/plan-lanzamiento-60-90-dias.md`, `wiki/decisiones/evolucion-del-producto.md` (entrada #8), `wiki/overview.md`.

Nota operativa: el assessment de prueba `cmtbj31wj0010t86zj4299ls3` quedó completado con productos de prueba en la BD local. El dev server se reinició (era necesario para que Prisma cargara la columna nueva) y ahora corre bajo el preview de la sesión.

## [2026-08-28] decision | Alcance de los campos restantes del onboarding — CAC y modelo de ingreso fuera del MVP

El usuario pidió un análisis de los 4 campos pendientes del Sprint 2 (dependencias del negocio, granularidad "¿habló con clientes?", modelo de ingreso, CAC): qué funcionalidad/manejo de información implica cada uno y si conviene meterlo al MVP. Criterio usado: solo entra lo que vuelve creíble una dimensión del rubric; el resto es enriquecimiento y se pospone (alineado con el "riesgo estratégico" del PRD).

Veredicto y decisión del usuario:
- **Dependencias del negocio** (`mrsk_business_dependencies`) → **entra a Sprint 2**. Arregla la dimensión 4 (Riesgo), la menos cubierta. Multi-select en `evaluacion`, penalización en `riskScore`, 2 red flags determinísticas del checklist del rubric. Sin migración (la columna existe).
- **Granularidad "¿habló con clientes?"** → **entra a Sprint 2**. El sí/no vale 35 de ~75 pts del `commercialScore` (dimensión de 25%) — acantilado binario. Se cambia por los 5 niveles del Question Bank original.
- **Modelo de ingreso** → **fuera del MVP**, a Sprint 3. Sin LTV en el motor determinístico solo desbloquea 1 red flag; es enriquecimiento.
- **CAC** → **fuera del MVP**, a post-beta. No es input del rubric, necesita el modelo de ingreso primero (falsas alarmas en suscripción), y es la estimación menos confiable del assessment.

Creado: `wiki/decisiones/alcance-campos-restantes-sprint-2.md` (análisis completo por campo). Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 2 recortado a los 2 críticos; subsección "Sprint 3 — campos de onboarding pospuestos" con los 3 diferidos; filas de la tabla de sprints), `wiki/producto/gaps-onboarding-vs-framework.md` (resumen priorizado renumerado + filas de dimensión 2/3), `wiki/overview.md`, `index.md`. Sin cambios de código.

## [2026-08-28] decision | Diseño de "dependencias del negocio" (Sprint 2, imprescindible #3)

El usuario pidió planear el punto de dependencias del negocio. Se exploró el patrón actual (paso `evaluacion`, multi-select tipo `enjoyedActivities`, `detectFinancialRedFlags`, tests) y se cerraron 4 decisiones con preguntas:

1. **Opciones**: la lista completa **menos "personas clave"** → 6 dependencias + "ninguna": proveedor único · 1-2 clientes = mayoría de ingresos · plataforma externa (Instagram/Amazon/Uber/App Store) · permiso/licencia/regulación · ubicación física específica · inventario que caduca o se deprecia rápido.
2. **UI**: grid de checkboxes en 2 columnas (patrón de `enjoyedActivities`), no tarjetas apiladas. Va en el `FieldSet` "Mercado y riesgos" del paso `evaluacion` — no un paso nuevo.
3. **Scoring**: penalización ponderada al `riskScore` — plataforma +6, permiso +6, las otras 4 +3 c/u, tope +16.
4. **Red flags determinísticas (3)**: plataforma ("ten plan alterno"), permiso ("investígalo antes de invertir"), cliente único ("si uno se va, el negocio tambalea"). Sin follow-up de "¿ya tienes plan B?" por dependencia — deliberado, sería demasiado.

Otros puntos del diseño: `mrsk_business_dependencies Json?` ya existe → sin migración; nueva función `detectDependencyRedFlags()` hermana de `detectFinancialRedFlags()`, mergeada en `ascs_red_flags`; contexto de dependencias a la IA (`buildAssessmentContext` + prompt `strengths_risks`).

Plan de implementación completo en `.claude/plans/` (artefacto de ingeniería). El trabajo se planeó en plan mode, así que esta documentación en el brain quedó pendiente hasta ahora.

Actualizado: `wiki/decisiones/alcance-campos-restantes-sprint-2.md` (tabla de diseño decidido en la sección de dependencias), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 2 imprescindible #3), `wiki/producto/gaps-onboarding-vs-framework.md` (dimensión 4 + resumen priorizado). Estado: **diseñado, no implementado**. Sin cambios de código.

## [2026-08-28] build | Dependencias del negocio implementadas (Sprint 2, imprescindible #3)

Se implementó el diseño decidido antes (ver entrada `decision` del 2026-08-28). Sin commitear al cierre.

- **Input**: `BUSINESS_DEPENDENCY_OPTIONS` en `src/lib/onboarding/options.ts` (6 + "ninguna"); grid de checkboxes en el `FieldSet` "Mercado y riesgos" del paso `evaluacion` (`evaluation-form.tsx`), después del canal de adquisición. `evaluationMarketSchema` gana `businessDependencies: z.array(z.string()).min(1)`; `saveEvaluation` lo parsea con `formData.getAll` y lo persiste en `mrsk_business_dependencies` (columna JSON que ya existía, **sin migración**).
- **Scoring** (`src/lib/scoring/types.ts`): `DEPENDENCY_RISK_WEIGHTS` (plataforma 6, permiso 6, proveedor/cliente_unico/ubicacion/inventario 3), `dependencyRiskPenalty()` con tope `DEPENDENCY_PENALTY_CAP = 16`, sumado al `riskScore` junto a la penalización de sobre-exposición. `detectDependencyRedFlags()` — 3 red flags (plataforma, permiso, cliente único); las otras 3 opciones penalizan pero no emiten flag.
- **Pipeline** (`src/lib/scoring/index.ts`): `runScoringPipeline` mergea `[...detectFinancialRedFlags, ...detectDependencyRedFlags]` en `ascs_red_flags` (determinísticas primero). `buildAssessmentContext` pasa las dependencias declaradas al prompt de interpretación.
- **Reporte** (`src/lib/ai/generate-report.ts`): `ctx.dependencies` alimenta el prompt `strengths_risks`.
- **Tests**: +9 en `types.test.ts` (`riskScore — business-dependency penalty` con deltas exactos 65→71→77→81/cap, y `detectDependencyRedFlags`). Total 28, `tsc` y `eslint` limpios (los 5 errores de eslint son preexistentes).

Verificado end-to-end con Playwright (cookie sembrada sobre `cmtbj31wj…`): el grid renderiza sus 7 casillas, `mrsk_business_dependencies` se guarda como `["cliente_unico","plataforma","permiso"]`, y la sección "Riesgos" del reporte muestra las 3 red flags de dependencia después de las 3 financieras (7 entradas totales en `ascs_red_flags`). El `riskScore` de ese assessment ya estaba clampeado a 100 por sobre-exposición extrema; los tests unitarios prueban el +N exacto sobre un caso con margen. Docker Desktop estaba caído al inicio de la sesión — se relanzó con `open -a Docker`. Dev server reiniciado bajo el preview.

Actualizado: `wiki/framework/scoring-engine.md` (sección "Penalizaciones al riskScore" + red flags de dependencia + "datos ignorados"), `wiki/producto/gaps-onboarding-vs-framework.md` (dimensión 4: dependencias/concentración/regulatorias ✅, solo queda reversibilidad; resumen priorizado #3), `wiki/decisiones/alcance-campos-restantes-sprint-2.md` (marcado HECHO), `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (Sprint 2 #3 ✅), `wiki/experiencia/flujo-de-onboarding.md` (sección nueva del paso `evaluacion`), `wiki/overview.md`.

## [2026-09-02] build | Las 3 secciones JSON del reporte estaban rotas al 100% — arregladas

El usuario reportó que la sección **Fortalezas** casi siempre mostraba un solo bullet inútil ("Tu idea tiene elementos a favor según tu perfil"). Resultó no ser un prompt vago sino un bug con **33 de 33 reportes afectados**, y con tres defectos derivados de una sola causa.

**Causa raíz**: `strengths_risks` y `validation_plan` piden JSON, pero se generaban con `generateText()` (sin `response_format: json_object`) bajo un `BASE_SYSTEM` que instruye "Puedes usar formato Markdown". El modelo obedecía, cercaba el JSON en un bloque ```` ```json ````, `JSON.parse` tronaba y el `catch {}` **mudo** guardaba los textos hardcodeados. El retry sólo envuelve la llamada al API; el parseo corre fuera de su alcance.

**Los tres defectos (verificados en BD):** `arep_strengths` genérico 33/33 · `arep_validation_plan` hardcodeado 33/33 · `arep_risks` idéntico a `ascs_red_flags` en 32/33, y como el renderer hacía `[...risks, ...redFlags]`, **cada riesgo salía duplicado en pantalla** (defecto que el usuario no había notado). Además el reporte real entregaba **menos que su propio preview de venta**: `/ejemplo` ya usaba las formas ricas que pide el diseño de Notion.

Decisiones con el usuario: fortalezas con `{título + por qué importa}` como `/ejemplo`; arreglar las 3 secciones; y respaldo **determinístico** en vez de texto genérico.

Implementado (sin commitear):
- **`src/lib/ai/schemas/report-sections.ts`** (nuevo) — `strengthsRisksSchema` y `validationPlanSchema` + system prompts dedicados **sin instrucción de Markdown**, con las reglas de calidad del diseño (cada fortaleza cita un dato real; cada riesgo trae su acción; no inventar). Las secciones ahora van por `generateJson` + Zod, el patrón que ya usaban las 4 llamadas de IA que sí funcionaban.
- **`src/lib/scoring/strengths.ts`** (nuevo) — `detectDeterministicStrengths()`, 15 reglas en 4 tiers (los números del usuario → evidencia de mercado → ausencia de fragilidad → preferencias declaradas), cap 5. Cada copy cita el dato real. Si nada dispara devuelve `[]` y el reporte muestra un **estado vacío honesto**: nunca se fabrica una fortaleza. Se usa como respaldo y como piso de calidad (sólo si la IA devuelve menos de 3 — toparlo siempre producía casi-duplicados tipo "Margen bruto **del** 60%" junto a "Margen bruto **de** 60%", detectado y corregido en la verificación).
- **`src/lib/scoring/ranges.ts`** (nuevo) — techos de rango, formatters, helpers de dependencias y mapas de etiquetas, extraídos de `types.ts`; de paso elimina la duplicación de `LOSS_RANGE_LABELS`/`CAPITAL_RANGE_LABELS` que ya existía en `scoring/index.ts`.
- **`src/lib/report/sections.ts`** (nuevo) — tipos `ReportStrength`/`ReportRisk`/`ValidationWeek` y `parseStored*` retrocompatibles (leen tanto `string[]` viejo como los objetos nuevos, y tanto `{week1,week2}` como `{weeks:[...]}`). Zod-free a propósito para no arrastrar la capa de IA al render.
- **`generate-report.ts`** — secciones JSON separadas del pipeline de texto, `catch` con `logReportGenerationError` (el silencio es lo que dejó pasar 33 reportes), se quitó `risks = interpretation.red_flags`, `REPORT_PROMPT_VERSION` → `v1.1.0`, y el prompt de fortalezas recibe las determinísticas como "hechos verificados".
- **`result-report.tsx`** — fortalezas y riesgos como tarjetas al estilo `/ejemplo` (riesgos con "Cómo reducirlo"), red flags determinísticas en su propio bloque "Alertas detectadas en tus números" (esto elimina la duplicación), y plan de 4 semanas con título por semana.

**Verificación**: `tsc` limpio, **45 tests** (+17: 8 de fortalezas determinísticas, 9 de los parsers), eslint sin errores nuevos. Corrido end-to-end contra el modelo real dos veces: `arep_prompt_version=v1.1.0`, 5 fortalezas / 3 riesgos / 4 semanas, y `arep_risks ≠ ascs_red_flags`. También se comprobó el respaldo: para ese assessment real, si la IA fallara, el usuario vería 5 fortalezas con sus números ($180 de margen, 60%, "10 a 20 horas", "4/5") en vez del bullet vacío.

**Los 33 reportes viejos se dejan** — son datos de prueba locales (sin clientes reales, todos los pagos son `placeholder`), y la forma nueva no se puede sintetizar desde los strings guardados. El renderer los muestra sin romperse por el parseo retrocompatible.

Nota de sesión: a media tarea Bash perdió el acceso a `~/Documents` (permiso de macOS, no el sandbox); el usuario lo restauró. Documentación actualizada: `wiki/experiencia/reporte-de-resultado.md`, `wiki/framework/prompts-de-ia.md`, `wiki/decisiones/evolucion-del-producto.md` (#9), `wiki/overview.md`, `index.md`.

## [2026-09-02] query | Granularidad "¿habló con clientes?" — último punto de Sprint 2

Pregunta: qué falta de Sprint 2. Respuesta desde `wiki/decisiones/alcance-campos-restantes-sprint-2.md`: solo la granularidad de "¿habló con clientes?" (dependencias del negocio ya estaba hecho; modelo de ingreso y `pfit_avoided_activities` → Sprint 3; CAC → post-beta).

Implementado en el mismo turno (código):
- `mrsk_customer_evidence_level String?` nuevo (`db:push`), 5 niveles `ninguno/1_3/4_10/mas_10/ya_clientes` (Question Bank F1). Bool `mrsk_has_talked_to_customers` sincronizado (nivel ≠ `ninguno` → true) para retrocompat.
- `commercialScore`: gradiente 10→38 en vez del acantilado binario 35/10.
- `riskScore`: se corrigió el signo del término de clientes (antes `+10 si habló` subía el riesgo). Ahora `ninguno` +8 … `ya_clientes` −8. Decisión del usuario: hablar con prospectos ≠ demanda probada.
- `resolveCustomerEvidenceLevel()` en `ranges.ts` tolera filas viejas.
- IA: `buildAssessmentContext` pasa "Evidencia de clientes: …".
- Archivos: `options.ts`, `schemas.ts`, `ranges.ts`, `scoring/types.ts`, `scoring/index.ts`, `actions.ts`, `evaluation-form.tsx`, `assessment-utils.ts`, `prisma/schema.prisma`. Tests: +7 en `scoring/__tests__/types.test.ts` (35), e2e (`onboarding.spec.ts`, `multi-idea-history.spec.ts`, `onboarding-ux-audit.spec.ts`) actualizados. `tsc` limpio, 50 tests verdes. Sin commitear.

Wiki actualizado: `alcance-campos-restantes-sprint-2.md`, `gaps-onboarding-vs-framework.md`, `framework/scoring-engine.md`, `decisiones/evolucion-del-producto.md` (#10). Sin páginas nuevas (no toca `index.md`).

## [2026-09-02] query | Dos mejoras nuevas del usuario agregadas al plan

El usuario pidió agregar al plan dos mejoras de producto (no acotadas aún):
1. **Pulir la idea — 2ª iteración** en el paso «Así entendimos tu idea». Mejora de fondo de `refineIdea`, más allá del arreglo de transcripción de `0259101`. Falta que el usuario liste los dolores puntuales.
2. **Chat de mejora sobre la página de resultado** (post-flujo, IA): conversar sobre el reporte para identificar los puntos que el usuario no especificó —o decidió no especificar— y ver reflejado por qué importan. Versión conversacional de "Risks and Blind Spots".

Brecha marcada: (2) reabre "chat IA complejo", que el backlog de Notion (09) pone **explícitamente fuera de alcance** del MVP. Registrada en `evolucion-del-producto.md` #11. Riesgo estratégico del PRD (construir de más antes de validar pago) + costo de API recurrente → candidata a plan de pago y/o post-beta.

Ambas quedan **sin acotar**: necesitan sesión de alcance con el usuario (formato de `alcance-campos-restantes-sprint-2.md`) antes de estimarse o entrar a un sprint.

Páginas actualizadas: `decisiones/plan-lanzamiento-60-90-dias.md` (sección nueva "Mejoras de producto pedidas el 2026-09-02" + Sprint 2 marcado cerrado), `producto/roadmap-y-backlog.md`, `decisiones/evolucion-del-producto.md` (#11), `experiencia/reporte-de-resultado.md`, `experiencia/flujo-de-onboarding.md`, `overview.md`. Sin páginas nuevas.

## [2026-09-07] decision | Modelo de cobro definido: suscripción + freemium — agregado al Sprint 3

El usuario cerró la decisión de "modelo de cobro" que estaba abierta desde 2026-08-05. **Decida se cobra por suscripción**, no por análisis único; el nivel más barato es **$99 MXN** (el "Starter" de la hipótesis de Notion), los demás niveles quedan pendientes. Debajo hay una **capa freemium** pensada como embudo de conversión.

Alcance aclarado con 4 preguntas directas:
- **Cobro real**: NO en el Sprint 3 — solo se rediseñan las pantallas de pago (de "pago único simulado" a "elige plan / suscríbete") y se construye el gating freemium/suscriptor. La integración de cobro recurrente real (Stripe / Mercado Pago) se mantiene en el Sprint 5. `savePayment` sigue simulado.
- **Vista freemium del reporte**: se genera completo por detrás, pero solo se muestra recomendación + snapshot de semáforos de las 6 dimensiones + 1 riesgo (el principal). El resto bloqueado con CTA a suscripción. Es gating de render, no de generación — el reporte completo ya vive en `assessment_reports`.
- **Límite freemium**: 1 evaluación activa a la vez (no "1 de por vida" ni "1 al mes").
- **Cuenta**: el freemium requiere crear cuenta (el paso `contacto` ya lo hace); no hay generación anónima.

Quedó **sin acotar** (mini-sesión de alcance en el Sprint 3): qué campos/pasos del onboarding se recortan para freemium (con la tensión anotada: menos inputs → más fallbacks del motor → reporte "completo" de peor calidad real), si suscribirse desbloquea evaluaciones freemium viejas, cómo cambia la promesa de reembolso con suscripción, y si el $99 es mensual o anual.

Solo documentación, sin cambios de código. Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (decisión de producto v3 + fila y subsección nuevas del Sprint 3 + P2 #9 + checkpoint 20 sep + historial de priorización), `wiki/producto/pricing-y-gtm.md` (sección "Modelo de cobro decidido" + nota en landing copy + estado real), `wiki/decisiones/evolucion-del-producto.md` (#12), `wiki/experiencia/reporte-de-resultado.md` (sección "Vista freemium (recortada)"), `wiki/experiencia/flujo-de-onboarding.md` (sección "Ruta reducida de freemium"), `wiki/overview.md` (gap de pago + estado de desarrollo Sprint 3). Sin páginas nuevas (no toca `index.md`).

## [2026-09-07] decision | Modelo de suscripción — puntos faltantes cerrados

El usuario resolvió los 4 puntos que habían quedado sin acotar en la decisión anterior del mismo día:

1. **Onboarding freemium: NO se recorta.** El usuario freemium responde el cuestionario completo (los 9 pasos), a propósito, para que vea todos los puntos que Decida evalúa. El reporte se genera y se guarda completo igual que hoy. Lo único que cambia es la vista del resultado. Esto elimina la tensión anotada de "menos inputs → más fallbacks del motor" — ya no aplica.
2. **Desbloqueo retroactivo.** Al pagar la suscripción se habilita el modo completo para todas las evaluaciones del usuario, incluidas las que hizo como freemium. El gate mira el estado de suscripción de la cuenta, no un flag por evaluación → gating de render con una sola condición.
3. **Sin reembolsos, solo cancelación.** Suscripción mensual. Al cancelar, el acceso completo se mantiene hasta el fin del periodo ya pagado (`subscription_current_period_end`) y luego revierte a la vista freemium. El `docs/REFUND_PROCESS.md` y la garantía de reembolso de pago único quedan obsoletos.
4. **$99 = mensual.**

Consecuencia de diseño: el alcance técnico del Sprint 3 se reduce a **estado de suscripción en `users` + gating de render + pantallas de pago**. Onboarding, scoring, pipeline de IA y guardado del reporte no se tocan.

Solo documentación. Actualizado: `wiki/decisiones/plan-lanzamiento-60-90-dias.md` (tabla de decisiones + alcance técnico + "Puntos cerrados con el usuario" reemplaza a "Pendiente de acotar"), `wiki/producto/pricing-y-gtm.md` (reglas de freemium y de suscripción + $99/mes), `wiki/experiencia/flujo-de-onboarding.md` (sección renombrada "Freemium NO recorta el onboarding"), `wiki/experiencia/reporte-de-resultado.md` (desbloqueo retroactivo + cancelación), `wiki/arquitectura/manejo-de-errores-y-reembolsos.md` (sección nueva "Cambio a suscripción — cancelación, sin reembolsos" + nota de obsolescencia), `wiki/decisiones/evolucion-del-producto.md` (#12 refinado). Sin páginas nuevas.

## [2026-09-28] query | Nuevo apartado de tareas: tablero y Sprint 3

El usuario pidió un apartado **solo de tareas**, separado del contexto y las reglas de negocio, para retomar el proyecto tras casi 4 semanas sin commits (último: 2026-09-02). Se mantienen las **fechas originales** del plan (decisión del usuario): Sprint 3 queda 🔴 sin empezar y Sprint 4 sin arrancar.

Páginas nuevas: `wiki/tareas/tablero.md` (estado por sprint, orden recomendado, tareas de Sprints 4-5, decisiones pendientes D-01 a D-05) y `wiki/tareas/sprint-3.md` (checklist S3-00 a S3-15 con criterio de "hecho" y rutas de código verificadas el 2026-09-28). Orden recomendado: suscripción + freemium → dominio Resend → monitoreo y analytics → landing y copy → PDF. Verificado en código: no hay herramienta de analytics ni de monitoreo instalada; «$99» de pago único sigue en 5 archivos de landing/ejemplo; la promesa de reembolso sigue en 4 archivos.

Actualizado: `index.md` (sección Tareas), `CLAUDE.md` (carpeta `tareas/` en la estructura y tipo `tareas` en el frontmatter).

## [2026-09-28] query | Sentry elegido para monitoreo; despliegue en Railway agregado al Sprint 3

El usuario eligió **Sentry** para el monitoreo de errores (S3-10). También confirmó que la app **no está desplegada** en ningún lado y que el destino es **Railway**, así que se agregó la tarea S3-16 (despliegue) como prerequisito de la beta. Riesgo anotado: la migración de `prisma/migrations/` está desincronizada con `schema.prisma` y hay que regenerarla antes de producción. Actualizado: `wiki/tareas/sprint-3.md` y `wiki/tareas/tablero.md`.

## [2026-09-28] query | Despliegue movido al Sprint 5

A pedido del usuario, el despliegue en Railway sale del Sprint 3 y queda como S5-00 en `wiki/tareas/tablero.md`: se despliega todo al final, después de las pruebas locales y las features. El criterio de "hecho" de S3-10 (Sentry) pasa a validarse en local.

## [2026-09-28] query | Despliegue movido al inicio del Sprint 4

El despliegue en Railway pasa de S5-00 a **S4-00**: es la primera tarea de la beta y se hace antes de invitar usuarios, después de probar todo en local. Actualizado: `wiki/tareas/tablero.md` y la referencia en `wiki/tareas/sprint-3.md`.

## [2026-09-29] query | Nueva categoría Competencia: análisis de ValaIdea

El usuario pidió investigar al competidor **ValaIdea** (https://www.valaidea.com/) y documentarlo como nueva categoría. Se revisó el sitio público el 2026-09-29 con WebFetch y `curl` (sin navegador): home, `/pricing`, `/help`, `/tools/idea-scorecard`, `/explore`, `/blog`, `/terms`, `/contact`, `sitemap.xml`. Todo lo registrado son afirmaciones de su sitio; lo que no aparece se marcó como *no encontrado en el sitio* (testimonios, número de usuarios, prensa, equipo).

Hallazgos clave: sprint de validación de 7 días por $29 USD pago único (hipótesis con IA → landing mínima → 15 comunidades sugeridas → señales de vistas/clics/registros → veredicto Proceed / Iterate / Kill con umbrales públicos y override justificado); scorecard gratuito sin registro de 4 dimensiones; solo inglés/USD; valida demanda, no viabilidad integral — complementario más que sustituto de Decida.

Páginas nuevas: `wiki/competencia/competencia.md` (hub) y `wiki/competencia/valaidea.md`. Actualizado: `CLAUDE.md` (carpeta `competencia/` en la estructura y tipo `competencia` en el frontmatter), `index.md` (sección Competencia), `wiki/overview.md` (fila en Mapa del producto). Candidato detectado sin revisar: Validea (validea.dev).

## [2026-09-29] query | Competencia: análisis de Validea (validea.dev)

A pedido del usuario se investigó **Validea** (https://validea.dev/), que estaba en "Candidatos por revisar". **El sitio no estaba accesible el 2026-09-29**: el dominio no resolvía (DNS `NXDOMAIN` desde el box y la Mac), WebFetch daba error 500 y no hay capturas en archive.org. La página se construyó solo con fragmentos del propio sitio indexados por el buscador (home y `/resources`), marcados como afirmaciones suyas de fecha incierta.

Hallazgos clave: genera sitios de validación Astro + Cloudflare con SEO programático, captura de email, fake-door pricing y encuesta post-registro; para indie hackers técnicos de SaaS; $9 / $29 / $79 USD al mes con prueba de 30 días (otra página suya dice $19 / $49 / $99 — inconsistencia anotada); se declara "early access"; no emite veredicto. Ideas nuevas para Decida: fake-door pricing y "dónde encontrar a quién probar" en el plan de validación, SEO de contenido en español por tipo de negocio, encuesta corta post-registro, canal B2B2C con consultores/incubadoras.

Página nueva: `wiki/competencia/validea.md`. Actualizado: `wiki/competencia/competencia.md` (Validea a la tabla, comparación ValaIdea vs Validea vs Decida, patrones, candidatos), `index.md` (sección Competencia). Candidato nuevo: **Validea en validea.co** (otro producto, reporte de IA con score; más parecido a Decida; respondía 503 el 2026-09-29). Pendiente: re-revisar validea.dev si vuelve a estar en línea.

## [2026-10-14] query | S3-07 Cancelar suscripción desde /cuenta

Se implementó la cancelación de suscripción en `/cuenta/perfil` (bloque «Suscripción» con estado en español, confirmación sin reembolso y enlace a `/analizar/pago` si no hay suscripción). Lógica pura en `src/lib/subscription/cancel.ts` (solo desde `active`, no toca `period_end`, idempotente) y server action `cancelSubscription`; el acceso sigue decidido por `hasFullAccess`. Probado a mano (active → cancelada con acceso hasta la fecha) y con tests Vitest; no probado el cruce real de la fecha de fin en el navegador.

Actualizado: `wiki/tareas/sprint-3.md` (S3-07 hecha), `wiki/tareas/tablero.md`, `wiki/arquitectura/manejo-de-errores-y-reembolsos.md`, `wiki/arquitectura/historial-de-evaluaciones.md`, `wiki/arquitectura/modelo-de-datos.md`.

## [2026-10-14] query | S3-09 Dominio propio en Resend: preparación

Se auditó el correo transaccional: solo se envían dos correos (código de registro y código de restablecer contraseña, `src/app/cuenta/actions.ts`). Sin `RESEND_API_KEY` se imprime en consola en desarrollo y se lanza error en producción. Hallazgos: si Resend rechaza el envío, `sendEmail` lanza error; en el registro (`signUp`) no se captura y el usuario ve el error genérico de Next.js, mientras que en recuperar contraseña se captura a propósito y el usuario ve el mensaje genérico. El default `onboarding@decida.app` no se cambió porque no hay fuente que confirme que `decida.app` es nuestro dominio.

Cambios de código: `src/lib/email/resend.ts` registra un mensaje claro cuando Resend rechaza el envío, y `.env.example` documenta `RESEND_FROM_EMAIL`. No se tocaron los flujos de auth.

Página nueva: `wiki/arquitectura/correo-transaccional-resend.md` (checklist para el usuario, cómo probar, errores típicos, nota para S4-00). Actualizado: `wiki/tareas/sprint-3.md` (S3-09 sigue sin marcar, con nota de preparación), `wiki/tareas/tablero.md`, `index.md`. Falta la acción manual: verificar el dominio en Resend y definir las variables.

## [2026-10-14] query | S3-06 Pantalla «Elige tu plan»

El paso de pago pasó de pago único simulado a freemium + suscripción $99 MXN/mes simulada. Lógica pura en `src/lib/subscription/activate.ts` (con tests) y `savePayment` ahora actualiza la suscripción de la cuenta en `users` y registra un `payments` simulado; nueva acción `continueFree`. Decisión sobre el bloqueo: `getResumeStep`/`canAccessStep` ya no exigen `isPaid`, así el onboarding continúa sin suscribirse y el corte queda solo en el reporte (`hasFullAccess`). Copy sin promesa de reembolso. No se probó el desbloqueo retroactivo en navegador; los e2e existentes ya fallaban por la contraseña de `contacto` (S3-08).

Actualizado: `wiki/tareas/sprint-3.md` (S3-06 hecha), `wiki/tareas/tablero.md`, `wiki/experiencia/flujo-de-onboarding.md`, `wiki/producto/pricing-y-gtm.md`, `wiki/arquitectura/modelo-de-datos.md`.

## [2026-10-14] query | S3-08 Pruebas del flujo completo

Se auditó la cobertura (74 tests) y se completaron los huecos: `ensureAssessmentForCurrentUser` con Prisma/cookies mockeados, ciclo de vida de la suscripción en el tiempo y la acción `cancelSubscription` (ahora 92 tests Vitest). Se repararon los tres specs e2e existentes (contraseña en `contacto`, `payment-free`, historial en `/cuenta`) y se agregó `e2e/subscription-flow.spec.ts` con el recorrido freemium → límite → suscripción → desbloqueo retroactivo → cancelación → vencimiento por SQL; 14/14 e2e en verde. Bug real hallado y corregido: `step="10"` en precio/costo de `products-form.tsx` bloqueaba valores que no fueran múltiplos de 10. El «Internal Server Error» de `/analizar/confirmacion` no se reprodujo; probable ruido del entorno (había un `next dev` huérfano colgado).

Actualizado: `wiki/tareas/sprint-3.md` (S3-08 hecha), `wiki/tareas/tablero.md`, `wiki/arquitectura/stack-tecnico.md`.

## [2026-10-14] query | Página de suscripción dentro de la cuenta

El usuario notó que «Suscribirme» en `/cuenta/perfil` llevaba a `/analizar/idea`, porque apuntaba al paso de pago del onboarding. Se creó `/cuenta/suscripcion` con el estado de la suscripción, la comparación de planes, suscribirse (simulado), cancelar y reactivar, y se redirigieron los enlaces (perfil, candados del reporte, límite de 1 evaluación). `payments` ahora puede pertenecer a una cuenta sin evaluación (`paym_user_id`, `paym_asmt_id` opcional). Actualizado: `wiki/tareas/sprint-3.md`.

## [2026-10-15] query | S3-12, S3-13 y validación de Sentry (S3-10)

Landing y copy alineados con freemium + suscripción: CTA «Analizar mi idea gratis», sección de precios con dos planes, sin promesa de reembolso (error de reporte, `/terminos`, `PRODUCT.md`); `docs/REFUND_PROCESS.md` marcado obsoleto. Sentry ya estaba instalado por el usuario; se validó la configuración y se conectó `logReportGenerationError` a Sentry. S3-10 sigue abierta hasta ver el evento en el panel. Actualizado: `wiki/tareas/sprint-3.md`.

## [2026-10-15] query | S3-10 cerrada

El usuario confirmó que el error de prueba llegó a Sentry. Se borraron `src/app/sentry-example-page` y `src/app/api/sentry-example-api`. Pendiente para producción: DSN a variable de entorno, bajar `tracesSampleRate` y `SENTRY_AUTH_TOKEN` en Railway.

## [2026-10-15] query | Sentry listo para producción

El DSN pasó de estar escrito en los 3 archivos de configuración a variables de entorno (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`) y las trazas bajan a 10% en producción. Pendiente en S4-00: cargar las variables y `SENTRY_AUTH_TOKEN` en Railway.

## [2026-10-15] query | S3-11: analytics con PostHog (código listo) y notas de despliegue

PostHog elegido por ser gratuito y traer embudos. Instalados posthog-js y posthog-node; 6 eventos conectados en landing, CTA, alta de cuenta, fin del onboarding, vista del reporte y clic en suscribirse. Falta la clave del proyecto para probarlo. Se actualizó `/privacidad`. A pedido del usuario, `wiki/tareas/tablero.md` (S4-00) ahora tiene el checklist de variables y pasos de Railway, incluida la nota del token de Sentry.

## [2026-10-15] query | PostHog: revisión del wizard

El wizard de PostHog agregó autocaptura, grabación de pantalla, correo y nombre como propiedades de persona, prompts de IA guardados, logs OpenTelemetry y un layout raíz dinámico. Se revirtió o apagó todo lo que contradecía `/privacidad` o degradaba la app, y se conservaron los eventos extra y la observabilidad de IA en modo privado. Detalle en `wiki/tareas/sprint-3.md` (S3-11). S3-11 sigue abierta hasta ver los eventos en PostHog.

## [2026-10-15] query | S3-11 cerrada

El usuario confirmó que llegan `report_viewed`, `identify` y los pageviews a PostHog y pidió dar la tarea por hecha; quedan por confirmar 5 eventos del embudo y se agregarán más eventos en una iteración posterior. Actualizado: `wiki/tareas/sprint-3.md`.

## [2026-10-16] query | S3-09 cerrada: dominio decida.mx verificado en Resend

El usuario verificó decida.mx en Resend. El remitente local seguía siendo `@resend.dev`; se cambió a `Decida <no-reply@decida.mx>` (`.env`, valor por defecto del código y `.env.example`). Falta probar el envío a un correo ajeno. Las direcciones de soporte `@decida.app` en las páginas legales quedan por decidir.

## [2026-10-16] query | Prueba de envío con decida.mx

Se envió un correo de prueba a una dirección externa y Resend lo aceptó. Las direcciones de soporte cambiaron a `hello@decida.mx`. Falta confirmar la recepción.

## [2026-10-16] query | Remitente de Resend: sin "no-reply"

Resend avisó que usar `no-reply` baja la confianza del buzón y puede afectar la entrega. El remitente pasó a `Decida <hello@decida.mx>` (`.env`, valor por defecto y `.env.example`). El correo de prueba a un dominio externo ya llegó a la bandeja. El buzón `hello@decida.mx` debe existir para recibir respuestas.

## [2026-10-16] query | Entrega confirmada con hello@decida.mx

El usuario creó el buzón `hello@decida.mx`, se reenvió la prueba y Resend la marcó como Delivered en una bandeja externa. Pendiente: prueba del código de registro real y repetirla en Railway.

## [2026-10-16] query | Migración de Prisma regenerada

La carpeta `prisma/migrations/` solo tenía una migración de junio con 7 de las 14 tablas. Se reemplazó por una migración base (`20261016000000_baseline`) generada desde `schema.prisma`, que ya incluye `user_stripe_customer_id`, `paym_user_id` y el unique de pagos para el cobro con Stripe. Se verificó en una base vacía temporal (ya borrada) sin diferencias contra el schema. Nuevo script `pnpm db:deploy`. Actualizado: `wiki/tareas/tablero.md` (S4-00).

## [2026-10-16] query | Pago real con Stripe

Se integró Stripe (Checkout alojado, webhook, cancelar/reactivar contra Stripe, Customer Portal) para la suscripción de $99 MXN/mes; sin `STRIPE_SECRET_KEY` sigue el modo simulado. Probado con Vitest y el e2e simulado; no se probó contra Stripe real (faltan claves). Nueva página `wiki/arquitectura/pagos-con-stripe.md`; actualizados sprint-3 (S3-16), tablero (S5-01, S4-00), stack-tecnico, pricing-y-gtm y modelo-de-datos.

## [2026-10-16] query | Correos de cobro

La app no mandaba ningún correo al suscribirse, cancelar ni fallar un cobro. Se agregaron tres correos desde `billing@decida.mx` (activación, cancelación, cobro fallido), solo en modo Stripe y sin duplicados; el recibo de cada pago lo manda Stripe. Actualizado: `wiki/arquitectura/pagos-con-stripe.md`, `sprint-3.md`, `tablero.md`.

## [2026-10-16] query | Correo de reactivación y aviso de Checkout

Corregido el aviso «Pago recibido» que reaparecía tras cancelar (los parámetros de Checkout se quedaban en la URL) y agregado el correo al reactivar una suscripción cancelada. Actualizado: `wiki/arquitectura/pagos-con-stripe.md`.

## [2026-10-16] query | Toasts en las acciones de suscripción

`shadcn add toast` ya no es el componente vigente (shadcn lo reemplazó por Sonner) y además instaló un paquete suelto `cn` que se quitó. Se instaló `sonner` con `shadcn add sonner` y se montó `<Toaster>` en el layout raíz. Las acciones de suscripción (suscribirse, reactivar, cancelar, portal de pagos) muestran toast de espera, éxito o error con `runActionWithToast` (`src/lib/ui/toast-action.ts`); el regreso de Stripe Checkout (éxito, cancelado, inválido) también avisa por toast. El aviso «pendiente» sigue en línea porque se actualiza solo.

## [2026-10-16] query | Prueba manual del onboarding con Claude in Chrome

Recorrido completo con una idea de viandas: el flujo funciona, pero el reporte tiene problemas de contenido de IA (riesgo 94 «Favorable» descrito como alto, perfil del emprendedor tomado como cliente, secciones genéricas, LaTeX en crudo, redundancias). Detalle en `wiki/tareas/prueba-onboarding-2026-10-16.md`. No se probó la vista recortada (la cuenta tenía suscripción).

## [2026-10-16] query | Calidad del reporte generado por IA (v1.2.0)

Se corrigieron los problemas de la prueba del onboarding. Hallazgo principal: el semáforo de «Nivel de riesgo» estaba invertido (el prompt de interpretación decía «score alto = menos riesgo» y el motor calcula alto = más riesgo), por lo que un 94 salía «Favorable». Los semáforos ahora salen de los puntajes (`enforceSignals`); la IA recibe la lectura de cada puntaje, los datos del emprendedor rotulados y sus respuestas de «tipo de trabajo»; se quitó LaTeX, encabezados repetidos y redundancias. Detalle en `wiki/framework/prompts-de-ia.md`.

## [2026-10-16] query | Detalles de interfaz del paso del plan

Se quitó el título duplicado «Elige tu plan» y la pestaña «Compromiso» pasó a «Plan». Verificado en el navegador. Actualizado: `wiki/tareas/prueba-onboarding-2026-10-16.md`.

## [2026-10-16] query | El plan se salta si ya hay suscripción

El paso del plan seguía apareciendo en el onboarding para cuentas suscritas. Ahora `confirmIdea`, `/analizar/pago` y el botón «Atrás» lo saltan cuando `hasFullAccess` es verdadero. Verificado en el navegador con una cuenta suscrita. Actualizado: `wiki/experiencia/flujo-de-onboarding.md`.

## [2026-10-16] query | Contador de pasos consistente para suscriptores

Quien salta el plan ve «Paso 3 de 8», «Paso 4 de 8»… sin saltos, con avance y minutos restantes recalculados y sin la pestaña «Plan». Verificado en el navegador. Actualizado: `wiki/experiencia/flujo-de-onboarding.md`.

## [2026-10-16] query | Retención, visión de plataforma y brecha hacia un plan de ejecución

El usuario planteó que Decida va más allá del análisis (ejecución, finanzas, comunidad) y pidió documentar el insight de retención: los números fríos sirven para diagnosticar pero la ejecución necesita seguimiento, recordatorios y logros. Revisado el código: el plan de validación de 4 semanas ya existe pero sin estado, recordatorios ni resultados. Creado: `wiki/producto/retencion-y-plan-de-ejecucion.md`. Actualizado: `wiki/decisiones/evolucion-del-producto.md` (entrada 13), `index.md`, `wiki/overview.md`.

## [2026-10-16] query | Auditoría de la landing

Revisión en Chrome (escritorio y móvil) y contra el código antes del despliegue: 5 puntos que bloquean (aviso de pago simulado, plan de 2 vs 4 semanas, imagen OG en SVG, 10–15 vs 20 minutos, logo con «M»), copy que no refleja el modelo nuevo y mejoras de UX writing. Detalle en `wiki/experiencia/auditoria-landing-2026-10-16.md`.

## [2026-10-16] query | Landing corregida antes del despliegue

Se aplicaron los 5 bloqueos de la auditoría (aviso de pago según el modo de Stripe, plan de cuatro semanas, imagen OG en PNG, «15 a 20 minutos», logo `branding/logo_light.svg`) y el UX writing (titular, CTA único, menú, FAQ ampliado, etiquetas gratis/suscripción). `/privacidad` ahora lista proveedores. Nuevos sitemap y robots. S3-15 cerrada. Detalle en `wiki/experiencia/auditoria-landing-2026-10-16.md`.

## [2026-10-16] query | Precios de la landing: sin aviso de pago y CTA de suscripción

Se quitó por completo el aviso de pago bajo las tarjetas de precio (y `isStripeTestMode`), y el texto «Te suscribes desde tu cuenta…» se reemplazó por el botón «Desbloquear el reporte completo». Actualizado: `wiki/experiencia/auditoria-landing-2026-10-16.md`.

## [2026-10-20] query | Etapa de investigación: Pasos 0 y 1 (en pausa)

Paso 0: `docs/report-pipeline-current.md` (PR 8). Paso 1: arnés de evals sin base de datos y 5 reportes de referencia; `docs/diagnostico.md` clasifica 45 secciones: falta de datos externos 14, falta de conexión 9, conclusión que no sigue de los números 4, genérico 18 (PR 9). Por la regla de parada del encargo no se avanzó al Paso 2: la falta de datos externos no es la mayoría. Decisiones del usuario: ramas y PR en GitHub, flag de PostHog más variable de entorno, tope de ~$0.30 USD por reporte en investigación, calibración de jueces con revisión del usuario después del Paso 3.

## [2026-10-21] decision | Modelo de créditos híbrido (en evaluación)

A partir del costo de la investigación web (~$0.25–0.40 USD por análisis) se documentó la opción de pasar de la suscripción de 99 MXN a créditos con suscripción híbrida y un interruptor de «Investigación de mercado» (1 vs 2 créditos). Sin decisión tomada. Detalle en `wiki/decisiones/modelo-de-creditos-hibrido.md`.

## [2026-10-22] decision | Créditos: precios y reglas cerradas

Se cerró el modelo: 1 crédito = $59 MXN, paquetes 1/3/10, análisis básico 0.5 y con investigación 1.5 créditos, sin caducidad, costo techo $0.30 USD por reporte con investigación, beta sin suscriptores (suscripción detrás de flag, fase 2 opcional). Se documentó la especificación en `wiki/decisiones/modelo-de-creditos-hibrido.md` y el prompt para Cursor en `wiki/decisiones/prompt-cursor-creditos.md`.

## [2026-10-27] lint | Auditoría de implementación del sistema de créditos (Fases 1 a 4) y sincronización del wiki

Se verificó el estado del código en `main` contra `wiki/decisiones/modelo-de-creditos-hibrido.md` y `wiki/decisiones/prompt-cursor-creditos.md`:
- **Las Fases 1 a 4 ya están implementadas y commiteadas en `main`** (`02fc586` Fase 1 libro mayor; `567c4a1` Fase 2 Stripe Checkout y `/cuenta/creditos`; `a6bb2dd` Fase 3 cobro al generar, interruptor de investigación, reembolsos y desbloqueo; `dba140f` Fase 4 landing, legales, `SUBSCRIPTIONS_ENABLED="false"` y eventos de PostHog).
- **Pruebas y tipos**: `npx tsc --noEmit` limpio y **40 archivos / 292 tests en verde** en Vitest.
- **Verificación en navegador**: landing (`/#precio`, `/#faq`) y `/terminos` muestran los paquetes de 1/3/10 créditos, la vista previa gratuita sin investigación y la política de reembolso en créditos. Hallazgo visual menor anotado: en la tarjeta de «1 crédito ($59 MXN)» de la landing aparece «1 créditos» y «O 0 con investigación (1.5 c/u)» (`Math.floor(100 / 150)`). Además, los specs E2E de Playwright (`e2e/subscription-flow.spec.ts` y `e2e/multi-idea-history.spec.ts`) aún esperan las rutas y textos del modelo de suscripción anterior.
- **Páginas actualizadas**: `wiki/decisiones/modelo-de-creditos-hibrido.md`, `wiki/decisiones/evolucion-del-producto.md` (#14), `wiki/producto/pricing-y-gtm.md`, `wiki/arquitectura/modelo-de-datos.md`, `wiki/arquitectura/pagos-con-stripe.md`, `wiki/arquitectura/manejo-de-errores-y-reembolsos.md`, `wiki/arquitectura/dashboard-de-cuenta.md`, `wiki/experiencia/reporte-de-resultado.md`, `wiki/experiencia/flujo-de-onboarding.md`, `wiki/overview.md` e `index.md`.

## [2026-10-28] decision | Créditos pasan a planes mensuales con reseteo

Se reestructuró el modelo: tres planes con nombre (Explora $59/200, Valida $149/600, Escala $399/2000 créditos), el saldo se restablece en cada renovación, análisis básico 50 y con investigación 150 créditos. Implementado en el repo reutilizando la suscripción de Stripe; el esquema de paquetes de pago único se eliminó. Especificación y pendientes en `wiki/decisiones/modelo-de-creditos-hibrido.md`.

## [2026-10-29] query | Variables de entorno documentadas

Se agregaron a `.env.example` las tres variables de modelos de investigación (`OPENAI_MODEL_RESEARCH`, `_OFFICIAL`, `_STRUCTURE`) y se documentaron todas las variables en el `README.md` y en `wiki/arquitectura/variables-de-entorno.md`. Se detectó que `o4-mini` fue dado de baja por OpenAI y el modelo de razonamiento por defecto pasó a `gpt-5-mini`; precios de OpenAI verificados.

## [2026-10-29] decision | Seguridad de la beta documentada y documento de vendors

Se documentó el paquete de protección de costos y seguridad previo a la beta: verificación de correo con código en pantalla aparte (contacto y registro), guarda de dueño verificado en pasos y acciones, tope de 5 intentos por código (migración `20261030000000_verification_attempts`), captcha Cloudflare Turnstile, login de cuenta sin verificar, barra de seguridad de contraseña, correo de bienvenida y logo en los correos. Páginas nuevas: `wiki/arquitectura/seguridad-y-proteccion-de-costos.md` y `wiki/arquitectura/vendors-y-costos.md` (Railway, OpenAI, Stripe, Resend, PostHog, Sentry y Turnstile con propósito y costo aproximado; precios revisados en las páginas de cada vendor). Se marcó como reemplazado el contacto «sin código» en `modulo-de-usuarios-y-autenticacion.md` y se agregó la entrada #15 a `evolucion-del-producto.md`. Pendientes: límite de gasto en OpenAI, límite por IP, alerta de Sentry por respaldo silencioso y costo del dominio.

## [2026-10-29] ingest | Hostinger agregado a vendors-y-costos

Se agregó Hostinger (dominio `decida.mx` y cuentas de correo de Decida): renovación anual de MX$816.99, vigente hasta octubre de 2030. Pendiente documentar el costo y la renovación de las cuentas de correo.

## [2026-10-29] ingest | Promedio de costo mensual de la infraestructura y correo de Hostinger

En `vendors-y-costos.md`: el correo de Hostinger está en capa gratuita con tope de 5 cuentas, y se agregó la sección «Costo mensual promedio de la infraestructura» (fijo ~US$14 a 24; promedio para planear la beta ~US$20 a 30 al mes, con tres escenarios de uso y supuesto de MX$18.5 por dólar).

## [2026-10-29] decision | Aviso a Sentry cuando la IA cae a un respaldo

El respaldo de la interpretación del puntaje (razonamiento) era mudo y el de `target_market` también; ahora todos los respaldos de la IA se reportan a Sentry con la etiqueta `ai_fallback`, agrupados por función y tipo de error. Documentado en `wiki/arquitectura/seguridad-y-proteccion-de-costos.md`. Pendiente: crear la regla de alerta en Sentry.

## [2026-10-29] ingest | Regla de alerta de Sentry para `ai_fallback`

Se creó en Sentry (org `atino`) la regla «La IA cayó a un respaldo (ai_fallback)», id `6261497`: correo cuando aparece una incidencia nueva o que reaparece con la etiqueta `ai_fallback`. Cierra el pendiente de [[wiki/arquitectura/seguridad-y-proteccion-de-costos]].

## [2026-10-29] decision | Facturación y CFDI fuera de la beta

El usuario decidió no facturar durante la beta (solo el recibo de Stripe). Se documentó como pendiente posterior: al formalizar la plataforma, captura de datos de facturación, emisión del CFDI y lo relacionado con el SAT. Página nueva `wiki/decisiones/facturacion-y-cfdi-despues-de-la-beta.md`; se agregó a `tareas/tablero.md`, `producto/pricing-y-gtm.md` y `arquitectura/vendors-y-costos.md`. La revisión legal de los términos sigue abierta aparte.

## [2026-10-29] decision | Rama dev, proyecto de Railway y primera migración en producción

Se creó la rama `dev` (trabajo diario); `main` queda como producción y es la que despliega Railway. En el proyecto `Decida MX` se creó el servicio `Postgres` y el servicio `decida-app` conectado al repo en `main`, con `DATABASE_URL` por referencia y `OPENAI_MODEL_REASONING=gpt-5-mini`. Las migraciones corren como comando de pre-despliegue (`pnpm db:deploy`); se aplicaron las 7 en producción. Documentado en `wiki/arquitectura/despliegue-en-railway.md`. Pendiente: el resto de las variables, dominio, y Stripe en modo real.

## [2026-10-29] decision | Eventos de analítica ampliados

Se agregaron a PostHog: `cta_clicked` con `location`, `onboarding_step_completed`, los eventos del registro (`signup_submitted`, `verification_code_sent`, `verification_failed`, `verification_resent`, `captcha_rejected`) y `report_generation_failed`. Los de visitantes sin cuenta usan el id anónimo de la cookie de PostHog. Documentado en `wiki/arquitectura/analitica-y-eventos.md`. Pendiente: crear los embudos en PostHog y verificar los eventos en vivo tras desplegar.

## [2026-10-29] decision | Primer merge de dev a main y hallazgo del despliegue automático

Se pasó `dev` a `main` (analítica ampliada y documentación) y se desplegó `9e53420` en Railway. Se descubrió que el servicio no tiene disparador de GitHub (la cuenta de Railway no tiene acceso al repo), así que los pushes a `main` no despliegan solos; se despliega a mano con `serviceInstanceDeployV2` y `commitSha`. Detalle y cómo activarlo en `wiki/arquitectura/despliegue-en-railway.md`.

## [2026-10-29] decision | Despliegue automático de Railway confirmado

Se conectó GitHub en Railway y se fijó la rama `main`; el merge del PR #20 a `main` disparó solo el despliegue `cf8b38ca`, que terminó bien. Se corrigió `wiki/arquitectura/despliegue-en-railway.md`, que decía que el despliegue automático no estaba activo.

## [2026-10-29] decision | SEO: sitemap, robots y metadatos

Sitemap con `lastModified` real y sin `changeFrequency`/`priority`; robots que bloquea todo fuera del dominio real; canónica, Open Graph y Twitter por página; JSON-LD de Organization y WebSite en la landing. Documentado en `wiki/arquitectura/seo-y-sitemap.md`. Pendiente: Google Search Console.


## [2026-10-30] plan | Nueva feature planeada: brief de marca

Se creó `wiki/producto/nuevas-features.md` como registro de funcionalidades por construir, con el plan del generador de brief de marca (7 secciones, datos que se reutilizan, flujo, propuesta técnica, preguntas abiertas). No se escribió código. Pendiente: que el usuario cierre el alcance.

## [2026-10-30] decision | Visión de plataforma y nueva feature planeada: finanzas personales

El usuario aclaró que Decida es una plataforma con varias herramientas al servicio de una comunidad de desarrollo personal con finanzas y planeación; el análisis de ideas es el foco actual y las herramientas son complemento. Por eso se rehízo el navbar público. En `wiki/producto/nuevas-features.md` se documentó la visión y la herramienta de finanzas personales (captura de gastos, deudas e ingresos; uso en análisis solo con consentimiento). Ambas, junto al brief de marca, quedan solo en el mapa. Pendiente: nombres y revisión legal. Ojo: el PRD aún no refleja el cambio de enfoque.

## [2026-10-30] decision | Nombre Cifra y metodología CDPE

La herramienta de finanzas personales se llama **Cifra** (descartado Alcanza). La plataforma se organiza en la secuencia Cifra, Decida, Planifica, Ejecuta (CDPE), todas bajo la marca Decida. Detalle y notas de diseño en `wiki/producto/nuevas-features.md`. Pendiente: dominio e IMPI de Cifra, nombre de Planifica y Ejecuta, reflejarlo en el PRD.

## [2026-10-30] plan | Narrativa «El orden Decida»

Se creó `wiki/marca/narrativa-del-orden-decida.md`: reencuadre de la metodología como camino con cuatro preguntas, opciones de nombre para la secuencia (recomendada «El orden Decida»), arco SCAR, formatos para redes y los cinco datos que faltan para volverla historia. Sirve para pulir el propósito de Decida (de evaluar ideas a recorrer un camino). Pendiente: elegir nombre, reunir evidencia, actualizar visión y PRD.

## [2026-10-30] impl | Cifra v1 en dev

Se construyó la primera versión de Cifra en la rama `dev` (no en `main`): saldos, deudas, gastos fijos con fechas, registro de ingresos y egresos, resumen del mes y «Marcar como pagado». Requiere plan activo; sin plan se conservan y se pueden borrar los datos. Nuevas tablas `cifra_*` (migración `20261101000000_cifra`), eventos de analítica sin montos y aviso en la política de privacidad. Documentado en `wiki/arquitectura/cifra-finanzas-personales.md`. Pendiente: revisión legal, uso en el análisis de ideas, exportar y borrado de cuenta.
