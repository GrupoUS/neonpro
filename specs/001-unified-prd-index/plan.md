# Implementation Plan: Unified PRD Index, KPI Normalization, AI & Compliance Governance

**Branch**: `001-unified-prd-index` | **Date**: 2025-09-10 | **Spec**: `specs/001-unified-prd-index/spec.md`
**Input**: Feature specification from `/specs/001-unified-prd-index/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Primary objective: Produce a single canonical, governance-enforced PRD index consolidating executive summary, personas, features, normalized KPI table (with baseline + phased targets + formulas), risk matrix, roadmap milestones, and compliance/AI governance sections while eliminating duplicated/contradictory legacy fragments.

Technical approach (Phase 0 outcomes):
- Documentation unification via deterministic structure + controlled vocabulary enforcement.
- KPI normalization with explicit formula field + provisional baseline tagging + escalation workflow design.
- Governance integration: AI hallucination threshold (<5% Phase 1) + compliance SLA table (export, deletion, consent revocation) + RLS + encryption references.
- Traceability matrix connecting Requirements → KPIs → Risks → Governance Controls to enable auditability.
- KISS/YAGNI enforcement: deferred speculative features (predictive modeling, autonomous AI) until governance maturity.

## Technical Context

**Language/Version**: TypeScript 5.7.x, React 19, Node (Bun runtime for scripts)
**Primary Dependencies**: React, Vite, TanStack Router, TanStack Query, Supabase (Auth, Postgres, Edge Functions), Hono (API), Zod (validation), shadcn/ui, Tailwind CSS
**Storage**: PostgreSQL (Supabase managed) with RLS + AES-256 at rest, TLS 1.2+ in transit
**Testing**: Vitest (unit + integration), Playwright (E2E), Contract tests (REST/Edge endpoints), Coverage gates ≥90% for compliance-critical logic
**Target Platform**: Web (frontend + backend service layer); deploy via Vercel + Supabase
**Project Type**: web (frontend + backend) → Monorepo apps/web + apps/api + shared packages
**Performance Goals**: LCP ≤2.5s (P95), AI governance response latency ≤800ms P95, Realtime event propagation ≤1s, Bundle initial JS ≤250KB gz
**Constraints**: Maintain KISS (no premature microservices), avoid redundant DTO layers, enforce test-first for contracts, p95 API <200ms for KPI/metadata endpoints
**Scale/Scope**: Initial target ≤10 internal stakeholders + future scaling to broader clinical ops; ~50–80 PRD entities (features/KPIs/risks) tracked

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: [#] (max 3 - e.g., api, cli, tests)
- Using framework directly? (no wrapper classes)
- Single data model? (no DTOs unless serialization differs)
- Avoiding patterns? (no Repository/UoW without proven need)

**Architecture**:

- EVERY feature as library? (no direct app code)
- Libraries listed: [name + purpose for each]
- CLI per library: [commands with --help/--version/--format]
- Library docs: llms.txt format planned?

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? (test MUST fail first)
- Git commits show tests before implementation?
- Order: Contract→Integration→E2E→Unit strictly followed?
- Real dependencies used? (actual DBs, not mocks)
- Integration tests for: new libraries, contract changes, shared schemas?
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included?
- Frontend logs → backend? (unified stream)
- Error context sufficient?

**Versioning**:

- Version number assigned? (MAJOR.MINOR.BUILD)
- BUILD increments on every change?
- Breaking changes handled? (parallel tests, migration plan)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (web application) justified by dual-layer (frontend consumption + backend governance indexing) already present in monorepo (`apps/web`, `apps/api`). No additional projects introduced (stays within existing structure).

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)\
**Phase 4**: Implementation (execute tasks.md following constitutional principles)\
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach described; concrete tasks produced via /tasks already present)
- [x] Phase 3: Tasks generated (/tasks command output = tasks.md v1)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (no violations; simplicity maintained)
- [x] Post-Design Constitution Check: PASS (design retained single data model layer + avoided extra repos)
- [ ] All NEEDS CLARIFICATION resolved (4 remain: FR-022–FR-025)
- [ ] Complexity deviations documented (N/A so far)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
