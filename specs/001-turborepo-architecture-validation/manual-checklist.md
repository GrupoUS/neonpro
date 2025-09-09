# Manual Checklist — Turborepo Validation (NeonPro)

Use this to verify and fix common issues quickly. Each item links to the report line(s).

## Structure

- [ ] Confirm monorepo layout
  - Expected: apps/_, packages/_, tools/*
  - Check: pnpm-workspace.yaml includes these globs
  - If missing, edit pnpm-workspace.yaml accordingly

## Internal Packages

- [ ] Packages use @neonpro/* scope and workspace:*
  - Files: packages/*/package.json
  - If not, set version to "workspace:*" and run install

```bash
pnpm install --frozen-lockfile
```

## Turbo Pipeline

- [ ] build dependsOn ^build and outputs declared
  - File: turbo.json → tasks.build
- [ ] Per-package build tasks declared where needed
  - File: turbo.json → @neonpro/*#build entries
- [ ] type-check dependsOn ^build and caches tsbuildinfo

## App Scripts

- [ ] apps/api has dev/build/start/type-check/test scripts
- [ ] apps/web has dev/build/start/lint/type-check/test scripts

## Environment

- [ ] globalEnv and env whitelists set for tasks
- [ ] remoteCache enabled (optional but recommended)

## TypeScript

- [ ] Root tsconfig base vs project references
  - Consider tsconfig.base.json + per-package tsconfig
  - Ensure turbo run type-check succeeds across workspace

## Run a smoke

```bash
# install deps
pnpm install --frozen-lockfile

# build all
pnpm turbo run build

# type-check all
pnpm turbo run type-check

# unit tests (fast path)
pnpm vitest run --reporter=verbose
```

## After fixes

- [ ] Update validation.report.yaml notes for any changes
- [ ] Re-run quality gate tasks

```bash
# VS Code Tasks
# ✅ Full Code Check
# 🔍 Lint Code
# 🚀 Type Check
# 🧪 Run Tests
```
