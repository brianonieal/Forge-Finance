# FORGE FINANCE — Complete App Specification (Updated)
# Version: v0.0.0 through v5.0.0 "Apex"
# Date: April 2026 (Updated with Receipt Intelligence + Family Features)
# Purpose: /start intake description for Claude Code

---

## APP DESCRIPTION (300 words)

Forge Finance is an AI-powered personal finance platform that connects to users' real bank accounts via Plaid, automatically syncs transactions in real time via webhooks, scans physical and digital receipts to build a product price database, and uses a conversational AI agent (@ORACLE) to surface financial insights users would never find on their own. The platform is built on a 2-agent MVP architecture: @ORACLE handles all financial analysis through a hybrid Haiku classifier + Sonnet reasoning pipeline, while @SYNC manages real-time Plaid transaction synchronization with a daily cron fallback.

The frontend is a Next.js application with a Bloomberg-inspired dark mode design system: deep navy backgrounds, teal-green gains, red losses, gold accents, Inter for UI text, and JetBrains Mono mandatory for all dollar amounts and financial data. The backend runs on FastAPI with SQLAlchemy + Alembic migrations, Supabase (Postgres + pgvector) for storage, and LiteLLM for multi-model AI routing with a hard cost ceiling of $0.50 per user per month.

Users authenticate via Google OAuth or magic link through Supabase Auth. The core experience is a dashboard showing net worth, daily P&L, budget health, and a conversational @ORACLE sidebar (desktop) or fullscreen chat (mobile) where users ask natural language questions about their finances. @ORACLE uses Voyage AI embeddings (vector 1024 dimensions) for RAG-powered semantic search across transaction history. Receipt scanning uses PaddleOCR (free tier) or Mindee/Veryfi (Pro tier) to extract line items, build a product price database, and power purchase intelligence queries like "Where is this product cheapest?"

The product ships as a freemium web app: free users get 1 linked account, 90-day history, 10 @ORACLE queries per month, and 5 receipt scans per month. Pro ($9/month or $89/year) unlocks unlimited accounts, full history, unlimited AI queries, unlimited receipt scans, purchase intelligence, and family sharing (up to 3 people). The 13-gate roadmap progresses from scaffold (v0.1.0) through budgets and goals (v0.6.0), MVP launch with waitlist (v1.0.0 "Genesis"), receipt intelligence (v1.5.0 "Harvest"), analytics and reports (v2.0.0 "Horizon"), investments and net worth (v3.0.0 "Compass"), performance and beta access (v4.0.0 "Forge"), to public launch with Stripe billing (v5.0.0 "Apex").

---

## TECH STACK SUMMARY

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | Vercel deployment |
| Styling | Tailwind CSS | Design tokens as CSS custom properties |
| Charts | Recharts | AreaChart, LineChart, PieChart, BarChart |
| State/Data | TanStack Query | Cache invalidation on period selector change |
| Backend | FastAPI (Python) | Render free tier, Railway upgrade at v5.0.0 |
| Database | Supabase (Postgres + pgvector) | RLS enabled, 12 tables at MVP |
| Migrations | Alembic + SQLAlchemy | Named, versioned migration files |
| Auth | Supabase Auth | Google OAuth + magic link |
| Financial Data | Plaid API | Webhooks primary, daily cron fallback |
| AI Orchestration | LangGraph | Agent state management |
| AI Routing | LiteLLM | Sonnet primary, Haiku fallback |
| Embeddings | Voyage AI | vector(1024), semantic search |
| OCR (Free tier) | PaddleOCR PP-OCRv5 | Apache 2.0, self-hosted |
| OCR (Pro tier) | Mindee / Veryfi | Paid API, best line-item accuracy |
| OCR Parsing | Claude Haiku | Structures raw OCR into product JSON |
| Observability | Sentry (v1.0.0+) | Error tracking |

---

## DATABASE SCHEMA (12 tables at MVP)

| Table | Gate | Purpose |
|---|---|---|
| users | v0.2.0 | Profiles, subscription tier, query_count for freemium tracking |
| accounts | v0.2.0 | Linked Plaid accounts with institution metadata |
| transactions | v0.2.0 | Financial transactions + vector(1024) embedding column |
| categories | v0.2.0 | Plaid category taxonomy for budget mapping |
| budgets | v0.2.0 | Category spending limits (static CRUD at MVP) |
| goals | v0.2.0 | Savings and debt payoff targets with progress tracking |
| conversations | v0.2.0 | @ORACLE chat history, persistent per user |
| waitlist | v0.2.0 | Pre-launch email signups |
| receipts | v0.2.0 | Scanned receipt metadata, OCR results, transaction links |
| receipt_items | v0.2.0 | Individual line items extracted from receipts |
| product_prices | v0.2.0 | Product price intelligence layer for cross-store comparison |
| family_members | v0.2.0 | Household sharing: invites, permissions, data access scoping |

### receipts table detail
- id (uuid, PK)
- user_id (FK to users)
- image_url (text, Supabase Storage path)
- raw_ocr_json (jsonb)
- merchant_name (text)
- merchant_address (text, nullable)
- receipt_date (date)
- subtotal (decimal)
- tax (decimal)
- tip (decimal, nullable)
- total (decimal)
- payment_method (text, nullable)
- transaction_id (FK to transactions, nullable)
- status (enum: pending/processed/failed/needs_review)
- ocr_provider (text: paddleocr/mindee/veryfi/claude_vision)
- created_at (timestamptz)

