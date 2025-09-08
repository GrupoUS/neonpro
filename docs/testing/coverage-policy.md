# Coverage Policy

This document defines how we measure and enforce test coverage in the NeonPro monorepo.

## Thresholds (Global by scope)

- Unit scope (Vitest project "unit")
  - Statements: 85%
  - Lines: 85%
  - Branches: 80%
  - Functions: 85%
- Integration scope (Vitest project "integration")
  - Statements: 80%
  - Lines: 80%
  - Branches: 70%
  - Functions: 75%

These align with vitest.config.ts and the coverage verification script in `scripts/coverage-verify.mjs`.

## What is measured

- Source files under:
  - apps/web/app/**/*.{ts,tsx}
  - apps/web/components/**/*.{ts,tsx}
  - apps/api/src/**/*.{ts,tsx}
  - packages/_/src/**/_.{ts,tsx}

## Exclusions

- packages/health-dashboard/**
- **/dist/**, **/build/**, **/.next/**, **/.turbo/**, **/lib/**
- **/tests/**

## How to run

- Run unit tests with coverage:

  pnpm vitest run --project unit --coverage

- Run integration tests with coverage:

  pnpm vitest run --project integration --coverage

Artifacts are generated under `coverage/unit` and `coverage/integration` respectively.

## Verification (Gating)

Use the verification script to check thresholds. It prefers `coverage/**/coverage-summary.json`, falling back to `coverage/coverage-final.json` or `coverage/clover.xml`.

- Verify (auto scope detection):

  pnpm run coverage:verify

- Verify unit scope strictly:

  COVERAGE_SCOPE=UNIT pnpm run coverage:verify

- Verify integration scope strictly:

  COVERAGE_SCOPE=INTEGRATION pnpm run coverage:verify

By default the script fails (exit code 1) when thresholds are not met. To only warn:

COVERAGE_FAIL_ON_MISS=false pnpm run coverage:verify

## Environment overrides (CI/Debug)

You can override thresholds via env vars:

- MIN_STATEMENTS, MIN_LINES, MIN_BRANCHES, MIN_FUNCTIONS

Example (temporarily lower branches to 60% for a flaky suite):

MIN_BRANCHES=60 pnpm run coverage:verify

## Notes

- coverage-summary.json is preferred; if missing, the script aggregates from `coverage-final.json` or approximates from `clover.xml`.
- Keep exclusions aligned between `vitest.config.ts` and this policy.
- Do not check in generated coverage artifacts; they are for local inspection and CI artifacts only.
