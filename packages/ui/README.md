# @neonpro/ui

Shared UI kit for NeonPro apps (Vite + React 19 + Tailwind).

Guidelines

- Keep generic, app-agnostic primitives and composites here (buttons, inputs, cards, themes)
- App-specific or route-tied components stay in `apps/web/src/components`
- Expose components via `src/index.ts` with type-safe exports
- Treat Tailwind as peer in apps; no Tailwind dependency here

Usage

- Import directly via alias (vite): `@neonpro/ui`
- Ensure Tailwind scans packages in monorepo (root `tailwind.config.cjs` includes `./packages/**/*`)
- Include any CSS tokens at app level (globals.css) and wrap with theme provider as needed

Dev tips

- Keep peerDependencies: react, react-dom
- Avoid importing app code from packages
- Prefer CSS variables and Radix themes for theming
