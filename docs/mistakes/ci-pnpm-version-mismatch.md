# CI Failure: pnpm version mismatch in GitHub Actions

Date: 2025-09-15
Scope: CI (Unified) workflow

## Problem
The workflow used `pnpm/action-setup@v4` with an explicit `with.version` input while the repository also pins pnpm via the root `package.json` `packageManager` field:

- Workflow: `with.version: 8.15.0`
- package.json: `packageManager: pnpm@8.15.0+sha512.<hash>`

`pnpm/action-setup@v4` requires a single source of truth for pnpm version. Having both causes the action to fail early.

## Root Cause
Version specified twice (workflow input + packageManager). The action forbids multiple version sources to avoid mismatch.

## Fix
- Removed all `with.version` inputs from `pnpm/action-setup@v4` steps in `.github/workflows/ci.yml`.
- The action will now read pnpm version from the root `package.json` `packageManager` field.

## Files Changed
- `.github/workflows/ci.yml` — removed `with.version` on 4 steps.

## Validation
- Local type-check and tests passed using provided tasks.
- Confirmed no other workflows declare a conflicting `with.version`.

## Prevention
- Keep pnpm version pinned only in `package.json` via `packageManager`.
- If a workflow must override pnpm version temporarily, remove the `packageManager` pin or revert after the change — do not use two sources at once.
- Add PR review checklist item to ensure only one pnpm version source is configured.
