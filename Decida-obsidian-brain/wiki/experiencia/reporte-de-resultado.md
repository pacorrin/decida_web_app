---
type: experiencia
tags: [decida, reporte, output]
updated: 2026-08-05
---

# Reporte de resultado

Fuente: [[../../raw/notion/11-report-template]] · [[../../raw/notion/13-ux-wireframes]]

## Por qué importa tanto
El reporte es **el producto tangible** que el usuario recibe — la mini-consultoría prometida. Objetivo emocional: *"Esto me hizo ver cosas que no había considerado."* La sección más valiosa, según el diseño original, es **"Riesgos y próximos pasos"** — ahí es donde el usuario percibe más valor.

## Estructura completa (13 secciones, Notion)
1. Cover/Header — producto, fecha, idea evaluada, objetivo, disclaimer corto.
2. Executive Summary — diagnóstico general, fortaleza principal, riesgo principal, recomendación final.
3. Viability Snapshot — semáforos por las [[../framework/dimensiones-de-viabilidad|6 dimensiones]].
4. Business Idea Understanding — resumen, cliente objetivo, problema, supuestos detectados.
5. Financial Snapshot — inversión, precio, costo, margen, break-even, payback. Si faltan datos, decirlo explícitamente (no rellenar con supuestos silenciosos).
6. Strengths — con explicación de por qué importa cada una.
7. Risks and Blind Spots — riesgo + por qué importa + cómo validarlo/reducirlo. **Sección más importante.**
8. Personal Fit Analysis.
9. Time and Operation Analysis.
10. Scalability View.
11. Validation Plan — 4 semanas de acciones concretas.
12. Final Recommendation — una de las 4 etiquetas de [[../framework/scoring-engine#Recommendation Logic]].
13. Suggested Next Product CTA — upsell a Plan Pro, sin agresividad.

## Regla de UX crítica de resultados
No empezar con un score numérico global — puede simplificar demasiado y distraer. En su lugar: card superior con recomendación + diagnóstico de 3 líneas, luego snapshot de viabilidad, fortaleza principal, riesgo principal, y CTA a reporte completo.

## Reglas de calidad del reporte
Cada riesgo debe tener una acción sugerida · cada recomendación debe conectarse a una respuesta real del usuario · no inventar datos de mercado · no afirmar rentabilidad garantizada · no sugerir dejar el empleo · no saturar con texto.

## Tono
Profesional · directo · honesto · sin promesas · sin lenguaje de gurú · cercano pero serio. Ver también [[../marca/sistema-de-diseno#Named Rules]] — "The Grounded Result Rule": los resultados deben leerse como juicio fundamentado, no como motivación vacía.

## Estado en producción
- Existe un reporte de ejemplo público en `/ejemplo` (preview antes de pagar) — mencionado en `PRODUCT.md` como evidencia real disponible.
- Existe una vista `/analizar/resultado` que maneja tres estados: reporte generado, en progreso (auto-refresh cada 5s), y **fallido** (con opción de reintentar y garantía de reembolso) — ver [[../arquitectura/manejo-de-errores-y-reembolsos]]. Este manejo de estados de error no estaba en el diseño original de Notion; es una capa añadida después.
- Un commit posterior (`Expand result report to match example report`, `Update result page layout for wider TOC display`) expandió la página de resultado real para igualar al reporte de ejemplo — señal de que el ejemplo se usó como referencia de calidad a alcanzar.
- Renderizado en markdown para las respuestas de IA en el reporte (ver [[../framework/prompts-de-ia#Markdown]]).

## Ver también
[[../framework/scoring-engine]] · [[../framework/prompts-de-ia]] · [[../arquitectura/manejo-de-errores-y-reembolsos]]
