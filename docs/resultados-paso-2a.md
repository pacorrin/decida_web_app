# Resultados del plan ajustado — Paso A: contexto y claridad de la idea

Fecha: **2026-10-20** · `REPORT_PROMPT_VERSION v1.2.0 → v1.3.0` · corrida `evals/after-a/` frente a `evals/baseline/` (mismos 5 casos, mismo modelo).

## Qué cambió
1. **Datos que se capturaban y no llegaban al reporte** ahora entran a los prompts (`src/lib/ai/report-context.ts`): nivel de competencia, canal para conseguir clientes, evidencia de clientes, mayor preocupación, condición de éxito, inversión y costos fijos, y las palabras originales de la persona (además del resumen de la IA, que se marca como «lectura confirmada, no dato verificado»).
2. **Detección de ideas vagas** (`src/lib/ai/idea-clarity.ts`): mide la descripción **de la persona** (no el resumen de la IA, que siempre sale completo e incluso inventa). Niveles `clara | parcial | vaga` y qué falta saber (a quién, dónde, cómo gana dinero). Es una heurística simple y explicable, con tests; es un piso, no un clasificador.
   - El reporte la usa: si la idea no es clara, el resumen y la recomendación lo reconocen, y entra como riesgo.
   - El onboarding la usa: el paso «Así entendimos tu idea» muestra un aviso con lo que falta antes de generar el reporte.
3. **Reglas de contenido** en los prompts: no inventar lo que falta; distinguir tarea única de tarea recurrente; si un producto se vende con pérdida, decir que ningún volumen lo salva; las «brechas personales» no pueden ser la viabilidad comercial ni el riesgo; no listar como fortaleza lo que otra parte de los datos contradice.

## Antes y después (lectura, mismos 5 casos)

| Debilidad del baseline | Después |
|---|---|
| 01: la competencia alta declarada no aparecía en los riesgos | Aparece como primer riesgo; también la renta (su preocupación) y que no dijo a quién le vende |
| 03: la preocupación por no tener marca se ignoraba | Aparece como riesgo, con acciones (testimonios, prueba gratuita) |
| 02 (C): «60–90 h al mes de producción» (confundía unidades vendidas con plantillas creadas) | Separa tareas únicas (~10 h) de recurrentes (3–4 h por semana) |
| 05 (C): «vende 30 cassettes para no perder» | «Ningún volumen de ventas podrá hacer que este producto sea rentable» |
| 04: nunca declaraba que la idea es vaga | El resumen empieza diciendo que está poco definida; aparece el riesgo «Idea poco definida» con lo que falta |

## Lo que NO se arregla con esto (queda para la pasada de revisión y la investigación)
- **04**: la fortaleza «tu inversión de $5,000 cabe en lo que puedes perder» sigue contradiciendo la alerta de que podría superar la tolerancia (caso borde: tolerancia «menos de $5,000» e inversión exactamente $5,000); además hay dos fortalezas casi idénticas. Es exactamente lo que debe cazar la pasada de revisión.
- **05**: «Competencia baja» se lista como fortaleza porque la persona lo declaró, aunque el nicho (cassettes nuevos) casi no tiene demanda: solo datos externos lo corrigen. Y «tienes 10 a 20 horas por semana» se presenta como fortaleza para una tienda física que exige horario completo.
- Sigue sin haber **ninguna cifra, competidor ni precio de referencia externos** (categoría A).

## Verificación
`tsc` limpio; 194 tests de Vitest; corrida de evals de los 5 casos sin fallos (15–18 s por reporte, 9 llamadas + 1 de interpretación).
