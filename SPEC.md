# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v1.0.0 — "Genesis" (Production Deploy + QA)

**Purpose:** Production deploy, QA pass, launch readiness
**Est:** 10 hrs | Calibrated: 1.0 hrs AI-assisted

---

## DELIVERABLES

- [x] Landing page QA pass
- [ ] Production deploy: Vercel (frontend) + Render (backend) — pending env vars
- [x] Sentry error tracking configured (placeholder DSNs)
- [x] render.yaml created
- [ ] All environment variables set in Vercel and Render — listed, manual setup pending
- [x] NEXT_PUBLIC_API_URL updated to Render placeholder
- [x] Full QA pass across all screens (local)

---

## SCREENS

No new screens. QA + deploy for all existing screens.

---

## ACCEPTANCE CRITERIA

1. Landing page renders correctly on production Vercel URL
2. Backend health endpoint returns 200 on production Render URL
3. Sentry captures errors in both frontend and backend
4. NEXT_PUBLIC_API_URL points to live Render backend
5. All environment variables configured in Vercel dashboard
6. All environment variables configured in Render dashboard
7. Full QA pass: all screens load, no console errors, no broken layouts
8. All existing tests continue to pass
