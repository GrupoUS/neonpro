# Testing Docs Consolidation Plan (NeonPro)

Purpose: Align testing documentation with current architecture (see `../architecture/source-tree.md`) and stack (see `../architecture/tech-stack.md`), remove obsolete guidance, and add missing technology‑specific guides.

## Inventory Summary
- Existing:
  - `coverage-policy.md` — OK; ensure referenced by other docs
  - `integration-testing.md` — Update to Hono.dev only; align structure to `apps/*`
  - `react-test-patterns.md` — Update paths to `apps/web` and add React 19 notes
  - `e2e-testing.md` — Add explicit LGPD privacy artifacts guidance
  - `ci-pipelines.md` — OK; minor notes on coverage merge/verify
  - `code-review-checklist.md` — Replace hard 80% line → reference Coverage Policy
  - `supabase-gotrueclient-singleton-solution.md` — Keep (troubleshooting pattern)
  - `AGENTS.md` — Update index/navigation to include new guides

- Missing (to add):
  - `hono-api-testing.md` — Patterns for Hono route handlers, middleware, validation
  - `tanstack-router-testing.md` — Route loaders/actions/navigation tests
  - `supabase-rls-testing.md` — RLS enforcement tests (positive/negative), audit logs
  - `monorepo-testing-strategies.md` — Turborepo-aware test setup, filtering, caching
  - `testing-responsibility-matrix.md` — Scope, audience, mandatory/optional, CI gates

## Actions by File
- integration-testing.md
  - Remove "Next.js Route Handlers"; keep Hono.dev
  - Replace project structure example with `apps/api`, `apps/web`, `packages/*`
  - Keep Supabase patterns; add RLS note; link to `supabase-rls-testing.md`

- react-test-patterns.md
  - Update file paths from `packages/web` → `apps/web`
  - Add section "React 19 considerations" (concurrent features, `use()`, transitions)
  - Ensure RTL + Vitest examples remain

- code-review-checklist.md
  - Replace "Cobertura ≥ 80%" with: "Cobertura conforme `coverage-policy.md` por criticidade"

- e2e-testing.md
  - Add explicit data privacy note (mask PII in screenshots/traces)

- AGENTS.md
  - Extend Quick Index and Navigation with new guides + matrix

## Obsolete/Conflicting Content to Remove/Update
- "Next.js Route Handlers" mention in integration-testing.md → remove
- Any `packages/web` references in testing docs → use `apps/web`
- Coverage hard targets in checklist → point to `coverage-policy.md`

## Acceptance Criteria
- All edits implemented
- New guides created with examples
- AGENTS index updated
- Responsibility matrix present
- Docs reference current architecture & stack

