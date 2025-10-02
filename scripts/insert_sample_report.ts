import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertSampleReport() {
  try {
    // Read the HTML insights file (complete SPA)
    const htmlPath = join(process.cwd(), 'public/sample_pages/insights_mrt_topic_1__research_brief_1_impact_of_regula_20250930_1509.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Read the markdown content
    const markdownPath = join(process.cwd(), 'public/sample_pages/mrt_topic_1__research_brief_1_impact_of_regula_20250930_1509.md')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

    // Extract title from markdown (first # heading)
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : 'Impact of Regulatory Sandbox on MoMo\'s P2P & Open API Innovation'

    // Extract summary from markdown (Executive Summary section)
    const summaryMatch = markdownContent.match(/## Executive Summary\s+(.+?)(?=\n##)/s)
    const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 300) + '...' :
      'Vietnam\'s new Decree No. 94/2025/ND-CP creates a landmark regulatory sandbox for fintech innovation, enabling controlled testing of P2P lending and Open API solutions.'

    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        summary,
        html_insights: htmlContent,
        markdown_content: markdownContent,
        category: 'Regulatory & Compliance',
        tags: ['Fintech', 'Regulatory Sandbox', 'P2P Lending', 'Open API', 'Vietnam', 'MoMo'],
        published_at: '2025-09-30T15:09:00Z'
      })
      .select()

    if (error) {
      console.error('Error inserting report:', error)
      process.exit(1)
    }

    console.log('✅ Sample report inserted successfully!')
    console.log('Report ID:', data[0].id)
    console.log('Title:', data[0].title)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

insertSampleReport()
