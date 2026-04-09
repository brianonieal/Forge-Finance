# MEMORY_CORRECTIONS.md
# Forge Finance | Correction Memory -- REFLEXION Entries
# Written at every gate close (mandatory)
# This is the benchmarking dataset for the independent study
# Blueprint v10

---

## CALIBRATION SUMMARY (updated after every 3 gates)

Gates completed: 8
Overall estimate accuracy: Estimates averaged 12.8x actual (raw human estimates vs AI-assisted)
Systematic biases: All gates massively overestimated -- raw estimates assume solo human developer pace
Recommended buffer: For AI-assisted development, use 10% of raw human estimate as starting point
Plaid buffer status: +50% buffer was NOT needed -- managed SDK integration was straightforward
Most complex gate (v0.5.0): 20 hrs est → 1.5 hrs actual. Even the biggest gate follows the pattern.
CRUD gates: v0.6.0 confirms standard CRUD + screens gates take ~1.0 hrs AI-assisted regardless of endpoint count.

---

## KNOWN PRE-BUILD CALIBRATIONS

Based on prior Forge Finance versions and risk analysis:

Plaid gates:       budget +50% on raw estimate
Schema gates:      budget +30% on raw estimate
Streaming gates:   budget 3 hour minimum regardless of apparent complexity
RLS gates:         budget +2 hours if adding 3+ tables with auth
LangGraph gates:   budget +50% for first-time integration

These are starting hypotheses. Actual reflexion data will confirm
or correct these buffers after the first few gates.

---

## REFLEXION LOG (permanent -- never delete)

### REFLEXION: v1.0.0 -- Genesis (Launch)

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 10 hours
  Actual:    0.5 hours
  Variance:  -95%

WHY OFF
  v1.0.0 is a single static landing page with no backend work, no data fetching, no API integration. Pure JSX + Tailwind with a simple form state toggle. The 10 hr estimate included "full QA pass" and "production deploy" which were either trivial or deferred.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Landing page design iteration, waitlist backend integration, production deploy, Sentry setup
  Actual:    Zero design iteration (spec was fully decided in FRONTEND_SPEC.md), waitlist is client-side state only, deploy and Sentry are separate ops tasks
  Gap:       Static pages are the fastest gate type. No novel patterns, no API integration, no charts.

CORRECTION FOR FUTURE
  Static/marketing page gates should estimate at 0.5 hrs AI-assisted.
  "QA pass" on already-tested code is not a separate task — tests are the QA.
  Production deploy is an ops task, not a build task — estimate separately.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.6.0 -- Budgets + Goals

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 14 hours
  Actual:    1.0 hours
  Variance:  -93%

WHY OFF
  Standard CRUD endpoints (10 total) + 4 screens with Recharts charts follow the exact same pattern as prior gates. Pre-existing models and schemas from v0.2.0 meant zero design iteration. Circular progress and pace calculation were simple math, not novel engineering.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Budget health aggregation complexity, goal pace calculation edge cases, celebration modal animation
  Actual:    Health is count(on_track)/total; pace is linear projection from daily rate; celebration is CSS animation with prefers-reduced-motion check
  Gap:       None of the predicted complexity materialized. CRUD + visualization gates are routine.

CORRECTION FOR FUTURE
  CRUD + screen gates with pre-decided schemas should estimate at 1.0 hrs AI-assisted, regardless of endpoint count.
  Recharts integration is now a solved pattern — no additional buffer needed for chart-heavy gates.
  The 14 hr estimate should be 1.0-1.5 hrs.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.5.0 -- Dashboard + @ORACLE

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 20 hours (most complex gate)
  Actual:    1.5 hours
  Variance:  -93%

WHY OFF
  Despite being the most complex gate (4 screens, AI agent, SSE streaming, Recharts charts, cost tracking), the pattern holds: AI generation with pre-decided specs produces code at ~10x the estimated human pace. The @ORACLE agent was the only novel component, but even LLM pipeline code generation is routine for AI assistance.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Complex AI agent pipeline, SSE streaming challenges, chart library integration friction
  Actual:    SSE streaming was standard FastAPI StreamingResponse; Recharts rendered first-try; @ORACLE pipeline was straightforward classification + response generation
  Gap:       No new friction patterns emerged. Complexity doesn't scale linearly with AI-assisted development.

CORRECTION FOR FUTURE
  Even "most complex" gates should estimate at 1.5-2.0 hrs AI-assisted.
  Complexity multipliers don't apply to AI-generated code the same way they apply to human developers.
  The 20 hr estimate for "most complex gate" should be 2.0 hrs.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.4.0 -- Plaid + @SYNC

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 18 hours (12 raw + 50% Plaid buffer)
  Actual:    1.0 hours
  Variance:  -94%

