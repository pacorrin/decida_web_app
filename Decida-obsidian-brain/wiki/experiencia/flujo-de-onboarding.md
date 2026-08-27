---
type: experiencia
tags: [decida, onboarding, ux]
updated: 2026-08-26
---

# Flujo de onboarding — diseño vs implementado

Fuentes: [[../../raw/notion/03-onboarding-user-flow]] · [[../../raw/notion/13-ux-wireframes]] · `src/lib/onboarding/steps.ts`

## Flujo diseñado originalmente (Notion, 12 pasos)
Landing → CTA → **pago o acceso inicial** → perfil personal → recursos → perfil de trabajo → descripción de idea → **confirmación IA de la idea** → evaluación guiada → resultado → reporte/PDF → upsell.

En este diseño, el pago ocurre **antes** de que el usuario invierta esfuerzo describiendo su idea — para validar pago real cuanto antes.

## Flujo implementado (código, `ONBOARDING_STEPS` en `src/lib/onboarding/steps.ts`)

| # | Paso (slug) | Fase | Min. est. |
|---|---|---|---|
| 1 | `contacto` | gratis | 1 |
| 2 | `idea` | gratis | 2 |
| 3 | `confirmacion` | gratis | 1 |
| 4 | `pago` | pago | 1 |
| 5 | `perfil` | diagnostico | 6 |
| 6 | `ajuste` | diagnostico | 3 |
| 7 | `evaluacion` | diagnostico | 5 |
| 8 | `resultado` | diagnostico | 0 |

Tres fases explícitas: **`gratis`** (contacto, idea, confirmación) → **`pago`** (compromiso) → **`diagnostico`** (perfil, ajuste, evaluación, resultado).

## La diferencia clave
En el código, **la idea se captura y se confirma con IA antes del pago**, no después. El usuario ve que el sistema entendió su idea (gratis) y *luego* decide comprometerse pagando. Esto es lo opuesto al orden original de Notion, y probablemente una decisión deliberada de conversión: reduce la fricción de pagar "a ciegas" — el usuario paga después de sentir que el producto ya lo entendió, no antes.

Esto también significa que **perfil, recursos y ajuste personal ocurren después del pago**, en la fase "diagnóstico" — el usuario ya se comprometió antes de invertir el tiempo más largo del cuestionario (perfil = 6 min, el paso más largo).

> Ver [[../decisiones/evolucion-del-producto]] para el registro de esta decisión de reordenamiento (commit `cba2954 feat: update onboarding flow and enhance form handling`).

