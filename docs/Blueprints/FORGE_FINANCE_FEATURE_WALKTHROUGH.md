# FORGE FINANCE: PAGE-BY-PAGE FEATURE WALKTHROUGH
# Updated with Research Findings + New Screens + Family Feature
# Date: April 8, 2026

---

## HOW TO READ THIS DOCUMENT

Each screen shows:
- **Current spec:** What's already in the April 2026 spec PDF
- **Research changes:** What the competitive research says to add, remove, or modify
- **New additions:** Features from the receipt scanning and family research
- **Gate:** When this screen enters the build
- **Status:** KEEP AS-IS / MODIFY / NEW SCREEN

---

## SCREEN 1: LANDING PAGE
**Route:** `/` | **Gate:** v1.0.0 "Genesis" | **Status:** MODIFY

**Current spec:**
- Hero section: "Your finances, explained by AI"
- Features grid (3 cards): Conversational AI, Real-Time Sync, Smart Budgets & Goals
- Pricing section: Free (1 account, 90-day, 10 AI queries) vs Pro ($9/month)
- Waitlist signup form
- Footer with privacy/terms links

**Research changes:**
- ADD a 4th feature card: "Receipt Intelligence" with scanner icon and description: "Scan any receipt. Track every price. Know where to shop smarter."
- MODIFY pricing section to include receipt scanning in tier comparison:
  - Free: add "5 receipt scans/month"
  - Pro: add "Unlimited receipt scans + purchase intelligence"
- ADD annual pricing option: "$9/month or $89/year (save $19)"
- ADD "Family sharing: up to 3 people on one account" as a Pro bullet point
- MODIFY the hero subheadline to mention receipt scanning alongside bank sync

**Final feature list for this screen:**
- Hero with headline, subheadline, CTA
- 4-card features grid (AI, Sync, Budgets, Receipt Intelligence)
- Pricing comparison (Free vs Pro with annual toggle)
- Waitlist signup
- Footer

---

## SCREEN 2: AUTH (Login / Register / Reset Password)
**Route:** `/login`, `/register`, `/reset-password` | **Gate:** v0.3.0 | **Status:** MODIFY

**Current spec:**
- Google OAuth (primary, single button)
- Email magic link (secondary)
- Email + password fallback
- Centered card layout on dark background
- JWT in httpOnly cookies via Supabase Auth

**Research changes:**
- ADD: Family member login flow. When a family member receives an email invite, they click the link, land on `/register?invite=TOKEN`, and create their own credentials (Google OAuth or email/password). The invite token associates them with the primary account holder.
- ADD: After auth, check if user is a family member. If so, redirect to the shared dashboard with appropriate permission level applied.
- KEEP everything else as-is.

**Final feature list for this screen:**
- Google OAuth, magic link, email+password
- Invite token handling for family members
- Redirect logic: new user -> onboarding, returning -> dashboard, family member -> shared dashboard

---

## SCREEN 3: ONBOARDING WIZARD
**Route:** `/onboarding` | **Gate:** v0.4.0 | **Status:** MODIFY

**Current spec:**
- 3-step sequential flow with progress indicator
- Step 1: Link bank account via Plaid Link
- Step 2: Select default currency and display preferences
- Step 3: Confirm setup, @SYNC triggers initial transaction pull

**Research changes:**
- EXPAND to 4 steps:
  - Step 1: Link bank account (existing)
  - Step 2: Currency and display preferences (existing)
  - Step 3 (NEW): "Set up your first budget" with 5 suggested categories and amounts based on income. Quick preset: "Starter Budget" auto-fills common categories (Groceries, Dining, Transport, Entertainment, Shopping) with recommended limits.
  - Step 4: Confirm + meet @ORACLE with a sample query
- ADD: "Skip" option on every step (Plaid can be skipped too for manual-entry users)
- ADD: After step 4, show a tooltip pointing to the "Scan Receipt" button: "Tip: Scan a receipt to start tracking prices!"

**Final feature list for this screen:**
- 4-step wizard with skip options
- Plaid Link, preferences, starter budget, @ORACLE intro
- Receipt scanning tooltip at completion

---

## SCREEN 4: DASHBOARD
**Route:** `/dashboard` | **Gate:** v0.5.0 | **Status:** MODIFY

