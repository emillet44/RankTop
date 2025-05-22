/*
  Warnings:

  - You are about to drop the column `lastUpdateTime` on the `AlgoliaMetadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlgoliaMetadata" DROP COLUMN "lastUpdateTime",
ADD COLUMN     "lastGroup" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPost" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastUser" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
