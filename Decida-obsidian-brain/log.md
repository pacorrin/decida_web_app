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
