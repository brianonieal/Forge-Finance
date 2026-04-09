# FRONTEND_SPEC.md
# Forge Finance | Frontend Component Specification
# Source: Forge_Finance_app_spec.pdf | April 2026
# Blueprint v10
# APPROVED -- matches PDF spec exactly
# No component is built without a matching entry here

---

## DESIGN TOKEN REFERENCE
(Full definitions in DESIGN_SYSTEM.md)

```
bg-base:       #0A0E1A    bg-surface:    #0F1629
bg-elevated:   #1A2035    brand-primary: #2E6DB4
brand-accent:  #C8A855    gain-green:    #00C48C
loss-red:      #FF4D4D    text-primary:  #E8EDF5
text-secondary:#8B96A8    border:        rgba(255,255,255,0.08)

Font UI:       Inter
Font money:    JetBrains Mono (ALL dollar amounts -- no exceptions)
```

---

## GLOBAL COMPONENTS

### NavigationSidebar
```
Props: activeRoute: string
Variants: expanded (240px) | collapsed (60px icon-only, mobile)
States: loading (skeleton) | default
Layout:
  - Logo top (clickable, /dashboard)
  - Nav items: 40px height, icon (20px) + label, px-3
  - Active: left 3px border brand-primary, bg-overlay
  - Hover: bg-overlay, 150ms ease
  - Bottom: settings icon, avatar + name, logout
  - Version-gated: grayed, "Coming in vX.X.X" tooltip
Responsive: 240px desktop, 60px icon-rail below 768px
```

### MobileBottomTabBar
```
Props: activeTab: 'dashboard' | 'accounts' | 'chat' | 'budgets' | 'settings'
Fixed bottom, 5 tabs: Dashboard, Accounts, Chat, Budgets, Settings
Active: brand-primary icon + label
Inactive: text-secondary
FAB: top-right of tab bar, quick actions menu
Visibility: mobile only (below 768px)
```

### Toast
```
Props: type: 'success' | 'error' | 'warning' | 'info', title: string, description?: string
Position: top-right, 16px from edges, max 3 stacked
success: gain-green, 4s auto-dismiss
error: loss-red, NO auto-dismiss
warning: brand-accent amber, 6s auto-dismiss
info: brand-primary, 4s auto-dismiss
Anatomy: icon + title + description + close X + progress bar
```

### PeriodSelector
```
Props: value: '1D'|'1W'|'1M'|'3M'|'6M'|'1Y'|'ALL', onChange: fn
Pills: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
Active: brand-primary background
Sticky: top-right of dashboard on scroll
Effect: invalidates all TanStack Query keys on change
```

### MetricCard
```
Props: label: string, value: string, delta?: string, deltaType?: 'gain'|'loss'|'neutral'
Layout: label (text-sm text-secondary) / value (text-2xl JetBrains Mono) / delta (text-sm)
delta gain: gain-green + ▲ arrow + percent
delta loss: loss-red + ▼ arrow + percent
delta neutral: text-secondary + "—"
Loading: skeleton (180px wide block + 120px block below)
Font: value MUST use JetBrains Mono
```

### SkeletonScreen
```
Props: variant: 'metric-card' | 'table-row' | 'full-page' | 'chart'
metric-card: 180px wide block (number) + 120px block (delta)
table-row: alternating heights matching real data rows
Never use spinner for initial page loads
Animation: pulse opacity 0.5 → 1 → 0.5
```

### ErrorState
```
Props: type: 'full-page' | 'inline', title: string, message: string, onRetry?: fn
full-page: centered, alert icon (48px), title, message, [Retry] + [Go to Dashboard]
inline: replaces content, alert icon (24px), short message, retry link
network-offline: full-width amber banner top of page (always visible)
```

---

## SCREEN COMPONENTS

### SCREEN 1: Landing Page (/)
**Gate: v1.0.0 | Pre-auth**

```
HeroSection
  Props: none
  Layout: full viewport height, centered
  Headline: "Your finances, explained by AI." (text-4xl, font-bold, text-primary)
  Subheadline: "Forge Finance connects to your bank..." (text-lg, text-secondary, max-w-2xl)
  CTA primary: [Join the Waitlist] (brand-primary, large)
  CTA secondary: [See How It Works] (anchor link to features section)
  Background: subtle gradient bg-base to bg-surface

FeaturesGrid
  Props: none
  Layout: 3-col desktop, 1-col mobile
  Card 1: Conversational AI -- chat bubble icon -- @ORACLE description
  Card 2: Real-Time Sync -- refresh icon -- Plaid webhook description
  Card 3: Smart Budgets & Goals -- target icon -- budget + goals description

PricingSection
  Layout: 2-col comparison
  Free tier: 1 linked account, 90-day history, 10 AI queries/month, basic budgets/goals
  Pro tier ($9/month): unlimited accounts, full history, unlimited AI, reports, investments
  [Join Free] button | [Join Waitlist for Pro] button

WaitlistSignup
  Layout: centered section
  Email input field
  [Join Waitlist] button
  Privacy note: "We'll never share your email."
  Success state: check icon + "You're on the list!" (replaces form)
```

