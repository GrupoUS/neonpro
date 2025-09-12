# NeonPro Shared UI Architecture (apps/web/src/components)

This document captures the simplified, KISS/YAGNI-first organization of `apps/web/src/components` after consolidation.

## Goals
- Mobile-first, WCAG 2.2 AA, brand-consistent UI
- Fewer folders, clear imports, easy routing
- Prefer shared primitives in `@neonpro/ui`; keep app-specific pieces locally

## Source Tree (current)
```
apps/web/src/components/
├─ atoms/                # Leaf UI pieces (inputs, buttons, labels)
├─ molecules/            # Small compositions (card, alert, table)
├─ organisms/            # Feature composites (dashboards, panels)
├─ ui/                   # Advanced/compat pieces (ai-chat, sidebar, effects)
├─ auth/                 # Auth-only UI widgets
├─ error-pages/          # ErrorBoundary, 404/500 views
├─ theme-provider.tsx    # Bridge to @neonpro/ui theme
├─ ConsentBanner.tsx     # LGPD consent
├─ index.ts              # App-level barrel (safe re-exports)
└─ README.md             # Local notes
```

Notes:
- Demo/legacy examples were moved out or removed. No export of demo barrels.
- Sidebar is canonical at `ui/sidebar.tsx`. Avoid re-exporting it from the top barrel to prevent symbol clashes.
- AI chat lives under `ui/ai-chat/` with a compact public surface.

## Import Patterns
- App components: `import { Card, Table } from '@/components'`
- Specific UI: `import { Toaster } from '@/components/ui'`
- Shared kit (brand/theme/buttons): `import { Button, themeCss } from '@neonpro/ui'`
- Theme bridge: `import { ThemeProviderBridge, useThemeBridge } from '@neonpro/ui/theme'`

## TypeScript & Build Hygiene
- Type-check: `pnpm --filter @neonpro/web type-check` → clean
- Lint: `pnpm --filter @neonpro/web lint` → no errors (warnings allowed)
- Tests: `pnpm --filter @neonpro/web test` → all passing
- Excludes: demos/examples are excluded from type-checking to avoid noise

## Decisions
- KISS/YAGNI: only export what routes actually use.
- Consolidated duplicate sidebars; use one canonical `ui/sidebar.tsx`.
- Removed/relocated demos (bento-grid/aceternity/etc.) from public API.
- Replaced custom buttons with `@neonpro/ui` variants.
- Unified theme via `ThemeProviderBridge` from `@neonpro/ui`.

## Accessibility & Performance
- Touch targets ≥44px, keyboard navigation complete
- WCAG 2.2 AA contrast and focus indicators
- Smooth transitions; avoid layout shift (CLS ≤ 0.1)
- Mobile LCP ≤ 2.5s, INP ≤ 200ms targets

## Maintenance Rules
- Prefer atoms/molecules for reusable primitives; consider upstreaming to `packages/ui`.
- Keep organisms feature-specific; avoid leaking them to the global barrel unless needed.
- When adding a new component, add it where it belongs in the atomic tree; update only the minimal barrel.
- Avoid demo exports. For experiments, place under a local `_sandbox` not included in barrels.

## Migration Tips
- If you still import from removed demo paths, switch to `@neonpro/ui` or local atoms/molecules.
- For Sidebar usage, import from `@/components/ui/sidebar` directly to avoid name collisions.

## Compliance & Privacy
- LGPD consent is handled by `ConsentBanner.tsx`. Keep it lightweight and localized (pt-BR first).
- Avoid logging PII; follow `docs/rules/coding-standards.md` privacy guidance.

## Verification
Last verified:
- Build: Vite build ok
- Type-check: clean
- Tests: 79/79 passing
- Lint: 0 errors, minor warnings only

