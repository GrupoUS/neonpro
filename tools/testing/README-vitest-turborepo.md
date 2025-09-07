# Vitest + Turborepo (Monorepo)

This repo follows the official Turborepo guide for Vitest:
https://turborepo.com/docs/guides/tools/vitest

## Quick start

- Run all tests (cacheable):
  - pnpm test
- Only changed packages (local):
  - pnpm test:changed
- Coverage per package:
  - pnpm coverage
- Watch tests in a specific package:
  - pnpm -C packages/core-services test:watch

## Standard scripts per package

Add to each package with tests:

{
"scripts": {
"test": "vitest --run",
"test:watch": "vitest",
"coverage": "vitest --run --coverage"
}
}

## Turborepo pipelines (turbo.json)

- test: cacheable task with inputs: tests, sources, vitest configs
- coverage: depends on test, caches coverage outputs

## Filters (affected only)

- Local: pnpm turbo run test --filter=...[HEAD^]
- CI: pnpm turbo run test --filter=...[origin/main]

## Vitest config (per package)

- environment: node (libraries) or jsdom/happy-dom (UI)
- reporters: default
- coverage: provider v8, reporters text/html/lcov, thresholds enforced

## CI

- .github/workflows/ci.yml runs tests with pnpm and restores Turborepo cache
- To use remote cache, set TURBO_TOKEN and TURBO_TEAM repository secrets

## Troubleshooting

- No tests found? Vitest exits 0 by default; ensure include patterns match.
- Cache misses unexpectedly? Check turbo.json inputs/outputs and vitest cacheDir.
- DOM errors? Switch environment between jsdom and happy-dom as needed.
