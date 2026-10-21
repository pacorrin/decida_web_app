# Decisión: herramienta de búsqueda para la etapa de investigación

Fecha: **2026-10-20**. Decisión: **OpenAI Responses API con la herramienta `web_search`**, detrás de una interfaz de proveedor (`SearchProvider`) que deja abierta la puerta a Tavily o Brave si el costo o la calidad no se sostienen.

## Opciones evaluadas

| | OpenAI Responses `web_search` | Proveedor externo (Tavily / Brave) + Chat Completions |
|---|---|---|
| Proveedores y secretos nuevos | Ninguno (ya usamos OpenAI) | Uno más: otra API key, otro subencargado en `/privacidad` |
| Cambio de código | Esta etapa usa Responses; el resto sigue en Chat Completions | Búsqueda aparte + prompt con los resultados |
| URLs verificables | Sí, nativas (`url_citation` y `web_search_call.action.sources`) | Sí (vienen en la respuesta del buscador) |
| Control de consultas y filtros | Las consultas las decide el modelo; filtro `allowed_domains` solo con algunos modelos (se probó que `gpt-4.1` sí, `gpt-4.1-mini` y `gpt-4o-mini` no) | Total (consultas, incluir/excluir dominios); los resultados se pueden verificar contra el texto |
| Tope duro de búsquedas | `max_tool_calls` | Lo imponemos nosotros |
| Costo por búsqueda | Tarifa por llamada (fuentes secundarias dan entre 10 y 30 USD por mil; hay que confirmarlo en la página oficial de OpenAI) más ~8 mil tokens de contexto fijos por llamada con modelos mini y ~17 mil con `gpt-4.1` | Centavos por búsqueda (orden de 0.003–0.016 USD en los planes públicos), más los tokens del modelo |
| Logs y evals | Se pueden contar `web_search_call` y leer `action.query` y `sources` | Registro exacto de lo que se consultó y devolvió |

## Evidencia (prueba real con la cuenta del proyecto, 2026-10-20)

| Prueba | Resultado |
|---|---|
| `gpt-4o-mini`, una pregunta amplia sobre cafeterías en Roma Norte | 5 s, **1 sola búsqueda**, 8.2 mil tokens de entrada. Fuentes flojas (notas de prensa, Rappi, DiDi Food); precios sueltos; **no encontró tamaño de mercado ni rentas**. Las URLs traen `?utm_source=openai`. |
| `gpt-4.1` con `allowed_domains` de fuentes oficiales mexicanas | 4 s, 1 búsqueda, 17.5 mil tokens. **Cifra oficial con año y URL**: 581,530 unidades económicas en la rama 7225 según el Censo Económico 2019 del INEGI, con el PDF del propio INEGI. |
| `gpt-4.1-mini` / `gpt-4o-mini` con `allowed_domains` | Error 400: el parámetro `filters` no se admite con esos modelos. |

Conclusiones de la prueba:
1. Una pregunta amplia a un modelo mini da poco y de mala calidad: hay que **dividir la investigación por tema** (mercado, competidores, precios, canales, costos) con una consulta enfocada cada una.
2. Los temas que dependen de **fuentes oficiales** (tamaño de mercado, costos, regulación) rinden mucho más con `gpt-4.1` y dominios permitidos; el resto (competidores, precios, canales) puede ir con un modelo más barato y sin filtro.
3. Hay que quitar `utm_source` de las URLs y **descartar toda cita que no venga de la búsqueda**: el modelo que estructura la ficha solo puede referirse a fuentes realmente citadas.

## Por qué OpenAI y no un buscador externo (por ahora)
- Mantiene **un solo proveedor, un solo secreto y un solo subencargado de datos**: la idea ya viaja a OpenAI y `/privacidad` ya lo declara. Con un buscador externo habría que mandar consultas (derivadas de la idea) a otro tercero y actualizar el aviso.
- **Citas con URL nativas** y un tope duro (`max_tool_calls`) sin código propio.
- Menos piezas para el MVP: se puede medir cuánto cuesta y cuánto aporta antes de invertir en otro proveedor.

## Riesgos y cómo se cubren
- **Costo opaco**: la tarifa por búsqueda se conoce por fuentes secundarias y OpenAI puede facturar subbúsquedas internas. Se cubre con tope de búsquedas (por defecto 5), tope de costo estimado por reporte (**0.30 USD**, acordado con el usuario) calculado con constantes conservadoras y medición en los evals.
- **Calidad dependiente del modelo**: por eso el modelo de investigación es configurable por tema (`OPENAI_MODEL_RESEARCH` y `OPENAI_MODEL_RESEARCH_OFFICIAL`).
- **Menos control de consultas**: se compensa generando las consultas nosotros (un plan por tema) y registrando `action.query` y `sources` de cada llamada.
- **Dependencia de un solo proveedor**: la etapa se escribe contra `SearchProvider`, con una única implementación hoy; añadir Tavily o Brave es implementar esa interfaz.

## Cuándo reconsiderar
- Si el costo medido por reporte supera el tope o la mitad de las fichas salen con huecos que un buscador dirigido resolvería.
- Si hace falta restringir dominios con un modelo que no lo admita.
