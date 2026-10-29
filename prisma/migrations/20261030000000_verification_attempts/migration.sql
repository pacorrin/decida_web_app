-- AlterTable
ALTER TABLE "verification_codes" ADD COLUMN     "vc_attempts" INTEGER NOT NULL DEFAULT 0;
