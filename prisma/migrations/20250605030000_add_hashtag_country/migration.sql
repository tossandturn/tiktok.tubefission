-- Add country column to Hashtag table
ALTER TABLE "Hashtag" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'US';

-- Create index for country filtering
CREATE INDEX IF NOT EXISTS "Hashtag_country_idx" ON "Hashtag"("country");
