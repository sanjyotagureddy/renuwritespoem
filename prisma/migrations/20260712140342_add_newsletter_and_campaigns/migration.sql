/*
  Warnings:

  - Added the required column `updatedAt` to the `campaigns` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "failedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "subscribers" ADD COLUMN     "prefAudio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "prefBooks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "prefPoems" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "campaign_deliveries" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_deliveries_campaignId_idx" ON "campaign_deliveries"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_deliveries_email_idx" ON "campaign_deliveries"("email");

-- AddForeignKey
ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
