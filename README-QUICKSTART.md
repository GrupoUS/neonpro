# NeonPro MVP — Quickstart

This guide helps you run the MVP locally and deploy to staging.

## Requirements

- Node 20+, pnpm 9
- (Optional) Bun for faster tests
- Supabase project (empty)
- Vercel account

## Setup

```bash
pnpm install --frozen-lockfile --prefer-offline
cp .env.example.monorepo .env
# Fill all variables per comments
```

## Develop

```bash
pnpm dev
```

## Validate

```bash
npx dprint check
npx oxlint .
pnpm run type-check
pnpm vitest run --project unit --reporter=verbose
```

## Deploy to staging

- Connect repo to Vercel
- Set env vars for web/api with Supabase keys
- Trigger deploy from main branch

## Troubleshooting

- If type-check fails, run: `pnpm run type-check` and inspect errors
- For env issues, re-check `.env.example.monorepo`
- See `docs/production-deployment-guide.md` for details
