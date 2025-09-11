# Tasks: Vercel Deployment Enablement

Prerequisites: `plan.md` (present), Archon PRD (46e0298a-2f05-4176-8446-406ad10143d2), Implementation Plan (12d5d2bf-0c38-4838-a595-fec649f42438), feature doc `../deploy-vercel.md`.

Execution Order: Setup → Tests (fail first) → Core Impl → Integration → Polish & Governance.
All tasks reference PRD (PRD) & Plan (PLAN). [P] = parallel (different files, no dependency).

## Phase 1: Setup & Baseline

- [ ] T001 Baseline workspace build timing (root) — Run `pnpm install && pnpm build && pnpm test` capturing durations to `quality-report.txt`. Acceptance: durations + failures logged; initial metrics section appended to feature doc. Path: `./` (scripts).
- [ ] T002 Normalize package scripts (root/apps) — Align `build`, `dev`, `start`, optional `vercel-build`. Acceptance: script matrix documented in feature doc. Paths: `package.json`, `apps/api/package.json`, `apps/web/package.json`.
- [ ] T003 [P] Create `.env.example` — Inventory vars (see feature doc) with comments; exclude secrets. Acceptance: file exists; validated by reviewer script placeholder. Path: `.env.example`.
- [ ] T004 [P] Add env validation helper — Create `packages/utils/src/env/validate.ts` that throws on missing required server vars. Acceptance: unit test failing until implemented. Paths: `packages/utils/src/env/validate.ts`, test path `packages/utils/src/env/__tests__/validate.test.ts`.

## Phase 2: Test-First (Contracts, Health, Env, Performance) — MUST FAIL INITIALLY

- [ ] T005 [P] Contract test: Health endpoint — Add test hitting `/health` expecting status 200 + shape `{status:'ok'}`. Path: `apps/api/src/__tests__/routes/health.test.ts`.
- [ ] T006 [P] Contract test: OpenAPI exposure — Test GET `/openapi.json` returns valid JSON with `openapi` field. Path: `apps/api/src/__tests__/routes/openapi.test.ts`.
- [ ] T007 [P] Env validation test — Test that missing `SUPABASE_URL` causes startup failure (mock process.env). Path: `packages/utils/src/env/__tests__/validate.test.ts`.
- [ ] T008 [P] RLS smoke test — Attempt unauthenticated select should fail; authenticated (service key) passes (conditionally skip if key absent). Path: `apps/api/src/__tests__/integration/rls-smoke.test.ts`.
- [ ] T009 [P] Performance budget scaffold test — Placeholder test reading JSON budget (to be created) ensuring fields exist (LCP, CLS, TTFB). Path: `tools/testing/__tests__/performance-budget.test.ts`.
- [ ] T010 [P] Logging contract test — Simulate error route to ensure structured log fields (ts, level, svc, msg). Path: `apps/api/src/__tests__/integration/logging.test.ts`.

## Phase 3: Core Implementation (Only after Phase 2 tests exist & fail)

- [ ] T011 Implement health route — Add `/health` in Hono app returning spec shape with commit hash (env or placeholder). Path: `apps/api/src/` (route registration file).
- [ ] T012 Implement OpenAPI generation — Add generator (manual JSON or library) and route `/openapi.json`. Path: `apps/api/src/`.
- [ ] T013 Implement env validation logic — Implement `validateEnv()` consumed during API bootstrap. Path: `packages/utils/src/env/validate.ts`.
- [ ] T014 Implement structured logger — Utility `packages/utils/src/logging/logger.ts` with JSON output. Path plus update usages in API entry. Paths: `apps/api/src/`, `packages/utils/src/logging/`.
- [ ] T015 Integrate performance budget config — Create `tools/testing/performance-budget.json` with initial thresholds (placeholders). Path: `tools/testing/performance-budget.json`.
- [ ] T016 Add error handling middleware — Central error wrapper returning standardized body. Path: `apps/api/src/middleware/error.ts` and integration.

## Phase 4: Integration & Refinement

- [ ] T017 Wire env validation at startup — Fail fast if required vars missing (excluding optional). Path: `apps/api/src/index.ts`.
- [ ] T018 RLS smoke test enablement — Provide helper authenticated client util. Path: `apps/api/src/__tests__/integration/__utils__/supabaseClient.ts`.
- [ ] T019 Performance measurement script — Script to capture cold start + first response, write to `quality-report.txt`. Path: `tools/testing/scripts/measure-startup.ts`.
- [ ] T020 Add smoke deploy script — Bash/Node script curling `/health` + frontend root. Path: `tools/testing/scripts/smoke-deploy.sh`.
- [ ] T021 Add rollback strategy doc section update — Append scenario table finalization. Path: `docs/features/deploy-vercel.md`.
- [ ] T022 Remove legacy NEXT_PUBLIC_* usage — Replace with VITE_ or config alias; update docs. Paths: search in `apps/web/src/`.
- [ ] T023 Add fallback 404/500 pages — Implement minimal accessible pages. Paths: `apps/web/src/routes/404.tsx`, `apps/web/src/routes/500.tsx` (or pattern used).
- [ ] T024 CI pipeline update — Ensure jobs order: install → build → test → lint → deploy + smoke. Path: `.github/workflows/*` (create or modify).
- [ ] T025 Remote cache verification doc — Document cache hits after second build. Path: `docs/features/deploy-vercel.md`.

## Phase 5: Polish & Governance

