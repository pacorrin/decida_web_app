---
source: notion
title: "🧮 10 - Scoring Engine"
url: https://app.notion.com/p/37d09ab888ba811b85abc1e66a42f452
fetched: 2026-08-05
---

## Purpose
Motor lógico del producto: convertir respuestas del usuario en señales estructuradas para un diagnóstico útil, prudente y accionable. No predice el éxito de un negocio; identifica compatibilidad, riesgo, viabilidad inicial, supuestos débiles y próximas validaciones.

## Core Rule
"El score no es el producto. El diagnóstico es el producto." El score alimenta semáforos, explicaciones, alertas, recomendaciones y prompts de IA.

## V1 Dimensions (inputs, señales, ejemplos de reglas)

### 1. Personal Fit
Inputs: actividades que disfruta/evita, preferencia físico/digital, comodidad vendiendo, comodidad con incertidumbre, solo/equipo.
Reglas ejemplo: evita ventas + canal de ventas directas → baja Personal Fit y Commercial Viability. Prefiere digital + idea muy física → fricción. Evita contratar + negocio depende de empleados desde el inicio → riesgo operativo.

### 2. Financial Viability
Cálculos: margen bruto por venta = precio − costo variable; % margen = margen/precio; utilidad bruta mensual = margen × ventas estimadas; utilidad neta estimada = utilidad bruta − costos fijos; ventas de equilibrio = costos fijos / margen por venta; meses de recuperación = inversión inicial / utilidad neta mensual.
Riesgos: margen negativo, utilidad neta ≤ 0, inversión > capital disponible, inversión > pérdida aceptable, payback muy largo.

### 3. Commercial Viability
Inputs: cliente ideal, problema, por qué pagarían, si ya habló con clientes, competencia, canal principal.
Reglas: sin canal de adquisición → máximo Amarillo. No ha hablado con clientes → riesgo de demanda. Competencia alta sin diferenciación → riesgo competitivo.

### 4. Risk Level
Categorías: financiero, operativo, de mercado, de dependencia, personal. Nota: score de riesgo alto = más riesgo → debe generar amarillo/rojo (inversión de escala).

### 5. Time Fit
Reglas: <5h/semana + espera ingresos en <1 mes → expectativa agresiva. Solo fines de semana + idea con atención diaria → fricción. Busca reemplazar empleo pero pocas horas → recomendar prueba gradual.

### 6. Scalability
Tipos: self-employment (crece con más horas), small business (delegable parcialmente), scalable system (procesos/tecnología/activos digitales).

## Suggested Weighting V1
Personal Fit 20% · Financial Viability 25% · Commercial Viability 25% · Risk Level 15% · Time Fit 10% · Scalability 5%.
Rationale: en V1 lo más importante es evitar malas decisiones iniciales; finanzas y mercado pesan más que escalabilidad.

## Recommendation Logic
- **Proceed with Small Test**: financiera no roja, comercial amarilla/verde, riesgo no rojo, time fit aceptable.
- **Validate First**: financieras poco claras, sin validación de clientes, canal poco claro, riesgo manejable pero no probado.
- **Adjust the Idea**: conflicto de personal fit, desajuste de tiempo, márgenes débiles pero arreglables, modelo muy dependiente del tiempo del usuario.
- **Pause for Now**: economía negativa, inversión > pérdida aceptable, sin cliente claro, alta dependencia + poco tiempo.

## Red Flag Rules
Inversión inicial > capital disponible · inversión > lo que puede perder · margen por venta negativo · no sabe quién es el cliente · no sabe cómo conseguirá clientes · no ha hablado con clientes y planea invertir capital alto · quiere reemplazar empleo sin ingresos recurrentes probados · depende de plataforma externa sin plan alterno · requiere permisos/regulación no investigados.

## Output to AI (ejemplo JSON)
```json
{
  "businessIdea": "Servicio de detailing móvil",
  "userGoal": "Ingreso extra",
  "capitalAvailable": "50000 MXN",
  "hoursPerWeek": "10-20",
  "scores": {
    "personalFit": "green",
    "financialViability": "yellow",
    "commercialViability": "red",
    "riskLevel": "yellow",
    "timeFit": "green",
    "scalability": "yellow"
  },
  "redFlags": ["No ha hablado con clientes", "Canal de adquisición poco claro"],
  "calculatedMetrics": { "grossMargin": 500, "monthlyNetEstimate": 8000, "paybackMonths": 3.5 }
}
```

## V1 Implementation Advice
Implementar primero reglas simples y explícitas en TypeScript. Evitar modelos opacos al inicio. La IA debe explicar, no decidir.

> Confirmado en código: `src/lib/scoring/index.ts` implementa exactamente este híbrido — `calculateDeterministicScores()` (reglas en TS) + `interpretScores()` (IA vía `generateReasoningJson` con fallback determinístico si la IA falla). Ver [[scoring-engine]].
