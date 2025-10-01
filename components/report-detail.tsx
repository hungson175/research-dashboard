"use client"

import { useState } from "react"
import type { Report, Source } from "@/lib/types"
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
import DOMPurify from "isomorphic-dompurify"

interface ReportDetailProps {
  report: Report
  sources: Source[]
  userId: string
}

export function ReportDetail({ report, sources, userId }: ReportDetailProps) {
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
  const sanitizedInsights = DOMPurify.sanitize(report.html_insights)
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
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="insights" className="text-sm md:text-base">
            Insights
          </TabsTrigger>
          <TabsTrigger value="full-report" className="text-sm md:text-base">
            Full Report
          </TabsTrigger>
          <TabsTrigger value="sources" className="text-sm md:text-base">
            Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div
                className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h3:text-xl prose-h3:mb-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-foreground prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: sanitizedInsights }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full-report" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <article className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:my-1 prose-strong:text-foreground prose-strong:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{unescapedMarkdown}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {sources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sources available for this report.</p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">References & Sources</h3>
                  <div className="space-y-3">
                    {sources.map((source, index) => (
                      <div
                        key={source.id}
                        className="flex gap-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1.5 leading-tight">{source.title}</h4>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all flex items-center gap-1 group"
                          >
                            <span className="line-clamp-1">{source.url}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Accessed {formatDistanceToNow(new Date(source.accessed_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
