"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Report } from "@/lib/types"
import { ReportCard } from "@/components/report-card"
import { ReportFilters } from "@/components/report-filters"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ReportsFeedProps {
  userId: string
}

export function ReportsFeed({ userId }: ReportsFeedProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [userId])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery, selectedCategory, selectedTags])

  const fetchReports = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("published_at", { ascending: false })

      if (reportsError) throw reportsError

      // Fetch user's bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("report_id")
        .eq("user_id", userId)

      if (bookmarksError) throw bookmarksError

      const bookmarkedIds = new Set(bookmarksData.map((b) => b.report_id))

      const reportsWithBookmarks = reportsData.map((report) => ({
        ...report,
        is_bookmarked: bookmarkedIds.has(report.id),
      }))

      setReports(reportsWithBookmarks)
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = [...reports]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.summary.toLowerCase().includes(query) ||
          report.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((report) => report.category === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((report) => selectedTags.some((tag) => report.tags.includes(tag)))
    }

    setFilteredReports(filtered)
  }

  const handleBookmarkToggle = async (reportId: string, isBookmarked: boolean) => {
    const supabase = createClient()

    try {
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", userId).eq("report_id", reportId)
      } else {
        await supabase.from("bookmarks").insert({ user_id: userId, report_id: reportId })
      }

      // Update local state
      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, is_bookmarked: !isBookmarked } : report)),
      )
    } catch (error) {
      console.error("[v0] Error toggling bookmark:", error)
    }
  }

  const allCategories = Array.from(new Set(reports.map((r) => r.category)))
  const allTags = Array.from(new Set(reports.flatMap((r) => r.tags)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ReportFilters
          categories={allCategories}
          tags={allTags}
          selectedCategory={selectedCategory}
          selectedTags={selectedTags}
          onCategoryChange={setSelectedCategory}
          onTagsChange={setSelectedTags}
        />
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reports found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
