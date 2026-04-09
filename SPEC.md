# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.3.0 — Auth

**Purpose:** Full authentication flow
**Est:** 10 hrs

---

## DELIVERABLES

- [x] Supabase Auth client setup (frontend + backend)
- [x] Screen 2: Auth — /login, /register, /reset-password
- [x] Screen 17: Settings — /settings/* (5 sub-pages)
- [x] Protected route wrapper (ProtectedRoute component)
- [x] useAuthStore (Zustand)
- [x] Auth middleware on all protected FastAPI endpoints
- [x] Session management (JWT via Supabase)
- [x] Settings API endpoints (7 endpoints)
- [x] Tests: 36 passing (target 27 — exceeded)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 2 | Auth | /login, /register, /reset-password | Google OAuth + Magic Link |
| 17 | Settings | /settings/* | 5 sub-pages |

---

## ACCEPTANCE CRITERIA

1. Login with Google OAuth works (redirects to Supabase)
2. Magic link email flow works
3. Protected routes redirect to /login when unauthenticated
4. Settings page renders all 5 sub-pages
5. Auth middleware rejects unauthenticated API requests
6. useAuthStore tracks user session state
7. All components match FRONTEND_SPEC.md
