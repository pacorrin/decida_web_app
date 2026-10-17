---
type: product
tags: [decida, retencion, ejecucion, vision, estrategia]
updated: 2026-10-16
---

# Retención y plan de ejecución — de diagnóstico a plataforma

Fuentes: conversación de estrategia con el usuario (2026-10-16) · código: `src/lib/ai/schemas/report-sections.ts`, `src/lib/report/sections.ts`, `src/components/onboarding/result-report.tsx`, `prisma/schema.prisma` (`assessment_reports`, `users`), `src/lib/email/`.

> Esto es **hipótesis estratégica**, no evidencia. No hay datos de retención, conversión ni pagos reales en ninguna fuente ingerida (ver [[principios-de-producto]]).

## El insight: la retención se gana en la ejecución, no en el diagnóstico

Lo que mata los proyectos es abandonarlos a mitad de camino. Un producto que solo entrega un buen diagnóstico y luego desaparece tendrá buen análisis y mala retención. Por eso:

- «Números fríos, sin emoción» es un buen principio **de diagnóstico** (honestidad, sin fluff) pero **no de ejecución**.
- En la fase de ejecución pesan el **seguimiento, los recordatorios y los pequeños logros**: son lo que mantiene a la persona avanzando.
- El diagnóstico es la **puerta de entrada**; el producto recurrente es el acompañamiento.

Esto responde a un problema estructural del modelo actual: nadie evalúa muchas ideas en la vida, así que el nivel 2 de éxito de [[prd]] («pagan de nuevo para comparar otra idea») tiene frecuencia de uso baja. Con una suscripción de $99 MXN/mes ([[pricing-y-gtm#Modelo de cobro decidido (2026-09-07)]]), el uso puntual no justifica pagar cada mes. La ejecución convierte un uso único en uso semanal.

## Por qué no es «un LLM más»

Un chat genérico da un análisis distinto cada vez y no recuerda tus números. La diferencia defendible de Decida no es la calidad del texto sino el **estado persistente**: idea, supuestos, plan y avance guardados y comparables en el tiempo. La analogía útil es una herramienta que guarda tu trabajo (tipo Notion o una contabilidad), no un generador por uso (tipo fal.ai, cuya ventaja es costo y variedad de modelos).

## Visión de plataforma (planteada por el usuario, 2026-10-16)

Decida como plataforma que ayuda a **ejecutar** ideas y a **organizar la vida financiera**, con números claros. Piezas contempladas, todas «bajo recomendación»: la plataforma **no financia nada**.

1. Diagnóstico de viabilidad (existe).
2. Plan de ejecución con seguimiento.
3. Herramienta de finanzas: ingresos, gastos, cobertura de deudas, recomendaciones.
4. Comunidad que fomente emprendimiento, empleo y mejora financiera (misión: impulsar la economía local).

Cada pieza podría usarse sola (alguien con un proyecto ya armado puede usar solo el plan; alguien sin idea, solo las finanzas).

### Riesgos señalados al discutirla
- **Dispersión**: son cuatro productos; el riesgo es que ninguno llegue a ser bueno.
- **Finanzas personales** es un espacio muy poblado; la ventaja sería atarlo al proyecto (real vs proyectado), no ser una app genérica.
- **Comunidad**: necesita masa crítica antes de aportar valor; va al final.
- **Regulación**: al tocar deudas y recomendaciones financieras conviene revisar el marco legal en México. Pendiente, sin responsable.
- **Mensaje**: para el usuario de hoy sigue siendo un diagnóstico de $99; no contarle toda la visión todavía.

### Orden sugerido
1. Diagnóstico — validar que se usa y se paga.
2. Plan de ejecución ligado al diagnóstico (aquí aparece la retención).
3. Seguimiento financiero **del proyecto**, real contra proyectado.
4. Finanzas personales y deudas, solo si los usuarios lo piden.
5. Comunidad, cuando haya usuarios activos que la justifiquen.

## Qué tan lejos está hoy el reporte de un plan de ejecución

**Lo que ya existe.** El reporte genera un *plan de validación de 4 semanas* (`arep_validation_plan`): cada semana tiene `week`, `title` y de 2 a 4 `tasks` en texto plano (`validationPlanSchema`). El prompt ya pide tareas anclables a los datos del diagnóstico (canal, precio, productos, riesgos), con verbo de acción y cantidad. Hay infraestructura de correo (`src/lib/email/`, Resend), cuentas con suscripción (`users`) e historial de evaluaciones.

**Lo que falta**, en orden de cercanía:

| Falta | Estado hoy | Esfuerzo estimado |
|---|---|---|
| Tareas como entidades con estado | Las tareas son strings dentro de un `Json` (`arep_validation_plan`); no hay tabla ni estado hecho/pendiente | Bajo-medio: modelo nuevo (p. ej. tareas ligadas a `assessments`), migración y sembrar desde el plan existente |
| Vista de seguimiento | El plan se muestra solo como sección de lectura en el reporte (`result-report.tsx`); en freemium se recorta a la semana 1 | Medio: pantalla de checklist por semana, marcar tareas |
| Recordatorios | No hay jobs programados (no se encontró cron ni scheduler en `src`); el correo solo se usa para billing y verificación | Medio: necesita scheduler + plantillas + preferencias de aviso |
| Logros / progreso | Nada | Bajo una vez que existe el estado de tareas |
| Registro de resultados reales | No se capturan resultados de las tareas (p. ej. «hablé con 10 clientes → 3 compraron») | Medio-alto: es lo que alimentaría un re-score y el real-vs-proyectado |
| Re-diagnóstico con datos nuevos | El scoring se calcula una vez | Alto; depende del punto anterior |

**Lectura.** La distancia al primer paso útil es corta: el plan de 4 semanas ya tiene la forma correcta. Lo mínimo que crea retención es convertirlo en checklist con estado y recordatorios semanales por correo. Lo costoso (registrar resultados y re-calcular el diagnóstico) puede esperar a ver si el checklist se usa.

> Nota de brecha: el backlog de Notion dejaba el «plan de validación de 30 días» en *Later (Pro Plan)* y el seguimiento de ejecución no aparece en ningún horizonte ni como no-objetivo explícito. Hoy el plan de 4 semanas ya se genera para todos los reportes, pero solo como lectura. Ver [[../decisiones/evolucion-del-producto#13. Retención y ejecución como eje de producto (2026-10-16)]].

## Qué habría que decidir (sin resolver aquí)
- Si el seguimiento es parte de la suscripción de $99 o de un nivel superior (hoy los niveles superiores están sin definir).
- Qué ve el freemium: hoy ve solo la semana 1 del plan; ¿puede marcar avance?
- Canal de recordatorios: correo primero (ya hay infraestructura); WhatsApp u otros después.
- Cómo se mide si funciona: métricas candidatas (no medidas hoy) — % de planes con al menos una tarea completada, usuarios activos en la semana 2 y 4, segunda evaluación.

## Ver también
[[prd]] · [[pricing-y-gtm]] · [[usuario-objetivo-y-jtbd]] · [[roadmap-y-backlog]] · [[../experiencia/reporte-de-resultado]] · [[../arquitectura/historial-de-evaluaciones]] · [[../competencia/competencia]]
