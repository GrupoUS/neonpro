# NeonPro — Next Steps (Clean Context Handoff)

Date: 2025-09-09
Branch: `004-tanstack-query-integration`
Owner/Repo: GrupoUS/neonpro

This document captures exactly what remains and how to get the repo green (format/lint/type/tests) and ready for Vercel Preview deploy. Use it to restart in a fresh chat.

## Current Status Snapshot

- Formatter: Configured (dprint). Some files needed fixes; formatter works via task.
- Lint: oxlint in place; most issues fixed. A few remain tied to test/contract type mismatches.
- TypeScript: tsc currently fails (150 errors) — mainly contract/test type mismatches and a few `src` strict-mode issues.
- Unit tests: Hook/UI tests are now passing locally after React singleton work. Integration/contract tests are not intended to pass (TDD stubs) but must typecheck.
- Deployment: Vercel preview blocked earlier by rootDirectory; per-app config simplified. Continue once codebase is green.

## High-Priority Goals

1. Green code quality gates (format, lint, type-check) without loosening global strictness.
2. Keep unit tests passing; contract/integration tests may fail at runtime but must typecheck.
3. Unlock Vercel Preview build once repo is green.

## Blocking Issues (from last full check)

- Contracts referencing missing types (e.g., `CodeAsset`, `AuditConfiguration`, etc.).
- Tests importing vitest APIs fail TypeScript raise (e.g., "no exported member 'describe'") because tsc uses project config without Vitest globals.
- `src/services/FileScanner.ts` strictness issues (unknown error, glob types, optional property exactness).
- `src/models/CodeAsset.ts` and `src/models/DependencyGraph.ts` minor type/lint warnings.

## Plan of Record (PoR)

### A) TypeScript Project Structure

- Keep `strict: true`, `exactOptionalPropertyTypes: true` (do not relax globally).
- Add a lightweight tsconfig for tests to provide Vitest globals and not emit (composite optional):
  - Create `tsconfig.tests.json` extending root tsconfig, with `types: ["vitest","vitest/globals","@testing-library/jest-dom"]`.
  - Update scripts/tasks: pass `-p tsconfig.json` for build/type-check, and create an additional check that uses project references including tests only for type-only validation if desired. Alternatively, include both `src/**/*` and `tests/**/*` in root but ensure Vitest types are recognized via `types` in root or paths mapping.
- Minimal change option: add a root ambient types include by referencing `vitest.d.ts` (already present). Ensure `tsconfig.json` includes `"include": ["src/**/*","tests/**/*","vitest.d.ts"]` (add if missing).

### B) Contract Types Harmonization

- Files:
  - `specs/003-monorepo-audit-optimization/contracts/architecture-validator.contract.ts`
  - `specs/003-monorepo-audit-optimization/contracts/dependency-analyzer.contract.ts`
  - `specs/003-monorepo-audit-optimization/contracts/report-generator.contract.ts`
  - `specs/003-monorepo-audit-optimization/contracts/file-scanner.contract.ts`

- Actions:
  1. Ensure all types referenced in tests exist or are relaxed to minimal placeholders.
     - Add or export aliases where tests expect names:
       - In `report-generator.contract.ts`, add placeholder export interfaces:
         - `AuditConfiguration`, `ExecutionError`, `ExecutionWarning`, `FileInfo`, `ProblemFile`, `CircularDependencyInfo`, `DepthStatistics`, `ImportExportAnalysis`, `ExternalDependencyInfo`, `UsagePattern`, `DeadCodeAnalysis`, `ComplexityMetrics`, `MaintainabilityMetrics`, `TestCoverageMetrics`, `DocumentationMetrics` — each with minimal fields to satisfy indexing/access in tests.
     - In `architecture-validator.contract.ts`, ensure method signatures use local `CodeAsset` where tests import from `file-scanner.contract` (OK). If tests refer to `ValidationStatus` string union like `['passed','failed','warning']`, update union or adjust tests to the documented `ValidationStatus` values. Safer: add union members `'passed'|'failed'|'warning'` to keep tests compiling (temporary shim comment).
     - In `dependency-analyzer.contract.ts`, `buildGraph(assets: CodeAsset[])` -> define or import `CodeAsset` from `file-scanner.contract.ts` or declare a local minimal interface `type CodeAsset = { path: string }` and export it for consistency if cross-file import causes circularity. Prefer explicit `import type { CodeAsset } from './file-scanner.contract'`.
  2. Align `FileScanner` contract `CodeAsset` with tests:
     - Tests create mock assets with fields like `dependencies`, `exports`, `layer`, `content`, `lineCount`, `complexity`. Either:
       - Extend `CodeAsset` with optional fields to accept these during tests; or
       - Define a `TestCodeAsset` in tests. Prefer extending contract with optional properties to avoid many test changes.
     - Example additions (all optional) to `CodeAsset` in `file-scanner.contract.ts`:
       - `dependencies?: string[]; exports?: string[]; layer?: string; content?: string; lineCount?: number; complexity?: number`

### C) Fix `src` Strictness Errors

