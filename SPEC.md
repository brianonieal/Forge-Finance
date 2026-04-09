# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.5.0 — Dashboard + @ORACLE

**Purpose:** Core app experience — dashboard + AI agent
**Est:** 20 hrs | Calibrated: 2.0 hrs AI-assisted

---

## DELIVERABLES

- [ ] Screen 4: Dashboard — /dashboard (metrics, charts, recent transactions, period selector)
- [ ] Screen 6: Account Detail — /accounts/:id (summary, balance chart, transactions)
- [ ] Screen 7: Transactions — /transactions (full table, sort, filter, search, detail drawer)
- [ ] Screen 12: @ORACLE Chat — /chat (mobile), sidebar panel (desktop)
- [ ] @ORACLE agent: Haiku classifier → Sonnet reasoning pipeline
- [ ] Voyage AI semantic search on transactions
- [ ] LiteLLM routing + cost tracking
- [ ] SSE streaming through FastAPI
- [ ] agent_log cost tracking + $0.50/user/month ceiling
- [ ] 10 query/month free tier limit enforcement
- [ ] Dashboard API endpoints (metrics, spending-trend, category-breakdown)
- [ ] Transaction API endpoints (list, detail, recategorize)
- [ ] Tests: 89 cumulative (37 new)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 4 | Dashboard | /dashboard | Metrics, charts, @ORACLE sidebar |
| 6 | Account Detail | /accounts/:id | Balance history, filtered transactions |
| 7 | Transactions | /transactions | Full table with sort/filter/search |
| 12 | @ORACLE Chat | /chat, sidebar | SSE streaming, conversation history |

---

## ACCEPTANCE CRITERIA

1. Dashboard shows net worth, daily P&L, budget health, top spend metrics
2. Spending trend chart renders with period selector integration
3. Category breakdown pie chart with dollar amounts in JetBrains Mono
4. Recent transactions list shows 5 items with merchant, category, amount
5. Account detail shows balance history chart and filtered transactions
6. Transaction table supports sort by date/amount, filter by category, search
7. @ORACLE responds to natural language queries via SSE streaming
8. Conversation history persists across sessions
9. Free tier enforces 10 query/month limit with upgrade prompt
10. All financial numbers use JetBrains Mono (no exceptions)
