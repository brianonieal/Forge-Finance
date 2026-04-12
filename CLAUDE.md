# CLAUDE.md — Boot Sequence
# Forge Finance | Blueprint v10
# Read this file FIRST in every session

---

## IDENTITY

App: Forge Finance
Version: 0.0.0 (Foundation)
Blueprint: v10

---

## QUICK START

```bash
# Frontend
cd apps/web && pnpm dev

# Backend
cd apps/api && .venv/Scripts/activate && uvicorn app.main:app --reload
```

---

## PROJECT STRUCTURE

```
./
├── apps/
│   ├── web/          # Next.js 14+ (App Router, TypeScript, Tailwind)
│   └── api/          # FastAPI (Python 3.11+, SQLAlchemy, Alembic)
├── packages/
│   └── shared-schemas/  # Shared types (future)
├── docs/
│   └── Blueprints/   # Source spec documents
├── .github/
│   └── workflows/    # CI/CD
├── CLAUDE.md         # THIS FILE — boot sequence
├── DECISIONS.md      # Architectural decisions (DEC-001+)
├── CONTRACT.md       # All config values
├── VERSION_ROADMAP.md # Gate structure
├── SPEC.md           # Current gate spec
├── PLANS.md          # Active tasks
├── ERRORS.md         # Known failure modes
├── TESTS.md          # Test registry
├── TIMELOG.md        # Hours and billing
├── COSTS.md          # Cost tracking
├── SECURITY.md       # Security audit log
├── PERFORMANCE.md    # Performance budgets
├── MOCKUPS.md        # Screen approvals
├── CHANGELOG.md      # What shipped
├── RESEARCH.md       # Competitive intel
├── FRONTEND_SPEC.md  # Component spec
├── DESIGN_SYSTEM.md  # Design tokens
├── TECH_STACK.md     # Technology stack
├── PATTERNS.md       # Applied patterns
├── COMPONENT_REGISTRY.md # Built components
├── INFRASTRUCTURE.md # CI/CD and IaC
├── MEMORY_SEMANTIC.md    # Patterns and pre-fills
├── MEMORY_EPISODIC.md    # Session history
└── MEMORY_CORRECTIONS.md # Reflexion entries
```

---

## SACRED RULES

- **C-1:** Version boundaries sacred — current minor only
- **C-2:** Zod schemas (frontend) / Pydantic schemas (backend) are source of truth
- **C-5:** Every change logged in CHANGELOG.md
- **C-8:** No secrets in code, .env only
- **C-10:** No parallel file writes — sequential builds only
- **C-11:** Alembic + SQLAlchemy own all migrations (NEVER Prisma)
- **C-12:** Financial math is deterministic code, never AI output

---

## DESIGN SYSTEM

- Theme: Bloomberg-inspired dark mode
- Font UI: Inter
- Font money: JetBrains Mono (ALL dollar amounts — no exceptions)
- Primary: #2E6DB4 | Accent: #C8A855 | Gain: #00C48C | Loss: #FF4D4D

---

## CURRENT GATE

v0.0.0 Foundation — see SPEC.md for deliverables

---

## SESSION PROTOCOL

1. Read CLAUDE.md (this file)
2. Read MEMORY_SEMANTIC.md, MEMORY_EPISODIC.md, MEMORY_CORRECTIONS.md
3. Read SPEC.md for current gate
4. Read PLANS.md for active tasks
5. Check ERRORS.md before debugging anything
6. Log all changes in CHANGELOG.md (Rule C-5)
