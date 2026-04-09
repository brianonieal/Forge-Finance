# VERSION_ROADMAP.md
# Forge Finance | v0.0.0 through v5.0.0 "Apex"
# Source: Forge_Finance_app_spec.pdf | April 2026
# Blueprint v10

---

## ROADMAP PHILOSOPHY

Gates are atomic. Each gate delivers a testable, working slice.
No gate opens without the prior gate fully passing all quality checks.
Test targets are cumulative -- each gate adds to the total.

---

## GATE STRUCTURE

### v0.0.0 -- Foundation
**Purpose:** Repo, environment, CI/CD, design tokens, project structure
**Key deliverables:**
- Monorepo scaffold (frontend + backend)
- All 22 Blueprint v10 foundation files populated
- Design tokens implemented as CSS custom properties
- GitHub Actions CI/CD pipeline generated
- Supabase project connected (Forge-Finance instance)
- Dev server starts, DB connects, CI passes, agnix PASS

**Screens:** None
**Tests:** 0
**Est:** 6 hrs

---

### v0.1.0 -- Scaffold
**Purpose:** Project structure, design tokens, component foundations
**Key deliverables:**
- Next.js 14+ App Router structure
- Tailwind CSS configured with design tokens
- Global layout: Navigation Sidebar (desktop) + Mobile Bottom Tab Bar
- Design system: all CSS custom properties from spec
- JetBrains Mono configured for financial numbers
- Inter configured for UI text
- Skeleton loading components
- Toast notification system
- Error state components
- Period selector global component

**Screens:** None (infrastructure only)
**Tests:** 0
**Est:** 8 hrs

---

### v0.2.0 -- Data Layer
**Purpose:** All 9 database tables + migrations + base API structure
**Key deliverables:**
- All 9 Alembic migrations (named, versioned):
  - users (profiles, subscription tier, query_count)
  - accounts (Plaid linked accounts + institution metadata)
  - transactions (financial data + vector(1024) embedding column)
  - categories (Plaid category taxonomy for budget mapping)
  - budgets (category spending limits, static CRUD)
  - goals (savings goals with target amounts and dates)
  - sync_log (@SYNC operation history + Plaid cursor storage)
  - agent_log (@ORACLE invocation log with cost tracking)
  - conversations (persistent chat history -- added at v0.5.0)
- RLS policies on all user-specific tables
- FastAPI base structure with SQLAlchemy
- Health check endpoint
- All tables verified with two-user isolation test

**Screens:** None
**Tests:** 12
**Est:** 10 hrs

---

