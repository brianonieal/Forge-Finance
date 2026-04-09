# MEMORY_CORRECTIONS.md
# Forge Finance | Correction Memory -- REFLEXION Entries
# Written at every gate close (mandatory)
# This is the benchmarking dataset for the independent study
# Blueprint v10

---

## CALIBRATION SUMMARY (updated after every 3 gates)

Gates completed: 4
Overall estimate accuracy: Estimates averaged 9.7x actual (raw human estimates vs AI-assisted)
Systematic biases: All gates massively overestimated -- raw estimates assume solo human developer pace
Recommended buffer: For AI-assisted development, use 10% of raw human estimate as starting point

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
