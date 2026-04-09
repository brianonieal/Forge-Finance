# COSTS.md
# Forge Finance | Cost Tracking
# Blueprint v10

---

## INFRASTRUCTURE COSTS (monthly at scale)

| Service | Free Tier | Pro (100 users) | Scale (1000 users) |
|---------|-----------|-----------------|---------------------|
| Vercel | $0 | $0 (hobby) | $20/mo (pro) |
| Render | $0 | $7/mo (starter) | $25/mo (standard) |
| Supabase | $0 | $25/mo (pro) | $25/mo (pro) |
| Plaid | $0 (sandbox) | $0 (100 items) | TBD |
| Anthropic (Claude) | — | ~$50/mo | ~$500/mo |
| Voyage AI | — | ~$5/mo | ~$50/mo |
| Stripe | 2.9% + $0.30 | ~$26/mo | ~$260/mo |
| Sentry | $0 | $0 (developer) | $26/mo (team) |

---

## AI COST MODEL

```
Target:     $0.50/user/month hard ceiling
Sonnet:     ~$0.003/query (1K in, 1K out)
Haiku:      ~$0.0003/query (classifier)
Voyage:     ~$0.0001/embedding
Free tier:  10 queries × $0.003 = $0.03/user/month
Pro tier:   ~50 queries × $0.003 = $0.15/user/month avg
```

---

## BUILD COSTS (this session)

No costs yet — v0.0.0 is infrastructure only, no API calls.
