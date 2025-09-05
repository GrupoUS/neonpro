# Phase 0 — Architecture Summary (docs/architecture)

Scope
- Files reviewed: `docs/architecture/{AGENTS.md,source-tree.md,tech-stack.md}`
- Purpose: Fast context for repo structure, stack, and workflows

Repository structure (source-tree.md)
- Turborepo: 2 apps (web, api) + 24 packages; tools/ for tests/reports/scripts
- Layers: UI & Components; Data & Types; Core Services; Compliance; AI; Monitoring; Infra; Enterprise
- Key deps chain (Turbo): types → database → shared/core-services/monitoring/domain → apps

Apps overview
- apps/web (Next.js 15): heavy API surface in docs; dep on @neonpro/{ui,shared,domain,database,monitoring}
- apps/api (Hono): Node 20, Vercel functions; zod/jose/bcrypt; clean middleware stack

Build/Tasks/Outputs
- Turbo tasks: build/test/lint/type-check (+ specialized healthcare tests)
- Outputs: .next/** (web), dist/** (packages), coverage/**, reports/**
- Remote cache enabled; env scaffolding documented
Tech stack highlights (tech-stack.md)
- Monorepo: Turbo 2.x; pnpm; TS 5.9.x; oxlint/dprint/prettier
- Frontend: Next.js 15, React 19, Tailwind, shadcn/ui, RHF+zod
- Backend: Hono 4.x, tsup/tsx, zod/jose/bcrypt
- Database: Supabase + Prisma (schema in packages/database)
- Testing: Vitest, Playwright; quality gates wired via Turbo
- Observability: Sentry, Vercel Analytics/Speed Insights

Navigation/workflows (architecture/AGENTS.md)
- Use @system-architecture, @source-tree, @frontend-architecture, @frontend-spec, @tech-stack, @platform-flows for minimal context loading

Immediate notes
- Keep packages/database as single source of truth; deprecate legacy packages/db
- Ensure Turbo dependency graph stays aligned with reality
- Confirm tests for @neonpro/performance (noted as missing in source-tree.md)
