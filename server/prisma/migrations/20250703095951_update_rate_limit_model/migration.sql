/*
  Warnings:

  - You are about to drop the column `orgId` on the `RateLimit` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RateLimit` table. All the data in the column will be lost.
  - Added the required column `identifier` to the `RateLimit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RateLimit" DROP COLUMN "orgId",
DROP COLUMN "userId",
ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "identifier" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "RateLimit_identifier_idx" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_action_idx" ON "RateLimit"("action");
