export interface Report {
  id: string
  title: string
  summary: string
  html_insights: string
  markdown_content: string
  category: string
  tags: string[]
  published_at: string
  created_at: string
  updated_at: string
  is_bookmarked?: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  report_id: string
  created_at: string
}
