/*
  Warnings:

  - You are about to drop the column `visibility` on the `Groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Groups" DROP COLUMN "visibility",
ADD COLUMN     "invite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;
