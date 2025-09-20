# Vitest ESM/CommonJS Interop Issue in API tests

Last updated: 2025-09-16

## Problem

Some API test suites intermittently fail with errors like:

```
ReferenceError: require is not defined in ES module scope
TypeError [ERR_REQUIRE_ESM]: require() of ES Module ... not supported
```

This appears when a test or helper uses `require()` (CJS) while the project/test runner is configured for ESM (TypeScript + vitest with `type: module` toolchain), or when tsconfig/vitest config emits ESM for files that import CJS-only dependencies.

## Current Scope

- Not blocking Phase 1 AI Chat tests (T007–T014 are passing), but shows up in unrelated suites.
- We are not changing behavior now; documenting the issue and proposing a safe fix.

## Likely Root Causes

- Mixed module formats: ESM transpile target + legacy `require()` in tests or helpers.
- NodeNext/ESNext module + CommonJS-resolved dependencies without proper dynamic import.
- Test files using default import for a CJS module or vice versa.

## Recommended Fix Plan (safe, incremental)

1. Prefer ESM in tests
   - Replace `const x = require('y')` with `import x from 'y'` or `import * as x from 'y'`.
   - If the module is CJS-only, use dynamic import: `const x = await import('y')` inside async test hooks.
2. Vitest config alignment
   - Ensure `tsconfig.tests.json` sets `module` to `ESNext` (or `NodeNext`) and `moduleResolution` accordingly.
   - In Vitest config, set `environment`, `deps.inline` for CJS deps that need transpilation.
3. Bridge helpers
   - For stubborn CJS-only libs, add thin wrappers in `packages/utils/src/compat/<lib>.ts` exporting ESM-friendly APIs and import those in tests.
4. Avoid top-level require in ESM
   - Use `await import()` within tests instead of top-level require.

## Concrete Next Steps (non-breaking)

- Audit tests for `require(` usage and replace with ESM import or dynamic import.
- Add a CI job to fail on new `require()` in `apps/api/tests/**`.
- If failures persist, pin `vitest` and align `vite`/`tsconfig` versions.

## References

- Vitest docs: https://vitest.dev/guide/features.html#modules
- Node.js ESM/CJS interop: https://nodejs.org/api/esm.html#esm
