# Implementation Plan: Patient Dashboard Enhancement with Modern UI Components

**Branch**: `001-patient-dashboard-enhancement` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-patient-dashboard-enhancement/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
   → Loaded: Patient Dashboard Enhancement with 15 functional requirements
2. Fill Technical Context ✓
   → Project Type: web (frontend+backend integration)
   → Structure Decision: Frontend enhancement within existing monorepo
3. Evaluate Constitution Check section ✓
   → Simplicity: PASS - Enhancing existing components, not adding new projects
   → Architecture: PASS - Following MCP pattern as component library
   → Testing: PASS - TDD cycle with component and integration tests
4. Execute Phase 0 → research.md ✓
   → All technical decisions documented with rationale
5. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
   → Data models, API contracts, and testing approach defined
6. Re-evaluate Constitution Check section ✓
   → No new violations introduced
7. Plan Phase 2 → Task generation approach described ✓
8. STOP - Ready for /tasks command
```

## Summary
Modernize the existing patient management interface by enhancing UI components using shadcn/ui with experiment-01.json registry, implementing Modular Component Pattern (MCP) for better maintainability, adding advanced data tables with filtering/sorting, multi-step registration forms with Brazilian validation, and ensuring LGPD/ANVISA compliance with WCAG 2.1 AA+ accessibility standards.

## Technical Context
**Language/Version**: TypeScript 5.7.2 with React 19.1.1  
**Primary Dependencies**: shadcn/ui (experiment-01 registry), TanStack Table v8.15, React Hook Form v7.62, Zod v3.23  
**Storage**: Existing Supabase PostgreSQL with RLS (no schema changes)  
**Testing**: Vitest + React Testing Library + Playwright for E2E  
**Target Platform**: Web application (desktop + mobile responsive)  
**Project Type**: web - frontend enhancement within existing monorepo  
**Performance Goals**: <200ms table rendering for 1000+ records, <50ms form validation per field  
**Constraints**: LGPD compliance, WCAG 2.1 AA+ accessibility, mobile-first responsive design  
**Scale/Scope**: 15 functional requirements, 4 core components, 3-phase implementation

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**: ✅ PASS
- Projects: 1 (enhancing existing web app within monorepo)
- Using framework directly? Yes (shadcn/ui components without custom wrappers)
- Single data model? Yes (extending existing Patient entity)
- Avoiding patterns? Yes (direct component composition, no unnecessary abstractions)

**Architecture**: ✅ PASS
- EVERY feature as library? Yes (MCP components in `apps/web/src/components/`)
- Libraries listed: 
  - PatientDataTable (advanced table with filtering/sorting)
  - PatientRegistrationForm (multi-step wizard with validation)
  - DashboardNavigation (sidebar + breadcrumbs + command palette)
  - PatientActions (bulk operations and file upload)
- CLI per library: N/A (UI components, exposed through web interface)
- Library docs: Component documentation with usage examples planned

**Testing (NON-NEGOTIABLE)**: ✅ PASS
- RED-GREEN-Refactor cycle enforced? Yes (tests written before implementation)
- Git commits show tests before implementation? Yes (TDD workflow)
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual Supabase, real form validation)
- Integration tests for: Component data flows, form submissions, table operations
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**: ✅ PASS
- Structured logging included? Yes (user actions, form submissions, errors)
- Frontend logs → backend? Yes (unified error tracking)
- Error context sufficient? Yes (form validation, API errors, accessibility issues)

**Versioning**: ✅ PASS
- Version number assigned? 1.0.0 (new component system)
- BUILD increments on every change? Yes (semantic versioning)
- Breaking changes handled? N/A (additive enhancement to existing system)

## Project Structure

### Documentation (this feature)
```
specs/001-patient-dashboard-enhancement/
├── plan.md              # This file (/plan command output) ✓
├── research.md          # Phase 0 output (/plan command) ✓
├── data-model.md        # Phase 1 output (/plan command) ✓
├── quickstart.md        # Phase 1 output (/plan command) ✓
├── contracts/           # Phase 1 output (/plan command) ✓
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
apps/web/src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── table.tsx          # Enhanced with experiment-01 config
│   │   ├── form.tsx           # Form components with validation
│   │   ├── sidebar.tsx        # Collapsible navigation
│   │   └── dialog.tsx         # Modal and drawer components
│   ├── patient/               # Patient-specific components (MCP)
│   │   ├── PatientDataTable.tsx      # Advanced table component
│   │   ├── PatientRegistrationForm.tsx # Multi-step wizard
│   │   ├── PatientQuickActions.tsx   # Bulk operations
│   │   └── PatientDetailDrawer.tsx   # Mobile details view
│   └── layout/                # Navigation and layout
│       ├── DashboardSidebar.tsx      # Main navigation
│       ├── PatientBreadcrumb.tsx     # Context breadcrumbs
│       └── CommandPalette.tsx        # Global search
├── pages/                     # Existing page components to enhance
├── hooks/                     # Custom hooks for patient data
└── lib/                       # Utilities and validation schemas

