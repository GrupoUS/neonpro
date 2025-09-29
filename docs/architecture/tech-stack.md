# NeonPro Technology Stack (Updated)
**Last Updated**: 2025-09-29
**Status**: ✅ Simplified & Realtime-Ready

This document specifies **WHICH technologies NeonPro uses and WHY**, after the simplification plan. It replaces Prisma with **Supabase clients + SQL/Policies**, keeps **CopilotKit** and **AG‑UI Protocol**, and optimizes for **Edge-first** performance.

---

## Technology Selection Principles
- **KISS**: simplest viable components
- **Type Safety**: end‑to‑end TypeScript
- **Edge‑first**: low latency reads at the edge; Node runtime only when strictly needed
- **Realtime by Design**: Supabase Postgres Changes + TanStack Query cache patching
- **Single Source of Truth**: Zod for runtime validation; shared types from Supabase

---

## Stack Overview

### Monorepo & Tooling
- **Turborepo** — task orchestration & caching
- **Bun (primary)** + **PNPM (fallback)** — fast installs & scripts
- **TypeScript (strict)** — shared types across apps/packages

### Frontend - APPS/WEB
- **Vite + React 19**
- **TanStack Router (file‑based)** — type‑safe routes, loaders
- **TanStack Query v5** — server state + realtime cache updates
- **Tailwind + shadcn/ui** — accessible, consistent UI
- **CopilotKit** — chatbot provider/actions in the browser
- **AG‑UI Protocol** — structured Agent↔UI event stream

### Backend - APPS/API
- **Hono** (Edge‑first) hosting **tRPC v11** procedures
  - **Edge runtime** for read‑heavy, side‑effect‑free endpoints
  - **Node runtime** only for sensitive operations (service_role, webhooks, cron)

### Data
- **Supabase (Postgres + Auth + Realtime + RLS)**
  - Postgres Changes → client subscriptions
  - Auth JWT carries `clinic_id` & `role` for RLS
  - SQL migrations, policies, functions via Supabase CLI
  - Direct `@supabase/supabase-js` clients

### Validation & Types
- **Zod** as the single runtime validation layer (DTOs/contracts)
- **Generated DB types** via `supabase gen types` published to `@neonpro/types`

### Testing & Quality
- **Vitest** (unit/integration), **Playwright** (smoke/E2E)
- **Oxlint** + **dprint**
- **Sentry** (optional), **Vercel Analytics**

### Deployment
- **Vercel**
  - Edge Functions for reads
  - Node Functions for service_role endpoints
  - Region: **gru1 (São Paulo)** preferred

---

## Key Decisions & Rationale

### 1) Supabase over Prisma
- **Why**: Realtime + Auth + RLS out‑of‑the‑box; simpler mental model; Edge‑friendly
- **How**: SQL migrations & policies; use `supabase-js` clients; types generated to `@neonpro/types`

### 2) Hono + tRPC v11 (Edge)
- **Why**: ultra‑fast, fetch‑native; tRPC gives E2E type safety without GraphQL overhead
- **Pattern**: CRUD reads can be direct Supabase; business rules/side‑effects via tRPC

### 3) Realtime = First‑class
- **Supabase Postgres Changes** channels subscribed in the web app
- On events → **`queryClient.setQueryData`** or **`invalidateQueries`** (TanStack Query v5)
- Optimistic updates with rollback on mutation error

### 4) CopilotKit + AG‑UI kept as First‑Class
- **CopilotKit** in `apps/web` (provider + actions + tool calls)
- **AG‑UI Protocol** messages wired in `apps/api` (Hono/tRPC) for tool execution & UI patches

---

## Versions (target)
- React **19.x**
- TanStack Router **latest stable**
- TanStack Query **v5.x**
- Vite **7.x**
- Hono **4.x**
- tRPC **11.x**
- Supabase JS **2.x**
- TypeScript **5.9+**
- Zod **4.x**
- Vitest **3.x**, Playwright **1.4x**

---

## Performance & SLOs
- **Edge read TTFB** < 150ms (P95)
- **Realtime UI patch** < 1.5s (P95) across two clients
- **Cold dev start** < 2s (Vite)

---

## Security & Compliance
- RLS policies enforce **tenant isolation** by `clinic_id`
- **service_role** key used **only** in Node runtime endpoints
- LGPD audit events on sensitive mutations (tRPC middleware)

---

## Migration Notes
- Freeze Prisma usage; replace gradually with Supabase helpers
- Generate types → publish to `@neonpro/types`
- Turn on Realtime for `appointments`, `messages`, `leads`
- Introduce Zod DTOs for tRPC inputs; remove Valibot in green paths

---

## References
- Apps: `apps/web`, `apps/api`
- Packages: `@neonpro/ui`, `@neonpro/types`, `@neonpro/agents`, `@neonpro/config`, `@neonpro/database`
- Realtime helpers live in `apps/web/src/hooks/realtime/` (see Source Tree document)
