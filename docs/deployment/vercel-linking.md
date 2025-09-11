# Vercel Project Linking (grupous-projects/neonpro)

Target: https://vercel.com/grupous-projects/neonpro
Production URL: https://neonpro.vercel.app

## One-time setup (CLI)

Ensure you are logged in to the correct Vercel account that has access to the `grupous-projects` org.

```bash
# Login
vercel login

# Link this repo to the correct project/org
pnpm run vercel:link

# Pull production envs locally (optional)
pnpm run vercel:env:pull
```

## Deploy

```bash
# Production deploy (uses linked project)
pnpm run vercel:deploy
```

## URL resolution in-app

The helper `getSiteUrl()` resolves the canonical site URL safely:
- Browser origin when available
- `VERCEL_URL` (Vercel runtime) when present
- `VITE_SITE_URL` / `SITE_URL` as explicit override
- Fallback to `https://neonpro.vercel.app` in production, `http://localhost:5173` in dev

Path: `apps/web/src/lib/site-url.ts`

## Notes
- Root `vercel.json` is the source of truth for the monorepo deployment.
- Consider removing `apps/web/vercel.json` to avoid conflicting rewrites; the root config already routes SPA correctly.
- Ensure Supabase auth redirect URIs include:
  - `https://neonpro.vercel.app/auth/callback`
  - `https://neonpro.vercel.app/auth/confirm`
  - Local dev: `http://localhost:5173/auth/callback`, `http://localhost:5173/auth/confirm`
