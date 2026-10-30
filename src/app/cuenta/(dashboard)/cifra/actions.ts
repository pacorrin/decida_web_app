"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CIFRA_ACCESS_MESSAGES, getCifraAccess } from "@/lib/cifra/access";
import { CIFRA_PATH, DEBT_PAYMENT_CATEGORY } from "@/lib/cifra/constants";
import {
  firstOccurrenceAfter,
  fromDateOnly,
  nextOccurrence,
  periodOf,
  resolveRecurrence,
  sameDate,
  todayInMexico,
  toDateOnly,
} from "@/lib/cifra/dates";
import {
  accountSchema,
  debtSchema,
  fixedExpenseSchema,
  idSchema,
  paySchema,
  pendingAmountSchema,
  transactionSchema,
} from "@/lib/cifra/schemas";
import { amountAppliedToDebt } from "@/lib/cifra/summary";
import { formDataToValues, parseFieldErrors } from "@/lib/onboarding/schemas";

export type CifraActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const SESSION_EXPIRED = CIFRA_ACCESS_MESSAGES.no_session;
const GENERIC_ERROR = "No pudimos guardar los cambios. Intenta de nuevo.";

function refresh() {
  revalidatePath(CIFRA_PATH, "layout");
}

function invalid(error: z.ZodError): CifraActionState {
  return {
    success: false,
    message: "Revisa los campos marcados.",
    fieldErrors: parseFieldErrors(error),
  };
}

function optionalId(formData: FormData): string | null {
  const raw = formData.get("id");
  return typeof raw === "string" && raw !== "" ? raw : null;
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "P2002";
}

/** Alta o edición; «id» vacío crea, con valor edita (solo si es del usuario). */
export async function saveAccount(formData: FormData): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };

  const parsed = accountSchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const id = optionalId(formData);

  const data = {
    cacc_name: d.name,
    cacc_notes: d.notes || null,
    cacc_kind: d.kind as "cash" | "bank" | "savings" | "other",
    cacc_balance_cents: d.balance,
  };
  if (id) {
    const res = await prisma.cifra_accounts.updateMany({
      where: { cacc_id: id, cacc_user_id: access.userId },
      data,
    });
    if (res.count === 0) return { success: false, message: GENERIC_ERROR };
  } else {
    await prisma.cifra_accounts.create({ data: { ...data, cacc_user_id: access.userId } });
    await trackServer(access.userId, ANALYTICS_EVENTS.cifraItemCreated, { type: "account", kind: d.kind });
  }
  refresh();
  return { success: true };
}

export async function saveDebt(formData: FormData): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };

  const parsed = debtSchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const id = optionalId(formData);

  const due = resolveRecurrence(d.nextDue, d.dueLastDay);
  const cut = d.nextCut ? resolveRecurrence(d.nextCut, d.cutLastDay) : null;

  const data = {
    cdebt_name: d.name,
    cdebt_notes: d.notes || null,
    cdebt_kind: d.kind as "credit_card" | "loan" | "vehicle" | "housing" | "other",
    cdebt_balance_cents: d.balance,
    cdebt_credit_limit_cents: d.creditLimit,
    cdebt_annual_rate_pct: d.annualRate,
    cdebt_next_due_on: toDateOnly(due.nextOn),
    cdebt_due_day: due.anchor,
    cdebt_due_last_day: due.lastDay,
    cdebt_next_cut_on: cut ? toDateOnly(cut.nextOn) : null,
    cdebt_cut_day: cut ? cut.anchor : null,
    cdebt_cut_last_day: cut ? cut.lastDay : false,
    cdebt_next_payment_cents: d.nextPayment,
    cdebt_min_payment_cents: d.minPayment,
    cdebt_variable_payment: d.variablePayment,
    cdebt_recurring: d.recurring,
    cdebt_ends_on: d.endsOn ? toDateOnly(d.endsOn) : null,
    cdebt_paid_off: d.balance === 0,
  };
  if (id) {
    const res = await prisma.cifra_debts.updateMany({
      where: { cdebt_id: id, cdebt_user_id: access.userId },
      data,
    });
    if (res.count === 0) return { success: false, message: GENERIC_ERROR };
  } else {
    await prisma.cifra_debts.create({ data: { ...data, cdebt_user_id: access.userId } });
    await trackServer(access.userId, ANALYTICS_EVENTS.cifraItemCreated, { type: "debt", kind: d.kind });
  }
  refresh();
  return { success: true };
}

