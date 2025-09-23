# NeonPro Implementation Plan & Development Strategy

## Overview
This document is the canonical implementation plan for the NeonPro project. It maps the requested five-phase delivery into atomic tasks, tooling, quality gates, and validation steps. It references the project specs and architecture artifacts already present in the repo:

- Specification: `/home/vibecode/neonpro/.claude/commands/specify.md`
- Architect guidelines: `/home/vibecode/neonpro/.claude/agents/code-review/architect-review.md`
- Tech stack: `/home/vibecode/neonpro/docs/architecture/tech-stack.md`
- Source tree: `/home/vibecode/neonpro/docs/architecture/source-tree.md`

Assumptions:
- Primary package manager in dev is `bun` with fallbacks to `pnpm`/`npm` as described in `docs/architecture/source-tree.md`.
- Tests and editors configured in repo are runnable locally (Vitest, Playwright, TypeScript checks).
- You want task tracking via Archon MCP and local progress via the todo list.

---

## Phase 1 — Analysis & Planning (Outputs)
Goal: Produce a validated requirements understanding and a concrete implementation plan.

Deliverables:
- This implementation plan file (`docs/features/neonpro-implementation-plan.md`).
- A concise requirements summary and mapping to code areas.
- Atomic task list (created in Archon) for execution.

Activities performed (verification):
1. Read and analysed: `/home/vibecode/neonpro/.claude/commands/specify.md` (spec helper script and template guidance).
2. Reviewed architectural quality guidelines: `/home/vibecode/neonpro/.claude/agents/code-review/architect-review.md`.
3. Reviewed tech stack and source tree: `docs/architecture/tech-stack.md` and `docs/architecture/source-tree.md`.
4. Created this implementation plan and seeded Archon tasks.

Key findings / implications for the plan:
- Monorepo with `apps/` and `packages/` means changes must respect package boundaries and build order.
- TypeScript strict mode and tRPC + Valibot usage require careful type fixes and validation-first approach.
- TanStack Router + Vite on the frontend: routing fixes must use file-based route tree and regenerate `routeTree.gen.ts` when changing routes.
- Database layer: Prisma + Supabase config must be validated locally before changes to DB schema or migrations.

Assumptions & clarifications made:
- Where the spec referenced a script-based flow (`.specify/scripts/...`), assume the script will be run where needed by the assignee.
- When a file path or project_id for Archon tasks is required but not known, tasks will be created without project_id and should be moved later into the correct Archon project if available.

---

## Phase 1 → Tasks (summary)
1. Produce this plan file — DONE
2. Create Archon tasks for Phase 2–5 (created)
3. Run IDE diagnostics and capture errors (get_errors run; issues summarized in Phase 2)

---

## Phase 2 — Code Quality Issues Resolution (Strategy)
Scope: Identify and fix the IDE problems discovered by TypeScript/ESLint tooling with priority: unused imports/vars, orphaned files, missing/incorrect types.

Outcome: Clean TypeScript compile (no unused-identifier complaints), no unresolved type errors, and removal or archiving of orphaned files.

Steps (atomic):
- 2.1: Run full diagnostics: `bun run type-check` (fallback `pnpm type-check`).
- 2.2: Generate an actionable list of files with unused imports/vars (we ran `get_errors` and captured a snapshot).
- 2.3: Create small PRs to fix groups of issues (by package or feature) — prefer many small atomic commits.
- 2.4: Detect orphaned files: run a repository reference search (Serena pattern search) and list candidates for archiving.
- 2.5: Fix missing or incorrect types: add or update types in `packages/types` and use `satisfies`/`type-only` imports where appropriate.

Quality gates for Phase 2:
- Type-check passes (no compiler errors)
- Linter passes (Oxlint or ESLint) with only approved rule relaxations
- Unit tests for changed areas pass

Example atomic subtasks (created in Archon):
- Remove unused imports in `apps/api/src/trpc/routers/patients.ts` and related router files.
- Replace unused catch params with `_err` or add proper handling in `apps/api/src/services/*`.
- Consolidate unused runtime zod/valibot schemas by either using them or removing them (audit `apps/api/src/services/*`).
- Detect orphaned files in `apps/web/src/docs/backup/` and move to `docs/backup/` or delete after review.

Tooling & commands:
```bash
# Typecheck
bun run type-check
# Lint
bun run lint
# Fix simple imports via provided script
node scripts/fix-unused-imports.js
# Search for orphaned files (example - uses ripgrep if available)
rg "import .*from .*" --glob '!node_modules' --glob '!dist' | sed -n '1,200p'
```

---

## Phase 3 — Frontend-Backend Integration (Strategy)
Goal: Make frontend (TanStack Router + React) and backend (tRPC) communicate reliably.

