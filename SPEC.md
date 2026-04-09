# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.1.0 — Scaffold

**Purpose:** Project structure, design tokens, component foundations
**Est:** 8 hrs

---

## DELIVERABLES

- [x] Next.js App Router structure (route groups, layouts)
- [x] Tailwind CSS configured with all design tokens
- [x] Global layout: NavigationSidebar (desktop) + MobileBottomTabBar
- [x] All CSS custom properties from DESIGN_SYSTEM.md
- [x] JetBrains Mono configured for financial numbers
- [x] Inter configured for UI text
- [x] SkeletonScreen loading components
- [x] Toast notification system
- [x] ErrorState components
- [x] PeriodSelector global component
- [x] MetricCard component
- [x] Vitest + React Testing Library setup

---

## SCREENS

None (infrastructure only)

---

## TESTS

0 (Vitest configured, no test files yet)

---

## ACCEPTANCE CRITERIA

1. [x] NavigationSidebar renders with all nav items (version-gated items grayed)
2. [x] MobileBottomTabBar renders at <768px, sidebar hides
3. [x] Toast system shows all 4 types (success, error, warning, info)
4. [x] SkeletonScreen renders metric-card, table-row, full-page, chart variants
5. [x] ErrorState renders full-page and inline variants
6. [x] PeriodSelector renders all 7 periods, highlights active
7. [x] MetricCard renders with JetBrains Mono, gain/loss deltas
8. [x] All components match FRONTEND_SPEC.md exactly
9. [x] Vitest runs (even if 0 tests)
