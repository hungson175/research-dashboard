"use client"

import { useState } from "react"
import type { Report } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bookmark, Calendar, Share2, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ReportDetailProps {
  report: Report
  userId: string
}

export function ReportDetail({ report, userId }: ReportDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(report.is_bookmarked || false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const handleBookmarkToggle = async () => {
    const supabase = createClient()
    setIsBookmarking(true)

    try {
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", userId).eq("report_id", report.id)
      } else {
        await supabase.from("bookmarks").insert({ user_id: userId, report_id: report.id })
      }
      setIsBookmarked(!isBookmarked)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error toggling bookmark:", error)
    } finally {
      setIsBookmarking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary,
          url: window.location.href,
        })
      } catch (error) {
        console.error("[v0] Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/reports/${report.id}/export`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error exporting report:", error)
      alert("Failed to export report. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const publishedDate = new Date(report.published_at)
  // Unescape newline characters from markdown content
  const unescapedMarkdown = report.markdown_content.replace(/\\n/g, '\n')

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      <div className="mb-6 md:mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {report.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDistanceToNow(publishedDate, { addSuffix: true })}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight">
              {report.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground text-pretty leading-relaxed">{report.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleBookmarkToggle} disabled={isBookmarking}>
              <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6 md:my-8" />

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="insights" className="text-sm md:text-base">
            Insights
          </TabsTrigger>
          <TabsTrigger value="full-report" className="text-sm md:text-base">
            Full Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <iframe
            srcDoc={report.html_insights}
            className="w-full border-0 rounded-lg"
            style={{ minHeight: "800px", height: "auto" }}
            title="Research Insights"
            sandbox="allow-scripts allow-same-origin"
          />
        </TabsContent>

        <TabsContent value="full-report" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <article className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{unescapedMarkdown}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </main>
  )
}
