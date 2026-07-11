-- Migration: add_attribution_log_and_signup_source
-- Adds the attribution_logs table for UTM tracking and signUpSource column on users

-- Add signUpSource to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "signUpSource" TEXT;

-- Create attribution_logs table
CREATE TABLE IF NOT EXISTS "attribution_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribution_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "attribution_logs_source_idx" ON "attribution_logs"("source");
CREATE INDEX IF NOT EXISTS "attribution_logs_createdAt_idx" ON "attribution_logs"("createdAt");