export async function saveFixedExpense(formData: FormData): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };

  const parsed = fixedExpenseSchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const id = optionalId(formData);

  const due = resolveRecurrence(d.nextDue, d.dueLastDay);
  const data = {
    cfix_name: d.name,
    cfix_notes: d.notes || null,
    cfix_category: d.category,
    cfix_amount_cents: d.amount,
    cfix_variable: d.variable,
    cfix_next_due_on: toDateOnly(due.nextOn),
    cfix_due_day: due.anchor,
    cfix_due_last_day: due.lastDay,
    cfix_recurring: d.recurring,
    cfix_active: true,
  };
  if (id) {
    const res = await prisma.cifra_fixed_expenses.updateMany({
      where: { cfix_id: id, cfix_user_id: access.userId },
      data,
    });
    if (res.count === 0) return { success: false, message: GENERIC_ERROR };
  } else {
    await prisma.cifra_fixed_expenses.create({ data: { ...data, cfix_user_id: access.userId } });
    await trackServer(access.userId, ANALYTICS_EVENTS.cifraItemCreated, { type: "fixed_expense", category: d.category });
  }
  refresh();
  return { success: true };
}

export async function addTransaction(formData: FormData): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };

  const parsed = transactionSchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;

  await prisma.cifra_transactions.create({
    data: {
      ctrx_user_id: access.userId,
      ctrx_flow: d.flow,
      ctrx_category: d.category,
      ctrx_amount_cents: d.amount,
      ctrx_occurred_on: toDateOnly(d.date),
      ctrx_description: d.description || null,
    },
  });
  await trackServer(access.userId, ANALYTICS_EVENTS.cifraTransactionLogged, {
    flow: d.flow,
    category: d.category,
  });
  refresh();
  return { success: true };
}

/**
 * Borra solo lo del usuario. Si el movimiento vino de un pago marcado, deshace el
 * pago: devuelve el saldo de la deuda y regresa la fecha y el monto del pago que
 * se había recorrido (solo si ese era el último pago marcado).
 */
export async function deleteTransaction(id: string): Promise<CifraActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };
  if (!idSchema.safeParse(id).success) return { success: false, message: GENERIC_ERROR };

  await prisma.$transaction(async (tx) => {
    const row = await tx.cifra_transactions.findFirst({
      where: { ctrx_id: id, ctrx_user_id: user.user_id },
    });
    if (!row) return;
    await tx.cifra_transactions.delete({ where: { ctrx_id: id } });

    const prevDue = row.ctrx_prev_due_on ? fromDateOnly(row.ctrx_prev_due_on) : null;

    if (row.ctrx_debt_id) {
      const debt = await tx.cifra_debts.findFirst({
        where: { cdebt_id: row.ctrx_debt_id, cdebt_user_id: user.user_id },
      });
      if (!debt) return;
      const current = debt.cdebt_next_due_on ? fromDateOnly(debt.cdebt_next_due_on) : null;
      const expected = prevDue
        ? nextOccurrence(prevDue, debt.cdebt_due_day, debt.cdebt_due_last_day)
        : null;
      const wasLast = prevDue && (current === null || (expected && sameDate(current, expected)));
      await tx.cifra_debts.updateMany({
        where: { cdebt_id: debt.cdebt_id, cdebt_user_id: user.user_id },
        data: {
          cdebt_balance_cents: { increment: row.ctrx_applied_to_debt_cents },
          cdebt_paid_off: false,
          ...(wasLast
            ? {
                cdebt_next_due_on: row.ctrx_prev_due_on,
                cdebt_next_cut_on: row.ctrx_prev_cut_on,
                cdebt_next_payment_cents: row.ctrx_prev_amount_cents,
              }
            : {}),
        },
      });
    } else if (row.ctrx_fixed_expense_id) {
      const fixed = await tx.cifra_fixed_expenses.findFirst({
        where: { cfix_id: row.ctrx_fixed_expense_id, cfix_user_id: user.user_id },
      });
      if (!fixed) return;
      const current = fixed.cfix_next_due_on ? fromDateOnly(fixed.cfix_next_due_on) : null;
      const expected = prevDue
        ? nextOccurrence(prevDue, fixed.cfix_due_day, fixed.cfix_due_last_day)
        : null;
      const wasLast = prevDue && (current === null || (expected && sameDate(current, expected)));
      if (wasLast) {
        await tx.cifra_fixed_expenses.updateMany({
          where: { cfix_id: fixed.cfix_id, cfix_user_id: user.user_id },
          data: {
            cfix_next_due_on: row.ctrx_prev_due_on,
            cfix_amount_cents: row.ctrx_prev_amount_cents,
            cfix_active: true,
          },
        });
      }
    }
  });
  refresh();
  return { success: true };
}

