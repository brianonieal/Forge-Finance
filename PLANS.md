# PLANS.md
# Forge Finance | Active Task Plan
# Blueprint v10

---

## CURRENT GATE: v5.0.0 — "Apex" (Stripe Billing + Production Launch) ✓

### All Tasks Complete

---

## NEXT GATE: v5.1.0 (suggested)

- [ ] Annual billing toggle ($90/year, save 17%) — deferred from v5.0.0
- [ ] Update PlanCard with monthly/annual toggle
- [ ] Add second STRIPE_PRICE_ID_PRO_ANNUAL env var
- [ ] Stripe checkout session accepts price_id selection
- [ ] Tests for both billing periods

---

## COMPLETED GATES

### v5.0.0 — Apex (Stripe Billing + Production Launch) ✓
Completed 2026-04-16. Stripe Checkout + Customer Portal + webhook (signature + idempotency), Screen 18 (/settings/billing) with 4 components, Alembic 002, env template audit. 264 tests (147 backend + 117 frontend). Annual toggle deferred to v5.1.0.

### v4.0.0 — Forge (Performance + Accessibility + Beta) ✓
Completed 2026-04-09. 2FA TOTP flow, skip-nav, focus-visible, beta access gate, 218 tests.

### v3.0.0 — Compass (Investments + Net Worth) ✓
Completed 2026-04-09. Investments dashboard, net worth tracker, 2 API routers, 177 tests.

### v2.0.0 — Horizon (Reports + Alerts) ✓
Completed 2026-04-09. Reports, alerts, notification feed, 154 tests.

### v1.0.0 — Genesis (Launch) ✓
Completed 2026-04-09. Landing page with hero, features, pricing, waitlist. 131 tests.

### v0.6.0 — Budgets + Goals ✓
Completed 2026-04-09. Budget CRUD, Goals CRUD, 4 screens, 124 tests.

### v0.5.0 — Dashboard + @ORACLE ✓
Completed 2026-04-09. Dashboard, transactions, @ORACLE chat, 84 tests.

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
