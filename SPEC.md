# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v0.4.0 — Plaid + @SYNC

**Purpose:** Bank connection + real-time transaction sync
**Est:** 18 hrs (raw 12 + 50% Plaid buffer) | Calibrated: 2.0 hrs AI-assisted

---

## DELIVERABLES

- [ ] Plaid Link integration (create-link-token, exchange-public-token)
- [ ] Screen 3: Onboarding Wizard — /onboarding (4 steps)
- [ ] Screen 5: Accounts — /accounts (cards, connect, empty state)
- [ ] @SYNC agent: webhook handler (HISTORICAL_UPDATE, TRANSACTIONS_SYNC)
- [ ] Webhook signature verification middleware
- [ ] Daily cron fallback sync
- [ ] Cursor-based incremental sync with deduplication
- [ ] ITEM_LOGIN_REQUIRED handling + Plaid Link update mode
- [ ] Voyage AI embedding pipeline for transactions
- [ ] ERR-PLAID-001 through ERR-PLAID-005 mitigations built in
- [ ] Tests: 50 cumulative (14 new)

---

## SCREENS

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 3 | Onboarding Wizard | /onboarding | 4-step post-auth flow |
| 5 | Accounts | /accounts | Account cards + connect |

---

## ACCEPTANCE CRITERIA

1. Plaid Link opens and connects in sandbox mode
2. Public token exchanges for access token
3. HISTORICAL_UPDATE webhook triggers initial sync
4. Transactions sync with cursor-based pagination
5. Duplicate transactions are rejected on plaid_transaction_id
6. ITEM_LOGIN_REQUIRED triggers UI indicator
7. Voyage AI embeddings generated for synced transactions
8. Accounts page shows connected accounts with balances
9. Onboarding wizard guides first-time user through connection
10. Daily cron fallback works when webhooks fail

---

## ERROR MITIGATIONS

| Error | Mitigation |
|-------|-----------|
| ERR-PLAID-001 | Daily cron fallback alongside webhooks |
| ERR-PLAID-002 | 5-min timeout with polling fallback on onboarding step 3 |
| ERR-PLAID-003 | Deduplicate on plaid_transaction_id before insert |
| ERR-PLAID-004 | Handle webhook, show UI indicator, Plaid Link update mode |
| ERR-PLAID-005 | Exponential backoff with jitter, max 5 retries |
| ERR-VOYAGE-001 | Validate embedding length == 1024 before insert |
| ERR-VOYAGE-002 | Batch in groups of 50, 100ms delay between batches |
