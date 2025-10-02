# Sync Reports to Production

## ✅ API Sync Endpoint Created

We've created an API endpoint (`/api/sync-reports`) that:
- Reads HTML and markdown files from `sample_pages/` directory
- Generates content hash for duplicate detection
- Inserts reports into database
- Skips duplicates automatically

## 📋 Pre-requisites

1. **Database Migration**: Run this SQL in Supabase SQL Editor (both local AND production):

```sql
-- Add content_hash column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_reports_content_hash ON reports(content_hash);
ALTER TABLE reports ADD CONSTRAINT unique_content_hash UNIQUE (content_hash);
```

2. **Sample Files**: Ensure `sample_pages/` directory contains:
   - `insights_mrt_topic_*.html` files
   - `mrt_topic_*.md` files

## 🚀 Production Deployment Steps

### Step 1: Deploy Code to Vercel

```bash
git add .
git commit -m "Add sync API endpoint with hash-based duplicate detection"
git push origin master
```

Vercel will automatically deploy.

### Step 2: Run Database Migration in Production

Go to Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE reports ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_reports_content_hash ON reports(content_hash);
```

**Note**: Skip the UNIQUE constraint in production if you want to allow manual duplicates.

### Step 3: Temporarily Disable RLS (Production)

In Supabase SQL Editor:

```sql
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
```

###Step 4: Call the Sync API

```bash
curl -X POST https://research-dashboard-nine.vercel.app/api/sync-reports
```

Or use the browser:
1. Navigate to https://research-dashboard-nine.vercel.app/dashboard
2. Open DevTools Console
3. Run:
```javascript
fetch('/api/sync-reports', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Step 5: Re-enable RLS (Production)

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### Step 6: Verify

Visit: https://research-dashboard-nine.vercel.app/dashboard

You should see all 4 reports:
1. **Regulatory & Compliance**: Impact of Vietnam's Regulatory Sandbox
2. **Competitive Analysis**: Competitive Dynamics from Super-App Expansion
3. **Technology & Innovation**: Adoption of AI and Biometric Security
4. **Growth & Strategy**: Opportunities and Risks in Financial Inclusion

## 🔄 Re-running the Sync

The API automatically skips duplicates based on content hash. If you need to force re-insert:

1. Delete existing reports in Supabase Table Editor
2. Call the API again

## 🔐 Security Note

Current implementation allows unauthenticated access for development. For production, consider:

1. **Option A**: Add API key authentication
2. **Option B**: Require admin user authentication
3. **Option C**: Remove the endpoint after initial sync

## 📊 API Response Format

Success response:
```json
{
  "message": "Sync completed",
  "results": {
    "total": 4,
    "inserted": 4,
    "skipped": 0,
    "failed": 0
  },
  "details": {
    "success": ["topic_1: Title...", ...],
    "skipped": [],
    "errors": []
  }
}
```

## ✅ Local Testing

```bash
# With RLS disabled
bash scripts/test_sync_with_rls.sh
```

---

**Ready for production!** 🎉
