# CHANGELOG.md
# Forge Finance | Change Log
# Blueprint v10 — Rule C-5: Every change logged

---

## [4.0.0] "Forge" — 2026-04-09

### Added
- 2FA TOTP implementation in /settings/security
  - Setup flow: generate secret → QR code display → manual key copy → verify code
  - Enable/disable toggle with confirmation
  - Backend: GET /api/settings/2fa/status, POST /2fa/setup, POST /2fa/verify, DELETE /2fa
  - In-memory state for MVP (production would persist to DB)
- Accessibility improvements (WCAG 2.1 AA):
  - Skip navigation link ("Skip to main content") — visible on focus
  - Focus-visible outlines (2px brand-primary) on all interactive elements
  - `role="navigation"` + `aria-label="Main navigation"` on sidebar
  - `role="main"` + `id="main-content"` on main content area
  - `prefers-reduced-motion` media query to disable animations
- Beta access gate (BetaGate component):
  - Access code entry form shown before authenticated app content
  - Backend: POST /api/settings/beta-access with valid codes (FORGE2026, BETAFORGE, EARLYACCESS)
  - localStorage persistence — verified once, remembered across sessions
  - Integrated into ProtectedRoute wrapper
- Auth modal on landing page:
  - Login button in top-right nav bar
  - Modal overlay with Google OAuth + magic link (not a page redirect)
  - "Join Free" buttons in hero and pricing section trigger same modal
  - Test account credentials displayed in small gray text
- Version bumped to 4.0.0
- 218 tests passing (116 backend + 102 frontend)

---

## [3.0.0] "Compass" — 2026-04-09

