# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.6.0 — Budgets + Goals

**Purpose:** Budget tracking + savings goals with progress visualization
**Est:** 14 hrs | Calibrated: 1.5 hrs AI-assisted

---

## DELIVERABLES

- [ ] Screen 8: Budgets — /budgets (health ring, category progress bars, create budget)
- [ ] Screen 9: Budget Detail — /budgets/:id (spending trend chart, filtered transactions)
- [ ] Screen 10: Goals — /goals (goal cards grid, circular progress, celebration modal, create goal)
- [ ] Screen 11: Goal Detail — /goals/:id (progress header, contribution chart, actions)
- [ ] Budget CRUD API: GET/POST /api/budgets, GET/PATCH/DELETE /api/budgets/:id
- [ ] Goal CRUD API: GET/POST /api/goals, GET/PATCH/DELETE /api/goals/:id
- [ ] Budget threshold notifications (70%, 90%, 100%)
- [ ] Goal milestone triggers (25%, 50%, 75%, 100%)
- [ ] Tests: 119 cumulative (35 new)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 8 | Budgets | /budgets | Health ring, category progress, create budget |
| 9 | Budget Detail | /budgets/:id | Spending trend chart, filtered transactions |
| 10 | Goals | /goals | Goal cards grid, circular progress, celebration |
| 11 | Goal Detail | /goals/:id | Progress header, contribution chart, actions |

---

## ACCEPTANCE CRITERIA

1. Budget health ring (RadialBarChart) shows overall on-track percentage
2. Budget category rows show progress bars with alert threshold colors (0-70% green, 70-90% amber, 90-100% red)
3. Budget amounts use JetBrains Mono ("$X of $Y" format)
4. Budget detail shows spending trend AreaChart and filtered transactions
5. Goal cards display CircularProgressRing (120px) with percentage inside
6. Goal pace indicator shows on-track/behind status with projected date
7. Celebration modal triggers on goal completion with confetti (respects prefers-reduced-motion)
8. Create budget/goal modals with form validation
9. Goal detail shows 180px progress ring and contribution history chart
10. All financial numbers use JetBrains Mono (no exceptions)
