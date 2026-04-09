# DESIGN_SYSTEM.md
# Forge Finance | Design System
# Source: Forge_Finance_app_spec.pdf | April 2026
# Blueprint v10
# Phase 1 gate: complete before any UI component is written

---

## PHILOSOPHY

Bloomberg-inspired, data-dense, professional.
Dark mode default. Every pixel communicates trust, precision, and control.
No decoration that doesn't carry meaning.
Financial data is the hero -- the UI frames it, never competes with it.

---

## PHASE 1 GATE

- [ ] All CSS custom properties defined in globals.css
- [ ] JetBrains Mono loaded and configured (tabular-nums, font-feature-settings: "tnum")
- [ ] Inter loaded and configured
- [ ] Dark mode active by default
- [ ] Tailwind config extended with all design tokens
- [ ] Financial display rules documented and enforced in components

Mark complete: "- [x] Phase 1 complete"

---

## COLOR PALETTE

### Dark Mode (default)

```css
/* In globals.css as CSS custom properties */

/* Backgrounds */
--color-bg-base:     #0A0E1A;  /* Page background -- deep navy */
--color-bg-surface:  #0F1629;  /* Card surfaces */
--color-bg-elevated: #1A2035;  /* Modals / elevated */
--color-bg-overlay:  rgba(255,255,255,0.05); /* Hover states */

/* Brand */
--color-brand-primary: #2E6DB4;  /* Blue -- primary actions */
--color-brand-accent:  #C8A855;  /* Gold -- accents */

/* Financial */
--color-gain:  #00C48C;  /* Teal-green -- gains, positive */
--color-loss:  #FF4D4D;  /* Red -- losses, negative */

/* Text */
--color-text-primary:   #E8EDF5;
--color-text-secondary: #8B96A8;

/* Borders */
--color-border: rgba(255,255,255,0.08);
```

### Light Mode (secondary -- sidebar stays dark)

```css
--color-bg-base:     #F4F6FA;
--color-bg-surface:  #FFFFFF;
--color-bg-elevated: #FFFFFF;
--color-text-primary:   #0A0E1A;
--color-text-secondary: #5A6478;
/* Brand colors unchanged in light mode */
/* Sidebar background always uses dark mode colors regardless of theme */
```

### Semantic aliases (use these in components)

```
bg-base      → page background
bg-surface   → cards, panels
bg-elevated  → modals, dropdowns, tooltips
bg-overlay   → hover state background
text-primary → primary content
text-secondary → labels, captions, metadata
gain-green   → positive amounts, up arrows
loss-red     → negative amounts, down arrows
brand-primary → CTAs, active states, links
brand-accent  → pro badge, highlights, gold accents
```

---

## TYPOGRAPHY

### Fonts

```
UI text:       Inter (Google Fonts)
               font-family: 'Inter', sans-serif

Financial:     JetBrains Mono (Google Fonts)
               font-family: 'JetBrains Mono', monospace
               font-feature-settings: "tnum"  /* tabular numbers */
               font-variant-numeric: tabular-nums
```

### CRITICAL RULE: JetBrains Mono is mandatory for:
- All dollar amounts (positive and negative)
- All percentage changes
- All ticker symbols
- All account numbers
- All financial figures of any kind
- Balance displays
- P&L numbers

This rule has no exceptions. Every dollar sign in the app uses JetBrains Mono.

### Type scale

```
text-xs:    12px / 0.75rem
text-sm:    14px / 0.875rem
text-base:  16px / 1rem
text-lg:    18px / 1.125rem
text-xl:    20px / 1.25rem
text-2xl:   24px / 1.5rem
text-3xl:   30px / 1.875rem
text-4xl:   36px / 2.25rem
```

---

## SPACING

Base unit: 4px
All spacing uses multiples of 4:
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

---

## BORDER RADIUS

```
rounded-sm:  4px
rounded-md:  6px
rounded-lg:  8px
rounded-xl:  12px
rounded-2xl: 16px
```

