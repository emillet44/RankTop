-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Post_Metadata" ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'READY';

