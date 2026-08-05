---
type: framework
tags: [decida, framework, core-ip]
updated: 2026-08-05
---

# Las 6 dimensiones de viabilidad

Fuentes: [[../../raw/notion/04-business-viability-framework]] · [[../../raw/notion/17-rubric-6-dimensiones]] · `src/lib/scoring/`

Este es el **núcleo de propiedad intelectual** del producto: el marco que convierte "¿es buena esta idea?" (pregunta sin respuesta útil) en "¿es viable *para esta persona, ahora, con estos recursos*?" (pregunta que sí se puede diagnosticar).

## Las 6 dimensiones y su peso

| # | Dimensión | Peso | Pregunta central |
|---|---|---|---|
| 1 | [[#1. Compatibilidad personal|Compatibilidad personal]] | 20% | ¿Este negocio encaja con la persona que lo quiere iniciar? |
| 2 | [[#2. Viabilidad financiera|Viabilidad financiera]] | 25% | ¿Los números básicos tienen sentido antes de invertir? |
| 3 | [[#3. Viabilidad comercial|Viabilidad comercial]] | 25% | ¿Hay una forma creíble de conseguir clientes? |
| 4 | [[#4. Nivel de riesgo|Nivel de riesgo]] | 15% | ¿Qué podría salir mal y qué tan grave sería? |
| 5 | [[#5. Tiempo y operación|Tiempo y operación]] | 10% | ¿Puede operar la idea con su disponibilidad actual? |
| 6 | [[#6. Escalabilidad|Escalabilidad]] | 5% | ¿Puede crecer más allá del tiempo personal del usuario? |

Racional del peso: en V1, finanzas y mercado pesan más que escalabilidad porque el objetivo es **evitar malas decisiones iniciales**, no optimizar para crecimiento.

## 1. Compatibilidad personal
Evalúa gustos, habilidades, energía requerida, relación con clientes, tolerancia a ventas, preferencia físico/digital, deseo de operar solo o con equipo.
Regla rápida: evita ventas + canal de venta directa → baja esta dimensión y [[#3. Viabilidad comercial|Comercial]].

## 2. Viabilidad financiera
Métricas: margen por venta = precio − costo variable · % margen = margen/precio · utilidad bruta mensual ≈ margen × ventas · utilidad neta ≈ utilidad bruta − costos fijos · break-even = costos fijos / margen por venta · payback = inversión / utilidad neta mensual.
Rojo si: margen negativo, utilidad neta ≤ 0, inversión > capital disponible o > pérdida aceptable.

## 3. Viabilidad comercial
Evalúa cliente objetivo, canales de adquisición, competencia, diferenciación, evidencia de demanda. Sin canal de adquisición definido → máximo Amarillo, nunca Verde.

## 4. Nivel de riesgo
⚠️ Única dimensión "invertida": un score de riesgo *alto* empuja hacia Amarillo/Rojo, no hacia Verde. Evalúa dependencias (proveedor, empleados, ubicación, plataforma), regulación, capital en riesgo, reversibilidad de la prueba.

## 5. Tiempo y operación
Evalúa horas disponibles/semana, horario, compatibilidad con empleo actual, tiempo hasta primeros ingresos. <5h/semana + expectativa de ingresos en <1 mes = expectativa agresiva (bandera).

## 6. Escalabilidad
Tres arquetipos: **autoempleo** (crece con más horas personales) · **negocio pequeño** (delegable parcialmente) · **sistema escalable** (procesos/tecnología/activos digitales). Solo importa fuerte cuando el objetivo del usuario es "escalar" o "reemplazar empleo" — si el objetivo es ingreso extra o prueba, Amarillo/Rojo aquí rara vez tumba la idea solo.

## Salida: 4 recomendaciones posibles
`proceed_small_test` · `validate_first` · `adjust_idea` · `pause_for_now` — nunca sí/no absoluto. Ver matriz completa en [[scoring-engine#Recommendation Logic]].

## De marco a producto
Este framework se traduce en código en tres capas:
1. **Cálculo determinístico** (reglas TS) → [[scoring-engine]]
2. **Interpretación con IA** (explica, no decide) → [[prompts-de-ia]]
3. **Presentación al usuario** (semáforos + narrativa) → [[../experiencia/reporte-de-resultado]]

También existe una capa de **juicio humano** paralela para evaluar casos a mano (entrevistas, revisión manual) con la misma lógica — ver [[criterios-de-evaluacion]].

## Ver también
[[../producto/prd]] · [[scoring-engine]] · [[criterios-de-evaluacion]] · [[../glosario]]
