-- Add a customer-friendly order number while keeping the internal cuid primary key.
-- Nullable keeps existing orders safe; new orders are assigned an order number by the app.

ALTER TABLE "book_orders"
  ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "book_orders_orderNumber_key"
  ON "book_orders"("orderNumber");
