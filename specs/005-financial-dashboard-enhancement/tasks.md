# Tasks: Financial Dashboard Enhancement for NeonPro

**Input**: Design documents from `/specs/005-financial-dashboard-enhancement/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, spec.md ✓

## Execution Flow (main)

```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 14+, Shadcn MCP, Recharts, TanStack Query, Zustand
   → Structure: Web application (frontend + backend integration)
2. Load optional design documents ✓:
   → data-model.md: 4 core entities (financial_transactions, financial_metrics, dashboard_preferences, audit_logs)
   → research.md: Shadcn MCP experiment-03 integration decisions
3. Generate tasks by category ✓:
   → Setup: Shadcn MCP registry, dependencies, linting
   → Tests: API contracts, component tests, integration scenarios
   → Core: Chart components, dashboard layout, data services
   → Integration: Supabase APIs, real-time updates, export features
   → Polish: Performance optimization, compliance validation, documentation
4. Apply task rules ✓:
   → Different files = marked [P] for parallel execution
   → Same file = sequential implementation
   → Tests before implementation (TDD mandatory)
5. Number tasks sequentially (T001-T046) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓:
   → All financial APIs have tests ✓
   → All chart components have tests ✓
   → All user scenarios covered ✓
9. Return: SUCCESS (46 tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in descriptions

## Path Conventions

**Web Application Structure** (per plan.md):

- **Frontend**: `apps/web/src/` with components, pages, services
- **Backend Integration**: Supabase functions and migrations
- **Tests**: Component tests, API tests, integration scenarios

## Phase 3.1: Setup & Foundation (Days 1-2)

### Project Setup

- [ ] **T000** Instale o Shadcn MCP registry usando npx shadcn init https://ui-experiment-03.vercel.app/r/experiment-03.json em `apps/web/` (se necessário procure informações em https://github.com/origin-space/ui-experiments/tree/main/apps/experiment-03)
- [ ] **T001** Initialize Shadcn MCP registry from experiment-03.json in `apps/web/`
- [ ] **T002** [P] Configure project dependencies: Recharts, TanStack Query, Zustand, date-fns
- [x] **T003** [P] Set up linting rules for financial components in `.eslintrc.json`
- [ ] **T004** [P] Configure TypeScript strict mode for financial data types in `tsconfig.json`

### Database Schema

- [ ] **T005** Create financial transactions table migration in `supabase/migrations/001_financial_transactions.sql`
- [x] **T006** Create financial metrics materialized view in `supabase/migrations/002_financial_metrics.sql`
- [ ] **T007** Create dashboard preferences table in `supabase/migrations/003_dashboard_preferences.sql`
- [ ] **T008** Create audit logs table with LGPD compliance in `supabase/migrations/004_audit_logs.sql`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### API Contract Tests

- [x] **T009** [P] Contract test GET /api/financial/dashboard in `apps/web/tests/contract/financial-dashboard.test.ts`
- [x] **T010** [P] Contract test GET /api/financial/metrics in `apps/web/tests/contract/financial-metrics.test.ts`
- [x] **T011** [P] Contract test POST /api/financial/export in `apps/web/tests/contract/financial-export.test.ts`
- [x] **T012** [P] Contract test WebSocket /ws/financial/updates in `apps/web/tests/contract/financial-websocket.test.ts`

### Component Tests

- [x] **T013** [P] Chart component test for MRR visualization in `apps/web/tests/components/chart-mrr.test.tsx`
- [x] **T014** [P] Chart component test for ARR trends in `apps/web/tests/components/chart-arr.test.tsx`
- [x] **T015** [P] Chart component test for churn analysis in `apps/web/tests/components/chart-churn.test.tsx`
- [x] **T016** [P] Dashboard layout responsive test in `apps/web/tests/components/dashboard-layout.test.tsx`

### Integration Tests

- [x] **T017** [P] Integration test: Financial dashboard loading scenario in `apps/web/tests/integration/dashboard-loading.test.ts`
- [x] **T018** [P] Integration test: Date range filtering workflow in `apps/web/tests/integration/date-filtering.test.ts`
- [x] **T019** [P] Integration test: Export functionality end-to-end in `apps/web/tests/integration/export-workflow.test.ts`
- [x] **T020** [P] Integration test: Mobile responsiveness validation in `apps/web/tests/integration/mobile-responsive.test.ts`

**CRITICAL: Tests T009-T020 MUST be written and MUST FAIL before ANY implementation**

## Phase 3.3: Core Implementation (Days 3-5) - ONLY after tests are failing

### Data Services

- [x] **T021** [P] Financial metrics service with TanStack Query in `apps/web/src/services/financial-metrics.ts`
- [x] **T022** [P] Dashboard data aggregation service in `apps/web/src/services/dashboard-data.ts`
- [x] **T023** [P] Export service for PDF/Excel generation in `apps/web/src/services/export.ts`
- [x] **T024** [P] Zustand store for dashboard state in `apps/web/src/stores/dashboard-store.ts`

### Chart Components (Shadcn MCP + Recharts)

- [ ] **T025** [P] Base chart wrapper component in `apps/web/src/components/charts/chart-base.tsx`
- [ ] **T026** [P] MRR trend chart component in `apps/web/src/components/charts/chart-mrr.tsx`
- [ ] **T027** [P] ARR growth chart component in `apps/web/src/components/charts/chart-arr.tsx`
- [ ] **T028** [P] Customer churn analysis chart in `apps/web/src/components/charts/chart-churn.tsx`
- [ ] **T029** [P] Revenue segments chart component in `apps/web/src/components/charts/chart-segments.tsx`

### Dashboard Components

- [ ] **T030** Dashboard grid layout system in `apps/web/src/components/dashboard/dashboard-grid.tsx`
- [ ] **T031** Date range picker with Brazilian locale in `apps/web/src/components/dashboard/date-range-picker.tsx`
- [ ] **T032** Dashboard filters component in `apps/web/src/components/dashboard/dashboard-filters.tsx`
- [ ] **T033** Main dashboard layout with Shadcn components in `apps/web/src/components/dashboard/dashboard-layout.tsx`

## Phase 3.4: Integration & Features (Days 6-7)

### API Integration

- [ ] **T034** Supabase API functions for financial aggregations in `supabase/functions/financial-dashboard/`
- [ ] **T035** Real-time WebSocket integration for live updates in `apps/web/src/hooks/use-financial-realtime.ts`
- [ ] **T036** Authentication middleware for financial data access in `apps/web/src/middleware/auth-financial.ts`
- [ ] **T037** LGPD audit logging implementation in `apps/web/src/utils/audit-logger.ts`

### Advanced Features

- [ ] **T038** PDF export with clinic branding in `apps/web/src/utils/pdf-export.ts`
- [ ] **T039** Excel export with financial formatting in `apps/web/src/utils/excel-export.ts`
- [ ] **T040** Dark/light theme integration with Shadcn in `apps/web/src/components/theme/theme-provider.tsx`
- [ ] **T041** Mobile-optimized chart interactions in `apps/web/src/hooks/use-mobile-charts.ts`

## Phase 3.5: Polish & Validation (Days 8-10)

### Performance & Optimization

- [ ] **T042** [P] Chart data virtualization for large datasets in `apps/web/src/utils/chart-virtualization.ts`
- [ ] **T043** [P] Performance testing: <2s load time validation in `apps/web/tests/performance/dashboard-load.test.ts`
- [ ] **T044** [P] Bundle size optimization: <100KB additional impact analysis

### Compliance & Documentation

- [ ] **T045** LGPD compliance audit and validation checklist execution
- [ ] **T046** Update project documentation with financial dashboard setup in `docs/features/financial-dashboard.md`

## Dependencies & Critical Path

### Phase Dependencies

1. **Setup (T001-T008)** must complete before any other work
2. **Tests (T009-T020)** must complete and FAIL before implementation
3. **Data Services (T021-T024)** before Chart Components (T025-T029)
4. **Chart Components (T025-T029)** before Dashboard Components (T030-T033)
5. **Core Implementation (T021-T033)** before Integration (T034-T041)
6. **Everything** before Polish (T042-T046)

### Critical Blocking Dependencies

- T005-T008 (DB migrations) block T021-T022 (data services)
- T021-T024 (services/store) block T025-T029 (chart components)
- T025-T029 (charts) block T030-T033 (dashboard layout)
- T034-T037 (API integration) block T038-T041 (advanced features)

## Parallel Execution Examples

### Phase 3.1 Setup (Parallel)

```bash
# Launch T002-T004 together (different config files):
Task: "Configure project dependencies: Recharts, TanStack Query, Zustand, date-fns in package.json"
Task: "Set up linting rules for financial components in .eslintrc.json"
Task: "Configure TypeScript strict mode for financial data types in tsconfig.json"
```

### Phase 3.2 Contract Tests (Parallel)

```bash
# Launch T009-T012 together (different test files):
Task: "Contract test GET /api/financial/dashboard in apps/web/tests/contract/financial-dashboard.test.ts"
Task: "Contract test GET /api/financial/metrics in apps/web/tests/contract/financial-metrics.test.ts"
Task: "Contract test POST /api/financial/export in apps/web/tests/contract/financial-export.test.ts"
Task: "Contract test WebSocket /ws/financial/updates in apps/web/tests/contract/financial-websocket.test.ts"
```

### Phase 3.3 Chart Components (Parallel)

```bash
# Launch T025-T029 together (different component files):
Task: "Base chart wrapper component in apps/web/src/components/charts/chart-base.tsx"
Task: "MRR trend chart component in apps/web/src/components/charts/chart-mrr.tsx"
Task: "ARR growth chart component in apps/web/src/components/charts/chart-arr.tsx"
Task: "Customer churn analysis chart in apps/web/src/components/charts/chart-churn.tsx"
```

## Quality Gates & Success Criteria

### Test Coverage Requirements

- **95% coverage** for financial components (T013-T016)
- **90% coverage** for API integration (T009-T012)
- **100% coverage** for LGPD compliance features (T037, T045)

### Performance Targets

- **<2 second** initial dashboard load (T043)
- **<500ms** chart interactions (T041)
- **90+ mobile** Lighthouse score (T020)

### Compliance Validation

- **LGPD audit trail** implementation (T037)
- **ANVISA financial reporting** compliance (T045)
- **CFM professional standards** validation (T045)

## Constitutional Compliance Checkpoints

### TDD Enforcement

- [ ] All tests (T009-T020) written and failing before implementation
- [ ] RED-GREEN-REFACTOR cycle followed strictly
- [ ] Real Supabase dependencies used (no mocks)

### Mobile-First Validation

- [ ] Touch-optimized chart interactions (T041)
- [ ] Responsive dashboard layout (T030, T033)
- [ ] Mobile performance targets met (T043)

### Healthcare Standards

- [ ] Patient financial data protection (T037)
- [ ] Comprehensive audit logging (T008, T037)
- [ ] Brazilian regulatory compliance (T045)

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **Verify tests fail** before implementing (T009-T020 critical)
- **Commit after each task** for clean git history
- **Constitutional gates** must pass at each phase
- **Performance targets** validated continuously

## Task Generation Rules Applied

1. **From Data Model**: 4 entities → 4 migration tasks + service layers
2. **From Research**: Shadcn MCP integration → setup and component tasks
3. **From Spec**: 12 functional requirements → corresponding test and implementation tasks
4. **From Plan**: 5-phase structure → organized task phases with dependencies

## Validation Checklist

- [x] All financial APIs have corresponding tests (T009-T012)
- [x] All chart components have tests (T013-T016)
- [x] All tests come before implementation (T009-T020 before T021+)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constitutional requirements integrated throughout
- [x] Brazilian healthcare compliance addressed (T037, T045)

---

**Template Version**: 1.1.0 | **Constitution Version**: 1.0.0 | **Last Updated**: 2025-01-15
_Total Tasks: 46 | Estimated Duration: 10 business days | TDD Compliance: Mandatory_
