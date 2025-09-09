# Implementation Plan: Enhance NeonPro Coding Standards Through Technology Research

**Branch**: `002-improve-coding-standards-research` | **Date**: 2025-09-09 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/002-improve-coding-standards-research/spec.md`

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

Research and enhance NeonPro coding standards by analyzing current tech stack (TanStack Router, Vite, React 19, Supabase, TypeScript) and extracting best practices from official documentation sources. Create comprehensive technology-specific guidelines for healthcare platform development with LGPD compliance integration.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19.1.1, Node.js 20+\
**Primary Dependencies**: TanStack Router, Vite 5.2.0, Supabase 2.45.1, shadcn/ui v4, Tailwind CSS 3.3.0\
**Storage**: Documentation files (.md), knowledge base (Archon MCP)\
**Testing**: Vitest 3.2.0, Testing Library, MSW for mocking\
**Target Platform**: Web browser (documentation consumption), development environment\
**Project Type**: documentation/research - single project structure\
**Performance Goals**: Research completion within 2-4 hours, comprehensive coverage of 8+ technologies\
**Constraints**: Must align with Brazilian healthcare compliance (LGPD/ANVISA), maintain existing document structure\
**Scale/Scope**: 8+ core technologies, 1 existing coding standards document, healthcare-specific patterns

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity** ✅:

- Projects: 1 (documentation enhancement - single focus)
- Using framework directly? ✅ (Direct research of official sources, no wrapper abstractions)
- Single data model? ✅ (Single coding standards document structure)
- Avoiding patterns? ✅ (No unnecessary abstraction layers for documentation)

**Architecture** ✅:

- EVERY feature as library? ✅ (Research outputs as reusable knowledge modules)
- Libraries listed: [Research module per technology + Enhancement consolidation module]
- CLI per library: N/A (documentation project)
- Library docs: Documentation format aligned with existing structure

**Testing (NON-NEGOTIABLE)** ✅:

- RED-GREEN-Refactor cycle enforced? ✅ (Research validation → Enhancement → Verification)
- Git commits show tests before implementation? ✅ (Validation criteria before enhancement)
- Order: Research→Validation→Enhancement→Review strictly followed? ✅
- Real dependencies used? ✅ (Official documentation sources, not secondary sources)
- Integration tests for: Enhanced standards validated against existing codebase ✅
- FORBIDDEN: Enhancement before research, skipping validation phase ✅

**Observability** ✅:

- Structured logging included? ✅ (Research findings documented with sources)
- Frontend logs → backend? N/A (documentation project)
- Error context sufficient? ✅ (Source attribution for all recommendations)

**Versioning** ✅:

- Version number assigned? ✅ (Coding standards document version tracking)
- BUILD increments on every change? ✅ (Document version on enhancements)
- Breaking changes handled? ✅ (Backward compatibility for existing patterns)

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

**Structure Decision**: Documentation project - Uses existing NeonPro monorepo structure with enhancement to `/docs/rules/coding-standards.md`

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

- [x] Phase 0: Research complete (/plan command) - research.md created with comprehensive technology research plan
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, and CLAUDE.md updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - Task generation strategy documented
- [ ] Phase 3: Tasks generated (/tasks command) - Ready for /tasks command execution
- [ ] Phase 4: Implementation complete - Awaiting task execution
- [ ] Phase 5: Validation passed - Final validation pending

**Gate Status**:

- [x] Initial Constitution Check: PASS - All constitutional requirements satisfied for documentation project
- [x] Post-Design Constitution Check: PASS - Design artifacts align with constitutional principles
- [x] All NEEDS CLARIFICATION resolved - No ambiguities remain in technical context
- [x] Complexity deviations documented - No deviations required, project follows constitutional simplicity

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
