---
type: decision-log
tags: [decida, pricing, creditos, stripe, costos, especificacion]
updated: 2026-10-27
status: implementado en main (fases 1 a 4, commits 02fc586..dba140f); fase 5 (suscripción que otorga créditos) fuera de alcance por ahora
---

# Modelo de créditos (especificación para implementar)

Reemplaza la suscripción de $99 MXN/mes sin límite. Contexto previo: [[../producto/pricing-y-gtm]]. Costos de la investigación web: `docs/resultados-paso-2c.md` y `docs/resultados-paso-4.md`. El prompt para Cursor está en [[prompt-cursor-creditos]].

## 1. Decisiones cerradas
| Tema | Decisión |
|---|---|
| Unidad | 1 crédito = $59 MXN (compra individual) |
| Paquetes | 1 crédito $59 · 3 créditos $149 (~$50 c/u) · 10 créditos $399 (~$40 c/u) |
| Costo de un análisis | **Básico (sin investigación web) = 0.5 créditos** · **Con investigación de mercado = 1.5 créditos** |
| Caducidad | Los créditos **no caducan** |
| Costo de referencia (techo) | **$0.30 USD por reporte con investigación**, aunque las pruebas den ~$0.24. El margen sobrante cubre funciones de IA futuras sin subir precio |
| Costo del básico | ~$0.05–0.10 USD |
| Objetivo financiero | Que la plataforma se sostenga sola en gastos. Utilidad solo cuando los ingresos superen los gastos operativos (beta ≈ $2,500 MXN/mes, absorbidos por el dueño) |
| Suscripción | **Fase 2, opcional.** La beta no se ha desplegado: no hay suscriptores reales que migrar. Se deja el código de suscripción detrás de un flag, apagado |
| Regeneraciones | No incluidas. Solo el **reintento tras un fallo** es gratis (misma evaluación, misma llave de idempotencia) |

## 2. Economía unitaria (referencia, MXN; tipo de cambio ~18.5)
Comisión Stripe 3.6% + $3 sobre el cobro. Impuestos reservados: 50% de lo que queda.

| Concepto | 1 crédito ($59) |
|---|---|
| Después de Stripe | ~$54 |
| Costo de IA de 2 análisis básicos (1 crédito) | ~$4 MXN |
| Después de impuestos (50%) | ~$22–25 |
| Después de infraestructura y operación | ~0 (objetivo de la beta) |

Con investigación (1.5 créditos): ingreso $88.5 (compra suelta) o ~$60 (paquete de 10). Costo de IA techo $0.30 USD ≈ $5.6 MXN. Los precios por análisis salen así:

| Paquete | Básico (0.5) | Con investigación (1.5) |
|---|---|---|
| 1 crédito ($59) | $29.5 | $88.5 |
| 3 créditos ($149) | ~$25 | ~$75 |
| 10 créditos ($399) | ~$20 | ~$60 |

## 3. Modelo de datos (nuevo)
**Los créditos se guardan como entero en centésimos** (100 = 1 crédito; 0.5 = 50; 1.5 = 150) para no usar decimales.

### `credit_ledger` (fuente de verdad, solo se agregan filas)
| Campo | Tipo | Notas |
|---|---|---|
| `cled_id` | String cuid | PK |
| `cled_user_id` | String | FK users, onDelete Restrict |
| `cled_type` | enum `credit_ledger_type` | `purchase`, `welcome_bonus`, `subscription_grant`, `spend`, `refund`, `adjustment` |
| `cled_amount` | Int | con signo (+ compra/reembolso, − gasto), en centésimos |
| `cled_balance_after` | Int | saldo tras el movimiento (≥ 0) |
| `cled_asmt_id` | String? | evaluación asociada (spend/refund) |
| `cled_payment_id` | String? | FK payments (purchase) |
| `cled_idempotency_key` | String | **UNIQUE**: `purchase:{stripeSessionId}`, `spend:{asmtId}`, `refund:{asmtId}:{motivo}` |
| `cled_metadata` | Json? | paquete, nivel, motivo |
| `cled_created_at` | DateTime | default now |

Índices: `(cled_user_id, cled_created_at)`, UNIQUE `cled_idempotency_key`.

### `users`
- `user_credits_balance Int @default(0)`: caché del saldo. **Invariante:** igual a la suma del libro mayor. Se actualiza en la misma transacción que cada movimiento.

### `assessments`
- `asmt_research_enabled Boolean @default(true)`: el interruptor «Investigación de mercado» elegido por la persona.
- `asmt_credit_cost Int?`: costo cobrado (centésimos), para auditoría.
- `asmt_credits_charged_at DateTime?`: cuándo se cobró. Una evaluación se cobra **una sola vez**.

