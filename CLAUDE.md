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

**Development Server Notes:**
- Run dev server in background when working on code
- Use BashOutput tool to check server output if needed
- Default port: 3000 (or 3003 if 3000 is taken)

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

### Initial Setup
To initialize the Supabase database:
1. Run `scripts/001_create_tables.sql` in Supabase SQL Editor (creates tables and RLS policies)
2. Optionally run `scripts/002_seed_sample_data.sql` for sample reports (47 reports)

### Schema Migrations
Additional migration scripts available:
- `scripts/003_redesign_schema.sql`: Schema redesign updates
- `scripts/004_add_content_hash.sql`: Adds content_hash column for duplicate detection

### Data Sync Scripts
Node.js scripts for syncing data between local and production:
- `scripts/insert_sample_report.mjs`: Insert single report from local files
- `scripts/insert_all_reports.mjs`: Batch insert all reports
- `scripts/sync_to_production.mjs`: Sync local data to production Supabase
- `scripts/test_sync_api.mjs`: Test sync API endpoints
- `scripts/test_sync_with_rls.sh`: Test Row Level Security policies

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

**Known Issues:**
- HTML content in iframe may not match original page formatting exactly
- Some interactive elements (tabs, tables) may require CSS/JS adjustments
- Test rendering at `/reports/[id]` against original HTML files in `sample_pages/`

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
- **specs.md**: Original project specifications and requirements
- **current_prompt.md**: Current development tasks and debugging notes

Additional directories:
- **sample_pages/**: Reference HTML pages for testing iframe rendering
- **supabase/**: Supabase configuration and local setup files

## Development Workflow

### Before Making Changes
1. Create and checkout a feature branch: `git checkout -b feature_short_name`
2. Make changes in the feature branch

### Before Committing
1. Write automated tests for all code (if applicable)
2. Run linting: `pnpm lint`
3. Build successfully: `pnpm build`
4. Ensure all tests pass

### Debugging
- Use Playwright MCP for browser-based debugging
- Compare rendered output in `/reports/[id]` with original files in `sample_pages/`
- Check background server output with BashOutput tool when dev server runs in background

### Data Management
- **NEVER generate mock/demo/sample data** - only work with real data
- Test with smaller datasets before implementing for full dataset
- Use scripts in `scripts/` directory for data operations
