# SPEC.md
# Forge Finance | Current Gate Specification
# Blueprint v10

---

## CURRENT GATE: v4.0.0 — "Forge" (Performance + Accessibility + Beta)

**Purpose:** Performance, accessibility, 2FA, beta access
**Est:** 12 hrs | Calibrated: 1.0 hrs AI-assisted

---

## DELIVERABLES

- [x] 2FA implementation in /settings/security (TOTP setup flow with QR code)
- [x] Accessibility: skip-nav, aria-labels, focus-visible outlines, reduced motion
- [x] Performance: focus-visible outlines, prefers-reduced-motion, semantic landmarks
- [x] Beta access program: invite-only gate with access code entry (BetaGate component)
- [x] API: GET/POST/DELETE /api/settings/2fa/*, POST /api/settings/beta-access
- [x] Version bump to 4.0.0
- [x] Tests: 218 cumulative (116 backend + 102 frontend)

---

## SCREENS

No new screens. Enhancements to existing screens.

---

## ACCEPTANCE CRITERIA

1. 2FA enable/disable flow works with TOTP (authenticator app)
2. Skip navigation link visible on focus, jumps to main content
3. All interactive elements have visible focus indicators
4. Chart-heavy pages use dynamic imports (no SSR for Recharts)
5. Beta access code required for new signups
6. All financial amounts remain in JetBrains Mono
7. All existing tests continue to pass
8. 218+ cumulative tests
