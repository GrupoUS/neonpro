---
title: MVP Test Plan — NeonPro
last_updated: 2025-09-08
form: how-to
tags: [testing, unit, integration, e2e, smoke]
related:
  - ../features/smoke-checklist.md
  - ../testing/coverage-policy.md
---

# MVP Test Plan — NeonPro

## Scope

- Components: Auth, Patient CRUD, Scheduling, Health-check
- Out of scope: Advanced finance, external integrations by default

## Test Types

- Unit: services/utils (Vitest)
- Integration: API routes + DB (Vitest projects)
- E2E Smoke (staging): checklist in `features/smoke-checklist.md`

## Environments

- Local: pnpm + Vitest
- CI: PRs run unit + type-check
- Staging: E2E smoke after deploy

## Entry/Exit Criteria

- Entry: Build OK, envs configured
- Exit: ≥95% smoke pass, type-check PASS, unit PASS

## Coverage Targets

- Critical modules ≥90% lines/branches (see coverage-policy.md)

## Commands

```bash
pnpm vitest run --project unit --reporter=verbose
pnpm vitest run --project integration --reporter=verbose
pnpm exec playwright test -g @smoke
```