### receipt_items table detail
- id (uuid, PK)
- receipt_id (FK to receipts)
- raw_text (text)
- product_name (text, normalized by AI)
- product_name_normalized (text, canonical form for matching)
- category (text: produce/meat/dairy/snacks/beverages/household/personal_care/other)
- quantity (decimal, default 1)
- unit_price (decimal)
- total_price (decimal)
- brand (text, nullable)
- upc (text, nullable)
- normalization_confidence (float, 0-1, Haiku's confidence in the normalized name)
- user_corrected (boolean, default false, set true when user edits the normalized name)
- created_at (timestamptz)

### product_prices table detail
- id (uuid, PK)
- user_id (FK to users)
- product_name_normalized (text, indexed)
- merchant_name (text, indexed)
- price (decimal)
- quantity (decimal)
- unit_price_calculated (decimal)
- receipt_id (FK to receipts)
- receipt_date (date, indexed)
- created_at (timestamptz)
- UNIQUE(user_id, product_name_normalized, merchant_name, receipt_date)

### family_members table detail
- id (uuid, PK)
- primary_user_id (FK to users)
- member_user_id (FK to users, nullable until invite accepted)
- permission_level (enum: full/view_only)
- status (enum: pending/active)
- invite_token (text, unique)
- invite_email (text)
- shared_accounts (jsonb, array of account IDs)
- shared_budgets (jsonb, array of budget IDs)
- shared_goals (jsonb, array of goal IDs)
- created_at (timestamptz)
- NOTE: jsonb arrays for shared_accounts/budgets/goals lack referential integrity. Acceptable at 3-member cap. If family sharing ever expands beyond 3, refactor to a family_member_permissions junction table with proper foreign keys (family_member_id, resource_type, resource_id, permission_level). Log as known tech debt.

---

## DESIGN SYSTEM

### Colors (CSS Custom Properties)
- --color-bg-base: #0F172A (deep navy)
- --color-bg-surface: #1E293B (card/panel background)
- --color-bg-overlay: #334155 (hover states, modals)
- --color-text-primary: #F8FAFC (primary text)
- --color-text-secondary: #94A3B8 (secondary/muted text)
- --color-brand-primary: #2563EB (steel blue, CTAs, active states)
- --color-brand-primary-muted: #1E3A5F (brand background tint)
- --color-gain: #10B981 (teal-green, positive values)
- --color-loss: #EF4444 (red, negative values)
- --color-warning: #F59E0B (amber/gold, warnings, alerts)
- --color-status-success-bg: rgba(16,185,129,0.1)
- --color-status-error-bg: rgba(239,68,68,0.1)
- --color-status-warning-bg: rgba(245,158,11,0.1)
- --color-status-info-bg: rgba(37,99,235,0.1)

### Typography
- UI text: Inter (400, 500, 600, 700)
- Dollar amounts and financial data: JetBrains Mono (MANDATORY)
- Font sizes: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-4xl (36px)

### Financial Number Formatting
- Positive amounts: plain text (e.g., $1,234.56)
- Negative amounts: red with parentheses (e.g., ($150.00))
- Gains: teal-green with up arrow
- Losses: red with down arrow
- Zero change: neutral gray, no arrow, show "—"
- All color-coded indicators must have a secondary indicator (arrow, sign) for color-blind accessibility
- WCAG 2.1 AA minimum, AAA for critical financial data

### Spacing
- Base unit: 4px
- Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Card padding: 16px (compact) or 24px (standard)
- Section gaps: 24px or 32px

### Border Radius
- Buttons: 8px
- Cards: 12px
- Modals: 16px
- Pills/badges: 9999px (full round)

---

## SCREEN INVENTORY (28 views)

| # | Screen | Route | Gate | Nav Location |
|---|---|---|---|---|
| 1 | Landing Page | / | v1.0.0 | Pre-auth |
| 2 | Auth (Login/Register/Reset) | /login, /register, /reset-password | v0.3.0 | Pre-auth |
| 3 | Onboarding Wizard | /onboarding | v0.4.0 | Post-auth, first-time |
| 4 | Dashboard | /dashboard | v0.5.0 | Sidebar: primary |
| 5 | Accounts | /accounts | v0.4.0 | Sidebar |
| 6 | Account Detail | /accounts/:id | v0.5.0 | Drill-down from Accounts |
| 7 | Transactions | /transactions | v0.5.0 | Sidebar |
| 8 | Budgets | /budgets | v0.6.0 | Sidebar |
| 9 | Budget Category Detail | /budgets/:id | v0.6.0 | Drill-down from Budgets |
| 10 | Goals | /goals | v0.6.0 | Sidebar |
| 11 | Goal Detail | /goals/:id | v0.6.0 | Drill-down from Goals |
| 12 | @ORACLE Chat | /chat (mobile), sidebar panel (desktop) | v0.5.0 | Sidebar + persistent panel |
| 13 | Reports & Analytics | /reports | v2.0.0 | Sidebar |
| 14 | Investments Dashboard | /investments | v3.0.0 | Sidebar |
| 15 | Net Worth Tracker | /net-worth | v3.0.0 | Sidebar |
| 16 | Alerts & Notifications | /alerts | v2.0.0 | Sidebar |
| 17 | Settings | /settings/* | v0.3.0 | Sidebar (bottom) |
| 18 | Subscription & Billing | /settings/billing | v5.0.0 | Settings sub-page |
| 19 | Receipt Scanner | /receipts/scan | v1.5.0 | FAB + Transactions toolbar |
| 20 | Receipt History | /receipts | v1.5.0 | Sidebar (under Transactions) |
| 21 | Purchase Intelligence | /purchases | v2.0.0 | Sidebar |
| 17a | Profile | /settings/profile | v0.3.0 | Settings sub-page |
| 17b | Security | /settings/security | v0.3.0 | Settings sub-page |
| 17c | Preferences | /settings/preferences | v0.3.0 | Settings sub-page |
| 17d | Notifications | /settings/notifications | v2.0.0 | Settings sub-page |
| 17e | Family | /settings/family | v2.0.0 | Settings sub-page |
| 17f | Connected Apps | /settings/connected-apps | v3.0.0 | Settings sub-page |
| 17g | Data & Privacy | /settings/privacy | v1.0.0 | Settings sub-page |

---

## GLOBAL COMPONENTS

### Navigation Sidebar (Desktop)
- Fixed left, 240px wide on desktop
- Collapses to 60px icon-only rail on mobile (<768px), labels as tooltips
- Top: Forge Finance logo (clickable to /dashboard)
- Nav items: 40px height, icon (20px) + label, 12px horizontal padding
- Active state: left 3px border accent (--color-brand-primary), bg --color-bg-overlay
- Hover: bg --color-bg-overlay, 150ms ease transition
- Bottom section: settings icon, user avatar + name, logout
- Version-gated items show as grayed/locked with "Coming in [version]" tooltip
- Nav order: Dashboard, Accounts, Transactions, Receipts (v1.5.0), Budgets, Goals, @ORACLE Chat, Purchases (v2.0.0), Reports (v2.0.0), Investments (v3.0.0), Net Worth (v3.0.0), Alerts (v2.0.0)

### Mobile Bottom Tab Bar
- Fixed bottom, 5 core tabs: Dashboard, Accounts, Chat, Budgets, Settings
- Active tab: brand primary icon + label, inactive: secondary text
- Floating Action Button (FAB) for quick actions:
  - "Add Transaction" (manual entry)
  - "Scan Receipt" (camera icon, opens /receipts/scan)
  - "Ask @ORACLE" (chat bubble)

### Notification Toast System
- Position: top-right, 16px from edges, max 3 visible stacked
- Types: success (green, 4s auto-dismiss), error (red, no auto-dismiss), warning (amber, 6s), info (blue, 4s)
- Anatomy: icon + title + optional description + close X + progress bar

### Error States
- Full page: centered alert icon (48px), error title, message, retry + go to dashboard buttons
- Inline widget: replaces content, 24px alert icon, short message, retry link
- Network offline: full-width amber banner at top of page

### Loading States
- Skeleton screens matching exact layout shapes of real content
- Metric card skeleton: 180px wide block (mimics number), 120px block below (mimics delta)
- Table skeleton: alternating row heights matching real data rows
- Never show spinners for initial page loads, always skeletons

### Period Selector (Global)
- Pill/tab row: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- Active pill: brand primary background
- Sticks to top-right of dashboard on scroll
- Updates ALL charts and metrics on the page simultaneously via TanStack Query cache invalidation

---

## SCREEN SPECIFICATIONS

### SCREEN 1: Landing Page
**Route:** / | **Gate:** v1.0.0 "Genesis" | **Purpose:** Pre-auth marketing page with waitlist signup.

**Screen Contents:**

HERO SECTION (full viewport height, centered):
- Headline: "Your finances, explained by AI." (text-4xl, font-bold, text-brand-primary)
- Subheadline: "Forge Finance connects to your bank, syncs transactions in real time, scans your receipts, and uses AI to surface insights you'd never find on your own." (text-lg, text-secondary, max-w-2xl)
- Primary CTA: [Join the Waitlist] button (brand-primary, large)
- Secondary CTA: [See How It Works] anchor link to features section
- Background: subtle gradient from bg-base to bg-surface

FEATURES GRID (4 columns desktop, 2 tablet, 1 mobile):
- Card 1: "Conversational AI" — Icon: chat bubble — "Ask @ORACLE anything about your finances in plain English. Get answers backed by your real transaction data."
- Card 2: "Real-Time Sync" — Icon: refresh/sync — "Plaid webhooks push new transactions automatically. No manual refresh. Your data is always current."
- Card 3: "Smart Budgets & Goals" — Icon: target/chart — "Set spending limits by category. Track savings goals. AI coaching tells you when you're off track (Pro)."
- Card 4: "Receipt Intelligence" (NEW) — Icon: scanner/receipt — "Scan any receipt. Track every price. Know where to shop smarter. AI finds the cheapest store for your favorite products."

PRICING SECTION (2-column comparison):
- Free Tier:
  - 1 linked account
  - 90-day transaction history
  - 10 AI queries per month
  - 5 receipt scans per month
  - Basic budgets and goals
  - [Join Free] button
- Pro Tier ($9/month or $89/year):
  - Unlimited accounts
  - Full transaction history
  - Unlimited AI queries
  - Unlimited receipt scans + purchase intelligence
  - Reports, analytics, investments (as released)
  - Family sharing (up to 3 people)
  - [Join Waitlist for Pro] button
- Annual toggle: switch between monthly and annual pricing display

WAITLIST SIGNUP (centered section):
- Email input field
- [Join Waitlist] button
- Privacy note: "We'll never share your email."
- Success state: replaces form with check icon + "You're on the list!"

FOOTER:
- Forge Finance logo
- Links: Privacy Policy, Terms of Service, Contact
- Attribution

**Backend:** No auth required. Waitlist emails stored in Supabase waitlist table (email, created_at, referral_source). Rate-limited to prevent spam.
**AI:** None on this page.

---

### SCREEN 2: Auth (Login / Register / Reset Password)
**Route:** /login, /register, /reset-password | **Gate:** v0.3.0 | **Purpose:** User authentication via Google OAuth or email magic link through Supabase Auth.

**Screen Contents:**

LOGIN (/login):
- Centered card (max-w-sm, bg-surface, rounded-xl, shadow-lg)
- Forge Finance logo (48px, centered)
- "Welcome back" heading (text-xl, font-semibold)
- [Continue with Google] button (full-width, Google icon + label, outlined)
- Divider: "or" with horizontal rules
- Email input field (placeholder: "name@example.com")
- Password input field (show/hide toggle icon)
- [Sign In] button (brand-primary, full-width)
- "Forgot password?" link (text-link, right-aligned)
- "Don't have an account? Sign up" link (centered, below card)
- "Or sign in with magic link" link (text-secondary, below password)

MAGIC LINK FLOW (replaces password field when selected):
- Email input field
- [Send Magic Link] button (brand-primary, full-width)
- Post-submit: card replaces form with check circle icon (48px, gain-green), "Check your email" heading, "We sent a login link to {email}", "Didn't receive it? [Resend]" (available after 60s countdown)

REGISTER (/register):
- Same card layout as login, with:
- "Create your account" heading
- [Continue with Google] button
- Divider
- Full name input
- Email input
- Password input (with strength indicator: weak/fair/strong bar)
- [Create Account] button
- "Already have an account? Sign in" link
- Terms acceptance checkbox: "I agree to the Terms of Service and Privacy Policy"

REGISTER WITH INVITE (/register?invite=TOKEN):
- Same as register, but:
- Header shows: "You've been invited to join [Primary User]'s household on Forge Finance"
- After registration, user is automatically linked as a family member with the permissions set by the primary account holder
- Skips onboarding wizard (family members don't need to connect Plaid)

RESET PASSWORD (/reset-password):
- Centered card
- "Reset your password" heading
- "Enter your email and we'll send you reset instructions."
- Email input
- [Send Reset Link] button (brand-primary, full-width)
- Post-submit: check icon + "Check your email" + resend after 60s
- "[Back to sign in]" link

**Backend:** Supabase Auth handles all flows. Google OAuth callback at /api/auth/callback/google. JWT middleware on FastAPI validates tokens on every API request. Session stored in httpOnly secure cookies. Family invite token validated on register to associate new user with primary account.
**AI:** None.

---

### SCREEN 3: Onboarding Wizard
**Route:** /onboarding | **Gate:** v0.4.0 | **Purpose:** First-time user setup: link a bank account via Plaid and confirm initial preferences.

**Screen Contents:**

PROGRESS INDICATOR (top of page):
- 4 steps shown as connected dots/pills
- Current step highlighted in brand-primary
- Completed steps show check icon
- Step labels: "Link Bank", "Preferences", "Starter Budget", "Meet @ORACLE"

STEP 1: LINK BANK ACCOUNT
- Heading: "Connect your bank"
- Subtext: "Forge Finance uses Plaid to securely connect to your bank. We never see your login credentials."
- [Connect Bank Account] button triggers Plaid Link modal
- Success state: shows connected account card (institution logo, account name, type)
- [Add Another Account] link
- [Skip for now] link (text-secondary) — allows manual-only usage

STEP 2: PREFERENCES
- Heading: "Set your preferences"
- Default currency selector (USD default)
- Number format: [1,234.56] or [1.234,56]
- Date format: [MM/DD/YYYY] [DD/MM/YYYY] [YYYY-MM-DD]
- [Continue] button

STEP 3: STARTER BUDGET (NEW)
- Heading: "Set up your first budget"
- Subtext: "We've suggested common categories and amounts. Adjust to match your spending."
- Pre-filled category rows (editable):
  - Groceries: $500/month
  - Dining Out: $200/month
  - Transportation: $150/month
  - Entertainment: $100/month
  - Shopping: $200/month
- Each row: category name, icon, amount input (editable), remove button
- [Add Category] link to add more
- [Use These Budgets] button (primary)
- [Skip for now] link

STEP 4: MEET @ORACLE
- Heading: "Meet @ORACLE, your AI financial assistant"
- @ORACLE chat bubble with sample question: "How much did I spend on dining out last month?"
- Sample response showing formatted answer with chart
- "Try asking something:" with 3 suggested questions
- Tooltip pointing to receipt scanning: "Tip: Scan a receipt from the Transactions page to start tracking prices!"
- [Go to Dashboard] button (primary)

**Backend:** POST /api/onboarding/complete marks user as onboarded. @SYNC triggers initial Plaid transaction pull on step 1 completion. Budget categories saved to budgets table on step 3.
**AI:** Step 4 shows a pre-rendered @ORACLE demo response (not a live query) to avoid burning a free tier query on onboarding.

---

### SCREEN 4: Dashboard
**Route:** /dashboard | **Gate:** v0.5.0 | **Purpose:** Primary home screen showing financial overview with @ORACLE access.

**Screen Contents:**

TOP BAR:
- Search input (Cmd+K shortcut): search transactions, accounts, budgets, products
- Notification bell icon with unread count badge
- Period selector: [1D] [1W] [1M] [3M] [6M] [1Y] [ALL] (1M selected by default, sticks on scroll)

HERO SECTION (full-width):
- Net Worth Headline:
  - Total value: $45,230.50 (text-4xl, JetBrains Mono, tabular-nums)
  - Delta line: +$312.40 (+0.70%) today (text-base, gain-green, both dollar AND percent always shown)
  - "today" label in text-secondary on same line

METRIC CARDS ROW (5 cards: grid-cols-5 desktop, grid-cols-2 tablet, grid-cols-1 mobile):
- Card 1: Total Balance — Label, value (text-2xl, JetBrains Mono), delta (gain/loss), sparkline (80px wide, 32px tall)
- Card 2: Today's P&L — Value with gain/loss coloring, "vs yesterday" label
- Card 3: Monthly Spending — Value (loss-colored if over budget), "of $4,000 budget" with mini progress bar
- Card 4: Savings Progress — Value: 68% (toward active goal), goal name + target date, [View All] link to /goals
- Card 5: Receipt Insights (v1.5.0+, greyed placeholder until then) — "X items scanned this month", grocery spending sparkline

MAIN CONTENT + SIDEBAR ROW (grid-cols-[1fr_320px] desktop, stacked on tablet/mobile):

LEFT COLUMN (2/3 width):
- Performance Chart (Recharts AreaChart, 280px height): area fill brand-primary 10% opacity, line brand-primary 2px, x-axis date labels, y-axis dollar amounts (JetBrains Mono), tooltip on hover, responds to period selector
- Top 5 Transactions Table: columns Date, Description, Category, Amount, AI Confidence. Each row hover bg-overlay, clickable. Amount in JetBrains Mono, gain/loss colored. AI Confidence badge: green (>0.9), yellow (0.7-0.9), orange (<0.7) with "Review" button. Receipt icon indicator on transactions with linked receipts. [See all transactions] link.

RIGHT COLUMN (320px, or below main on mobile):
- Allocation Donut Chart (Recharts PieChart): center total value, segments by account or category, legend below with color dots + labels + values, hover segment expands slightly
- Recent Activity Feed: last 10 events (new transactions, sync completions, budget alerts, goal milestones, receipt scans). Each item: icon + description + relative timestamp. [View all activity] link to /alerts.

@ORACLE SIDEBAR (desktop only, right edge, 320px):
- Collapsible toggle button on right edge of dashboard
- When open: chat interface overlays right column
- Suggested questions in 2x2 grid (when empty)
- See Screen 12 for full @ORACLE specification

**Backend:** GET /api/dashboard returns aggregated data: total balance, daily P&L, monthly spending sum, goal progress. GET /api/dashboard/chart?period=1M returns time series. GET /api/transactions?limit=5&sort=date_desc for recent transactions. GET /api/dashboard/allocation for donut chart data. All queries use Supabase RLS filtering by authenticated user. Family members see only shared accounts.
**AI:** @ORACLE sidebar available for ad-hoc queries. Transaction AI confidence comes from @ORACLE's category classification confidence score.

---

### SCREEN 5: Accounts
**Route:** /accounts | **Gate:** v0.4.0 | **Purpose:** Manage linked bank accounts.

**Screen Contents:**
- Page heading: "Accounts"
- Account cards grouped by institution
- Each card: institution logo (32px), account name, account type (checking/savings/credit/investment), current balance (JetBrains Mono), last sync timestamp ("Synced 2 min ago"), sync status indicator (green dot = healthy, amber = stale, red = error)
- [Add Account] button triggers Plaid Link
- [Add Manual Account] link for non-Plaid accounts (type, name, starting balance)
- Empty state: "Connect your first bank account to get started" with Plaid Link CTA

**Backend:** GET /api/accounts returns all accounts for user. POST /api/accounts/plaid/link initiates Plaid Link flow. Supabase RLS scopes by user_id. Family members see only shared accounts.

---

### SCREEN 6: Account Detail
**Route:** /accounts/:id | **Gate:** v0.5.0 | **Purpose:** Single account view with transaction history.

**Screen Contents:**
- Account header: institution logo, account name, type, current balance, last sync
- Balance chart (Recharts LineChart, responds to period selector)
- Transaction list for this account with search and filters (same table component as Screen 7 but filtered to single account)
- "Attach Receipt" action on individual transactions (tap transaction, see detail, tap "Attach Receipt" to link a scanned receipt)
- Account settings: [Unlink Account] with confirmation dialog, [Rename Account]

**Backend:** GET /api/accounts/:id for metadata. GET /api/transactions?account_id=:id for filtered transactions.

---

### SCREEN 7: Transactions
**Route:** /transactions | **Gate:** v0.5.0 | **Purpose:** Full transaction list across all accounts with receipt scanning entry point.

**Screen Contents:**
- Page heading: "Transactions"
- Toolbar row:
  - Search input (searches merchant name, description, AND receipt item names)
  - [Scan Receipt] button (camera icon, navigates to /receipts/scan)
  - Filter dropdown: date range, category, account, amount range, "Has Receipt" toggle
  - Sort dropdown: date (newest/oldest), amount (highest/lowest), merchant (A-Z)
- Transaction table:
  - Columns: Date, Description/Merchant, Category (with edit dropdown), Amount, Account, AI Confidence
  - Receipt indicator icon on transactions with linked receipts (clickable to view receipt)
  - AI Confidence badge: green (>0.9), yellow (0.7-0.9), orange (<0.7) with "Review" button
  - Amount in JetBrains Mono, gain/loss colored
  - Hover: bg-overlay, clickable to transaction detail
  - Bulk select with checkbox column for bulk category editing
  - When a receipt-linked transaction is expanded, show line items inline (product name, qty, price)
- Pagination: 50 transactions per page, page numbers + prev/next

**Backend:** GET /api/transactions with query params for search, filter, sort, pagination. POST /api/transactions/:id/categorize for bulk category updates. Search queries both transactions.description AND receipt_items.product_name via a joined query.

---

### SCREEN 8: Budgets
**Route:** /budgets | **Gate:** v0.6.0 | **Purpose:** Monthly budget overview with spending limits per category.

**Screen Contents:**
- Page heading: "Budgets" with month selector (prev/next arrows + month name)
- Summary bar: "Total Budgeted: $X | Total Spent: $Y | Remaining: $Z"
- "Receipts this month" badge: "X receipts scanned, contributing to Y categories"
- Budget category list (card layout):
  - Each card: category icon + name, progress bar (green <75%, yellow 75-100%, red >100%), spent / limit in JetBrains Mono, percentage text
  - "Shared" badge on budgets visible to family members
  - Clickable to budget category detail
- [Add Budget Category] button: opens modal with category name, icon picker, monthly limit, period (monthly/weekly)
- Overspend alert banner at top if any category exceeds limit

**Backend:** GET /api/budgets?month=2026-04 returns all budget categories with spending aggregated from transactions (and receipt line items when available). POST /api/budgets for create, PUT /api/budgets/:id for update, DELETE /api/budgets/:id.
**AI:** Static CRUD at MVP. "AI coaching coming soon" label on each budget card. @FORGE agent enhances budgets at v6.0+.

---

### SCREEN 9: Budget Category Detail
**Route:** /budgets/:id | **Gate:** v0.6.0 | **Purpose:** Drill-down into a single budget category.

**Screen Contents:**
- Category header: icon, name, spent/limit, progress bar
- Spending trend chart (Recharts BarChart, last 6 months of this category)
- Transaction list: all transactions in this category for selected period
- Item-level breakdown (when receipt data exists): "Top Items in [Category]" section showing products ranked by total spend (e.g., under Groceries: Milk $24, Chicken $18, Bread $12)
- [Edit Limit] button, [Delete Category] button with confirmation

---

### SCREEN 10: Goals
**Route:** /goals | **Gate:** v0.6.0 | **Purpose:** Financial goal tracker.

**Screen Contents:**
- Page heading: "Goals"
- Goal cards (grid layout):
  - Each card: goal name, type icon (savings/debt/purchase), target amount, current amount, progress bar with percentage, projected completion date
  - "Shared" badge on goals visible to family members
  - Celebration animation (confetti) when 100% reached
- [Add Goal] button: opens modal with name, type (savings/debt payoff/purchase target), target amount, target date, linked account (optional)
- Empty state: "Set your first financial goal" with CTA

---

### SCREEN 11: Goal Detail
**Route:** /goals/:id | **Gate:** v0.6.0 | **Purpose:** Single goal view with contribution history.

**Screen Contents:**
- Goal header: name, type, target, current, progress bar, projected completion
- Contribution history chart (Recharts AreaChart showing progress over time)
- Linked account card (if linked)
- Milestone markers on the chart (25%, 50%, 75% milestones)
- [Edit Goal] button (target, deadline, linked account)
- [Delete Goal] button with confirmation

---

### SCREEN 12: @ORACLE Chat
**Route:** /chat (mobile), sidebar panel (desktop) | **Gate:** v0.5.0 | **Purpose:** Conversational AI financial assistant.

**Screen Contents:**

DESKTOP (sidebar panel, 320px, right edge):
- Collapsible toggle button
- Chat message area with scrollable history
- User messages: right-aligned, brand-primary background
- @ORACLE responses: left-aligned, bg-surface, may include inline charts, tables, or formatted financial data
- Suggested actions (when empty): 2x2 grid of question cards + "Scan a receipt" action card
- Input bar: text input + send button, "Ask @ORACLE anything about your finances"
- Query counter for free tier: "7 of 10 queries remaining this month"

MOBILE (/chat, fullscreen):
- Same chat interface, fullscreen layout
- Back button returns to previous screen
- FAB hidden when chat is open

SUGGESTED QUESTIONS (empty state):
- "How much did I spend on dining out last month?"
- "What's my biggest expense category?"
- "Am I on track with my savings goal?"
- "Scan a receipt" (opens /receipts/scan)

PURCHASE INTELLIGENCE QUERIES (v1.5.0+):
- "Where is [product] cheapest?"
- "Compare prices at [Store A] vs [Store B]"
- "How much have I spent on [product] this year?"
- "Show me my grocery spending trend by store"
- "What items got more expensive this month?"

FAMILY CONTEXT (v2.0.0+):
- @ORACLE knows which family member scanned which receipt
- Can answer: "How much has [family member] spent on groceries this month?"

**Backend:** POST /api/oracle/query sends user message, returns AI response. Conversation history stored in conversations table. Free tier: 10 queries/month tracked in users.query_count, resets monthly. Pro: unlimited.
**AI:** LangGraph orchestrates @ORACLE agent. Haiku classifier determines query type (simple lookup vs complex analysis). Simple queries use Haiku, complex use Sonnet. Voyage AI embeddings enable semantic search across transaction history and receipt items. RAG retrieves relevant transactions before generating response.

---

### SCREEN 13: Reports & Analytics
**Route:** /reports | **Gate:** v2.0.0 "Horizon" | **Purpose:** Detailed financial reports and analytics.

**Screen Contents:**
- Tab bar: Spending | Income | Cash Flow | Purchases (NEW)
- SPENDING tab: spending by category (bar chart), by merchant (table), by time period (line chart), year-over-year comparison
- INCOME tab: income sources, income vs expenses over time
- CASH FLOW tab: cash flow visualization (income minus expenses over time), projected cash flow
- PURCHASES tab (NEW):
  - Top products by total spend
  - Price changes for tracked products (line chart per product across stores)
  - Store comparison report (avg basket, frequency, total per store)
  - Category breakdown from receipt line items (produce vs meat vs dairy vs snacks)
- "Family Activity" report (when family is active): spending by family member
- Export: [Export CSV] and [Export PDF] buttons
- Shareable report links (read-only, expires in 7 days)
- Weekly and monthly digest summaries

---

### SCREEN 14: Investments Dashboard
**Route:** /investments | **Gate:** v3.0.0 "Compass" | **Purpose:** Investment portfolio tracking (read-only).

**Screen Contents:**
- Portfolio total value with delta
- Holdings list: name, ticker, shares, current price, total value, day change, overall change
- Asset allocation donut chart (stocks, bonds, ETFs, crypto, cash)
- Top movers (biggest gainers and losers today)
- Account breakdown (401k, IRA, brokerage)
- Performance chart (selected period)
- NO trading functionality, tracking only

---

### SCREEN 15: Net Worth Tracker
**Route:** /net-worth | **Gate:** v3.0.0 "Compass" | **Purpose:** Total net worth view.

**Screen Contents:**
- Net worth total with delta
- Line chart showing net worth progression over time
- Assets section: bank accounts (auto from Plaid), investments (auto), real estate (manual entry), vehicles (manual), other assets (manual)
- Liabilities section: credit cards (auto from Plaid), loans (manual), mortgage (manual)
- [Add Asset] and [Add Liability] buttons for manual entries
- Breakdown by category

---

### SCREEN 16: Alerts & Notifications
**Route:** /alerts | **Gate:** v2.0.0 "Horizon" | **Purpose:** Central notification hub.

**Screen Contents:**
- Notification list (most recent first, grouped by today/this week/earlier)
- Notification types:
  - Bill due reminders (calendar icon)
  - Budget overspend warnings (warning icon)
  - Unusual transaction alerts (alert icon)
  - @ORACLE proactive insights (lightbulb icon)
  - Price alerts from purchase intelligence (tag icon): "Eggs at Whole Foods are $2.50 more than Trader Joe's"
  - Family activity (people icon): "[Member] scanned a receipt from [store]", "[Member] exceeded [category] budget"
  - Sync status (refresh icon)
- Each notification: icon + title + description + timestamp + read/unread indicator
- Mark all as read, individual dismiss

---

### SCREEN 17: Settings Hub
**Route:** /settings/* | **Gate:** v0.3.0 | **Purpose:** App settings with sub-pages.

**Screen Contents:**
- Settings sidebar (left, 200px):
  - Profile
  - Family (v2.0.0)
  - Security
  - Preferences
  - Notifications (v2.0.0)
  - Connected Apps (v3.0.0)
  - Data & Privacy (v1.0.0)
  - Subscription & Billing (v5.0.0)
- Settings content area (right): renders selected sub-page

---

### SCREEN 17a: Profile
**Route:** /settings/profile | **Gate:** v0.3.0

- Display name (editable)
- Email (display only, change via security)
- Avatar upload
- Timezone selector
- [Save Changes] button

---

### SCREEN 17b: Security
**Route:** /settings/security | **Gate:** v0.3.0

- Change password (current + new + confirm)
- Manage OAuth connections (Google linked/unlinked)
- Two-factor authentication toggle (v4.0.0+)
- Active sessions list with "Sign out other sessions"

---

### SCREEN 17c: Preferences
**Route:** /settings/preferences | **Gate:** v0.3.0

- Theme toggle: [Dark] [Light]
- Default currency selector
- Number format: [1,234.56] [1.234,56]
- Date format: [MM/DD/YYYY] [DD/MM/YYYY] [YYYY-MM-DD]
- Default dashboard time range: [1M] dropdown
- [Save Changes] button

---

### SCREEN 17d: Notification Settings
**Route:** /settings/notifications | **Gate:** v2.0.0

Toggle and configure per notification type:
- Bill due reminders: [toggle]
- Budget overspend: [toggle]
- Unusual transactions: [toggle]
- @ORACLE insights: [toggle]
- Price alerts (from purchase intelligence): [toggle]
- Family activity: [toggle]
- Receipt scan confirmations: [toggle]
- Weekly digest email: [toggle]

---

### SCREEN 17e: Family
**Route:** /settings/family | **Gate:** v2.0.0 "Horizon" | **Purpose:** Household account management.

**Screen Contents:**
- Header: "Family" with member count ("2 of 3 members")
- Primary account holder card: name, email, role "Owner" badge, cannot be removed
- Family member cards (up to 2):
  - Name, email, role (Full Access / View Only), status (Active / Pending Invite)
  - [Edit Permissions] button opens modal:
    - Permission level toggle: Full Access / View Only
    - Data sharing checkboxes: select which accounts, budgets, and goals this member can see
    - [Save] / [Cancel]
  - [Remove Member] with confirmation dialog ("This will revoke their access to all shared data")
- [Invite Family Member] button (disabled if 2 members already added):
  - Email input
  - Permission level selector: Full Access / View Only
  - Data sharing checkboxes: which accounts, budgets, goals to share initially
  - [Send Invite] button
- Pending invites section: sent invites with [Resend] and [Cancel Invite]
- Info note: "All family members can scan receipts and contribute to shared purchase data, regardless of permission level."

**Backend:** family_members table with Supabase RLS. Invite sends email via Supabase Edge Function or SendGrid. Invite token validated on /register?invite=TOKEN. Permission changes update shared_accounts/budgets/goals jsonb arrays. RLS policies filter all data queries based on these arrays.

---

### SCREEN 17f: Connected Apps
**Route:** /settings/connected-apps | **Gate:** v3.0.0

- List of connected Plaid institutions with status
- Each connection: institution logo + name, last sync time, status (active/error/expired)
- [Reconnect] button for expired connections (re-triggers Plaid Link)
- [Disconnect] button with confirmation
- Future: additional integrations

---

### SCREEN 17g: Data & Privacy
**Route:** /settings/privacy | **Gate:** v1.0.0

- Export all data: [Download CSV] and [Download JSON] buttons
- Delete account: [Delete My Account] button with confirmation dialog and 30-day grace period explanation
- Data retention information section
- "What data does Forge Finance collect?" expandable FAQ
- Link to Privacy Policy
- Link to Terms of Service

---

### SCREEN 18: Subscription & Billing
**Route:** /settings/billing | **Gate:** v5.0.0 "Apex"

- Current plan display (Free or Pro) with feature comparison
- [Upgrade to Pro] or [Downgrade to Free] button
- Payment method: Stripe card input
- Billing history: list of past charges with receipt links
- [Cancel Subscription] with retention flow

---

### SCREEN 19: Receipt Scanner (NEW)
**Route:** /receipts/scan | **Gate:** v1.5.0 "Harvest" | **Purpose:** Scan and extract data from physical or digital receipts.

**Screen Contents:**

CAPTURE STAGE:
- Camera viewfinder (mobile) with capture button
- "Take Photo" button activates device camera (mobile)
- "Upload Image" button for gallery/file picker
- Drag-and-drop zone on desktop
- Accepted formats: JPEG, PNG, PDF
- Max file size: 10MB

PROCESSING STAGE:
- Receipt image displayed with scanning animation overlay
- "Extracting data..." message with progress indicator
- OCR provider badge: "PaddleOCR" (free) or "Mindee" (Pro)

REVIEW STAGE (all fields editable):
- Receipt image thumbnail (tappable to zoom/pan)
- Merchant name (text input, autocomplete from history)
- Date (date picker, pre-filled from OCR)
- Subtotal, Tax, Tip, Total (number inputs, pre-filled)
- Payment method dropdown: cash / credit / debit / other
- Line items table:
  - Headers: Product | Qty | Unit Price | Total | Category
  - Each row fully editable
  - Category dropdown per item: produce, meat, dairy, snacks, beverages, household, personal care, other
  - [Add Item] button for items OCR missed
  - Swipe-to-delete on mobile, [X] button on desktop
- "Match to Transaction" section:
  - Shows Plaid transactions from same date +/- 2 days with matching or close total
  - User taps to link, or [No match / Skip]
- [Confirm & Save] button (primary, brand-primary)
- [Discard] button (secondary, text-loss)

SUCCESS STATE:
- Check icon + "Receipt saved!"
- "X items added to your purchase database"
- [Scan Another] button
- [View Receipt] link to receipt detail
- [Back to Transactions] link

**Backend:**
- POST /api/receipts/scan: accepts image upload, stores in Supabase Storage, triggers OCR
- Free tier: PaddleOCR PP-OCRv5 (self-hosted on Render)
- Pro tier: Mindee Receipt API or Veryfi API
- POST /api/receipts/parse: sends raw OCR text to Claude Haiku for structured JSON extraction
- POST /api/receipts/confirm: saves receipt, receipt_items, product_prices
- GET /api/transactions/match?date=X&amount=Y: suggests Plaid transactions to link

**AI:**
- Claude Haiku parses raw OCR into structured product JSON
- Claude Haiku normalizes product names ("2% MLK GL" -> "Milk, 2%, 1 Gallon")
- Auto-categorizes each line item (produce, dairy, meat, etc.)

---

### SCREEN 20: Receipt History (NEW)
**Route:** /receipts | **Gate:** v1.5.0 "Harvest" | **Purpose:** Browse and search all scanned receipts.

**Screen Contents:**
- Page heading: "Receipts"
- Search bar: search by merchant name, product name, date
- Filter pills: All | This Week | This Month | By Store
- Receipt list (card layout, most recent first):
  - Each card: receipt image thumbnail (60px), merchant name, date, total (JetBrains Mono), item count ("12 items"), linked transaction indicator (link icon if matched)
  - Tap to expand: full line item list with prices
  - [View Full Image] opens receipt photo in modal
  - [Edit] re-opens review screen
  - [Delete] with confirmation
- Sort: date (newest/oldest), amount (highest/lowest), store (A-Z)
- Empty state: "No receipts yet. Scan your first receipt to start tracking prices!" with [Scan Receipt] CTA
- Family receipts: if family is active, show receipts from all family members with "Scanned by [name]" label

**Backend:** GET /api/receipts with query params. Supabase RLS scopes to user + family members.

---

### SCREEN 21: Purchase Intelligence (NEW)
**Route:** /purchases | **Gate:** v2.0.0 "Horizon" | **Purpose:** AI-powered product price database and store comparison (the feature no competitor has).

**Screen Contents:**

SEARCH (prominent, top of page):
- Large search bar: "Search any product..."
- Autocomplete from product_prices (products user has purchased)
- Results: product name, last price, store, date

TOP INSIGHTS (AI-generated cards, 3 across on desktop):
- "Your most expensive store for groceries is [Store]" with comparison data
- "Prices increased on X items this month" with item list
- "[Product] is cheapest at [Store]" for frequently purchased items
- Cards refresh weekly (cached, not real-time)

TRACKED PRODUCTS (products purchased 3+ times):
- Grid of product cards:
  - Product name, average price, price range (min-max), purchase count, trend arrow (up/down/stable)
  - Tap to expand: price history chart with store-colored lines (e.g., Walmart = blue, Trader Joe's = orange, Costco = red)

STORE COMPARISON:
- Bar chart: average basket cost per store
- Table: stores ranked by total spend, visit frequency, avg items per visit, avg item price

CATEGORY BREAKDOWN:
- Donut chart: produce vs meat vs dairy vs snacks vs household vs personal care
- Each segment tappable to see items in that category with prices

**Backend:**
- GET /api/purchases/insights: AI-generated insight cards (cached weekly)
- GET /api/purchases/products?search=X: search product_prices
- GET /api/purchases/product/:name/history: price history across stores
- GET /api/purchases/stores/comparison: store ranking data

**AI:** @ORACLE generates insight cards weekly via a scheduled job. Price trend detection compares rolling 30-day average vs prior 30-day. Store ranking weighted by frequency, recency, total spend.

---

## VERSION ROADMAP

| Gate | Version | Codename | Key Deliverables | Test Target |
|---|---|---|---|---|
| Foundation | v0.0.0 | - | Files + research + decisions | COMPLETE |
| Scaffold | v0.1.0 | - | Next.js + FastAPI + Alembic + design tokens | 0 |
| Data Layer | v0.2.0 | - | 12 tables, vector(1024), Plaid categories, RLS | 12 |
| Auth | v0.3.0 | - | Google OAuth + magic link + JWT + family invite flow | 27 |
| Plaid + @SYNC | v0.4.0 | - | Webhooks, cursor sync, cron fallback, onboarding | 50 |
| Dashboard + @ORACLE | v0.5.0 | - | Hybrid chat UI, Haiku classifier, Voyage RAG. NOTE: If this gate slips, split into v0.5.0-alpha (Dashboard + Account Detail + Transactions with mock data) and v0.5.0-beta (@ORACLE + RAG pipeline). Do not let AI integration block UI progress. | 89 |
| Budgets + Goals | v0.6.0 | - | Static CRUD, "AI coaching coming soon" | 119 |
| MVP Launch | v1.0.0 | Genesis | QA + landing page + waitlist + deploy + data privacy settings | 119 |
| Receipt Intelligence | v1.5.0 | Harvest (NEW) | Receipt scanner, receipt history, PaddleOCR pipeline, product database, transaction matching | 155 |
| Analytics + Social | v2.0.0 | Horizon | Reports, purchase intelligence, alerts, family settings, notification settings | 195 |
| Investments | v3.0.0 | Compass | Investments dashboard, net worth tracker, connected apps, Playwright E2E | 230 |
| Performance | v4.0.0 | Forge | Performance audit, a11y, beta access, Railway migration | 255 |
| Public Launch | v5.0.0 | Apex | Stripe billing, freemium gates, Pro OCR (Mindee/Veryfi), production Plaid, SHIP IT | 285 |

### Post-v5.0 Roadmap
- v6.0: @ROUTER + @FORGE agents (AI-powered budget coaching)
- v7.0: @SENTINEL + local LLM option (Ollama, Qwen3-Embedding migration)
- v8.0: @ADVISOR agent (financial planning)

---

## PRICING

| | Free | Pro |
|---|---|---|
| Price | $0 | $9/month or $89/year |
| Linked accounts | 1 | Unlimited |
| Transaction history | 90 days | Full |
| @ORACLE queries | 10/month | Unlimited |
| Receipt scans | 5/month | Unlimited |
| Purchase intelligence | No | Yes |
| Reports & analytics | No | Yes |
| Family sharing | No | Up to 3 people |
| Investments/Net worth | No | Yes (when released) |

---

## LOCKED DECISIONS

| # | Decision | Impact |
|---|---|---|
| DEC-001 | 2 agents at MVP (@ORACLE + @SYNC) | @FORGE -> v6.0, @SENTINEL -> v7.0 |
| DEC-002 | Cloud-only AI | Ollama -> v7.0+ |
| DEC-003 | Plaid-only | MX -> v6.0 |
| DEC-004 | Monitor Plaid AI enrichment | Quarterly check |
| DEC-005 | Static CRUD budgets | No AI agent, "coming soon" label |
| DEC-006 | $0.50/user/month ceiling (free tier) | Sonnet -> Haiku fallback via LiteLLM |
| DEC-007 | 2 agents at MVP (@ORACLE + @SYNC) | @ROUTER returns at v6.0 |
| DEC-008 | Voyage AI, vector(1024) | Replaces OpenAI embeddings |
| DEC-009 | Clean rebuild from v0.0.0 | Previous v3.2.0 abandoned |
| DEC-010 | Alembic + SQLAlchemy for migrations | Not Prisma |
| DEC-011 | Hybrid @ORACLE: sidebar desktop, fullscreen mobile | Not command bar |
| DEC-012 | Free tier: 10 AI queries/month (Option B) | Best conversion funnel |
| DEC-013 | PaddleOCR for free tier OCR | Open-source, Apache 2.0 |
| DEC-014 | Mindee/Veryfi for Pro tier OCR | Best accuracy for paid users |
| DEC-015 | Family: max 3 people (primary + 2 invited) | Per-member permissions |
| DEC-016 | Family data sharing is granular | Primary chooses what each member sees |
| DEC-017 | All family members can scan receipts | Feeds shared product database |
| DEC-018 | v1.5.0 "Harvest" gate for receipt intelligence | New gate between Genesis and Horizon |
| DEC-019 | Annual pricing: $89/year ($19 savings) | Matches competitor pattern |

---

# END OF SPECIFICATION
# Total: 28 views across 14 gates
# Ready for Claude Code /start intake