- `src/models/CodeAsset.ts`:
  - `UsageStatus.UNKNOWN` does not exist. Options: add `UNKNOWN` to enum in `src/models/types.ts` (safer, minimal impact) OR change default to a valid member (e.g., `UsageStatus.UNUSED`). Chosen: add `UNKNOWN` to keep semantics.
- `src/models/DependencyGraph.ts`:
  - Remove unused parameters (`path`, `node`) or prefix with `_` to satisfy noUnusedLocals.
  - Private method params marked but unused (`cycle`) — prefix `_cycle`.
- `src/services/FileScanner.ts`:
  - Narrow `error` type when accessing `.message` by `instanceof Error` checks or `as any` fallback.
  - `glob` options typing: set `maxDepth` strictly as `number` by mapping `undefined` to a concrete number (e.g., use `Number.MAX_SAFE_INTEGER` when unlimited) or use conditional spread to omit key when unlimited.
  - Constructed return typed as `CodeAsset` complains about `packageName` possibly undefined — in `spec contract CodeAsset` packageName is optional; update type in contract (see B) to optional to match runtime.

### D) Tests Type Issues

- Vitest imports `'afterEach'|'beforeEach'|'describe'|'expect'|'it'` should be resolved by the global type refs.
  - Ensure `vitest.d.ts` is included by tsconfig (see A).
- Adjust tests that assume properties not declared:
  - `architecture-validator.contract.test.ts` expects `asset.dependencies` (add optional to contract per B).
  - `cleanup-engine.contract.test.ts` expects `TempCleanupResult.filesRemoved` and `errors` — align contract (if present) or update test to the existing `tempFilesRemoved` (preferred: in test, read `tempFilesRemoved`, but if tests are considered reference, add optional aliases on contract types).
  - `report-generator.contract.test.ts` expects `executionSummary.totalExecutionTime`, `ExecutiveSummary.overallScore`, etc. Either adapt test to current contract (preferred long-term) or add optional fields (short-term to pass type-check). For now, add optional aliases:
    - In `ExecutionSummary`, keep `totalExecutionTime` (already present in contracts? If not, add optional). In fact, contract currently has it — test error came from accessing properties on different type names; add missing fields in `ExecutiveSummary` and `TechnicalReport` to satisfy expectations as optional.

### E) Ambient Module Stubs (temporary)

- Add `src/types/shims.d.ts` with ambient module declarations for not-yet-implemented internal imports used only by tests (e.g., `src/cli/audit-tool`, `src/services/report-generator`). Keep them as minimal interfaces or `export {}` with comments. This unblocks tsc until implementations arrive.

### F) Commands to Run

- Format, lint, type-check:

```bash
# Format all
pnpm dlx dprint fmt

# Lint (auto-fix)
pnpm dlx oxlint --fix .

# Full code check task (configured)
# In VS Code: run task "✅ Full Code Check"
```

- Unit tests (optional while patching types):

```bash
pnpm vitest run --project unit --reporter=verbose
```

## File-by-File Edit Checklist

- specs/contracts
  - [ ] `file-scanner.contract.ts`: make `packageName?`; add optional fields used in tests.
  - [ ] `dependency-analyzer.contract.ts`: import `CodeAsset` from file-scanner; ensure all referenced types exist.
  - [ ] `report-generator.contract.ts`: add placeholder exported interfaces for all missing types referenced by tests; add optional fields to `ExecutiveSummary`, `TechnicalReport`, `ComparisonReport` as per failures.
  - [ ] `architecture-validator.contract.ts`: ensure `ValidationStatus` includes strings used by tests or adjust tests; fix any signature mismatch using `CodeAsset`.
- src/models
  - [ ] `types.ts`: add `UNKNOWN` to `UsageStatus`.
  - [ ] `DependencyGraph.ts`: remove/underscore unused params; rename `generateResolutionStrategies(cycle)` param to `_cycle`.
- src/services
  - [ ] `FileScanner.ts`: guard unknown `error`, fix `glob` options (omit `maxDepth` when unlimited), return type `CodeAsset` compatible with contract.
- tests/types
  - [ ] Ensure `vitest.d.ts` included in `tsconfig.json` include array.
- types/shims
  - [ ] Create `src/types/shims.d.ts` for missing internal modules imported by tests.

## Optional Improvements (after green)

- Split tsconfigs: `tsconfig.base.json`, `tsconfig.src.json`, `tsconfig.tests.json`, and set project references for faster tsc.
- Replace ambient stubs with minimal implementations for `AuditTool` and `ReportGenerator` service so integration tests can run selectively.
- Revisit test expectations vs. contract spec to converge on one canonical source of truth.
- Re-run Vercel Preview once quality gates pass.

## Acceptance Criteria

- `✅ Full Code Check` passes: dprint check OK, oxlint OK, tsc with zero errors.
- `🧪 Unit Tests + Coverage` pass (existing passing state maintained).
- No relaxation of global strictness; all compatibility provided via optional fields/shims.

## Quick Status Re-check

Use the VS Code tasks:

- "✨ Format Code"
- "🔧 Fix Lint Issues"
- "✅ Full Code Check"
- "🧪 Unit Tests + Coverage"

If any errors persist, search in this doc for the corresponding section and apply the indicated patch.
