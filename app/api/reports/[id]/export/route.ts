import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch report
  const { data: report, error: reportError } = await supabase.from("reports").select("*").eq("id", id).single()

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  // Fetch sources
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .eq("report_id", id)
    .order("created_at", { ascending: true })

  // Generate markdown content for export
  const exportContent = generateExportMarkdown(report, sources || [])

  // Return as downloadable file
  return new NextResponse(exportContent, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(report.title)}.md"`,
    },
  })
}

function generateExportMarkdown(report: any, sources: any[]): string {
  const publishedDate = new Date(report.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let markdown = `# ${report.title}\n\n`
  markdown += `**Category:** ${report.category}\n\n`
  markdown += `**Published:** ${publishedDate}\n\n`
  markdown += `**Tags:** ${report.tags.join(", ")}\n\n`
  markdown += `---\n\n`
  markdown += `## Summary\n\n${report.summary}\n\n`
  markdown += `---\n\n`
  markdown += report.markdown_content
  markdown += `\n\n---\n\n`
  markdown += `## Sources\n\n`

  if (sources.length > 0) {
    sources.forEach((source, index) => {
      markdown += `${index + 1}. **${source.title}**\n`
      markdown += `   ${source.url}\n\n`
    })
  } else {
    markdown += `No sources available.\n\n`
  }

  markdown += `\n---\n\n`
  markdown += `*Exported from Research Dashboard*\n`

  return markdown
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .substring(0, 100)
}