Steps (atomic):
- 3.1: Ensure `apps/api/src/trpc/index.ts` exports AppRouter types and client-side codegen is wired.
- 3.2: Fix import path aliases in `tsconfig.json` (ensure `paths` map to `@neonpro/*`).
- 3.3: Update frontend to use generated route tree; regenerate `routeTree.gen.ts` if routes changed.
- 3.4: Wire tRPC client in frontend with proper endpoint and context (authorization headers/cookies).
- 3.5: Implement TanStack Query adapters for tRPC and cache policies for mission-critical endpoints.
- 3.6: Audit React hooks for compliance (no stale closures, proper dependency arrays). Replace any broken custom hooks.

Deliverables:
- Working tRPC client in `apps/web/src/lib/trpc.ts` (or similar)
- TanStack Query hooks using `useQuery`/`useMutation` with proper error handling
- Routing validation: no 404 or redirect loops

Commands & checks:
```bash
# Start API (dev)
bun run dev:api
# Start Web (dev)
bun run dev:web
# Run contract tests for tRPC
bun run test:backend --filter contracts
```

---

## Phase 4 — Database Integration (Strategy)
Goal: Validate Prisma + Supabase configuration and ensure DB operations run in CI and locally.

Steps (atomic):
- 4.1: Validate `packages/database/prisma/schema.prisma` and ensure `prisma generate` completes.
- 4.2: Run migrations in a disposable local dev DB (or Supabase branch) and verify schema.
- 4.3: Run `migrate status` and `prisma db pull` where needed.
- 4.4: Validate Supabase CLI configuration (`supabase/config.toml` or `.supabase`) and ensure `supabase start` or equivalent works.
- 4.5: Implement fetch/mutation patterns using tRPC/trpc-react + Prisma with proper transactions and error handling.

Commands & checks:
```bash
# Generate prisma client
bun run prisma generate
# Apply migrations on dev branch (use caution)
bun run prisma migrate dev --name verify
# Supabase CLI check (if configured)
supabase status
```

Quality gates:
- Prisma client generation success
- DB migrations apply and rollback tested
- Integration tests against a test DB pass

---

## Phase 5 — Final Cleanup & Validation
Goal: Remove or archive orphaned files, fix remaining routes and imports, complete verification runs, and prepare the codebase for release.

Steps (atomic):
- 5.1: Remove or archive orphaned files detected in Phase 2 after peer review.
- 5.2: Run full build: `bun run build` and fix any production-only errors.
- 5.3: Run full test matrix: unit, integration, E2E (Vitest + Playwright).
- 5.4: Ensure route tree and redirects produce no 3xx/4xx loops.
- 5.5: Create release candidate branch and open PR with changelog and verification notes.

Commands & checks:
```bash
# Build all
bun run build
# Run tests
bun run test:frontend
bun run test:backend
# E2E (Playwright)
bun run test:e2e
```

Pass criteria:
- Type-check green
- Lint green
- All tests passing (or documented flakiness with mitigation)
- No unresolved import/route errors in production build

---

## Atomic Task Breakdown (High-level)
The full atomic task list is pushed to Archon (task entries). Highlights:
- T2: Unused imports cleanup (grouped per package)
- T3: Unused variables & catch param handling
- T4: Orphaned file detection & archiving
- T5: Fix tsconfig `paths` and import aliases
- T6: Routing fixes (TanStack route tree regeneration)
- T7: tRPC client & TanStack Query integration
- T8: Prisma client verification & Supabase CLI checks
- T9: Final build, tests, and release PR

(Each task is intentionally small — 30–90 minutes each — to enable incremental PRs.)

---

## Risk, Edge Cases & Mitigations
- Large-scale refactors may introduce transient type errors: mitigate by incremental PRs and feature flags.
- DB migrations: always run on a disposable branch DB first; keep backups and export current schema.
- Orphan detection false positives: require manual review before deletion; use `docs/backup/` to store removed files.

---

## Acceptance Criteria & Quality Gates
1. All created Archon tasks have status updates and owner assignment.
2. Typecheck passes across the repo.
3. All changed modules have unit tests (happy path + one edge case).
4. Integration smoke test for tRPC endpoints is green.
5. Prisma client generation and migrations validated on a dev DB.

---

## Next Steps (immediate)
1. Phase 1 is completed (this file created).
2. Phase 2 should start: run `bun run type-check` and iterate on the top issues (we captured a snapshot with `get_errors`).
3. Assignees should pick small Archon tasks to start work (task list created in Archon).


---

## Contact / Notes
If you want, I can now:
- Create the Archon tasks (I will), assign owners, and add estimated time for each.
- Run additional codebase searches to produce the full orphaned-file list (using Serena search-for-pattern).


*Generated by the NeonPro development agent — plan based on spec + architect guidelines + tech stack.*
