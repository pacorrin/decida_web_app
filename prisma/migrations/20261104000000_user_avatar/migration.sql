-- AlterTable
ALTER TABLE "users" ADD COLUMN "user_avatar_version" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_avatars" (
    "uavatar_user_id" TEXT NOT NULL,
    "uavatar_mime" TEXT NOT NULL,
    "uavatar_data" BYTEA NOT NULL,
    "uavatar_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_avatars_pkey" PRIMARY KEY ("uavatar_user_id")
);

-- AddForeignKey
ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_uavatar_user_id_fkey" FOREIGN KEY ("uavatar_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
