-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "items" JSONB,
ADD COLUMN     "reRankType" TEXT NOT NULL DEFAULT 'None';

-- CreateTable
CREATE TABLE "ReRankings" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReRankings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReRankings" ADD CONSTRAINT "ReRankings_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReRankings" ADD CONSTRAINT "ReRankings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

