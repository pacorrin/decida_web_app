---
type: product
tags: [decida, roadmap, backlog]
updated: 2026-09-07
---

# Roadmap y Backlog

Fuentes: [[../../raw/notion/02-mvp-plan-30-45-dias]] · [[../../raw/notion/09-product-backlog]] · `git log` del repo.

## Plan original de 30-45 días (Notion, jun 2026)
6 semanas, ~18h/semana:
- **Semana 1** — framework y definición de producto (dimensiones, question bank, scoring rules, report template, AI prompt V1).
- **Semana 2** — web flow (landing, onboarding multi-step, scoring básico, resultado).
- **Semana 3** — IA y reporte (modelo IA, prompts, plantilla de reporte, PDF).
- **Semana 4** — pago y preparación de lanzamiento (Stripe/Mercado Pago, precio, success page, aviso de privacidad).
- **Semana 5-6** — validación e iteración (primeros 10 clientes, feedback, ajuste de prompts y pricing).

## Backlog original (Notion) por horizonte
- **Now (MVP crítico)**: landing, CTA con precio, onboarding multi-step, captura de idea, confirmación IA, scoring engine V1, semáforos, diagnóstico IA, resultado, PDF, pago, analytics básico.
- **Next (V1.1)**: email del reporte, mejor PDF, simulador financiero detallado, guardar link de assessment, feedback post-resultado, testimonios, mejores prompts, vista admin.
- **Later (Pro Plan)**: simulador de escenarios, plan de validación de 30 días, comparar 2-3 ideas, checklist de investigación de mercado, calculadoras de precio/break-even.
- **Future SaaS**: cuentas de usuario, historial, portafolio de ideas, asesor IA, benchmarks, comunidad.
- **Explícitamente fuera de alcance**: app móvil, marketplace, curso, recomendaciones públicas, chat IA complejo, generador de plan de negocio/pitch deck, asesoría legal/fiscal.

## Línea de tiempo real (reconstruida de `git log`, orden cronológico ascendente)

1. `Initial commit from Create Next App`
2. Prisma + PostgreSQL setup.
3. **MVP assessment entities** con esquema snake_case prefijado (`asmt_`, `aprf_`, etc.) — decisión de ir con el modelo relacional completo, no JSON simple. Ver [[../arquitectura/modelo-de-datos]].
4. Dependencias/tema visual, dark mode, UI components.
5. Integración OpenAI + campos opcionales de assessment.
6. **DEC-?**: manejo de errores para fallas de generación de reporte (comprehensive error handling) + docs de refund process y flow diagrams. Ver [[../arquitectura/manejo-de-errores-y-reembolsos]].
7. **DEC-17**: renderizado markdown en respuestas de IA + prompts actualizados para usar markdown.
8. Mejora de visualización de onboarding.
9. Expansión de la página de resultado para igualar el reporte de ejemplo.
10. **Loading state** durante generación del reporte.
11. **DEC-11**: encuesta de feedback post-reporte.
12. Integración de Playwright para pruebas end-to-end.
13. Páginas legales: privacidad, términos, aceptación de contacto.
14. `feat: add embla-carousel-react` — carrusel para landing.
15. **Refactor del flujo de onboarding y manejo de formularios** (reordenamiento de pasos — ver [[../experiencia/flujo-de-onboarding]]).
16. **Remoción de capital y rango de pérdida del proceso de onboarding** — ver [[../decisiones/evolucion-del-producto#Capital/pérdida removidos]].
17. Mejora de landing page con nuevas secciones y animaciones (trabajo en curso al momento de este cerebro — ver `git status`, varios componentes de landing modificados sin commitear cuando se hizo esta ingesta).

## Lectura: qué se adelantó vs el plan original
El plan de Notion preveía launch de un MVP mínimo en 4 semanas y luego iterar. En la práctica, el equipo ya construyó **antes de validar con clientes reales**:
- Manejo robusto de errores + reintentos + logging (normalmente un ítem de "Next" o posterior).
- Historial de evaluaciones con verificación por email (estaba en "Future SaaS", explícitamente fuera de alcance V1).
- Encuesta de feedback post-reporte, testing E2E con Playwright, páginas legales completas.
- Refactors de UX del onboarding y remoción de preguntas (señal de iteración basada en algo — feedback real o juicio de producto; no hay fuente que documente el "por qué" de estos cambios).

Esto es exactamente el riesgo que el propio PRD (ver [[prd#Riesgo estratégico]]) advertía evitar: *"construir demasiada funcionalidad antes de confirmar que la gente paga."* No es necesariamente un error — pero es una señal para verificar en la próxima conversación con el usuario si ya hay evidencia de pago real que justifique este alcance.

## Ideas nuevas del usuario — pendientes de alcance (2026-09-02)

Dos mejoras planteadas por el usuario tras cerrar Sprint 2. Ambas abren un **segundo momento de iteración asistida por IA** sobre puntos donde hoy el producto es de una sola pasada. Registro y preguntas abiertas en [[../decisiones/plan-lanzamiento-60-90-dias#Mejoras de producto pedidas el 2026-09-02 (pendientes de alcance)]].

1. **Pulir la idea — 2ª iteración** en el paso «Así entendimos tu idea». El commit `0259101` arregló el bug de transcripción; esto es mejora de fondo de `refineIdea`. Falta que el usuario liste qué se siente pobre hoy. Fase gratis, no toca scoring.
2. **Chat de mejora sobre la página de resultado.** Post-flujo: el usuario conversa con la IA sobre el reporte para identificar los puntos que no especificó (o decidió no especificar) y ver reflejado por qué importan — versión conversacional de la sección "Risks and Blind Spots". ⚠️ Reabre "chat IA complejo", que el backlog de Notion pone **explícitamente fuera de alcance** del MVP (ver arriba en esta página y [[../decisiones/evolucion-del-producto#11. Chat de iteración sobre el reporte — reabre un "fuera de alcance" de Notion (2026-09-02)]]). Costo de API recurrente → candidato a plan de pago y/o a post-beta.

## Cambio de modelo de negocio (2026-09-07)

El usuario definió el modelo de cobro: **suscripción + freemium** ($99 el nivel más barato, resto pendiente). El "Now" del backlog original —"CTA con precio", "pago"— asumía **pago único**; ahora el pago es una suscripción y hay un nivel gratuito con captura reducida y reporte recortado como embudo. Las pantallas de pago y el gating entran al Sprint 3; el cobro recurrente real sigue en el Sprint 5. Ver [[pricing-y-gtm#Modelo de cobro decidido (2026-09-07)]] · [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]] · [[../decisiones/evolucion-del-producto#12. De pago único a suscripción + freemium (2026-09-07)]].

## Ver también
[[prd]] · [[pricing-y-gtm]] · [[../decisiones/evolucion-del-producto]]
