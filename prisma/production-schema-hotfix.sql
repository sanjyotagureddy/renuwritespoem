-- Safe to run repeatedly against the existing production database.
-- Adds fields required by the current deployed application without deleting data.

ALTER TABLE "book_orders"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "book_orders_idempotencyKey_key"
  ON "book_orders"("idempotencyKey");

ALTER TABLE "comments"
  ALTER COLUMN "status" SET DEFAULT 'APPROVED';

ALTER TABLE "books"
  ALTER COLUMN "price" TYPE DECIMAL(10,2) USING "price"::DECIMAL(10,2),
  ALTER COLUMN "discountedPrice" TYPE DECIMAL(10,2) USING "discountedPrice"::DECIMAL(10,2),
  ALTER COLUMN "shippingCharge" TYPE DECIMAL(10,2) USING "shippingCharge"::DECIMAL(10,2);

ALTER TABLE "book_orders"
  ALTER COLUMN "shippingAmount" TYPE DECIMAL(10,2) USING "shippingAmount"::DECIMAL(10,2),
  ALTER COLUMN "totalAmount" TYPE DECIMAL(10,2) USING "totalAmount"::DECIMAL(10,2);