### `payments`
- Ya existe. Cada compra de créditos crea una fila (`paym_provider = "stripe"`, `paym_provider_session_id`, estado `paid`) y el movimiento `purchase` apunta a ella.

### Configuración (en código, no en tabla)
`src/lib/credits/`: `packages.ts` (id, créditos, precio MXN, Stripe price id desde env), `costs.ts` (`BASIC=50`, `RESEARCH=150`), `ledger.ts` (operaciones atómicas).

## 4. Flujos
1. **Compra:** pantalla de paquetes → Stripe Checkout `mode: "payment"` con metadata `{user_id, package_id}` → webhook `checkout.session.completed` (y `async_payment_succeeded`) → en una transacción: marcar `payments` pagado + `purchase` en el libro + sumar saldo. **Idempotente** por `purchase:{sessionId}`: reintentos del webhook no duplican.
2. **Cobro de un análisis:** al generar el reporte, en una sola transacción: verificar saldo ≥ costo (`UPDATE users SET balance = balance − x WHERE id = … AND balance ≥ x`, sin saldo negativo), insertar `spend` con clave `spend:{asmtId}`, guardar `asmt_credit_cost` y `asmt_credits_charged_at`. Si ya estaba cobrada, no cobra otra vez (reintentos gratis).
3. **Sin saldo:** redirigir a la pantalla de paquetes sin perder lo capturado.
4. **Fallo del reporte (estado failed):** `refund` por el total, clave `refund:{asmtId}:failed`.
5. **Investigación degradada** (`arep_research.status` = `failed`/`skipped` con el interruptor encendido): reembolsar la diferencia (1.00 crédito = 100) con clave `refund:{asmtId}:research`.
6. **Interruptor «Investigación de mercado»:** en el onboarding (paso del producto/evaluación), activado por defecto. Muestra el costo (0.5 / 1.5 créditos) y, al apagarlo, qué se pierde: «sin fuentes, las cifras de mercado son supuestos tuyos». Alimenta `asmt_research_enabled`, que el pipeline lee **por evaluación** (hoy la investigación es global con `REPORT_RESEARCH_ENABLED`; el flag global sigue como interruptor maestro).
7. **Reembolso en Stripe** (`charge.refunded`): registrar `adjustment` negativo hasta el saldo disponible (nunca negativo) y avisar por log/Sentry para revisión manual.
8. **Bienvenida / gratis:** se conserva la evaluación gratuita actual (vista previa con tarjetas bloqueadas). **Punto de diseño a confirmar por Cursor antes de codificar:** cómo convive el gate freemium actual (`src/lib/subscription/limits.ts`, `access.ts`, `hasFullAccess`) con créditos. Propuesta por defecto: el reporte completo se desbloquea cuando la evaluación está cobrada (`asmt_credits_charged_at` no nulo); la vista previa gratuita se genera **sin investigación web** para no gastar $0.24 por registro.

## 5. Suscripción (código existente)
- Beta sin desplegar → sin suscriptores. No borrar el código: ponerlo detrás de `SUBSCRIPTIONS_ENABLED` (por defecto `false`), ocultar en landing y cuenta. `hasFullAccess` deja de decidir el acceso; lo decide el cobro por créditos.
- Fase 2 opcional: plan mensual que otorga créditos por ciclo (`subscription_grant` en `invoice.paid`).

## 6. Interfaz
- Cuenta: saldo visible, historial de movimientos, botón «Comprar créditos».
- Pantalla de paquetes (3 tarjetas, el de 10 destacado por mejor precio por análisis).
- Landing / precios: reemplazar «$99/mes» por los paquetes; actualizar FAQ, términos, privacidad y política de reembolsos (los créditos no caducan; reembolsos por fallo del sistema se devuelven en créditos).
- Reporte: mostrar si se usó investigación (ya existe «Fuentes y límites»).

## 7. Cuidados
- **Atomicidad y concurrencia:** dos pestañas no deben gastar el mismo crédito (transacción + condición `balance ≥ costo` + clave única).
- **Webhooks:** verificar firma, idempotencia, orden no garantizado.
- **No tocar `src/lib/scoring`.**
- Moneda MXN; los centavos de Stripe se convierten a pesos con cuidado (Decimal en `payments`).
- Stripe **modo prueba** para desarrollar (tarjeta 4242…); `.env.example` actualizado (`STRIPE_PRICE_CREDITS_1/3/10`, `SUBSCRIPTIONS_ENABLED`).
- Pruebas: libro (compra, gasto, reembolso, idempotencia, saldo insuficiente, concurrencia), webhook (duplicado, firma inválida), flujo de generación (cobra una vez, reembolsa en fallo, diferencia si la investigación se degrada), UI (interruptor, saldo, sin saldo).
- Medir: eventos de PostHog (`credits_purchased`, `credits_spent`, `credits_insufficient`, `research_toggled`) para ver conversión y qué nivel eligen.
- Migraciones con `prisma migrate` (la base local tiene desfase: usar `db:push` en desarrollo, ver AGENTS.md).

