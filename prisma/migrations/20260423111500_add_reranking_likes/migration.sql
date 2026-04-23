-- AlterTable
ALTER TABLE "ReRankings" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReRanking_Likes" (
    "userId" TEXT NOT NULL,
    "rerankingId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ReRanking_Likes_userId_rerankingId_key" ON "ReRanking_Likes"("userId", "rerankingId");

-- AddForeignKey
ALTER TABLE "ReRanking_Likes" ADD CONSTRAINT "ReRanking_Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReRanking_Likes" ADD CONSTRAINT "ReRanking_Likes_rerankingId_fkey" FOREIGN KEY ("rerankingId") REFERENCES "ReRankings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

