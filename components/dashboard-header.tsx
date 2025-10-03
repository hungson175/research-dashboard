"use client"

import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon, FileText, Bookmark, Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  const isBookmarksPage = pathname === "/bookmarks"

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-momo-sm backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-momo group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:inline gradient-momo-text">Research Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant={isBookmarksPage ? "default" : "ghost"}
              asChild
              className={isBookmarksPage ? "gradient-momo text-white hover:shadow-momo-sm transition-all" : "hover:bg-primary/10 transition-colors"}
            >
              <Link href="/bookmarks">
                <Bookmark className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bookmarks</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-[var(--momo-gray-900)]">Account</p>
                    <p className="text-xs text-[var(--momo-gray-600)] truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
