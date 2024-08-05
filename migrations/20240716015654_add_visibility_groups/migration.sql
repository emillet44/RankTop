/*
  Warnings:

  - Added the required column `visibility` to the `Groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "visibility" TEXT NOT NULL;
