"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CIFRA_ACCESS_MESSAGES, getCifraAccess } from "@/lib/cifra/access";
import { CIFRA_PATH, DEBT_PAYMENT_CATEGORY } from "@/lib/cifra/constants";
import { periodOf, todayInMexico, toDateOnly } from "@/lib/cifra/dates";
import {
  accountSchema,
  debtSchema,
  fixedExpenseSchema,
  idSchema,
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

  const data = {
    cdebt_name: d.name,
    cdebt_kind: d.kind as "credit_card" | "loan" | "other",
    cdebt_balance_cents: d.balance,
    cdebt_monthly_payment_cents: d.monthlyPayment,
    cdebt_annual_rate_pct: d.annualRate,
    cdebt_credit_limit_cents: d.creditLimit,
    cdebt_cut_day: d.cutDay,
    cdebt_due_day: d.dueDay,
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

  const data = {
    cfix_name: d.name,
    cfix_category: d.category,
    cfix_amount_cents: d.amount,
    cfix_due_day: d.dueDay,
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

/** Borra solo lo del usuario; si el movimiento vino de un pago de deuda, devuelve el saldo. */
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
    if (row.ctrx_debt_id && row.ctrx_applied_to_debt_cents > 0) {
      await tx.cifra_debts.updateMany({
        where: { cdebt_id: row.ctrx_debt_id, cdebt_user_id: user.user_id },
        data: {
          cdebt_balance_cents: { increment: row.ctrx_applied_to_debt_cents },
          cdebt_paid_off: false,
        },
      });
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
 * Marca como pagado el pago de este mes de una deuda o un gasto fijo: crea el
 * egreso y, en deudas, baja el saldo. Una vez por mes (restricción única).
 */
export async function markPaid(
  kind: "debt" | "fixed",
  id: string,
): Promise<CifraActionState> {
  const access = await getCifraAccess();
  if (!access.ok) return { success: false, message: CIFRA_ACCESS_MESSAGES[access.reason] };
  if (!idSchema.safeParse(id).success || (kind !== "debt" && kind !== "fixed")) {
    return { success: false, message: GENERIC_ERROR };
  }

  const today = todayInMexico();
  const period = periodOf(today);
  const occurredOn = toDateOnly(today);

  try {
    const done = await prisma.$transaction(async (tx) => {
      if (kind === "debt") {
        const debt = await tx.cifra_debts.findFirst({
          where: { cdebt_id: id, cdebt_user_id: access.userId, cdebt_paid_off: false },
        });
        if (!debt) return false;
        const applied = amountAppliedToDebt(debt.cdebt_balance_cents, debt.cdebt_monthly_payment_cents);
        await tx.cifra_transactions.create({
          data: {
            ctrx_user_id: access.userId,
            ctrx_flow: "expense",
            ctrx_category: DEBT_PAYMENT_CATEGORY,
            ctrx_amount_cents: debt.cdebt_monthly_payment_cents,
            ctrx_occurred_on: occurredOn,
            ctrx_description: debt.cdebt_name,
            ctrx_debt_id: debt.cdebt_id,
            ctrx_period: period,
            ctrx_applied_to_debt_cents: applied,
          },
        });
        const remaining = debt.cdebt_balance_cents - applied;
        await tx.cifra_debts.update({
          where: { cdebt_id: debt.cdebt_id },
          data: { cdebt_balance_cents: remaining, cdebt_paid_off: remaining === 0 },
        });
        return true;
      }
      const fixed = await tx.cifra_fixed_expenses.findFirst({
        where: { cfix_id: id, cfix_user_id: access.userId, cfix_active: true },
      });
      if (!fixed) return false;
      await tx.cifra_transactions.create({
        data: {
          ctrx_user_id: access.userId,
          ctrx_flow: "expense",
          ctrx_category: fixed.cfix_category,
          ctrx_amount_cents: fixed.cfix_amount_cents,
          ctrx_occurred_on: occurredOn,
          ctrx_description: fixed.cfix_name,
          ctrx_fixed_expense_id: fixed.cfix_id,
          ctrx_period: period,
        },
      });
      return true;
    });
    if (!done) return { success: false, message: GENERIC_ERROR };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, message: "Este pago ya está marcado como pagado este mes." };
    }
    throw error;
  }

  await trackServer(access.userId, ANALYTICS_EVENTS.cifraPaymentMarked, { type: kind });
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
