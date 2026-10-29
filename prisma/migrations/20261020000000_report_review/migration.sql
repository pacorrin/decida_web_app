-- AlterTable
ALTER TABLE "assessment_reports" ADD COLUMN     "arep_needs_human_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "arep_review" JSONB;

