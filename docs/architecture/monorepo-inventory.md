---
title: Monorepo Inventory — NeonPro MVP
last_updated: 2025-09-06
form: reference
tags: [inventory, turborepo]
related:
  - ./source-tree.md
  - ../features/bmad-brownfield-mvp-plan.md
---

# Monorepo Inventory — NeonPro MVP

## Apps

- apps/web: Next.js 15 (App Router). Depends on: @neonpro/ui, @neonpro/shared, @neonpro/database, @neonpro/types.
- apps/api: Hono + Node/Vercel. Depends on: @neonpro/shared, @neonpro/database, @neonpro/security, @neonpro/types.

## Packages

- @neonpro/types: tipos compartilhados.
- @neonpro/ui: shadcn/ui v4 + componentes saúde.
- @neonpro/database: Prisma + Supabase; migrations/seed.
- @neonpro/core-services: serviços (scheduling, patient, billing...).
- @neonpro/security: auth/JWT, MFA, LGPD utils.
- @neonpro/shared: schemas Zod, API client, hooks.
- @neonpro/utils: utilidades (datas BR, CPF/CNPJ, zod helpers).
- @neonpro/config: configs TS compartilhadas.

## Cross-deps (principais)

- web → ui, shared, database, types
- api → shared, database, security, types
- core-services → database, utils
- shared → database

## Build/Test Scripts (root)

- Qualidade: `bun run type-check`, `bun run lint:fix`, `bun run format`
- Testes: `bun run test:unit:bun`, `bun run test:integration`
- Deploy (Vercel): `deploy:web:preview`, `deploy:api:preview`, `deploy:staging`

## Happy Path MVP

1. Auth básica → 2) Paciente CRUD (LGPD) → 3) Agendamento simples → 4) Health-check.

## Riscos/Áreas frágeis

- Env/segredos incorretos quebram build/deploy.
- Integrações externas (WhatsApp/AI) OFF por padrão.
