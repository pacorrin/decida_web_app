---
type: arquitectura
tags: [decida, cifra, finanzas, prisma, cuenta]
updated: 2026-10-30
status: implementada en dev (v1); sin pasar a main
---

# Cifra v1 — finanzas personales

Primera herramienta nueva de la plataforma ([[../producto/nuevas-features#2. Cifra (finanzas personales)]], metodología en [[../marca/narrativa-del-orden-decida]]). Esta versión es mínima y **no usa IA**. Código: `src/lib/cifra/`, `src/app/cuenta/(dashboard)/cifra/`, `src/components/cifra/`.

## Qué hace
1. **Mis cuentas** (`/cuenta/cifra/cuentas`): saldos (efectivo, banco, ahorro), deudas (tarjeta, préstamo; saldo, pago mensual, día de pago y de corte, tasa y límite opcionales) y gastos fijos (nombre, categoría, monto, día de pago).
2. **Movimientos** (`/cuenta/cifra/movimientos`): registro de ingresos y egresos con categoría, monto, fecha y nota; navegación por mes y borrado.
3. **Resumen** (`/cuenta/cifra`): ingresos, egresos y balance del mes, deuda total, saldo en cuentas y los **pagos pendientes de este mes** con el botón «Marcar como pagado».

## Decisiones (2026-10-30, del usuario)
- Alcance con **saldos incluidos**.
- **«Marcar como pagado»** crea el egreso; el usuario siempre confirma, nada se genera solo.
- **Requiere un plan activo** (mínimo Explora), con `hasFullAccess` de `src/lib/subscription/access.ts`. Sin plan se ve la pantalla de planes; **los datos se conservan** y se pueden borrar.
- **Categorías fijas** (`src/lib/cifra/constants.ts`).
- **Sin límites** por usuario: no hay costo de IA que proteger.

## Datos
Tablas `cifra_accounts` (`cacc_`), `cifra_debts` (`cdebt_`), `cifra_fixed_expenses` (`cfix_`) y `cifra_transactions` (`ctrx_`); enums `cifra_flow`, `cifra_account_kind`, `cifra_debt_kind`. Migración `20261101000000_cifra`.
- **Importes en centavos** (`Int`, MXN), con tope de 20 millones por importe. Corte y pago son **día del mes** (si el mes es más corto, cae el último día).
- Categoría guardada como texto (código) y validada con zod; cambiar la lista no necesita migración.
- `cifra_transactions`: la restricción única `(debt_id, period)` y `(fixed_expense_id, period)` impide marcar dos veces un pago en el mismo mes. `ctrx_applied_to_debt_cents` guarda cuánto bajó el saldo, para restaurarlo si se borra el movimiento.
- Todas las tablas cuelgan de `users` con `onDelete: Cascade`; deudas y gastos fijos borrados dejan sus movimientos (`SetNull`).
- «Hoy» se calcula en la hora de la Ciudad de México (`todayInMexico`), no la del servidor.

## Seguridad y privacidad
- Cada lectura y escritura filtra por el usuario de la sesión; editar o borrar algo ajeno no hace nada. Probado en `src/app/cuenta/(dashboard)/cifra/__tests__/actions.test.ts`.
- «Borrar mis datos de Cifra» funciona siempre, aunque no haya plan (no existe todavía el borrado de cuenta).
- **Analítica sin montos:** eventos `cifra_item_created`, `cifra_transaction_logged`, `cifra_payment_marked`, `cifra_data_deleted`, solo con tipo y categoría. Ver [[analitica-y-eventos]].
- La política de privacidad (`src/app/privacidad`) lo declara: datos manuales, sin conexión a bancos, no se usan en los análisis de ideas ni se comparten.

## Fuera de la v1 (pendiente)
Consentimiento y uso de estos datos en el análisis de ideas, importar de bancos o CSV, pagos recurrentes automáticos, categorías propias, otras monedas, exportar datos, borrado de cuenta, y definir si Cifra tendrá paquetes propios. **Revisión legal** de datos financieros personales antes de publicar a `main`.

## Verificación hecha (local, 2026-10-30)
Alta de saldo, deuda y gasto fijo; errores de validación por campo; marcar pagado (egreso creado y deuda de $5,000 a $4,500); borrar ese pago restaura la deuda; ingreso y egreso; vista móvil; usuario sin plan ve solo la pantalla de planes. Se limpiaron los usuarios de prueba.

## Ver también
[[modelo-de-datos]] · [[dashboard-de-cuenta]] · [[analitica-y-eventos]] · [[seguridad-y-proteccion-de-costos]] · [[../producto/nuevas-features]] · [[../decisiones/modelo-de-creditos-hibrido]]
