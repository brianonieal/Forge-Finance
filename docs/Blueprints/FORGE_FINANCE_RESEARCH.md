# FORGE FINANCE RESEARCH
# Competitive Intelligence + Receipt Scanning + Open-Source AI Stack
# Researched: April 8, 2026
# Author: Brian Onieal | Freelance AI Systems Engineer

---

## EXECUTIVE SUMMARY

The personal finance app market in 2026 is dominated by 5 paid apps (Monarch Money, YNAB, Copilot, Simplifi, EveryDollar) all priced between $95-$109/year. The massive gap: **no app combines Plaid bank sync + deep receipt line-item scanning + AI purchase intelligence in one product**. Monarch just added receipt scanning but only splits transactions by category. YNAB has zero receipt support. Grocery-specific trackers (GroceryTracker Pro, Finny) do line-item extraction but have no bank sync, no budgeting, no investment tracking. Forge Finance can own this intersection. The open-source AI stack (PaddleOCR + Qwen3-Embedding + Ollama) can deliver this at or near the $0.50/user/month ceiling.

---

## SECTION 1: TOP 5 HOUSEHOLD BUDGETING APPS

### 1. MONARCH MONEY
**Price:** $14.99/month or $99.99/year
**Founded by:** Former Mint product managers (after Mint shutdown 2024)
**Platform:** Web, iOS, Android

**Core Features:**
- Bank sync via Plaid (checking, savings, credit cards, investments, Apple Card)
- Budget tracking (category-based, not zero-based)
- Net worth tracking across all accounts
- Investment portfolio tracking (stocks, ETFs, crypto, 401k)
- Subscription/bill detection and reminders
- Cash flow forecasting
- Financial goal setting
- Household collaboration (shared dashboards, "yours/mine/ours" views)
- Custom reports and analytics
- AI assistant (natural language queries about finances)
- Receipt scanning (NEW 2025): extracts merchant, amount, date, tax, tip, line items
- Browser extension for Amazon/Target order matching and recategorization

**What users love:** Complete financial picture in one place, household collaboration, clean UI
**What users hate:** More complex setup than competitors, mobile app editing is clunky, no zero-based budgeting methodology, receipt scanning is new and limited
**AI usage:** Auto-categorization, AI assistant for spending questions, receipt parsing, weekly recap summaries

**Forge Finance comparison:** Monarch is the closest direct competitor. They have broader feature coverage (investments, net worth) but their AI is shallow (no conversational agent like @ORACLE, no semantic search, no purchase intelligence). Receipt scanning exists but does NOT build a product price database or do cross-store comparisons.

---

### 2. YNAB (You Need A Budget)
**Price:** $14.99/month or $109/year (34-day free trial, free for college students)
**Platform:** Web, iOS, Android

**Core Features:**
- Zero-based budgeting methodology ("give every dollar a job")
- Bank sync via Plaid
- Manual transaction entry (encouraged as primary input)
- Credit card debt payoff tools
- Loan payoff simulator
- YNAB Together (share with up to 5 people: partners, parents, caregivers)
- Goal tracking
- Age of Money metric (how long dollars sit before being spent)
- Workshops, community, paid coach certification program

**What users love:** The methodology changes behavior, massive community support, forces intentionality
**What users hate:** Steep learning curve, $109/year is expensive for budgeting-only, NO receipt scanning, NO investment tracking, NO net worth tracking, limited international bank sync
**AI usage:** Minimal. Basic auto-categorization. No AI assistant, no receipt parsing, no insights.

**Forge Finance comparison:** YNAB owns the "behavioral change" category. Forge Finance should NOT try to replicate their zero-based methodology. Instead, Forge Finance wins on AI intelligence, receipt scanning, and the breadth of financial picture (investments, net worth, purchase intelligence). YNAB users who want to see their FULL financial picture are Forge Finance's target converts.

---

### 3. COPILOT MONEY
**Price:** $13/month or $95/year (60-day free trial)
**Platform:** iOS, macOS, Web (recently launched). NO Android.

