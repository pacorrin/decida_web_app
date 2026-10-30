import { z } from "zod";
import {
  ACCOUNT_KINDS,
  DEBT_KINDS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "./constants";
import { compareDates, parseDateInput } from "./dates";
import { parseMoneyToCents } from "./money";

const text = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim());

const name = text.pipe(
  z.string().min(1, "Escribe un nombre").max(80, "Máximo 80 caracteres"),
);

const MONEY_ERROR = "Ingresa un importe válido, por ejemplo 1,500.00";

const money = text.transform((v, ctx) => {
  const cents = parseMoneyToCents(v);
  if (cents === null) {
    ctx.issues.push({ code: "custom", message: MONEY_ERROR, input: v });
    return z.NEVER;
  }
  return cents;
});

const optionalMoney = text.transform((v, ctx) => {
  if (v === "") return null;
  const cents = parseMoneyToCents(v);
  if (cents === null) {
    ctx.issues.push({ code: "custom", message: MONEY_ERROR, input: v });
    return z.NEVER;
  }
  return cents;
});

const dateField = (message = "Elige una fecha válida") =>
  text.transform((v, ctx) => {
    const date = parseDateInput(v);
    if (!date) {
      ctx.issues.push({ code: "custom", message, input: v });
      return z.NEVER;
    }
    return date;
  });

const optionalDate = text.transform((v, ctx) => {
  if (v === "") return null;
  const date = parseDateInput(v);
  if (!date) {
    ctx.issues.push({ code: "custom", message: "Elige una fecha válida", input: v });
    return z.NEVER;
  }
  return date;
});

/** Casilla: el navegador manda «on» solo si está marcada. */
const checkbox = text.transform((v) => v === "on");

const optionalRate = text.transform((v, ctx) => {
  if (v === "") return null;
  const n = Number(v.replace(/[%\s]/g, ""));
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(v.replace(/[%\s]/g, "")) || n > 999) {
    ctx.issues.push({ code: "custom", message: "Ingresa una tasa entre 0 y 999", input: v });
    return z.NEVER;
  }
  return n;
});

const kindOf = <T extends readonly { code: string }[]>(list: T) =>
  text.pipe(z.enum(list.map((k) => k.code) as [string, ...string[]], { error: "Elige una opción" }));

export const accountSchema = z.object({
  name,
  kind: kindOf(ACCOUNT_KINDS),
  balance: money,
});

export const debtSchema = z
  .object({
    name,
    kind: kindOf(DEBT_KINDS),
    balance: money,
    creditLimit: optionalMoney,
    annualRate: optionalRate,
    nextDue: dateField("Elige la próxima fecha de pago"),
    dueLastDay: checkbox,
    nextCut: optionalDate,
    cutLastDay: checkbox,
    nextPayment: optionalMoney,
    minPayment: optionalMoney,
    variablePayment: checkbox,
    recurring: checkbox,
    endsOn: optionalDate,
  })
  .superRefine((v, ctx) => {
    if (!v.variablePayment && v.nextPayment == null) {
      ctx.addIssue({
        code: "custom",
        path: ["nextPayment"],
        message: "Escribe el monto de tu pago, o marca que cambia cada mes",
      });
    }
    if (v.endsOn && compareDates(v.endsOn, v.nextDue) < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "La vigencia debe ser posterior al próximo pago",
      });
    }
  });

export const fixedExpenseSchema = z
  .object({
    name,
    category: kindOf(EXPENSE_CATEGORIES),
    amount: optionalMoney,
    variable: checkbox,
    nextDue: dateField("Elige la próxima fecha de pago"),
    dueLastDay: checkbox,
    recurring: checkbox,
  })
  .superRefine((v, ctx) => {
    if (!v.variable && v.amount == null) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Escribe el monto, o marca que cambia cada mes",
      });
    }
  });

/** Capturar el monto del siguiente pago (estado de cuenta, recibo). */
export const pendingAmountSchema = z.object({
  amount: money,
  balance: optionalMoney,
  minPayment: optionalMoney,
});

/** Marcar un pago como pagado: cuánto se pagó y cuándo. */
export const paySchema = z.object({
  amount: money,
  date: dateField(),
});

export const transactionSchema = z
  .object({
    flow: text.pipe(z.enum(["income", "expense"])),
    category: text,
    amount: money,
    date: dateField(),
    description: text.pipe(z.string().max(120, "Máximo 120 caracteres")),
  })
  .superRefine((v, ctx) => {
    const list = v.flow === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!list.some((c) => c.code === v.category)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Elige una categoría" });
    }
  });

export const idSchema = z.string().min(1).max(60);

export type DebtInput = z.infer<typeof debtSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
