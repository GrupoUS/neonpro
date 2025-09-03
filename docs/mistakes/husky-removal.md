---
title: "Git Hooks/Husky Removal — Cleanup"
last_updated: 2025-09-03
form: explanation
tags: [mistake, tooling, git]
related:
  - ../AGENTS.md
  - ../memory.md
---

# Git Hooks/Husky Removal — Cleanup

## Problem

Pre-push/pre-commit hooks enforced through Husky were blocking the workflow and not desired anymore.

## Wrong Approach

Keeping Husky and hook scripts after changing CI/quality flow leads to unexpected local failures and friction.

## Correct Solution

- Ensure `.husky/` directory is removed (no hooks remain).
- Remove any Husky references from root `package.json` (devDependency/scripts).
- Validate repo with format, lint, and type-check tasks.

## Root Cause

Legacy tooling remained after migrating to centralized CI and monorepo quality tasks.

## Prevention

- When deprecating tooling, remove dependencies, scripts, and hook directories.
- Keep a single source of truth for quality gates (CI + repo scripts).

## Related Files

- `package.json` (verify no Husky references)
- `.husky/` (should not exist)
- Tasks: format, lint, type-check