**Current spec:**
- Top bar with search (Cmd+K), notification bell, period selector (1D/1W/1M/3M/6M/1Y/ALL)
- Hero: Net Worth headline with delta
- 4 metric cards: Total Balance, Today's P&L, Monthly Spending, Savings Progress
- Left column: Performance area chart, top 5 transactions table with AI confidence badges
- Right column: Allocation donut chart, recent activity feed
- @ORACLE sidebar (desktop, 320px, collapsible)

**Research changes:**
- ADD: 5th metric card slot reserved for "Receipt Insights" (v1.5.0+). Shows: "X items scanned this month" with sparkline of grocery spending. Greyed out with "Coming in v1.5" until receipt scanning ships.
- ADD: Dashboard is the default view for family members too. Family members see only the accounts/budgets they've been granted access to.
- MODIFY: Activity feed should include receipt scan events ("You scanned a receipt from Trader Joe's: $47.32")
- KEEP: Everything else as-is. The dashboard spec is solid.

**Final feature list for this screen:**
- Top bar with search, notifications, period selector
- Net worth hero + 4 metric cards (5th reserved for receipts)
- Performance chart, recent transactions, donut chart, activity feed
- @ORACLE sidebar
- Family member data scoping via RLS

---

## SCREEN 5: ACCOUNTS
**Route:** `/accounts` | **Gate:** v0.4.0 | **Status:** KEEP AS-IS

**Current spec:**
- Account list grouped by institution
- Each card: name, type, balance, last sync timestamp, institution logo
- "Add Account" triggers Plaid Link
- Manual account entry option

**Research changes:**
- No changes needed. This screen is straightforward and matches competitor patterns.
- Family members with access see only accounts shared with them.

---

## SCREEN 6: ACCOUNT DETAIL
**Route:** `/accounts/:id` | **Gate:** v0.5.0 | **Status:** MINOR MODIFY

**Current spec:**
- Transaction history for single account with search and filters
- Balance chart over time
- Account metadata
- "Unlink Account" option

**Research changes:**
- ADD: "Scan Receipt" quick action on individual transactions. User taps a transaction, sees the detail, and can tap "Attach Receipt" to link a scanned receipt to that specific transaction.
- KEEP everything else.

---

## SCREEN 7: TRANSACTIONS
**Route:** `/transactions` | **Gate:** v0.5.0 | **Status:** MODIFY

**Current spec:**
- Full transaction list across all accounts
- Sortable columns: date, merchant, amount, category, account
- Filters: date range, category, account, amount range
- Search by merchant name
- AI confidence badges on categorized transactions
- Bulk category editing

**Research changes:**
- ADD: "Scan Receipt" button in toolbar (camera icon). This is the primary entry point for receipt scanning.
- ADD: Receipt attachment indicator on transactions that have a linked receipt (small receipt icon next to the amount). Clickable to view the receipt detail.
- ADD: "Has Receipt" as a filter option (show only transactions with/without receipts)
- ADD: When a receipt is scanned and matched, the transaction row expands to show line items inline.
- MODIFY: Search should also search receipt items (e.g., searching "milk" finds transactions where milk was a line item even if the merchant is "Walmart")

**Final feature list for this screen:**
- Full transaction list with sort, filter, search
- "Scan Receipt" button in toolbar
- Receipt indicator on linked transactions
- "Has Receipt" filter
- Line item expansion on receipt-linked transactions
- AI confidence badges, bulk editing

---

## SCREEN 8: BUDGETS
**Route:** `/budgets` | **Gate:** v0.6.0 | **Status:** MODIFY

**Current spec:**
- Monthly budget overview
- Category spending limits with progress bars
- Total budgeted vs total spent
- "Add Budget Category"
- Overspend alerts
- Static CRUD (no AI at MVP)

**Research changes:**
- ADD: "Receipts this month" summary at the top showing how many receipts contributed to the budget data
- ADD: When receipt scanning is active, budget categories auto-populate spending from line items (e.g., a Walmart receipt splits into Groceries, Household, and Personal Care based on item categories)
- ADD: "Shared Budget" indicator for budgets visible to family members
- KEEP: Static CRUD at MVP. AI-enhanced budgets deferred to v6.0 per DEC-005.