---

### SCREEN 2: Auth (/login, /register, /reset-password)
**Gate: v0.3.0 | Pre-auth**

```
AuthCard
  Props: mode: 'login' | 'register' | 'reset'
  Layout: centered card, bg-surface, rounded-xl, p-8, max-w-md
  Logo: Forge Finance mark

LoginForm
  Google OAuth button (full width, icon + "Continue with Google")
  Divider: "or"
  Magic link email input + [Send Magic Link] button
  Switch to register link

RegisterForm
  Same as login, "Create account" heading
  TOS agreement text

ResetPasswordForm
  Email input + [Send Reset Link]
  Back to login link
```

---

### SCREEN 3: Onboarding Wizard (/onboarding)
**Gate: v0.4.0 | Post-auth, first-time only**

```
OnboardingWizard
  Props: currentStep: 1|2|3|4
  Progress bar: top, 4 steps
  Step indicator: "Step X of 4"

Step1Welcome
  Headline: "Welcome to Forge Finance"
  Subtext: brief value prop
  [Connect Your Bank] CTA

Step2PlaidConnect
  Plaid Link integration
  [Connect Bank Account] launches Plaid Link modal
  Supported banks list (logos)
  Security note

Step3Syncing
  Animated sync indicator
  "Syncing your transactions..."
  "This may take a few minutes"
  Progress indicator (indeterminate)
  Waits for HISTORICAL_UPDATE webhook before advancing

Step4Complete
  Success checkmark animation
  "Your finances are ready"
  Preview of first insights (3 placeholder insight cards)
  [Go to Dashboard] CTA
```

---

### SCREEN 4: Dashboard (/dashboard)
**Gate: v0.5.0 | Sidebar: primary**

```
DashboardLayout
  PeriodSelector: sticky top-right
  Grid: 12-col, 16px gap

MetricsRow (4 cards)
  NetWorthCard: total across all accounts (JetBrains Mono, text-3xl)
  DailyPnLCard: day's gain/loss (gain-green or loss-red + ▲/▼)
  BudgetHealthCard: % of budgets on track
  TopSpendCard: largest expense category this period

SpendingTrendChart
  Recharts AreaChart
  X: date range, Y: spending amount
  Color: brand-primary fill, gain-green line

SpendingByCategoryChart
  Recharts PieChart
  Category labels + dollar amounts (JetBrains Mono)
  Legend below chart

RecentTransactionsList
  5 most recent transactions
  Per row: merchant name, category chip, date, amount (JetBrains Mono)
  [View All] link to /transactions

OracleSidebarPanel (desktop persistent)
  Right panel: 320px wide
  Chat interface (see Screen 12 spec)
  Collapses to icon on mobile
```

---

### SCREEN 5: Accounts (/accounts)
**Gate: v0.4.0 | Sidebar**

```
AccountsHeader
  Title: "Accounts" (text-xl, font-semibold)
  [+ Connect Account] button (brand-primary)

AccountCardList
  Per account card (bg-surface, rounded-xl, p-6):
    Institution logo (32px)
    Account name (text-lg, font-semibold)
    Account type badge (checking, savings, credit)
    Balance (text-2xl, JetBrains Mono)
    Last synced: "[X] minutes ago" (text-sm, text-secondary)
    Status: Connected (gain-green dot) | Error (loss-red dot)
  Click: navigates to /accounts/:id

EmptyState
  "No accounts connected"
  [Connect Your First Account] CTA
```

---

### SCREEN 6: Account Detail (/accounts/:id)
**Gate: v0.5.0 | Drill-down from Accounts**

```
AccountDetailHeader
  Back arrow to /accounts
  Institution logo + account name
  Account type + last 4 digits
  Balance (text-3xl, JetBrains Mono)
  Sync status + [Refresh] button

BalanceHistoryChart
  Recharts LineChart
  30-day default, period selector updates
  gain-green line

TransactionListFiltered
  Search input
  Category filter chips
  Date range filter
  Transaction rows (same as Screen 7)
  Pagination or infinite scroll
```