WHY OFF
  The +50% Plaid buffer assumed manual API integration, webhook debugging, and sandbox reliability issues. In practice, the plaid-python SDK handles all complexity, and AI-assisted code generation produced the entire sync pipeline (cursor-based sync, dedup, embedding pipeline) in a single pass.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Plaid sandbox webhook delivery issues, dedup edge cases, Voyage AI rate limiting
  Actual:    SDK abstracted all Plaid complexity; dedup was a simple unique constraint check; embedding pipeline was straightforward HTTP calls
  Gap:       Pre-build calibration assumed Plaid integration would be the hardest gate — with managed SDKs and AI generation, it's comparable to other gates

CORRECTION FOR FUTURE
  Plaid buffer of +50% is NOT needed for AI-assisted builds with managed SDK.
  Estimate Plaid gates at 1.0-1.5 hrs AI-assisted, same as other integration gates.
  The pre-build calibration for "Plaid gates: budget +50%" should be revised downward.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: Plaid buffer calibration invalidated
  Estimate buffer added: no — buffer removed

---

### REFLEXION: v0.3.0 -- Auth

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 10 hours
  Actual:    1.0 hours
  Variance:  -90%

WHY OFF
  Auth gate estimates assumed manual JWT middleware, session handling, and multi-page form building from scratch -- AI-assisted development with pre-decided Supabase Auth pattern collapsed the entire gate to boilerplate generation.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Complex auth middleware, session management, multi-step forms
  Actual:    Supabase Auth handles all session/JWT complexity; frontend is thin wrappers around @supabase/ssr
  Gap:       Supabase Auth eliminates most custom auth code -- estimate should reflect integration, not implementation

CORRECTION FOR FUTURE
  Auth gates using managed auth (Supabase/Auth0/Clerk) should estimate at 1-1.5 hrs AI-assisted, not 10 hrs.
  The complexity is in the provider setup, not the code.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.2.0 -- Data Layer

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 10 hours
  Actual:    0.75 hours
  Variance:  -93%

WHY OFF
  Schema was fully pre-decided in MEMORY_SEMANTIC.md (9 tables, all columns, all relationships). AI generation of SQLAlchemy models + Alembic migration + Pydantic schemas is near-instant when the spec is complete.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Iterative schema design, migration debugging, RLS policy writing
  Actual:    Pre-decided schema meant zero design iteration; pgvector column needed raw SQL workaround but took <5 min
  Gap:       Pre-seeded semantic memory eliminates design time -- estimate only needed for code generation + testing

CORRECTION FOR FUTURE
  Data layer gates with pre-decided schemas should estimate at 0.75-1.0 hrs AI-assisted.
  Add +30% only if schema design is NOT pre-decided.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.1.0 -- Scaffold

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 8 hours
  Actual:    0.75 hours
  Variance:  -91%

WHY OFF
  8 global components were all standard UI patterns (sidebar, toast, skeleton, etc.) with no novel logic. AI generates these faster than a human can type the imports. Tailwind v4 CSS-based config was the only friction point.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: 8 components built sequentially with potential shadcn setup friction
  Actual:    All 8 components generated in parallel batches; Tailwind v4 uses @theme inline (no tailwind.config.js) which was a minor surprise
  Gap:       Tailwind v4 config difference was trivially resolved -- not worth adding estimate buffer

CORRECTION FOR FUTURE
  UI scaffold gates with standard component patterns should estimate at 0.75-1.0 hrs AI-assisted.
  Only add buffer for novel/custom components not seen in prior projects.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

### REFLEXION: v0.0.0 -- Foundation

Date: 2026-04-09
Project: Forge Finance

ESTIMATE
  Predicted: 6 hours
  Actual:    1.0 hours
  Variance:  -83%

WHY OFF
  Foundation gate was primarily file creation and boilerplate -- monorepo scaffold, config files, design tokens. Port 8000 blocked on Windows 11 added ~10 min debugging but the overall gate was straightforward template generation.

TECHNICAL PREDICTIONS VS REALITY
  Predicted: Clean scaffold with dev server on default ports
  Actual:    Port 8000 blocked on Windows 11, switched to 8001
  Gap:       Port conflict not anticipated -- added to CONTRACT.md as permanent config

CORRECTION FOR FUTURE
  Foundation gates on this machine default to port 8001 not 8000.
  Foundation/scaffold gates should estimate at 1.0 hrs AI-assisted for monorepo + config setup.

MEMORY_SEMANTIC.md UPDATE
  Pattern updated: none
  Confidence change: no change
  Estimate buffer added: no

---

## RESEARCH STUDY NOTES

Target: 13 reflexion entries from Forge Finance v0.0.0 through v1.0.0
Each entry is a structured data point for the benchmarking study.

Questions this data will answer:

1. Which gate types does Blueprint v10 systematically mis-estimate?
2. Does accuracy improve over the 13-gate arc? (learning curve)
3. Are the pre-build calibrations above validated or corrected?
4. What is the baseline accuracy for Category 2 benchmarking?

Collect faithfully. Every gate. No skipping.
