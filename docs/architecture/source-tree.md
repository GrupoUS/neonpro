# NeonPro Source Tree (Updated)
**Last Updated**: 2025-09-29
**Status**: ✅ Simplified Monorepo Layout

This document explains **HOW** the codebase is organized after the simplification plan. It preserves file‑based routing, realtime hooks, CopilotKit & AG‑UI integration, and separates Edge vs Node runtime concerns.

---

## Monorepo Overview
```
neonpro/
├─ apps/
│  ├─ api/                        # Hono (Edge-first) + tRPC v11
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts              # Hono entry (Edge reads)
│  │     ├─ node/                 # Node-only routes (service_role, webhooks)
│  │     │  ├─ webhook.ts
│  │     │  └─ cron.ts
│  │     ├─ trpc/
│  │     │  ├─ context.ts         # inject Supabase clients, auth claims
│  │     │  ├─ router.ts          # AppRouter composition
│  │     │  ├─ middleware/
│  │     │  │  ├─ lgpd-audit.ts
│  │     │  │  └─ rls-guard.ts
│  │     │  └─ routers/
│  │     │     ├─ appointments.ts
│  │     │     ├─ messages.ts
│  │     │     └─ leads.ts
│  │     ├─ agui/                 # AG‑UI Protocol server adapters
│  │     │  └─ dispatcher.ts
│  │     └─ utils/
│  │        └─ error.ts
│  │
│  └─ web/                        # Vite + React + TanStack Router/Query + CopilotKit
│     ├─ package.json
│     ├─ index.html
│     ├─ vite.config.ts
│     └─ src/
│        ├─ main.tsx
│        ├─ App.tsx
│        ├─ routeTree.gen.ts
│        ├─ routes/               # File-based routing
│        │  ├─ __root.tsx
│        │  ├─ 404.tsx
│        │  ├─ index.tsx
│        │  ├─ auth/
│        │  ├─ dashboard/
│        │  ├─ ai/                # Chat experiences
│        │  ├─ appointments/
│        │  └─ clients/
│        ├─ components/
│        │  └─ ui/                # shadcn/ui
│        ├─ providers/
│        │  ├─ RealtimeQueryProvider.tsx
│        │  └─ CopilotProvider.tsx
│        ├─ hooks/
│        │  ├─ useAuth.ts
│        │  ├─ realtime/
│        │  │  ├─ useSupabaseChannel.ts
│        │  │  ├─ useRealtimeQuery.ts     # patch TanStack Query on DB events
│        │  │  └─ index.ts
│        │  └─ useCopilotActions.ts
│        └─ integrations/
│           └─ supabase/
│              ├─ client.ts        # anon client (browser/edge)
│              └─ types.d.ts       # re-export from @neonpro/types
│
├─ packages/
│  ├─ ui/                          # @neonpro/ui — shared UI & UX primitives
│  │  └─ src/
│  │     ├─ chat/
│  │     │  ├─ ChatWindow.tsx
│  │     │  ├─ MessageList.tsx
│  │     │  └─ ToolCallForm.tsx
│  │     ├─ forms/
│  │     └─ index.ts
│  ├─ types/                       # @neonpro/types — DB types & DTOs
│  │  └─ src/
│  │     ├─ supabase.ts            # generated types (do not edit)
│  │     ├─ dto/
│  │     │  ├─ appointment.zod.ts
│  │     │  ├─ client.zod.ts
│  │     │  └─ message.zod.ts
│  │     └─ index.ts
│  ├─ agents/                      # @neonpro/agents — CopilotKit & AG‑UI glue
│  │  └─ src/
│  │     ├─ tools/
│  │     │  ├─ appointments.tool.ts
│  │     │  └─ leads.tool.ts
│  │     ├─ actions/
│  │     │  └─ index.ts            # CopilotKit actions → AG‑UI events
│  │     └─ index.ts
│  ├─ config/                      # @neonpro/config — shared configs
│  │  └─ tsconfig.base.json
│  └─ database/                    # @neonpro/database — SQL, policies, clients
│     ├─ supabase/
│     │  ├─ migrations/
│     │  ├─ policies/
│     │  ├─ functions/
│     │  └─ seeds/
│     └─ src/
│        ├─ client/
│        │  ├─ createAnonClient.ts
│        │  └─ createServiceClient.ts     # Node-only
│        ├─ helpers/
│        │  ├─ queries.ts
│        │  └─ realtime.ts
│        └─ index.ts
│
├─ docs/
│  ├─ architecture/
│     ├─ tech-stack.md             # this file
│     └─ source-tree.md            # and this file
│
├─ turbo.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## Organization Principles
- **Apps own UX/APIs**, packages provide primitives
- **Edge vs Node split** explicit in `apps/api/src` (`node/` folder)
- **Shared validation**: all DTOs in `@neonpro/types`
- **Realtime lives at the edge**: hooks under `apps/web/src/hooks/realtime`
- **No circular deps**; `types` is foundational

---

## Build Order (Turborepo)
1. `@neonpro/types`
2. `@neonpro/ui`, `@neonpro/agents`, `@neonpro/config`, `@neonpro/database` (parallel)
3. `apps/api`, `apps/web` (parallel)

---

## Quick Pointers
- **Where are Supabase clients?** → `packages/database/src/client/*`
- **How to subscribe realtime?** → `apps/web/src/hooks/realtime/useSupabaseChannel.ts`
- **Where do chatbot tools live?** → `packages/agents/src/tools/*`
- **tRPC inputs schemas?** → `@neonpro/types/src/dto/*`
- **AG‑UI dispatching?** → `apps/api/src/agui/dispatcher.ts`

---

## Conventions
- File naming: `PascalCase` for components, `camelCase` for hooks/utils
- Single barrel `index.ts` per folder
- Route modules live under `apps/web/src/routes`

