# Forge Finance

AI-assisted personal finance platform with Plaid bank connections, semantic
transaction search, budget and goal tracking, and an AI assistant that
answers financial questions grounded in your actual transaction data.

## Project Status

**v5.0.0 "Apex"** — shipped 2026-04-16. Stripe billing live (Checkout +
Customer Portal + signed webhook idempotency). 12 gates complete from
v0.0.0 Foundation through v5.0.0 Apex. **264 tests passing** (147 backend
Pytest, 117 frontend Vitest + React Testing Library).

## Architecture (as shipped)

```
User request
  │
  ├──► @ORACLE (financial Q&A, spending analysis, budget insights)
  │       └── pgvector semantic search over transactions
  │       └── SSE streaming responses
  │
  └──► @SYNC (Plaid data lifecycle: link, sync, normalize, embed)
          └── Webhook handler + cron fallback
          └── Voyage AI embedding pipeline
```

Two agents in the v5.0.0 shipped build: **@ORACLE** and **@SYNC**.

### @ORACLE
Answers financial questions using transaction context. Classifies query
intent, retrieves relevant transactions via pgvector semantic search, and
streams responses over SSE. Tracks per-user cost against a monthly ceiling
($0.50/user/month) and enforces a free-tier query limit (10 queries/month).

### @SYNC
Manages the Plaid connection lifecycle. Handles the initial `HISTORICAL_UPDATE`,
incremental `TRANSACTIONS_SYNC` via cursor-based sync, dedup on
`plaid_transaction_id`, and item status events (`ITEM_LOGIN_REQUIRED`,
expiration). Runs Voyage AI embedding generation on new transactions for
pgvector semantic search.

### Roadmap — post-v5.0.0

The full vision is a five-agent architecture. Three agents are descoped
from the MVP per decision DEC-011 and on the post-v5.0.0 roadmap:

- **@ROUTER** — intent classifier that delegates to specialists
- **@FORGE** — budget/goal mutations with human approval gates
- **@SENTINEL** — anomaly detection (spending spikes, duplicate charges)

The v5.0.0 build handles budget/goal CRUD through direct endpoints (no
agent), and alerts are computed dynamically from budget/goal state rather
than a persistent notification table. This is intentional MVP simplification.

## Gate History

| Gate | Name | Date | Tests | Actual Hrs | Est Hrs | Variance |
|------|------|------|-------|------------|---------|----------|
| v0.0.0 | Foundation | 2026-04-09 | 0 | 1.00 | 6 | -83% |
| v0.1.0 | Scaffold | 2026-04-09 | 0 | 0.75 | 8 | -91% |
| v0.2.0 | Data Layer | 2026-04-09 | 29 | 0.75 | 10 | -93% |
| v0.3.0 | Auth | 2026-04-09 | 36 | 1.00 | 10 | -90% |
| v0.4.0 | Plaid + @SYNC | 2026-04-09 | 52 | 1.00 | 18 | -94% |
| v0.5.0 | Dashboard + @ORACLE | 2026-04-09 | 84 | 1.50 | 20 | -93% |
| v0.6.0 | Budgets + Goals | 2026-04-09 | 124 | 1.00 | 14 | -93% |
| v1.0.0 | Genesis (Launch) | 2026-04-09 | 131 | 0.50 | 10 | -95% |
| v2.0.0 | Horizon (Reports + Alerts) | 2026-04-09 | 154 | 1.00 | 16 | -94% |
| v3.0.0 | Compass (Investments + Net Worth) | 2026-04-09 | 177 | 0.75 | 14 | -95% |
| v4.0.0 | Forge (Perf + A11y + Beta) | 2026-04-09 | 218 | 0.75 | 12 | -94% |
| v5.0.0 | Apex (Stripe + Launch) | 2026-04-16 | 264 | 1.25 | 14 | -91% |
| **Total** | | | **264** | **11.25** | **152** | **-93%** |

Every gate has a permanent reflexion entry in `MEMORY_CORRECTIONS.md`
analyzing why the estimate was off and what to correct for future projects.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI (Python 3.11+) |
| Database | Supabase (PostgreSQL + pgvector) + Row-Level Security |
| Auth | Supabase Auth (Google OAuth + magic link) |
| ORM / Migrations | SQLAlchemy 2 (async) + Alembic |
| Agent orchestration | LangGraph |
| Model routing | LiteLLM (Claude primary, open models as fallback) |
| Embeddings | Voyage AI `voyage-finance-2` (1024-dim) |
| Financial data | Plaid API (production from v5.0.0) |
| Billing | Stripe Checkout + Customer Portal + webhooks |
| Error tracking | Sentry (frontend + backend) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Testing

- **Backend (Pytest)** — 147 tests covering models, schemas, routers,
  auth middleware, agent logic, Stripe webhook signature verification and
  idempotency, billing endpoint auth gates
- **Frontend (Vitest + React Testing Library)** — 117 tests covering
  landing, auth, onboarding, dashboard, accounts, transactions, budgets,
  goals, alerts, reports, investments, net worth, settings (profile,
  security/2FA, billing), accessibility (layout-a11y)

## Methodology

Built using [Syntaris](https://github.com/brianonieal/Syntaris), an
open-source gated development methodology for Claude Code. Sequential
gate approvals, permanent decision log (`DECISIONS.md`), cross-session
memory network (`MEMORY_SEMANTIC.md`, `MEMORY_EPISODIC.md`,
`MEMORY_CORRECTIONS.md`), and mechanical shell-level enforcement of
test-passing and anti-regression rules.

## Local Development

```bash
git clone https://github.com/brianonieal/Forge-Finance.git
cd Forge-Finance
cp .env.example .env
# Fill in your own API keys (see .env.example for the full list)

# Backend
cd apps/api
python -m venv .venv && source .venv/Scripts/activate  # or .venv/bin/activate on *nix
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend (separate terminal)
cd apps/web
pnpm install
pnpm dev
```

## Environment Variables

Requires API keys for Plaid, Supabase, Voyage AI, Stripe, and Sentry.
See `.env.example` at the repo root for the full canonical list, plus
backend-specific (`apps/api/.env.example`) and frontend-specific
(`apps/web/.env.example`) templates. No credentials are committed.

## License

Source-available for portfolio and educational review. Not licensed for
commercial use or redistribution.
