-- AlterTable
ALTER TABLE "ReRankings" ADD COLUMN     "normalizedItems" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE INDEX "ReRankings_postId_idx" ON "ReRankings"("postId");

-- CreateIndex
CREATE INDEX "ReRankings_createdAt_idx" ON "ReRankings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReRankings_userId_postId_key" ON "ReRankings"("userId", "postId");

