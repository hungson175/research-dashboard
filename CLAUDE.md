# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 research dashboard application built with TypeScript, React 18, Supabase (for auth and database), and shadcn/ui components. The app displays research reports with bookmarking, filtering, and export capabilities.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI**: shadcn/ui (New York style) + Radix UI primitives + Tailwind CSS v4
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **Fonts**: Geist Sans and Geist Mono
- **Analytics**: Vercel Analytics

### Project Structure

```
app/
├── api/reports/[id]/export/     # Export report API endpoint
├── auth/login/                  # Authentication page
├── dashboard/                   # Main dashboard (requires auth)
├── bookmarks/                   # Bookmarked reports page
├── reports/[id]/                # Individual report detail page
├── layout.tsx                   # Root layout with fonts and analytics
└── globals.css                  # Global styles and CSS variables

components/
├── ui/                          # shadcn/ui components (50+ components)
├── report-card.tsx              # Report list item component
├── report-detail.tsx            # Full report view with sources
├── reports-feed.tsx             # Main feed with search/filter
├── report-filters.tsx           # Category and tag filters
├── bookmarked-reports.tsx       # Bookmarks list component
├── dashboard-header.tsx         # Header with user menu
└── theme-provider.tsx           # Theme context provider

lib/
├── supabase/
│   ├── client.ts                # Browser client (createBrowserClient)
│   ├── server.ts                # Server client (createServerClient)
│   └── middleware.ts            # Session update middleware
├── types.ts                     # TypeScript interfaces (Report, Source, Bookmark)
└── utils.ts                     # Utility functions (cn helper)

scripts/
├── 001_create_tables.sql        # Database schema setup
└── 002_seed_sample_data.sql     # Sample data (47 reports)

middleware.ts                     # Next.js middleware for auth session management
```

### Database Schema

Three main tables with Row Level Security enabled:

- **reports**: Core research reports (public read)
  - Fields: id, title, summary, html_insights, markdown_content, category, tags[], published_at
  - Indexed on: published_at, category

- **sources**: Report citations/references (public read)
  - Fields: id, report_id, title, url, accessed_at
  - Foreign key: report_id → reports(id) CASCADE

- **bookmarks**: User-specific saved reports (user-scoped access)
  - Fields: id, user_id, report_id, created_at
  - Policies: users can only CRUD their own bookmarks
  - Unique constraint on (user_id, report_id)

### Authentication Flow

1. Middleware (`middleware.ts`) intercepts all requests and calls `updateSession()` from `lib/supabase/middleware.ts`
2. Server components use `createClient()` from `lib/supabase/server.ts` with cookie handling
3. Client components use `createClient()` from `lib/supabase/client.ts`
4. Protected routes (dashboard, bookmarks) redirect to `/auth/login` if no user session

### Key Features

- **Real-time filtering**: Search by title/summary/tags, filter by category and tags
- **Bookmarking**: Toggle bookmarks with optimistic UI updates
- **Report export**: API endpoint at `/api/reports/[id]/export`
- **Rich content**: Reports contain both HTML insights and markdown content
- **Responsive design**: Mobile-first with Tailwind breakpoints

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public key

## Important Notes

- **Build configuration**: ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`)
- **Path aliases**: `@/*` maps to root directory (configured in `tsconfig.json`)
- **Component library**: Uses shadcn/ui "New York" style with `cn()` utility for className merging
- **Image optimization**: Disabled (`unoptimized: true`)
- **Package manager**: Project uses **pnpm** (see `pnpm-lock.yaml`)

## Database Setup

To initialize the Supabase database:
1. Run `scripts/001_create_tables.sql` in Supabase SQL Editor
2. Optionally run `scripts/002_seed_sample_data.sql` for sample reports

**Note on seed data**: The seed data contains escaped newlines (`\n` as literal strings). The application handles this in `components/report-detail.tsx` by preprocessing markdown content with `.replace(/\\n/g, '\n')` before passing to ReactMarkdown.

## Deployment

### Production Environment

**Deployed at**: https://research-dashboard-nine.vercel.app

Production uses:
- **Vercel** for hosting
- **Supabase** production instance (Project ID: xvaunweueluikscwkzlx)
- Environment variables configured in `vercel.json`

### Deployment Process

```bash
# Deploy to Vercel (requires authentication)
vercel --prod

# Or with token
vercel --token YOUR_TOKEN --yes --prod
```

**Important**: Environment variables in `vercel.json` include production Supabase credentials. This file should be committed but credentials should be rotated if repository becomes public.

### Supabase Configuration Notes

**Email Confirmation**: Production Supabase requires email confirmation by default. For demo/testing:
1. Go to Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations"
3. Or manually confirm users in Auth → Users panel

**Demo Account**:
- Email: `demo@researchdashboard.com`
- Password: `demo123456`

### Local vs Production

**Local Setup** (see `SETUP_COMPLETE.md`):
- Uses local Supabase via Docker (`supabase start`)
- Environment variables in `.env.local`
- Test user with `test@example.com` (not valid in production)

**Production**:
- Cloud Supabase instance
- Environment variables in `vercel.json`
- Requires valid email domains for user creation

## Insights Tab Rendering

The Insights tab displays complete HTML SPA reports using an iframe to preserve all custom styling and JavaScript functionality:

```typescript
// components/report-detail.tsx
<iframe
  srcDoc={report.html_insights}
  className="w-full border-0 rounded-lg"
  style={{ minHeight: "800px", height: "auto" }}
  title="Research Insights"
  sandbox="allow-scripts allow-same-origin"
/>
```

This ensures proper rendering of:
- Interactive tab navigation
- Custom MoMo design system styling
- Data tables with branded headers
- JavaScript-driven features

## Markdown Rendering Fix

The Full Report tab uses `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support. Due to escaped newlines in seed data, `components/report-detail.tsx` preprocesses content:

```typescript
const unescapedMarkdown = report.markdown_content.replace(/\\n/g, '\n')
```

This ensures proper rendering of headings, lists, and paragraphs. See `docs/archive/MARKDOWN_FIX.md` for detailed explanation.

## Documentation

Documentation is organized in the `docs/` directory:

- **docs/README.md**: Documentation index and structure guide
- **docs/setup/**: Setup and configuration guides
  - `SETUP_COMPLETE.md`: Local development setup and testing
  - `GITHUB_VERCEL_SETUP.md`: GitHub and Vercel deployment
  - `MOMO_DESIGN_ANALYSIS.md`: Design system analysis
- **docs/archive/**: Historical records and reports
  - `DEPLOYMENT_SUCCESS.md`: Production deployment guide
  - `AUTOMATED_TEST_RESULTS.md`: Playwright test results
  - `MARKDOWN_FIX.md`: Markdown rendering solution

Core documentation remains at root level:
- **CLAUDE.md**: This file - project overview and guidelines
- **specs.md**: Technical specifications
- **current_prompt.md**: Current development tasks
