# INFRASTRUCTURE.md
# Forge Finance | CI/CD & Infrastructure
# Blueprint v10

---

## CI/CD

### GitHub Actions
```
Workflow: .github/workflows/ci.yml
Triggers: push to main, pull requests
Steps:
  1. Frontend: install → lint → build
  2. Backend: install → lint → test
```

### Deployment
```
Frontend:  Vercel (auto-deploy on push to main)
Backend:   Render (auto-deploy on push to main)
Database:  Supabase (managed)
```

---

## ENVIRONMENTS

| Env | Frontend | Backend | Database |
|-----|----------|---------|----------|
| Local | localhost:3000 | localhost:8000 | Supabase (remote) |
| Staging | TBD | TBD | Supabase staging |
| Production | TBD | TBD | Supabase production |

---

## MONITORING

```
Error tracking:  Sentry (from v1.0.0)
Uptime:          TBD
Logging:         Render logs (backend), Vercel logs (frontend)
```
