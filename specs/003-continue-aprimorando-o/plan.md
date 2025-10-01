
# Implementation Plan: NEONPRO Theme + 7 UI Components Installation & Configuration

**Branch**: `003-continue-aprimorando-o` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-continue-aprimorando-o/spec.md`

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
Installation and configuration of NEONPRO theme system with 7 specific UI components (Shine Border, Kokonut Gradient Button, Aceternity Hover Border Gradient Button, Magic Card, Animated Theme Toggler, Tilted Card, and Aceternity UI Sidebar) for the NeonPro aesthetic clinic platform. The system will integrate multiple UI libraries (Magic UI, Aceternity UI, Kokonut UI) within the Turborepo monorepo structure, ensuring all components inherit NEONPRO brand colors and design tokens while maintaining healthcare compliance and WCAG 2.1 AA+ accessibility standards.

## Technical Context
**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: React 19, TanStack Router v5, Tailwind CSS, shadcn/ui, Framer Motion v11.0.0  
**Storage**: N/A (theme configuration stored in CSS variables and localStorage)  
**Testing**: Vitest 3.x (unit/integration), Playwright 1.4x (E2E accessibility testing)  
**Target Platform**: Web application with mobile-first Brazilian aesthetic clinic focus
**Project Type**: Web application (monorepo with frontend + backend + shared packages)  
**Performance Goals**: <650 kB bundle size, 95%+ WCAG 2.1 AA accessibility, 8.5s build time maximum  
**Constraints**: Must work within existing NeonPro monorepo structure, LGPD compliance required, mobile-first design mandatory  
**Scale/Scope**: 7 UI components across 2 applications (web, api) with shared theme distribution via packages/ui

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### NeonPro Constitutional Compliance
**MANDATORY Requirements**:
- [x] **Aesthetic Clinic Compliance**: Feature complies with LGPD, ANVISA, and relevant professional council regulations for aesthetic procedures
- [x] **AI-Powered Prevention**: Feature proactively prevents problems rather than reacting
- [x] **Brazilian Mobile-First**: Optimized for Brazilian aesthetic clinics and all aesthetic professionals using mobile devices
- [x] **Type Safety**: End-to-end TypeScript with strict mode and aesthetic clinic data validation
- [x] **Performance**: Meets <2s AI response, <500ms API response, 99.9% uptime requirements for aesthetic clinic workflows
- [x] **Privacy by Design**: Implements encryption, audit trails, and PII protection for aesthetic client data
- [x] **MCP Development**: Follows required MCP sequence (sequential-thinking → archon → serena → tools)
- [x] **Quality Gates**: Includes Vitest + Playwright testing with 90%+ coverage for critical components

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

**Structure Decision**: Option 2 (Web application) - Confirmed by Technical Context with frontend + backend + shared packages

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
*Prerequisites: research.md complete*

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
   - Run `.specify/scripts/bash/update-agent-context.sh kilocode`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Specific Task Categories**:
1. **Theme Installation Tasks**:
   - NEONPRO theme CLI installation and configuration
   - CSS variables and Tailwind integration
   - Font loading optimization (Inter, Lora, Libre Baskerville)
   - Theme provider setup and context management

2. **Component Installation Tasks**:
   - Magic UI components (Magic Card, Animated Theme Toggler, Shine Border)
   - Aceternity UI components (Sidebar, Hover Border Gradient Button)
   - Kokonut UI components (Gradient Button)
   - ReactBits components (Tilted Card - manual implementation)
   - Component registry management and dependency resolution

3. **Integration and Customization Tasks**:
   - NEONPRO brand color application across all components
   - Accessibility validation and WCAG 2.1 AA+ compliance
   - Mobile-first responsive design implementation
   - Healthcare compliance validation (LGPD, ANVISA)

4. **Quality Assurance Tasks**:
   - Component rendering tests across browsers
   - Performance impact assessment (bundle size, load times)
   - Accessibility compliance testing
   - Healthcare compliance validation
   - End-to-end integration testing

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Theme → Components → Integration → Validation
- Parallel execution: Independent component installations marked [P]
- Sequential dependencies: Theme setup before component customization

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Deliverables Created**:
- [x] research.md with comprehensive research findings ✅
- [x] data-model.md with detailed entity definitions ✅
- [x] /contracts/ directory with API specifications ✅
- [x] theme-api.json with complete API contracts ✅
- [x] theme-api.test.ts with failing contract tests ✅
- [x] quickstart.md with installation and verification steps ✅

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented ✅

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
