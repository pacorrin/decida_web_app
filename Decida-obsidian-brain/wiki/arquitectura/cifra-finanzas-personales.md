---
type: arquitectura
tags: [decida, cifra, finanzas, prisma, cuenta]
updated: 2026-10-30
status: implementada en dev (v1, rediseño de deudas); sin pasar a main
---

# Cifra v1 — finanzas personales

Primera herramienta nueva de la plataforma ([[../producto/nuevas-features#2. Cifra (finanzas personales)]], metodología en [[../marca/narrativa-del-orden-decida]]). Esta versión es mínima y **no usa IA**. Código: `src/lib/cifra/`, `src/app/cuenta/(dashboard)/cifra/`, `src/components/cifra/`.

## Qué hace
1. **Mis cuentas** (`/cuenta/cifra/cuentas`): saldos (efectivo, banco, ahorro), deudas (tarjeta, préstamo, automóvil, vivienda u otra) y gastos fijos.
2. **Pagos** (`/cuenta/cifra/pagos`): reporte «¿Qué tengo que pagar?» de un periodo que elige la persona (7, 15, 30, 60, 90 días o desde/hasta, máximo 366 días). Vencidos primero; muestra total por pagar, saldo en cuentas y cuánto sobra o falta. Los pagos recurrentes se proyectan; los de monto variable salen «por confirmar».
3. **Movimientos** (`/cuenta/cifra/movimientos`): ingresos y egresos con categoría, monto, fecha y nota; por mes.
4. **Resumen** (`/cuenta/cifra`): ingresos, egresos, balance, deuda total, saldo en cuentas y próximos pagos de 30 días con «Editar y pagar».

## Modelo de pagos (rediseño de deudas)
- Se captura el **próximo pago** (monto y fecha real), no «saldo y pago mensual»: en tarjetas el monto cambia cada mes. Casilla «El monto cambia cada mes»: tras pagar, el siguiente queda por confirmar hasta que se captura el estado de cuenta («Capturar monto»).
- Tarjetas capturan **corte y fecha límite de pago**, y límite de crédito (uso del límite en %).
- **Pago recurrente:** casilla. La fecha es real (`next_due_on`) más un día ancla y la opción «último día del mes»; al avanzar se ajusta a febrero (28/29) y vuelve al ancla (31 → 28 → 31). Un pago del 9 de nov no está vencido el 30 de oct.
- **Pagos restantes no se piden:** se estiman (`src/lib/cifra/payoff.ts`). Con **vigencia** (fecha de fin, para préstamo, auto y vivienda) se cuentan los pagos hasta esa fecha; si no, se usa el promedio de los últimos 6 pagos hechos, o el pago próximo o mínimo, con la tasa anual. Siempre se muestra como **estimado**; si el pago no cubre los intereses, indica que no se liquidaría.
- Campos numéricos solo aceptan dígitos; los de dinero se formatean (`$1,234.50`) y la tasa con %.
- Al marcar pagado (monto y fecha), el egreso guarda el periodo del vencimiento pagado y los valores previos (`ctrx_prev_due_on`, `ctrx_prev_cut_on`, `ctrx_prev_amount_cents`, `ctrx_applied_to_debt_cents`); borrar el pago restaura el saldo y, si fue el último, las fechas.

## Decisiones (2026-10-30, del usuario)
- Alcance con **saldos incluidos**; **«Editar y pagar»** crea el egreso (nada se genera solo).
- **Requiere plan activo** (mínimo Explora, `hasFullAccess`). Sin plan se ve la pantalla de planes; los datos se conservan y se pueden borrar.
- **Categorías fijas** (`src/lib/cifra/constants.ts`); **sin límites** por usuario (no hay costo de IA).

## Datos
Tablas `cifra_accounts`, `cifra_debts`, `cifra_fixed_expenses`, `cifra_transactions`; enums `cifra_flow`, `cifra_account_kind`, `cifra_debt_kind`. Migración `20261101000000_cifra` (editada, aún no está en `main`).
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