---

### SCREEN 7: Transactions (/transactions)
**Gate: v0.5.0 | Sidebar**

```
TransactionsHeader
  Title: "Transactions"
  Search input (real-time filter)
  [Export] button (placeholder for Pro, disabled on free)

FilterBar
  Category chips (All, Food, Transport, Shopping, etc.)
  Date range picker (start date, end date)
  Amount range (optional)

TransactionTable
  Columns: Date | Merchant | Category | Account | Amount
  Amount: JetBrains Mono, gain-green if income, loss-red if expense
  Category: colored chip
  Sortable columns (date, amount)
  Row click: transaction detail drawer

TransactionDetailDrawer
  Slides in from right
  Merchant name + logo
  Amount (large, JetBrains Mono)
  Date, account, category
  [Recategorize] button
  Notes field (editable)

EmptyState
  "No transactions found"
  Clear filters link
```

---

### SCREEN 8: Budgets (/budgets)
**Gate: v0.6.0 | Sidebar**

```
BudgetsHeader
  Title: "Budgets"
  Period selector (monthly default)
  [+ Create Budget] button

BudgetHealthRing
  Recharts RadialBarChart (overall budget health)
  Center: "X% on track"
  Legend: on track (gain-green), over budget (loss-red)

BudgetCategoryList
  Per category row:
    Category icon + name
    Progress bar (actual / limit)
    "$X of $Y" (JetBrains Mono)
    Percent (JetBrains Mono)
    Status chip: On Track | Warning | Over Budget
  Click: navigates to /budgets/:id
  Alert threshold colors:
    0-70%: gain-green
    70-90%: brand-accent (warning amber)
    90-100%: loss-red

EmptyState
  "No budgets set up"
  [Create Your First Budget] CTA
```

---

### SCREEN 9: Budget Category Detail (/budgets/:id)
**Gate: v0.6.0 | Drill-down from Budgets**

```
BudgetDetailHeader
  Category name + icon
  Budget limit (JetBrains Mono, editable inline)
  Current spend (JetBrains Mono)
  Remaining (JetBrains Mono)
  Progress bar

SpendingTrendChart
  Recharts AreaChart -- this category only
  Period selector

TransactionListFiltered
  All transactions for this category this period
```

---

### SCREEN 10: Goals (/goals)
**Gate: v0.6.0 | Sidebar**

```
GoalsHeader
  Title: "Goals"
  [+ Create Goal] button (brand-primary)

ActiveGoalsGrid
  Layout: 2-col desktop, 1-col mobile

GoalCard (per goal)
  bg-surface, rounded-xl, p-6
  Goal name (text-lg, font-semibold)
  CircularProgressRing (120px, center of card):
    Percentage inside (text-2xl, JetBrains Mono)
    Ring: brand-primary fill, bg-overlay track
  Saved: "$X,XXX of $XX,XXX" (text-base, JetBrains Mono)
  Target date: "Dec 31, 2026" (text-sm, text-secondary)
  PaceIndicator:
    ✓ "On track" (gain-green) if projected completion <= target
    ⚠ "Slightly behind" (warning-amber) if > target by <= 30 days
    ✗ "Behind schedule" (loss-red) if > target by > 30 days
  "At this pace, you'll reach your goal by [date]" (text-xs, text-secondary)
  Three-dot menu: [Edit] [Pause] [Delete]
  Click: navigates to /goals/:id

CompletedGoalsSection
  Collapsible: "Completed (3)" header with expand/collapse
  Cards: dimmed, check badge, completion date
  [Celebrate Again] link (re-triggers celebration modal)

CelebrationModal (triggered on goal reach)
  Full-screen overlay, confetti animation
  🎉 "Goal Reached!" (text-3xl)
  "[Goal Name] -- $[Amount]" (text-xl, brand-accent)
  [Celebrate!] button dismisses modal
  Respects prefers-reduced-motion (no confetti, just message)

CreateGoalModal (bottom sheet mobile, modal desktop)
  Goal name: text input
  Target amount: currency input (JetBrains Mono)
  Target date: date picker
  Linked account: dropdown
  [Create Goal] | [Cancel]

EmptyState
  "No goals yet"
  [Create Your First Goal] CTA
```

---

### SCREEN 11: Goal Detail (/goals/:id)
**Gate: v0.6.0 | Drill-down from Goals**

