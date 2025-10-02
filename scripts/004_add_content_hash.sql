-- Add content_hash column to reports table for duplicate detection
ALTER TABLE reports ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Create index on content_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_content_hash ON reports(content_hash);

-- Add unique constraint to prevent duplicate content
ALTER TABLE reports ADD CONSTRAINT unique_content_hash UNIQUE (content_hash);
