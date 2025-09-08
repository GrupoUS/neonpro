---
title: "Test Coverage Policy"
last_updated: 2025-09-07
form: reference
---

See also: [Docs Orchestrator](../AGENTS.md) · [Coverage Policy](./coverage-policy.md)

## Purpose

Define clear, pragmatic coverage expectations and CI gating rules for NeonPro.

## Scope

- Unit tests (Vitest) — fast, isolated
- Integration tests (Vitest) — API/database boundaries
- E2E tests (Playwright) — critical user journeys

## Thresholds (Organization-Wide Baseline)

We maintain different minimums for unit and integration layers due to inherent differences.

- Unit (project="unit")
  - statements: 85%
  - lines: 85%
  - branches: 80%
  - functions: 85%
- Integration (project="integration")
  - statements: 80%
  - lines: 80%
  - branches: 70%
  - functions: 75%

Rationale: Matches vitest.config.ts defaults. The verify script uses the lower integration defaults when mixing coverage to avoid false negatives.

## CI Gating

- CI runs: `pnpm vitest run --project unit --coverage` and optionally integration.
- Coverage artifacts are written to `coverage/`.
- Gating command:

```bash
pnpm run coverage:verify
```

- Script reads `coverage/coverage-summary.json` first, then `clover.xml`, then `coverage-final.json`.
- Env overrides:
  - `MIN_STATEMENTS`, `MIN_LINES`, `MIN_BRANCHES`, `MIN_FUNCTIONS`
  - `COVERAGE_SUMMARY_PATH` (path to summary JSON)
  - `COVERAGE_FAIL_ON_MISS` (default `true`)

Examples:

```bash
# Relax thresholds for a feature branch experiment
MIN_LINES=70 MIN_STATEMENTS=70 pnpm run coverage:verify

# Tighten thresholds for a release branch
MIN_LINES=90 MIN_FUNCTIONS=90 pnpm run coverage:verify
```

## Workflow

1. Add tests alongside code changes (prefer unit tests).
2. Run fast checks locally:

```bash
pnpm vitest run --project unit --coverage --reporter=verbose
pnpm run coverage:verify
```

3. If coverage fails:
   - Add tests for uncovered branches and edge cases.
   - Prefer testing public APIs over internals.
   - Avoid mocking too much; test realistic behavior.

4. On PRs: CI must pass coverage verification.

## Exclusions

- Pure type modules (`@neonpro/types`)
- Generated code
- Migration files and config-only files

See `vitest.config.ts` for the authoritative include/exclude patterns.

## Reporting

Coverage HTML report in `coverage/index.html`. Open in browser for file-level insights.

## Future Improvements

- Per-package thresholds to reflect domain-specific complexity
- Trend tracking over time (weekly median)
- Minimum changed-lines coverage gate
