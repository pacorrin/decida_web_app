import { z } from "zod";
import {
  ACCOUNT_KINDS,
  DEBT_KINDS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "./constants";
import { parseDateInput } from "./dates";
import { parseMoneyToCents } from "./money";

const name = z.string().trim().min(1, "Escribe un nombre").max(80, "Máximo 80 caracteres");

const money = z
  .string()
  .refine((v) => parseMoneyToCents(v) !== null, "Ingresa un importe válido, por ejemplo 1500 o 1,500.50")
  .transform((v) => parseMoneyToCents(v) as number);

const optionalMoney = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const cents = parseMoneyToCents(v);
    if (cents === null) {
      ctx.issues.push({ code: "custom", message: "Ingresa un importe válido", input: v });
      return z.NEVER;
    }
    return cents;
  });

const day = z
  .string()
  .regex(/^\d{1,2}$/, "Indica un día del 1 al 31")
  .transform(Number)
  .refine((n) => n >= 1 && n <= 31, "Indica un día del 1 al 31");

const optionalDay = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const n = Number(v);
    if (!/^\d{1,2}$/.test(v) || n < 1 || n > 31) {
      ctx.issues.push({ code: "custom", message: "Indica un día del 1 al 31", input: v });
      return z.NEVER;
    }
    return n;
  });

const optionalRate = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const n = Number(v.replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || n > 999) {
      ctx.issues.push({ code: "custom", message: "Ingresa una tasa entre 0 y 999", input: v });
      return z.NEVER;
    }
    return Math.round(n * 100) / 100;
  });

export const accountSchema = z.object({
  name,
  kind: z.enum(ACCOUNT_KINDS.map((k) => k.code) as [string, ...string[]]),
  balance: money,
});

export const debtSchema = z.object({
  name,
  kind: z.enum(DEBT_KINDS.map((k) => k.code) as [string, ...string[]]),
  balance: money,
  monthlyPayment: money,
  dueDay: day,
  cutDay: optionalDay,
  annualRate: optionalRate,
  creditLimit: optionalMoney,
});

export const fixedExpenseSchema = z.object({
  name,
  category: z.enum(EXPENSE_CATEGORIES.map((c) => c.code) as [string, ...string[]]),
  amount: money,
  dueDay: day,
});

export const transactionSchema = z
  .object({
    flow: z.enum(["income", "expense"]),
    category: z.string(),
    amount: money,
    date: z
      .string()
      .refine((v) => parseDateInput(v) !== null, "Elige una fecha válida")
      .transform((v) => parseDateInput(v)!),
    description: z.string().trim().max(120, "Máximo 120 caracteres"),
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
