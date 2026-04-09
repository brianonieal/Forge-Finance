# COMPONENT_REGISTRY.md
# Forge Finance | Built Component Registry
# Blueprint v10
# Every component must be registered here after build

---

## REGISTRY

### NavigationSidebar
Gate: v0.1.0
Path: src/components/layout/navigation-sidebar.tsx
Props: none (uses usePathname + useUIStore)
Variants: expanded (240px), collapsed (60px icon-rail)
Tests: none yet
Spec match: YES

### MobileBottomTabBar
Gate: v0.1.0
Path: src/components/layout/mobile-bottom-tab-bar.tsx
Props: none (uses usePathname)
Variants: 5 tabs (Dashboard, Accounts, Chat, Budgets, Settings)
Tests: none yet
Spec match: YES

### Toast / ToastProvider
Gate: v0.1.0
Path: src/components/ui/toast.tsx
Props: type ('success'|'error'|'warning'|'info'), title, description?
Variants: 4 types with color-coded borders and icons
Tests: none yet
Spec match: YES

### SkeletonScreen
Gate: v0.1.0
Path: src/components/ui/skeleton.tsx
Props: variant ('metric-card'|'table-row'|'full-page'|'chart'), count?
Variants: 4 skeleton layouts
Tests: none yet
Spec match: YES

### ErrorState
Gate: v0.1.0
Path: src/components/ui/error-state.tsx
Props: type ('full-page'|'inline'), title, message, onRetry?
Variants: full-page (centered), inline (compact row)
Tests: none yet
Spec match: YES

### NetworkOfflineBanner
Gate: v0.1.0
Path: src/components/ui/error-state.tsx
Props: none
Variants: single amber banner
Tests: none yet
Spec match: YES

### PeriodSelector
Gate: v0.1.0
Path: src/components/ui/period-selector.tsx
Props: none (uses useUIStore)
Variants: 7 periods (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
Tests: none yet
Spec match: YES

### MetricCard
Gate: v0.1.0
Path: src/components/ui/metric-card.tsx
Props: label, value, delta?, deltaType? ('gain'|'loss'|'neutral')
Variants: with/without delta, gain/loss/neutral
Tests: none yet
Spec match: YES

---

## EXPECTED COMPONENTS (remaining)

### Screen Components (v0.3.0+)
Components will be registered as each gate delivers them.
