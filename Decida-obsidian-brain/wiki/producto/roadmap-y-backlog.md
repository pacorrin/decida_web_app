---
type: product
tags: [decida, roadmap, backlog]
updated: 2026-08-05
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

## Ver también
[[prd]] · [[pricing-y-gtm]] · [[../decisiones/evolucion-del-producto]]
