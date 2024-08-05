/*
  Warnings:

  - You are about to drop the column `visibility` on the `Posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "visibility",
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;
