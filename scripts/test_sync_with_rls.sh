#!/bin/bash

echo "🔓 Disabling RLS..."
PGPASSWORD='postgres' psql -h localhost -p 54322 -U postgres -d postgres -c "ALTER TABLE reports DISABLE ROW LEVEL SECURITY;"

echo ""
echo "🚀 Testing sync API..."
curl -X POST http://localhost:3002/api/sync-reports 2>/dev/null | jq '.'

echo ""
echo "🔒 Re-enabling RLS..."
PGPASSWORD='postgres' psql -h localhost -p 54322 -U postgres -d postgres -c "ALTER TABLE reports ENABLE ROW LEVEL SECURITY;"
