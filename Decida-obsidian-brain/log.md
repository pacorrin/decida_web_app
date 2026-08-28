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
