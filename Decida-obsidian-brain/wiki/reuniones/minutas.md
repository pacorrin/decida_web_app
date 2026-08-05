---
type: reuniones
tags: [decida, minutas, gap]
updated: 2026-08-05
---

# Minutas de reunión — estado

## No hay minutas de Decida en Notion todavía

Se buscó explícitamente en el workspace de Notion ("minuta reunión Decida", "Decida meeting notes weekly sync", y la base de datos "Minutas de reunión") el 2026-08-05. Los únicos resultados encontrados pertenecen a **otro proyecto**: "Pre15na" → "KRONOX DESARROLLO" → módulo de comisiones (páginas "Análisis de reuniones", generadas por un pipeline automático `meeting_pipeline.py` a partir de grabaciones Zoom). No tienen relación con Decida y **no se ingirieron** a este cerebro.

La herramienta `notion-query-meeting-notes` (base de datos nativa de minutas de Notion) tampoco está disponible en este workspace — requiere plan Business o superior.

## Qué significa esto para el cerebro
Todo el conocimiento de contexto/decisión de negocio en este cerebro viene de **dos fuentes**: la intención de producto documentada en Notion (páginas 00-17) y el estado real del código/commits. No hay una tercera fuente de "por qué se decidió X en una llamada" — varias preguntas abiertas en [[../decisiones/evolucion-del-producto]] quedarán sin resolver hasta que existan minutas reales.

## Cómo ingerir minutas cuando existan
Cuando el usuario cree o comparta minutas de Decida (en Notion, en texto plano, o grabaciones), seguir el protocolo de ingesta de `../CLAUDE.md`:
1. Guardar el contenido crudo en `raw/notion/minutas/YYYY-MM-DD-titulo.md` (o `raw/otros/` si no viene de Notion) con frontmatter (`source`, `fecha`, `asistentes` si se conocen).
2. Extraer decisiones, preguntas resueltas, y nuevos compromisos.
3. Actualizar las páginas wiki afectadas — especialmente las preguntas abiertas marcadas en [[../decisiones/evolucion-del-producto]] y en [[../overview#Gaps de conocimiento activos]].
4. Crear (si aplica) `wiki/reuniones/YYYY-MM-DD-titulo.md` con el resumen de esa reunión específica, enlazando de vuelta a esta página índice.
5. Registrar el ingest en `../log.md`.

## Preguntas que las próximas minutas deberían poder responder
- ¿Por qué se reordenó el flujo de onboarding (idea/confirmación antes del pago)? Ver [[../decisiones/evolucion-del-producto#1]].
- ¿Por qué se removieron las preguntas de capital y pérdida aceptable? Ver [[../decisiones/evolucion-del-producto#2]].
- ¿El historial de evaluaciones respondió a feedback real o fue anticipado? Ver [[../arquitectura/historial-de-evaluaciones]].
- ¿Hay ya clientes pagados reales, o el pago simulado sigue siendo la única señal de validación? Ver [[../producto/pricing-y-gtm]].
- ¿Cuál es el estado real del trabajo de landing en curso (componentes modificados sin commitear al momento de esta ingesta)? Ver [[../experiencia/landing-y-copy]].

## Ver también
[[../overview]] · [[../decisiones/evolucion-del-producto]] · `../CLAUDE.md`