- [ ] T026 [P] Add README snippet for env setup — Section in root `README.md`. Path: `README.md`.
- [ ] T027 [P] Add section to `coding-standards.md` about deployment env validation. Path: `docs/rules/coding-standards.md`.
- [ ] T028 [P] Add bundle size record table — Update feature doc with baseline size. Path: `docs/features/deploy-vercel.md`.
- [ ] T029 [P] Add Lighthouse CI placeholder (non-blocking) — Document future integration. Path: `docs/features/deploy-vercel.md`.
- [ ] T030 Final dry-run checklist execution — Validate all items, mark done in feature doc. Path: `docs/features/deploy-vercel.md`.

## Dependencies Summary

- Phase 2 tests (T005–T010) must exist before T011–T016 implementation tasks.
- T013 precedes T017 (env validation wiring).
- T011 must precede smoke scripts referencing `/health` (T020).
- T012 precedes contract validation in future external consumers.
- T014 precedes logging test success (test initially failing until structured logger implemented).
- Polish tasks (T026–T030) after integration tasks complete.

## Parallel Execution Examples

```
# Example: Run all contract/setup tests in parallel (different files)
T005 T006 T007 T008 T009 T010

# Example: After tests written & failing
T011 T013 T014 T015 [avoid T012 if editing same main file concurrently]
```

## Validation Checklist

- [ ] All Phase 2 tests added before implementation.
- [ ] No [P] tasks modify same file.
- [ ] Env validation fails with missing required vars.
- [ ] Health + OpenAPI endpoints covered by tests.
- [ ] Performance budget file consumed by test scaffold.
- [ ] Legacy NEXT_PUBLIC_* fully removed.

## Machine-Readable Summary (Excerpt)

```json
{
  "feature_dir": "docs/features/deploy-vercel",
  "tasks": [
    {
      "id": "T001",
      "path": "./",
      "depends_on": [],
      "acceptance": ["baseline metrics appended"],
      "refs": { "prd": ["PRD"], "plan": ["PLAN"] }
    },
    {
      "id": "T005",
      "path": "apps/api/src/__tests__/routes/health.test.ts",
      "depends_on": ["T001"],
      "acceptance": ["failing test added"],
      "refs": { "prd": ["PRD"], "plan": ["PLAN"] }
    }
  ],
  "policy": { "tdd_order": true, "parallelization": true }
}
```

## Notes

Commit after each task. Ensure failing state for tests before implementing functionality. Keep feature doc synchronized with decisions.

## Phase 3b: Additional Core (Refined Atomic Tasks)

- [ ] T031 OpenAPI spec stub file creation — Create `apps/api/src/openapi/spec.base.json` minimal skeleton (no route wiring yet). Acceptance: file exists, referenced by no runtime code yet. Depends: T006 (failing test exists).
- [ ] T032 Wire OpenAPI route using stub — Implement `/openapi.json` serving merged spec. Acceptance: T006 turns green after implementation. Depends: T031.
- [ ] T033 [P] Logger redaction utility — Add `packages/utils/src/logging/redact.ts` to strip PII patterns (email, CPF placeholder). Acceptance: unit test (new) fails until implemented. Test path: `packages/utils/src/logging/__tests__/redact.test.ts`.
- [ ] T034 Integrate redaction into logger — Update logger pipeline to apply redaction before output. Acceptance: Logging contract test updated to assert redacted tokens. Depends: T033, T014.
- [ ] T035 Pre-commit secret scan hook — Add `.githooks/pre-commit` script running grep for service role key pattern. Acceptance: Hook installed; documented in feature doc. Depends: T002.
- [ ] T036 Bundle service role key scan script — Script greps build artifacts ensuring absence of `SUPABASE_SERVICE_ROLE_KEY` literal. Path: `tools/testing/scripts/scan-bundle.js`. Acceptance: Fails if pattern found. Depends: T002.
- [ ] T037 Region latency probe script — Node script hitting API deployed preview (configurable URL) measuring median latency; writes to `quality-report.txt`. Depends: T001.
- [ ] T038 [P] Performance budget CI integration — Add CI step reading `performance-budget.json` failing if thresholds exceeded (placeholder). Depends: T015.
- [ ] T039 License compliance audit task — Add script `tools/audit/license-audit.ts` enumerating licenses, flagging GPL/AGPL. Acceptance: Report generated in `audit-evidence.json`. Depends: T001.
- [ ] T040 Bundle size capture script — After web build, record gzip size of main JS chunks into feature doc/table. Script path: `tools/testing/scripts/bundle-size.js`. Depends: T001.
- [ ] T041 Enforce no console.log in production — ESLint rule or grep script executed in CI. Acceptance: Introduce failing test/log before fix, then passes. Depends: T002.
- [ ] T042 [P] Add failing test for logger redaction — File: `packages/utils/src/logging/__tests__/redact.test.ts` asserting masking of email pattern. Must precede T033. Depends: T010.
- [ ] T043 [P] Add failing test for bundle scan — File: `tools/testing/__tests__/bundle-scan.test.ts` simulating detection. Precedes T036.
- [ ] T044 [P] Add failing test for license audit parser — File: `tools/audit/__tests__/license-audit.test.ts`. Precedes T039.
- [ ] T045 Final security & integrity checklist consolidation — Update feature doc with outcomes (redaction, secret scan, license, bundle). Depends: T034 T036 T039 T041.

## Updated Dependencies (Additions)

- T042 before T033; T033 before T034.
- T043 before T036.
- T044 before T039.
- T031 before T032 (T006 already failing test context).
- T015 before T038.
- T034, T036, T039, T041 before T045.

## Additional Parallel Example

```
# After baseline & initial tests
T042 T043 T044 (all failing test introductions in separate files)
# Then implementations
T033 T036 T039 (parallel), then T034 (after T033), T031->T032 sequence.
```
