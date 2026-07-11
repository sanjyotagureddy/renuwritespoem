ALTER TABLE "users"
ADD COLUMN "flaggedAt" TIMESTAMP(3),
ADD COLUMN "disabledAt" TIMESTAMP(3),
ADD COLUMN "moderationNote" TEXT;
