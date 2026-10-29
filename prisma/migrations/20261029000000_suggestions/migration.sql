-- CreateTable
CREATE TABLE "suggestions" (
    "sugg_id" TEXT NOT NULL,
    "sugg_user_id" TEXT,
    "sugg_message" TEXT NOT NULL,
    "sugg_page" TEXT,
    "sugg_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("sugg_id")
);

-- CreateIndex
CREATE INDEX "suggestions_sugg_user_id_sugg_created_at_idx" ON "suggestions"("sugg_user_id", "sugg_created_at");

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_sugg_user_id_fkey" FOREIGN KEY ("sugg_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
