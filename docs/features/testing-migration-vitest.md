---
title: "Testing Stack Migration to Vitest"
last_updated: 2025-09-03
form: reference
tags: [testing, vitest, migration]
related:
  - ../AGENTS.md
  - ../memory.md
  - ../testing/coverage-policy.md
---

# Testing Stack Migration to Vitest

## Overview

Playwright-based testing and Sentry integration were removed. Husky hooks were already absent. The repository now standardizes on Vitest for unit and integration tests across the monorepo.

## Changes

- Removed Playwright usage from scripts and CI.
- Removed `@playwright/test` deps in root and packages.
- Removed `@sentry/nextjs` from `packages/monitoring` and keyword mention.
- Ensured Vitest is installed at the workspace root with `happy-dom` and `@testing-library/jest-dom`.
- Adjusted `apps/web` scripts to use Vitest.
- Excluded a legacy Playwright-based test from Vitest: `apps/web/tests/external-chat-widget.test.ts`.
- Removed Playwright E2E job from `.github/workflows/ci.yml`.

## Running Tests

- All unit/integration tests: `pnpm test:all`
- Unit tests: `pnpm test:unit`
- Watch mode: `pnpm test:watch`

## Notes

- E2E/visual tests under `tools/` remain in the repo but are not executed; a placeholder script notes Playwright removal.
- Future E2E can be reintroduced with another tool or Vitest + browser runner if needed.
