"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Report } from "@/lib/types"
import { ReportCard } from "@/components/report-card"
import { Bookmark } from "lucide-react"

interface BookmarkedReportsProps {
  userId: string
}

export function BookmarkedReports({ userId }: BookmarkedReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBookmarkedReports()
  }, [userId])

  const fetchBookmarkedReports = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Fetch bookmarked report IDs
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("report_id")
        .eq("user_id", userId)

      if (bookmarksError) throw bookmarksError

      if (bookmarks.length === 0) {
        setReports([])
        setIsLoading(false)
        return
      }

      const reportIds = bookmarks.map((b) => b.report_id)

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .in("id", reportIds)
        .order("published_at", { ascending: false })

      if (reportsError) throw reportsError

      const reportsWithBookmarks = reportsData.map((report) => ({
        ...report,
        is_bookmarked: true,
      }))

      setReports(reportsWithBookmarks)
    } catch (error) {
      console.error("[v0] Error fetching bookmarked reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmarkToggle = async (reportId: string) => {
    const supabase = createClient()

    try {
      await supabase.from("bookmarks").delete().eq("user_id", userId).eq("report_id", reportId)

      // Remove from local state
      setReports((prev) => prev.filter((report) => report.id !== reportId))
    } catch (error) {
      console.error("[v0] Error removing bookmark:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
        <p className="text-muted-foreground">Start bookmarking reports to save them for later.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onBookmarkToggle={handleBookmarkToggle} />
      ))}
    </div>
  )
}
