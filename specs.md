# Deep Research Reports Dashboard - Development Prompt

## Project Overview
Build a web-based dashboard for viewing deep research reports. The system displays 5-10 reports per week in a news feed format. Each report has two components:
- **HTML file**: Short insights/summary
- **Markdown file**: Detailed report with sources and citations

## Tech Stack
- **Frontend Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Markdown Rendering**: `react-markdown` with `remark-gfm`
- **HTML Sanitization**: DOMPurify
- **Database**: Your choice (Supabase/Firebase recommended for quick setup)
- **Deployment**: Vercel

## Core Features & Requirements

### 1. Authentication System
**Login Page** (`/login`)
- Simple, centered login form
- Email and password fields
- "Forgot password" link
- Clean, professional design
- Redirect to dashboard after successful login
- Session management with NextAuth.js

**Requirements:**
- Secure session handling
- Protected routes (redirect to login if not authenticated)
- Logout functionality

---

### 2. Dashboard/Feed Page (`/dashboard`)

**Layout Components:**

**Header Bar:**
- Logo/App name (left): "DeepResearch"
- Search bar (center): Search by keywords, topics
- Filter dropdown (right): "All Reports" | "This Week" | "Last 30 Days" | "By Topic"
- User avatar + Logout button (far right)

**Main Feed Area:**
- Display reports as cards in reverse chronological order (newest first)
- Infinite scroll or pagination (10 reports per page)
- "New" badge for reports from last 24 hours

**Report Card Component:**
Each card should display:
```
┌─────────────────────────────────────────┐
│ 📊 [Report Title]                       │
│ [Date] • [Reading Time] min read        │
│                                          │
│ [HTML Insights Preview - 3-4 lines]     │
│ Truncate with "..." if too long         │
│                                          │
│ [View Full Details →] button            │
│ ─────────────────────────────────────   │
│ 🏷️ [Tag1] [Tag2] [Tag3]                │
│ ⭐ [Bookmark icon]                       │
└─────────────────────────────────────────┘
```

**Card Styling:**
- White background with subtle shadow
- Hover effect: slight elevation + border color change
- HTML preview in light-colored box (e.g., bg-blue-50)
- Clear visual hierarchy: Title (text-xl font-bold) → Date (text-sm text-gray-500) → Preview → Actions
- Generous padding and spacing between cards

**Functionality:**
- Click anywhere on card → Navigate to report detail page
- Bookmark icon → Toggle bookmark status (persist to database)
- Search → Filter reports by title/content
- Filters → Filter by date range or tags

---

### 3. Report Detail Page (`/dashboard/reports/[id]`)

**Layout: Tabbed Interface** (Mobile-friendly)

**Header:**
- Back button (← Back to Dashboard)
- Report title
- Metadata: Date, tags, reading time

**Tab Navigation:**
```
[📊 Insights] [📄 Full Report] [🔗 Sources]
```

**Tab 1 - Insights (HTML):**
- Render sanitized HTML content
- Use DOMPurify to prevent XSS
- Styled container with proper typography
- Max-width for readability (~800px)

**Tab 2 - Full Report (Markdown):**
- Render markdown with `react-markdown`
- Support for:
  - Headers (h1-h6)
  - Lists (ordered/unordered)
  - Code blocks with syntax highlighting
  - Tables
  - Links
  - Images (if present)
- Proper styling for markdown elements
- Table of contents (auto-generated from h2/h3 headers)

**Tab 3 - Sources:**
- List all citations/references
- Format: `[1] Title - URL`
- Clickable links (open in new tab)
- Grouped by source type if applicable

**Action Buttons:**
- Bookmark/Unbookmark toggle
- Export as PDF button
- Share link button (generate secure shareable link)

**Reading Progress:**
- Sticky progress bar at top showing scroll position
- Percentage indicator

---

### 4. Data Structure

**Report Object:**
```typescript
interface Report {
  id: string;
  title: string;
  createdAt: Date;
  readingTime: number; // in minutes
  tags: string[];
  htmlContent: string; // insights
  markdownContent: string; // full report
  sources: Source[];
  isBookmarked: boolean;
  preview: string; // first 200 chars for card preview
}

interface Source {
  id: string;
  title: string;
  url: string;
  type?: string; // e.g., "article", "research", "website"
}
```

