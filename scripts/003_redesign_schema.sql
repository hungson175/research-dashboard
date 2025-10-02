-- Drop existing tables and redesign schema
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Create reports table with support for full HTML SPA
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    html_insights TEXT, -- Full HTML SPA content (complete with styles, scripts, etc.)
    markdown_content TEXT, -- Full markdown content
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookmarks table (user-specific saved reports)
CREATE TABLE bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, report_id)
);

-- Create indexes for performance
CREATE INDEX idx_reports_published_at ON reports(published_at DESC);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_report_id ON bookmarks(report_id);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports (public read access)
CREATE POLICY "Reports are viewable by everyone"
    ON reports FOR SELECT
    USING (true);

CREATE POLICY "Reports are insertable by authenticated users"
    ON reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Reports are updatable by authenticated users"
    ON reports FOR UPDATE
    USING (auth.role() = 'authenticated');

-- RLS Policies for bookmarks (user-specific access)
CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);
