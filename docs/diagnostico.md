# Diagnóstico de los reportes de referencia

Paso 1 de la tarea «etapa de investigación + revisión de consistencia». Fecha: **2026-10-20**, pipeline `REPORT_PROMPT_VERSION = v1.2.0`, modelo narrativo `gpt-4o-mini`.

## Cómo se hizo

- 5 casos de `evals/cases/baseline.ts`: negocio local en México (cafetería en Roma Norte), producto digital (plantillas de Notion), audiencia internacional (curso para ingenieros latinoamericanos que buscan trabajo en EE. UU.), poca información («algo con comida para llevar») e idea claramente mala (tienda de cassettes con precio bajo el costo).
- Corridos con `pnpm evals:baseline` (sin base de datos; PostHog y Stripe apagados). Resultados en `evals/baseline/*.json` y `*.md`. Latencia de 11 a 15 s por reporte.
- Los 5 resúmenes de idea salieron de la IA. **Observación de fiabilidad:** en la primera corrida el caso 04 (idea de una línea) falló la validación Zod del resumen (la IA devolvió una categoría de supuesto fuera del esquema). Al repetirlo funcionó. En producción `saveIdea` cae al resumen de respaldo en ese caso, así que con ideas vagas el resumen es intermitente.
- **Una sola persona clasificó** (yo, leyendo los 45 textos). Es una lectura, no una medición: en el Paso 4 se contrasta con un juez LLM y con tu revisión.

## Categorías

- **A. Falta de datos externos**: la sección necesita datos del mundo (mercado, competidores, precios, costos, regulación) y los afirma sin fuente o los omite.
- **B. Falta de conexión**: ignora datos que la persona sí dio o contradice a otra sección.
- **C. Conclusión que no se sigue de los números.**
- **D. Genérico o sin fuentes**: texto que valdría para casi cualquier idea del giro.

## Tabla: debilidad principal por sección

| Sección | 01 Cafetería | 02 Notion | 03 Curso | 04 Vaga | 05 Cassettes |
|---|---|---|---|---|---|
| Resumen ejecutivo | A | A | A | D | A |
| Entendimiento del negocio | A | D | A | D | A |
| Análisis financiero | A | A | A | C | C |
| Compatibilidad personal | B | B | B | B | C |
| Tiempo y operación | D | C | D | D | D |
| Escalabilidad | D | D | D | D | D |
| Fortalezas y riesgos | B | A | B | B | B |
| Plan de validación | A | A | A | D | D |
| Recomendación final | D | D | D | D | D |

**Conteo (45 secciones): A = 14 · B = 9 · C = 4 · D = 18.**

## Por qué cada una (ejemplos citables)

**A: datos externos**
- 02: «Mercado saturado de plantillas gratuitas» se afirma como hecho en riesgos y resumen; sale de la preocupación de la persona, sin una sola fuente.
- 05: «los cassettes han tenido un resurgimiento en popularidad entre los coleccionistas» se presenta como supuesto pero se usa como argumento, sin dato.
- 03: el precio de $4,500 MXN (≈ 250 USD) no se contrasta con ningún curso comparable; no se menciona la demanda real de ingenieros latinoamericanos en empresas de EE. UU.
- 01: no hay renta ni costos típicos de Roma Norte, ni cuántas cafeterías de especialidad hay; el margen de 69 % del café no se compara con el del giro.
- Ningún reporte nombra un solo competidor, precio de referencia ni cifra de mercado.

**B: falta de conexión**
- 01: la persona declaró **competencia alta** y es la mayor amenaza para una cafetería en Roma Norte; no aparece en los riesgos.
- 03: su mayor preocupación («no tengo una marca conocida») no se aborda; los riesgos hablan de «una plataforma externa» sin nombrarla.
- 04: la fortaleza «tu inversión de $5,000 cabe en lo que puedes perder» **contradice** la alerta y la recomendación final («podría superar tu tolerancia máxima»). Es una contradicción entre secciones, una de las que la pasada de revisión del Paso 3 debe cazar.
- «Compatibilidad personal» (4 de 5 reportes) usa la viabilidad comercial y el nivel de riesgo como «brechas personales», que no lo son.

**C: conclusión que no sigue de los números**
- 05: «necesitas vender al menos 30 cassettes al mes solo para no perder dinero». Con precio 120 y costo 150 **no existe** volumen que no pierda dinero.
- 02: «60–90 horas al mes solo en producción» (2–3 h por plantilla × 30 ventas): confunde unidades vendidas con plantillas producidas; el tiempo calculado excede la disponibilidad de 5–10 h/semana sin que se saque esa conclusión.
- 04: dice a la vez «utilidad neta de 0» y «margen de ganancia mensual de 3000».
- 05: «disfrutas vender» como encaje, pese a comodidad vendiendo 2/5.

**D: genérico**
- «Tiempo y operación» y «Escalabilidad» salen casi iguales en los 5 casos: producción, atención, compras; sistema de pedidos en línea, redes sociales, contratar a 1–2 personas.
- «Recomendación final» repite el resumen ejecutivo con otras palabras.
- 04 (idea de una línea): el reporte inventa («práctica y deliciosa») y **nunca declara que la idea es demasiado vaga** ni qué falta saber (ciudad, tipo de comida, cliente).

## Lectura global

1. **La premisa se sostiene a medias.** «Falta de datos externos» (A) es la mayor causa solo entre las secciones que hablan del mercado (resumen, entendimiento, financiero, plan: 12 de 20). En conjunto (14 de 45) **no es la mayoría**: la categoría más grande es **D, genérico (18)**, y hay un bloque relevante de **B + C (13)** que **no se resuelve con búsqueda web**.
2. **Parte de B es un problema de contexto, no de datos externos**: varios datos que la persona sí dio **no llegan** a las secciones (competencia, canal, evidencia de clientes, preocupación principal, costos fijos; ver `docs/report-pipeline-current.md` §6). Eso se arregla pasando esos campos a los prompts, sin investigación.
3. **D («Tiempo y operación», «Escalabilidad», «Recomendación final») también mejora con una ficha de mercado** (da con qué especificar el giro), pero antes mejora con mejores prompts y con que las secciones se vean entre sí.
4. **Los errores C** (5 casos de lógica) los atrapa mejor una pasada de revisión que la búsqueda.
5. **Caso 04**: el fallo más serio es no reconocer la falta de información; ni la búsqueda ni la revisión lo resuelven por sí solas: hace falta un paso explícito de «¿qué tan evaluable es esta idea?».

## Regla de parada del encargo

> Si la mayoría de los fallos son de un tipo distinto a «falta de datos externos», detente y dímelo antes de seguir con el paso 2.

Con esta clasificación **A = 14 de 45 (31 %)**: no es la mayoría. **Se detiene aquí** y se reporta antes del Paso 2. Ver el resumen en el PR del Paso 1.
