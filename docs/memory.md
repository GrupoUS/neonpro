# Memory Management Protocol - Version: 1.0.0

## Purpose & Scope

This rule outlines the critical protocol for consulting and maintaining persistent knowledge to enhance AI performance, ensure consistency, and prevent the repetition of errors. It governs the interaction with files that store project-specific information, learned corrections, API documentation, database schemas, user coding preferences, and application features. Adherence to this protocol is mandatory for all AI interactions.

## Implementation Guidelines

### Core Operational Mandates

1) Initial Memory Scan (MANDATORY FIRST STEP)
- MUST read, at the very beginning of every request:
  - Project orchestrator: [docs/AGENTS.md](./AGENTS.md)
  - Coding standards & preferences: [docs/rules/coding-standards.md](./rules/coding-standards.md)

2) Targeted Memory Consultation (AS NEEDED)
- Database interactions:
  - Consolidated schema guide: [docs/database-schema/database-schema-consolidated.md](./database-schema/database-schema-consolidated.md)
  - Tables reference: [docs/database-schema/tables/tables-consolidated.md](./database-schema/tables/tables-consolidated.md)
  - Folder with per-area docs: [docs/database-schema/](./database-schema/)
- API interactions:
  - API guide: [docs/apis/apis.md](./apis/apis.md)
  - API orchestrator: [docs/apis/AGENTS.md](./apis/AGENTS.md)
  - Folder with endpoint docs: [docs/apis/](./apis/)
- Testing (standards and workflow):
  - [docs/testing/coverage-policy.md](./testing/coverage-policy.md)
  - [docs/testing/react-test-patterns.md](./testing/react-test-patterns.md)
  - [docs/testing/e2e-testing.md](./testing/e2e-testing.md)
  - [docs/testing/ci-pipelines.md](./testing/ci-pipelines.md)
- Agents and coordination (when relevant):
  - [docs/agents/AGENTS.md](./agents/AGENTS.md)
- Errors and prior fixes:
  - [docs/mistakes/](./mistakes/)

3) Proactive Update Protocol (MANDATORY FINAL STEP)
- At the conclusion of each request, review whether updates are needed:
  - Mistakes: `docs/mistakes/[error-category].md` (newly found and fixed issues)
  - Features: `docs/features/[feature-name].md` (new/changed features)
  - APIs: `docs/apis/` (created/modified/removed endpoints and behavior changes)
  - Database schema: `docs/database-schema/` (created/modified/removed schema elements)
  - Project standards: [docs/AGENTS.md](./AGENTS.md) if global standards changed
  - Coding standards: [docs/rules/coding-standards.md](./rules/coding-standards.md) if clarified
- Confirmation: In your notes/thoughts, explicitly confirm you checked these and whether updates were made.

### Specific Memory File Management
- mistakes/[error-category].md — Problem, wrong approach, correct solution, root cause, prevention, related files.
- features/[feature-name].md — Overview, architecture, key components, APIs, DB schema, configuration, common issues, testing strategy, last updated.
- docs/database-schema/*.md — DDL/relationships/RLS changes recorded alongside migrations.
- docs/apis/*.md — Endpoint docs: path, method, purpose, request/response, auth, file path.

### General Memory Hygiene
- Clarity and Structure: Use headings; group related info.
- Relevance: Prefer reusable, generally applicable notes.
- Conciseness: Be clear, avoid verbosity.
- Up-to-Date: Update entries when better solutions emerge.
- File Organization: Descriptive filenames, consistent naming.
- Cross-References: Link related mistakes, features, and docs.

## Storage Paths (Resolved)
- Error Documentation: [docs/mistakes/](./mistakes/) → `docs/mistakes/[error-category].md`
- Tests (repository utilities): [tools/tests/](../tools/tests/) (e.g., `tools/tests/integration/*`, `tools/tests/test-utils.ts`)
- Project Orchestrator & Workflow: [docs/AGENTS.md](./AGENTS.md)
- Coding Standards & Rules: [docs/rules/](./rules/) → `coding-standards.md`, `supabase-*.md`, `variables-configuration.md`
- Database Schema: [docs/database-schema/](./database-schema/) → `database-schema-consolidated.md`, `tables/tables-consolidated.md`
- API Documentation: [docs/apis/](./apis/) → `apis.md`, `AGENTS.md` and endpoint files
- Testing Standards & Guides: [docs/testing/](./testing/) → `coverage-policy.md`, `react-test-patterns.md`, `e2e-testing.md`, `ci-pipelines.md`

## Enforcement
- CRITICAL ERROR: Skipping the Initial Memory Scan.
- CRITICAL ERROR: Skipping the Proactive Update Protocol.
- All outputs and actions MUST align with the information in these files and folders.
