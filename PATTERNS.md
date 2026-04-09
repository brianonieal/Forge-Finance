# PATTERNS.md
# Forge Finance | Applied Patterns
# Blueprint v10

---

## ACTIVE PATTERNS

### PAT-001: Monorepo (Turborepo + pnpm)
```
Applied: v0.0.0
Structure: apps/web (Next.js), apps/api (FastAPI), packages/shared-schemas
Why: Single repo for full-stack, shared types, atomic deploys
```

### PAT-002: CSS Custom Properties + Tailwind v4
```
Applied: v0.0.0
Why: Design tokens in CSS, consumed by Tailwind @theme inline
Benefit: Single source for colors/fonts, supports dark/light themes
```

### PAT-003: FastAPI + SQLAlchemy Async
```
Applied: v0.0.0
Why: Async Python backend with type-safe ORM
Pattern: Pydantic schemas → SQLAlchemy models → Alembic migrations
```

### PAT-004: Supabase Auth + RLS
```
Planned: v0.2.0
Why: Auth + DB in one service, RLS for row-level security
Pattern: User JWT → RLS policy → filtered queries
```

### PAT-005: LangGraph Agent Pipeline
```
Planned: v0.5.0
Why: Structured multi-step AI reasoning with state management
Pattern: Haiku classifier → Sonnet reasoning → tool calls → streaming response
```

---

## PATTERN LOG

Patterns are logged as they are applied. Confidence scores updated after each gate.
