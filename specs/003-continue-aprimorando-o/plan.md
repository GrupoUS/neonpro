
# Implementation Plan: NEONPRO Theme + 7 UI Components Installation & Configuration

**Branch**: `003-continue-aprimorando-o` | **Date**: 2025-09-29 | **Spec**: `/specs/003-continue-aprimorando-o/spec.md`
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
Install and configure NEONPRO theme + 7 UI components from multiple registries into Next.js monorepo using CLI + manual adjustments approach. System will install NEONPRO theme from tweakcn registry plus components from Magic UI, Aceternity UI, Kokonut UI, and ReactBits, all integrated with shared styling in packages directory for consumption across all apps with local font installation, Context API + localStorage for theme persistence, and dependency conflict resolution.

## Technical Context
**Language/Version**: TypeScript 5.9.2 + React 19
**Primary Dependencies**: shadcn CLI, Tailwind CSS, Next.js, pnpm workspaces, Framer Motion v11.0.0
**Storage**: N/A (theme and component configuration files)
**Testing**: Vitest + Playwright for theme and component functionality testing
**Target Platform**: Web (Next.js monorepo)
**Project Type**: Web (monorepo with shared packages)
**Performance Goals**: <500ms theme switching, <2s font loading, LCP ≤2.5s for themed pages
**Constraints**: Must work with existing shadcn components, maintain WCAG 2.1 AA compliance, resolve dependency conflicts
**Scale/Scope**: 5+ apps in monorepo, 20+ themed components, 3 fonts (Inter, Lora, Libre Baskerville), 7 new UI components
**Key Integration Challenge**: Multiple UI library registries with shared Framer Motion v11.0.0 dependency

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### NeonPro Constitutional Compliance
**MANDATORY Requirements**:
- [x] **Aesthetic Clinic Compliance**: Feature complies with LGPD, ANVISA, and relevant professional council regulations for aesthetic procedures
- [x] **AI-Powered Prevention**: Feature proactively prevents UI dependency conflicts and theme integration issues
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

**Structure Decision**: Option 2 (Web application) - Theme installation affects both frontend packages and shared UI components in monorepo

## Phase 0: A.P.T.E - Analyze & Research
**A.P.T.E Methodology Implementation**:

### **A**nalyze - Requirements Analysis
1. **Extract unknowns from Technical Context**:
   - Registry configuration for multiple UI libraries
   - Framer Motion v11.0.0 compatibility across components
   - CSS variable conflicts between theme and components
   - Icon library integration (@tabler/icons-react vs Lucide React)

2. **Multi-source research validation**:
   - Context7 → Official documentation research
   - Tavily → Current best practices and trends
   - Archon → Project knowledge base integration

3. **Constitutional analysis**:
   - Brazilian aesthetic clinic compliance validation
   - WCAG 2.1 AA+ accessibility requirements
   - Performance impact assessment for bundled components

### **P**lan - Strategic Planning
1. **Dependency conflict resolution strategy**:
   - Framer Motion version alignment matrix
   - CSS variable namespace isolation
   - Icon library integration approach

2. **Installation sequence optimization**:
   - Theme foundation first
   - Component registry configuration
   - Parallel installation where possible

3. **Quality gate definition**:
   - Component functionality validation
   - Theme consistency verification
   - Performance benchmark establishment

**Output**: research.md with all NEEDS CLARIFICATION resolved and A.P.T.E methodology documented

## Phase 1: A.P.T.E - Plan & Design
*Prerequisites: research.md complete*

### **P**lan - System Design
1. **Extract entities from feature spec** → `data-model.md`:
   - Theme configuration entities
   - UI component interfaces
   - Registry management structures
   - Dependency relationship models

2. **Generate integration contracts** from functional requirements:
   - Component registry configuration schema
   - Theme adaptation layer contracts
   - Dependency conflict resolution protocols
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate component specification tests**:
   - Theme installation validation tests
   - Component integration tests
   - Cross-library compatibility tests
   - Tests must fail (no implementation yet)

### **T**hink - Meta-cognitive Analysis
1. **Multi-perspective evaluation**:
   - Developer perspective: Implementation complexity and maintenance
   - User perspective: Consistent theming and component behavior
   - Business perspective: ROI on UI component investment
   - Security perspective: Dependency vulnerability management

2. **Risk assessment and mitigation**:
   - Dependency conflict probability analysis
   - Performance impact assessment
   - Accessibility compliance validation
   - Constitutional alignment verification

3. **Constitutional compliance validation**:
   - LGPD compliance for data handling
   - ANVISA requirements for aesthetic clinics
   - WCAG 2.1 AA+ accessibility verification

**Output**: data-model.md, /contracts/*, failing tests, constitutional compliance matrix, agent-specific file

## Phase 2: A.P.T.E - Task Planning
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### **E**xecute - Systematic Implementation Planning
**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Apply TDD methodology: Tests before implementation
- Constitutional compliance validation integrated
- Dependency management strategy embedded

**Ordering Strategy**:
- **Foundation First**: Theme installation before components
- **Conflict Resolution**: Dependency management before component integration
- **Quality Assurance**: Test creation before implementation
- **Parallel Execution**: Mark [P] for independent tasks

**A.P.T.E Task Categories**:

**Theme Foundation Tasks**:
- NEONPRO theme CLI installation and configuration
- Local font optimization (Inter, Lora, Libre Baskerville)
- Context API + localStorage theme persistence
- Tailwind CSS configuration with oklch color integration
- Theme provider implementation with constitutional compliance
- Cross-app theme consistency verification

**UI Components Integration Tasks**:
- Component registry configuration (Magic UI, Aceternity UI, Kokonut UI)
- Magic Card installation from Magic UI registry
- Animated Theme Toggler integration with theme provider
- Gradient Button installation from Kokonut UI
- Tilted Card manual implementation (ReactBits)
- Aceternity UI Sidebar with @tabler/icons-react
- Framer Motion v11.0.0 compatibility validation
- CSS variable conflict resolution
- Icon library integration (Lucide + Tabler)

**Quality & Compliance Tasks**:
- WCAG 2.1 AA+ accessibility validation
- Component theme adaptation verification
- Performance benchmarking and optimization
- Constitutional compliance documentation
- Integration testing across all applications

**Dependency Management Tasks**:
- Registry configuration in components.json
- Version conflict resolution protocols
- Shared dependency optimization
- Bundle size analysis and optimization

**Estimated Output**: 45-50 numbered, ordered tasks in tasks.md with A.P.T.E methodology integration

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

---

**PHASE 1 COMPLETE** ✅
- Research.md: A.P.T.E methodology with multi-source research validation
- Data-model.md: Comprehensive interfaces for theme + UI components
- Contracts/: Integration specifications and conflict resolution protocols
- Quickstart.md: Step-by-step guide with constitutional compliance
- Agent context: Updated with multi-library integration technologies

**READY FOR /tasks COMMAND** → Execute `/tasks` to generate A.P.T.E implementation tasks

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
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
