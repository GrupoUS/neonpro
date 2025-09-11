# Login UI Fix — NeonPro

Date: 2025-09-11

## Overview
- Restored Tailwind + shadcn/ui styling on the login page.
- Ensured `cn` helper exists and shadcn Button uses variants.
- Added Playwright smoke test for deployed login page.

## Files Changed
- `apps/web/src/components/ui/button.tsx` — Replaced with shadcn/ui variant-based implementation.
- `apps/web/e2e/login-page.spec.ts` — New e2e smoke test to validate UI and capture screenshot/console.
- `apps/web/tailwind.config.js` → moved to `tailwind.config.js.bak` to avoid duplicate with `tailwind.config.ts`.
- `apps/web/src/components/auth/LoginForm.tsx` — Minor catch block cleanup (no unused vars).

## Notes
- Tailwind config source of truth: `apps/web/tailwind.config.ts`.
- `@/lib/utils.ts` provides `cn` (clsx + tailwind-merge).
- Run local checks:

```bash
cd apps/web
pnpm install
pnpm type-check
pnpm build
pnpm e2e # requires Playwright browsers installed: npx playwright install
```

## Next Steps
- Optionally add data-testids for more robust e2e assertions.
- Expand accessibility checks (axe) on login form.
