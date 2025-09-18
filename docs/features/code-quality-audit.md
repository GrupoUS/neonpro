---
title: "Code Quality Audit Workflow"
version: 3.2.0
last_updated: 2025-09-17
status: active
form: reference
tags: [audit, testing, compliance, lgpd]
---

# Code Quality Audit Workflow — v3.2.0

## Overview
- Canonical companion to `.github/prompts/code-quality-audit.prompt.md`.
- Aligns multi-agent reviews with LGPD/ANVISA requirements and monorepo scripts.
- Applies to all backend/database changes, high-risk frontend updates, and compliance regressions.

## What's New in 3.2.0
- Process & Tooling integration section mandates workspace scripts and Archon evidence logging.
- Regression enforcement: `pnpm test:healthcare -- --regression` for code changes, `-- --audit-only` after gate failures.
- Expanded emergency-access expectations (break-glass logging, 48h doc follow-up, anonymization reminders).
## Required Scripts
- `pnpm lint`
- `pnpm type-check`
- `pnpm test:backend`
- `pnpm test:frontend`
- `pnpm test:a11y`
- `pnpm test:healthcare -- --regression`
- `pnpm test:healthcare -- --audit-only`
- `pnpm constitutional:full`
- `pnpm constitutional:quick`
- `pnpm constitutional:benchmark`

## Documentation Touchpoints
- `docs/AGENTS.md`
- `docs/architecture/source-tree.md`
- `docs/testing/AGENTS.md`
- `docs/testing/database-security-testing.md`
- `docs/mistakes/automation.md`

## Runbook Checklist
1. Preload the audit prompt and confirm Archon/Serena/Desktop Commander sequence is active.
2. Register regression run IDs and attach Vitest/Playwright artifacts to the active Archon task.
3. Archive CLI output for every script above; redact PHI before sharing.
4. Schedule a 48h follow-up task to verify documentation sync and compliance sign-off.
5. Update this feature doc whenever the prompt version changes, noting new expectations.
