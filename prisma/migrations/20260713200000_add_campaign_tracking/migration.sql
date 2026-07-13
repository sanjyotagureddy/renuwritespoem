-- AlterTable
ALTER TABLE "campaign_deliveries" ADD COLUMN "openedAt" TIMESTAMP(3),
ADD COLUMN "openCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "campaign_clicks" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_clicks_deliveryId_idx" ON "campaign_clicks"("deliveryId");

-- AddForeignKey
ALTER TABLE "campaign_clicks" ADD CONSTRAINT "campaign_clicks_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "campaign_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