**Core Features:**
- Bank sync (checking, savings, credit cards, investments)
- AI-powered auto-categorization
- Spending summaries and dashboards
- Investment performance tracking
- Subscription tracking
- Net worth tracking
- Custom spending categories and rules
- Beautiful iOS-native design (Apple Design Award caliber)
- Cryptocurrency support

**What users love:** Best-looking budgeting app in the market, AI categorization is accurate, iOS experience is premium
**What users hate:** Apple-only (no Android = dealbreaker for households), web version is new and incomplete, no receipt scanning, limited collaboration features
**AI usage:** "Intelligence" platform for smart categorization. Promised features: natural language search, chat interface, forecasting, benchmarking against other users. Many still in development.

**Forge Finance comparison:** Copilot proves that beautiful design + AI drives adoption. Forge Finance's Bloomberg-inspired dark mode can compete on visual appeal while serving a broader market (cross-platform). Copilot's Apple-only limitation is a major market gap Forge Finance can exploit.

---

### 4. SIMPLIFI (by Quicken)
**Price:** $3.99-$4.99/month or $47.99/year
**Platform:** Web, iOS, Android

**Core Features:**
- Bank sync (Plaid + Finicity)
- Spending watchlists (set alerts for categories approaching limits)
- Customizable spending plan
- Bill tracking and reminders
- Savings goals
- Subscription management
- Financial advisor/spouse sharing
- Refund tracking (unique feature)

**What users love:** Most affordable premium option, straightforward spending plan, good mobile app
**What users hate:** No investment tracking depth, no receipt scanning, miscategorizes some expenses, no Zillow integration for real estate, limited reporting vs Monarch
**AI usage:** Basic auto-categorization only. No AI assistant.

**Forge Finance comparison:** Simplifi is the budget-tier competitor. At $3.99/month it undercuts everyone. Forge Finance's Free tier must offer enough to compete with Simplifi's full paid product. The Pro tier at $9/month must clearly justify the premium with AI features Simplifi can't match.

---

### 5. GOODBUDGET
**Price:** Free (20 envelopes, 2 devices) or Premium at $10/month ($80/year)
**Platform:** Web, iOS, Android

**Core Features:**
- Envelope budgeting system (virtual envelopes for spending categories)
- Manual transaction entry (no auto bank sync on free tier)
- Debt tracking
- Reports and spending history
- Multi-device sync (2 free, unlimited on premium)
- Household budgeting (designed for couples)
- No ads on free tier

**What users love:** Simple envelope methodology, great for couples, usable free tier, no data sharing concerns (no bank connections on free)
**What users hate:** Manual entry required on free tier, dated UI, no AI, no receipt scanning, limited reporting, no investments/net worth
**AI usage:** None.

**Forge Finance comparison:** Goodbudget proves there's demand for NO-bank-sync budgeting (privacy-conscious users). Forge Finance should support both connected (Plaid) and manual-entry modes. Goodbudget's envelope system is conceptually similar to budgets with spending limits. Receipt scanning would be a massive upgrade for manual-entry users who currently type everything by hand.

---

## FEATURE MATRIX: TOP 5 vs FORGE FINANCE

| Feature | Monarch | YNAB | Copilot | Simplifi | Goodbudget | **Forge Finance** |
|---|---|---|---|---|---|---|
| Bank Sync (Plaid) | YES | YES | YES | YES | Paid only | **YES** |
| Zero-Based Budgeting | No | YES | No | No | YES (envelope) | **No (category limits)** |
| Budget Tracking | YES | YES | YES | YES | YES | **YES** |
| Goal Tracking | YES | YES | Limited | YES | No | **YES** |
| Receipt Scanning | YES (new) | No | No | No | No | **YES (deep)** |
| Line-Item Extraction | Limited | No | No | No | No | **YES** |
| Product Price Database | No | No | No | No | No | **YES (unique)** |
| Store Price Comparison | No | No | No | No | No | **YES (unique)** |
| AI Assistant/Chat | YES | No | Promised | No | No | **YES (@ORACLE)** |
| Semantic Search | No | No | No | No | No | **YES (Voyage/Qwen)** |
| Investment Tracking | YES | No | YES | Limited | No | **v3.0.0** |
| Net Worth | YES | No | YES | No | No | **v3.0.0** |
| Subscription Tracking | YES | No | YES | YES | No | **v2.0.0** |
| Household Sharing | YES | YES (5) | Limited | YES | YES | **v2.0.0** |
| Cross-Platform | YES | YES | Apple only | YES | YES | **YES** |
| Free Tier | No | 34-day trial | 60-day trial | No | YES (limited) | **YES** |
| Price (annual) | $99.99 | $109 | $95 | $47.99 | $80 | **$108/yr ($9/mo)** |

