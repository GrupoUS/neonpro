---
title: "Memory Management Protocol"
version: 2.0.0
last_updated: 2025-09-02
language: en
llm:
  guardrails:
    stop_criteria: "Only finish after scan, consultation, and update checks are confirmed"
    tone: "concise, procedural, English"
    formatting: "Markdown headings, short lists, fenced code blocks"
  mandatory_sequence:
    - initial-memory-scan
    - targeted-consultation
    - proactive-update
  pre_read:
    - path: "docs/AGENTS.md"
      reason: "Docs orchestrator"
    - path: "docs/rules/coding-standards.md"
      reason: "Coding standards and preferences"
---

# Memory Management Protocol — Version: 2.0.0

## Purpose & Scope

Defines the mandatory protocol for consulting and maintaining persistent project knowledge to enhance AI performance, ensure consistency, and prevent repeated mistakes. Applies to project information, learned corrections, API docs, DB schemas, coding preferences, and features.

## LLM Quick Start

- Step 1 — Initial Memory Scan (MANDATORY)
- Step 2 — Targeted Memory Consultation (AS NEEDED)
- Step 3 — Proactive Update Protocol (MANDATORY FINAL)
- Step 4 — Confirm in your notes whether updates were required and applied.

## Implementation Guidelines

### 1) Initial Memory Scan (MANDATORY FIRST STEP)

MUST read at the beginning of every request:

- Project orchestrator: [`docs/AGENTS.md`](./AGENTS.md)
- Coding standards & preferences: [`docs/rules/coding-standards.md`](./rules/coding-standards.md)

### 2) Targeted Memory Consultation (AS NEEDED)

- Database interactions:
  - Consolidated schema: [`docs/database-schema/database-schema-consolidated.md`](./database-schema/database-schema-consolidated.md)
  - Tables reference: [`docs/database-schema/tables/tables-consolidated.md`](./database-schema/tables/tables-consolidated.md)
  - Folder per-area docs: [`docs/database-schema/`](./database-schema/)
- API interactions:
  - API guide: [`docs/apis/apis.md`](./apis/apis.md)
  - API orchestrator: [`docs/apis/AGENTS.md`](./apis/AGENTS.md)
  - Folder: [`docs/apis/`](./apis/)
- Testing (standards & workflow):
  - [`docs/testing/coverage-policy.md`](./testing/coverage-policy.md)
  - [`docs/testing/react-test-patterns.md`](./testing/react-test-patterns.md)
  - [`docs/testing/e2e-testing.md`](./testing/e2e-testing.md)
  - [`docs/testing/ci-pipelines.md`](./testing/ci-pipelines.md)
- Agents & coordination (when relevant): [`docs/agents/AGENTS.md`](./agents/AGENTS.md)
- Errors & prior fixes: [`docs/mistakes/`](./mistakes/)

### 3) Proactive Update Protocol (MANDATORY FINAL STEP)

At the conclusion of each request, review whether updates are needed:

- Mistakes: `docs/mistakes/[error-category].md`
- Features: `docs/features/[feature-name].md`
- APIs: `docs/apis/`
- Database schema: `docs/database-schema/`
- Project standards: [`docs/AGENTS.md`](./AGENTS.md)
- Coding standards: [`docs/rules/coding-standards.md`](./rules/coding-standards.md)

Confirmation: Explicitly note in your thoughts whether updates were made or not.

## Specific Memory File Management

- `docs/mistakes/[error-category].md` — Problem, wrong approach, correct solution, root cause, prevention, related files.
- `docs/features/[feature-name].md` — Overview, architecture, key components, APIs, DB schema, configuration, common issues, testing strategy, last updated.
- `docs/database-schema/*.md` — DDL/relationships/RLS changes recorded alongside migrations.
- `docs/apis/*.md` — Endpoint docs: path, method, purpose, request/response, auth, file path.

## General Memory Hygiene

- Clarity & Structure: Use headings and group related info.
- Relevance: Prefer reusable, generally applicable notes.
- Conciseness: Be clear; avoid verbosity.
- Up-to-date: Revise when better solutions emerge.
- File Organization: Descriptive filenames; consistent naming.
- Cross-References: Link related mistakes, features, and docs.

## Storage Paths (Resolved)

- Error Documentation: [`docs/mistakes/`](./mistakes/) → `docs/mistakes/[error-category].md`
- Tests (repository utilities): [`tools/tests/`](../tools/tests/) (e.g., `tools/tests/integration/*`, `tools/tests/test-utils.ts`)
- Project Orchestrator & Workflow: [`docs/AGENTS.md`](./AGENTS.md)
- Coding Standards & Rules: [`docs/rules/`](./rules/) → `coding-standards.md`, `supabase-*.md`, `variables-configuration.md`
- Database Schema: [`docs/database-schema/`](./database-schema/) → `database-schema-consolidated.md`, `tables/tables-consolidated.md`
- API Documentation: [`docs/apis/`](./apis/) → `apis.md`, `AGENTS.md` and endpoint files
- Testing Standards & Guides: [`docs/testing/`](./testing/) → `coverage-policy.md`, `react-test-patterns.md`, `e2e-testing.md`, `ci-pipelines.md`

## Enforcement

- CRITICAL ERROR: Skipping the Initial Memory Scan.
- CRITICAL ERROR: Skipping the Proactive Update Protocol.
- All outputs and actions MUST align with these files and folders.

## Templates

### Mistake Entry

```markdown
---
title: "[Error Category]: [Short Summary]"
last_updated: 2025-09-02
form: explanation
tags: [mistake, area]
related:
  - ../AGENTS.md
  - ../memory.md
---

# [Error Category] — [Short Summary]

## Problem

Brief description + impact.

## Wrong Approach

What didn’t work and why.

## Correct Solution

Step-by-step fix.

## Root Cause

Underlying reason.

## Prevention

Checklist/policy to avoid recurrence.

## Related Files

Paths and PRs.
```

### Feature Entry

```markdown
---
title: "[Feature Name]"
last_updated: 2025-09-02
form: reference
tags: [feature, area]
related:
  - ../AGENTS.md
  - ../memory.md
---

# [Feature Name]

## Overview

Purpose and scope.

## Architecture

Key components and diagrams (link or describe).

## APIs

Endpoints with links to `docs/apis/`.

## Database Schema

Tables and relations with links to `docs/database-schema/`.

## Configuration

Env vars and flags.

## Common Issues

Known pitfalls and fixes.

## Testing Strategy

Unit/integration/E2E notes.
```
