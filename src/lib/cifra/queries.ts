import "server-only";

import { prisma } from "@/lib/prisma";
import {
  type CalendarDate,
  addDays,
  fromDateOnly,
  monthRange,
  periodOf,
} from "./dates";
import { estimatePayoff } from "./payoff";
import { breakdownByCategory, groupPaymentParts, summarizeTransactions } from "./summary";
import { type DueItem, totalsOf, upcomingPayments } from "./upcoming";

/** Un pago hecho a una deuda o tarjeta, para su historial. */
export type DebtPayment = {
  id: string;
  date: CalendarDate;
  amountCents: number;
  /** Lo que bajó el saldo de la deuda. */
  appliedCents: number;
  isTransfer: boolean;
  interestCents: number;
  untrackedCents: number;
};

const dateOrNull = (d: Date | null) => (d ? fromDateOnly(d) : null);

const withCard = {
  card: { select: { ccard_name: true } },
  account: { select: { cacc_name: true } },
} as const;

type TransactionRow = Awaited<
  ReturnType<typeof prisma.cifra_transactions.findMany<{ include: typeof withCard }>>
>[number];

function toRow(t: TransactionRow) {
  return {
    id: t.ctrx_id,
    flow: t.ctrx_flow,
    category: t.ctrx_category,
    amountCents: t.ctrx_amount_cents,
    date: fromDateOnly(t.ctrx_occurred_on),
    description: t.ctrx_description,
    fromPayment: t.ctrx_period !== null,
    isTransfer: t.ctrx_is_transfer,
    paymentId: t.ctrx_payment_id,
    cardName: t.card?.ccard_name ?? null,
    accountName: t.account?.cacc_name ?? null,
  };
}

async function loadDueItems(userId: string): Promise<DueItem[]> {
  const [debts, fixed] = await Promise.all([
    prisma.cifra_debts.findMany({ where: { cdebt_user_id: userId, cdebt_paid_off: false } }),
    prisma.cifra_fixed_expenses.findMany({ where: { cfix_user_id: userId, cfix_active: true } }),
  ]);
  return [
    ...debts.map((d) => ({
      kind: "debt" as const,
      id: d.cdebt_id,
      name: d.cdebt_name,
      subtype: d.cdebt_kind,
      nextDueOn: dateOrNull(d.cdebt_next_due_on),
      amountCents: d.cdebt_next_payment_cents,
      recurring: d.cdebt_recurring,
      variable: d.cdebt_variable_payment,
      dueDay: d.cdebt_due_day,
      dueLastDay: d.cdebt_due_last_day,
      cardBalanceCents: d.cdebt_card_id ? d.cdebt_balance_cents : null,
    })),
    ...fixed.map((f) => ({
      kind: "fixed" as const,
      id: f.cfix_id,
      name: f.cfix_name,
      subtype: f.cfix_category,
      nextDueOn: dateOrNull(f.cfix_next_due_on),
      amountCents: f.cfix_amount_cents,
      recurring: f.cfix_recurring,
      variable: f.cfix_variable,
      dueDay: f.cfix_due_day,
      dueLastDay: f.cfix_due_last_day,
    })),
  ];
}

/** Cuentas de la persona (id y nombre) para elegir de cuál sale un pago. */
async function accountChoices(userId: string) {
  const accounts = await prisma.cifra_accounts.findMany({
    where: { cacc_user_id: userId },
    orderBy: { cacc_created_at: "asc" },
    select: { cacc_id: true, cacc_name: true },
  });
  return accounts.map((a) => ({ id: a.cacc_id, name: a.cacc_name }));
}

async function accountsTotal(userId: string): Promise<number> {
  const sum = await prisma.cifra_accounts.aggregate({
    where: { cacc_user_id: userId },
    _sum: { cacc_balance_cents: true },
  });
  return sum._sum.cacc_balance_cents ?? 0;
}

