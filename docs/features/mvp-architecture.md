---
title: MVP Architecture — NeonPro
last_updated: 2025-09-08
form: explanation
tags: [architecture, mvp]
related:
  - ../architecture/source-tree.md
---

← [Back to Docs Orchestrator](../README.md)

# MVP Architecture — NeonPro

## Components

- Web (Next.js 15 App Router): Auth, Patient CRUD, Scheduling UI, Status
- API (Hono): Auth/session, Patient & Scheduling endpoints, Health
- Database (Supabase Postgres + Prisma): core tables, minimal RLS
- Packages: `@neonpro/ui`, `@neonpro/shared`, `@neonpro/database`, `@neonpro/types`

## Data Flow (Happy Path)

Web → API (JWT) → Prisma → Supabase

## Security

- RLS basic on patient/scheduling (staging validation)
- Secrets via Vercel env; NEXT_PUBLIC only for public keys

## Observability

- Minimal logs (request id), health endpoint, smoke e2e in staging

## Trade-offs

- Integrations OFF to de-risk
- Mock analytics; focus on core flows
