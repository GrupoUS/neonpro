# Coverage Policy

This repository enforces pragmatic, scope-aware coverage verification.

- Scope:
  - Unit: measured under coverage/unit
  - Integration: measured under coverage/integration
  - Fallback: coverage root (coverage-summary.json, coverage-final.json, clover.xml)
- Thresholds (default, env-overridable):
  - Unit: statements 85%, lines 85%, branches 80%, functions 85%
  - Integration: statements 80%, lines 80%, branches 70%, functions 75%
- Files included/excluded are defined in vitest.config.ts per project.
- Verification script: scripts/coverage-verify.mjs

Usage examples:

- Run unit tests with coverage:
  pnpm vitest run --project unit --coverage --reporter=verbose

- Verify with defaults (fails CI on miss):
  pnpm run coverage:verify

- Warn-only (no non-zero exit):
  COVERAGE_FAIL_ON_MISS=false pnpm run coverage:verify

- Force UNIT scope thresholds:
  COVERAGE_SCOPE=UNIT pnpm run coverage:verify

- Narrow aggregation (coverage-final.json fallback) to app/packages only:
  COVERAGE_INCLUDE="apps/web|packages/|apps/api/src" pnpm run coverage:verify

Notes:

- The verifier prefers coverage-summary.json for exact totals and falls back to coverage-final.json or clover.xml.
- Use env MIN_STATEMENTS/MIN_LINES/MIN_BRANCHES/MIN_FUNCTIONS to override thresholds temporarily.
- Increase thresholds incrementally alongside new tests to avoid blocking CI unnecessarily.