export async function deleteAccount(id: string): Promise<CifraActionState> {
  return deleteOwned(id, (userId) =>
    prisma.cifra_accounts.deleteMany({ where: { cacc_id: id, cacc_user_id: userId } }),
  );
}

export async function deleteDebt(id: string): Promise<CifraActionState> {
  return deleteOwned(id, (userId) =>
    prisma.cifra_debts.deleteMany({ where: { cdebt_id: id, cdebt_user_id: userId } }),
  );
}

export async function deleteFixedExpense(id: string): Promise<CifraActionState> {
  return deleteOwned(id, (userId) =>
    prisma.cifra_fixed_expenses.deleteMany({ where: { cfix_id: id, cfix_user_id: userId } }),
  );
}

async function deleteOwned(
  id: string,
  run: (userId: string) => Promise<unknown>,
): Promise<CifraActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };
  if (!idSchema.safeParse(id).success) return { success: false, message: GENERIC_ERROR };
  await run(user.user_id);
  refresh();
  return { success: true };
}

/**
 * Marca como pagado el próximo pago de una deuda o gasto fijo con el monto y la
 * fecha que diga la persona: crea el egreso y, en deudas, baja el saldo. Si es
 * recurrente, la fecha avanza al mes siguiente; si el monto cambia cada mes, el
 * siguiente queda «por confirmar». Cada fecha de pago se puede marcar una vez.
 */
export async function markPaid(
  kind: "debt" | "fixed",
  id: string,
  formData: FormData,
): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };
  if (!idSchema.safeParse(id).success || (kind !== "debt" && kind !== "fixed")) {
    return { success: false, message: GENERIC_ERROR };
  }
  const parsed = paySchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { amount, date } = parsed.data;
  const occurredOn = toDateOnly(date);

  try {
    const done = await prisma.$transaction(async (tx) => {
      if (kind === "debt") {
        const debt = await tx.cifra_debts.findFirst({
          where: { cdebt_id: id, cdebt_user_id: access.userId, cdebt_paid_off: false },
        });
        if (!debt || !debt.cdebt_next_due_on) return false;
        const dueDate = fromDateOnly(debt.cdebt_next_due_on);
        const applied = amountAppliedToDebt(debt.cdebt_balance_cents, amount);
        await tx.cifra_transactions.create({
          data: {
            ctrx_user_id: access.userId,
            ctrx_flow: "expense",
            ctrx_category: DEBT_PAYMENT_CATEGORY,
            ctrx_amount_cents: amount,
            ctrx_occurred_on: occurredOn,
            ctrx_description: debt.cdebt_name,
            ctrx_debt_id: debt.cdebt_id,
            ctrx_period: periodOf(dueDate),
            ctrx_applied_to_debt_cents: applied,
            ctrx_prev_due_on: debt.cdebt_next_due_on,
            ctrx_prev_cut_on: debt.cdebt_next_cut_on,
            ctrx_prev_amount_cents: debt.cdebt_next_payment_cents,
          },
        });
        const remaining = debt.cdebt_balance_cents - applied;
        const goesOn = debt.cdebt_recurring && remaining > 0;
        await tx.cifra_debts.update({
          where: { cdebt_id: debt.cdebt_id },
          data: {
            cdebt_balance_cents: remaining,
            cdebt_paid_off: remaining === 0,
            cdebt_next_due_on: goesOn
              ? toDateOnly(nextOccurrence(dueDate, debt.cdebt_due_day, debt.cdebt_due_last_day))
              : null,
            cdebt_next_payment_cents: goesOn && !debt.cdebt_variable_payment
              ? debt.cdebt_next_payment_cents
              : null,
            cdebt_next_cut_on:
              goesOn && debt.cdebt_cut_day != null
                ? toDateOnly(firstOccurrenceAfter(dueDate, debt.cdebt_cut_day, debt.cdebt_cut_last_day))
                : null,
          },
        });
        return true;
      }

      const fixed = await tx.cifra_fixed_expenses.findFirst({
        where: { cfix_id: id, cfix_user_id: access.userId, cfix_active: true },
      });
      if (!fixed || !fixed.cfix_next_due_on) return false;
      const dueDate = fromDateOnly(fixed.cfix_next_due_on);
      await tx.cifra_transactions.create({
        data: {
          ctrx_user_id: access.userId,
          ctrx_flow: "expense",
          ctrx_category: fixed.cfix_category,
          ctrx_amount_cents: amount,
          ctrx_occurred_on: occurredOn,
          ctrx_description: fixed.cfix_name,
          ctrx_fixed_expense_id: fixed.cfix_id,
          ctrx_period: periodOf(dueDate),
          ctrx_prev_due_on: fixed.cfix_next_due_on,
          ctrx_prev_amount_cents: fixed.cfix_amount_cents,
        },
      });
      await tx.cifra_fixed_expenses.update({
        where: { cfix_id: fixed.cfix_id },
        data: fixed.cfix_recurring
          ? {
              cfix_next_due_on: toDateOnly(
                nextOccurrence(dueDate, fixed.cfix_due_day, fixed.cfix_due_last_day),
              ),
              cfix_amount_cents: fixed.cfix_variable ? null : fixed.cfix_amount_cents,
            }
          : { cfix_next_due_on: null, cfix_active: false },
      });
      return true;
    });
    if (!done) return { success: false, message: "Este pago ya no está pendiente." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, message: "Este pago ya está marcado como pagado." };
    }
    throw error;
  }

  await trackServer(access.userId, ANALYTICS_EVENTS.cifraPaymentMarked, { type: kind });
  refresh();
  return { success: true };
}

