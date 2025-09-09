# Implementation Plan: Monorepo Architecture Audit and Optimization

**Branch**: `003-monorepo-audit-optimization` | **Date**: 2025-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/vibecoder/neonpro/specs/003-monorepo-audit-optimization/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   ✅ Complete - Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   ✅ Complete - Project Type: single (monorepo audit tool)
3. Evaluate Constitution Check section below
   ✅ Complete - No violations identified for audit tool
   ✅ Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → Pending - Research monorepo best practices and audit techniques
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
   → Pending - Design audit system and reporting contracts
6. Re-evaluate Constitution Check section
   → Pending - Post-design constitution validation
7. Plan Phase 2 → Task generation approach described
8. ✅ STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Comprehensive monorepo audit and optimization tool that recursively analyzes all files in `apps/` and `packages/` directories, validates against architectural documentation (source-tree.md, tech-stack.md), identifies unused/orphaned resources, ensures proper Turborepo/Hono/TanStack Router compliance, and generates detailed cleanup reports. The system will trace dependency graphs, handle edge cases like dynamic imports, and provide before/after optimization metrics.

## Technical Context

**Language/Version**: Node.js 20+ with TypeScript 5.7.2\
**Primary Dependencies**: Turborepo workspace analysis, AST parsing libraries, File system utilities\
**Storage**: File system analysis and temporary reporting data\
**Testing**: Bun test framework with comprehensive integration tests\
**Target Platform**: Node.js development environment\
**Project Type**: single (monorepo audit CLI tool)\
**Performance Goals**: Process 10k+ files within 30 seconds, Memory usage <500MB\
**Constraints**: Non-destructive analysis mode, Rollback capability for all cleanup operations\
**Scale/Scope**: Handle monorepos with 100+ packages, 50k+ files, Complex routing patterns

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (audit-tool)
- Using framework directly? YES (Node.js fs, path, AST parsers directly)
- Single data model? YES (file system representation with usage tracking)
- Avoiding patterns? YES (direct file operations, no unnecessary abstractions)

**Architecture**:

- EVERY feature as library? YES
- Libraries listed:
  - file-scanner: Recursive directory traversal and file discovery
  - dependency-analyzer: Import/export tracing and usage analysis
  - architecture-validator: Compliance checking against documentation
  - cleanup-engine: Safe file removal with rollback capability
  - report-generator: Comprehensive audit reporting
- CLI per library: audit-tool --scan, --analyze, --validate, --cleanup, --report
- Library docs: llms.txt format planned? YES

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? YES (contract tests fail first)
- Git commits show tests before implementation? YES
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (actual file system, real monorepo structure)
- Integration tests for: file scanning, dependency analysis, cleanup operations
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included? YES (JSON format with file paths, operations)
- Frontend logs → backend? N/A (CLI tool)
- Error context sufficient? YES (file paths, dependency chains, operation context)

**Versioning**:

- Version number assigned? 0.1.0
- BUILD increments on every change? YES
- Breaking changes handled? N/A (initial version)

## Project Structure

### Documentation (this feature)

```
specs/003-monorepo-audit-optimization/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (SELECTED - audit tool)
src/
├── models/
│   ├── CodeAsset.ts
│   ├── DependencyGraph.ts
│   ├── ArchitectureDocument.ts
│   └── AuditReport.ts
├── services/
│   ├── FileScanner.ts
│   ├── DependencyAnalyzer.ts
│   ├── ArchitectureValidator.ts
│   ├── CleanupEngine.ts
│   └── ReportGenerator.ts
├── cli/
│   └── audit-tool.ts
└── lib/
    ├── ast-parser.ts
    ├── file-utils.ts
    └── config-loader.ts

tests/
├── contract/
│   ├── file-scanner.contract.test.ts
│   ├── dependency-analyzer.contract.test.ts
│   └── cleanup-engine.contract.test.ts
├── integration/
│   ├── full-audit-workflow.test.ts
│   ├── monorepo-analysis.test.ts
│   └── cleanup-operations.test.ts
└── unit/
    ├── models/
    ├── services/
    └── lib/
```

