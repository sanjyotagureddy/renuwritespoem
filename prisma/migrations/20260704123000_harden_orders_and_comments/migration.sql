ALTER TABLE "book_orders" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "book_orders_idempotencyKey_key" ON "book_orders"("idempotencyKey");
ALTER TABLE "comments" ALTER COLUMN "status" SET DEFAULT 'APPROVED';

ALTER TABLE "books"
  ALTER COLUMN "price" TYPE DECIMAL(10,2),
  ALTER COLUMN "discountedPrice" TYPE DECIMAL(10,2),
  ALTER COLUMN "shippingCharge" TYPE DECIMAL(10,2);
ALTER TABLE "book_orders"
  ALTER COLUMN "shippingAmount" TYPE DECIMAL(10,2),
  ALTER COLUMN "totalAmount" TYPE DECIMAL(10,2);
