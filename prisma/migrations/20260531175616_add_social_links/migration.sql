-- CreateTable
CREATE TABLE "SocialLink" (
    "id" UUID NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialLink_isActive_order_idx" ON "SocialLink"("isActive", "order");
