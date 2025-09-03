## Context

Repository: `neonpro`
Goal: Remove dead/redundant/duplicated/obsolete/disconnected code to get production-ready, without executing removals yet.
Primary scope: `docs/architecture`, `docs/prd`, orchestrator `docs/AGENTS.md`, and deep audit of `/packages`.

## Methodology

- Orchestrate by agents (see `docs/AGENTS.md`, `docs/architecture/AGENTS.md`)
- Phased approach (0–6) with clear DoD, risks, mitigation, evidence artifacts under `tools/reports/`
- Static search + config-aware mapping: Turbo, TS path aliases, Next config, tests/build scripts
- Conservative flags: mark dynamic imports as "manual review"; no code moves/deletes

## Findings (high-level to date)

- Monorepo Turborepo with 2 apps (`apps/web`, `apps/api`) and 22 packages under `/packages`
- Internal packages widely referenced via TS path aliases (see `tsconfig.json`, `apps/web/tsconfig.json`)
- Some deprecations/migrations noted (e.g., `@neonpro/utils` auth → `@neonpro/shared/auth`), implying consolidation tasks
- Build graph governed by `turbo.json` – strong signal of intended dependencies

## Actions by Phase (0–6)

- Phase 0 — Alignment & Reading
  - Objective: Extract ADRs, context boundaries, non-functional goals, PRD scope, agents mapping
  - DoD: Three short summaries in `tools/reports/phase0-*.md`
  - Risks: Docs vs repo drift → Cross-check with workspace/turbo

- Phase 1 — Inventory & Mapping of /packages
  - Objective: Inventory JSON+MD, entrypoints/consumers map
  - DoD: `packages-inventory.json/md`, `package-entrypoints-and-consumers.md`
  - Risks: False ownership/entrypoints → Verify via scripts and app configs

- Phase 2 — Usage & Dependency Analysis
  - Objective: Dependency graph (mermaid+JSON), unused files list
  - DoD: `dependency-graph.md/json`, `unused-files.json`
  - Risks: Dynamic imports/edge routes → mark "manual review"

- Phase 3 — Problem Detection
  - Objective: Dead/unused, duplicates, redundant implementations, obsolete vs PRD
  - DoD: `packages-audit-findings.md` with severity/impact and evidence
  - Risks: Hash-based near-duplicates → require reviewer confirmation

- Phase 4 — Removal/Consolidation Plan
  - Objective: Small reversible PRs, one scope per PR
  - DoD: `remediation-plan.md` with PR sequencing, rollback (git revert), checks (build, lint, type-check, tests, treeshake, size)

- Phase 5 — Controlled Execution (not executed yet)
  - Objective: Apply removals/consolidations with guard-rails
  - DoD: Green build, tests OK, measurable size/complexity reduction

- Phase 6 — Validation & Monitoring
  - Objective: Validate builds/tests/linters/types, tree-shaking and size reports (before/after)
  - DoD: Validation report with zero errors and target metrics achieved

## Sequencing & Dependencies

- 0 → 1 → 2 are prerequisites; 3 depends on 2; 4 depends on 3; 5 awaits explicit approval; 6 runs after each PR batch
- Config awareness: `turbo.json`, `tsconfig*.json`, `apps/web/next.config.*`

## Agent Mapping (from docs/AGENTS.md)

- Research: Phase 0, 2, 3
- Mapping: Phase 1
- Static Analysis: Phase 2, 3
- Refactor: Phase 4, 5 (execution later)
- QA/Verification: Phase 5, 6
- Release: Phase 4–6

## Risks & Mitigation

- Dynamic imports/edge routes lead to false "unused" → tag as "manual review" and add tests before removal
- Docs vs code divergence → add "decision required" items
- Hidden consumers (scripts/CI) → scan `scripts/`, `turbo.json` tasks

## Validation Strategy

- Pre/post metrics: build time, bundle size, treeshake reports, test coverage
- Commands (non-executed now):
  - Build: `pnpm build`, per-package `turbo run build --filter=...`
  - Lint/type: `pnpm lint`, `pnpm type-check`
  - Tests: `pnpm test`, `pnpm test:safe`
  - Tree-shake/bundle: Next.js/analyzers per `packages/monitoring/scripts`
