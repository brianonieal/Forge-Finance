# COMPONENT_REGISTRY.md
# Forge Finance | Built Component Registry
# Blueprint v10
# Every component must be registered here after build

---

## REGISTRY

No components built yet. First components at v0.1.0 (Scaffold).

---

## EXPECTED COMPONENTS (from FRONTEND_SPEC.md)

### Global (v0.1.0)
- [ ] NavigationSidebar
- [ ] MobileBottomTabBar
- [ ] Toast
- [ ] PeriodSelector
- [ ] MetricCard
- [ ] SkeletonScreen
- [ ] ErrorState

### Screen Components (v0.3.0+)
Components will be registered as each gate delivers them.

---

## FORMAT

When registering a component:
```
### ComponentName
Gate: vX.X.X
Path: src/components/[path]
Props: [list]
Variants: [list]
Tests: [test file path]
Spec match: YES / DRIFT [what]
```
