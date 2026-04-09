# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v2.0.0 — "Horizon" (Reports + Alerts)

**Purpose:** Reports & analytics + alerts & notifications
**Est:** 16 hrs | Calibrated: 1.0 hrs AI-assisted

---

## DELIVERABLES

- [ ] Screen 13: Reports & Analytics — /reports (monthly summary, spending by category, income vs expenses)
- [ ] Screen 16: Alerts & Notifications — /alerts (notification feed, filter chips, mark read, dismiss)
- [ ] Reports API: GET /api/reports/monthly-summary, /api/reports/category-trends
- [ ] Alerts API: GET /api/alerts, PATCH /api/alerts/:id/read, POST /api/alerts/:id/dismiss, POST /api/alerts/mark-all-read
- [ ] Bell icon with unread count in navigation
- [ ] Tests: 149+ cumulative

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 13 | Reports & Analytics | /reports | Monthly summary, category trends |
| 16 | Alerts & Notifications | /alerts | Notification feed with filters |

---

## ACCEPTANCE CRITERIA

1. Reports page shows monthly income vs expenses comparison
2. Category spending trends with BarChart visualization
3. Alerts feed shows chronological notifications newest-first
4. Filter chips: All, AI Insights, Budget Alerts, Goals, Sync Status, System
5. Mark as read (individual + all), dismiss notifications
6. Unread indicator (blue dot) on unread notifications
7. Empty state: "All caught up!" message
8. All financial amounts use JetBrains Mono
