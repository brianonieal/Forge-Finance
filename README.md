# Forge Finance

AI-native personal finance platform with a five-agent LangGraph
architecture. Connects real bank accounts through Plaid, classifies
transactions with AI confidence scoring, and provides financial insights
through specialized agent workflows with human-in-the-loop approval gates.

## Architecture
```
User Query
|
v
@ROUTER (coordinator)
|
|--- financial question ---> @ORACLE (insights, analysis)
|--- budget/goal request --> @FORGE  (budgets, goals, planning)
|--- anomaly alert --------> @SENTINEL (anomaly detection, alerts)
|--- sync request ---------> @SYNC  (Plaid data ingestion, normalization)
|
v
Response
```

**@ROUTER** classifies every incoming request and delegates to the
appropriate specialist. Workers never spawn other workers. All results
return through the router for synthesis.

**@ORACLE** handles financial questions: spending patterns, category
breakdowns, trend analysis, and natural language queries over transaction
data using pgvector semantic search.

**@FORGE** manages budgets and financial goals. All mutations require
human approval before execution.

**@SENTINEL** monitors for anomalies: unusual transactions, spending
spikes, duplicate charges, and merchant irregularities.

**@SYNC** manages the Plaid connection lifecycle: account linking,
transaction sync, balance updates, and data normalization.

## Stack

| Layer | Technology |
|-------|-----------|
| Agent orchestration | LangGraph (state graph with conditional routing) |
| Model routing | LiteLLM (Claude, Mistral, Llama with automatic failover) |
| Backend | FastAPI (Python) |
| Frontend | Next.js 14 (TypeScript) |
| Database | Supabase (PostgreSQL + pgvector) |
| Financial data | Plaid API |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Agent Tool Registry

| Tool | Permitted Agents | Requires Approval |
|------|-----------------|-------------------|
| query_db (read) | All agents | No |
| mutate_db (write) | @FORGE, @SENTINEL, @SYNC | @FORGE: Yes |
| call_plaid_api | @SYNC only | No |
| spawn_subagent | @ROUTER only | No |

## Defensive Patterns

Every layer of the agent workflow includes safeguards:

- Boot sequence health checks validate database connectivity, Plaid
  token status, and model availability before accepting requests
- Circuit breakers trip after three consecutive failures on any agent
  node, preventing cascade failures across the graph
- Schema validation at each state transition ensures agent outputs
  conform to the expected shape before passing to the next node
- Human approval gates on all financial mutations
- Tool permission boundaries prevent agents from accessing tools
  outside their defined scope

## Methodology

Built using <a href="https://github.com/brianonieal/Syntaris">Syntaris</a>, an
open-source gated development methodology for Claude Code. The foundation
files in the repo root (CONTRACT.md, SPEC.md, DECISIONS.md, etc.) are
Syntaris artifacts that enforce sequential development gates, permanent
decision logging, and cross-session memory.

## Project Status

v3.2.0 (private beta gate cleared). 151 tests passing across unit,
integration, and agent workflow suites.

## Local Development

```bash
git clone https://github.com/brianonieal/Forge-Finance.git
cd Forge-Finance
cp .env.example .env
# Fill in your own API keys (see .env.example for required variables)

# Backend
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd apps/web
npm install
npm run dev
```

## Environment Variables

Requires API keys for Plaid, Supabase, and at least one LLM provider.
See `.env.example` for the full list. No credentials are committed to
this repository.

## License

Source-available for portfolio and educational review. Not licensed for
commercial use or redistribution.
