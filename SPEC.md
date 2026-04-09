# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v1.0.0 — "Genesis" (Launch)

**Purpose:** Public MVP launch with landing page and waitlist
**Est:** 10 hrs | Calibrated: 1.0 hrs AI-assisted

---

## DELIVERABLES

- [ ] Screen 1: Landing Page — / (hero, features grid, pricing, waitlist signup)
- [ ] Full QA pass across all screens
- [ ] All 124+ tests passing
- [ ] Handoff documentation
- [ ] Tests: 124+ cumulative (maintain passing)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 1 | Landing Page | / | Hero, features, pricing, waitlist |

---

## ACCEPTANCE CRITERIA

1. Hero section: "Your finances, explained by AI." headline, waitlist CTA
2. Features grid: 3 cards (Conversational AI, Real-Time Sync, Smart Budgets & Goals)
3. Pricing section: Free vs Pro tier comparison
4. Waitlist signup form with email input and success state
5. Landing page is pre-auth (no login required)
6. Root / route shows landing page (not redirect to /dashboard)
7. All financial amounts use JetBrains Mono
8. All existing tests continue to pass