tests/
├── components/                # Component unit tests
├── integration/               # Patient flow integration tests
└── e2e/                       # End-to-end user scenarios
```

**Structure Decision**: Web application enhancement (frontend focus within existing monorepo)

## Phase 0: Outline & Research ✅

### Technical Decisions Made

**UI Component Strategy**:
- **Decision**: Use shadcn/ui with experiment-01.json registry
- **Rationale**: Provides enhanced components optimized for data-heavy interfaces, accessibility built-in, Brazilian Portuguese localization support
- **Alternatives considered**: Custom component library (too much overhead), standard shadcn (lacks advanced table features)

**State Management Approach**:
- **Decision**: TanStack Query + Zustand + React Hook Form
- **Rationale**: TanStack Query for server state with caching, Zustand for simple client state, React Hook Form for complex multi-step forms
- **Alternatives considered**: Redux Toolkit (overkill for scope), useState only (insufficient for complex forms)

**Form Validation Strategy**:
- **Decision**: Zod schemas with Brazilian-specific validation
- **Rationale**: Runtime validation, TypeScript integration, custom CPF/phone/CEP validators
- **Alternatives considered**: Yup (less TypeScript support), custom validation (reinventing wheel)

**Table Enhancement Approach**:
- **Decision**: TanStack Table with shadcn Table components
- **Rationale**: Headless table logic with accessible UI, advanced filtering/sorting, virtual scrolling for performance
- **Alternatives considered**: Material-UI DataGrid (design inconsistency), custom table (performance issues)

**Brazilian Compliance Integration**:
- **Decision**: Extend existing LGPD utilities, add ANVISA-specific audit trails
- **Rationale**: Leverage proven compliance patterns, avoid regulatory gaps
- **Alternatives considered**: Third-party compliance service (vendor lock-in), manual compliance (error-prone)

**Output**: research.md with all technical decisions documented ✅

## Phase 1: Design & Contracts ✅

### Data Model Enhancements
Enhanced existing Patient entity with additional fields for UI optimization:
- Display preferences (table density, column visibility)
- Form progress tracking for multi-step registration
- Accessibility preferences (contrast, font size)
- Mobile optimization flags

### API Contract Enhancements
Extended existing patient endpoints with:
- Advanced filtering parameters (date ranges, status filters, text search)
- Bulk operation endpoints (batch updates, exports)
- File upload endpoints for patient documents
- Real-time subscription endpoints for live updates

### Component Contracts
Defined TypeScript interfaces for:
- PatientDataTable component props and state
- PatientRegistrationForm wizard configuration
- Navigation component integration points
- Accessibility compliance interfaces

**Output**: data-model.md, /contracts/*, failing component tests, quickstart.md ✅

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate component-focused tasks from design artifacts
- Each shadcn component installation → setup task [P]
- Each MCP component → development task with tests
- Each user scenario → integration test task
- Each accessibility requirement → compliance test task

**Ordering Strategy**:
- TDD order: Component tests before implementation
- Dependency order: Base UI components → Patient components → Integration
- Registry setup → Core components → Advanced features → Testing → Polish
- Mark [P] for parallel execution where components are independent

**Estimated Task Categories**:
1. **Registry & Foundation** (4 tasks): shadcn setup, base component installation
2. **Core Components** (8 tasks): PatientDataTable, PatientRegistrationForm, navigation
3. **Integration & Polish** (6 tasks): mobile optimization, accessibility, performance
4. **Testing & Validation** (4 tasks): E2E scenarios, compliance verification

**Estimated Output**: 22 numbered, ordered tasks in tasks.md with clear acceptance criteria

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (accessibility audit, performance testing, compliance verification)

## Complexity Tracking
*No constitutional violations identified - all checks passed*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (None)

---
*Based on Constitution v2.0.0 - See `.specify/memory/constitution.md`*