---

## SCREEN 9: BUDGET CATEGORY DETAIL
**Route:** `/budgets/:id` | **Gate:** v0.6.0 | **Status:** MINOR MODIFY

**Current spec:**
- All transactions in category for selected period
- Spending trend chart
- Edit limit, delete category

**Research changes:**
- ADD: If receipt data exists, show item-level breakdown within the category (e.g., under "Groceries" show top items by spend: Milk $24, Chicken $18, Bread $12...)
- This is where receipt intelligence starts becoming visible to the user.

---

## SCREEN 10: GOALS
**Route:** `/goals` | **Gate:** v0.6.0 | **Status:** KEEP AS-IS

**Current spec:**
- Goal list with name, target, progress, projected completion
- Goal types: savings, debt payoff, purchase target
- Progress bars with celebration animation

**Research changes:**
- No changes. Goals are solid as specified. Family members with Full Access can see and contribute to shared goals.

---

## SCREEN 11: GOAL DETAIL
**Route:** `/goals/:id` | **Gate:** v0.6.0 | **Status:** KEEP AS-IS

**Current spec:**
- Contribution history chart
- Linked account
- Edit target, deadline
- Milestone markers

**Research changes:** None needed.

---

## SCREEN 12: @ORACLE CHAT
**Route:** `/chat` (mobile) + sidebar panel (desktop) | **Gate:** v0.5.0 | **Status:** MODIFY

**Current spec:**
- Conversational AI interface
- Natural language financial queries
- Suggested questions on empty state (2x2 grid)
- Persistent conversation history
- 10 queries/month Free, unlimited Pro
- Semantic search via Voyage AI embeddings

**Research changes:**
- ADD: "Scan a receipt" as a suggested action card alongside question suggestions
- ADD: Purchase intelligence queries after v1.5.0:
  - "Where is [product] cheapest?"
  - "How much have I spent on [product] this year?"
  - "Compare prices at [Store A] vs [Store B]"
  - "Show me my grocery spending trend by store"
- ADD: @ORACLE can reference receipt line items in answers (e.g., "Your Costco trip on March 5 included 3 items over $20: ribeye steak ($28), olive oil ($22), and vitamins ($24)")
- ADD: Family context. @ORACLE knows which family member scanned which receipt and can answer "How much has [family member] spent on groceries this month?"
- KEEP: Everything else. The @ORACLE spec is the strongest differentiator.

---

## SCREEN 13: REPORTS & ANALYTICS
**Route:** `/reports` | **Gate:** v2.0.0 "Horizon" | **Status:** MODIFY

**Current spec:**
- Spending reports by category, merchant, time period
- Income vs expense charts
- Cash flow visualization
- CSV/PDF export
- Weekly/monthly digest summaries
- Year-over-year comparisons

**Research changes:**
- ADD: "Purchase Reports" tab alongside Spending/Income/Cash Flow:
  - Top products by spend
  - Price changes over time for tracked products
  - Store comparison report (avg basket size, frequency, total spend per store)
  - Category breakdown from receipt line items (produce vs. meat vs. snacks)
- ADD: "Family Activity" report showing spending by family member (if family is set up)
- ADD: Shareable report links (read-only, expires in 7 days) for sharing with financial advisors

---

## SCREEN 14: INVESTMENTS DASHBOARD
**Route:** `/investments` | **Gate:** v3.0.0 "Compass" | **Status:** KEEP AS-IS

**Current spec:**
- Portfolio overview across investment accounts
- Holdings list with performance
- Asset allocation donut chart
- Top movers
- Tracking only (no trading)

**Research changes:** No changes. Investments tracking matches Monarch's approach. Defer to v3.0.0 as planned.

---

## SCREEN 15: NET WORTH TRACKER
**Route:** `/net-worth` | **Gate:** v3.0.0 "Compass" | **Status:** KEEP AS-IS

**Current spec:**
- Assets minus liabilities over time
- Net worth line chart
- Breakdown by account type
- Manual entry for real estate, vehicles, other assets

**Research changes:** No changes. Matches competitor patterns.

---

