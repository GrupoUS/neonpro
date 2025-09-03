---
title: "Vitest + Turborepo: Setup & Usage"
last_updated: 2025-09-03
form: reference
related:
  - ../AGENTS.md
  - ../memory.md
  - ./coverage-policy.md
---

# Vitest + Turborepo: Setup & Usage

This repository uses Vitest with Turborepo for fast, cacheable tests.
We follow the official guide (turborepo.com/docs/guides/tools/vitest).

## What was configured

- turbo.json
  - task `test`: cacheable with outputs
    - outputs: `coverage/**`, `.vitest/**`, `node_modules/.vitest/**`
    - inputs include `**/*.test.*`, `**/vitest.config.*`, `vitest.setup.*`, `vitest.d.ts`
  - task `test:watch`: non-cacheable, persistent
  - task `test:coverage`: cacheable coverage run
- Vitest config
  - `cacheDir` set to `./.vitest` for deterministic caching
- Root scripts
  - `test`: `turbo run test`
  - `test:watch`: `turbo run test:watch`

## How to run

- Run all package tests (cacheable):
  - `pnpm test`
- Watch mode during development:
  - `pnpm test:watch`
- Filter to a subset (examples):
  - `pnpm turbo run test --filter=@neonpro/web`
  - `pnpm turbo run test:watch --filter=@neonpro/web`

## Recommended package scripts

Inside each package that has tests:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch"
  }
}
```

This enables Turborepo to parallelize and cache per-package test runs.

## Coverage

- Per-package coverage works out of the box via `vitest --coverage`.
- Merged coverage across packages requires an aggregation step.
  See Turborepo example "with-vitest" for a full workflow.

## Notes

- Watch tasks are long-lived; they are marked `persistent` and not cached.
- If you add custom `cacheDir` per package, include it in `turbo.json` outputs.
- Prefer per-package tests to maximize caching; root Vitest workspace is discouraged.
