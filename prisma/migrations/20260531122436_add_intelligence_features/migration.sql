-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('performance', 'timing', 'geo', 'spend', 'opportunity', 'alert');

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "visibilityScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "clickElement" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "scrollDepth" INTEGER,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "timeOnAd" INTEGER;

-- CreateTable
CREATE TABLE "AdInsight" (
    "id" UUID NOT NULL,
    "adId" UUID NOT NULL,
    "type" "InsightType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(600) NOT NULL,
    "impact" VARCHAR(10) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendScore" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "viewsPerDollar" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "clicksPerDollar" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "engagementRate" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "categoryRank" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdInsight_adId_priority_idx" ON "AdInsight"("adId", "priority" DESC);

-- CreateIndex
CREATE INDEX "AdInsight_expiresAt_idx" ON "AdInsight"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpendScore_userId_key" ON "SpendScore"("userId");

-- CreateIndex
CREATE INDEX "Ad_visibilityScore_idx" ON "Ad"("visibilityScore" DESC);

-- CreateIndex
CREATE INDEX "Analytics_sessionId_idx" ON "Analytics"("sessionId");

-- AddForeignKey
ALTER TABLE "AdInsight" ADD CONSTRAINT "AdInsight_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendScore" ADD CONSTRAINT "SpendScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
