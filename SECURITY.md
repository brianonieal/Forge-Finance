# SECURITY.md
# Forge Finance | Security Audit Log
# Blueprint v10

---

## LAST AUDIT

No audit yet. First audit at v0.2.0 (Data Layer — RLS policies).

---

## SECURITY POSTURE

### Authentication
- Provider: Supabase Auth (Google OAuth + Magic Link)
- Session: JWT managed by Supabase
- 2FA: Planned for v4.0.0

### Data Protection
- RLS: Required on all user-specific tables (from v0.2.0)
- Secrets: .env only, never in code (Rule C-8)
- Service role key: Backend only, never exposed to frontend

### API Security
- CORS: Restricted to frontend origin
- Rate limiting: TBD (v4.0.0)
- Input validation: Pydantic v2 on all endpoints

### Financial Data
- Plaid webhook signature verification (from v0.4.0)
- No raw bank credentials stored — Plaid access tokens only
- Financial math: Deterministic code only, never AI output (Rule C-12)

---

## KNOWN RISKS

| Risk | Gate | Mitigation |
|------|------|------------|
| RLS bypass via service role | v0.2.0 | Test with user JWT always (ERR-RLS-001) |
| Plaid webhook spoofing | v0.4.0 | Verify Plaid signatures |
| AI prompt injection | v0.5.0 | Input sanitization + output filtering |
| Stripe webhook replay | v5.0.0 | Idempotency keys + signature verification |
