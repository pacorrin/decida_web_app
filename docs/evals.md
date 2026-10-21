# Evals del reporte (Paso 4)

Mide si los cambios al generador de reportes mejoran la calidad sin disparar costo ni latencia. Corre **sin base de datos**.

## Casos
`evals/cases/`: 15 casos inventados pero realistas.
- `baseline.ts` (5): cafetería CDMX, plantillas Notion, curso para ingenieros, idea vaga de comida, tienda de cassettes.
- `extended.ts` (10 nuevos): taller de bicicletas (Guadalajara), SaaS de facturas (México), food truck (Bogotá), ropa sostenible (Argentina), consultoría a pymes (Chile), turismo rural (Cusco), segunda sucursal de panadería (negocio existente), «una app para ayudar a las personas» (vaga), taquería en Houston, paraguas con ventilador (mala idea).
- Cubren México y otros 5 países, producto físico y digital, servicios, negocio existente, dos ideas con poca información y dos ideas malas.

## Comandos
| Comando | Qué hace |
|---|---|
| `pnpm evals [nombre] [--sin-investigacion]` | Corre los 15 casos (por defecto con investigación web), los califica con el juez y compara con el baseline. Guarda en `evals/<nombre>/`. Cuesta dinero: no va en CI. |
| `pnpm evals:run <nombre> [id] [--research]` | Solo genera los reportes. |
| `pnpm evals:judge <nombre> [id]` | Solo el juez LLM → `_juicio.json`. |
| `pnpm evals:compare <nombre>` | Tabla contra el baseline → `_comparacion.md`. |
| `pnpm evals:calibrate-sheet [nombre]` | Hoja para revisar 10 reportes a mano. |
| `pnpm evals:calibrate [nombre]` | Acuerdo entre juez y revisión a mano. |

`evals/baseline/` está **congelado** (5 casos, sin medidor de costo): no se regenera.

## Rúbrica (1–5 por criterio, `evals/lib/rubric.ts`)
1. **Cifras con fuente y fecha**: toda cifra externa lleva fuente y año, o es un supuesto explícito; sin estadísticas inventadas.
2. **Consistencia entre secciones**: sin contradicciones entre secciones ni con los puntajes.
3. **Conclusiones que siguen de los números**: sin saltos de lógica ni cálculos erróneos.
4. **Huecos declarados**: cuando falta información, el reporte lo dice.
5. **Mercado analizado = mercado objetivo**: el análisis corresponde al país/ciudad/audiencia de la idea.

Además hay chequeos automáticos en la comparación: citas `[F#]` válidas (las que no apuntan a una fuente existente deben ser 0), número de fuentes, estado de la investigación, acción de la revisión.

## Medición de costo
`src/lib/ai/usage-meter.ts` acumula tokens por modelo y llamadas de búsqueda **solo mientras los evals lo activan** (no hace nada en producción). El costo = tokens × tarifas de `MODEL_PRICES_USD_PER_M` + búsquedas × `REPORT_RESEARCH_SEARCH_FEE_USD` (0.03, conservadora). Las tarifas son aproximadas: verifícalas contra tu factura de OpenAI.

## Juez LLM y calibración
- El juez usa un modelo distinto al generador (`OPENAI_MODEL_JUDGE`, por defecto `gpt-4.1`), devuelve JSON validado con Zod, y cita evidencia literal por criterio.
- **Un juez sin calibrar no es una medida**: `pnpm evals:calibrate-sheet` genera `evals/calibration/hoja-de-calibracion.md` con 10 reportes (sin mostrar las notas del juez). Se llena `evals/calibration/humano.json` y `pnpm evals:calibrate` calcula por criterio acuerdo exacto, ±1, error medio, sesgo y correlación. Aceptación: ±1 en ≥80% de los casos y sesgo < 0.5. Si no se cumple, se ajusta el prompt del juez y se repite.
- Mientras `humano.json` esté vacío, las notas del juez son **indicativas**.

## Sin proveedor de búsqueda de respaldo (decisión)
Se usa solo la herramienta `web_search` de OpenAI (ver `docs/decision-busqueda.md`). **No hay proveedor de respaldo**: si falla, el reporte se genera sin investigación y lo dice en «Fuentes y límites»; el usuario puede reintentar manualmente. Punto de extensión: `generateWithWebSearch` (`src/lib/ai/openai.ts`) es la única función que habla con el proveedor y devuelve `{ text, sources, queries, searchCalls, usage }`; un segundo proveedor (por ejemplo Tavily o Brave Search) sería otra función con esa misma forma, elegida en `runResearch` (`src/lib/ai/research/run.ts`) detrás de una variable de entorno. No se construye hoy para no pagar por complejidad que no se ha necesitado.
