-- AlterEnum
ALTER TYPE "cifra_account_kind" ADD VALUE 'debit';

-- AlterTable
ALTER TABLE "cifra_transactions" ADD COLUMN     "ctrx_account_id" TEXT;

-- CreateIndex
CREATE INDEX "cifra_transactions_ctrx_account_id_idx" ON "cifra_transactions"("ctrx_account_id");

-- AddForeignKey
ALTER TABLE "cifra_transactions" ADD CONSTRAINT "cifra_transactions_ctrx_account_id_fkey" FOREIGN KEY ("ctrx_account_id") REFERENCES "cifra_accounts"("cacc_id") ON DELETE SET NULL ON UPDATE CASCADE;