---

## SECTION 2: OCR RECEIPT SCANNING RESEARCH

### The Opportunity

Nobody in the personal finance space is building a **product intelligence layer** from receipts. Here's what exists vs what Forge Finance will do:

**What exists (2026):**
- Monarch: Scans receipt, extracts total/merchant/date, splits transaction by category. NO product database.
- GroceryTracker Pro: Scans grocery receipts, extracts line items, tracks by store/category. NO bank sync, NO budgeting.
- Finny: Batch scans up to 5 receipts, privacy-first. NO bank sync, NO intelligence layer.
- SimplyWise: Auto-imports digital receipts from email. Good at matching to transactions. NO price intelligence.
- Expensify: Business expense focused. Overkill for personal budgeting. $5+/user/month.

**What NOBODY does:**
- Build a searchable product price database from scanned receipts
- Answer "Where is [product] cheapest?" across stores the user shops at
- Show price trends for specific products over time
- Proactively alert: "Milk at Store A costs 30% more than Store B where you also shop"
- Combine receipt intelligence WITH bank sync AND conversational AI

### Three Cost Models for OCR

#### MODEL A: $0.50 Ceiling (Open-Source OCR Only)

**Stack:** PaddleOCR (on-device or server) + Claude Vision fallback for complex receipts

| Component | Cost | Notes |
|---|---|---|
| PaddleOCR | $0.00 | Apache 2.0, self-hosted on Render |
| Claude Haiku fallback | ~$0.002/receipt | Only for receipts PaddleOCR can't parse |
| Supabase Storage | Included | Receipt images in existing Supabase bucket |
| **Total per receipt** | **~$0.002** | 250 receipts/month = $0.50 |

