---
title: Staging Deploy Runbook + Smoke Tests
last_updated: 2025-09-06
form: how-to
tags: [deployment, staging, vercel, supabase]
related:
  - ./bmad-brownfield-mvp-plan.md
  - ../production-deployment-guide.md
---

# Staging Deploy Runbook + Smoke Tests

## Prerequisites

- Vercel project linked to repo (apps/web and apps/api)
- Supabase project provisioned (no prod data)
- Map env vars from `/.env.example.monorepo`

## Validate locally

```bash
pnpm install --frozen-lockfile --prefer-offline
npx dprint check
npx oxlint .
pnpm vitest run --project unit --reporter=verbose
pnpm run type-check
```

## Deploy

- Push main branch or use Vercel Deploy (apps/web + apps/api)
- Confirm build logs show Next.js 15 and Hono routes

## Smoke Tests (staging)

- Auth: load /login, perform mock login -> see dashboard
- Patients: create, update, delete; verify LGPD consent prompts
- UI: button, card, form render and accessible (keyboard nav)
- Health: /api/health (200) and web status page loads

## Rollback

- Use Vercel to revert to previous deploy if smoke fails
- Disable external integrations via env flags (NEXT_PUBLIC_ENABLE_WHATSAPP=false)

## Notes

- Compliance testers are mock-based in MVP; label features accordingly
- RLS checks run as simulated tests; real DB policies validated post-MVP
