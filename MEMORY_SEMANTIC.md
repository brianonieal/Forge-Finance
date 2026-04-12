# MEMORY_SEMANTIC.md
# Forge Finance | Semantic Memory
# Pre-seeded April 2026 with all architectural decisions
# Blueprint v10

---

## UNIVERSAL PRE-FILLS

```
deployment_frontend:    Vercel
deployment_backend:     Render (free tier at start)
database:               Supabase PostgreSQL
auth:                   Supabase Auth (Google OAuth + Magic Link)
python_orm:             SQLAlchemy + Alembic (NEVER Prisma)
frontend_stack:         Next.js 15 + TypeScript + Tailwind + shadcn/ui
state_management:       Zustand + TanStack Query v5
ai_primary:             Claude Sonnet 4.6
ai_free_tier:           Qwen 2.5 Coder 32B via LiteLLM
testing_backend:        Pytest
testing_frontend:       Vitest + React Testing Library
testing_e2e:            Playwright (from v3.0.0+)
icons:                  Lucide React
animations:             Framer Motion
fonts:                  Inter (UI) + IBM Plex Mono (dollar amounts)
embeddings:             Voyage AI vector(1024)
```

---

## FORGE FINANCE ARCHITECTURE (DEC-001 through DEC-020 locked)

```
DEC-001: Cloud-only deployment (no on-device)
DEC-002: FastAPI Python backend
DEC-003: Next.js 15 TypeScript frontend
DEC-004: Supabase PostgreSQL + pgvector
DEC-005: Supabase Auth (Google OAuth + magic link)
DEC-006: LangGraph for agent orchestration
DEC-007: SQLAlchemy + Alembic migrations (NEVER Prisma)
DEC-008: LiteLLM for model routing
DEC-009: Clean rebuild -- zero code from prior versions
DEC-010: Voyage AI embeddings vector(1024)
DEC-011: Two MVP agents only -- @ORACLE + @SYNC
DEC-012: Sonnet primary, Haiku for classification routing
DEC-013: Plaid for financial data (webhooks primary, cron fallback)
DEC-014: Static budget/goal CRUD, AI coaching deferred post-v1
DEC-015: Sidebar conversation desktop, fullscreen mobile
DEC-016: Freemium: 10 queries/month free, unlimited Pro ($9/mo)
DEC-017: $0.50/user/month hard cost ceiling
DEC-018: Bloomberg-inspired dark theme
DEC-019: IBM Plex Mono mandatory for all dollar amounts
DEC-020: Stripe for subscription billing
```

---

## DESIGN SYSTEM (locked)

```
Theme:          Bloomberg-inspired dark mode
Primary dark:   #0F1117 (background)
Secondary dark: #1A1D27 (cards)
Steel blue:     #2563EB (primary actions)
Amber:          #F59E0B (alerts, warnings)
Success green:  #10B981
Text primary:   #E2E8F0
Text secondary: #94A3B8
Font UI:        Inter
Font numbers:   IBM Plex Mono (ALL dollar amounts -- mandatory)
Font mono:      JetBrains Mono (code)
```

---

## DATABASE SCHEMA (9 tables)

```
users           -- id, email, stripe_customer_id, plan, created_at
accounts        -- id, user_id, plaid_account_id, name, type, balance
transactions    -- id, account_id, user_id, plaid_id, amount, date,
                   merchant, category, embedding vector(1024)
budgets         -- id, user_id, category, limit, period
goals           -- id, user_id, name, target_amount, current_amount, deadline
categories      -- id, user_id, name, color, is_default
sync_log        -- id, user_id, type, status, cursor, completed_at
agent_log       -- id, user_id, agent, model, tokens, cost, duration, created_at
conversations   -- id, user_id, messages jsonb, created_at, updated_at
```

---

## PATTERNS ACTIVE IN THIS PROJECT

### PATTERN: FastAPI + Supabase + Next.js SaaS
```
Confidence:        LOW (first use -- this IS the first project)
Estimate accuracy: [fill after each gate]
Buffer:            +30% on schema gates
```

### PATTERN: Multi-Agent AI (LangGraph)
```
Confidence:        LOW (first use)
Agents:            @ORACLE (Sonnet -- analysis), @SYNC (Haiku -- data sync)
Routing:           Haiku classifier decides complexity
Buffer:            +50% on agent integration gates
Known issues:      ERR-LANGRAPH-001/002/003
```

### PATTERN: Plaid Integration
```
Confidence:        LOW (first use)
Buffer:            +50% on ALL Plaid gates -- always
Known issues:      ERR-PLAID-001 through ERR-PLAID-005
Critical:          Test webhooks with real Plaid signatures
```

### PATTERN: Voyage AI + pgvector
```
Confidence:        LOW (first use)
Model:             voyage-finance-2
Distance:          cosine (<=> not <->)
Known issues:      ERR-VOYAGE-001/002
```

---

## ANTI-PATTERNS (PERMANENT)

### ANTI-PATTERN: Prisma in Python
Confirmed failure. Use SQLAlchemy + Alembic. ERR-002. DEC-007.

### ANTI-PATTERN: Parallel file writes
Source: Forge Genesis v15-v29. Rule C-10. Never.

### ANTI-PATTERN: Testing with service role key
Hides RLS bugs. Test with user JWT always. ERR-RLS-001.

---

## PURPOSE OF THIS BUILD

Validate Blueprint v10 before building Trailwai.
Ship v1.0.0. Move on. Do not over-polish.
@ORACLE is the product. Everything else is scaffolding.
When fatigue hits at v0.4.0: Trailwai waits on the other side.