### Added
- Screen 14 — Investments Dashboard: /investments with portfolio overview
  - Summary cards: Portfolio Value, Total Gain/Loss (with trend icon), Accounts count
  - Performance AreaChart with gradient fill (green #00C48C)
  - Asset Allocation PieChart (donut) with legend showing type percentages
  - Holdings table: Account, Institution, Type, Balance columns
  - Empty states for no-data scenarios
- Screen 15 — Net Worth Tracker: /net-worth with financial health overview
  - Summary cards: Total Assets (green), Total Liabilities (red), Net Worth (blue with trend icon)
  - Net Worth Over Time AreaChart with gradient fill (primary blue #2E6DB4)
  - Account breakdown: 2-col grid with Assets and Liabilities sections
  - Each account shows name, institution/type, and balance with color coding
  - Empty states for no accounts linked
- Investments API: GET /api/investments/holdings, GET /api/investments/performance
  - Holdings aggregated from investment/brokerage/401k/IRA account types
  - Allocation computed by subtype with percentage breakdown
  - Performance built from cumulative transaction history
- Net Worth API: GET /api/net-worth/summary, GET /api/net-worth/trend
  - Asset/liability classification by account type
  - Trend computed from cumulative daily transaction totals
- Version bumped to 3.0.0 (main.py + health endpoint)
- 177 tests passing (101 backend + 76 frontend)

---

## [2.0.0] "Horizon" — 2026-04-09

### Added
- Screen 13 — Reports & Analytics: /reports with monthly income vs expenses BarChart
  - Summary cards: Total Income, Total Expenses, Net (JetBrains Mono)
  - Horizontal BarChart for category spending breakdown with transaction counts
  - Category legend with color dots and dollar amounts
- Screen 16 — Alerts & Notifications: /alerts with chronological notification feed
  - Filter chips: All, AI Insights, Budget Alerts, Goals, Sync Status, System
  - Alert cards with type icons, severity border colors, unread dot indicator
  - Mark as read (click), dismiss (X button), Mark All as Read
  - Empty state: "All caught up!" with checkmark icon
  - Time-relative timestamps ("2 hours ago")
  - View Details links navigate to relevant screens
- Reports API: GET /api/reports/monthly-summary, GET /api/reports/category-trends
  - Monthly income vs expenses aggregation from transactions
  - Category spending totals with transaction counts
- Alerts API: GET /api/alerts, PATCH /:id/read, POST /:id/dismiss, POST /mark-all-read
  - Dynamic alert generation from budget/goal state
  - Budget threshold alerts (70%, 90%, 100%)
  - Goal milestone alerts (25%, 50%, 75%, 100%)
  - In-memory read/dismiss tracking for MVP
- Navigation sidebar: Reports and Alerts ungated (previously grayed with "Coming in v2.0.0")
- 154 tests passing (92 backend + 62 frontend)

---

## [1.0.0] "Genesis" — 2026-04-09

### Added
- Screen 1 — Landing Page: / with hero section, features grid, pricing comparison, waitlist signup
  - Hero: "Your finances, explained by AI." headline with gradient background
  - Features grid: Conversational AI, Real-Time Sync, Smart Budgets & Goals (3-col desktop, 1-col mobile)
  - Pricing section: Free ($0) vs Pro ($9/month) tier comparison with feature lists
  - Waitlist email signup form with success state ("You're on the list!")
  - Privacy note: "We'll never share your email."
  - Footer with copyright
- Root / now shows landing page instead of redirect to /dashboard
- 131 tests passing (82 backend + 49 frontend)

---

## [0.6.0] — 2026-04-09

### Added
- Screen 8 — Budgets: /budgets with RadialBarChart health ring, category progress bars, create budget modal
  - Alert threshold colors (0-70% green, 70-90% amber, 90-100% red)
  - Status chips: On Track, Warning, Over Budget
  - Empty state with create CTA
- Screen 9 — Budget Detail: /budgets/:id with spending trend AreaChart, filtered transactions
  - Budget limit, spent, remaining amounts in JetBrains Mono
  - Progress bar with threshold coloring
- Screen 10 — Goals: /goals with 2-col grid, CircularProgressRing (120px), pace indicators
  - Create goal modal (bottom sheet mobile, modal desktop)
  - Completed goals section (collapsible) with Celebrate Again
  - CelebrationModal with confetti animation (respects prefers-reduced-motion)
  - Three-dot menu: Pause, Delete
- Screen 11 — Goal Detail: /goals/:id with 180px progress ring, contribution history AreaChart
  - Pace indicator with projected completion date
  - Goal actions: Edit, Pause/Resume, Delete
- Budget CRUD API: GET/POST /api/budgets, GET/PATCH/DELETE /api/budgets/:id
  - Overall health calculation (% of budgets on track)
  - Per-category spending aggregation from transactions
- Goal CRUD API: GET/POST /api/goals, GET/PATCH/DELETE /api/goals/:id
  - Pace calculation with projected completion date
  - Milestone detection (25%, 50%, 75%, 100%) on amount updates
  - Auto-complete when current_amount reaches target_amount
- 124 tests passing (82 backend + 42 frontend)

---

## [0.5.0] — 2026-04-09

### Added
- Screen 4 — Dashboard: net worth, daily P&L, budget health, top spend metric cards
  - Spending trend AreaChart (Recharts) with period selector integration
  - Category breakdown PieChart with legend and JetBrains Mono amounts
  - Recent transactions list (5 items) with View All link
- Screen 6 — Account Detail: /accounts/:id with balance history LineChart, filtered transactions
- Screen 7 — Transactions: full table with sort (date/amount), category filter chips, search, pagination
  - Transaction detail drawer (slides from right) with amount, date, category, status
  - Export button (placeholder, disabled for free tier)
- Screen 12 — @ORACLE Chat: SSE streaming responses, conversation history, typing indicator
  - Suggested questions on empty state
  - Query limit banner (8+ of 10 used) + ceiling message (limit reached)
  - Financial numbers auto-detected and rendered in JetBrains Mono
- @ORACLE agent pipeline: classification + reasoning with transaction context search
- Dashboard API: GET /api/dashboard/metrics, /spending-trend, /category-breakdown
- Transaction API: GET/PATCH /api/transactions, GET /api/transactions/:id
- Oracle API: POST /api/oracle/query (SSE), GET /api/oracle/history, GET /api/oracle/usage
- Cost tracking: agent_log entries with token counts and cost estimation
- Free tier enforcement: 10 queries/month limit + $0.50/user/month ceiling
- Recharts library integration (AreaChart, PieChart, LineChart)
- 84 tests passing (67 backend + 17 frontend)

---

## [0.4.0] — 2026-04-09

### Added
- Plaid Link integration: create-link-token and exchange-public-token endpoints
- @SYNC agent: cursor-based incremental transaction sync with deduplication
- Plaid webhook handler (HISTORICAL_UPDATE, TRANSACTIONS_SYNC, ITEM_LOGIN_REQUIRED)
- Webhook signature verification middleware (sandbox passthrough, production JWT)
- Voyage AI embedding pipeline: batch processing (50/batch), dimension validation (1024)
- Daily cron fallback sync architecture (ERR-PLAID-001)
- Exponential backoff with jitter for Plaid/Voyage rate limiting (ERR-PLAID-005, ERR-VOYAGE-002)
- Screen 3 — Onboarding Wizard: /onboarding (4-step flow: welcome, Plaid Link, syncing, complete)
- Screen 5 — Accounts: /accounts (account cards with balance, type, institution, connection status)
- Empty state for accounts page with connect CTA
- Plaid Link update mode support for expired items (ERR-PLAID-004)
- API client module (apps/web/src/lib/api.ts) with typed Plaid endpoints
- usePlaidConnect hook wrapping react-plaid-link
- 52 tests passing (10 new: 5 Plaid router, 5 sync/embedding, 6 frontend)

---

## [0.3.0] — 2026-04-09

### Added
- Supabase Auth client setup (frontend @supabase/ssr + backend python-jose)
- useAuthStore (Zustand): session management, Google OAuth, Magic Link sign-in
- AuthProvider: initializes auth state on app load
- ProtectedRoute: redirects unauthenticated users to /login
- Screen 2 — Auth: /login, /register, /reset-password with AuthCard component
  - Google OAuth button, magic link email flow, success state
- Screen 17 — Settings with 5 sub-pages:
  - /settings/profile: avatar, name, email
  - /settings/security: 2FA placeholder, active sessions, delete account
  - /settings/preferences: currency, number format, date format, default period
  - /settings/notifications: toggle switches for all alert types, weekly digest
  - /settings/connected-apps: empty state with connect button
- FastAPI auth middleware: JWT verification via Supabase JWT secret
- Settings API router: 7 endpoints (GET/PATCH profile, preferences, notifications, sessions, connected-apps)
- 36 tests passing (7 new auth tests)

---

## [0.2.0] — 2026-04-09

### Added
- SQLAlchemy models for all 9 database tables (users, accounts, transactions, categories, budgets, goals, sync_log, agent_log, conversations)
- Alembic migration 001: creates all 9 tables with indexes, foreign keys, and pgvector extension
- RLS policies on all tables (users match on id, others on user_id via auth.uid())
- Pydantic v2 schemas: UserRead/Update, AccountRead, TransactionRead/Update, BudgetCreate/Read/Update, GoalCreate/Read/Update
- Health check endpoint with database connectivity status
- Transaction embedding column: vector(1024) for Voyage AI semantic search
- 29 passing tests (model structure, schema validation, health endpoint)

---

## [0.1.0] — 2026-04-09

### Added
- App Router route structure with (dashboard) route group
- NavigationSidebar: 240px expanded, 60px collapsed, version-gated items
- MobileBottomTabBar: 5 tabs, fixed bottom, hidden on desktop
- Toast notification system: 4 types, auto-dismiss, stacked, progress bar
- SkeletonScreen: metric-card, table-row, full-page, chart variants
- ErrorState: full-page and inline variants with retry
- NetworkOfflineBanner component
- PeriodSelector: 7 periods (1D-ALL), pill tabs with Zustand state
- MetricCard: JetBrains Mono values, gain/loss/neutral deltas
- Zustand UI store (sidebar state, period selection)
- Vitest + React Testing Library + jsdom setup
- Lucide React, Framer Motion, Zustand, TanStack Query, clsx, tailwind-merge
- Placeholder pages for all routes (dashboard, accounts, transactions, budgets, goals, chat, settings)
- Root page redirects to /dashboard

---

## [0.0.0] — 2026-04-09

### Added
- Initialized git repository
- Monorepo scaffold: Turborepo + pnpm workspaces
- Next.js 14+ frontend app (apps/web) with App Router
- FastAPI backend app (apps/api) with health endpoint
- SQLAlchemy + Alembic migration setup
- Design tokens as CSS custom properties (Bloomberg-inspired dark theme)
- Inter + JetBrains Mono font configuration
- Tailwind CSS v4 with design token integration
- All 22 Blueprint v10 foundation files
- CLAUDE.md boot sequence
- GitHub Actions CI/CD pipeline
- Environment variable templates
- MEMORY_SEMANTIC.md pre-seeded with DEC-001 through DEC-022
- MEMORY_EPISODIC.md initialized
- MEMORY_CORRECTIONS.md with pre-build calibrations