## SCREEN 16: ALERTS & NOTIFICATIONS
**Route:** `/alerts` | **Gate:** v2.0.0 "Horizon" | **Status:** MODIFY

**Current spec:**
- Central notification hub
- Bill due reminders, budget overspend, unusual transactions

**Research changes:**
- ADD: Price alert notifications from purchase intelligence:
  - "Eggs at Whole Foods are $2.50 more than Trader Joe's"
  - "Your average grocery basket at [store] increased 15% this month"
  - "Price drop: [product] is now $X at [store] (was $Y)"
- ADD: Family activity notifications:
  - "[Family member] scanned a receipt from [store]"
  - "[Family member] exceeded the [category] budget"
- ADD: Configurable notification preferences per type (push, email, in-app only)

---

## SCREEN 17: SETTINGS HUB
**Route:** `/settings/*` | **Gate:** v0.3.0 | **Status:** MODIFY (add Family sub-page)

**Current spec:** Settings sidebar with Profile, Security, Preferences, Notifications sub-pages.

**Research changes:**
- ADD: Family sub-page (17e below)
- ADD: Data & Privacy sub-page (17g below)
- Reorder sidebar: Profile, Family, Security, Preferences, Notifications, Connected Apps, Data & Privacy

---

## SCREEN 17a: PROFILE
**Route:** `/settings/profile` | **Gate:** v0.3.0 | **Status:** KEEP AS-IS

Display name, email, avatar, timezone. No changes needed.

---

## SCREEN 17b: SECURITY
**Route:** `/settings/security` | **Gate:** v0.3.0 | **Status:** KEEP AS-IS

Password management, OAuth connections, 2FA at v4.0.0+, active sessions.

---

## SCREEN 17c: PREFERENCES
**Route:** `/settings/preferences` | **Gate:** v0.3.0 | **Status:** KEEP AS-IS

Theme, currency, number format, date format, default dashboard period.

---

## SCREEN 17d: NOTIFICATIONS
**Route:** `/settings/notifications` | **Gate:** v2.0.0 | **Status:** MODIFY

- ADD toggles for: price alerts, family activity alerts, receipt scan confirmations
- KEEP existing toggles for: bill reminders, budget overspend, unusual transactions, @ORACLE insights, weekly digest

---

## SCREEN 17e: FAMILY (NEW)
**Route:** `/settings/family` | **Gate:** v2.0.0 "Horizon" | **Status:** NEW SCREEN

**Purpose:** Household account management for up to 3 people total (primary + 2 invited).

**Screen contents:**
- Header: "Family" with member count ("2 of 3 members")
- Primary account holder card (you): name, email, role "Owner", cannot be removed
- Invited members list:
  - Each card shows: name, email, role (Full Access / View Only), status (active / pending invite)
  - "Edit Permissions" button per member -> opens modal:
    - Permission level toggle: Full Access / View Only
    - Data sharing checkboxes: select which accounts, budgets, and goals this member can see
    - "Save" / "Cancel"
  - "Remove Member" with confirmation dialog
- "Invite Family Member" button (disabled if 2 members already exist):
  - Email input field
  - Permission level selector (Full Access / View Only)
  - Data sharing checkboxes (which accounts/budgets/goals to share)
  - "Send Invite" sends email with registration link
- Pending invites section: shows sent invites with "Resend" and "Cancel Invite" options
- Info note: "Family members can scan receipts and contribute to shared purchase data regardless of permission level."

**Backend:**
- `family_members` table: id, primary_user_id, member_user_id, permission_level (full/view_only), status (pending/active), invite_token, invite_email, shared_accounts (jsonb array of account IDs), shared_budgets (jsonb array), shared_goals (jsonb array), created_at
- Supabase RLS policies filter data based on shared_accounts/budgets/goals per family member
- Invite email sent via Supabase Edge Function or SendGrid

**AI:** None on this page.

---

## SCREEN 17f: CONNECTED APPS
**Route:** `/settings/connected-apps` | **Gate:** v3.0.0 | **Status:** NEW SCREEN

Manage Plaid bank connections, re-authenticate expired connections, future third-party integrations. Simple list of connected services with status and "Reconnect" / "Disconnect" actions.

---

