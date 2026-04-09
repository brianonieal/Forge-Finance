# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.2.0 — Data Layer

**Purpose:** All 9 database tables + migrations + base API structure
**Est:** 10 hrs (raw) + 30% schema buffer = 13 hrs calibrated

---

## DELIVERABLES

- [x] SQLAlchemy models for all 9 tables
- [x] Alembic migration: all 9 tables in single migration (001)
- [x] RLS policies on all user-specific tables
- [x] FastAPI base structure with SQLAlchemy async sessions
- [x] Health check endpoint with DB connectivity check
- [x] Pydantic v2 request/response schemas
- [x] 29 tests passing (models, schemas, health endpoint)

---

## SCHEMA (from MEMORY_SEMANTIC.md)

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

## SCREENS

None

---

## TESTS

12 target:
- 9 table creation tests (one per model)
- 2 two-user isolation tests (RLS)
- 1 health check endpoint test

---

## ACCEPTANCE CRITERIA

1. All 9 tables exist in Supabase with correct columns and types
2. RLS enabled on all user-specific tables
3. Two-user isolation test passes (user A cannot see user B's data)
4. /health returns DB connectivity status
5. 12 tests passing