## 8. Fases sugeridas (implementadas 2026-10-22)
1. ✅ **Fase 1 (`02fc586`):** Libro de créditos + tablas (`credit_ledger`, `users.user_credits_balance`, `assessments.asmt_research_enabled`/`asmt_credit_cost`/`asmt_credits_charged_at`, migración `20261023000000_credit_ledger`) + `src/lib/credits/{packages,costs,ledger}.ts` + pruebas del libro (compra, gasto, reembolso, idempotencia, saldo insuficiente, concurrencia con `SELECT ... FOR UPDATE`).
2. ✅ **Fase 2 (`567c4a1`):** Compra con Stripe Checkout (`mode: "payment"`) + modo simulado sin `STRIPE_SECRET_KEY` + webhook (`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`) + retorno robusto + saldo e historial en `/cuenta/creditos` + pantalla de paquetes `/cuenta/creditos/paquetes`.
3. ✅ **Fase 3 (`a6bb2dd`):** Cobro al generar (`generateReportWithCredits` / `planAndChargeForReport`) + interruptor «Investigación de mercado» en `/analizar/evaluacion` + reembolsos por fallo total (`refund:{asmtId}:failed`) y por investigación degradada (`refund:{asmtId}:research`, 1.0 crédito) + desbloqueo de preview con 0.5 (`unlockReportBasic`, sin regenerar) o 1.5 (`unlockReportWithResearch`, regenera con investigación).
4. ✅ **Fase 4 (`dba140f`):** Landing (`pricing-section.tsx`, `landing-content.ts`), textos legales (`/terminos`, `/privacidad`), retiro visual de la suscripción detrás de `SUBSCRIPTIONS_ENABLED="false"` (`src/lib/subscription/flag.ts`), eventos de PostHog (`credits_purchased`, `credits_spent`, `credits_insufficient`, `research_toggled`), `.env.example` actualizado.
5. ⏸️ **(Opcional, fuera por ahora):** Suscripción que otorga créditos (`subscription_grant`).

## 9. Decisiones de implementación cerradas y puntos abiertos
- ✅ **Gate freemium definitivo (punto 8 de §4):** el acceso completo ya no mira `hasFullAccess(user)` sino `hasReportAccess(assessment)` (`asmt_credits_charged_at != null` en `src/lib/credits/access.ts`). La primera evaluación de una cuenta que no ha sido cobrada entra en modo `free_preview` (`isFreePreviewAssessment` en `src/lib/credits/charge.ts`): se genera con `forceNoResearch: true` (sin gastar $0.24 USD de búsqueda web) y se muestra con secciones bloqueadas en `result-report.tsx`. Desde el reporte recortado se ofrecen dos botones (`UnlockReportButtons`): **Desbloquear (0.5 créditos)** (`unlockReportBasic`, cobra 50 centésimos y quita el candado sin regenerar) o **Con investigación (1.5 créditos)** (`unlockReportWithResearch`, cobra 150 —o la diferencia de 100 si ya había pagado 50— y regenera con investigación web). Para iniciar una segunda evaluación (`decideAssessmentStart` en `src/lib/subscription/limits.ts`), se exige `creditsBalance >= 50` (0.5 créditos); si no alcanza, redirige a `/cuenta/creditos/paquetes?limite=1`.
- ⚠️ **Detalle visual menor en landing (`pricing-section.tsx`):** la tarjeta de 1 crédito calcula `Math.floor(100 / 150) = 0` y muestra «O 0 con investigación (1.5 c/u)» y «1 créditos». Conviene ajustar el copy para el paquete de 1 crédito.
- ⚠️ **Specs E2E de Playwright (`e2e/subscription-flow.spec.ts`, `e2e/multi-idea-history.spec.ts`):** siguen esperando las rutas y textos del modelo de suscripción (`/cuenta/suscripcion?limite=1`, «Desbloquear con la suscripción», `subscribe-submit`); hay que actualizarlos al flujo de créditos o correrlos con `SUBSCRIPTIONS_ENABLED=true`.
- Pendiente de negocio: confirmar precio real de `web_search` en factura de OpenAI y si «reintento tras fallo» requiere tope numérico en base de datos.
