import { createClient } from '@/lib/supabase/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

// Report metadata mapping
const reportMetadata: Record<string, { category: string; tags: string[]; published_at: string }> = {
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

function generateContentHash(htmlContent: string, markdownContent: string): string {
  const combinedContent = htmlContent + markdownContent
  return createHash('sha256').update(combinedContent).digest('hex')
}

function extractTitle(markdownContent: string): string {
  const lines = markdownContent.split('\n')

  // Look for the main title (second # heading, usually around line 9)
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim()
    if (i > 5 && line.startsWith('# ') && !line.startsWith('## ')) {
      return line.replace(/^#\s+/, '').trim()
    }
  }

  return 'Research Report'
}

function extractSummary(markdownContent: string): string {
  // Extract first paragraph after Executive Summary or first substantial paragraph
  const execSummaryMatch = markdownContent.match(/## Executive Summary\s+([^\n]+)/)
  if (execSummaryMatch) {
    return execSummaryMatch[1].trim()
  }

  const lines = markdownContent.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length > 100 && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      return trimmed
    }
  }

  return 'Research report summary not available.'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication (optional for now - can add API key later)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Log auth status but don't block (for development)
    if (user) {
      console.log('[Sync API] Authenticated user:', user.email)
    } else {
      console.log('[Sync API] Running unauthenticated (dev mode)')
    }

    console.log('[Sync API] Starting report sync...')

    const samplePagesDir = join(process.cwd(), 'sample_pages')

    // Read all markdown files
    const files = await readdir(samplePagesDir)
    const markdownFiles = files.filter(f => f.endsWith('.md') && f.startsWith('mrt_')).sort()

    console.log(`[Sync API] Found ${markdownFiles.length} markdown files`)

    const results = {
      success: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    }

    for (const mdFile of markdownFiles) {
      try {
        // Extract topic ID
        const topicMatch = mdFile.match(/topic_(\d+)/)
        if (!topicMatch) {
          console.log(`[Sync API] Skipping ${mdFile} - no topic ID found`)
          continue
        }

        const topicId = `topic_${topicMatch[1]}`
        const metadata = reportMetadata[topicId]

        if (!metadata) {
          console.log(`[Sync API] Skipping ${mdFile} - no metadata found`)
          continue
        }

        // Construct file paths
        const htmlFile = mdFile.replace('.md', '.html').replace(/^mrt_/, 'insights_mrt_')
        const htmlPath = join(samplePagesDir, htmlFile)
        const markdownPath = join(samplePagesDir, mdFile)

        // Read files
        const [htmlContent, markdownContent] = await Promise.all([
          readFile(htmlPath, 'utf-8'),
          readFile(markdownPath, 'utf-8')
        ])

        // Generate content hash
        const contentHash = generateContentHash(htmlContent, markdownContent)

        // Check if report with this hash already exists
        const { data: existingReport } = await supabase
          .from('reports')
          .select('id, title')
          .eq('content_hash', contentHash)
          .single()

        if (existingReport) {
          console.log(`[Sync API] Skipping ${topicId} - already exists (hash: ${contentHash.substring(0, 8)})`)
          results.skipped.push(`${topicId}: ${existingReport.title}`)
          continue
        }

        // Extract title and summary
        const title = extractTitle(markdownContent)
        const summary = extractSummary(markdownContent)

        console.log(`[Sync API] Inserting ${topicId}: ${title.substring(0, 50)}...`)

        // Insert the report
        const { data, error } = await supabase
          .from('reports')
          .insert({
            title,
            summary,
            html_insights: htmlContent,
            markdown_content: markdownContent,
            content_hash: contentHash,
            category: metadata.category,
            tags: metadata.tags,
            published_at: metadata.published_at
          })
          .select()

        if (error) {
          console.error(`[Sync API] Error inserting ${topicId}:`, error)
          results.errors.push(`${topicId}: ${error.message}`)
        } else {
          console.log(`[Sync API] ✓ Inserted ${topicId}`)
          results.success.push(`${topicId}: ${title}`)
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[Sync API] Error processing ${mdFile}:`, errorMsg)
        results.errors.push(`${mdFile}: ${errorMsg}`)
      }
    }

    console.log('[Sync API] Sync complete:', results)

    return NextResponse.json({
      message: 'Sync completed',
      results: {
        total: markdownFiles.length,
        inserted: results.success.length,
        skipped: results.skipped.length,
        failed: results.errors.length
      },
      details: results
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Sync API] Fatal error:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