---

### 5. API Routes/Data Fetching

Create the following API endpoints or server actions:

**GET `/api/reports`**
- Query params: `?page=1&limit=10&filter=thisweek&search=keyword`
- Returns: Paginated list of reports

**GET `/api/reports/[id]`**
- Returns: Full report data (HTML + Markdown)

**POST `/api/reports/[id]/bookmark`**
- Toggle bookmark status
- Returns: Updated bookmark status

**POST `/api/reports/[id]/export`**
- Generate PDF from markdown content
- Return: PDF file download

---

### 6. UI/UX Specifications

**Design System:**
- **Colors:**
  - Primary: Blue/Navy (#1e40af)
  - Accent: Orange/Amber (#f59e0b)
  - Background: White (#ffffff) / Light Gray (#f9fafb)
  - Text: Dark Gray (#1f2937)
  - Border: Light Gray (#e5e7eb)
  
- **Typography:**
  - UI Elements: Inter or System UI font (sans-serif)
  - Report Content: Georgia or Charter (serif) for readability
  - Code blocks: JetBrains Mono or Fira Code

- **Spacing:**
  - Cards: 24px padding, 16px gap between cards
  - Page margins: 32px on desktop, 16px on mobile
  - Generous whitespace throughout

**Responsive Design:**
- Mobile: Single column, stacked layout
- Tablet: 2-column grid for feed
- Desktop: 3-column grid for feed, side-by-side for detail view

**Dark Mode:** (Optional but nice-to-have)
- Toggle in header
- Use Tailwind's dark mode classes

---

### 7. Additional Features

**Must-Have:**
- Loading states (skeleton screens for cards)
- Error handling (404 page, error boundaries)
- Empty states ("No reports yet")
- Toast notifications (bookmark saved, export successful)

**Nice-to-Have:**
- Weekly digest email with new reports
- Comments/notes functionality on reports
- Advanced search with filters (by date range, tags, keywords)
- Analytics (view count, time spent on report)

---

### 8. File Structure Suggestion

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx              # Feed page
│   │   ├── reports/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Report detail
│   │   └── layout.tsx            # Dashboard layout with header
│   ├── api/
│   │   ├── reports/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── bookmark/
│   │   │           └── route.ts
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── layout.tsx
├── components/
│   ├── ReportCard.tsx
│   ├── ReportDetail/
│   │   ├── InsightsTab.tsx
│   │   ├── FullReportTab.tsx
│   │   └── SourcesTab.tsx
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   └── FilterDropdown.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
└── types/
    └── report.ts
```

---

### 9. Development Phases

**Phase 1: Core Setup**
- Next.js project setup with Tailwind
- Authentication system (login/logout)
- Protected routes

**Phase 2: Dashboard Feed**
- Report card component
- Feed page with mock data
- Search and filter functionality

**Phase 3: Report Detail**
- Tabbed interface
- HTML and Markdown rendering
- Sources display

**Phase 4: Interactions**
- Bookmark functionality
- Export to PDF
- Share links

**Phase 5: Polish**
- Responsive design
- Loading/error states
- Performance optimization

---

## Testing Checklist
- [ ] Authentication flow works (login/logout/protected routes)
- [ ] Reports display correctly in feed
- [ ] Search and filters work
- [ ] Report detail page renders HTML and Markdown properly
- [ ] Bookmarks persist across sessions
- [ ] Mobile responsive on all pages
- [ ] XSS protection (HTML sanitization works)
- [ ] Export PDF functionality works
- [ ] Performance: Page load < 2s, smooth scrolling

---

## Additional Notes
- Prioritize clean, readable code with TypeScript
- Use server components where possible for better performance
- Implement proper error boundaries
- Add proper meta tags for SEO
- Ensure WCAG 2.1 AA accessibility compliance
- Use environment variables for sensitive data

---

## Success Criteria
The dashboard should allow the boss to:
1. Login securely in < 5 seconds
2. See all reports in a clean, scannable feed
3. Quickly preview insights without leaving the feed
4. Dive into full details when needed
5. Bookmark important reports for later
6. Search and filter reports efficiently
7. Access on mobile/tablet/desktop seamlessly