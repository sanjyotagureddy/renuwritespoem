-- AlterTable
ALTER TABLE "poems" ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "print_cards" (
    "id" TEXT NOT NULL,
    "poemId" TEXT NOT NULL,
    "dedicatedTo" TEXT,
    "fromName" TEXT,
    "message" VARCHAR(200),
    "theme" TEXT NOT NULL DEFAULT 'classic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT NOT NULL,

    CONSTRAINT "print_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "print_cards_poemId_idx" ON "print_cards"("poemId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'print_cards_poemId_fkey'
  ) THEN
    ALTER TABLE "print_cards" ADD CONSTRAINT "print_cards_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
