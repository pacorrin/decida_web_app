-- CreateEnum
CREATE TYPE "cifra_flow" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "cifra_account_kind" AS ENUM ('cash', 'bank', 'savings', 'other');

-- CreateEnum
CREATE TYPE "cifra_debt_kind" AS ENUM ('credit_card', 'loan', 'other');

-- CreateTable
CREATE TABLE "cifra_accounts" (
    "cacc_id" TEXT NOT NULL,
    "cacc_user_id" TEXT NOT NULL,
    "cacc_name" TEXT NOT NULL,
    "cacc_kind" "cifra_account_kind" NOT NULL,
    "cacc_balance_cents" INTEGER NOT NULL DEFAULT 0,
    "cacc_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cacc_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cifra_accounts_pkey" PRIMARY KEY ("cacc_id")
);

-- CreateTable
CREATE TABLE "cifra_debts" (
    "cdebt_id" TEXT NOT NULL,
    "cdebt_user_id" TEXT NOT NULL,
    "cdebt_name" TEXT NOT NULL,
    "cdebt_kind" "cifra_debt_kind" NOT NULL,
    "cdebt_balance_cents" INTEGER NOT NULL,
    "cdebt_monthly_payment_cents" INTEGER NOT NULL,
    "cdebt_annual_rate_pct" DECIMAL(5,2),
    "cdebt_credit_limit_cents" INTEGER,
    "cdebt_cut_day" INTEGER,
    "cdebt_due_day" INTEGER NOT NULL,
    "cdebt_paid_off" BOOLEAN NOT NULL DEFAULT false,
    "cdebt_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cdebt_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cifra_debts_pkey" PRIMARY KEY ("cdebt_id")
);

-- CreateTable
CREATE TABLE "cifra_fixed_expenses" (
    "cfix_id" TEXT NOT NULL,
    "cfix_user_id" TEXT NOT NULL,
    "cfix_name" TEXT NOT NULL,
    "cfix_category" TEXT NOT NULL,
    "cfix_amount_cents" INTEGER NOT NULL,
    "cfix_due_day" INTEGER NOT NULL,
    "cfix_active" BOOLEAN NOT NULL DEFAULT true,
    "cfix_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cfix_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cifra_fixed_expenses_pkey" PRIMARY KEY ("cfix_id")
);

-- CreateTable
CREATE TABLE "cifra_transactions" (
    "ctrx_id" TEXT NOT NULL,
    "ctrx_user_id" TEXT NOT NULL,
    "ctrx_flow" "cifra_flow" NOT NULL,
    "ctrx_category" TEXT NOT NULL,
    "ctrx_amount_cents" INTEGER NOT NULL,
    "ctrx_occurred_on" DATE NOT NULL,
    "ctrx_description" TEXT,
    "ctrx_debt_id" TEXT,
    "ctrx_fixed_expense_id" TEXT,
    "ctrx_period" TEXT,
    "ctrx_applied_to_debt_cents" INTEGER NOT NULL DEFAULT 0,
    "ctrx_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cifra_transactions_pkey" PRIMARY KEY ("ctrx_id")
);

-- CreateIndex
CREATE INDEX "cifra_accounts_cacc_user_id_idx" ON "cifra_accounts"("cacc_user_id");

-- CreateIndex
CREATE INDEX "cifra_debts_cdebt_user_id_idx" ON "cifra_debts"("cdebt_user_id");

-- CreateIndex
CREATE INDEX "cifra_fixed_expenses_cfix_user_id_idx" ON "cifra_fixed_expenses"("cfix_user_id");

-- CreateIndex
CREATE INDEX "cifra_transactions_ctrx_user_id_ctrx_occurred_on_idx" ON "cifra_transactions"("ctrx_user_id", "ctrx_occurred_on");

-- CreateIndex
CREATE UNIQUE INDEX "cifra_transactions_ctrx_debt_id_ctrx_period_key" ON "cifra_transactions"("ctrx_debt_id", "ctrx_period");

-- CreateIndex
CREATE UNIQUE INDEX "cifra_transactions_ctrx_fixed_expense_id_ctrx_period_key" ON "cifra_transactions"("ctrx_fixed_expense_id", "ctrx_period");

-- AddForeignKey
ALTER TABLE "cifra_accounts" ADD CONSTRAINT "cifra_accounts_cacc_user_id_fkey" FOREIGN KEY ("cacc_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_debts" ADD CONSTRAINT "cifra_debts_cdebt_user_id_fkey" FOREIGN KEY ("cdebt_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_fixed_expenses" ADD CONSTRAINT "cifra_fixed_expenses_cfix_user_id_fkey" FOREIGN KEY ("cfix_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_user_id_fkey" FOREIGN KEY ("ctrx_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_debt_id_fkey" FOREIGN KEY ("ctrx_debt_id") REFERENCES "cifra_debts"("cdebt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_fixed_expense_id_fkey" FOREIGN KEY ("ctrx_fixed_expense_id") REFERENCES "cifra_fixed_expenses"("cfix_id") ON DELETE SET NULL ON UPDATE CASCADE;

