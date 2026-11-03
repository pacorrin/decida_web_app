# Resultados del plan ajustado — Paso C: investigación con búsqueda web

Fecha: **2026-10-21** · `REPORT_PROMPT_VERSION v1.4.0 → v1.5.0` · corrida `evals/after-c/` (mismos 5 casos, investigación activada con `--research`). Decisión de herramienta: `docs/decision-busqueda.md`.

## Qué hace
Antes de generar las secciones, `runResearch` (`src/lib/ai/research/`) investiga el mercado **objetivo** de la idea:
1. **Plan**: decide qué buscar entre 5 temas (tamaño de mercado, competidores, precios, costes, canales) dentro del presupuesto (`planWithinBudget`: máx. 5 búsquedas, ~$0.30 USD).
2. **Búsquedas en paralelo** con la herramienta `web_search` de OpenAI (Responses API), una llamada de herramienta por búsqueda, 40 s de timeout. Tamaño de mercado usa `gpt-4.1` con dominios oficiales por país (INEGI, etc.); el resto, `gpt-4.1-mini`.
3. **Fuentes F1, F2…** con URL limpia (sin `utm_source=openai`) y clasificadas (oficial / otra).
4. **Texto web = dato, no instrucción**: se eliminan patrones de inyección antes de estructurar.
5. **Ficha Zod** (cifras con fuente y año, competidores, huecos) y `enforceSources`: toda cifra sin fuente válida se descarta.
6. Las secciones citan `[F#]` tras cada dato de la ficha; la revisión recibe la ficha y marca contradicciones con lo declarado.

Mercado objetivo: no se ata al país del visitante. `saveIdea` lo infiere de la idea (`inferTargetMarket`), el usuario lo edita en la confirmación (`bide_target_market`), y si no hay señal se usa `REPORT_DEFAULT_MARKET_COUNTRY` (México) marcado como supuesto.

Disponibilidad: la decide el usuario en su evaluación; `REPORT_RESEARCH_ENABLED=false` es solo un apagado de emergencia (ya no se usa el flag `report-research` de PostHog). **Si falla, se degrada**: el reporte sale sin ficha (`arep_research.status = "failed"|"skipped"`), nunca se tumba. Se muestra en una sección «Fuentes y límites». Sin proveedor de respaldo (documentado; el punto de extensión es `generateWithWebSearch` / `runResearch`).

## Resultados (5 casos)
| Caso | Investigación | Revisión | Citas `[F#]` |
|---|---|---|---|
| 01 Cafetería | ok | reescribe (3 problemas) | 5 |
| 02 Plantillas | ok | reescribe (4) | 2 |
| 03 Curso | ok | reescribe (2) | 6 |
| 04 Vaga | ok | reescribe (3) | 15 |
| 05 Cassettes | ok | reescribe (3) | 2 |

- Costo estimado: **≈ $0.204 USD por reporte** (5 búsquedas), bajo el tope de $0.30. Es estimado con tarifas publicadas; el precio real de `web_search` queda por confirmar con la factura.
- Latencia: **50–73 s** (paso B: 33–40 s). La investigación corre antes de las secciones.
- Fuentes por reporte: 17–26; competidores identificados: 3–6.
- Huecos honestos: cuando no hay dato (p. ej. tamaño de mercado de cassettes en Querétaro) la ficha lo dice y el reporte no inventa cifra.

## Hallazgos
- **Citas**: al principio las secciones ignoraban las citas (0 `[F#]`). Se resolvió presentando la ficha como lista legible «DATOS CITABLES» con etiquetas, más regla y ejemplo en el prompt.
- **Variabilidad del modelo** al estructurar la ficha (números como texto, arreglos largos, ids «[F3]»): el esquema es tolerante y está probado.
- **05**: «Competencia baja» seguía como fortaleza aun con 6 tiendas reales en la ficha. Se agregó al revisor la regla de comparar lo declarado con la ficha; tras el ajuste la fortaleza se reescribió y desapareció.
- **03**: el mercado inferido fue «Estados Unidos» (la idea habla de ingenieros de Latinoamérica que buscan empleo en EE. UU.). Es una ambigüedad real; el campo es editable por la persona.
- Una corrida aislada mostró error JSON intermitente y una latencia de 145 s (no nuevo; ya degradaba con gracia).

## Pendiente / decisiones del usuario
- **04**: fortaleza determinista «inversión cabe en lo que puedes perder» con tolerancia «< $5,000» e inversión de $5,000 (`src/lib/scoring/strengths.ts`). Es scoring; el encargo prohíbe tocarlo.
- Ya no hace falta crear el flag `report-research` en PostHog.
- Aplicar la migración `20261020010000_report_research` (`bide_target_market`, `arep_research`).
- Confirmar el precio real de búsqueda web.
- Calibración de jueces LLM con 10 reportes revisados a mano → Paso 4.
