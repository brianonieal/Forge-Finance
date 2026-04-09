# CONTRACT.md
# Forge Finance | Configuration Contract
# Blueprint v10
# All config values in one place — single source of truth

---

## APP IDENTITY

```
app_name:        Forge Finance
tagline:         "Your finances, explained by AI."
version:         0.0.0
gate:            Foundation
```

---

## DEPLOYMENT

```
frontend_host:   Vercel
frontend_url:    [TBD — set at first deploy]
backend_host:    Render (free tier)
backend_url:     [TBD — set at first deploy]
database_host:   Supabase
database_name:   forge-finance
```

---

## PORTS (local dev)

```
frontend:        3000
backend:         8000
database:        5432 (Supabase remote)
```

---

## AUTH

```
provider:        Supabase Auth
methods:         Google OAuth, Magic Link
session:         JWT (Supabase managed)
```

---

## AI

```
primary_model:   claude-sonnet-4-6
classifier:      claude-haiku-4-5
embeddings:      voyage-finance-2
embedding_dim:   1024
cost_ceiling:    $0.50/user/month
free_tier_limit: 10 queries/month
router:          LiteLLM
orchestrator:    LangGraph
```

---

## BILLING

```
provider:        Stripe
free_tier:       1 account, 90-day history, 10 AI queries/month
pro_tier:        $9/month or $90/year (save $18)
pro_features:    unlimited accounts, full history, unlimited AI, reports, investments
```

---

## PLAID

```
env:             sandbox (production at v5.0.0)
products:        transactions, auth
country_codes:   US
sync_primary:    webhooks
sync_fallback:   daily cron
```

---

## DESIGN

```
theme:           Bloomberg-inspired dark mode
font_ui:         Inter
font_money:      JetBrains Mono (tabular-nums)
primary_color:   #2E6DB4
accent_color:    #C8A855
gain_color:      #00C48C
loss_color:      #FF4D4D
```
