# PERFORMANCE.md
# Forge Finance | Performance Budgets & Audit Log
# Blueprint v10

---

## LAST AUDIT

No audit yet. First audit at v0.5.0 (Dashboard).

---

## PERFORMANCE BUDGETS

### Frontend
```
LCP:              < 2.5s
FID:              < 100ms
CLS:              < 0.1
Bundle size:      < 200KB (initial JS)
Lighthouse:       90+ (target from v4.0.0)
```

### Backend
```
/health:          < 50ms
API p50:          < 200ms
API p95:          < 500ms
API p99:          < 1000ms
DB query:         < 50ms (simple), < 200ms (with joins)
```

### AI Pipeline
```
@ORACLE response: < 5s (first token)
@ORACLE total:    < 15s (full response)
Embedding:        < 500ms per transaction
Classification:   < 1s (Haiku routing)
```

---

## OPTIMIZATION NOTES

None yet — will be populated as gates progress.
