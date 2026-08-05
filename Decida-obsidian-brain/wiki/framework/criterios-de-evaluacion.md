---
type: framework
tags: [decida, framework, juicio-humano]
updated: 2026-08-05
---

# Criterios de evaluación de ideas (juicio humano)

Fuente: [[../../raw/notion/16-criterios-evaluacion-ideas]] · [[../../raw/notion/17-rubric-6-dimensiones]]

Esta es la capa de **juicio humano** que corre en paralelo al [[scoring-engine|scoring engine automatizado]] — un rubric operativo para evaluar casos a mano (entrevistas, revisiones internas) con la misma lógica del producto. Útil para: calibrar si el motor automatizado está dando resultados razonables, entrenar/revisar prompts de IA, y entender casos límite.

## La pregunta correcta
No "¿la idea es buena?" sino: **¿es viable para esta persona, ahora, con estos recursos?**

## Los 5 bloques de evaluación
| Bloque | Qué preguntar |
|---|---|
| Persona | Situación, tiempo, objetivo, tolerancia a pérdida, habilidades, experiencia |
| Idea | Qué vende, a quién, por qué pagarían, precios, nuevo vs crecimiento |
| Mercado | Demanda real, competencia, canal para conseguir clientes |
| Números | Inversión, costos, margen, punto de equilibrio, tiempo a recuperar |
| Ejecución | ¿Puede operarlo con su tiempo/skills? ¿Qué validar antes de invertir más? |

## Método de evaluación (más que un checklist)

**A. Separar hechos, supuestos y deseos.** Hecho: "ya vendí 3 servicios a $800". Supuesto: "creo que venderé 16 al mes". Deseo: "quiero libertad financiera en 6 meses". La evaluación seria ataca supuestos, no motiva deseos. Ver [[../glosario#Hecho / Supuesto / Deseo]].

**B. Preguntar el mínimo para aprender.** Antes de "¿inviertes $50k?", preguntar: ¿qué prueba de $1-5k (o solo tiempo) te diría si hay demanda? Si no pueden definir una prueba barata, el riesgo suele ser alto.

**C. Usar 4 salidas claras**, nunca sí/no absoluto — coincide exactamente con las salidas del [[scoring-engine#Recommendation Logic]].

**D. Cruzar persona × idea.** Es donde vive el valor real del diagnóstico. Ejemplos de desajuste: objetivo "reemplazar empleo" + solo 5h/semana; margen bueno + nunca habló con clientes → riesgo comercial alto; capital alto + tolerancia a pérdida baja; meta de escalar + modelo 100% "yo solo hago el servicio" → autoempleo, no escala.

## Conceptos financieros — prioridad alta
Costos fijos vs variables · margen de contribución · punto de equilibrio · payback · unit economics · flujo de caja vs utilidad (puede "ganar" en papel y quedarse sin efectivo) · capital de trabajo · CAC aproximado · LTV simple · escenarios (pesimista/base/optimista).

> ⚠️ "El supuesto débil casi siempre es el volumen de ventas, no la fórmula." Interpretar números con escepticismo — esta es la advertencia más repetida en las fuentes de Notion.

## 8 lentes prioritarios (orden de uso recomendado)
1. Objetivo de la persona y horizonte de tiempo
2. Tiempo real disponible vs tiempo que el negocio exige
3. Cliente + problema + por qué pagarían
4. Evidencia de demanda
5. Precio − costo variable → margen
6. Break-even y payback bajo supuestos honestos
7. Capital a riesgo vs pérdida aceptable
8. Próximo paso de validación más barato

## Red flags y señales verdes frecuentes
Ver rubric completo en [[../../raw/notion/17-rubric-6-dimensiones]] — checklist reutilizado también por el scoring engine automatizado (ver [[scoring-engine#Red flags]]).

## Ver también
[[dimensiones-de-viabilidad]] · [[scoring-engine]] · [[prompts-de-ia]]
