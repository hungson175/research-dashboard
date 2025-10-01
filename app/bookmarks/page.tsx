import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { BookmarkedReports } from "@/components/bookmarked-reports"

export default async function BookmarksPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Bookmarked Reports</h1>
          <p className="text-muted-foreground text-lg">Your saved research reports for quick access</p>
        </div>
        <BookmarkedReports userId={user.id} />
      </main>
    </div>
  )
}