## SCREEN 17g: DATA & PRIVACY
**Route:** `/settings/privacy` | **Gate:** v1.0.0 | **Status:** NEW SCREEN

- Export all data (CSV or JSON download)
- Delete account (with confirmation and 30-day grace period)
- Data retention information
- Privacy policy link
- "What data does Forge Finance collect?" expandable FAQ

---

## SCREEN 18: SUBSCRIPTION & BILLING
**Route:** `/settings/billing` | **Gate:** v5.0.0 "Apex" | **Status:** KEEP AS-IS

Stripe checkout, plan management, payment method, billing history, cancel. No changes needed.

---

## SCREEN 19: RECEIPT SCANNER (NEW)
**Route:** `/receipts/scan` | **Gate:** v1.5.0 "Harvest" | **Status:** NEW SCREEN

**Purpose:** Scan a physical or digital receipt, extract line items, and populate the product price database.

**Screen contents:**
- Camera capture view (mobile) or file upload area (desktop)
  - "Take Photo" button activates device camera
  - "Upload Image" button for gallery/file picker
  - Drag-and-drop zone on desktop
- Processing state: receipt image with scanning animation overlay, "Extracting data..." message
- Review screen (after OCR completes):
  - Receipt image thumbnail (tappable to zoom)
  - Extracted fields (all editable):
    - Merchant name (text input, auto-suggested from history)
    - Date (date picker, pre-filled)
    - Subtotal, Tax, Tip, Total (number inputs, pre-filled)
    - Payment method (dropdown: cash/credit/debit/other)
  - Line items table (editable):
    - Each row: product name, quantity, unit price, total, category dropdown
    - "Add Item" button for missed items
    - "Remove" button per row
    - Swipe-to-delete on mobile
  - "Match to Transaction" section:
    - Shows Plaid transactions from same date +/- 2 days matching the total amount
    - User taps to link, or "No match / Skip"
  - "Confirm & Save" button (primary)
  - "Discard" button (secondary)
- Success state: "Receipt saved! 12 items added to your purchase database."

**Backend:**
- POST `/api/receipts/scan` accepts image, returns job ID
- OCR processing: PaddleOCR (free tier) or Mindee/Veryfi (Pro tier)
- POST `/api/receipts/parse` sends raw OCR to Claude Haiku for structured JSON extraction
- POST `/api/receipts/confirm` saves receipt, receipt_items, product_prices
- GET `/api/transactions/match?date=X&amount=Y` suggests matching Plaid transactions

**AI:**
- Claude Haiku parses raw OCR text into structured item JSON
- Claude Haiku normalizes product names ("2% MLK GL" -> "Milk, 2%, 1 Gallon")
- Category assignment per line item (produce, dairy, meat, household, etc.)

---

## SCREEN 20: RECEIPT HISTORY (NEW)
**Route:** `/receipts` | **Gate:** v1.5.0 "Harvest" | **Status:** NEW SCREEN

**Purpose:** Browse and search all scanned receipts.

**Screen contents:**
- Search bar: search by merchant name, product name, date range
- Filter pills: All, This Week, This Month, By Store
- Receipt list (card layout, most recent first):
  - Each card: receipt image thumbnail, merchant name, date, total amount, item count, linked transaction indicator
  - Tap to expand: shows full line item list with prices
  - "View Full Image" opens receipt photo
  - "Edit" re-opens the review screen
  - "Delete" with confirmation
- Sort options: date (newest/oldest), amount (highest/lowest), store (A-Z)
- Empty state: "No receipts yet. Scan your first receipt to start tracking prices!" with CTA button

**Backend:**
- GET `/api/receipts?page=1&limit=20&search=X&merchant=Y&from=Z&to=W`
- Supabase RLS ensures users only see their own receipts (plus family member receipts if shared)

---

## SCREEN 21: PURCHASE INTELLIGENCE (NEW)
**Route:** `/purchases` | **Gate:** v2.0.0 "Horizon" | **Status:** NEW SCREEN

**Purpose:** The AI-powered feature no competitor has. Searchable product price database with store comparisons and trend analysis.

**Screen contents:**
- Search bar (prominent, top of page): "Search any product..."
  - Autocomplete from product_prices table (product names the user has purchased)
  - Results show: product name, last price, store, date
