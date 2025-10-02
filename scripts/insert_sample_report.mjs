import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertSampleReport() {
  try {
    console.log('📖 Reading files...')

    // Read the HTML insights file (complete SPA)
    const htmlPath = join(__dirname, '../public/sample_pages/insights_mrt_topic_1__research_brief_1_impact_of_regula_20250930_1509.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Read the markdown content
    const markdownPath = join(__dirname, '../public/sample_pages/mrt_topic_1__research_brief_1_impact_of_regula_20250930_1509.md')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

    console.log('✅ Files read successfully')
    console.log(`   HTML size: ${(htmlContent.length / 1024).toFixed(2)} KB`)
    console.log(`   Markdown size: ${(markdownContent.length / 1024).toFixed(2)} KB`)

    // Extract title from markdown (first # heading after line 8)
    const lines = markdownContent.split('\n')
    let title = 'Impact of Vietnam\'s Regulatory Sandbox on MoMo\'s Innovations in P2P Lending and Open API Integrations'
    for (let i = 8; i < lines.length; i++) {
      if (lines[i].startsWith('# ') && !lines[i].startsWith('## ')) {
        title = lines[i].replace(/^#\s+/, '').trim()
        break
      }
    }

    // Extract summary from markdown (first paragraph of Executive Summary)
    const summaryMatch = markdownContent.match(/## Executive Summary\s+([^\n]+)/);
    const summary = summaryMatch ? summaryMatch[1].trim() :
      'Vietnam\'s Decree No. 94/2025/ND-CP establishes a regulatory sandbox for fintech innovations including P2P lending and Open API integrations, presenting opportunities for MoMo to accelerate innovation while navigating compliance requirements.'

    console.log('\n📝 Inserting report into database...')
    console.log(`   Title: ${title}`)

    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        summary,
        html_insights: htmlContent,
        markdown_content: markdownContent,
        category: 'Regulatory & Compliance',
        tags: ['Fintech', 'Regulatory Sandbox', 'P2P Lending', 'Open API', 'Vietnam', 'MoMo', 'Banking Innovation'],
        published_at: '2025-09-30T15:09:00Z'
      })
      .select()

    if (error) {
      console.error('❌ Error inserting report:', error)
      process.exit(1)
    }

    console.log('\n✅ Sample report inserted successfully!')
    console.log(`   Report ID: ${data[0].id}`)
    console.log(`   Category: ${data[0].category}`)
    console.log(`   Tags: ${data[0].tags.join(', ')}`)
    console.log(`\n🔗 View at: http://localhost:3003/reports/${data[0].id}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

insertSampleReport()
