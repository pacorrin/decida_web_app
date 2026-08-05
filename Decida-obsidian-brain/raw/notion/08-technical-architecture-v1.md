---
source: notion
title: "🏗️ 08 - Technical Architecture V1"
url: https://app.notion.com/p/37d09ab888ba8173bff2d063e14c7a25
fetched: 2026-08-05
---

## Objective
Construir una web sencilla, rápida y vendible sin sobrearquitectura.

## Recommended Stack
Next.js · TypeScript · Server Actions · base de datos simple o persistencia JSON · Stripe o Mercado Pago · modelo IA de bajo costo · generación de PDF.

## What Not To Use in V1
App móvil · auth compleja · microservicios · Redis · sistema de colas · panel admin complejo · arquitectura multi-tenant · CRM completo.

## High-level Flow
Landing → CTA → pago o beta → formulario multi-step → backend calcula scores → IA genera diagnóstico → usuario ve resultado → descarga reporte.

## Core Modules
- **Landing Module**: explicar producto, mostrar ejemplo, CTA, confianza y precio.
- **Assessment Module**: onboarding multi-step, validación, progreso, recolección de respuestas.
- **Scoring Engine**: calcular scores por dimensión, semáforos, detectar patrones de alto riesgo, generar input estructurado para IA.
- **AI Diagnosis Module**: resumir idea, generar diagnóstico, fortalezas, riesgos, próximos pasos.
- **Report Module**: renderizar resultado, generar PDF descargable, guardar/enviar reporte.
- **Payment Module**: crear checkout, confirmar pago, desbloquear assessment/resultado.

## Suggested Data Objects
Assessment (id, createdAt, paymentStatus, userEmail, country, objective, capitalRange, hoursPerWeek, businessIdea, answers, scores, diagnosis, reportUrl) · Score (personalFit, financialViability, commercialViability, riskLevel, timeFit, scalability) · Diagnosis (summary, generalAssessment, strengths, risks, nextSteps, finalRecommendation).

## Scoring Approach V1
Reglas determinísticas primero. Ejemplos: bajo capital + negocio de alta inversión → baja viabilidad financiera; <5h/semana + operación activa → baja time fit; evita ventas + canal de ventas directas → sube riesgo comercial; no ha hablado con clientes → comercial amarillo o rojo.

## AI Cost Control
Usar IA solo después de completar el formulario. Enviar JSON compacto estructurado, no historial conversacional completo. Cachear diagnóstico por assessment. Evitar interfaz de chat en V1.

## Deployment
Vercel · variables de entorno · llaves Stripe/Mercado Pago · llave de API de IA.

## Security and Privacy Basics
Guardar solo lo necesario. No recolectar datos financieros sensibles más allá de rangos/estimaciones. Aviso de privacidad. Aclarar que los resultados son educativos, no asesoría financiera.

## Future Technical Expansion
Cuentas de usuario · assessments guardados · comparar múltiples ideas · simulador avanzado · dashboard admin · analytics · suscripción SaaS.

> Nota de brecha: en producción se implementó PostgreSQL + Prisma con esquema relacional normalizado (no JSON simple), y ya existe login ligero por verificación de email para historial (`/mis-evaluaciones`). Ver [[stack-tecnico]] y [[modelo-de-datos]].
