# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v5.0.0 — "Apex" (Stripe Billing + Production Launch) ✓ COMPLETE

**Purpose:** Public launch with paid Pro tier via Stripe + production Plaid migration
**Est:** 14 hrs raw | Actual: 1.25 hrs (-91%)
**Predecessor:** v4.0.0 Forge — 218 tests passing
**Successor:** v5.1.0 (annual billing toggle, deferred from this gate)
**Closed:** 2026-04-16 — 264 tests passing (147 backend + 117 frontend)

---

## DELIVERABLES

### Screen 18: Subscription & Billing — `/settings/billing`
- [ ] Current plan card (Free vs Pro indicator)
- [ ] Usage metrics with progress bars (queries used / limit)
- [ ] Plan comparison table (Free vs Pro features)
- [ ] [Upgrade to Pro] CTA → Stripe Checkout
- [ ] Payment history table (Pro users only)
- [ ] [Manage Billing] button → Stripe Customer Portal
- [ ] Cancellation flow with retention modal
- [ ] Monthly billing only — $9/mo (annual toggle deferred to v5.1.0)

### Backend Endpoints
- [ ] `POST /api/billing/create-checkout-session` — initiate Stripe Checkout
- [ ] `POST /api/billing/create-portal-session` — open Stripe Customer Portal
- [ ] `GET /api/billing/subscription` — current subscription state
- [ ] `GET /api/billing/invoices` — payment history (Pro users)
- [ ] `POST /api/webhooks/stripe` — webhook handler (signature verification + idempotency)

### Stripe Integration
- [ ] stripe Python SDK installed in apps/api
- [ ] Stripe webhook signature verification middleware
- [ ] Idempotency keys on all webhook event handlers
- [ ] User.plan updated on subscription.created / .updated / .deleted
- [ ] User.stripe_customer_id stored on first checkout
- [ ] Alembic migration 002 adds users.stripe_customer_id column

### Production Plaid Migration
- [ ] PLAID_ENV switched from sandbox to production in Render dashboard
- [ ] Production Plaid credentials provisioned (client_id, secret)
- [ ] Webhook URL updated to production Render URL
- [ ] Smoke test with one real account before declaring gate closed

### Tests (30 new → 248 cumulative)
- [ ] Stripe webhook signature verification (valid + invalid)
- [ ] Webhook idempotency (replay same event yields no duplicate state)
- [ ] subscription.created → user.plan = "pro"
- [ ] subscription.deleted → user.plan = "free"
- [ ] Free tier query limit re-enforced on downgrade
- [ ] Checkout session URL returned for free user
- [ ] Portal session URL returned for pro user
- [ ] Invoices endpoint paginated correctly
- [ ] /settings/billing renders for Free user
- [ ] /settings/billing renders for Pro user
- [ ] Plan comparison table renders both columns
- [ ] Upgrade CTA triggers checkout redirect
- [ ] Cancellation modal triggers portal session

---

## ACCEPTANCE CRITERIA

1. Free user can click [Upgrade to Pro] and reach Stripe Checkout
2. Successful checkout transitions user.plan = "pro" via webhook
3. Pro user can access [Manage Billing] → Stripe Customer Portal
4. Cancellation flows through portal → webhook → user.plan = "free"
5. Free tier query limit (10/mo) re-enforces immediately on downgrade
6. Stripe webhook rejects requests with invalid signatures (HTTP 400)
7. Stripe webhook is idempotent — replay yields no duplicate state changes
8. Production Plaid env var configured in Render dashboard
9. All 248 tests pass (218 existing + 30 new)
10. No console errors on /settings/billing for either Free or Pro user

---

## OUT OF SCOPE (deferred)

- Annual billing toggle ($90/year, save 17%) → v5.1.0
- Team / multi-user plans → future
- Crypto payment methods → future
- Coupon / promo code support → future
