# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.0.0 — Foundation

**Purpose:** Repo, environment, CI/CD, design tokens, project structure
**Est:** 6 hrs

---

## DELIVERABLES

- [x] Git repository initialized
- [x] Monorepo scaffold (Turborepo + pnpm workspaces)
- [x] Next.js 14+ frontend app (apps/web)
- [x] FastAPI backend app (apps/api)
- [x] Design tokens as CSS custom properties in globals.css
- [x] Inter + JetBrains Mono fonts configured
- [x] Tailwind CSS configured with design tokens
- [x] All 22 Blueprint v10 foundation files populated
- [x] CLAUDE.md boot sequence
- [x] GitHub Actions CI/CD pipeline
- [x] Environment variable templates
- [x] Dev server starts (frontend — Next.js build passes)
- [x] Dev server starts (backend — /health returns 200)
- [x] agnix: PASS (all 22 foundation files present and valid)

---

## SCREENS

None (infrastructure only)

---

## TESTS

0 (no tests at this gate)

---

## ACCEPTANCE CRITERIA

1. `pnpm dev` starts frontend on :3000
2. `uvicorn app.main:app` starts backend, /health returns 200
3. All 22 foundation files exist and are populated
4. Design tokens render correctly (Inter for UI, JetBrains Mono for money)
5. GitHub Actions CI passes on push
6. No secrets in code — .env templates only
