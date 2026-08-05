---
source: notion
title: "🧩 03 - Onboarding & User Flow"
url: https://app.notion.com/p/37d09ab888ba812ab743f963f4a0908c
fetched: 2026-08-05
---

## Core Principle
El onboarding debe sentirse como una conversación inteligente, no como una encuesta pesada. El usuario debe avanzar con sensación de claridad, no de examen.

## User Flow V1 (diseño original)
1. Landing
2. CTA: Analizar mi idea
3. Pago o acceso inicial
4. Perfil personal
5. Recursos disponibles
6. Perfil de trabajo
7. Descripción de idea
8. Confirmación IA de la idea
9. Evaluación guiada
10. Resultado inmediato
11. Reporte / PDF
12. Upsell opcional

> Nota de brecha: el flujo **implementado** en `src/lib/onboarding/steps.ts` reordena esto — captura de idea y confirmación IA ocurren en fase "gratis" **antes** del pago; perfil/ajuste/evaluación ocurren después, en fase "diagnóstico". Ver [[flujo-de-onboarding]] y [[evolucion-del-producto]].

## Step 1 - Landing
Goal: que el usuario entienda inmediatamente el valor.
Hero: "¿Vale la pena tu idea de negocio antes de invertir tiempo y dinero? Analiza cualquier idea según tu capital, tiempo disponible, habilidades, objetivos y nivel de riesgo."
CTA: "Analizar mi idea"
Trust: resultado inmediato, análisis personalizado, no necesitas conocimientos financieros, aplica para cualquier idea, enfocado en reducir riesgo.

## Step 2 - Profile
País · Situación actual (empleado, independiente, estudiante, desempleado, negocio actual) · Objetivo principal (ingreso extra, reemplazar empleo, libertad financiera, probar idea, escalar negocio) · Nivel de experiencia emprendiendo.

## Step 3 - Resources
Capital disponible · cuánto está dispuesto a perder sin afectar su estabilidad · horas disponibles por semana · días disponibles · tiempo esperado para ver resultados.

## Step 4 - Personal Work Fit
Qué disfruta más (vender, operar, crear, enseñar, analizar, liderar) · preferencia físico/digital/mixto · atender clientes · contratar personas · tolerancia a incertidumbre · gusto por seguir procesos.

## Step 5 - Business Idea Capture
"Describe tu idea de negocio con tus palabras." Ejemplo: "Quiero iniciar un servicio de detailing móvil los fines de semana para clientes residenciales."

## Step 6 - AI Understanding Confirmation
La IA reescribe la idea para generar confianza y evitar malentendidos. Usuario: confirmar o editar mi idea.

## Step 7 - Guided Evaluation
Secciones: finanzas · mercado/clientes · riesgos · tiempo operativo · escalabilidad.

## Step 8 - Results
Orden: diagnóstico general → semáforos por dimensión → fortalezas → riesgos → supuestos críticos → próximos pasos → recomendación final.

## Step 9 - Next Steps
Ejemplo semana 1: hablar con 10 clientes potenciales, investigar precios de 5 competidores, cotizar materiales. Semana 2: prueba piloto, calcular margen real, ajustar precio.

## Step 10 - Upsell
"¿Quieres profundizar más en esta idea?" Plan Pro: simulador financiero, escenarios optimista/realista/pesimista, plan de validación de 90 días. Plan Expert: revisión personalizada.