export async function getOverview(userId: string, today: CalendarDate) {
  const range = monthRange(periodOf(today))!;
  const [transactions, debtSum, cardsSum, items, accounts, accountOptions] = await Promise.all([
    prisma.cifra_transactions.findMany({
      where: { ctrx_user_id: userId, ctrx_occurred_on: { gte: range.from, lte: range.to } },
      orderBy: [{ ctrx_occurred_on: "desc" }, { ctrx_created_at: "desc" }],
      include: withCard,
    }),
    prisma.cifra_debts.aggregate({
      where: { cdebt_user_id: userId, cdebt_paid_off: false },
      _sum: { cdebt_balance_cents: true },
    }),
    prisma.cifra_debts.aggregate({
      where: { cdebt_user_id: userId, cdebt_card_id: { not: null } },
      _sum: { cdebt_balance_cents: true },
    }),
    loadDueItems(userId),
    accountsTotal(userId),
    accountChoices(userId),
  ]);

  const rows = transactions.map(toRow);
  const month = summarizeTransactions(rows);
  const upcoming = upcomingPayments(items, { today, from: today, to: addDays(today, 30) });
  return {
    ...month,
    incomeByCategory: breakdownByCategory(rows, "income"),
    expenseByCategory: breakdownByCategory(rows, "expense"),
    recentTransactions: groupPaymentParts(rows).slice(0, 6),
    transactionCount: rows.length,
    debtTotalCents: debtSum._sum.cdebt_balance_cents ?? 0,
    cardsPendingCents: cardsSum._sum.cdebt_balance_cents ?? 0,
    accountsTotalCents: accounts,
    accountOptions,
    upcoming,
  };
}

export async function getPaymentsReport(
  userId: string,
  { today, from, to }: { today: CalendarDate; from: CalendarDate; to: CalendarDate },
) {
  const [items, accounts, accountOptions] = await Promise.all([
    loadDueItems(userId),
    accountsTotal(userId),
    accountChoices(userId),
  ]);
  const payments = upcomingPayments(items, { today, from, to });
  return { payments, totals: totalsOf(payments, accounts), accountOptions };
}