### v0.3.0 -- Auth
**Purpose:** Full authentication flow
**Key deliverables:**
- Supabase Auth: Google OAuth + magic link
- Screen 2: Auth (Login / Register / Reset Password) -- /login, /register, /reset-password
- Screen 17: Settings -- /settings/* (profile, security, preferences, notifications, connected apps)
- Protected route HOC
- useAuthStore (Zustand)
- Auth middleware on all protected FastAPI endpoints
- Session management

**Screens:** 2 (Auth), 17 (Settings)
**Tests:** 27
**Est:** 10 hrs

---

### v0.4.0 -- Plaid + @SYNC
**Purpose:** Bank connection + real-time transaction sync
**Key deliverables:**
- Screen 3: Onboarding Wizard -- /onboarding
  - Step 1: Welcome + value prop
  - Step 2: Connect bank (Plaid Link)
  - Step 3: Syncing state (HISTORICAL_UPDATE wait)
  - Step 4: Sync complete + first insights preview
- Screen 5: Accounts -- /accounts
  - Account cards with balance, type, institution logo
  - Connection status indicators
  - [+ Connect Account] button
  - Last synced timestamp
- @SYNC agent implementation:
  - Plaid webhook handler (HISTORICAL_UPDATE, TRANSACTIONS_SYNC)
  - Webhook signature verification middleware
  - Daily cron fallback
  - Cursor-based incremental sync
  - Deduplication on insert
  - Item status monitoring (ITEM_LOGIN_REQUIRED handling)
  - Plaid Link update mode for expired items
- Voyage AI embedding pipeline for transactions
- ERR-PLAID-001 through ERR-PLAID-005 mitigations built in

**Screens:** 3 (Onboarding), 5 (Accounts)
**Tests:** 50
**Est:** 18 hrs (raw 12 + 50% Plaid buffer)
**Note:** This gate always takes longer. Budget 18 hours minimum.

---

### v0.5.0 -- Dashboard + @ORACLE
**Purpose:** Core app experience -- dashboard + AI agent
**Key deliverables:**
- Screen 4: Dashboard -- /dashboard
  - Net worth metric card (JetBrains Mono)
  - Daily P&L card (JetBrains Mono, gain-green/loss-red)
  - Budget health overview card
  - Spending by category (Recharts PieChart)
  - Spending trend (Recharts AreaChart)
  - Recent transactions list (5 items)
  - Period selector (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
  - @ORACLE sidebar panel (desktop persistent)
- Screen 6: Account Detail -- /accounts/:id
  - Account summary header
  - Transaction list with search and filter
  - Balance history chart (Recharts LineChart)
  - Sync status
- Screen 7: Transactions -- /transactions
  - Full transaction table with sort, filter, search
  - Category filter chips
  - Date range picker
  - Export button (placeholder for Pro)
  - Merchant grouping
- Screen 12: @ORACLE Chat -- /chat (mobile), sidebar panel (desktop)
  - SSE streaming responses
  - Conversation history (conversations table)
  - Message bubbles with timestamps
  - Typing indicator during streaming
  - Suggested questions
  - Cost tracking per query
  - 10 query/month limit enforcement (free tier)
  - Graceful ceiling message
- @ORACLE agent:
  - Haiku classifier → Sonnet reasoning pipeline
  - Voyage AI semantic search on transactions
  - LangGraph state management
  - LiteLLM routing
  - agent_log cost tracking
  - $0.50/user/month ceiling enforcement (cost_guard middleware)
  - SSE streaming through FastAPI

**Screens:** 4 (Dashboard), 6 (Account Detail), 7 (Transactions), 12 (@ORACLE Chat)
**Tests:** 89
**Est:** 20 hrs (most complex gate)

---

### v0.6.0 -- Budgets + Goals
**Purpose:** Budget management + savings goals
**Key deliverables:**
- Screen 8: Budgets -- /budgets
  - Budget health ring (Recharts RadialBarChart)
  - Per-category spending progress bars
  - Budget vs actual comparison
  - Alert thresholds (70%, 90%, 100%)
  - [+ Create Budget] button
  - Period selector integration
- Screen 9: Budget Category Detail -- /budgets/:id
  - Category transaction list
  - Spending trend chart
  - Budget edit form
- Screen 10: Goals -- /goals
  - Active goals grid (2-col desktop, 1-col mobile)
  - Per goal: circular progress ring (120px), name, saved/target, target date
  - Pace indicators (on track, slightly behind, behind schedule)
  - "At this pace, you'll reach your goal by [date]"
  - Completed goals (collapsible section)
  - Celebration modal (confetti animation, respects prefers-reduced-motion)
  - [+ Create Goal] button
- Screen 11: Goal Detail -- /goals/:id
  - Goal progress header
  - Contribution history chart
  - Linked account balance
  - Edit/Pause/Delete actions
- CRUD APIs for budgets and goals
- Budget threshold notification triggers (70%, 90%, 100%)
- Goal milestone triggers (25%, 50%, 75%, 100%)

**Screens:** 8 (Budgets), 9 (Budget Detail), 10 (Goals), 11 (Goal Detail)
**Tests:** 119
**Est:** 14 hrs

---

### v1.0.0 -- "Genesis" (Launch)
**Purpose:** Public MVP launch with waitlist
**Key deliverables:**
- Screen 1: Landing Page -- /
  - Hero: "Your finances, explained by AI."
  - Subheadline about Plaid sync + @ORACLE
  - [Join the Waitlist] CTA (brand-primary, large)
  - [See How It Works] anchor link
  - Features grid (3-col desktop, 1-col mobile):
    - Card 1: Conversational AI
    - Card 2: Real-Time Sync
    - Card 3: Smart Budgets & Goals
  - Pricing comparison (Free vs Pro)
  - Waitlist email signup form
  - Success state: check icon + "You're on the list!"
- Full QA pass across all screens
- Production deploy (Vercel + Render)
- Sentry error tracking configured
- All 119 tests passing + passing mutation score
- Handoff documentation

**Screens:** 1 (Landing Page)
**Tests:** 119
**Est:** 10 hrs

---

### v2.0.0 -- "Horizon"
**Purpose:** Reports, analytics, alerts
**Key deliverables:**
- Screen 13: Reports & Analytics -- /reports
- Screen 16: Alerts & Notifications -- /alerts
  - Feed of: @ORACLE insights, budget threshold warnings, goal milestones, sync errors
  - Filter chips: All, AI Insights, Budget Alerts, Goals, Sync Status, System
  - Mark as read, dismiss, read/unread toggle
  - Bell icon in top bar with unread count
  - Notification preferences in Settings

**Screens:** 13 (Reports), 16 (Alerts)
**Tests:** 149
**Est:** 16 hrs

---

### v3.0.0 -- "Compass"
**Purpose:** Investments + net worth tracking
**Key deliverables:**
- Screen 14: Investments Dashboard -- /investments
- Screen 15: Net Worth Tracker -- /net-worth

**Screens:** 14 (Investments), 15 (Net Worth)
**Tests:** 185
**Est:** 14 hrs

---

### v4.0.0 -- "Forge"
**Purpose:** Performance, accessibility, beta access
**Key deliverables:**
- Lighthouse score 90+ across all screens
- WCAG 2.1 AA across all screens (AAA for critical financial data)
- 2FA implementation (/settings/security)
- Performance optimization pass
- Beta access program
- Load testing validation

**Screens:** No new screens
**Tests:** 218
**Est:** 12 hrs

---

### v5.0.0 -- "Apex"
**Purpose:** Public launch with Stripe billing
**Key deliverables:**
- Screen 18: Subscription & Billing -- /settings/billing
  - Current plan card (Free vs Pro)
  - Usage metrics with progress bars
  - Plan comparison table
  - Stripe Checkout integration
  - Payment history (Pro users)
  - Cancellation flow with retention modal
  - Monthly/Annual toggle ($9/mo or $90/year, save 17%)
- Production Plaid (non-sandbox)
- Full Stripe webhook handling
- Stripe endpoints:
  - POST /api/billing/create-checkout-session
  - POST /api/billing/create-portal-session
  - GET /api/billing/subscription
  - GET /api/billing/invoices
  - POST /api/webhooks/stripe

**Screens:** 18 (Subscription & Billing)
**Tests:** 248
**Est:** 14 hrs

---

## SUMMARY TABLE

| Gate | Name | Screens | Tests | Est Hrs |
|------|------|---------|-------|---------|
| v0.0.0 | Foundation | 0 | 0 | 6 |
| v0.1.0 | Scaffold | 0 | 0 | 8 |
| v0.2.0 | Data Layer | 0 | 12 | 10 |
| v0.3.0 | Auth | 2, 17 | 27 | 10 |
| v0.4.0 | Plaid + @SYNC | 3, 5 | 50 | 18 |
| v0.5.0 | Dashboard + @ORACLE | 4, 6, 7, 12 | 89 | 20 |
| v0.6.0 | Budgets + Goals | 8, 9, 10, 11 | 119 | 14 |
| v1.0.0 | Genesis (Launch) | 1 | 119 | 10 |
| v2.0.0 | Horizon | 13, 16 | 149 | 16 |
| v3.0.0 | Compass | 14, 15 | 185 | 14 |
| v4.0.0 | Forge | - | 218 | 12 |
| v5.0.0 | Apex | 18 | 248 | 14 |
| **TOTAL** | | **18 screens** | **248** | **152 hrs** |

Raw estimate: 152 hrs
Calibrated (context overhead + debug buffer): ~190 hrs

---

## CURRENT STATUS

Active gate: v0.0.0 Foundation
Next task: Begin foundation build
Blueprint v10: Active