```
GoalDetailHeader
  Back arrow to /goals
  Goal name + edit inline
  CircularProgressRing (180px, larger version)
  Amount saved / target (JetBrains Mono)
  Target date + pace indicator

ContributionHistoryChart
  Recharts AreaChart -- balance over time toward goal

LinkedAccountSection
  Account name, current balance, last synced

GoalActions
  [Edit Goal] [Pause Goal] [Delete Goal]
```

---

### SCREEN 12: @ORACLE Chat (/chat mobile, sidebar panel desktop)
**Gate: v0.5.0**

```
ChatContainer
  Desktop: persistent right panel (320px), always visible on dashboard
  Mobile: full-screen at /chat route

MessageList
  Scrollable, newest at bottom
  User message: right-aligned, brand-primary bg, white text
  @ORACLE message: left-aligned, bg-surface
  Timestamps: text-xs, text-secondary, on hover

OracleMessage
  Avatar: small Forge Finance mark
  Content: markdown rendered (bold, lists, numbers)
  Financial numbers in JetBrains Mono always
  Sources: collapsible "Based on X transactions" expandable

TypingIndicator
  3 dots animation during SSE stream
  Shows while waiting for first token

ChatInput
  Text area (auto-expand, max 4 rows)
  [Send] button or Enter to send
  Shift+Enter for newline

SuggestedQuestions (empty state)
  "How much did I spend on food last month?"
  "What's my biggest expense category?"
  "Am I on track with my savings goals?"
  "Show me unusual transactions this week"

QueryLimitBanner (free tier)
  Shows when >= 8 of 10 monthly queries used
  "[X] of 10 AI queries used this month"
  [Upgrade to Pro] link

CeilingMessage (when limit reached)
  "You've reached your monthly AI query limit."
  "Upgrade to Pro for unlimited queries."
  [Upgrade to Pro] button (brand-primary)
```

---

### SCREEN 13: Reports & Analytics (/reports)
**Gate: v2.0.0 | Sidebar**
```
[Spec to be detailed at v2.0.0 gate open]
Placeholder: "Reports coming in v2.0.0 Horizon"
```

---

### SCREEN 14: Investments Dashboard (/investments)
**Gate: v3.0.0 | Sidebar**
```
[Spec to be detailed at v3.0.0 gate open]
Placeholder: "Investments coming in v3.0.0 Compass"
```

---

### SCREEN 15: Net Worth Tracker (/net-worth)
**Gate: v3.0.0 | Sidebar**
```
[Spec to be detailed at v3.0.0 gate open]
```

---

### SCREEN 16: Alerts & Notifications (/alerts)
**Gate: v2.0.0 | Sidebar**

```
AlertsHeader
  Title: "Alerts & Notifications"
  [Mark All as Read] text button
  Filter chips: All | AI Insights | Budget Alerts | Goals | Sync Status | System

NotificationFeed (chronological, newest first)
  Per notification card:
    Type icon (left):
      🤖 AI insight (brand-primary)
      💰 Budget alert (warning-amber or loss-red)
      🎯 Goal update (gain-green)
      🔄 Sync status (text-secondary)
      📊 System (brand-accent)
    Title (text-base, font-medium)
    Description (text-sm, text-secondary)
    Timestamp: relative ("2 hours ago")
    Unread indicator: blue dot on left edge
    [View Details →] navigates to relevant screen
    Dismiss: X button or swipe on mobile
    Read/unread toggle on click

EmptyState
  "All caught up!"
  "No new notifications. We'll let you know when something needs your attention."
```

---

### SCREEN 17: Settings (/settings/*)
**Gate: v0.3.0 | Sidebar bottom**

```
SettingsLayout
  Left sidebar (200px): Profile | Security | Preferences | Notifications | Connected Apps
  Right content area: active sub-page

Profile (/settings/profile)
  Avatar: upload circle (80px), click to change, jpg/png < 2MB
  Full name: text input
  Email: text input (verified badge if confirmed)
  [Save Changes] button

Security (/settings/security)
  Change password: current + new + confirm
  Two-factor auth: [Enable 2FA] button (v4.0.0+)
  Active sessions: device, location, last active, [Revoke] per session
  [Delete Account] button (loss-red, requires "type DELETE to confirm" modal)

Preferences (/settings/preferences)
  Theme: [Dark] [Light] toggle with preview swatch
  Default currency: [USD] dropdown
  Number format: [1,234.56] [1.234,56] radio
  Date format: [MM/DD/YYYY] [DD/MM/YYYY] [YYYY-MM-DD] radio
  Default dashboard period: [1M] dropdown
  [Save Changes] button

Notifications (/settings/notifications)
  Toggle switches:
    Budget threshold alerts: [on/off]
    Budget threshold level: [70%] dropdown
    Goal milestone alerts: [on/off]
    Transaction sync errors: [on/off]
    AI insights: [on/off]
    Weekly digest email: [on/off]
    Digest day: [Monday] dropdown (when digest on)
  [Save Changes] button

Connected Apps (/settings/connected-apps)
  List of Plaid-linked institutions
  Per institution card:
    Bank logo | Name | X accounts | Last synced: [timestamp]
    Status: Connected (green dot) | Error (red dot)
    [Disconnect] button (requires confirmation)
  [+ Connect New Account] button → Plaid Link
```

