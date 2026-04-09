# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v3.0.0 — "Compass" (Investments + Net Worth)

**Purpose:** Investment portfolio view + net worth tracking
**Est:** 14 hrs | Calibrated: 1.0 hrs AI-assisted

---

## DELIVERABLES

- [x] Screen 14: Investments Dashboard — /investments (holdings table, allocation pie, performance chart)
- [x] Screen 15: Net Worth Tracker — /net-worth (assets vs liabilities, trend chart, account breakdown)
- [x] Investments API: GET /api/investments/holdings, GET /api/investments/performance
- [x] Net Worth API: GET /api/net-worth/summary, GET /api/net-worth/trend
- [x] Navigation sidebar: Investments + Net Worth ungated
- [x] Tests: 177 cumulative (101 backend + 76 frontend)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 14 | Investments Dashboard | /investments | Holdings, allocation, performance |
| 15 | Net Worth Tracker | /net-worth | Assets vs liabilities, trend |

---

## ACCEPTANCE CRITERIA

1. Holdings table shows account-derived investment positions with balances
2. Allocation PieChart shows distribution across account types
3. Performance AreaChart shows portfolio value over time
4. Net worth summary shows total assets, liabilities, and net worth
5. Net worth trend AreaChart shows historical net worth
6. Account breakdown lists all accounts grouped by type (asset/liability)
7. All financial amounts use JetBrains Mono
8. All existing tests continue to pass
