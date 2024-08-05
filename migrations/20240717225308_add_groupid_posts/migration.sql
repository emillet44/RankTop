/*
  Warnings:

  - You are about to drop the `_GroupsToPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GroupsToPosts" DROP CONSTRAINT "_GroupsToPosts_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupsToPosts" DROP CONSTRAINT "_GroupsToPosts_B_fkey";

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "groupId" TEXT;

-- DropTable
DROP TABLE "_GroupsToPosts";

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
