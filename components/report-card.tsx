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
    <Card className="flex flex-col hover:shadow-lg transition-all duration-200 hover:border-primary/50 group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="font-medium">
            {report.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-primary/10"
            onClick={() => onBookmarkToggle(report.id, report.is_bookmarked || false)}
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${report.is_bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
            <span className="sr-only">{report.is_bookmarked ? "Remove bookmark" : "Add bookmark"}</span>
          </Button>
        </div>
        <CardTitle className="text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {report.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          {formatDistanceToNow(publishedDate, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{report.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {report.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {report.tags.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{report.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full group/button">
          <Link href={`/reports/${report.id}`}>
            Read Report
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
