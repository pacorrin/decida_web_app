-- CreateEnum
CREATE TYPE "credit_ledger_type" AS ENUM ('purchase', 'welcome_bonus', 'subscription_grant', 'spend', 'refund', 'adjustment');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "user_credits_balance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN "asmt_research_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "asmt_credit_cost" INTEGER,
ADD COLUMN "asmt_credits_charged_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "credit_ledger" (
    "cled_id" TEXT NOT NULL,
    "cled_user_id" TEXT NOT NULL,
    "cled_type" "credit_ledger_type" NOT NULL,
    "cled_amount" INTEGER NOT NULL,
    "cled_balance_after" INTEGER NOT NULL,
    "cled_asmt_id" TEXT,
    "cled_payment_id" TEXT,
    "cled_idempotency_key" TEXT NOT NULL,
    "cled_metadata" JSONB,
    "cled_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("cled_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_ledger_cled_idempotency_key_key" ON "credit_ledger"("cled_idempotency_key");

-- CreateIndex
CREATE INDEX "credit_ledger_cled_user_id_cled_created_at_idx" ON "credit_ledger"("cled_user_id", "cled_created_at");

-- AddForeignKey
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_cled_user_id_fkey" FOREIGN KEY ("cled_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_cled_asmt_id_fkey" FOREIGN KEY ("cled_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_cled_payment_id_fkey" FOREIGN KEY ("cled_payment_id") REFERENCES "payments"("paym_id") ON DELETE SET NULL ON UPDATE CASCADE;
