import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Production Supabase credentials
const supabaseUrl = 'https://xvaunweueluikscwkzlx.supabase.co'
// NOTE: You need to provide the production service role key
// Get it from: Supabase Dashboard > Project Settings > API > service_role key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('   Get it from: Supabase Dashboard > Project Settings > API > service_role key')
  console.error('   Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/update_production_reports.mjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Report metadata configuration
const reportMetadata = [
  {
    category: 'Regulatory & Compliance',
    tags: ['Fintech', 'Regulatory', 'Foreign Ownership', 'Banking', 'Vietnam', 'MoMo'],
    published_at: '2025-10-03T15:42:00Z'
  },
  {
    category: 'Competitive Analysis',
    tags: ['Competition', 'Market Analysis', 'E-Wallets', 'Vietnam', 'Strategy'],
    published_at: '2025-10-03T16:11:00Z'
  },
  {
    category: 'Technology & Security',
    tags: ['Cybersecurity', 'Digital Payments', 'Risk Management', 'Technology', 'Vietnam'],
    published_at: '2025-10-03T16:58:00Z'
  },
  {
    category: 'Customer Insights',
    tags: ['Gen Z', 'User Behavior', 'Demographics', 'Market Research', 'Vietnam'],
    published_at: '2025-10-03T17:58:00Z'
  },
  {
    category: 'Competitive Analysis',
    tags: ['Competition', 'Strategic Analysis', 'Market Position', 'MoMo', 'Vietnam'],
    published_at: '2025-10-03T18:19:00Z'
  },
  {
    category: 'Business Development',
    tags: ['Merchant Network', 'Partnerships', 'Expansion', 'Business Strategy', 'Vietnam'],
    published_at: '2025-10-03T18:48:00Z'
  },
  {
    category: 'Partnerships & Alliances',
    tags: ['Banking', 'Partnerships', 'Financial Services', 'Strategy', 'Vietnam'],
    published_at: '2025-10-03T19:10:00Z'
  },
  {
    category: 'Growth & Expansion',
    tags: ['Rural Markets', 'Expansion', 'Market Penetration', 'Growth', 'Vietnam'],
    published_at: '2025-10-03T19:32:00Z'
  },
  {
    category: 'International Expansion',
    tags: ['Cross-border', 'International', 'Remittances', 'Expansion', 'Southeast Asia'],
    published_at: '2025-10-03T19:57:00Z'
  },
  {
    category: 'Customer Retention',
    tags: ['User Retention', 'Engagement', 'Customer Loyalty', 'Strategy', 'Vietnam'],
    published_at: '2025-10-03T20:18:00Z'
  }
]

async function deleteAllReports() {
  try {
    console.log('🗑️  Deleting all existing reports from PRODUCTION...')

    const { error } = await supabase
      .from('reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (error) {
      console.error(`   ❌ Error deleting reports: ${error.message}`)
      return false
    }

    console.log('   ✅ All reports deleted successfully\n')
    return true
  } catch (error) {
    console.error('   ❌ Error:', error.message)
    return false
  }
}

async function insertReport(reportDir, metadata, index) {
  try {
    console.log(`\n📖 Processing ${reportDir}...`)

    const reportPath = join(__dirname, '../sample_pages/complete_reports', reportDir)
    const files = readdirSync(reportPath)

    // Find HTML file (insights_*.html)
    const htmlFile = files.find(f => f.endsWith('.html'))
    // Find English markdown file (not starting with m_c_)
    const markdownFile = files.find(f => f.endsWith('.md') && !f.startsWith('m_c_'))

    if (!htmlFile || !markdownFile) {
      console.error(`   ❌ Missing required files in ${reportDir}`)
      return null
    }

    // Read files
    const htmlContent = readFileSync(join(reportPath, htmlFile), 'utf-8')
    const markdownContent = readFileSync(join(reportPath, markdownFile), 'utf-8')

    console.log(`   HTML: ${(htmlContent.length / 1024).toFixed(2)} KB`)
    console.log(`   Markdown: ${(markdownContent.length / 1024).toFixed(2)} KB`)

    // Extract title from markdown (first # heading)
    const lines = markdownContent.split('\n')
    let title = 'Research Report'
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      if (lines[i].startsWith('# ') && !lines[i].startsWith('## ')) {
        title = lines[i].replace(/^#\s+/, '').trim()
        break
      }
    }

    // Extract summary from markdown (first paragraph after Executive Summary or first paragraph)
    let summary = ''
    const execSummaryMatch = markdownContent.match(/## Executive Summary\s+([^\n]+)/)
    if (execSummaryMatch) {
      summary = execSummaryMatch[1].trim()
    } else {
      // Find first substantial paragraph
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.length > 100 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
          summary = line
          break
        }
      }
    }

    console.log(`   Title: ${title.substring(0, 60)}...`)
    console.log(`   Category: ${metadata.category}`)

    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        summary,
        html_insights: htmlContent,
        markdown_content: markdownContent,
        category: metadata.category,
        tags: metadata.tags,
        published_at: metadata.published_at
      })
      .select()

    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
      return null
    }

    console.log(`   ✅ Inserted - ID: ${data[0].id}`)
    return data[0]

  } catch (error) {
    console.error(`   ❌ Error processing ${reportDir}:`, error.message)
    return null
  }
}

async function updateAllReports() {
  try {
    console.log('🚀 Starting PRODUCTION database update...\n')
    console.log('⚠️  WARNING: This will delete all existing reports in PRODUCTION!\n')

    // Step 1: Delete all existing reports
    const deleted = await deleteAllReports()
    if (!deleted) {
      console.error('Failed to delete existing reports. Aborting.')
      process.exit(1)
    }

    // Step 2: Get all report directories
    const completeReportsDir = join(__dirname, '../sample_pages/complete_reports')
    const reportDirs = readdirSync(completeReportsDir)
      .filter(f => f.startsWith('report_'))
      .sort()

    console.log(`Found ${reportDirs.length} report directories`)

    const results = []

    // Step 3: Insert each report
    for (let i = 0; i < reportDirs.length; i++) {
      const result = await insertReport(reportDirs[i], reportMetadata[i], i)
      if (result) {
        results.push(result)
      }
    }

    console.log(`\n✅ PRODUCTION database update complete!`)
    console.log(`   Successfully inserted: ${results.length} reports`)
    console.log(`\n📊 Summary:`)
    results.forEach(r => {
      console.log(`   - ${r.category}: ${r.title.substring(0, 50)}...`)
    })

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

updateAllReports()
