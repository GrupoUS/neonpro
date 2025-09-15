# Tasks: Patient Dashboard Enhancement with Modern UI Components

**Input**: Design documents from `/specs/001-patient-dashboard-enhancement/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Execution Flow (main)
Based on analysis of design documents:
- **Tech Stack**: React 19.1.1, TypeScript 5.7.2, shadcn/ui (experiment-01), TanStack ecosystem
- **Structure**: Frontend enhancement within existing monorepo (`apps/web/src/`)
- **API Contracts**: 12 endpoints for patient CRUD, filtering, bulk operations
- **Data Models**: Enhanced Patient entity with UI preferences and Brazilian validation
- **Testing Strategy**: Vitest + React Testing Library + Playwright E2E

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Paths follow monorepo structure: `apps/web/src/`

## Phase 3.1: Setup & Dependencies
- [ ] T001 Install shadcn/ui components and configure experiment-01.json registry
- [ ] T002 [P] Install TanStack dependencies (Table v8.15, Query v5.59, Router v1.91)
- [ ] T003 [P] Install form dependencies (React Hook Form v7.62, Zod v3.23, @hookform/resolvers)
- [ ] T004 [P] Configure Brazilian validation utilities (CPF, phone, CEP validation)
- [ ] T005 [P] Set up testing dependencies (Vitest, React Testing Library, Playwright)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Integration)
- [ ] T006 [P] Contract test GET /api/v1/patients in apps/web/src/tests/contract/patients-list.test.ts
- [ ] T007 [P] Contract test POST /api/v1/patients in apps/web/src/tests/contract/patients-create.test.ts
- [ ] T008 [P] Contract test PUT /api/v1/patients/{id} in apps/web/src/tests/contract/patients-update.test.ts
- [ ] T009 [P] Contract test DELETE /api/v1/patients/{id} in apps/web/src/tests/contract/patients-delete.test.ts
- [ ] T010 [P] Contract test POST /api/v1/patients/bulk-operations in apps/web/src/tests/contract/patients-bulk.test.ts
- [ ] T011 [P] Contract test GET /api/v1/patients/export in apps/web/src/tests/contract/patients-export.test.ts

### Component Tests
- [ ] T012 [P] Component test PatientDataTable in apps/web/src/components/patients/__tests__/PatientDataTable.test.tsx
- [ ] T013 [P] Component test PatientRegistrationForm in apps/web/src/components/patients/__tests__/PatientRegistrationForm.test.tsx
- [ ] T014 [P] Component test PatientFilters in apps/web/src/components/patients/__tests__/PatientFilters.test.tsx
- [ ] T015 [P] Component test PatientBulkActions in apps/web/src/components/patients/__tests__/PatientBulkActions.test.tsx

### Integration Tests
- [ ] T016 [P] Integration test patient registration flow in apps/web/src/tests/integration/patient-registration.test.ts
- [ ] T017 [P] Integration test patient data table with filtering in apps/web/src/tests/integration/patient-table.test.ts
- [ ] T018 [P] Integration test bulk operations workflow in apps/web/src/tests/integration/patient-bulk-ops.test.ts
- [ ] T019 [P] Integration test mobile responsive behavior in apps/web/src/tests/integration/patient-mobile.test.ts

### Validation Tests
- [ ] T020 [P] Validation test Brazilian CPF validator in apps/web/src/lib/validators/__tests__/cpf.test.ts
- [ ] T021 [P] Validation test Brazilian phone validator in apps/web/src/lib/validators/__tests__/phone.test.ts
- [ ] T022 [P] Validation test CEP validator in apps/web/src/lib/validators/__tests__/cep.test.ts
- [ ] T023 [P] Validation test LGPD consent schema in apps/web/src/lib/schemas/__tests__/lgpd.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Brazilian Validation Utilities
- [ ] T024 [P] Brazilian CPF validator in apps/web/src/lib/validators/cpf.ts
- [ ] T025 [P] Brazilian phone number validator in apps/web/src/lib/validators/phone.ts
- [ ] T026 [P] Brazilian CEP validator with address lookup in apps/web/src/lib/validators/cep.ts
- [ ] T027 [P] LGPD consent Zod schema in apps/web/src/lib/schemas/lgpd.ts

### Data Schemas
- [ ] T028 [P] Enhanced Patient Zod schema in apps/web/src/lib/schemas/patient.ts
- [ ] T029 [P] Patient table state schema in apps/web/src/lib/schemas/table-state.ts
- [ ] T030 [P] Patient filter schema in apps/web/src/lib/schemas/filters.ts

### Core Components
- [ ] T031 [P] PatientDataTable component in apps/web/src/components/patients/PatientDataTable.tsx
- [ ] T032 [P] PatientRegistrationForm component in apps/web/src/components/patients/PatientRegistrationForm.tsx
- [ ] T033 [P] PatientFilters component in apps/web/src/components/patients/PatientFilters.tsx
- [ ] T034 [P] PatientBulkActions component in apps/web/src/components/patients/PatientBulkActions.tsx
- [ ] T035 [P] PatientExportDialog component in apps/web/src/components/patients/PatientExportDialog.tsx

### Hooks & State Management
- [ ] T036 [P] usePatientTable hook in apps/web/src/hooks/usePatientTable.ts
- [ ] T037 [P] usePatientForm hook in apps/web/src/hooks/usePatientForm.ts
- [ ] T038 [P] usePatientFilters hook in apps/web/src/hooks/usePatientFilters.ts
- [ ] T039 [P] useBulkOperations hook in apps/web/src/hooks/useBulkOperations.ts

### API Integration
- [ ] T040 Enhanced patient queries in apps/web/src/queries/patients.ts
- [ ] T041 Patient mutations (create, update, delete) in apps/web/src/mutations/patients.ts
- [ ] T042 Bulk operations mutations in apps/web/src/mutations/patient-bulk.ts
- [ ] T043 Export operations service in apps/web/src/services/patient-export.ts

## Phase 3.4: Integration & Pages
- [ ] T044 Patient dashboard page integration in apps/web/src/routes/patients/index.tsx
- [ ] T045 Patient registration page in apps/web/src/routes/patients/register.tsx
- [ ] T046 Patient edit page in apps/web/src/routes/patients/[id]/edit.tsx
- [ ] T047 Navigation updates for patient routes in apps/web/src/components/layout/Navigation.tsx
- [ ] T048 Breadcrumb integration in apps/web/src/components/layout/Breadcrumbs.tsx

## Phase 3.5: Polish & Optimization
- [ ] T049 [P] Performance optimization for large datasets in apps/web/src/components/patients/PatientDataTable.tsx
- [ ] T050 [P] Mobile responsiveness enhancements in apps/web/src/components/patients/
- [ ] T051 [P] Accessibility improvements (WCAG 2.1 AA+) across patient components
- [ ] T052 [P] LGPD compliance features integration
- [ ] T053 [P] Error handling and loading states
- [ ] T054 [P] Internationalization support (pt-BR)
- [ ] T055 [P] Update component documentation in apps/web/src/components/patients/README.md
- [ ] T056 [P] E2E tests with Playwright in apps/web/src/tests/e2e/patient-workflows.spec.ts
- [ ] T057 Run complete test suite and performance validation
- [ ] T058 Final integration testing following quickstart.md scenarios

## Dependencies
- **Setup** (T001-T005) before everything
- **All Tests** (T006-T023) before implementation (T024-T058)
- **Validators** (T024-T027) before schemas (T028-T030)
- **Schemas** (T028-T030) before components (T031-T035)
- **Components** (T031-T035) before hooks (T036-T039)
- **Hooks** (T036-T039) before API integration (T040-T043)
- **Core implementation** (T024-T043) before pages (T044-T048)
- **Everything** before polish (T049-T058)

## Parallel Execution Examples

### Setup Phase (can run simultaneously)
```bash
# Launch T002-T005 together:
Task: "Install TanStack dependencies (Table v8.15, Query v5.59, Router v1.91)"
Task: "Install form dependencies (React Hook Form v7.62, Zod v3.23, @hookform/resolvers)"
Task: "Configure Brazilian validation utilities (CPF, phone, CEP validation)"
Task: "Set up testing dependencies (Vitest, React Testing Library, Playwright)"
```

### Contract Tests (can run simultaneously)
```bash
# Launch T006-T011 together:
Task: "Contract test GET /api/v1/patients in apps/web/src/tests/contract/patients-list.test.ts"
Task: "Contract test POST /api/v1/patients in apps/web/src/tests/contract/patients-create.test.ts"
Task: "Contract test PUT /api/v1/patients/{id} in apps/web/src/tests/contract/patients-update.test.ts"
Task: "Contract test DELETE /api/v1/patients/{id} in apps/web/src/tests/contract/patients-delete.test.ts"
```

### Component Tests (can run simultaneously)
```bash
# Launch T012-T015 together:
Task: "Component test PatientDataTable in apps/web/src/components/patients/__tests__/PatientDataTable.test.tsx"
Task: "Component test PatientRegistrationForm in apps/web/src/components/patients/__tests__/PatientRegistrationForm.test.tsx"
Task: "Component test PatientFilters in apps/web/src/components/patients/__tests__/PatientFilters.test.tsx"
Task: "Component test PatientBulkActions in apps/web/src/components/patients/__tests__/PatientBulkActions.test.tsx"
```

### Core Components (can run simultaneously)
```bash
# Launch T031-T035 together:
Task: "PatientDataTable component in apps/web/src/components/patients/PatientDataTable.tsx"
Task: "PatientRegistrationForm component in apps/web/src/components/patients/PatientRegistrationForm.tsx"
Task: "PatientFilters component in apps/web/src/components/patients/PatientFilters.tsx"
Task: "PatientBulkActions component in apps/web/src/components/patients/PatientBulkActions.tsx"
```

## Notes
- [P] tasks = different files, can be executed in parallel
- All tests must fail before implementing functionality (TDD)
- Brazilian validation is critical for LGPD compliance
- Mobile-first responsive design throughout
- WCAG 2.1 AA+ accessibility standards enforced
- Performance targets: <200ms table rendering, <50ms form validation

## Task Generation Rules
*Applied during analysis of design documents*

1. **From Contracts** (patient-api.json):
   - 12 API endpoints → 6 contract test tasks [P]
   - Each endpoint group → corresponding implementation tasks

2. **From Data Model** (data-model.md):
   - Enhanced Patient entity → schema and validation tasks [P]
   - Brazilian-specific fields → validator tasks [P]
   - LGPD consent → compliance feature tasks [P]

3. **From Quickstart** (quickstart.md):
   - 5 test scenarios → 5 integration test tasks [P]
   - Performance targets → optimization tasks [P]
   - Accessibility requirements → compliance tasks [P]

4. **From Research** (research.md):
   - shadcn/ui experiment-01 → component installation tasks
   - TanStack ecosystem → dependency setup tasks
   - Brazilian compliance → validation and schema tasks

## Validation Checklist
*GATE: Checked before task execution*

- [x] All 12 API endpoints have corresponding contract tests
- [x] All 4 core components have test tasks before implementation
- [x] All Brazilian validators have dedicated test tasks
- [x] TDD order enforced: tests before implementation
- [x] Parallel tasks are in different files with no dependencies
- [x] Each task specifies exact file path within monorepo
- [x] Mobile responsiveness and accessibility included
- [x] LGPD compliance requirements covered
- [x] Performance optimization tasks included