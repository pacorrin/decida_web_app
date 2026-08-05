---
type: product
tags: [decida, prd, producto]
updated: 2026-08-05
---

# PRD — Business Viability Assessment

Fuentes: [[../../raw/notion/01-prd-business-viability-assessment|Notion 01 - PRD]] · `PRODUCT.md` (repo, más reciente y autoritativo sobre el estado actual).

## One-liner
Herramienta web que ayuda a una persona a evaluar si una idea de negocio vale la pena para ella antes de invertir tiempo, dinero o esfuerzo.

## Core positioning
No es una lista de negocios recomendados. No es una plantilla genérica. No es un curso de emprendimiento. **Es un sistema de evaluación para la idea que el usuario ya tiene.** Ver [[../framework/criterios-de-evaluacion]].

## Problem statement
La mayoría de las personas evalúa sus ideas de forma emocional, incompleta o influenciada por tendencias (TikTok, historias de éxito aisladas). Errores típicos: subestimar inversión inicial, no calcular costos operativos, no validar demanda, sobreestimar ventas, ignorar tiempo requerido, elegir una idea que no encaja con su estilo de vida, confundir autoempleo con negocio escalable.

## Usuario objetivo
Ver [[usuario-objetivo-y-jtbd]] para detalle completo.

## Success (3 niveles, definidos en `PRODUCT.md`)
1. **Usuario**: se va con una decisión informada — viable o no bajo sus restricciones — y siente que recibió retroalimentación fuerte y útil.
2. **Producto**: el feedback es lo bastante valioso como para que pague de nuevo por comparar otra idea.
3. **Producto (largo plazo)**: tras decidir seguir adelante, el usuario está listo para ejecutar y dispuesto a comprar un plan premium de herramientas de acompañamiento. *(Oferta premium futura, no requerida para V1.)*

## Non-goals originales (Notion, V1) vs estado real
App móvil · login completo · dashboard complejo · **historial de evaluaciones** · comunidad · comparador de múltiples ideas · marketplace · curso · base de negocios preestudiados.

> ⚠️ **Brecha confirmada**: "sin login" y "sin historial" ya no aplican — el código implementa verificación por email + `/mis-evaluaciones`. Ver [[../arquitectura/historial-de-evaluaciones]] y [[../decisiones/evolucion-del-producto]]. El resto de non-goals (app móvil, comunidad, marketplace, curso) siguen vigentes.

## MVP goal (flujo de 6 pasos, diseño original)
Pagar/iniciar → onboarding guiado → describir idea → diagnóstico inmediato con IA → reporte → próximos pasos. El **orden real implementado difiere** (idea y confirmación IA ocurren antes del pago) — ver [[../experiencia/flujo-de-onboarding]].

## Salida primaria (Primary Output)
Reporte de viabilidad: resumen ejecutivo, diagnóstico general, semáforos por dimensión, fortalezas, riesgos, supuestos críticos, próximos pasos, recomendación final. Ver [[../experiencia/reporte-de-resultado]].

## Riesgo estratégico (el más importante del documento fuente)
> "El mayor riesgo no es técnico. El mayor riesgo es construir demasiada funcionalidad antes de confirmar que la gente paga por reducir incertidumbre sobre una idea de negocio."

Esto es relevante hoy: el código ya construyó bastante más de lo que el PRD original consideraba necesario para validar (historial, verificación de email, manejo robusto de errores/reintentos, encuesta de feedback post-reporte). Ver [[../decisiones/evolucion-del-producto]] para el detalle de qué se adelantó y por qué podría valer la pena revisar si esa inversión ya está pagada con evidencia de clientes reales.

## Capacidades confirmadas (código, vía `PRODUCT.md`)
- Flujo guiado + reporte personalizado (resumen ejecutivo, semáforos, fortalezas/riesgos, vista financiera básica, fit personal, plan de validación, recomendación final).
- Soporta ideas físicas, digitales, de servicios, producto, franquicia, side hustle o proyecto independiente.
- Reporte de ejemplo (`/ejemplo`) como preview antes de pagar.
- Pago simulado en beta (paso de compromiso); promesa de reembolso si el reporte falla.

## Abierto / no decidido (no inventar)
- Estándar formal de accesibilidad (más allá de "web usable y amigable").
- Expansión geográfica más allá de framing español/MX.
- Alcance y precio exacto del plan premium (éxito nivel 3).
- Si las preguntas de capital/pérdida tolerable regresan en una sección financiera posterior (la UX se removió del paso de situación, pero las columnas/opciones podrían seguir existiendo). Ver [[../decisiones/evolucion-del-producto]].

## Ver también
[[usuario-objetivo-y-jtbd]] · [[principios-de-producto]] · [[../framework/dimensiones-de-viabilidad]] · [[../experiencia/flujo-de-onboarding]]
