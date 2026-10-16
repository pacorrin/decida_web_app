---
type: tareas
tags: [decida, tareas, pruebas, onboarding, reporte]
updated: 2026-10-16
---

# Prueba manual del onboarding (2026-10-16)

Recorrido completo hecho con Claude in Chrome sobre el servidor local, con una idea de viandas saludables para oficinas (Guadalajara), plan gratuito («Continuar gratis») y generación real del reporte con OpenAI. La cuenta usada **ya tenía suscripción** (cancelada con acceso vigente), así que se vio el reporte **completo**: la vista recortada del plan gratuito **no se probó** en esta pasada.

## Qué funcionó
- Idea → resumen de IA → «Pulir mi idea»: integra la aclaración de precio en el resumen (no la pega cruda).
- Plan → «Continuar gratis» sigue el onboarding; las validaciones llevan al primer campo sin responder.
- Productos acepta precios como 695 (el arreglo de `step="any"` funciona) y el estimado mensual cuadra (ingresos $27,800; utilidad bruta $12,400; margen 45%).
- Generación del reporte: unos 40 s con barra de progreso.
- Cifras del reporte coherentes: margen bruto $310 (44.6%), punto de equilibrio 33, recuperación 7.5 meses ($18,000 / $2,400).

## Problemas en el contenido del reporte (IA)

> **Corregido el 2026-10-16 (v1.2.0)**: ver [[../framework/prompts-de-ia#Calidad del reporte — v1.2.0 (2026-10-16)]]. La causa del punto 1 era distinta a la supuesta: el semáforo estaba invertido (el prompt de interpretación describía el riesgo al revés) y el texto del reporte era el correcto.
1. **Nivel de riesgo contradictorio.** El semáforo dice «Nivel de riesgo: 94/100, Favorable», pero el resumen y la escalabilidad dicen que el riesgo es «alto/preocupante (94)». Causa probable: `buildContext` (`src/lib/ai/generate-report.ts`) le pasa a la IA `{dimension: "Nivel de riesgo", score: 94}` sin decir que un puntaje alto es bueno.
2. **Confunde al emprendedor con el cliente.** En «Entendimiento del negocio», el «perfil del cliente ideal» usa el capital y la pérdida aceptable del emprendedor. Causa probable: el contexto `profile` es del fundador y el prompt lo trata como cliente.
3. **«Tiempo y operación» es genérico y no habla de la idea:** sugiere e-commerce, consultoría y freelancing para un negocio de comida, y habla del «usuario» en tercera persona.
4. **«Compatibilidad personal» en tercera persona** («el emprendedor») mientras el resto habla de «tú»; casi no usa las respuestas de «tipo de trabajo» (no están en el contexto que recibe la IA).
5. **LaTeX en crudo** en el análisis financiero: `[ \text{Margen Bruto} = ... ]`. El Markdown no renderiza fórmulas.
6. **Redundancias:** el título de cada sección se repite como encabezado dentro del texto de la IA («Resumen ejecutivo» + «Resumen Ejecutivo del Diagnóstico»; «Escalabilidad» ×3). Los 3 riesgos aparecen tres veces (resumen, Riesgos y «Alertas detectadas»). «Red Flags a considerar» sale en inglés.

## Detalles de interfaz
- ~~Paso del plan: el título «Elige tu plan» aparece dos veces; la pestaña del paso sigue llamándose «Compromiso» (vestigio del pago único).~~ **Corregido el 2026-10-16**: el título lo pone solo el encabezado del paso (`payment-step.tsx` ya no lo repite) y la pestaña ahora dice «Plan» (`steps.ts`, `onboarding-shell.tsx`, `analizar/resultado/page.tsx`).
- El formulario de feedback repite «¿Te fue útil este diagnóstico?» (título de sección y del formulario).
- «Atrás» en «Tu situación» regresa a la pantalla del plan.
- La prueba corrió contra el servidor con PostHog activo: los eventos de esta cuenta quedaron en PostHog (usar el filtro de usuarios internos).

## Pendiente
- Repetir el recorrido con una cuenta sin suscripción para ver la vista recortada y los candados.
