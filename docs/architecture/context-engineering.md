---
title: "Intelligent Context Engineering"
last_updated: 2025-09-17
form: reference
tags: [context-engineering, ai-agents, productivity, monorepo]
related:
  - ../AGENTS.md
  - ./source-tree.md
  - ./tech-stack.md
  - ../rules/coding-standards.md
---

# Intelligent Context Engineering — Version: 1.0.0

## Overview

This document defines the minimal, deterministic strategy for AI (and human) contributors to load ONLY the documentation and code context required for a task in the NeonPro monorepo. Goal: **fast cognition + low noise + compliance safety**. Use this instead of ad‑hoc broad file loading.

## Core Principles

- Load by PURPOSE, not by habit.
- Start from the thinnest slice that can validate assumptions.
- Escalate in controlled layers (Meta → Structure → Contracts → Implementations → Edge Cases).
- Never duplicate already loaded context—reference it.
- Compliance surfaces (LGPD/Cosmetic Regulations) always trump speed when client data paths are touched.

## Layered Context Model

| Layer                 | Trigger Question                                   | Artifacts                                                                     | Stop Criterion                        |
| --------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| 0. Task Meta          | What kind of change? (feature, fix, refactor, doc) | Issue / Prompt / `AGENTS.md` workflow                                         | Task category identified              |
| 1. Topology           | Where does this live?                              | `docs/architecture/source-tree.md` (target subtree)                           | Correct target folder chosen          |
| 2. Contracts          | What are the types & boundaries?                   | `packages/types/*`, relevant `interface` / schema files, API route signatures | Input/output shapes known             |
| 3. Service Logic      | Which service orchestrates behavior?               | `packages/core-services/*`, `apps/api/src/...` or `apps/web/src/features/...` | Control flow understood (happy path)  |
| 4. Cross-Cutting      | Are there compliance/security hooks?               | `packages/security/*`, RLS helpers, `database` policy notes                   | Risk points enumerated                |
| 5. Tests & Guarantees | How is behavior validated?                         | Existing tests under same path, `tools/tests/setup.ts`                        | At least 1 existing pattern to mirror |
| 6. Edge / Perf        | Any latency, caching, or scaling considerations?   | `tech-stack.md`, perf utilities, caching helpers                              | No unanswered perf/compliance risks   |

Escalate only if the previous layer leaves unanswered questions.

## Decision Matrix (Task Type → Minimal Initial Context)

| Task Type                   | Load First                                                               | Then Maybe                               | Avoid Initially                            |
| --------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------ |
| Add API endpoint            | `source-tree.md` (api subtree), target route dir, similar existing route | `core-services` service used, type defs  | Whole `packages/` scan                     |
| Modify domain type          | Specific file in `packages/types`, consumers via grep of type name       | Affected `core-services` implementations | Unrelated UI features                      |
| Add UI feature (new screen) | `apps/web/src/routes` + analogous route file                             | Related `features/*` patterns            | Backend packages unless data model unclear |
| Fix backend bug             | Failing test (if any), implicated service file                           | Upstream type definitions, RLS helpers   | Frontend routes                            |
| Performance tweak           | Existing implementation + any caching util/module                        | `tech-stack.md` perf notes               | Full test suite upfront                    |
| Compliance addition         | `security` / `database` policy notes, RLS helpers                        | Call sites in services                   | UI styling files                           |
| Refactor (scoped)           | Symbol overview of target file                                           | Referencing symbols                      | Editing tests before mapping coverage      |
| Cross-cutting logging       | Central logger (or placeholder) + coding standards                       | Call sites sampling (2–3)                | Adding logs in loops without sampling      |

## Minimal Loading Procedure

1. Classify task (matrix row). If unclear → read only first 15–25 lines of `AGENTS.md` core workflow.
2. Identify target subtree (Layer 1) via `source-tree.md`.
3. Pull necessary contracts (Layer 2) for affected data (types/interfaces/Zod schemas).
4. Inspect ONE representative implementation (Layer 3). If pattern consistent → proceed; else sample max 2 more.
5. Scan for security / compliance (Layer 4) ONLY if handling client, appointment, clinic, financial, or PII-related identifiers.
6. Before coding, locate or create at least one test (Layer 5). Mirror existing test naming & structure.
7. Escalate to Layer 6 (edge/perf) only if latency, concurrency, or heavy iteration is introduced.

## Heuristic Guards

- If you opened >6 files without writing anything, pause and re-evaluate scope.
- If adding a parameter leaks a client identifier to logs → STOP and route through secure utility.
- If modifying shared type with >10 references, consider incremental migration (introduce new type alias then replace).
- If a change spans >2 packages unexpectedly, verify it isn’t two separate tasks.

## AI Agent Retrieval Strategy (Implementation)

Pseudo-sequence for an agent planning a feature:

```text
1. classify(feature) -> matrix row
2. load(source-tree segment)
3. locate(types) -> targeted symbols
4. inspect(core-service or route) -> confirm integration points
5. check(security|RLS) if domain = client|clinic|billing
6. discover(existing tests) -> pattern extraction
7. generate(plan) -> diff outline + tests first
```

## Examples

### Example: Add new client risk scoring endpoint

Initial load:

- `docs/architecture/source-tree.md` (API subtree)
- `apps/api/src/routes/*` similar existing file
- `packages/types/src/client/` (client core types)
  Then:
- `packages/core-services/src/services/client*` (scoring integration point)
- `packages/security` (ensure no PII leakage)

### Example: Frontend appointment reschedule UI

Initial load:

- `apps/web/src/routes/appointments/*`
- One analogous route using TanStack Router loader/action
  Then:
- `packages/types/src/appointment` definitions
- Related service in `core-services` (read only signatures first)

## Troubleshooting

| Symptom                            | Resolution                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| “Not sure where symbol is defined” | Use path aliases from `tsconfig.json` to narrow search; start at `packages/types` if it’s a domain entity.              |
| Test instability after change      | Re-open `tools/tests/setup.ts` to confirm globals unchanged; isolate side-effects.                                      |
| Widening refactor scope            | Commit partial boundary doc in `docs/features/feature-name.md` and slice work.                                          |
| Performance regression fear        | Load only relevant section of `tech-stack.md` (performance metrics) before premature optimization.                      |
| Unsure about logging location      | If no central logger exists yet, propose lightweight factory in `packages/utils/logging/`—do NOT scatter `console.log`. |

## Anti-Patterns (Avoid)

- Blanket reading entire `packages/` directory “just in case”.
- Creating new shared package before 2+ concrete consumers exist.
- Expanding a refactor to unrelated feature modules mid-task.
- Adding logs containing raw CPF, client name, or clinic identifiers.
- Writing tests after large implementation instead of incrementally.

## Compliance Hooks Quick Checklist

- PII Field touched? → Ensure type branded (`CPF`, `ClientId`).
- Storage or transmission? → Confirm encryption or redaction path.
- Cross-clinic data access? → Verify RLS helper or access guard.
- External logging or analytics? → Strip or hash sensitive identifiers.

## See Also

- `docs/AGENTS.md`
- `docs/architecture/source-tree.md`
- `docs/architecture/tech-stack.md`
- `docs/rules/coding-standards.md`
- `docs/mistakes/` (for documented pitfalls)