export async function getAccountsData(userId: string, today: CalendarDate) {
  const [accounts, debts, fixedExpenses, payments] = await Promise.all([
    prisma.cifra_accounts.findMany({
      where: { cacc_user_id: userId },
      orderBy: { cacc_created_at: "asc" },
    }),
    prisma.cifra_debts.findMany({
      where: { cdebt_user_id: userId },
      orderBy: [{ cdebt_paid_off: "asc" }, { cdebt_next_due_on: "asc" }],
    }),
    prisma.cifra_fixed_expenses.findMany({
      where: { cfix_user_id: userId },
      orderBy: { cfix_next_due_on: "asc" },
    }),
    prisma.cifra_transactions.findMany({
      where: { ctrx_user_id: userId, ctrx_debt_id: { not: null } },
      orderBy: { ctrx_occurred_on: "desc" },
      take: 300,
      select: {
        ctrx_id: true,
        ctrx_debt_id: true,
        ctrx_amount_cents: true,
        ctrx_occurred_on: true,
        ctrx_applied_to_debt_cents: true,
        ctrx_is_transfer: true,
        parts: { select: { ctrx_category: true, ctrx_amount_cents: true } },
      },
    }),
  ]);

  const recentByDebt = new Map<string, number[]>();
  const historyByDebt = new Map<string, DebtPayment[]>();
  for (const p of payments) {
    const debtId = p.ctrx_debt_id!;
    const list = recentByDebt.get(debtId) ?? [];
    if (list.length < 6) list.push(p.ctrx_amount_cents);
    recentByDebt.set(debtId, list);
    historyByDebt.set(debtId, [
      ...(historyByDebt.get(debtId) ?? []),
      {
        id: p.ctrx_id,
        date: fromDateOnly(p.ctrx_occurred_on),
        amountCents: p.ctrx_amount_cents,
        appliedCents: p.ctrx_applied_to_debt_cents,
        isTransfer: p.ctrx_is_transfer,
        interestCents: p.parts.filter((x) => x.ctrx_category === "intereses").reduce((n, x) => n + x.ctrx_amount_cents, 0),
        untrackedCents: p.parts.filter((x) => x.ctrx_category === "sin_detalle").reduce((n, x) => n + x.ctrx_amount_cents, 0),
      },
    ]);
  }

  return {
    today,
    accounts: accounts.map((a) => ({
      id: a.cacc_id,
      name: a.cacc_name,
      notes: a.cacc_notes,
      kind: a.cacc_kind,
      balanceCents: a.cacc_balance_cents,
    })),
    debts: debts.map((d) => {
      const nextDueOn = dateOrNull(d.cdebt_next_due_on);
      const endsOn = dateOrNull(d.cdebt_ends_on);
      const annualRatePct = d.cdebt_annual_rate_pct ? Number(d.cdebt_annual_rate_pct) : null;
      return {
        id: d.cdebt_id,
        name: d.cdebt_name,
        cardId: d.cdebt_card_id,
        /** Tarjeta dada de alta al vuelo: falta capturar su fecha de pago y demás datos. */
        incomplete: d.cdebt_card_id !== null && d.cdebt_next_due_on === null,
        notes: d.cdebt_notes,
        kind: d.cdebt_kind,
        balanceCents: d.cdebt_balance_cents,
        creditLimitCents: d.cdebt_credit_limit_cents,
        annualRatePct,
        nextDueOn,
        dueLastDay: d.cdebt_due_last_day,
        nextCutOn: dateOrNull(d.cdebt_next_cut_on),
        cutLastDay: d.cdebt_cut_last_day,
        nextPaymentCents: d.cdebt_next_payment_cents,
        minPaymentCents: d.cdebt_min_payment_cents,
        variablePayment: d.cdebt_variable_payment,
        recurring: d.cdebt_recurring,
        endsOn,
        paidOff: d.cdebt_paid_off,
        payments: historyByDebt.get(d.cdebt_id) ?? [],
        payoff: estimatePayoff({
          balanceCents: d.cdebt_balance_cents,
          nextDueOn,
          dueDay: d.cdebt_due_day,
          dueLastDay: d.cdebt_due_last_day,
          endsOn,
          nextPaymentCents: d.cdebt_next_payment_cents,
          minPaymentCents: d.cdebt_min_payment_cents,
          recentPaymentsCents: recentByDebt.get(d.cdebt_id) ?? [],
          annualRatePct,
        }),
      };
    }),
    fixedExpenses: fixedExpenses.map((f) => ({
      id: f.cfix_id,
      name: f.cfix_name,
      notes: f.cfix_notes,
      category: f.cfix_category,
      amountCents: f.cfix_amount_cents,
      variable: f.cfix_variable,
      nextDueOn: dateOrNull(f.cfix_next_due_on),
      dueLastDay: f.cfix_due_last_day,
      recurring: f.cfix_recurring,
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
    include: withCard,
  });
  return groupPaymentParts(rows.map(toRow));
}

/** Tarjetas y cuentas para el selector «¿Con qué pagaste?»; la última usada va primero como sugerida. */
export async function getCardOptions(userId: string) {
  const [cards, accounts, last] = await Promise.all([
    prisma.cifra_cards.findMany({ where: { ccard_user_id: userId }, orderBy: { ccard_created_at: "asc" } }),
    prisma.cifra_accounts.findMany({ where: { cacc_user_id: userId }, orderBy: { cacc_created_at: "asc" } }),
    prisma.cifra_transactions.findFirst({
      where: { ctrx_user_id: userId, ctrx_card_id: { not: null }, ctrx_is_transfer: false, ctrx_payment_id: null },
      orderBy: { ctrx_created_at: "desc" },
      select: { ctrx_card_id: true },
    }),
  ]);
  return {
    cards: cards.map((c) => ({ id: c.ccard_id, name: c.ccard_name })),
    accounts: accounts.map((a) => ({ id: a.cacc_id, name: a.cacc_name })),
    lastCardId: last?.ctrx_card_id ?? null,
  };
}
