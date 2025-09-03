## Remediation Plan (Phase 4)

Goal
- Prepare small, reversible PRs to remove dead/obsolete code and consolidate redundancies, without functional regressions.
- No code changes yet; this document defines the actionable sequence once Phase 5 is approved.

Global rules
- One scope per PR, minimal blast radius, easy rollback (`git revert`).
- Mandatory checks per PR: build, lint, type-check, tests (unit/e2e as applicable), tree-shaking, bundle-size diff.
- Mark any dynamic usage or ambiguity as manual-review; never remove without proof.
- Update docs and changelogs; attach evidence paths (reports/graphs).
Phased PR sequence

1) PR-001: Remove deprecated auth facade from utils (no consumers)
- Scope: remove `packages/utils/src/auth/**` and any re-exports referencing it
- Preconditions: confirm zero imports across repo (apps/**, packages/**, tools/**, tests/**)
- Risk: low; shared/auth is the canonical replacement
- Checks: type-check, unit tests for shared/auth
- Evidence: `tools/reports/packages-audit-findings.md`, `tools/reports/unused-files.json`
- Rollback: `git revert` single PR

2) PR-002: Archive Enterprise API Gateway (inactive)
- Scope: move `packages/enterprise/src/api-gateway/**` to an archive (e.g., `packages/enterprise/_archive/api-gateway/**`) or delete if approved
- Preconditions: confirm no imports; keep scripts under `packages/enterprise/scripts/**` intact
- Risk: low; Hono API is authoritative under `apps/api`
- Checks: build monorepo, tests for apps/api
- Evidence: `tools/reports/dependency-graph.*`, `tools/reports/unused-files.json`, snippet showing inactive routes in apps/api
- Rollback: `git revert`

3) PR-003: Tighten public exports (reduce surface area)
- Scope: in `packages/ui`, `packages/monitoring`, `packages/core-services`, restrict exports field to consumed entrypoints only
- Preconditions: dependency-graph confirms consumers; create codemods for imports if needed
- Risk: medium; potential import breakage if missed usages
- Checks: type-check, build apps, tree-shake/bundle-size comparison
- Evidence: `tools/reports/dependency-graph.*`, inventory
- Rollback: revert export changes

4) PR-004: Remove orphaned placeholders and inactive modules
- Scope: remove clearly unused placeholder files (e.g., `_inactive_*` under apps/api/ai) only after confirmation
- Preconditions: ensure no tests/scripts reference these; label manual-review items until proven
- Risk: low-medium; limited to code comments and dead files
- Checks: build + tests
- Evidence: route index and folder listings in `apps/api/src/routes/ai/**`
- Rollback: `git revert`

5) PR-005: Consolidate duplicated responsibilities
- Scope: if any redundant implementations discovered during final near-duplicate pass, consolidate to the preferred module (e.g., `shared/*`)
- Preconditions: similarity report (≥85%), usage map, migration steps
- Risk: medium; behavior changes
- Checks: unit/integration tests around affected modules
- Evidence: updated `packages-audit-findings.md`
- Rollback: small scoped reverts

6) PR-006: Clean configuration and CI references
- Scope: remove config entries that reference removed modules (turbo tasks, tsconfig paths, next config)
- Preconditions: previous PRs merged; cross-check build/test pipelines
- Risk: low; config-only
- Checks: CI green
- Evidence: diffs and `turbo.json`
- Rollback: `git revert`
