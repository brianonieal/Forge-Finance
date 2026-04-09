# CHANGELOG.md
# Forge Finance | Change Log
# Blueprint v10 — Rule C-5: Every change logged

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
