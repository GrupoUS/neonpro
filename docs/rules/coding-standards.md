---
title: "NeonPro Coding Standards — Edge-first, Realtime, AI-aware"
last_updated: 2025-09-29
form: reference
tags: [coding-standards, typescript, react, tanstack, hono, trpc, supabase, zod, ai, accessibility, security]
related:
  - ../architecture/tech-stack.md
  - ../architecture/source-tree.md
  - ../architecture/frontend-architecture.md
  - ../AGENTS.md
---

# NeonPro Coding Standards — Edge-first, Realtime, AI-aware (v4)

## Overview

Authoritative rules and patterns for writing **reliable, secure, and fast** code in NeonPro.
Aligned with the **simplified stack** (Vite + React 19 + TanStack Router/Query v5, Hono + tRPC v11, Supabase Realtime + RLS, Zod) and **AI-first UI** (CopilotKit + AG‑UI).
Outcomes: **Edge TTFB ≤ 150 ms P95**, **Realtime patch ≤ 1.5 s P95**, **≥ 9.5/10 code quality**.

> This document is a **reference**. For step-by-step tasks, see the “How‑to” docs under `docs/`.

---

## Core Principles

- **KISS**: choose the simplest viable solution; remove incidental complexity.
- **YAGNI**: build only what’s needed now; avoid speculative abstractions.
- **Type-Safe by Default**: strict TypeScript end‑to‑end (DB → API → UI).
- **Edge‑first** reads, **Node‑only** secrets/`service_role` (see ADR‑0002).
- **Realtime by Design**: Supabase Postgres Changes → TanStack Query cache patching.
- **AI‑aware UX**: CopilotKit actions and AG‑UI events follow least‑privilege and auditable flows.

---

## Tech‑Stack Alignment (non‑negotiable)

- **Frontend**: Vite + React 19, TanStack Router (file‑based), TanStack Query v5, Tailwind + shadcn/ui.
- **API**: Hono (Edge) hosting **tRPC v11** procedures (business rules & side‑effects).
- **Data**: Supabase (Postgres, Auth, Realtime, **RLS**). No ORM in the critical path.
- **Validation**: **Zod** as the **single** runtime validation layer (DTOs in `@neonpro/types`).

---

## Project Conventions

### Modules & Imports
- Prefer **explicit imports** over namespace imports (tree‑shaking friendly).
- Barrel files (`index.ts`) allowed only at leaf folders to avoid cycles.
- **No circular deps**; `@neonpro/types` is foundational; UI/Agents must not import app code.

### Naming
- Components: `PascalCase`. Hooks/Utils: `camelCase`. Constants: `SCREAMING_SNAKE_CASE`.
- Files: match the default export name (`PatientCard.tsx`, `useRealtimeQuery.ts`).

### Comments & Docs
- Explain the **why**, not the obvious *what*. Reference regulations (LGPD/ANVISA) with links or ADR IDs.
- Exported functions/components **must** have JSDoc with param/returns and side‑effects.

---

## TypeScript Standards (TS ≥ 5.9)

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Prefer **narrow types** for IDs and sensitive fields:
  ```ts
  type ClinicId = string & {{ readonly __brand: 'ClinicId' }}
  type AppointmentId = string & {{ readonly __brand: 'AppointmentId' }}
  ```
- **Discriminated unions** for domain roles; **readonly** where possible.
- Never `any` in public exports. Use `unknown` + narrow with Zod or type guards.
- **DTOs**: define in `@neonpro/types/src/dto/*.zod.ts` and **infer** types from schemas (single source of truth).

---

## React 19 Patterns

- Prefer **function components**; no legacy lifecycles.
- **Suspense** for data boundaries; colocate route‑level loaders with components.
- **Transitions** for non‑urgent updates; **optimistic UI** with rollback on mutation errors.
- Side‑effects live in hooks; keep components declarative.

**Example — optimistic update with rollback**
```tsx
const mutation = useMutation({{
  mutationFn: (input: UpdateDto) => trpc.appointments.update.mutate(input),
  onMutate: async (input) => {{
    await queryClient.cancelQueries({{ queryKey: ['appointments', input.clinicId] }})
    const prev = queryClient.getQueryData<AppointmentList>(['appointments', input.clinicId])
    queryClient.setQueryData(['appointments', input.clinicId], draft => patchAppointment(draft, input))
    return {{ prev }}
  }},
  onError: (_err, input, ctx) => {{
    if (ctx?.prev) queryClient.setQueryData(['appointments', input.clinicId], ctx.prev)
  }},
  onSettled: (_data, _err, input) => {{
    queryClient.invalidateQueries({{ queryKey: ['appointments', input.clinicId] }})
  }},
}})
```

---

## TanStack Router (file‑based) & Query v5

- **Routes** live in `apps/web/src/routes/**`; URLs are **contracts** (no breaking changes).
- Use **loader** for data prefetch; keep keys stable (`['appointments', clinicId]`).
- Query options:
  - `staleTime` tuned per domain (e.g., 10–30s for lists with realtime).
  - `retry` small and bounded (e.g., 1–2) with **network‑only** conditions.
  - Prefer `setQueryData` for **patchable** events; `invalidate` for complex diffs.

**Realtime → cache patching**
```tsx
useSupabaseChannel<DB['public']['Tables']['appointments']['Row']>({{
  table: 'appointments',
  filter: {{ clinic_id: clinicId }},
  onEvent: ({{
    type, new: next, old: prev
  }}) => {{
    queryClient.setQueryData(['appointments', clinicId], current =>
      applyRowEvent(current, {{ type, next, prev }})
    )
  }},
}})
```

---

## API: Hono (Edge) + tRPC v11

