# Índice — obsidian-brain de Decida

Catálogo de todas las páginas. Empieza en [[wiki/overview]] si es tu primera vez aquí.

## Núcleo
| Página | Resumen |
|---|---|
| [[wiki/overview]] | Punto de entrada, mapa completo del cerebro |
| [[wiki/vision-mision-valores]] | Propósito, misión, visión, 5 valores |
| [[wiki/glosario]] | Términos clave (semáforo, red flag, unit economics, etc.) |

## Producto
| Página | Resumen |
|---|---|
| [[wiki/producto/prd]] | Qué es, para quién, non-goals, success en 3 niveles |
| [[wiki/producto/usuario-objetivo-y-jtbd]] | Perfil del usuario y jobs-to-be-done |
| [[wiki/producto/principios-de-producto]] | 5 principios operativos + compromiso de marca |
| [[wiki/producto/pricing-y-gtm]] | Precios hipótesis vs pago simulado real, canales de venta |
| [[wiki/producto/roadmap-y-backlog]] | Plan de 30-45 días vs línea de tiempo real (git) |
| [[wiki/producto/gaps-onboarding-vs-framework]] | Mapeo campo por campo: rubric/criterios de Notion vs. lo que el onboarding captura hoy — incluye bug crítico del score de riesgo |

## Framework (IP central)
| Página | Resumen |
|---|---|
| [[wiki/framework/dimensiones-de-viabilidad]] | Las 6 dimensiones y sus pesos — el corazón del producto |
| [[wiki/framework/scoring-engine]] | Reglas determinísticas + interpretación IA, red flags |
| [[wiki/framework/criterios-de-evaluacion]] | Rubric de juicio humano paralelo al motor automatizado |
| [[wiki/framework/prompts-de-ia]] | Arquitectura de prompts, guardrails, tono |

## Experiencia
| Página | Resumen |
|---|---|
| [[wiki/experiencia/flujo-de-onboarding]] | Flujo diseñado (12 pasos) vs implementado (8 pasos, 3 fases) |
| [[wiki/experiencia/reporte-de-resultado]] | Estructura de 13 secciones del reporte, estado real |
| [[wiki/experiencia/landing-y-copy]] | Mensaje, headlines, palabras a usar/evitar |

## Arquitectura
| Página | Resumen |
|---|---|
| [[wiki/arquitectura/stack-tecnico]] | Next.js 16, React 19, Prisma 7, Postgres, OpenAI |
| [[wiki/arquitectura/modelo-de-datos]] | 12 modelos Prisma, decisión relacional vs JSON simple |
| [[wiki/arquitectura/manejo-de-errores-y-reembolsos]] | Retry, logging, proceso de reembolso (DEC-10) |
| [[wiki/arquitectura/historial-de-evaluaciones]] | `/mis-evaluaciones` — non-goal original superado (en migración al módulo de cuentas) |
| [[wiki/arquitectura/modulo-de-usuarios-y-autenticacion]] | Cuentas email+contraseña, sesiones, email transaccional, integración con onboarding — Sprint 1, 2026-08-05 |
| [[wiki/arquitectura/dashboard-de-cuenta]] | Navbar + sidebar + rutas del panel `/cuenta` (route group, dropdown-menu nuevo) — 2026-08-05 |

## Marca
| Página | Resumen |
|---|---|
| [[wiki/marca/sistema-de-diseno]] | "Diagnóstico en Papel Blanco" — paleta, tipografía, reglas |

## Decisiones
| Página | Resumen |
|---|---|
| [[wiki/decisiones/evolucion-del-producto]] | Registro vivo de brechas Notion vs código (9 confirmadas) |
| [[wiki/decisiones/plan-lanzamiento-60-90-dias]] | Auditoría de código, puntos críticos, plan de 12 semanas y estrategia comercial |
| [[wiki/decisiones/alcance-campos-restantes-sprint-2]] | Qué campos del onboarding entran al MVP y cuáles se posponen (2026-08-28) |

## Reuniones
| Página | Resumen |
|---|---|
| [[wiki/reuniones/minutas]] | Índice — hoy documenta que no hay minutas de Decida aún |

## Raw sources (Notion, 18 páginas snapshot 2026-08-05)
`raw/notion/00-decida-hub.md` a `raw/notion/17-rubric-6-dimensiones.md` — ver `raw/notion/` para la lista completa. Snapshot fiel de todo el espacio "Decida" en Notion.

## Gaps activos (ver detalle en overview y evolucion-del-producto)
- Sin minutas de reunión de Decida.
- Sin evidencia de clientes/pagos reales en ninguna fuente.
- Estado del trabajo de landing en curso (archivos sin commitear al momento de esta ingesta) no capturado — pendiente de re-ingesta cuando se estabilice.
- Score de "Nivel de riesgo" roto en producción — arreglo agendado en Sprint 2, ver [[wiki/producto/gaps-onboarding-vs-framework]].
- `/mis-evaluaciones` sigue en el flujo passwordless roto y desconectado del sistema de cuentas nuevo — cualquier análisis iniciado ahí no queda ligado a `users`. Migrarlo es Sprint 2, ver [[wiki/arquitectura/modulo-de-usuarios-y-autenticacion]].
- Falta cuenta real de Resend (`RESEND_API_KEY`) para que el envío de correos funcione fuera de desarrollo.
