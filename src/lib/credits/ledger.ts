import "server-only";

import type { credit_ledger, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class InsufficientCreditsError extends Error {
  readonly code = "INSUFFICIENT_CREDITS" as const;

  constructor(
    message = "Saldo de créditos insuficiente",
    readonly required?: number,
    readonly available?: number,
  ) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export class InvalidCreditAmountError extends Error {
  readonly code = "INVALID_CREDIT_AMOUNT" as const;

  constructor(message = "El monto de créditos debe ser un entero positivo") {
    super(message);
    this.name = "InvalidCreditAmountError";
  }
}

export type LedgerResult = {
  entry: credit_ledger;
  /** false si la clave de idempotencia ya existía. */
  created: boolean;
};

type Db = Prisma.TransactionClient | typeof prisma;

function assertPositiveInt(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new InvalidCreditAmountError();
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  );
}

async function lockUserBalance(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<number> {
  const rows = await tx.$queryRaw<Array<{ user_credits_balance: number }>>`
    SELECT user_credits_balance
    FROM users
    WHERE user_id = ${userId}
    FOR UPDATE
  `;
  if (rows.length === 0) {
    throw new Error(`Usuario no encontrado: ${userId}`);
  }
  return rows[0].user_credits_balance;
}

async function findByIdempotencyKey(
  db: Db,
  key: string,
): Promise<credit_ledger | null> {
  return db.credit_ledger.findUnique({
    where: { cled_idempotency_key: key },
  });
}

/**
 * Compra / abono positivo al libro (purchase, welcome_bonus, subscription_grant,
 * refund, adjustment positivo). Idempotente por `idempotencyKey`.
 */
export async function creditLedgerEntry(params: {
  userId: string;
  amount: number;
  type: "purchase" | "welcome_bonus" | "subscription_grant" | "refund" | "adjustment";
  idempotencyKey: string;
  assessmentId?: string | null;
  paymentId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<LedgerResult> {
  assertPositiveInt(params.amount);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await findByIdempotencyKey(tx, params.idempotencyKey);
      if (existing) return { entry: existing, created: false };

      const balance = await lockUserBalance(tx, params.userId);
      const balanceAfter = balance + params.amount;

      await tx.users.update({
        where: { user_id: params.userId },
        data: { user_credits_balance: balanceAfter },
      });

      const entry = await tx.credit_ledger.create({
        data: {
          cled_user_id: params.userId,
          cled_type: params.type,
          cled_amount: params.amount,
          cled_balance_after: balanceAfter,
          cled_asmt_id: params.assessmentId ?? null,
          cled_payment_id: params.paymentId ?? null,
          cled_idempotency_key: params.idempotencyKey,
          cled_metadata: params.metadata ?? undefined,
        },
      });

      return { entry, created: true };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      const entry = await findByIdempotencyKey(prisma, params.idempotencyKey);
      if (entry) return { entry, created: false };
    }
    throw err;
  }
}

/** Atajo de compra: tipo `purchase` + clave `purchase:{stripeSessionId}`. */
export async function recordPurchase(params: {
  userId: string;
  amount: number;
  paymentId: string;
  stripeSessionId: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<LedgerResult> {
  return creditLedgerEntry({
    userId: params.userId,
    amount: params.amount,
    type: "purchase",
    idempotencyKey: `purchase:${params.stripeSessionId}`,
    paymentId: params.paymentId,
    metadata: params.metadata,
  });
}

/**
 * Gasto atómico. Condición `balance >= amount` + fila con signo negativo.
 * Idempotente por `idempotencyKey` (p. ej. `spend:{asmtId}`).
 */
export async function spendCredits(params: {
  userId: string;
  amount: number;
  assessmentId: string;
  idempotencyKey: string;
  metadata?: Prisma.InputJsonValue;
  /** Si true, marca asmt_credit_cost y asmt_credits_charged_at en la misma tx. */
  markAssessmentCharged?: boolean;
}): Promise<LedgerResult> {
  assertPositiveInt(params.amount);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await findByIdempotencyKey(tx, params.idempotencyKey);
      if (existing) return { entry: existing, created: false };

      const balance = await lockUserBalance(tx, params.userId);
      if (balance < params.amount) {
        throw new InsufficientCreditsError(
          "Saldo de créditos insuficiente",
          params.amount,
          balance,
        );
      }

      const balanceAfter = balance - params.amount;

      await tx.users.update({
        where: { user_id: params.userId },
        data: { user_credits_balance: balanceAfter },
      });

      const entry = await tx.credit_ledger.create({
        data: {
          cled_user_id: params.userId,
          cled_type: "spend",
          cled_amount: -params.amount,
          cled_balance_after: balanceAfter,
          cled_asmt_id: params.assessmentId,
          cled_idempotency_key: params.idempotencyKey,
          cled_metadata: params.metadata ?? undefined,
        },
      });

      if (params.markAssessmentCharged) {
        await tx.assessments.update({
          where: { asmt_id: params.assessmentId },
          data: {
            asmt_credit_cost: params.amount,
            asmt_credits_charged_at: new Date(),
          },
        });
      }

      return { entry, created: true };
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) throw err;
    if (isUniqueViolation(err)) {
      const entry = await findByIdempotencyKey(prisma, params.idempotencyKey);
      if (entry) return { entry, created: false };
    }
    throw err;
  }
}

/**
 * Reembolso (abono). Clave típica: `refund:{asmtId}:{motivo}`.
 * Nunca deja saldo negativo (solo suma).
 */
export async function refundCredits(params: {
  userId: string;
  amount: number;
  assessmentId: string;
  reason: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<LedgerResult> {
  return creditLedgerEntry({
    userId: params.userId,
    amount: params.amount,
    type: "refund",
    idempotencyKey: `refund:${params.assessmentId}:${params.reason}`,
    assessmentId: params.assessmentId,
    metadata: params.metadata ?? { reason: params.reason },
  });
}

function mergeMeta(
  base: Prisma.InputJsonValue | undefined,
  extra: Record<string, string | number | boolean>,
): Prisma.InputJsonValue {
  const fromBase =
    typeof base === "object" && base !== null && !Array.isArray(base)
      ? (base as Record<string, string | number | boolean | null>)
      : {};
  return { ...fromBase, ...extra };
}

/**
 * Ajuste (p. ej. charge.refunded de Stripe). Si `amount` es negativo, descuenta
 * como máximo el saldo disponible (nunca negativo). Idempotente por clave.
 */
export async function adjustCredits(params: {
  userId: string;
  /** Positivo = abono; negativo = cargo (acotado al saldo). */
  amount: number;
  idempotencyKey: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<LedgerResult> {
  if (!Number.isInteger(params.amount) || params.amount === 0) {
    throw new InvalidCreditAmountError(
      "El ajuste debe ser un entero distinto de cero",
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await findByIdempotencyKey(tx, params.idempotencyKey);
      if (existing) return { entry: existing, created: false };

      const balance = await lockUserBalance(tx, params.userId);
      let delta = params.amount;
      if (delta < 0 && balance + delta < 0) {
        delta = -balance;
      }

      const clamped = delta !== params.amount;
      const metadata = clamped
        ? mergeMeta(params.metadata, {
            clamped: true,
            requested: params.amount,
          })
        : params.metadata;

      if (delta === 0) {
        // Nada que mover; fila 0 para consumir la idempotencia y dejar rastro.
        const entry = await tx.credit_ledger.create({
          data: {
            cled_user_id: params.userId,
            cled_type: "adjustment",
            cled_amount: 0,
            cled_balance_after: balance,
            cled_idempotency_key: params.idempotencyKey,
            cled_metadata: metadata ?? undefined,
          },
        });
        return { entry, created: true };
      }

      const balanceAfter = balance + delta;
      await tx.users.update({
        where: { user_id: params.userId },
        data: { user_credits_balance: balanceAfter },
      });

      const entry = await tx.credit_ledger.create({
        data: {
          cled_user_id: params.userId,
          cled_type: "adjustment",
          cled_amount: delta,
          cled_balance_after: balanceAfter,
          cled_idempotency_key: params.idempotencyKey,
          cled_metadata: metadata ?? undefined,
        },
      });

      return { entry, created: true };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      const entry = await findByIdempotencyKey(prisma, params.idempotencyKey);
      if (entry) return { entry, created: false };
    }
    throw err;
  }
}

export async function getCreditsBalance(userId: string): Promise<number> {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { user_credits_balance: true },
  });
  return user?.user_credits_balance ?? 0;
}

export async function listCreditLedger(
  userId: string,
  opts: { take?: number } = {},
): Promise<credit_ledger[]> {
  return prisma.credit_ledger.findMany({
    where: { cled_user_id: userId },
    orderBy: { cled_created_at: "desc" },
    take: opts.take ?? 50,
  });
}
