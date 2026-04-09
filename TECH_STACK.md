# TECH_STACK.md
# Forge Finance | Technology Stack
# Source: Forge_Finance_app_spec.pdf | April 2026
# Blueprint v10

---

## STACK OVERVIEW

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router) | Vercel deployment |
| Styling | Tailwind CSS | Design tokens as CSS custom properties |
| Charts | Recharts | AreaChart, LineChart, PieChart, BarChart, RadialBarChart |
| State/Data | TanStack Query v5 | Cache invalidation on period selector change |
| State local | Zustand | Auth store, UI state |
| Backend | FastAPI (Python) | Render free tier, Railway upgrade at v5.0.0 |
| Database | Supabase (Postgres + pgvector) | RLS enabled, 9 tables at MVP |
| Migrations | Alembic + SQLAlchemy | Named, versioned migration files |
| Auth | Supabase Auth | Google OAuth + magic link |
| Financial data | Plaid API | Webhooks primary, daily cron fallback |
| AI orchestration | LangGraph | Agent state management |
| AI routing | LiteLLM | Sonnet primary, Haiku for classification |
| Embeddings | Voyage AI | vector(1024), semantic search |
| Observability | Sentry | Error tracking from v1.0.0 |
| Icons | Lucide React | Consistent icon set |
| Animations | Framer Motion | Transitions and micro-interactions |
| Billing | Stripe | Freemium to Pro, from v5.0.0 |

---

## FRONTEND

### Next.js 14+ (App Router)
- Version: 14+ with App Router (not Pages Router)
- Deployment: Vercel
- TypeScript: strict mode
- File structure: app/ directory with route groups

### Tailwind CSS
- Design tokens as CSS custom properties in globals.css
- Tailwind config extended with custom colors, fonts
- No arbitrary values -- only named tokens from design system

### Recharts
- AreaChart: spending trends, balance history
- LineChart: account balance over time
- PieChart: spending by category
- BarChart: budget vs actual comparisons
- RadialBarChart: budget health ring

### TanStack Query v5
- All server state via TanStack Query
- Period selector changes invalidate relevant query keys
- Optimistic updates for CRUD operations

### Zustand
- useAuthStore: user session, subscription status
- useUIStore: sidebar state, period selection, active filters

---

## BACKEND

### FastAPI (Python)
- Render free tier at launch, Railway upgrade at v5.0.0
- Async endpoints with SQLAlchemy async sessions
- Uvicorn ASGI server
- All endpoints protected except /health and /api/webhooks/*
- Cost guard middleware on all @ORACLE endpoints

### SQLAlchemy + Alembic
- Async SQLAlchemy for all DB operations
- Alembic for migrations -- named and versioned
- NEVER use autogenerate without manual review of output
- Migration files: read line by line before running

### Pydantic v2
- Request and response models
- Strict validation on financial data

---

## DATABASE

### Supabase PostgreSQL
- RLS enabled on all user-specific tables
- pgvector extension for transaction embeddings
- Connection pooling via Supabase connection pooler

### pgvector
- Extension: vector(1024)
- Distance: cosine similarity (<=> operator)
- Index: IVFFlat or HNSW on transactions.embedding
- Used for: @ORACLE semantic search on transaction history

---

## AI STACK

### LangGraph
- Agent orchestration for @ORACLE and @SYNC
- State management between agent nodes
- All state values must be JSON-safe primitives
- Streaming output from nodes

### LiteLLM
- Multi-model routing
- Sonnet primary (complex reasoning)
- Haiku classifier (query routing)
- Cost tracking per model

### Models
- Claude Sonnet 4.6: @ORACLE reasoning (paid tier)
- Claude Haiku 4.5: classification routing
- Cost ceiling: $0.50/user/month hard limit
- Free tier: 10 queries/month cap

### Voyage AI
- Model: voyage-finance-2 (finance-specific)
- Dimensions: 1024
- Distance: cosine (<=> not <->)
- Max input: 4096 tokens (chunk at 2000)
- Used for: semantic transaction search

### Plaid
- Products: transactions, auth
- Country codes: US
- Webhooks: primary sync method
- Daily cron: fallback sync
- Sandbox in dev/staging, production in v5.0.0

---

## DEPLOYMENT

### Frontend: Vercel
- Automatic deploys on push to main
- Preview deploys on PR
- Environment variables in Vercel dashboard

### Backend: Render (free tier → Railway at v5.0.0)
- Web service: FastAPI
- Auto-deploy from GitHub
- Environment variables in Render dashboard

### Database: Supabase
- Project: Forge-Finance (separate from BP-v10)
- Staging: Supabase staging project
- Production: Supabase production project

---

## ENVIRONMENT VARIABLES

```bash
# Frontend (NEXT_PUBLIC_ prefix for client-side)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=

# Backend
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
PLAID_WEBHOOK_URL=
PLAID_WEBHOOK_SECRET=
VOYAGEAI_API_KEY=
LITELLM_MASTER_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
```

---

## WHAT NOT TO USE (PERMANENT RULES)

| Banned | Use Instead | Reason |
|--------|------------|--------|
| Prisma | SQLAlchemy + Alembic | ERR-002, Python incompatibility |
| OpenAI embeddings | Voyage AI | Better financial domain performance |
| Redux | Zustand | Simpler, less boilerplate |
| Pages Router | App Router | Current Next.js standard |
| MySQL | PostgreSQL | pgvector requirement |
| Parallel file writes | Sequential builds | ERR-PARALLEL-001 |