**Structure Decision**: Option 1 - Single project (audit tool with library components)

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - AST parsing libraries for TypeScript/JavaScript analysis
   - Turborepo workspace detection and configuration parsing
   - File system traversal patterns for large monorepos
   - Dependency graph algorithms for circular dependency detection
   - Safe file cleanup operations with rollback mechanisms

2. **Generate and dispatch research agents**:
   ```
   Task: "Research AST parsing libraries for TypeScript dependency analysis"
   Task: "Find best practices for Turborepo workspace configuration detection"
   Task: "Research monorepo file organization patterns and standards"
   Task: "Investigate Hono and TanStack Router integration patterns"
   Task: "Find safe file cleanup strategies with rollback capability"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [AST parser choice, file system approach, cleanup strategy]
   - Rationale: [performance, accuracy, safety considerations]
   - Alternatives considered: [other parsers, manual regex, different cleanup approaches]

**Output**: research.md with all technology choices researched and validated

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - CodeAsset: file path, type, usage status, dependencies, compliance
   - DependencyGraph: nodes, edges, circular detection, traversal
   - ArchitectureDocument: standards, patterns, validation rules
   - AuditReport: findings, metrics, cleanup actions, rollback data
   - CleanupAction: file operations, justification, impact assessment

2. **Generate API contracts** from functional requirements:
   - FileScanner.scan(directory: string): CodeAsset[]
   - DependencyAnalyzer.buildGraph(assets: CodeAsset[]): DependencyGraph
   - ArchitectureValidator.validate(assets: CodeAsset[], docs: ArchitectureDocument[]): ValidationResult[]
   - CleanupEngine.execute(actions: CleanupAction[]): AuditReport
   - ReportGenerator.generate(report: AuditReport): string
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - file-scanner.contract.test.ts: Test directory scanning and asset discovery
   - dependency-analyzer.contract.test.ts: Test graph building and circular detection
   - architecture-validator.contract.test.ts: Test compliance checking
   - cleanup-engine.contract.test.ts: Test safe cleanup operations
   - report-generator.contract.test.ts: Test comprehensive reporting
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Full monorepo audit workflow integration test
   - Architecture compliance validation test
   - Safe cleanup with rollback test
   - Edge case handling (dynamic imports, complex routing) test

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh claude`
   - Add: TypeScript AST parsing, Turborepo workspace analysis, File system operations
   - Preserve existing context, add monorepo audit capabilities
   - Update recent changes with audit tool implementation
   - Keep under 150 lines for token efficiency
   - Output to `/home/vibecoder/neonpro/CLAUDE.md`

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate from Phase 1 contracts and data models:
  - Each service contract → contract test task [P]
  - Each entity model → model creation task [P]
  - Each user scenario → integration test task
  - CLI implementation tasks to orchestrate services
  - Documentation tasks for quickstart validation

**Ordering Strategy**:

- TDD order: Contract tests first, then implementation
- Dependency order: Models → Services → CLI → Integration
- Mark [P] for parallel execution:
  - All model creation tasks
  - All service contract tests
  - Independent utility functions

**Estimated Output**: 28-32 numbered, ordered tasks in tasks.md

**Key Task Categories**:

1. Contract Tests (5 tasks) - P
2. Model Implementation (4 tasks) - P
3. Service Implementation (5 tasks) - Sequential dependency chain
4. CLI Integration (3 tasks) - After services complete
5. Integration Tests (4 tasks) - After implementation
6. Documentation & Validation (3 tasks) - Final validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)\
**Phase 4**: Implementation (execute tasks.md following constitutional principles)\
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations identified_

All design decisions align with constitutional principles:

- Single project with clear library separation
- Direct framework usage without unnecessary abstractions
- TDD approach with failing tests first
- Real dependencies (actual file system operations)
- Structured logging and error handling

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) ✅ 2025-09-09
- [x] Phase 1: Design complete (/plan command) ✅ 2025-09-09
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅ 2025-09-09
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented (NONE) ✅

**Artifacts Generated**:

- [x] research.md - Technology analysis and decisions ✅
- [x] data-model.md - Complete entity definitions ✅
- [x] contracts/ - 5 service contracts with comprehensive interfaces ✅
- [x] quickstart.md - 15-minute validation workflow ✅
- [x] CLAUDE.md - Updated agent context with audit capabilities ✅

---

_Based on Constitution v2.1.1 - Implementation ready for task generation_
