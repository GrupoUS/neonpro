# Shared UI Architecture (Monorepo)

Decision: Place generic shadcn/ui-based primitives and shared composites in `packages/ui/src`. Keep app-specific/route-bound components in `apps/web/src/components`.

Why
- Aligns with shadcn/ui monorepo guidance: components in a shared `ui` workspace package for reuse
- Turborepo caching + Vite HMR works well with alias to package `src`
- Easier multi-app reuse (future apps consume `@neonpro/ui`)
- Clear boundaries: no app imports from packages

Key Setup
- Vite alias (web): `@neonpro/ui -> ../../packages/ui/src` (already configured)
- Tailwind scanning (root): include `./apps/**/*` and `./packages/**/*` (configured)
- Peer deps in UI: react, react-dom; Tailwind stays at app level

What goes where
- `packages/ui/src`: primitives (button, input, label), utilities (`cn`), tokens/theme bridges, generic composites
- `apps/web/src/components`: atoms/molecules/organisms (app-specific), feature views, layout shells, demos

Imports
- Shared: `import { KokonutGradientButton } from '@neonpro/ui'`
- App: `import { Card } from '@/components/molecules'`

Notes
- Keep `apps/web/src/components/ui/index.ts` as compatibility barrel re-exporting atoms/molecules where needed
- Prefer CSS variables + tokens for theming; avoid shipping Tailwind config in packages

Updates (2025-09-12)
- MagicCard now includes ShineBorder effect; `shine-border.tsx` archived. Use `MagicCard` from `apps/web/src/components/ui/magic-card.tsx`.
- Theme provider bridge import path: import from `@neonpro/ui/theme` (not the top-level package).
- Adjusted tests: AuthForm forgot flow is triggered via "Esqueceu sua senha?" button, not a Tab.

References
- shadcn/ui Monorepo: https://ui.shadcn.com/docs/monorepo
- Turborepo + shadcn guide: https://turborepo.com/docs/guides/tools/shadcn-ui
