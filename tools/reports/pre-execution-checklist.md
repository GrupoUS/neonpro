# Phase 5 — Pre-Execution Checklist (NeonPro)

Purpose: Validate repo health and artifacts before advancing Phase 5 tasks to review/done.

## Validation Gates
- Repo Green (blocking):
  - [x] Type check (tsc --noEmit --skipLibCheck) — passing
  - [x] Lint (oxlint .) — 0 errors, warnings acceptable
  - [x] Format (dprint check) — all formatted
- Tests:
  - [ ] Unit (Vitest) — optional for this pass
  - [ ] Integration — optional for this pass
- Docs alignment:
  - [x] Architecture + memory updated to 8-packages, Hono API, Prisma+Supabase

## Artifacts
- Remediation Plan: `tools/reports/remediation-plan.md` (exists)
- This checklist: `tools/reports/pre-execution-checklist.md`

## Scope of Tasks to Advance
- Task A: 9d87b734-a7bd-44f2-a1fc-166ed5c97087 — Phase 5 controlled execution (batch PR mapping/rollback)
- Task B: 221d5ef2-cbae-48ac-9cbb-a864ee4d17b6 — Phase 5 guard-rails and codebase cleanup

## Rollback Criteria
- Any new lint/type errors appear → revert latest change and re-run Full Code Check
- Critical tests failing → revert test-impacting edits and isolate changes

## Next
- Update both tasks → review with links to artifacts
- List all tasks in review → validate → move to done if green