**Pros:** Stays within $0.50 ceiling. No third-party API dependency. Data stays on your infrastructure.
**Cons:** PaddleOCR line-item extraction requires custom post-processing. Lower accuracy on faded/crumpled receipts. More development time to build the parsing pipeline. Needs GPU for production speed (Render doesn't offer GPU on free tier).

**Recommended stack:**
- **PaddleOCR PP-OCRv5** for raw text extraction (CPU-capable, 94.5% accuracy on clean receipts)
- **Claude Haiku** for structured parsing of the raw OCR text into JSON (merchant, items, prices)
- Self-hosted on existing Render backend

#### MODEL B: Revised Cost Ceiling ($0.75-$1.00/user/month)

**Stack:** Mindee Receipt API (free tier 250 pages/month) + Veryfi for scale

| Component | Cost | Notes |
|---|---|---|
| Mindee Receipt API | $0.00 (250/mo free) | Line items, merchant, tax, total in JSON |
| Mindee beyond free tier | $0.04/page | Pay-per-scan after 250 |
| Veryfi (scale option) | $0.08-$0.12/receipt | SKU-level extraction, best accuracy |
| **Total per receipt** | **$0.00-$0.12** | Avg user: 20-30 receipts/month = $0.80-$3.60 |

**Pros:** Best accuracy out of the box. Line-item extraction built in. Fastest time-to-market. Structured JSON response.
**Cons:** Raises cost ceiling. Third-party dependency. Data leaves your infrastructure (though Mindee is SOC2 certified).

**Recommended stack:**
- **Mindee** for MVP (free 250 pages covers ~8-12 users at 20-30 receipts each)
- **Veryfi** when volume exceeds Mindee free tier
- Claude Haiku for product name normalization ("2% MILK GAL" -> "Milk, 2%, 1 gallon")

#### MODEL C: Pro-Only Feature ($9/month tier absorbs cost)

**Stack:** Best-of-breed paid APIs, cost absorbed by Pro subscription

| Component | Cost | Notes |
|---|---|---|
| Veryfi OCR | $0.10/receipt | Best-in-class line-item extraction |
| Claude Sonnet (parsing) | ~$0.005/receipt | Normalization + intelligence |
| Storage | Included | Existing Supabase |
| **Total per receipt** | **$0.105** | 30 receipts/month = $3.15/user |
| **Pro revenue** | **$9.00/month** | Net margin: $5.85/user after OCR + AI costs |

**Pros:** Best user experience. Highest accuracy. Clear monetization path. Free tier stays at $0.50 ceiling (no receipt scanning). Strong conversion incentive ("upgrade to scan receipts").
**Cons:** Free tier users miss the differentiating feature. Limits word-of-mouth from free users.

### MY RECOMMENDATION

**Hybrid approach: Model A for Free tier, Model C for Pro tier.**

- **Free tier:** PaddleOCR (open-source, on-device) with a limit of 5 receipts/month. Proves the concept. Gets users hooked on purchase tracking.
- **Pro tier ($9/month):** Veryfi or Mindee for best accuracy, unlimited scans, full product intelligence layer, proactive price alerts.

This keeps the $0.50 ceiling for free tier while making receipt scanning the killer Pro upgrade.

---

## SECTION 3: OPEN-SOURCE AI ALTERNATIVES

### Current Stack (from spec) vs Open-Source Alternatives

| Layer | Current (Spec) | Open-Source Alternative | Savings | Trade-off |
|---|---|---|---|---|
| **Primary LLM** | Claude Sonnet (via LiteLLM) | Qwen3-30B (Apache 2.0) via Ollama | ~$0.15/user/mo | Requires GPU. Deferred to v7.0 per DEC-002. |
| **Fallback LLM** | Claude Haiku | Phi-4 14B via Ollama | ~$0.05/user/mo | Same: requires GPU. Deferred. |
| **Embeddings** | Voyage AI (vector 1024) | Qwen3-Embedding-0.6B (Apache 2.0) | ~$0.03/user/mo | Self-hosted. Competitive accuracy. |
| **OCR** | N/A (not in spec) | PaddleOCR PP-OCRv5 (Apache 2.0) | $0.00 | Needs custom parsing pipeline |
| **Orchestration** | LangGraph | LangGraph | $0.00 | Already open-source |
| **Vector DB** | Supabase pgvector | Supabase pgvector | $0.00 | Already open-source |

### Embedding Model Options (Replace Voyage AI)

| Model | License | Dimensions | MTEB Score | Cost | Self-Hosted? |
|---|---|---|---|---|---|
| **Voyage AI 3.5** (current) | Proprietary | 1024 | High | $0.06/1M tokens | No (API only) |
| **Qwen3-Embedding-0.6B** | Apache 2.0 | 1024 (flexible) | 70.58 (MTEB #1 multilingual) | FREE | Yes |
| **BGE-M3** | MIT | 1024 | 63.0 | FREE | Yes |
| **all-MiniLM-L6-v2** | Apache 2.0 | 384 | ~58 | FREE | Yes |
| **nomic-embed-text** | Apache 2.0 | 768 | ~62 | FREE | Yes (via Ollama) |

**Recommendation:** Keep **Voyage AI for production** (per DEC-008, already locked). It's the best retrieval quality for financial queries and the cost at scale is minimal (~$0.03/user/month for typical usage). The open-source path (Qwen3-Embedding) becomes the v7.0 migration target when local LLM support arrives.

If you want to save immediately: **Qwen3-Embedding-0.6B** matches your current 1024-dimension schema, runs via Ollama on CPU, and is Apache 2.0 licensed. It could replace Voyage AI today with no schema changes. Trade-off is you need to host it (Render free tier may be tight on memory).

### OCR Engine Options (All Open-Source)

| Engine | License | Strengths | Weaknesses | Receipt Line-Items? |
|---|---|---|---|---|
| **PaddleOCR PP-OCRv5** | Apache 2.0 | Best multilingual, layout analysis, table extraction, CPU-capable | Documentation partly Chinese, custom parsing needed | YES (via PP-Structure) |
| **Tesseract 5** | Apache 2.0 | Most mature, 100+ languages, CPU-only | Struggles with complex layouts, no native table extraction | NO (raw text only) |
| **EasyOCR** | Apache 2.0 | Simplest API, good for photos | Slowest, weakest on dense tabular data | NO |
| **Tesseract.js** | Apache 2.0 | Runs in browser (client-side!) | Lower accuracy than server-side Tesseract | NO |
| **Doctr** | Apache 2.0 | Good layout analysis, PyTorch-native | Less mature, smaller community | Partial |

**Recommendation:** **PaddleOCR PP-OCRv5** is the clear winner for receipt scanning. It handles the layout complexity of receipts (columns, varying fonts, table structures) better than Tesseract. Its PP-Structure module provides table extraction which is critical for line items. Apache 2.0 license allows full commercial use.

**The pipeline:**
1. PaddleOCR extracts raw text + bounding boxes + table structure from receipt image
2. Claude Haiku (or local Phi-4 at v7.0) parses the structured text into product JSON
3. Products are normalized, stored in receipt_items and product_prices tables
4. @ORACLE queries the product_prices table for intelligence

### Where Claude Stays Essential (Not Replaceable by Open-Source)

| Capability | Why Claude stays |
|---|---|
| @ORACLE conversational agent | Complex multi-step financial reasoning. Open-source LLMs can't match Sonnet's quality here. This IS the product differentiator. |
| Receipt parsing (structured extraction) | Haiku turns raw OCR text into clean JSON. Could be replaced by local LLM at v7.0, but Haiku is cheap enough ($0.002/receipt) to keep. |
| Product name normalization | "2% MLK GL" to "Milk, 2%, 1 gallon" requires language understanding. Haiku handles this. |
| Proactive insights generation | "You spent 20% more on groceries this month. Here's why:" requires reasoning that's worth paying for. |

---

## SECTION 4: RECEIPT SCANNING SYSTEM ARCHITECTURE

### New Database Tables

**`receipts`**
- id (uuid, PK)
- user_id (FK to users)
- image_url (text, Supabase Storage path)
- raw_ocr_json (jsonb, raw PaddleOCR/Mindee output)
- merchant_name (text)
- merchant_address (text, nullable)
- receipt_date (date)
- subtotal (decimal)
- tax (decimal)
- tip (decimal, nullable)
- total (decimal)
- payment_method (text, nullable: cash/credit/debit)
- transaction_id (FK to transactions, nullable, linked after matching)
- status (enum: pending/processed/failed/needs_review)
- ocr_provider (text: paddleocr/mindee/veryfi/claude_vision)
- created_at (timestamptz)

**`receipt_items`**
- id (uuid, PK)
- receipt_id (FK to receipts)
- raw_text (text, original OCR text for this line)
- product_name (text, normalized by AI)
- product_name_normalized (text, canonical form for matching)
- category (text: produce/meat/dairy/snacks/beverages/household/personal_care/other)
- quantity (decimal, default 1)
- unit_price (decimal)
- total_price (decimal)
- brand (text, nullable)
- upc (text, nullable, for future barcode scanning)
- created_at (timestamptz)

**`product_prices`** (the intelligence layer)
- id (uuid, PK)
- user_id (FK to users)
- product_name_normalized (text, indexed)
- merchant_name (text, indexed)
- price (decimal)
- quantity (decimal)
- unit_price_calculated (decimal, price/quantity for comparison)
- receipt_id (FK to receipts)
- receipt_date (date, indexed)
- created_at (timestamptz)
- UNIQUE constraint on (user_id, product_name_normalized, merchant_name, receipt_date)

### Scanning Flow

```
[User taps "Scan Receipt" on Transactions page or Mobile FAB]
    |
    v
[Camera capture or photo upload]
    |
    v
[Image uploads to Supabase Storage]
    |
    v
[OCR Engine processes image]
  - Free tier: PaddleOCR (self-hosted) or Tesseract.js (client-side)
  - Pro tier: Mindee/Veryfi API
    |
    v
[Claude Haiku parses raw OCR into structured JSON]
  - Merchant name, date, items array
  - Each item: name, quantity, unit_price, total
    |
    v
[Product Normalization]
  - "2% MLK GL" -> "Milk, 2%, 1 Gallon"
  - Haiku normalizes product names for consistent matching
    |
    v
[User Review Screen]
  - Pre-filled receipt data
  - User can edit/correct any field
  - "Match to Transaction" suggests Plaid transactions by date/amount
  - "Confirm" saves everything
    |
    v
[Data Written]
  - receipt -> receipts table
  - items -> receipt_items table
  - prices -> product_prices table
  - Linked to transaction if matched
    |
    v
[@ORACLE Intelligence Available]
  - "Where is Tide cheapest?"
  - "Show my coffee spending by store"
  - "Which store has lowest grocery average?"
  - Proactive: "Eggs at Store A are $2 more than Store B"
```

### UI Entry Points

1. **Transactions page toolbar:** "Scan Receipt" button (camera icon)
2. **Mobile FAB expansion:** "Scan Receipt" option alongside "Manual Entry"
3. **@ORACLE chat:** "Scan a receipt" as a suggested action
4. **Account Detail page:** "Add Receipt" on individual transactions
5. **New "Purchase Intelligence" widget on Dashboard** (v2.0.0+)

### @ORACLE Purchase Intelligence Queries

Once the product_prices table has data, @ORACLE can answer:

**Price comparison:**
- "Where is [product] cheapest?"
- "Compare prices at [Store A] vs [Store B]"
- "Which store has the lowest prices overall for groceries?"

**Trend analysis:**
- "How has the price of [product] changed over the last 6 months?"
- "What's my average weekly grocery spend by store?"
- "Show me price inflation for my most purchased items"

**Smart alerts (proactive, v2.0.0+):**
- "Milk at Whole Foods is $2.50 more than at Trader Joe's where you also shop"
- "Your grocery spending at [store] increased 25% this month"
- "You bought [product] 3 times this month, up from 1 last month"

**Budget integration:**
- "How much of my grocery budget went to snacks vs produce?"
- "If I switched all my grocery shopping from [Store A] to [Store B], how much would I save monthly?"

---

## SECTION 5: RECOMMENDED FEATURES BY GATE

### v0.0.0-v0.6.0 (Current spec, no changes needed)
These gates build the foundation. Receipt scanning does NOT enter until v1.0.0+.

### v1.0.0 "Genesis" (MVP Launch)
**Add to spec:**
- Receipt scanning entry point in Transactions toolbar (UI only, "Coming Soon" state)
- `receipts`, `receipt_items`, `product_prices` tables in schema (created but unused)
- Scanner icon in mobile FAB (greyed out with Pro badge)

### v1.5.0 "Harvest" (NEW GATE: Receipt Intelligence)
**New gate between Genesis and Horizon:**
- PaddleOCR integration on backend
- Camera capture + photo upload on frontend
- User review screen for scanned receipts
- Receipt-to-transaction matching
- Basic product_prices population
- @ORACLE can query product_prices
- 5 scans/month for Free tier, unlimited for Pro

### v2.0.0 "Horizon" (Existing, enhanced)
**Add to spec:**
- Purchase Intelligence dashboard widget
- Price trend charts for tracked products
- Store comparison reports
- Proactive price alerts (via @ORACLE)
- Receipt history view (all scanned receipts with search)
- Household receipt sharing (link receipts to shared budget)
- Weekly digest includes purchase insights

### v3.0.0 "Compass" (Existing, no receipt changes)
Investments and net worth as planned.

### v5.0.0 "Apex" (Existing, enhanced)
**Add to spec:**
- Pro tier receipt scanning via Mindee/Veryfi
- Barcode/UPC scanning for product lookup
- Digital receipt import from email (connect Gmail/Outlook)
- Receipt photo quality enhancement (AI upscaling for faded receipts)

---

## SECTION 6: PRICING COMPARISON AND RECOMMENDATION

### Market Pricing (2026)
| App | Monthly | Annual | Free Tier |
|---|---|---|---|
| Monarch Money | $14.99 | $99.99 | 7-day trial |
| YNAB | $14.99 | $109 | 34-day trial |
| Copilot | $13 | $95 | 60-day trial |
| Simplifi | $4.99 | $47.99 | None |
| Goodbudget Premium | $10 | $80 | YES (limited) |
| **Forge Finance (current plan)** | **$9** | **$108** | **YES** |

### Pricing Recommendation

Current pricing is well-positioned. The $9/month Pro tier is competitive with Monarch ($14.99) and YNAB ($14.99) while offering more (AI + receipt scanning + purchase intelligence). The Free tier with 1 account, 90-day history, 10 @ORACLE queries, and 5 receipt scans/month gives enough value to hook users.

**One change to consider:** Add an annual discount. $9/month or $89/year (save $19). Every competitor does annual discounting. It improves retention and cash flow.

---

## SECTION 7: MARKET GAPS FORGE FINANCE CAN OWN

1. **Purchase Intelligence** (nobody does this): Build a product price database from receipt scans. Let AI answer "where is this cheapest?" and "how have prices changed?"

2. **Conversational Finance** (Monarch's AI is shallow): @ORACLE with RAG-powered semantic search across transaction history is leagues ahead of any competitor's "ask about your spending" feature.

3. **Cross-Platform + Free Tier** (Copilot is Apple-only, Monarch has no free tier): Forge Finance on web + iOS + Android with a real free tier captures the entire market.

4. **Privacy-Friendly Receipt Scanning** (Finny's niche, but they have no budgeting): Open-source OCR on-device for the privacy-conscious crowd, with optional cloud processing for better accuracy on Pro.

5. **Financial Problem Solving for Real Households** (YNAB is methodology, Monarch is tracking): Forge Finance's AI should actually HELP people solve problems: "You're spending $200/month more on groceries than 3 months ago. Here's what changed: [specific items and prices]. Here's how to save: [switch stores for these items]."

---

## SECTION 8: REPOS AND LIBRARIES

### Recommended for Use

| Repo | Stars | License | Use Case |
|---|---|---|---|
| PaddleOCR | 48k+ | Apache 2.0 | Receipt OCR engine |
| Tesseract.js | 35k+ | Apache 2.0 | Client-side OCR fallback |
| LangGraph | 10k+ | MIT | Already in stack, agent orchestration |
| Qwen3-Embedding | New | Apache 2.0 | Future Voyage AI replacement |
| invoice2data | 2k+ | MIT | Receipt template matching patterns |

### Worth Studying

| Repo | Stars | What to Learn |
|---|---|---|
| receipt-parser (GitHub) | 500+ | Receipt parsing regex patterns |
| GroceryTracker Pro (closed) | N/A | UI patterns for item-level display |
| Monarch Money (closed) | N/A | Receipt scanning UX flow |
| Finny (closed) | N/A | Batch receipt scanning UX |

---

## SECTION 9: RED FLAGS (WHAT NOT TO BUILD)

1. **Don't build barcode scanning at MVP.** UPC lookup databases are expensive and add complexity. Defer to v5.0.0.
2. **Don't build digital receipt email import at MVP.** Gmail/Outlook OAuth is a compliance burden. Defer to v5.0.0.
3. **Don't try to compete with YNAB's methodology.** Zero-based budgeting is a religion. Don't convert believers. Attract the unsatisfied.
4. **Don't build investment trading.** Tracking yes, trading no. That's a different regulatory universe.
5. **Don't build bill pay.** Payment processing is a compliance nightmare. Track bills, don't pay them.
6. **Don't overcomplicate the free tier.** 1 account, 90-day history, 10 AI queries, 5 receipt scans. Simple.

---

# END OF RESEARCH
# Next step: Walk through each spec page with feature decisions
