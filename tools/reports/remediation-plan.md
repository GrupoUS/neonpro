# Phase 5 — Controlled Execution Remediation Plan

Status: Draft (awaiting approval)
Date: 2025-09-06
Owner: apex-dev + Refactor + QA
Project: NeonPro

Scope: Non-breaking cleanup in small, reversible batches with guard-rails. Each PR must keep the repo green and be safely revertible.

## Batches and PR Mapping

- PR-001: Accessibility UI — remove unused imports/vars, fix JSX text escapes
  - Paths: apps/web/components/accessibility/**, apps/web/components/error-boundaries/**
  - Rules targeted: no-unused-vars, react/no-unescaped-entities, jsx-curly-brace-presence
  - Rollback: revert single commit; UI-only, no API changes

- PR-002: Chat (WhatsApp) — types tightening and cleanup
  - Paths: apps/web/app/components/chat/**, apps/api/src/routes/whatsapp.ts
  - Rules targeted: no-unused-vars, @typescript-eslint/no-explicit-any (surface-level only)
  - Rollback: revert commit; route untouched or minimal

- PR-003: API Middleware — unused imports/params, underscore unused
  - Paths: apps/api/src/middleware/**
  - Rules targeted: no-unused-vars, underscore unused parameters, minor log improvements
  - Rollback: revert commit; no schema changes

- PR-004: Core Services — remove unused interfaces/types (notification, health)
  - Paths: packages/core-services/src/**
  - Rules targeted: no-unused-vars, dead type cleanup only
  - Rollback: revert commit; no behavior change

- PR-005: UI Package — obvious unused exports/imports
  - Paths: packages/ui/src/**
  - Rules targeted: no-unused-vars, minimal type fixes
  - Rollback: revert commit; package-only

- PR-006: Tests — unused vars/imports, jest globals cleanup
  - Paths: apps/web/tests/**, tools/tests/**
  - Rules targeted: no-unused-vars, no-explicit-any (when trivial)
  - Rollback: revert commit

## Guard-Rails & Verification

- One-batch-per-PR; no mixed concerns
- Commands per PR:
  - npx dprint check
  - npx oxlint .
  - npx tsc --noEmit --skipLibCheck
  - pnpm vitest run --reporter=verbose (fast path)
- Acceptance: build green, tests pass; functional parity
- Rollback: revert PR, re-run checks

## Notes

- Baseline warnings (oxlint): 1367 (2025-09-06)
- Target reduction (initial): ≥ 40% cumulatively across PR-001…PR-006

---
Progress 2025-09-06:
- PR-001: Accessibility + API types hygiene
  - Fixed lint in apps/api/src/middleware/error-handler.ts: converted `type ErrorLike` → `interface ErrorLike`, `errors?: Array<any>` → `any[]`.
  - Ran full code check: 0 errors, warnings unchanged. Repo green.
- PR-Docs: Standardized code fences in docs/architecture/aesthetic-platform-flows.md to ```ts; ran dprint fmt and full code check. Verified no remaining ```typescript|tsx|js fences via content search. Repo remains green (0 errors).