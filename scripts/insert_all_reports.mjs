import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

// Report metadata configuration
const reportMetadata = {
  'topic_1': {
    category: 'Regulatory & Compliance',
    tags: ['Fintech', 'Regulatory Sandbox', 'P2P Lending', 'Open API', 'Vietnam', 'MoMo', 'Banking Innovation'],
    published_at: '2025-09-30T15:09:00Z'
  },
  'topic_2': {
    category: 'Competitive Analysis',
    tags: ['Competition', 'Market Dynamics', 'MoMo', 'E-Wallets', 'Vietnam', 'Strategy'],
    published_at: '2025-09-30T15:28:00Z'
  },
  'topic_3': {
    category: 'Technology & Innovation',
    tags: ['AI', 'Automation', 'Technology', 'Digital Transformation', 'MoMo', 'Innovation'],
    published_at: '2025-09-30T16:09:00Z'
  },
  'topic_4': {
    category: 'Growth & Strategy',
    tags: ['Growth', 'Market Opportunities', 'Strategy', 'Expansion', 'MoMo', 'Business Development'],
    published_at: '2025-09-30T16:24:00Z'
  }
}

async function insertReport(topicId, htmlPath, markdownPath) {
  try {
    console.log(`\n📖 Processing ${topicId}...`)

    // Read files
    const htmlContent = readFileSync(htmlPath, 'utf-8')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

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

    // Get metadata for this topic
    const metadata = reportMetadata[topicId]

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
    console.error(`   ❌ Error processing ${topicId}:`, error.message)
    return null
  }
}

async function insertAllReports() {
  try {
    console.log('🚀 Starting batch insert of sample reports...\n')

    const samplePagesDir = join(__dirname, '../sample_pages')

    // Get all markdown files
    const files = readdirSync(samplePagesDir)
    const markdownFiles = files.filter(f => f.endsWith('.md')).sort()

    console.log(`Found ${markdownFiles.length} markdown files`)

    const results = []

    for (const mdFile of markdownFiles) {
      // Extract topic ID (e.g., "topic_1" from "mrt_topic_1__...")
      const topicMatch = mdFile.match(/topic_(\d+)/)
      if (!topicMatch) continue

      const topicId = `topic_${topicMatch[1]}`

      // Construct corresponding HTML filename by replacing .md with .html and adding insights_ prefix
      const htmlFile = mdFile.replace('.md', '.html').replace(/^mrt_/, 'insights_mrt_')

      const htmlPath = join(samplePagesDir, htmlFile)
      const markdownPath = join(samplePagesDir, mdFile)

      const result = await insertReport(topicId, htmlPath, markdownPath)
      if (result) {
        results.push(result)
      }
    }

    console.log(`\n✅ Batch insert complete!`)
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

insertAllReports()
