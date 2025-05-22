-- CreateTable
CREATE TABLE "AlgoliaMetadata" (
    "id" TEXT NOT NULL DEFAULT 'last-update',
    "lastUpdateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlgoliaMetadata_pkey" PRIMARY KEY ("id")
);
