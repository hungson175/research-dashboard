# Production Database Sync Instructions

## Option 1: Using Supabase SQL Editor (Recommended)

### Step 1: Disable RLS Temporarily
Go to Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
```

### Step 2: Clear Existing Data
```sql
DELETE FROM reports;
```

### Step 3: Use the Import Script
Run the sync script with environment variables:

```bash
SUPABASE_URL="https://xvaunweueluikscwkzlx.supabase.co" \
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YXVud2V1ZWx1aWtzY3dremx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDU3NDQsImV4cCI6MjA3NDg4MTc0NH0.dkGJJKvZ4RqNT7ZLr56Vn3MRMcNq9demj7FJJ-pfKaI" \
node scripts/sync_to_production.mjs
```

### Step 4: Re-enable RLS
After sync completes, go back to Supabase SQL Editor and run:

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

## Option 2: Manual Copy via SQL

### Export from Local
```bash
PGPASSWORD='postgres' psql -h localhost -p 54322 -U postgres -d postgres << 'EOF' > /tmp/reports_export.sql
\copy (
  SELECT
    id::text,
    title,
    summary,
    html_insights,
    markdown_content,
    category,
    array_to_string(tags, '||') as tags,
    published_at::text,
    created_at::text,
    updated_at::text
  FROM reports
  ORDER BY published_at DESC
) TO STDOUT WITH (FORMAT CSV, HEADER true, DELIMITER E'\t', QUOTE E'\b', ESCAPE E'\b');
EOF
```

### Then use Supabase Dashboard
1. Go to Table Editor → reports table
2. Click "Insert" → "Insert row"
3. Manually insert each report using the exported data

## Quick Verification

After syncing, verify at:
- Production: https://research-dashboard-nine.vercel.app/dashboard
- Check report count in Supabase Dashboard

## Current Local Reports

We have 4 reports ready to sync:
1. **Growth & Strategy**: Opportunities and Challenges in Vietnam's Mobile Wallet Market
2. **Technology & Innovation**: Adoption of AI and Automation in Customer Support
3. **Competitive Analysis**: Competitive Dynamics from Super-App Expansion
4. **Regulatory & Compliance**: Impact of Vietnam's Regulatory Sandbox
