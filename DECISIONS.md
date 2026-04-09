# DECISIONS.md — Architectural Decision Log
# App: Forge Finance
# Last updated: April 8, 2026
#
# PURPOSE: Permanent record of why this app is built the way it is.
# When a future Claude session asks "why is this built this way" --
# the answer is here.

---

## DECISION INDEX

| ID | Decision | Gate | Verdict | Outcome |
|----|----------|------|---------|---------|
| DEC-001 | 2 agents at MVP (@ORACLE + @SYNC) | v0.0.0 | SOUND | ACCEPTED |
| DEC-002 | Cloud-only AI, Ollama deferred to v7.0 | v0.0.0 | SOUND | ACCEPTED |
| DEC-003 | Plaid-only, MX deferred to v6.0 | v0.0.0 | SOUND | ACCEPTED |
| DEC-004 | Monitor Plaid AI enrichment quarterly | v0.0.0 | SOUND | ACCEPTED |
| DEC-005 | Static CRUD budgets, no AI agent | v0.0.0 | SOUND | ACCEPTED |
| DEC-006 | $0.50/user/month ceiling (free tier) | v0.0.0 | SOUND | ACCEPTED |
| DEC-007 | @ROUTER returns at v6.0 | v0.0.0 | SOUND | ACCEPTED |
| DEC-008 | Voyage AI embeddings, vector(1024) | v0.0.0 | SOUND | ACCEPTED |
| DEC-009 | Clean rebuild from v0.0.0 | v0.0.0 | SOUND | ACCEPTED |
| DEC-010 | Alembic + SQLAlchemy for migrations | v0.0.0 | SOUND | ACCEPTED |
| DEC-011 | Hybrid @ORACLE: sidebar desktop, fullscreen mobile | v0.0.0 | SOUND | ACCEPTED |
| DEC-012 | Free tier: 10 AI queries/month | v0.0.0 | SOUND | ACCEPTED |
| DEC-013 | PaddleOCR for free tier OCR | v0.0.0 | SOUND | ACCEPTED |
| DEC-014 | Mindee/Veryfi for Pro tier OCR | v0.0.0 | SOUND | ACCEPTED |
| DEC-015 | Family: max 3 people (primary + 2 invited) | v0.0.0 | SOUND | ACCEPTED |
| DEC-016 | Family data sharing is granular | v0.0.0 | SOUND | ACCEPTED |
| DEC-017 | All family members can scan receipts | v0.0.0 | SOUND | ACCEPTED |
| DEC-018 | v1.5.0 "Harvest" gate for receipt intelligence | v0.0.0 | SOUND | ACCEPTED |
| DEC-019 | Annual pricing: $89/year ($19 savings) | v0.0.0 | SOUND | ACCEPTED |
| DEC-020 | Add normalization tracking fields to receipt_items | v0.0.0 | SOUND | ACCEPTED |
| DEC-021 | v0.5.0 split strategy if gate slips | v0.0.0 | SOUND | ACCEPTED |
| DEC-022 | jsonb family sharing with documented migration path | v0.0.0 | CONCERN | ACCEPTED WITH TECH DEBT NOTE |

---

## DECISION LOG

### DEC-020 -- Add normalization_confidence and user_corrected to receipt_items
**Date:** April 8, 2026
**Gate:** v0.0.0 (pre-build)
**Decision:** Add `normalization_confidence` (float, 0-1) and `user_corrected` (boolean) columns to the `receipt_items` table to track Haiku's confidence in product name normalization and capture user corrections as training signal.
**Proposed by:** Claude (Critical Thinker)
**Critical Thinker verdict:** SOUND

**What's strong:**
Two columns with minimal schema cost that create a feedback loop for normalization quality. When users correct "2% MLK GL" → "Milk, 2%, 1 Gallon", the correction is captured. Over time, this data can improve normalization accuracy — either by fine-tuning prompts or building a lookup table of known corrections.

**Problems identified:** NONE

**Alternative proposed:** NONE

**Outcome:** ACCEPTED
**Applied to:** FORGE_FINANCE_SPEC_v2.md receipt_items schema

**Result:**

---

### DEC-021 -- v0.5.0 split strategy if gate slips
**Date:** April 8, 2026
**Gate:** v0.0.0 (pre-build)
**Decision:** If v0.5.0 (Dashboard + @ORACLE) starts slipping, split into v0.5.0-alpha (Dashboard + Account Detail + Transactions with mock data, no AI) and v0.5.0-beta (@ORACLE + RAG pipeline). UI progress must not be blocked by AI integration.
**Proposed by:** Claude (Critical Thinker)
**Critical Thinker verdict:** SOUND

**What's strong:**
v0.5.0 is the heaviest gate in the roadmap — 4 screens plus the entire AI pipeline. Splitting keeps momentum. Screens can render with mock data while the RAG pipeline is built in parallel.

**Problems identified:** NONE

**Alternative proposed:** NONE

**Outcome:** ACCEPTED
**Applied to:** FORGE_FINANCE_SPEC_v2.md roadmap table, noted as contingency

**Result:**

---

### DEC-022 -- jsonb family sharing with documented migration path
**Date:** April 8, 2026
**Gate:** v0.0.0 (pre-build)
**Decision:** Keep jsonb arrays (shared_accounts, shared_budgets, shared_goals) on family_members table for v2.0.0 with 3-member cap. Document the junction table migration path (family_member_permissions with foreign keys) in the migration file for future expansion.
**Proposed by:** Claude (Critical Thinker)
**Critical Thinker verdict:** CONCERN

**What's strong:**
jsonb arrays are simpler to implement and query at small scale. With a hard 3-member cap, the referential integrity and RLS performance concerns are tolerable. Documenting the migration path now means a future session won't have to rediscover the problem.

**Problems identified:**
- No referential integrity on IDs in jsonb arrays (deleted budget still referenced)
- RLS policies checking ANY(jsonb_array) scale poorly
- jsonb array updates are full replacement, not atomic

**Alternative proposed:**
Junction table (family_member_permissions) with proper FKs — but adds complexity for a feature capped at 3 members.

**Outcome:** ACCEPTED WITH TECH DEBT NOTE
**Tech debt:** If family sharing expands beyond 3 members, refactor to junction table. Comment added to spec and will be added to migration file.

**Result:**

---