- **Edge**: read‑only transforms, no secrets. **Node**: `service_role`, webhooks, schedulers.
- tRPC procedures **must** validate inputs with Zod and return typed outputs.
- Idempotency for webhooks and external callbacks (dedupe keys).

**Procedure skeleton**
```ts
export const appointmentsRouter = t.router({{
  confirm: t.procedure
    .input(ConfirmDto)           // Zod schema from @neonpro/types
    .mutation(async ({{
      input, ctx
    }}) => {{
      // business rule + DB write
      await ctx.db.from('appointments').update({{ status: 'confirmed' }}).eq('id', input.id)
      // side‑effect (Node runtime): enqueue WhatsApp/webhook
      return {{ ok: true as const }}
    }}),
}})
```

---

## Supabase (Postgres, Auth, Realtime, RLS)

- **RLS enabled** on all tenant tables; policies check `clinic_id` from JWT.
- **Clients**:
  - `createAnonClient` for Browser/Edge (no secrets).
  - `createServiceClient` for Node‑only privileged ops.
- **Migrations/Policies/Functions** versioned via Supabase CLI (`packages/database/supabase/**`).
- Turn on **Postgres Changes** for `appointments`, `messages`, `leads`.

**Policy example**
```sql
alter table public.appointments enable row level security;

create policy tenant_can_read on public.appointments
  for select using (clinic_id = auth.jwt() ->> 'clinic_id');

create policy tenant_can_write on public.appointments
  for insert with check (clinic_id = auth.jwt() ->> 'clinic_id')
  , update using (clinic_id = auth.jwt() ->> 'clinic_id');
```

---

## Validation: Zod (single layer)

- **All external inputs** (HTTP, forms, tRPC) must pass through Zod DTOs.
- Do **not** duplicate validation in multiple libs.
- Schemas are shared: define once in `@neonpro/types`, import everywhere.

**DTO example**
```ts
export const ConfirmDto = z.object({{
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
}})
export type ConfirmDto = z.infer<typeof ConfirmDto>
```

---

## AI: CopilotKit + AG‑UI Protocol

- CopilotKit Provider wraps the app; **actions/tools** are declared in `@neonpro/agents`.
- **Read‑only tools** may query Supabase directly (RLS applies).
- **Write tools** must call **tRPC**; include audit metadata (user, clinic, action).
- AG‑UI dispatcher serializes tool‑calls and state patches; UI subscribes to results.

**Tool guideline**
```ts
export const tools = {{
  createAppointment: makeTool({{
    input: CreateAppointmentDto,
    auth: 'user',
    run: async ({{
      input, ctx
    }}) => {{
      return await ctx.trpc.appointments.create.mutate(input) // audited + validated
    }},
  }}),
}}
```

---

## Styling & Accessibility (Tailwind + shadcn/ui)

- WCAG **2.1 AA**: focus rings, contrast, keyboard paths; touch targets ≥ 44 px.
- Use **semantic** components; never hide focus styles.
- Component variants through `cva`; map domain semantics (e.g., `variant="warning|emergency|patient"`).

---

## Testing Standards (Vitest, Playwright, MSW)

- **Unit**: schemas, hooks, utils; ≥ 90% for critical paths.
- **Integration**: tRPC procedures with input/output validation.
- **E2E smoke**: navigation + realtime across two clients.
- **MSW** for network isolation; avoid flakiness with deterministic seeds.

**Realtime smoke checklist**
1. Create appointment on Client A (optimistic).
2. Client B receives INSERT within **≤ 1.5 s**.
3. Confirm on A → webhook mock fired → both UIs patched.

---

## Performance & Observability

- Budgets: **Edge TTFB ≤ 150 ms P95**, **Realtime patch ≤ 1.5 s P95**, **LCP ≤ 2.5 s**.
- Vite:
  - Route‑level code splitting; lazy‑load heavy modals/charts.
  - `manualChunks` for core/admin/vendor when needed.
- Observability: Vercel Analytics (+ Sentry optional). No console warnings in CI.

---

## Security & LGPD

- **Least privilege**: anon client + RLS for reads; Node‑only `service_role` writes.
- Mask sensitive fields by default; explicit user intent to reveal.
- Audit on sensitive mutations (who/when/what).
- Secrets only in Node runtime env; never in Edge bundles.

---

## Accessibility

- Keyboard‑first flows; skip links on dashboard.
- Live regions for realtime updates (ARIA `aria-live="polite|assertive"` as appropriate).
- Provide non‑color cues in alerts (icons, text).

---

## Repository & CI

- **Turborepo order**: `@neonpro/types` → `ui|agents|config|database` → `apps/*`.
- Pre‑commit: typecheck, lint (oxlint), format (dprint), unit tests.
- CI gates: unit/integration + E2E smoke + bundle size guard.
- Block build if `createServiceClient` appears in Edge code (lint rule).

---

## Developer Checklist (Pull Request)

- [ ] Follows KISS/YAGNI; DTOs from Zod; no `any` in exports.
- [ ] Edge/Node split respected; no secrets in Edge.
- [ ] Realtime: cache patch or invalidate implemented.
- [ ] Tests updated; CI green; docs touched if public surface changed.
- [ ] Accessibility verified; performance budgets within targets.

---

## Examples Index

- **Route with loader + guard** → `apps/web/src/routes/appointments/index.tsx`
- **Realtime hook** → `apps/web/src/hooks/realtime/useRealtimeQuery.ts`
- **tRPC router** → `apps/api/src/trpc/routers/appointments.ts`
- **Zod DTOs** → `@neonpro/types/src/dto/*.zod.ts`
- **Copilot actions** → `@neonpro/agents/src/actions/index.ts`

---

**Status**: ✅ Active
**Ownership**: Frontend Platform (NeonPro)
**Update cadence**: Review on major dependency updates or ADR changes