---

### SCREEN 18: Subscription & Billing (/settings/billing)
**Gate: v5.0.0 | Settings sub-page**

```
CurrentPlanCard (prominent, top)
  Free users:
    "Free Plan" badge
    Usage: "1 of 1 accounts linked" (progress bar, full)
    Usage: "X of 10 AI queries used this month" (progress bar)
    History: "90 days" with "Full history on Pro" note
    [Upgrade to Pro -- $9/month] button (brand-primary, large)
  Pro users:
    "Pro Plan" badge (brand-accent gold)
    "Unlimited" indicators
    Next billing date
    Payment method: "Visa ending 4242" [Edit]
    [Cancel Subscription] text link (text-secondary)

PlanComparisonTable
  Feature | Free | Pro
  Linked accounts | 1 | Unlimited
  Transaction history | 90 days | Full
  AI queries | 10/month | Unlimited
  Reports & export | -- | ✓
  Investments | -- | ✓
  Weekly digest | -- | ✓
  Priority support | -- | ✓

PaymentHistory (Pro users)
  Table: Date | Amount | Status | Invoice
  Status: Paid (green) | Failed (red) | Pending (amber)
  Download invoice link per row

UpgradeFlow
  [Upgrade] → Stripe Checkout (redirects to Stripe-hosted page)
  Monthly/Annual toggle: $9/mo or $90/year (save 17%)
  Return URL: /settings/billing?success=true
  Success: confetti + "Welcome to Pro!" toast

CancellationFlow
  [Cancel] → retention modal:
    "We'd hate to see you go. Here's what you'll lose..."
    List of Pro features
    [Keep Pro] button (brand-primary)
    [Continue Cancellation] text link
  Confirmation: "Your Pro plan will remain active until [billing period end]."
  [Confirm Cancellation] button
```

---

## API ENDPOINT REFERENCE

### Auth & Settings
```
GET/PATCH  /api/settings/profile
POST       /api/settings/security/change-password
GET        /api/settings/sessions
DELETE     /api/settings/sessions/:id
GET/PATCH  /api/settings/preferences
GET/PATCH  /api/settings/notifications
GET        /api/settings/connected-apps
DELETE     /api/settings/connected-apps/:id
```

### Plaid
```
POST       /api/plaid/create-link-token
POST       /api/plaid/exchange-public-token
POST       /api/webhooks/plaid
GET        /api/plaid/accounts
```

### Transactions
```
GET        /api/transactions?account_id=&category=&start=&end=&search=&limit=&cursor=
GET        /api/transactions/:id
PATCH      /api/transactions/:id/category
```

### Budgets
```
GET        /api/budgets
POST       /api/budgets
GET        /api/budgets/:id
PATCH      /api/budgets/:id
DELETE     /api/budgets/:id
```

### Goals
```
GET        /api/goals
POST       /api/goals
GET        /api/goals/:id
PATCH      /api/goals/:id
DELETE     /api/goals/:id
```

### @ORACLE
```
POST       /api/oracle/query      (SSE streaming response)
GET        /api/oracle/history    (conversation history)
GET        /api/oracle/usage      (query count this month)
```

### Alerts
```
GET        /api/alerts?type=&read=false&limit=50
PATCH      /api/alerts/:id/read
PATCH      /api/alerts/mark-all-read
DELETE     /api/alerts/:id
```

### Billing (v5.0.0)
```
POST       /api/billing/create-checkout-session
POST       /api/billing/create-portal-session
GET        /api/billing/subscription
GET        /api/billing/invoices
POST       /api/webhooks/stripe
```

### Dashboard
```
GET        /api/dashboard/metrics?period=1M
GET        /api/dashboard/spending-trend?period=1M
GET        /api/dashboard/category-breakdown?period=1M
```

### Reports (v2.0.0+)
```
[To be specified at v2.0.0 gate open]
```
