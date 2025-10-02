import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
const { Client } = pg

// Local PostgreSQL connection
const localClient = new Client({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
})

// Production Supabase connection
const prodSupabase = createClient(
  'https://xvaunweueluikscwkzlx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YXVud2V1ZWx1aWtzY3dremx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDU3NDQsImV4cCI6MjA3NDg4MTc0NH0.dkGJJKvZ4RqNT7ZLr56Vn3MRMcNq9demj7FJJ-pfKaI'
)

async function syncToProduction() {
  try {
    console.log('🚀 Starting sync to production Supabase...\n')

    // Connect to local database
    console.log('📡 Connecting to local database...')
    await localClient.connect()
    console.log('✅ Connected to local database\n')

    // Fetch all reports from local database
    console.log('📥 Fetching reports from local database...')
    const result = await localClient.query(`
      SELECT id, title, summary, html_insights, markdown_content, category, tags, published_at, created_at, updated_at
      FROM reports
      ORDER BY published_at DESC
    `)
    console.log(`✅ Found ${result.rows.length} reports\n`)

    if (result.rows.length === 0) {
      console.log('⚠️  No reports found in local database. Exiting.')
      return
    }

    // Check existing reports in production
    console.log('🔍 Checking production database...')
    const { data: existingReports, error: fetchError } = await prodSupabase
      .from('reports')
      .select('id, title')

    if (fetchError) {
      console.error('❌ Error fetching from production:', fetchError)
      throw fetchError
    }

    console.log(`   Found ${existingReports?.length || 0} existing reports in production\n`)

    // Clear existing reports in production (optional - ask user)
    if (existingReports && existingReports.length > 0) {
      console.log('🗑️  Clearing existing reports in production...')
      const { error: deleteError } = await prodSupabase
        .from('reports')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('❌ Error deleting from production:', deleteError)
        throw deleteError
      }
      console.log('✅ Cleared production database\n')
    }

    // Insert reports into production
    console.log('📤 Syncing reports to production...')
    let successCount = 0
    let errorCount = 0

    for (const report of result.rows) {
      console.log(`   Processing: ${report.title.substring(0, 60)}...`)

      const { error } = await prodSupabase
        .from('reports')
        .insert({
          id: report.id,
          title: report.title,
          summary: report.summary,
          html_insights: report.html_insights,
          markdown_content: report.markdown_content,
          category: report.category,
          tags: report.tags,
          published_at: report.published_at,
          created_at: report.created_at,
          updated_at: report.updated_at
        })

      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Synced`)
        successCount++
      }
    }

    console.log(`\n✨ Sync complete!`)
    console.log(`   Successfully synced: ${successCount} reports`)
    if (errorCount > 0) {
      console.log(`   Failed: ${errorCount} reports`)
    }

    // Verify final count
    const { count } = await prodSupabase
      .from('reports')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Production database now contains: ${count} reports`)
    console.log(`\n🔗 View at: https://research-dashboard-nine.vercel.app/dashboard`)

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await localClient.end()
    console.log('\n👋 Disconnected from local database')
  }
}

syncToProduction()
