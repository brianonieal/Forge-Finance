# PLANS.md
# Forge Finance | Active Task Plan
# Blueprint v10

---

## CURRENT GATE: v0.5.0 — Dashboard + @ORACLE

### Active Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend: Dashboard API (3 endpoints) | PENDING | metrics, spending-trend, category-breakdown |
| 2 | Backend: Transaction API (3 endpoints) | PENDING | list, detail, recategorize |
| 3 | Backend: @ORACLE agent (classifier + reasoning) | PENDING | Haiku → Sonnet pipeline |
| 4 | Backend: SSE streaming endpoint | PENDING | /api/oracle/query |
| 5 | Backend: Cost tracking + ceiling enforcement | PENDING | agent_log, $0.50/user/mo |
| 6 | Frontend: Screen 4 — Dashboard | PENDING | Metrics, charts, recent txns |
| 7 | Frontend: Screen 6 — Account Detail | PENDING | /accounts/:id |
| 8 | Frontend: Screen 7 — Transactions | PENDING | Table, filters, drawer |
| 9 | Frontend: Screen 12 — @ORACLE Chat | PENDING | SSE, history, sidebar |
| 10 | Frontend: Install Recharts | PENDING | Charts library |
| 11 | Tests: Backend + Frontend | PENDING | Target: 89 cumulative |

---

## COMPLETED GATES

### v0.4.0 — Plaid + @SYNC ✓
Completed 2026-04-09. Plaid Link, @SYNC agent, Voyage AI embeddings, 52 tests.

### v0.3.0 — Auth ✓
Completed 2026-04-09. Supabase Auth, Settings pages, 36 tests.

### v0.2.0 — Data Layer ✓
Completed 2026-04-09. 9 models, Alembic migration, RLS, 29 tests.

### v0.1.0 — Scaffold ✓
Completed 2026-04-09. 8 components, App Router routes, Vitest setup.

### v0.0.0 — Foundation ✓
Completed 2026-04-09. All 22 foundation files, monorepo scaffold, design tokens.
