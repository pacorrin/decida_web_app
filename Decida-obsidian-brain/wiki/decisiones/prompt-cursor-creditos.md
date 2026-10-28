---
type: prompt
tags: [decida, creditos, cursor]
updated: 2026-10-22
---

# Prompt para Cursor — sistema de créditos (OBSOLETO)

> **Obsoleto desde 2026-10-28.** El modelo pasó de paquetes de pago único a planes mensuales con créditos que se restablecen; el cambio se implementó directamente en el repo. Ver [[modelo-de-creditos-hibrido]]. Se conserva solo como histórico.

Especificación completa: [[modelo-de-creditos-hibrido]] (leerla primero). Este es el texto a pegar en Cursor.

```
Implementa el sistema de créditos de Decida. La especificación completa (decisiones, modelo de datos, flujos, cuidados y fases) está en:
Decida-obsidian-brain/wiki/decisiones/modelo-de-creditos-hibrido.md
Léela entera antes de tocar código. No contradigas sus decisiones cerradas (§1) ni cambies precios.

Contexto del repo: Next.js 16 (App Router, React 19), Prisma 7 sobre PostgreSQL, Stripe. Lee AGENTS.md primero: esta versión de Next tiene cambios incompatibles; consulta node_modules/next/dist/docs/ antes de escribir código. Usa pnpm.

Reglas:
- Trabaja directo en la rama main, sin crear ramas ni PR; un commit por fase.
- NO modifiques src/lib/scoring.
- Los créditos son enteros en centésimos (100 = 1 crédito; básico 50, con investigación 150).
- Toda operación de saldo es una transacción atómica, con libro mayor (credit_ledger) como fuente de verdad e idempotencia por clave única. Sin saldo negativo.
- Stripe en modo prueba; webhooks con firma e idempotencia.
- Antes de cada commit: pnpm tsc --noEmit (o npx tsc --noEmit), npx vitest run y pnpm lint sin errores nuevos. Escribe pruebas para cada fase (listadas en §7 del doc).
- Si algo no está claro o contradice el código, detente y pregunta; no improvises.

Pasos:
0. Diseño corto: lee src/lib/subscription/*, src/app/analizar/actions.ts, src/lib/ai/generate-report.ts y el gate freemium (limits.ts, access.ts, result-report.tsx). Escribe en tu respuesta (sin código) cómo convivirá el gate actual con los créditos según §4.8 del doc y espera mi OK.
1. Fase 1 (doc §8): enums y tablas (credit_ledger, users.user_credits_balance, assessments.asmt_research_enabled/asmt_credit_cost/asmt_credits_charged_at), migración, src/lib/credits/{packages,costs,ledger}.ts y pruebas del libro (compra, gasto, reembolso, idempotencia, saldo insuficiente, concurrencia).
2. Fase 2: compra de paquetes con Stripe Checkout (mode payment), webhook, saldo e historial en /cuenta, pantalla de paquetes.
3. Fase 3: cobro al generar el reporte (una sola vez por evaluación), interruptor «Investigación de mercado» en el onboarding (por evaluación; REPORT_RESEARCH_ENABLED sigue como interruptor maestro), reembolso total si el reporte falla y de la diferencia si la investigación se degrada, redirección a paquetes sin saldo.
4. Fase 4: landing (reemplazar $99/mes por paquetes), FAQ, términos, privacidad, retiro visual de la suscripción detrás de SUBSCRIPTIONS_ENABLED=false (no borres su código), eventos de PostHog (credits_purchased, credits_spent, credits_insufficient, research_toggled), .env.example actualizado.
Fase 5 (suscripción que otorga créditos) NO se implementa ahora.

Al terminar cada fase, resume qué hiciste, cómo lo probaste y qué quedó pendiente. Verifica en el navegador lo que sea visible.
```
