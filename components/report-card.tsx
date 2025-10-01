"use client"

import type { Report } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ReportCardProps {
  report: Report
  onBookmarkToggle: (reportId: string, isBookmarked: boolean) => void
}

export function ReportCard({ report, onBookmarkToggle }: ReportCardProps) {
  const publishedDate = new Date(report.published_at)

  return (
    <Card className="card-momo flex flex-col shadow-momo-sm group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="badge-momo">
            {report.category}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-primary/10 transition-all"
            onClick={() => onBookmarkToggle(report.id, report.is_bookmarked || false)}
          >
            <Bookmark
              className={`h-4 w-4 transition-all ${report.is_bookmarked ? "fill-primary text-primary scale-110" : "text-muted-foreground"}`}
            />
            <span className="sr-only">{report.is_bookmarked ? "Remove bookmark" : "Add bookmark"}</span>
          </Button>
        </div>
        <CardTitle className="text-xl font-bold leading-tight line-clamp-2 text-[var(--momo-gray-900)] group-hover:gradient-momo-text transition-all">
          {report.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs text-[var(--momo-gray-600)]">
          <Calendar className="h-3.5 w-3.5" />
          {formatDistanceToNow(publishedDate, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-[var(--momo-gray-600)] line-clamp-3 leading-relaxed">{report.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {report.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              {tag}
            </Badge>
          ))}
          {report.tags.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary">
              +{report.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="btn-momo w-full group/button">
          <Link href={`/reports/${report.id}`}>
            Read Report
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
