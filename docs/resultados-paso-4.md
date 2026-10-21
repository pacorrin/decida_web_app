# Resultados del Paso 4 — evals (15 casos)

Fecha: **2026-10-21** · corrida `evals/actual/` (investigación web activada, revisión activada, `v1.5.0`) frente a `evals/baseline/` (5 casos congelados). Cómo se usa: `docs/evals.md`.

## Resumen (mismos 5 casos de referencia)
| Métrica | Baseline | Actual |
|---|---|---|
| Latencia media | 14.8 s | 62 s |
| Costo medido por reporte | n/d | **$0.238 USD** (todos los casos: $0.242; máx. $0.268) |
| Búsquedas web por reporte | 0 | 5 |
| Citas `[F#]` válidas por reporte | 0 | 5.2 (todos: 5.8) |
| Citas inválidas (a fuentes inexistentes) | — | **0** de 15 reportes |
| Juez · cifras con fuente y fecha | 1.0 | 4.0 (todos: 4.1) |
| Juez · consistencia | 5.0 | 5.0 |
| Juez · conclusiones siguen de los números | 5.0 | 5.0 |
| Juez · huecos declarados | 4.6 | 5.0 |
| Juez · mercado analizado = objetivo | 4.6 | 5.0 |

Costo ≈ búsqueda (5 × $0.03 de tarifa conservadora = $0.15) + tokens (~$0.09). El tope de $0.30 se respetó en los 15 casos.

## Lo que mejoró
- **Cifras con fuente**: el baseline no citaba nada (juez: 1) y las secciones afirmaban cifras de mercado sin respaldo; ahora hay 17–31 fuentes por reporte y citas válidas.
- **Mercado objetivo**: el baseline daba 3 en plantillas Notion y cafetería (mercado implícito); ahora se declara y se edita.

## Lo que no mejoró o cuesta
- **Latencia ×4** (≈ 62 s; 71 s en promedio de los 15). La investigación va antes de las secciones. Habría que mostrar progreso en el onboarding y/o paralelizar mejor.
- **Citas desiguales**: 05 (cassettes) y 06 (taller de bicicletas) tienen **0 citas** aunque la ficha trae fuentes: el juez les da 1 en cifras. Las secciones a veces ignoran la ficha. Es el principal pendiente de calidad.
- **Fallos degradados** (el reporte salió, con una parte menos): en 06, `validation_plan` devolvió JSON inválido (latencia 177 s por el reintento); en 09, la revisión falló y se entregó sin revisar. 2 de 15 casos (13%).
- **Revisión muy activa**: reescribe en 12 de 15 casos; solo 06 y 07 quedaron sin cambios.
- **Cifras de 03, 07, 10, 11, 13** (juez 4): usan cifras con fuente pero alguna sin fecha o sin cita.

## Advertencia sobre el juez
**El juez aún no está calibrado.** Da 5 en consistencia y conclusiones en casi todo, incluidos casos que tenían contradicciones conocidas (04, 05 en el baseline), lo que sugiere que es benévolo en esos dos criterios. Solo el criterio de cifras discrimina bien, en parte porque se le dio un conteo mecánico de citas. Hasta tener la revisión a mano, **sus notas son indicativas**: no usar para decidir.

Primera versión del juez: 5 en todo, incluso para reportes sin citas. Se endureció con el conteo mecánico de citas y la regla de que un 5 exige evidencia concreta.

## Calibración (pendiente de ti)
1. Lee `evals/calibration/hoja-de-calibracion.md` (10 reportes: 01, 03, 04, 05, 06, 08, 10, 12, 13, 15; no muestra las notas del juez).
2. Califica de 1 a 5 cada criterio en `evals/calibration/humano.json`.
3. Corre `pnpm evals:calibrate actual`. Aceptación: ±1 en ≥80% y sesgo < 0.5 por criterio; si no, se ajusta el prompt del juez.

## Pendientes derivados
- Hacer que las secciones citen siempre que haya ficha (05 y 06).
- Reducir la latencia o mostrar progreso.
- Decidir si la revisión debe reescribir menos.
- Decisión abierta del Paso 3 (fortaleza determinista en `strengths.ts`) sigue en tus manos.