## El paso "contacto" ahora también es el punto de entrada de cuentas (2026-08-05)
Desde la integración con el [[../arquitectura/modulo-de-usuarios-y-autenticacion|módulo de usuarios]], `contacto` dejó de ser un simple formulario de captura: ahora crea la cuenta del usuario (correo nuevo) o detecta una cuenta existente y pide iniciar sesión (con retorno automático al onboarding vía `?next=/analizar`). Un usuario ya logueado nunca ve este paso — se salta directo a `idea` con sus datos ya cargados. Detalle técnico completo, incluyendo el bug de prefetch que hubo que corregir en el camino, en [[../arquitectura/modulo-de-usuarios-y-autenticacion#Integración con el onboarding (mismo día)]].

## El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (commit pendiente, 2026-08-26)

> Estado: trabajado en un **commit local sin subir** al 2026-08-26. Es el primer lote del punto de Sprint 2 "corregir errores del paso «Así entendimos tu idea»" (ver [[../decisiones/plan-lanzamiento-60-90-dias#Corregir errores del paso «Así entendimos tu idea» (agregado 2026-08-26)]]). Fuentes: `src/components/onboarding/idea-confirmation.tsx`, `src/app/analizar/actions.ts`, `src/lib/ai/openai.ts`, `src/lib/ai/prompts/idea-refinement.ts`, `src/lib/ai/prompts/idea-assumptions-rotate.ts` (nuevo), `src/lib/ai/schemas/idea-assumptions*.ts`.

### Qué muestra el paso
Tras describir la idea (`idea`), el paso `confirmacion` muestra dos bloques:
1. **"Nuestro entendimiento"** — resumen en prosa (segunda persona) + tarjetas estructuradas (`que_ofreces`, `cliente_objetivo`, `como_operas`, y opcionalmente `cuando_opera`, `propuesta_valor`).
2. **"Supuestos detectados"** — lista de supuestos/preguntas con checkbox y un input de aclaración opcional por cada uno.

### El error que se corrigió
Al seleccionar supuestos, escribir aclaraciones y darle a **"Pulir mi idea con IA"**, la salida (y sobre todo el *fallback* sin `OPENAI_API_KEY`) **pegaba las aclaraciones crudas** dentro de las tarjetas estructuradas y del resumen. El resultado se leía como una transcripción de preguntas y respuestas, con muletillas meta ("comentaste:", "indicaste:", "Sobre precio/valor,") en vez de un análisis sintetizado de la idea. En el peor caso el fallback literalmente ponía `cliente_objetivo = <texto de la aclaración>`.

### Dos acciones ahora, no una
- **"Pulir mi idea con IA"** (`refineIdea`) — toma los supuestos seleccionados + aclaraciones y la IA **reescribe** "Nuestro entendimiento" como análisis integrado (no cita al usuario), y además **rota 3-4 supuestos nuevos** con ángulos distintos.
- **"Analizar más"** (`rotateIdeaAssumptions`, acción nueva) — regenera **solo** la lista de supuestos con ángulos frescos, sin tocar la tarjeta de entendimiento. Limpia la selección y las aclaraciones, e incrementa un contador de ronda que se muestra como badge ("Ronda 2").

### Tres capas de defensa contra la "transcripción"
1. **Prompt reescrito** (`idea-refinement.ts`): pasa de "integra las aclaraciones" a "REESCRIBE «Nuestro entendimiento» como análisis". Reglas duras: nunca pegar la aclaración literal, nunca usar verbos de transcripción, cada campo estructurado = 1 frase analítica corta, mapeo semántico del tema de la aclaración al campo correcto (cliente→`cliente_objetivo`, operación→`como_operas`, precio/beneficio→`propuesta_valor`, marketing→enriquece el summary, no `propuesta_valor`), + un ejemplo de referencia de estilo. Ahora también recibe el entendimiento estructurado **actual** como input, para reescribir desde ahí y no desde cero.
2. **Saneadores del lado servidor** (`openai.ts`, se aplican también a la salida de la IA real): `looksLikeQaDump` (≥2 signos de interrogación) y `looksLikeRawClarificationDump` (compara normalizado el valor del campo contra las notas de aclaración) detectan salida mala; `sanitizeStructuredUnderstanding` reemplaza el campo sospechoso por el valor previo; `sanitizeSummaryNarrative` hace reemplazos por regex de frases meta conocidas.
3. **Fallback reescrito** (`generateFallbackIdeaRefinement`): conserva el entendimiento estructurado previo (nunca mete notas en las tarjetas), teje cada aclaración en una frase natural por categoría vía `weaveClarificationSentence`/`polishClause` ("Operativamente, planeas…", "El precio o modelo de valor todavía está en evaluación…"), y rota 3 supuestos de un pool curado filtrando categorías ya usadas. `generateFallbackIdeaAssumptionsRotation` cubre el camino offline de "Analizar más".

### Otros arreglos del mismo commit
- **IDs de supuesto únicos** (`ensureUniqueAssumptionIds`, en `idea-assumptions.ts` y en el componente): la IA a veces repetía el mismo `id` entre items, lo que colapsaba el estado de aclaración (escribir en un input llenaba otro).
- **A11y / UX**: skeleton de carga mientras pule o rota; el checkbox y su label ahora están asociados por `id`/`htmlFor` y el click en el input de aclaración ya no togglea el checkbox; tarjeta "Lo que pulimos juntos" renombrada a **"Recomendaciones"** (lista con viñetas); ambos botones y los de confirmar/editar se deshabilitan con un único flag `busy`; mensajes de error de pulir y rotar combinados.
- **Schema**: `ideaRefinementSchema.assumptions` pasa de `.max(5)` a `.min(2).max(5)`; nuevo flag `RefineIdeaState.assumptionsOnly`; mensajes de éxito distintos según se haya usado IA o fallback; `console.error` al caer en fallback.

> Nota de estado: el commit agrega **un error nuevo de eslint** `react-hooks/set-state-in-effect` en `idea-confirmation.tsx` (el `useEffect` de `rotateState` sigue el mismo patrón que el de `refineState`, que ya tenía ese error preexistente). `tsc --noEmit` limpio.

## Paso "ajuste" — no existía en el diseño original
`ajuste` (fase diagnóstico, ~3 min) no tiene equivalente directo en los 12 pasos de Notion. Por el nombre ("Ajuste personal") probablemente corresponde a lo que Notion llamaba "Personal Work Fit" (Step 4) — pero movido de antes-del-pago a después-del-pago, y separado de "perfil" como su propio paso. A verificar leyendo `src/app/analizar/ajuste/page.tsx` en una próxima sesión si se necesita el detalle exacto de qué preguntas contiene hoy.

## Principio de UX que se mantiene sin cambios
"El onboarding debe sentirse como una conversación inteligente, no como una encuesta pesada." Y de los wireframes: no mostrar un score numérico global primero en resultados — llevar con recomendación + diagnóstico narrativo de 3 líneas. Ver [[reporte-de-resultado]].

## Question Bank original (Notion, 25 preguntas máx., por sección)
A (perfil) · B (recursos — **B1/B2 de capital y pérdida removidos en producción**, ver [[../decisiones/evolucion-del-producto]]) · C (personal fit) · D (idea de negocio) · E (financial basics) · F (mercado y riesgo) · G (contexto final). Detalle completo: [[../../raw/notion/05-question-bank-v1]].

## Ver también
[[../producto/prd]] · [[reporte-de-resultado]] · [[../decisiones/evolucion-del-producto]] · [[../marca/sistema-de-diseno]] · [[../framework/prompts-de-ia]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