- "Top Insights" section (AI-generated cards):
  - "Your most expensive store for groceries is [Store A]" with comparison
  - "Prices increased on 5 items this month" with list
  - "[Product] is cheapest at [Store B]" for frequently purchased items
- "Tracked Products" grid (products purchased 3+ times):
  - Each card: product name, average price, price range (min-max), number of purchases, price trend arrow (up/down/stable)
  - Tap to see: price history chart across stores, with each store as a different colored line
- "Store Comparison" section:
  - Bar chart: average basket cost per store
  - Table: stores ranked by total spend, visit frequency, avg items per visit
- "Category Breakdown" from receipt line items:
  - Donut chart: produce vs meat vs dairy vs snacks vs household vs personal care
  - Each segment tappable to see items in that category

**Backend:**
- GET `/api/purchases/insights` returns AI-generated insight cards
- GET `/api/purchases/products?search=X` searches product_prices
- GET `/api/purchases/product/:name/history` returns price history across stores
- GET `/api/purchases/stores/comparison` returns store comparison data
- All queries aggregate from product_prices table

**AI:**
- @ORACLE generates insight cards weekly (cached, not real-time)
- Price trend detection: compares rolling 30-day avg vs prior 30-day avg
- Store ranking algorithm: weighted by frequency, recency, and total spend

---

## GLOBAL COMPONENTS (Updates from Research)

### Navigation Sidebar (Desktop)
**MODIFY:** Add "Receipts" nav item (receipt/scanner icon) between Transactions and Budgets. Shows at v1.5.0. Before that, greyed out with "Coming Soon" tooltip.

Add "Purchases" nav item (lightbulb/trending icon) between Reports and Investments. Shows at v2.0.0.

### Mobile Bottom Tab Bar
**MODIFY:** 5 tabs remain: Dashboard, Accounts, Chat, Budgets, Settings. The FAB (Floating Action Button) expands to show:
- "Add Transaction" (manual entry)
- "Scan Receipt" (camera) <- NEW
- "Ask @ORACLE" (chat)

### Period Selector
**KEEP AS-IS:** 1D, 1W, 1M, 3M, 6M, 1Y, ALL. No changes.

### Notification Toast System
**KEEP AS-IS:** Success (green), error (red), warning (amber), info (blue). No changes.

---

## GATE SUMMARY: WHAT SHIPS WHEN

| Gate | Version | Codename | Screens | New from Research |
|---|---|---|---|---|
| Foundation | v0.0.0 | - | None (files only) | - |
| Scaffold | v0.1.0 | - | None (scaffold only) | - |
| Data Layer | v0.2.0 | - | None (schema only) | receipts, receipt_items, product_prices tables created |
| Auth | v0.3.0 | - | Auth, Settings (Profile, Security, Preferences) | Family invite token handling in auth flow |
| Plaid + @SYNC | v0.4.0 | - | Onboarding, Accounts | 4-step onboarding with starter budget |
| Dashboard + @ORACLE | v0.5.0 | - | Dashboard, Account Detail, Transactions, @ORACLE Chat | "Scan Receipt" button (greyed out), receipt indicator on transactions |
| Budgets + Goals | v0.6.0 | - | Budgets, Budget Detail, Goals, Goal Detail | Shared budget indicator |
| MVP Launch | v1.0.0 | Genesis | Landing Page, Data & Privacy | Receipt scanning mentioned in marketing, annual pricing |
| Receipt Intelligence | v1.5.0 | Harvest (NEW) | Receipt Scanner, Receipt History | Full OCR pipeline, product database, receipt-to-transaction matching |
| Analytics + Social | v2.0.0 | Horizon | Reports, Alerts, Purchase Intelligence, Family Settings, Notifications Settings | Purchase reports, price alerts, family management, store comparisons |
| Investments | v3.0.0 | Compass | Investments, Net Worth, Connected Apps | - |
| Performance | v4.0.0 | Forge | (optimization, no new screens) | - |
| Public Launch | v5.0.0 | Apex | Subscription & Billing | Pro receipt scanning via Mindee/Veryfi, digital receipt import |

---

# END OF PAGE-BY-PAGE WALKTHROUGH
# Ready for spec sheet integration
