# NeonPro Universal Theme Toggle

This document describes the universal dark/light theme system for the NeonPro monorepo.

## Overview

- Tailwind `darkMode: 'class'` with CSS variables in `apps/web/src/index.css`.
- Theme state managed by a local `ThemeProvider` in `apps/web/src/components/theme-provider.tsx`.
- Shared bridge and animated toggler in `@neonpro/ui` to enable usage from shared packages.
- Accessible, keyboard navigable, WCAG 2.1 AA compliant.

## Install / Enable

Environment flag:

- Set `VITE_ENABLE_THEME_TOGGLE=true` (default true when unset). Set to `false` to hide the toggler.

## Usage

Wrap router in ThemeProvider (already wired in `apps/web/src/main.tsx`):

```tsx
import { ThemeProvider } from './components/theme-provider';

<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
  <RouterProvider router={router} />
</ThemeProvider>
```

Place the toggler in a header/nav (already added in sidebar header):

```tsx
import { AnimatedThemeToggler as ThemeToggleButton } from '@neonpro/ui';

<TeamToggleButton />
```

## Shared Bridge

- `packages/ui/src/theme/ThemeContext.tsx` exposes `ThemeProviderBridge` and `useThemeBridge()`.
- Web app provides `ThemeProvider` which wraps children with the bridge value (theme, resolvedTheme, setTheme).

## Persistence

- `localStorage` key `neonpro-theme` stores `light|dark|system`.
- `system` uses `prefers-color-scheme` and updates on changes.

## Accessibility

- Toggler has `aria-label` and `sr-only` label, keyboard focus styles, 44px touch target.
- Colors meet WCAG contrast targets configured in `index.css`.

## Testing

- Run build smoke: `pnpm --filter @neonpro/web build`.
- Run tests: `pnpm --filter @neonpro/web test`.

## Notes

- If you add other apps, reuse `ThemeProvider` pattern and import `AnimatedThemeToggler` from `@neonpro/ui`.
