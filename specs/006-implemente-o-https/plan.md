# Implementation Plan: AI Agent Database Integration

**Branch**: `006-implemente-o-https` | **Date**: 2025-09-19 | **Spec**: [/specs/006-implemente-o-https/spec.md](/specs/006-implemente-o-https/spec.md)  
**Input**: Feature specification from `/specs/006-implemente-o-https/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Create a conversational AI interface for NeonPro that allows healthcare professionals to query client data, appointments, and financial information through natural language. The solution uses CopilotKit for the chat UI, AG-UI Protocol for real-time communication, and ottomator-agents as the backend logic base, with secure integration to Supabase database.

## Technical Context

**Language/Version**: TypeScript 5.0+, Python 3.11+  
**Primary Dependencies**: CopilotKit, AG-UI Protocol, ottomator-agents, Supabase  
**Storage**: Supabase (PostgreSQL) with RLS policies  
**Testing**: Jest/Vitest for unit tests, Playwright for E2E  
**Target Platform**: Web application (Next.js)  
**Performance Goals**: <2s response time for simple queries, support concurrent users  
**Constraints**: Must respect RLS policies, no exposure of service keys, real-time communication  
**Scale/Scope**: Multi-tenant healthcare application with role-based access control  
**Project Type**: web (frontend + backend)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Core Principles from Constitution

- **KISS Principle**: Using existing stack patterns, minimal custom implementation
- **YAGNI Principle**: Building only conversational query interface, not full CRUD operations
- **Chain of Thought**: Clear phased approach with validation at each step

### Constitution Compliance

- ✅ No unnecessary complexity - using proven frameworks
- ✅ Focused on user value - quick data access without navigation
- ✅ Testable requirements - clear acceptance criteria defined
- ✅ Security first - RLS enforcement at all layers

## Project Structure

### Documentation (this feature)

```
specs/006-implemente-o-https/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output ✓
├── data-model.md        # Phase 1 output ✓
├── quickstart.md        # Phase 1 output ✓
├── contracts/           # Phase 1 output ✓
│   └── api.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Web application structure (existing)
apps/web/src/
├── components/
│   └── ai/
│       └── DataAgentChat.tsx          # Chat UI component
├── hooks/
│   └── useAiAgent.ts                  # Custom hooks for agent interaction
└── services/
    └── ai-agent.ts                    # Frontend agent service

apps/api/src/
├── routes/
│   └── ai/
│       └── data-agent.ts              # Agent API endpoint
├── services/
│   ├── ai-data-service.ts             # Database access service
│   └── intent-parser.ts               # Query intent parsing
└── agents/
    ├── ag-ui-rag-agent/               # Ottomator agent integration
    └── config/                        # Agent configuration

tests/
├── unit/
│   ├── ai-data-service.test.ts
│   └── intent-parser.test.ts
├── integration/
│   └── agent-endpoint.test.ts
└── e2e/
    └── ai-chat.spec.ts
```

**Structure Decision**: Web application structure - matches existing NeonPro monorepo pattern

## Phase 0: Outline & Research ✓

1. **Extract unknowns from Technical Context** above:
   - ✅ Resolved: CopilotKit integration patterns
   - ✅ Resolved: AG-UI Protocol implementation
   - ✅ Resolved: Database security with RLS
   - ✅ Resolved: Performance requirements

2. **Generate and dispatch research agents**:
   - ✅ Completed: Research on CopilotKit, AG-UI, ottomator-agents
   - ✅ Completed: Best practices for AI chat interfaces
   - ✅ Completed: Security patterns for database access

3. **Consolidate findings** in `research.md` using format:
   - ✅ Decision: [what was chosen]
   - ✅ Rationale: [why chosen]
   - ✅ Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved ✓

## Phase 1: Design & Contracts ✓

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - ✅ Entity name, fields, relationships
   - ✅ Validation rules from requirements
   - ✅ State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - ✅ For each user action → endpoint
   - ✅ Use standard REST/GraphQL patterns
   - ✅ Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - ✅ One test file per endpoint
   - ✅ Assert request/response schemas
   - ✅ Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - ✅ Each story → integration test scenario
   - ✅ Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - ✅ Update AGENTS.md with new tech stack info
   - ✅ Preserve manual additions between markers
   - ✅ Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, AGENTS.md ✓

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Specific Tasks to Generate**:

1. Setup backend agent endpoint
2. Implement data service with Supabase integration
3. Create frontend chat component with CopilotKit
4. Implement AG-UI protocol communication
5. Add natural language processing for queries
6. Implement response formatting for different data types
7. Add error handling and access control
8. Create comprehensive test suite

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitution violations detected - design follows KISS and YAGNI principles_

## Progress Tracking ✓

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] No complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
