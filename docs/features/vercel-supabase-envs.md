# Vercel + Supabase envs and deploy

This project deploys apps/web to Vercel and uses Supabase for auth/data. These are the required envs and the safe deploy steps.

## Required environment variables (apps/web)

Public (exposed to browser):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Server-only (if used by server actions/edge functions):
- SUPABASE_SERVICE_ROLE (never expose to client)

Optional (feature flags / analytics):
- NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY, etc.

## Set variables in Vercel (CLI)

Preview (PRs):
```bash
vercel env set NEXT_PUBLIC_SUPABASE_URL https://YOUR.supabase.co --environment=preview
vercel env set NEXT_PUBLIC_SUPABASE_ANON_KEY YOUR-ANON-KEY --environment=preview
```

Production:
```bash
vercel env set NEXT_PUBLIC_SUPABASE_URL https://YOUR.supabase.co --environment=production
vercel env set NEXT_PUBLIC_SUPABASE_ANON_KEY YOUR-ANON-KEY --environment=production
```

Import from .env.local (optional):
```bash
vercel env pull .env.local
vercel env push
```

## Deploy flow (CLI)

```bash
pnpm dlx vercel --version
pnpm dlx vercel link --yes --local-config vercel-turbo.json
pnpm dlx vercel deploy --yes --local-config vercel-turbo.json   # preview
# When ready:
pnpm dlx vercel deploy --prod --yes --local-config vercel-turbo.json
```

## Troubleshooting

- ESM import resolution on Vercel: use explicit file extensions for local paths (e.g., `@/lib/utils.ts`) or ensure exports from an index.ts barrel.
- Invalid API key on Patients dashboard: confirm NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set for the current environment (preview/prod). Do not fall back to test keys in production builds.
- Realtime updates not appearing: verify Supabase Realtime is enabled for the table, RLS policies allow live query for the current role, and the client subscribes to the correct channel.

## Quick local checks

```bash
pnpm --filter @neonpro/web type-check
pnpm --filter @neonpro/web lint
pnpm --filter @neonpro/web test
pnpm --filter @neonpro/web build
```