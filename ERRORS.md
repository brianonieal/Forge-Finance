# ERRORS.md
# Forge Finance | Known Failure Modes
# Blueprint v10
# Check here FIRST before debugging

---

## ACTIVE ERRORS

None yet.

---

## KNOWN RISK CATALOG (pre-seeded from prior versions)

### ERR-002: Prisma in Python
**Symptom:** Import errors, type mismatches
**Root cause:** Prisma Client is JS-only; Python bindings are experimental
**Fix:** Use SQLAlchemy + Alembic. DEC-007/DEC-010.
**Status:** PERMANENT — never use Prisma in this project

### ERR-PARALLEL-001: Parallel file writes
**Symptom:** Corrupted files, partial writes, race conditions
**Root cause:** Multiple async writes to same file
**Fix:** Sequential builds only. Rule C-10.
**Status:** PERMANENT

### ERR-RLS-001: Testing with service role key
**Symptom:** Tests pass but production queries fail
**Root cause:** Service role key bypasses RLS policies
**Fix:** Always test with user JWT. Never use service role for app queries.
**Status:** PERMANENT

### ERR-PLAID-001: Sandbox webhook delivery
**Symptom:** Webhooks not arriving in sandbox
**Root cause:** Plaid sandbox webhook delivery is unreliable
**Fix:** Always implement daily cron fallback alongside webhooks
**Status:** ACTIVE from v0.4.0

### ERR-PLAID-002: HISTORICAL_UPDATE timeout
**Symptom:** Onboarding step 3 hangs indefinitely
**Root cause:** Plaid can take 1-30 minutes for historical sync
**Fix:** Set 5-minute timeout with polling fallback, show progress
**Status:** ACTIVE from v0.4.0

### ERR-PLAID-003: Duplicate transactions on re-sync
**Symptom:** Same transactions appear twice after cursor reset
**Root cause:** Plaid cursor invalidation after item update
**Fix:** Deduplicate on plaid_transaction_id before insert
**Status:** ACTIVE from v0.4.0

### ERR-PLAID-004: ITEM_LOGIN_REQUIRED
**Symptom:** Sync fails silently, stale data
**Root cause:** User's bank credentials expired
**Fix:** Handle webhook, show UI indicator, offer Plaid Link update mode
**Status:** ACTIVE from v0.4.0

### ERR-PLAID-005: Rate limiting
**Symptom:** 429 responses from Plaid API
**Root cause:** Too many API calls in short window
**Fix:** Exponential backoff with jitter, max 5 retries
**Status:** ACTIVE from v0.4.0

### ERR-LANGRAPH-001: State serialization
**Symptom:** Agent crashes with serialization error
**Root cause:** Non-JSON-safe values in LangGraph state
**Fix:** All state values must be JSON-safe primitives
**Status:** ACTIVE from v0.5.0

### ERR-LANGRAPH-002: Streaming interruption
**Symptom:** SSE stream drops mid-response
**Root cause:** Timeout or connection drop during streaming
**Fix:** Implement reconnection logic, buffer partial responses
**Status:** ACTIVE from v0.5.0

### ERR-LANGRAPH-003: Tool call loops
**Symptom:** Agent calls same tool repeatedly
**Root cause:** Missing exit condition in agent graph
**Fix:** Max iteration count (10), timeout per query (30s)
**Status:** ACTIVE from v0.5.0

### ERR-VOYAGE-001: Embedding dimension mismatch
**Symptom:** pgvector insert fails
**Root cause:** Model returned different dimension than expected
**Fix:** Validate embedding length == 1024 before insert
**Status:** ACTIVE from v0.4.0

### ERR-VOYAGE-002: Rate limiting on batch embed
**Symptom:** 429 from Voyage AI during historical sync
**Root cause:** Too many embeddings requested at once
**Fix:** Batch in groups of 50, 100ms delay between batches
**Status:** ACTIVE from v0.4.0