/**
 * Captura el monto del siguiente pago cuando estaba «por confirmar» (estado de
 * cuenta de la tarjeta, recibo de luz). En tarjetas también puede actualizar el
 * saldo y el pago mínimo, y si el corte ya pasó lo recorre al siguiente.
 */
export async function setPendingAmount(
  kind: "debt" | "fixed",
  id: string,
  formData: FormData,
): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };
  if (!idSchema.safeParse(id).success || (kind !== "debt" && kind !== "fixed")) {
    return { success: false, message: GENERIC_ERROR };
  }
  const parsed = pendingAmountSchema.safeParse(formDataToValues(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;

  if (kind === "fixed") {
    const res = await prisma.cifra_fixed_expenses.updateMany({
      where: { cfix_id: id, cfix_user_id: access.userId },
      data: { cfix_amount_cents: d.amount },
    });
    if (res.count === 0) return { success: false, message: GENERIC_ERROR };
  } else {
    const debt = await prisma.cifra_debts.findFirst({
      where: { cdebt_id: id, cdebt_user_id: access.userId },
    });
    if (!debt) return { success: false, message: GENERIC_ERROR };
    const today = todayInMexico();
    const cutPassed =
      debt.cdebt_next_cut_on !== null &&
      debt.cdebt_cut_day !== null &&
      toDateOnly(today).getTime() >= debt.cdebt_next_cut_on.getTime();
    await prisma.cifra_debts.updateMany({
      where: { cdebt_id: id, cdebt_user_id: access.userId },
      data: {
        cdebt_next_payment_cents: d.amount,
        ...(d.balance !== null ? { cdebt_balance_cents: d.balance, cdebt_paid_off: d.balance === 0 } : {}),
        ...(d.minPayment !== null ? { cdebt_min_payment_cents: d.minPayment } : {}),
        ...(cutPassed
          ? {
              cdebt_next_cut_on: toDateOnly(
                firstOccurrenceAfter(today, debt.cdebt_cut_day!, debt.cdebt_cut_last_day),
              ),
            }
          : {}),
      },
    });
  }
  refresh();
  return { success: true };
}

/** Borra todo lo de Cifra del usuario. Siempre disponible, aunque no tenga plan. */
export async function deleteAllCifraData(): Promise<CifraActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };

  await prisma.$transaction([
    prisma.cifra_transactions.deleteMany({ where: { ctrx_user_id: user.user_id } }),
    prisma.cifra_debts.deleteMany({ where: { cdebt_user_id: user.user_id } }),
    prisma.cifra_fixed_expenses.deleteMany({ where: { cfix_user_id: user.user_id } }),
    prisma.cifra_accounts.deleteMany({ where: { cacc_user_id: user.user_id } }),
  ]);
  await trackServer(user.user_id, ANALYTICS_EVENTS.cifraDataDeleted);
  refresh();
  return { success: true };
}
