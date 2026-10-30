---
type: arquitectura
tags: [decida, cifra, finanzas, prisma, cuenta]
updated: 2026-10-30
status: implementada en dev (v1, captura inteligente con voz, página pública); sin pasar a main
---

# Cifra v1 — finanzas personales

Primera herramienta nueva de la plataforma ([[../producto/nuevas-features#2. Cifra (finanzas personales)]], metodología en [[../marca/narrativa-del-orden-decida]]). Esta versión es mínima y **no usa IA**. Código: `src/lib/cifra/`, `src/app/cuenta/(dashboard)/cifra/`, `src/components/cifra/`.

## Qué hace
1. **Mis cuentas** (`/cuenta/cifra/cuentas`): saldos (efectivo, banco, ahorro), deudas (tarjeta, préstamo, automóvil, vivienda u otra) y gastos fijos.
2. **Pagos** (`/cuenta/cifra/pagos`): reporte «¿Qué tengo que pagar?» de un periodo que elige la persona (7, 15, 30, 60, 90 días o desde/hasta, máximo 366 días). Vencidos primero; muestra total por pagar, saldo en cuentas y cuánto sobra o falta. Los pagos recurrentes se proyectan; los de monto variable salen «por confirmar».
3. **Movimientos** (`/cuenta/cifra/movimientos`): ingresos y egresos con categoría, monto, fecha y nota; por mes.
4. **Resumen** (`/cuenta/cifra`): ingresos, egresos, balance, deuda total y saldo en cuentas; «De dónde viene» (ingresos y egresos del mes por categoría, con porcentaje); próximos pagos de 30 días con «Editar y pagar»; y los últimos 6 movimientos del mes.

## Modelo de pagos (rediseño de deudas)
- Se captura el **próximo pago** (monto y fecha real), no «saldo y pago mensual»: en tarjetas el monto cambia cada mes. Casilla «El monto cambia cada mes»: tras pagar, el siguiente queda por confirmar hasta que se captura el estado de cuenta («Capturar monto»).
- Tarjetas capturan **corte y fecha límite de pago**, y límite de crédito (uso del límite en %).
- **Pago recurrente:** casilla. La fecha es real (`next_due_on`) más un día ancla y la opción «último día del mes»; al avanzar se ajusta a febrero (28/29) y vuelve al ancla (31 → 28 → 31). Un pago del 9 de nov no está vencido el 30 de oct.
- **Pagos restantes no se piden:** se estiman (`src/lib/cifra/payoff.ts`). Con **vigencia** (fecha de fin, para préstamo, auto y vivienda) se cuentan los pagos hasta esa fecha; si no, se usa el promedio de los últimos 6 pagos hechos, o el pago próximo o mínimo, con la tasa anual. Siempre se muestra como **estimado**; si el pago no cubre los intereses, indica que no se liquidaría.
- **Observaciones:** saldos, deudas y gastos fijos tienen un campo de texto libre opcional (máx. 500 caracteres; columnas `cacc_notes`, `cdebt_notes`, `cfix_notes`) para anotar por qué existe ese registro. Se muestra en la tarjeta. Es dato personal del usuario: no se envía a analítica.
- Campos numéricos solo aceptan dígitos; los de dinero se formatean (`$1,234.50`) y la tasa con %.
- Al marcar pagado (monto y fecha), el egreso guarda el periodo del vencimiento pagado y los valores previos (`ctrx_prev_due_on`, `ctrx_prev_cut_on`, `ctrx_prev_amount_cents`, `ctrx_applied_to_debt_cents`); borrar el pago restaura el saldo y, si fue el último, las fechas.

## Captura inteligente (IA, 2026-10-30)
Botón arriba a la derecha de Cifra. Diálogo de dos pasos: (1) fotos (cámara o galería, hasta 3, reducidas en el teléfono a 1280 px) y un texto opcional que también puede dictarse con el teclado; (2) la IA devuelve una **propuesta** de un solo movimiento (tipo, monto, categoría de la lista fija, fecha, nota) que se precarga en un formulario y **solo se guarda al confirmar**, con el guardado de siempre.
- **Cobro:** `CREDIT_COST_CIFRA_CAPTURE = 3` créditos por captura (`src/lib/credits/costs.ts`), igual con texto, dictado, una foto o varias, para cubrir siempre el costo de IA. Se cobra al procesar (el costo ya se generó) y se **devuelve si la lectura falla**. Registrar a mano es gratis. Costo estimado de IA ~US$0.002 a 0.01 por captura (≈ MX$0.04 a 0.19) frente a ~MX$0.57 a 0.81 netos por 3 créditos según el plan.
- **Modelo:** `OPENAI_MODEL_CAPTURE` (por defecto `gpt-4.1-mini`, con visión). La salida se valida (`src/lib/cifra/capture/result.ts`): categoría solo de la lista, fecha no futura, monto positivo; lo dudoso se avisa y no se inventa. El contenido de fotos y texto se trata como datos, no como instrucciones.
- **Privacidad:** las fotos no se guardan, solo viajan en memoria a OpenAI. Consentimiento explícito la primera vez (`user_cifra_ai_consent_at`), texto en el aviso de privacidad, analítica sin montos, textos ni imágenes.
- **Nota de voz:** botón «Grabar voz» en el diálogo (MediaRecorder, máx. 60 s, con cronómetro). El audio se envía a `transcribeCapture`, se transcribe con `OPENAI_MODEL_TRANSCRIBE` (`gpt-4o-mini-transcribe`) y el texto se agrega al campo de observaciones (máx. 500), donde se puede corregir antes de procesar. Voz, fotos y texto de una misma captura comparten la clave `cifra-capture:<usuario>:<captureId>`: se cobran 3 créditos una sola vez; si la transcripción sale vacía o falla se devuelven, y una captura ya devuelta no se puede reutilizar gratis. El audio no se guarda.
- **Pendiente:** botón flotante en móvil, aviso de posible duplicado, piloto con 30 tickets reales de tiendas mexicanas para medir exactitud y costo real (el costo se ve en PostHog LLM Analytics), una captura que genere varios movimientos, y definir si se agrega un tope por usuario además del saldo de créditos.

## Página pública (2026-10-30)
`/cifra` (`src/app/cifra/page.tsx`, componentes en `src/components/cifra-landing/`, texto en `content.ts`). Arco SCAR: situación y complicación (hero y «Llevar tus finanzas no debería ser un segundo trabajo»), acción (captura inteligente como sección central, Mis cuentas, Pagos, Resumen) y resolución (privacidad, precio, FAQ, CTA). Las maquetas son ilustrativas y se anuncian como tal; el costo de la captura y el precio salen de `costs.ts` y `plans.ts`, no de texto copiado. Entra al sitemap, al menú público (Inicio · Cifra) y al pie. CTA a `/cuenta/registro`. Evento `cifra_landing_viewed`.

**Rediseño (2026-10-30):** para que no se confunda con el inicio de Decida, `/cifra` ya no usa `SiteHeader` ni `SiteFooter`: tiene su propia barra («Decida / Cifra beta»), hero partido en verde profundo con una demo viva (`ticket-demo.tsx`: foto, voz o texto → movimiento propuesto), tablero de pagos con filas desplegables, selector de plan (`pricing-selector.tsx`), FAQ en mosaicos y pie propio con la palabra «Cifra» grande. Entradas de scroll solo con transform (`.cifra-in`, `.cifra-line` en `globals.css`). Sin fotos reales: la imagen de la página es su propia interfaz (`data-ui`). Pendiente: contraste del texto blanco sobre el botón coral (2.7:1, es el estilo de CTA de la marca).

## Tarjetas de crédito (2026-10-30)
Una tarjeta es una entidad (`cifra_cards`: solo el nombre, sin dígitos de la tarjeta, igual que no se guardan las fotos de la captura) que **solo guarda identidad**; saldo, límite, corte y fecha de pago siguen en su deuda (`cifra_debts.cdebt_card_id`, única). Toda tarjeta tiene su deuda `credit_card`; se crea al capturar la deuda o al vuelo desde un egreso (deuda en cero «Por completar», sin fecha de pago, que se completa con «Completar»).
- **Compra con tarjeta** (`ctrx_card_id`): es un gasto en su fecha y categoría y **sube el saldo** de la tarjeta; borrarla lo baja.
- **Pago de tarjeta = transferencia** (`ctrx_is_transfer`): no cuenta como egreso. `splitCardPayment` (`src/lib/cifra/card-payment.ts`) reparte el pago: lo que baja el saldo (nunca más que el saldo conocido), los intereses que capturó la persona (campo opcional, gasto «Intereses y comisiones») y lo que excede el saldo (gasto «Compras sin detalle»). Las filas derivadas llevan `ctrx_payment_id` y se borran en cascada con el pago; en Movimientos se anidan bajo él.
- **Ajustar el saldo al alza** (editar deuda o «Capturar monto») registra la diferencia como «Compras sin detalle»; a la baja solo cambia el saldo. El desvío del saldo es responsabilidad de la persona.
- Las tarjetas siguen su ciclo al llegar a cero. El Resumen muestra «Pendiente en tarjetas».
- Las categorías `intereses` y `sin_detalle` son del sistema: la IA de captura no las propone (`SYSTEM_EXPENSE_CATEGORIES`).
- Migración `20261102000000_cifra_cards` (convierte cada deuda de tarjeta existente en tarjeta con el mismo id). **Debe aplicarse en producción antes de pasar a `main`.**
- Verificado en navegador con el ejemplo 1,850 + 1,200 + 600 → pago 1,950 con 100 de intereses: saldo 1,800, egresos 1,900, borrar el pago restaura saldo y fecha, alta de tarjeta al vuelo. El caso parcial (saldo 500, pago 5,000) y la vista móvil se cubren con pruebas unitarias.

## Decisiones (2026-10-30, del usuario)
- Alcance con **saldos incluidos**; **«Editar y pagar»** crea el egreso (nada se genera solo).
- **Requiere plan activo** (mínimo Explora, `hasFullAccess`). Sin plan se ve la pantalla de planes; los datos se conservan y se pueden borrar.
- **Categorías fijas** (`src/lib/cifra/constants.ts`); **sin límites** por usuario (no hay costo de IA).

## Datos
Tablas `cifra_accounts`, `cifra_cards`, `cifra_debts`, `cifra_fixed_expenses`, `cifra_transactions`; enums `cifra_flow`, `cifra_account_kind`, `cifra_debt_kind`. Migración `20261101000000_cifra` (editada, aún no está en `main`).
- **Importes en centavos** (`Int`, MXN), tope de 20 millones. Fechas `@db.Date`; «hoy» en hora de Ciudad de México (`todayInMexico`).
- Única `(debt_id, period)` y `(fixed_expense_id, period)`: un vencimiento no se marca pagado dos veces.
- Tablas cuelgan de `users` con cascada; deudas y gastos borrados dejan sus movimientos (`SetNull`).

## Seguridad y privacidad
- Todo filtra por el usuario de la sesión (`src/app/cuenta/(dashboard)/cifra/__tests__/actions.test.ts`).
- «Borrar mis datos de Cifra» siempre disponible.
- Analítica sin montos ni nombres: `cifra_item_created`, `cifra_transaction_logged`, `cifra_payment_marked`, `cifra_data_deleted`. Ver [[analitica-y-eventos]].
- La política de privacidad lo declara.

## Fuera de la v1 (pendiente)
Consentimiento y uso en el análisis de ideas, importar de bancos o CSV, categorías propias, otras monedas, exportar datos, borrado de cuenta, paquetes propios. **Revisión legal** antes de pasar a `main`. Al desplegar, la migración debe aplicarse en producción.

## Verificación hecha (local)
Pruebas unitarias (fechas, dinero, pagos próximos, estimaciones, acciones) y navegador: formato de monto y filtro de letras, tasa, alta de tarjeta con corte 20 oct y límite 9 nov (aparece como próximo, «por confirmar», no vencido) y reporte. No hay pruebas e2e; marcar pagado y vista móvil del rediseño se cubren con pruebas unitarias, no se repitieron en navegador.

## Ver también
[[modelo-de-datos]] · [[dashboard-de-cuenta]] · [[analitica-y-eventos]] · [[seguridad-y-proteccion-de-costos]] · [[../producto/nuevas-features]] · [[../decisiones/modelo-de-creditos-hibrido]]
