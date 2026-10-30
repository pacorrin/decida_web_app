import "server-only";

import { prisma } from "@/lib/prisma";
import {
  type CalendarDate,
  fromDateOnly,
  monthRange,
  periodOf,
} from "./dates";
import { pendingPayments, summarizeTransactions } from "./summary";

export async function getOverview(userId: string, today: CalendarDate) {
  const period = periodOf(today);
  const range = monthRange(period)!;

  const [transactions, debts, fixedExpenses, accounts, paid] = await Promise.all([
    prisma.cifra_transactions.findMany({
      where: { ctrx_user_id: userId, ctrx_occurred_on: { gte: range.from, lte: range.to } },
      select: { ctrx_flow: true, ctrx_amount_cents: true },
    }),
    prisma.cifra_debts.findMany({
      where: { cdebt_user_id: userId, cdebt_paid_off: false },
      orderBy: { cdebt_due_day: "asc" },
    }),
    prisma.cifra_fixed_expenses.findMany({
      where: { cfix_user_id: userId, cfix_active: true },
      orderBy: { cfix_due_day: "asc" },
    }),
    prisma.cifra_accounts.findMany({ where: { cacc_user_id: userId } }),
    prisma.cifra_transactions.findMany({
      where: { ctrx_user_id: userId, ctrx_period: period },
      select: { ctrx_debt_id: true, ctrx_fixed_expense_id: true },
    }),
  ]);

  const month = summarizeTransactions(
    transactions.map((t) => ({ flow: t.ctrx_flow, amountCents: t.ctrx_amount_cents })),
  );
  const pending = pendingPayments({
    debts: debts.map((d) => ({
      id: d.cdebt_id,
      name: d.cdebt_name,
      monthlyPaymentCents: d.cdebt_monthly_payment_cents,
      dueDay: d.cdebt_due_day,
    })),
    fixedExpenses: fixedExpenses.map((f) => ({
      id: f.cfix_id,
      name: f.cfix_name,
      amountCents: f.cfix_amount_cents,
      dueDay: f.cfix_due_day,
    })),
    paidDebtIds: new Set(paid.flatMap((p) => (p.ctrx_debt_id ? [p.ctrx_debt_id] : []))),
    paidFixedIds: new Set(
      paid.flatMap((p) => (p.ctrx_fixed_expense_id ? [p.ctrx_fixed_expense_id] : [])),
    ),
    today,
  });

  return {
    period,
    ...month,
    debtTotalCents: debts.reduce((sum, d) => sum + d.cdebt_balance_cents, 0),
    accountsTotalCents: accounts.reduce((sum, a) => sum + a.cacc_balance_cents, 0),
    pending,
  };
}

export async function getAccountsData(userId: string) {
  const [accounts, debts, fixedExpenses] = await Promise.all([
    prisma.cifra_accounts.findMany({
      where: { cacc_user_id: userId },
      orderBy: { cacc_created_at: "asc" },
    }),
    prisma.cifra_debts.findMany({
      where: { cdebt_user_id: userId },
      orderBy: [{ cdebt_paid_off: "asc" }, { cdebt_due_day: "asc" }],
    }),
    prisma.cifra_fixed_expenses.findMany({
      where: { cfix_user_id: userId },
      orderBy: { cfix_due_day: "asc" },
    }),
  ]);
  return {
    accounts: accounts.map((a) => ({
      id: a.cacc_id,
      name: a.cacc_name,
      kind: a.cacc_kind,
      balanceCents: a.cacc_balance_cents,
    })),
    debts: debts.map((d) => ({
      id: d.cdebt_id,
      name: d.cdebt_name,
      kind: d.cdebt_kind,
      balanceCents: d.cdebt_balance_cents,
      monthlyPaymentCents: d.cdebt_monthly_payment_cents,
      annualRatePct: d.cdebt_annual_rate_pct ? Number(d.cdebt_annual_rate_pct) : null,
      creditLimitCents: d.cdebt_credit_limit_cents,
      cutDay: d.cdebt_cut_day,
      dueDay: d.cdebt_due_day,
      paidOff: d.cdebt_paid_off,
    })),
    fixedExpenses: fixedExpenses.map((f) => ({
      id: f.cfix_id,
      name: f.cfix_name,
      category: f.cfix_category,
      amountCents: f.cfix_amount_cents,
      dueDay: f.cfix_due_day,
      active: f.cfix_active,
    })),
  };
}

export async function getMonthTransactions(userId: string, period: string) {
  const range = monthRange(period);
  if (!range) return [];
  const rows = await prisma.cifra_transactions.findMany({
    where: { ctrx_user_id: userId, ctrx_occurred_on: { gte: range.from, lte: range.to } },
    orderBy: [{ ctrx_occurred_on: "desc" }, { ctrx_created_at: "desc" }],
  });
  return rows.map((t) => ({
    id: t.ctrx_id,
    flow: t.ctrx_flow,
    category: t.ctrx_category,
    amountCents: t.ctrx_amount_cents,
    date: fromDateOnly(t.ctrx_occurred_on),
    description: t.ctrx_description,
    fromPayment: t.ctrx_period !== null,
  }));
}
