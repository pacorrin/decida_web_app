-- AlterTable
ALTER TABLE "cifra_debts" ADD COLUMN     "cdebt_card_id" TEXT;

-- AlterTable
ALTER TABLE "cifra_transactions" ADD COLUMN     "ctrx_card_id" TEXT,
ADD COLUMN     "ctrx_is_transfer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ctrx_payment_id" TEXT;

-- CreateTable
CREATE TABLE "cifra_cards" (
    "ccard_id" TEXT NOT NULL,
    "ccard_user_id" TEXT NOT NULL,
    "ccard_name" TEXT NOT NULL,
    "ccard_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ccard_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cifra_cards_pkey" PRIMARY KEY ("ccard_id")
);

-- CreateIndex
CREATE INDEX "cifra_cards_ccard_user_id_idx" ON "cifra_cards"("ccard_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cifra_debts_cdebt_card_id_key" ON "cifra_debts"("cdebt_card_id");

-- CreateIndex
CREATE INDEX "cifra_transactions_ctrx_card_id_idx" ON "cifra_transactions"("ctrx_card_id");

-- AddForeignKey
ALTER TABLE "cifra_cards" ADD CONSTRAINT "cifra_cards_ccard_user_id_fkey" FOREIGN KEY ("ccard_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_debts" ADD CONSTRAINT "cifra_debts_cdebt_card_id_fkey" FOREIGN KEY ("cdebt_card_id") REFERENCES "cifra_cards"("ccard_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_card_id_fkey" FOREIGN KEY ("ctrx_card_id") REFERENCES "cifra_cards"("ccard_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_payment_id_fkey" FOREIGN KEY ("ctrx_payment_id") REFERENCES "cifra_transactions"("ctrx_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Datos: cada deuda de tarjeta que ya existe recibe su tarjeta (mismo id). Los pagos pasados no cambian.
INSERT INTO "cifra_cards" ("ccard_id", "ccard_user_id", "ccard_name", "ccard_created_at", "ccard_updated_at")
SELECT "cdebt_id", "cdebt_user_id", "cdebt_name", "cdebt_created_at", CURRENT_TIMESTAMP
FROM "cifra_debts"
WHERE "cdebt_kind" = 'credit_card';

UPDATE "cifra_debts" SET "cdebt_card_id" = "cdebt_id" WHERE "cdebt_kind" = 'credit_card';
