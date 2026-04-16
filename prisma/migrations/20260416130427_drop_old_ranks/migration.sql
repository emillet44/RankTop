-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "rank1",
DROP COLUMN "rank1_note",
DROP COLUMN "rank2",
DROP COLUMN "rank2_note",
DROP COLUMN "rank3",
DROP COLUMN "rank3_note",
DROP COLUMN "rank4",
DROP COLUMN "rank4_note",
DROP COLUMN "rank5",
DROP COLUMN "rank5_note",
ALTER COLUMN "items" SET NOT NULL;

