import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ReportDetail } from "@/components/report-detail"

interface ReportPageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch report
  const { data: report, error: reportError } = await supabase.from("reports").select("*").eq("id", id).single()

  if (reportError || !report) {
    notFound()
  }

  // Fetch sources
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .eq("report_id", id)
    .order("created_at", { ascending: true })

  // Check if bookmarked
  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("report_id", id)
    .single()

  const reportWithBookmark = {
    ...report,
    is_bookmarked: !!bookmark,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <ReportDetail report={reportWithBookmark} sources={sources || []} userId={user.id} />
    </div>
  )
}
