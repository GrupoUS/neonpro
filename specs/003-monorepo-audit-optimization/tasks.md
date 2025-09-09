# Tasks: Monorepo Architecture Audit and Optimization

**Input**: Design documents from `/home/vibecoder/neonpro/specs/003-monorepo-audit-optimization/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   ✅ Complete - Audit tool with 5 services, CLI interface, TDD methodology
2. Load optional design documents:
   ✅ data-model.md: 5 core entities identified → model tasks
   ✅ contracts/: 5 contract files → contract test tasks  
   ✅ research.md: Technology decisions → setup tasks
3. Generate tasks by category:
   ✅ Setup: Node.js/TypeScript project, dependencies, linting
   ✅ Tests: 5 contract tests, 6 integration tests
   ✅ Core: 5 models, 5 services, CLI implementation
   ✅ Integration: logging, performance, configuration
   ✅ Polish: unit tests, benchmarking, documentation
4. Apply task rules:
   ✅ Different files = marked [P] for parallel
   ✅ Same file = sequential (no [P])
   ✅ Tests before implementation (TDD enforced)
5. Number tasks sequentially (T001-T036)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   ✅ All contracts have tests, All entities have models, All CLI commands implemented
9. Return: SUCCESS (36 tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

Single project structure (audit tool):

- **Source**: `src/` at repository root
- **Tests**: `tests/` with contract/, integration/, unit/ subdirectories
- **CLI**: `src/cli/` for command-line interface
- **Models**: `src/models/` for entity definitions
- **Services**: `src/services/` for business logic

## Phase 3.1: Setup (3 tasks)

- [ ] **T001** Create project structure with src/, tests/, docs/ directories per implementation plan
- [ ] **T002** Initialize Node.js 20+ TypeScript 5.7.2 project with ts-morph, bun dependencies in package.json
- [ ] **T003** [P] Configure ESLint, Prettier, and TypeScript compiler options

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY service implementation**

- [ ] **T004** [P] Contract test FileScanner.scan() and scanWithProgress() in tests/contract/file-scanner.contract.test.ts
- [ ] **T005** [P] Contract test DependencyAnalyzer.buildGraph() and analyzeAsset() in tests/contract/dependency-analyzer.contract.test.ts
- [ ] **T006** [P] Contract test ArchitectureValidator.validateAssets() and validateAsset() in tests/contract/architecture-validator.contract.test.ts
- [ ] **T007** [P] Contract test CleanupEngine.createCleanupPlan() and executeCleanupPlan() in tests/contract/cleanup-engine.contract.test.ts
- [ ] **T008** [P] Contract test ReportGenerator.generateAuditReport() and generateExecutiveSummary() in tests/contract/report-generator.contract.test.ts

## Phase 3.3: Integration Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: Based on quickstart scenarios, MUST FAIL before implementation**

- [ ] **T009** [P] Integration test basic file discovery workflow in tests/integration/file-discovery.integration.test.ts
- [ ] **T010** [P] Integration test dependency analysis with circular detection in tests/integration/dependency-analysis.integration.test.ts
- [ ] **T011** [P] Integration test architecture validation against docs in tests/integration/architecture-validation.integration.test.ts
- [ ] **T012** [P] Integration test usage analysis and unused file detection in tests/integration/usage-analysis.integration.test.ts
- [ ] **T013** [P] Integration test cleanup planning with risk assessment in tests/integration/cleanup-planning.integration.test.ts
- [ ] **T014** [P] Integration test complete audit workflow (scan→analyze→validate→cleanup→report) in tests/integration/full-workflow.integration.test.ts

## Phase 3.4: Core Models Implementation (ONLY after tests are failing)

- [ ] **T015** [P] CodeAsset model with AssetType, UsageStatus, ComplianceStatus enums in src/models/CodeAsset.ts
- [ ] **T016** [P] DependencyGraph model with GraphNode, GraphEdge, CircularDependency in src/models/DependencyGraph.ts
- [ ] **T017** [P] ArchitectureDocument model with ValidationRule, ArchitectureStandard in src/models/ArchitectureDocument.ts
- [ ] **T018** [P] AuditReport model with ExecutionSummary, AnalysisResults, ComplianceResults in src/models/AuditReport.ts
- [ ] **T019** [P] CleanupAction model with ImpactAssessment, ActionStatus, RiskLevel in src/models/CleanupAction.ts

## Phase 3.5: Service Layer Implementation

- [ ] **T020** FileScanner service implementing IFileScanner with recursive traversal, progress tracking in src/services/FileScanner.ts
- [ ] **T021** DependencyAnalyzer service implementing IDependencyAnalyzer with AST parsing, circular detection in src/services/DependencyAnalyzer.ts
- [ ] **T022** ArchitectureValidator service implementing IArchitectureValidator with document parsing, rule validation in src/services/ArchitectureValidator.ts
- [ ] **T023** CleanupEngine service implementing ICleanupEngine with safe operations, rollback capability in src/services/CleanupEngine.ts
- [ ] **T024** ReportGenerator service implementing IReportGenerator with multiple formats, metrics in src/services/ReportGenerator.ts

## Phase 3.6: CLI Implementation

- [ ] **T025** Basic CLI structure with command parsing, help system, version info in src/cli/audit-tool.ts
- [ ] **T026** CLI commands implementation for --scan, --analyze, --validate with progress reporting in src/cli/commands.ts
- [ ] **T027** CLI commands implementation for --cleanup, --report with output formatting in src/cli/output.ts

## Phase 3.7: Integration Layer

- [ ] **T028** Structured logging system with JSON format, error context, operation tracking in src/lib/logger.ts
- [ ] **T029** Progress tracking and real-time reporting system in src/lib/progress.ts
- [ ] **T030** Configuration management for options, defaults, validation in src/lib/config.ts
- [ ] **T031** Performance monitoring with metrics collection, memory tracking in src/lib/performance.ts

## Phase 3.8: Polish and Validation

- [ ] **T032** [P] Unit tests for utilities, helpers, and core algorithms in tests/unit/
- [ ] **T033** [P] Performance benchmarking tests validating <30s for 10k files, <500MB memory in tests/performance/
- [ ] **T034** [P] Update README.md, API documentation, and usage examples
- [ ] **T035** [P] Code optimization, duplicate removal, and final cleanup
- [ ] **T036** Final validation using quickstart.md scenarios, fix any remaining issues

## Dependencies

**Phase Dependencies:**

- Setup (T001-T003) before all others
- Contract Tests (T004-T008) before Models (T015-T019)
- Integration Tests (T009-T014) before Services (T020-T024)
- Models (T015-T019) before Services (T020-T024)
- Services (T020-T024) before CLI (T025-T027)
- Integration Layer (T028-T031) requires Services complete
- Polish (T032-T036) requires all implementation complete

**Sequential Dependencies within Services:**

- T020 (FileScanner) blocks T021 (DependencyAnalyzer)
- T021 (DependencyAnalyzer) blocks T022 (ArchitectureValidator)
- T022 (ArchitectureValidator) blocks T023 (CleanupEngine)
- T023 (CleanupEngine) blocks T024 (ReportGenerator)

## Parallel Execution Examples

### Contract Tests Phase (All can run together):

```
Task: "Contract test FileScanner.scan() in tests/contract/file-scanner.contract.test.ts"
Task: "Contract test DependencyAnalyzer.buildGraph() in tests/contract/dependency-analyzer.contract.test.ts"  
Task: "Contract test ArchitectureValidator.validateAssets() in tests/contract/architecture-validator.contract.test.ts"
Task: "Contract test CleanupEngine.createCleanupPlan() in tests/contract/cleanup-engine.contract.test.ts"
Task: "Contract test ReportGenerator.generateAuditReport() in tests/contract/report-generator.contract.test.ts"
```

### Integration Tests Phase (All can run together):

```
Task: "Integration test file discovery in tests/integration/file-discovery.integration.test.ts"
Task: "Integration test dependency analysis in tests/integration/dependency-analysis.integration.test.ts"
Task: "Integration test architecture validation in tests/integration/architecture-validation.integration.test.ts"
Task: "Integration test usage analysis in tests/integration/usage-analysis.integration.test.ts"
Task: "Integration test cleanup planning in tests/integration/cleanup-planning.integration.test.ts"
Task: "Integration test full workflow in tests/integration/full-workflow.integration.test.ts"
```

### Models Phase (All can run together):

```
Task: "CodeAsset model with enums in src/models/CodeAsset.ts"
Task: "DependencyGraph model in src/models/DependencyGraph.ts"
Task: "ArchitectureDocument model in src/models/ArchitectureDocument.ts"
Task: "AuditReport model in src/models/AuditReport.ts"
Task: "CleanupAction model in src/models/CleanupAction.ts"
```

### Polish Phase (Most can run together):

```
Task: "Unit tests in tests/unit/"
Task: "Performance benchmarks in tests/performance/"
Task: "Documentation updates"
Task: "Code optimization"
```

## Notes

- **[P] tasks** = different files, no shared dependencies
- **TDD Enforcement**: All T004-T014 tests must fail before implementing T015-T031
- **Constitutional Compliance**: Every feature as library, CLI per service, structured logging
- **Performance Targets**: 10k+ files in <30s, <500MB memory usage
- **Safety First**: Backup strategies, rollback capabilities, dry-run modes
- **Commit Strategy**: After each task completion for rollback capability

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts (5 files)**:
   - file-scanner.contract.ts → T004 contract test [P]
   - dependency-analyzer.contract.ts → T005 contract test [P]
   - architecture-validator.contract.ts → T006 contract test [P]
   - cleanup-engine.contract.ts → T007 contract test [P]
   - report-generator.contract.ts → T008 contract test [P]

2. **From Data Model (5 entities)**:
   - CodeAsset → T015 model task [P]
   - DependencyGraph → T016 model task [P]
   - ArchitectureDocument → T017 model task [P]
   - AuditReport → T018 model task [P]
   - CleanupAction → T019 model task [P]

3. **From Quickstart Scenarios (6 scenarios)**:
   - File Discovery → T009 integration test [P]
   - Dependency Analysis → T010 integration test [P]
   - Architecture Validation → T011 integration test [P]
   - Usage Analysis → T012 integration test [P]
   - Cleanup Planning → T013 integration test [P]
   - Full Workflow → T014 integration test [P]

4. **Service Implementation (5 services, sequential)**:
   - FileScanner → T020 implementation
   - DependencyAnalyzer → T021 implementation (after T020)
   - ArchitectureValidator → T022 implementation (after T021)
   - CleanupEngine → T023 implementation (after T022)
   - ReportGenerator → T024 implementation (after T023)

## Validation Checklist

_GATE: Checked by main() before task execution_

- [x] All 5 contracts have corresponding tests (T004-T008)
- [x] All 5 entities have model tasks (T015-T019)
- [x] All 11 tests come before implementation (T004-T014 before T015+)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path and interface
- [x] No task modifies same file as another [P] task
- [x] TDD methodology strictly enforced (RED-GREEN-Refactor)
- [x] Constitutional principles maintained (libraries, CLI, logging, testing)

---

**Ready for Execution**: 36 tasks generated, validated, and organized for systematic implementation following constitutional TDD principles.
