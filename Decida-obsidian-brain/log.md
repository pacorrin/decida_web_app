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