---

## GRID

12-column CSS grid
Gap: 16px
Responsive breakpoints:
  sm:  640px
  md:  768px
  lg:  1024px
  xl:  1280px

---

## FINANCIAL DISPLAY RULES (enforce in every component)

1. Always show BOTH dollar amount AND percent change -- never just one
2. Negative amounts: red with parentheses e.g. ($150.00)
3. Gains: teal-green (#00C48C) with up arrow (▲)
4. Losses: red (#FF4D4D) with down arrow (▼)
5. Zero change: neutral gray, no arrow, show "—"
6. All color-coded indicators MUST have a secondary indicator (arrow or sign)
   for color-blind accessibility -- color alone is never the only signal
7. WCAG 2.1 AA minimum everywhere, AAA for critical financial data
8. Always use JetBrains Mono for any financial number

---

## GLOBAL COMPONENTS

### Navigation Sidebar (Desktop)
- Fixed left, 240px wide
- Collapses to 60px icon-only rail on mobile (below 768px), labels as tooltips
- Top: Forge Finance logo (clickable, routes to /dashboard)
- Nav items: 40px height, icon (20px) + label, 12px horizontal padding
- Active state: left 3px border (--color-brand-primary), bg (--color-bg-overlay)
- Hover: bg (--color-bg-overlay), 150ms ease transition
- Bottom section: settings icon, user avatar + name, logout
- Version-gated items: grayed/locked with "Coming in [version]" tooltip

### Mobile Bottom Tab Bar
- Fixed bottom, 5 core tabs: Dashboard, Accounts, Chat, Budgets, Settings
- Active tab: brand primary icon + label
- Inactive: secondary text color
- FAB (Floating Action Button): quick actions -- add transaction, start chat

### Notification Toast System
- Position: top-right, 16px from edges
- Max 3 visible stacked
- Types:
  - success: green, 4s auto-dismiss
  - error: red, NO auto-dismiss (requires user action)
  - warning: amber, 6s auto-dismiss
  - info: blue, 4s auto-dismiss
- Anatomy: icon + title + optional description + close X + progress bar

### Error States
- Full page: centered alert icon (48px), error title, message, retry + go to dashboard buttons
- Inline widget: replaces content, 24px alert icon, short message, retry link
- Network offline: full-width amber banner at top of page

### Loading States
- NEVER use spinners for initial page loads -- always use skeleton screens
- Skeleton screens match exact layout shapes of real content
- Metric card skeleton: 180px wide block (mimics number), 120px block below (mimics delta)
- Table skeleton: alternating row heights matching real data rows

### Period Selector (Global)
- Pill/tab row: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- Active pill: brand primary background
- Sticks to top-right of dashboard on scroll
- Updates ALL charts and metrics simultaneously via TanStack Query cache invalidation

---

## CHARTS (Recharts)

```
AreaChart:      Spending trend, balance history
LineChart:      Balance over time
PieChart:       Spending by category
BarChart:       Budget vs actual
RadialBarChart: Budget health ring
```

Chart defaults:
- Background: transparent (inherits bg-surface from card)
- Grid lines: --color-border (very subtle)
- Tooltips: bg-elevated with rounded-lg
- Gain line/area: gain-green (#00C48C)
- Loss line/area: loss-red (#FF4D4D)
- Brand primary: brand-primary (#2E6DB4)

---

## TAILWIND CONFIG EXTENSION

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-base':      'var(--color-bg-base)',
        'bg-surface':   'var(--color-bg-surface)',
        'bg-elevated':  'var(--color-bg-elevated)',
        'bg-overlay':   'var(--color-bg-overlay)',
        'brand-primary':'var(--color-brand-primary)',
        'brand-accent': 'var(--color-brand-accent)',
        'gain-green':   'var(--color-gain)',
        'loss-red':     'var(--color-loss)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary':'var(--color-text-secondary)',
        'border-color': 'var(--color-border)',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```
