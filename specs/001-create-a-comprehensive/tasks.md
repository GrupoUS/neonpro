# Tasks: Monorepo Integration Verification & Organization

**Input**: Design documents from `/home/vibecode/neonpro/specs/001-create-a-comprehensive/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow
```
1. Load plan.md from feature directory ✅
   → Implementation plan loaded: Monorepo verification/organization
   → Tech stack: TypeScript 5.9.2, TanStack Router, Vite, React 19, tRPC v11, Prisma, Supabase
   → Structure: Existing NeonPro monorepo (apps/ + packages/)
2. Load design documents ✅:
   → data-model.md: Verification entities (IntegrationVerificationChecklist, ImportDependencyMap, etc)
   → contracts/: Verification process interfaces and validation rules
   → research.md: Analysis methodology using serena MCP + TypeScript compiler
   → quickstart.md: Step-by-step execution guide with safety measures
3. Generate tasks by category:
   → Setup: Environment validation, tool preparation
   → Tests: Verification validation tests (TDD approach)
   → Core: Structure analysis, import mapping, duplicate detection
   → Integration: Compliance validation, safety checks
   → Polish: Documentation, reports, cleanup execution
4. Task rules applied:
   → Different analysis areas = [P] parallel execution
   → Same codebase analysis = sequential (dependency on serena results)
   → Tests before analysis implementation (TDD)
   → Safety validation before any cleanup
5. Tasks numbered T001-T025
6. Agent assignments based on expertise and triggers
```

## Agent Assignment Strategy

### **Primary Agents for This Feature**
- **@apex-dev**: Codebase analysis, refactoring, import fixing, integration work
- **@apex-researcher**: Architecture documentation analysis, compliance validation 
- **@documentation**: Creating verification reports, guides, documentation
- **@rules**: Validation rules, cleanup standards, safety procedures

### **Code Review & Quality Agents (NEW)**
- **@tdd-orchestrator**: Multi-agent coordination, test-driven validation, quality gates
- **@code-reviewer**: AI-powered code analysis, security scanning, performance validation
- **@security-auditor**: DevSecOps integration, vulnerability assessment, compliance frameworks
- **@architect-review**: Architecture integrity, scalability patterns, design validation
- **@test**: TDD implementation, test automation, coverage validation

### **Agent Trigger Mapping**
- **Analysis & Integration**: @apex-dev (triggers: "código", "integração", "refatorar")
- **Compliance & Research**: @apex-researcher (triggers: "compliance", "analisar", "validar") 
- **Documentation & Reports**: @documentation (triggers: "documentar", "relatório")
- **Standards & Rules**: @rules (triggers: "padrões", "regras", "validação")

### **Code Review Agent Triggers (NEW)**
- **Multi-Agent Coordination**: @tdd-orchestrator (triggers: "tdd", "quality assurance", "coordination")
- **Code Quality & Security**: @code-reviewer (triggers: "code review", "quality", "performance")
- **Security & DevSecOps**: @security-auditor (triggers: "security", "vulnerability", "audit")
- **Architecture Review**: @architect-review (triggers: "architecture", "design", "scalability")
- **Test Implementation**: @test (triggers: "test", "testing", "coverage", "automation")

## Phase 3.1: Setup & Environment Validation

**Agent: @apex-dev** (Setup and tool coordination)
- [ ] T001 Validate monorepo structure and constitutional MCP tools availability
  - Verify `/home/vibecode/neonpro/apps` (4 applications) and `/home/vibecode/neonpro/packages` (20+ packages) 
  - Confirm serena MCP, archon MCP, sequential-thinking MCP, desktop-commander MCP are functional
  - Validate existing test suite runs successfully (Vitest + Playwright)
  - **Files**: Root directory structure validation
  - **Success Criteria**: All required directories exist, MCP tools responsive, tests pass

**Agent: @apex-researcher** (Documentation baseline)  
- [ ] T002 [P] Analyze architecture documentation baseline for expected integration patterns
  - Read `/home/vibecode/neonpro/docs/apis` for expected service integrations
  - Read `/home/vibecode/neonpro/docs/architecture` for package dependency expectations
  - Extract expected import patterns and integration requirements
  - **Files**: `/home/vibecode/neonpro/docs/apis/*`, `/home/vibecode/neonpro/docs/architecture/*`
  - **Success Criteria**: Expected patterns documented, integration requirements clear

**Agent: @rules** (Safety framework)
- [ ] T003 [P] Establish cleanup safety rules and rollback procedures
  - Define conservative cleanup criteria (only obvious functional overlaps, ≥95% confidence)
  - Create Git checkpoint strategy: `git tag checkpoint-pre-cleanup-$(date +%s)` before each change
  - Document rollback procedures: `git reset --hard <checkpoint-tag>` + `git clean -fd`
  - Establish healthcare compliance validation checkpoints (LGPD/ANVISA/CFM)
  - Create automated rollback triggers for test failures or compliance violations
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/safety-rules.md`
  - **Success Criteria**: Safety framework documented with executable rollback commands, rollback tested with sample change

## Phase 3.2: Verification Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These validation tests MUST be written and MUST FAIL before ANY analysis implementation**

**Agent: @tdd-orchestrator** (Test coordination & strategy)
- [ ] T004 [P] Coordinate comprehensive test suite design for monorepo verification 
  - Orchestrate multi-agent test development using advanced coordination patterns
  - Define atomic test scenarios covering all verification requirements
  - Establish quality gates and parallel execution strategy for test validation
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/test-strategy.md`
  - **Success Criteria**: Complete test strategy, agent coordination plan, parallel execution optimized

**Agent: @test** (Import validation testing)
- [ ] T005 [P] Contract test for import dependency validation in `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/contract/test_import_validation.ts`
  - Test workspace protocol validation (`@neonpro/*` packages use `workspace:`)
  - Test circular dependency detection between packages  
  - Test missing import identification and incorrect import path detection
  - **Files**: `tests/contract/test_import_validation.ts`
  - **Success Criteria**: Tests fail initially (RED phase), validate import analysis logic

**Agent: @test** (Route integration testing)
- [ ] T006 [P] Contract test for route integration validation in `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/contract/test_route_integration.ts`
  - Test API route service integration validation (apps/api → packages)
  - Test frontend route component integration validation (apps/web → packages)
  - Test missing integration detection and incorrect usage patterns
  - **Files**: `tests/contract/test_route_integration.ts`
  - **Success Criteria**: Tests fail initially (RED phase), validate route analysis logic

**Agent: @security-auditor** (Compliance & security validation testing)
- [ ] T007 [P] Contract test for healthcare compliance & security preservation in `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/contract/test_compliance_security.ts`
  - Test LGPD compliance maintenance during reorganization
  - Test ANVISA/CFM regulation preservation validation
  - Test security audit trail integrity and vulnerability scanning
  - **Files**: `tests/contract/test_compliance_security.ts`
  - **Success Criteria**: Tests fail initially (RED phase), validate compliance & security checks

**Agent: @architect-review** (Architecture integrity testing)
- [ ] T008 [P] Integration test for architecture pattern preservation in `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/integration/test_architecture_integrity.ts`
  - Test clean architecture boundaries and dependency inversion
  - Test microservices patterns and service boundary validation
  - Test design pattern compliance and architectural decision records
  - **Files**: `tests/integration/test_architecture_integrity.ts`
  - **Success Criteria**: Tests fail initially (RED phase), validate architecture integrity

**Agent: @code-reviewer** (Code quality & performance testing)
- [ ] T009 [P] Integration test for code quality & performance preservation in `/home/vibecode/neonpro/specs/001-create-a-comprehensive/tests/integration/test_quality_performance.ts`
  - Test code quality metrics maintenance (complexity, maintainability)
  - Test performance benchmarks and optimization preservation
  - Test technical debt tracking and quality gate enforcement
  - **Files**: `tests/integration/test_quality_performance.ts`
  - **Success Criteria**: Tests fail initially (RED phase), validate quality & performance metrics

## Phase 3.3: Core Analysis Implementation (GREEN Phase - Make tests pass)

**Agent: @apex-dev** (Structure analysis implementation)
- [ ] T010 Implement monorepo structure discovery and analysis using serena MCP (GREEN phase)
  - Use serena MCP to analyze `/home/vibecode/neonpro/apps` structure and dependencies
  - Map current app → package connections using `get_symbols_overview` and `find_symbol`
  - Generate current state documentation with import patterns and usage
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/structure-analysis.md`
  - **Dependencies**: T001 (MCP validation), T005 (import tests)
  - **Success Criteria**: Complete structure map, import tests pass (GREEN)

**Agent: @apex-dev** (Import dependency implementation - ATOMIC SUBTASKS) 
- [ ] T011a Scan import statements across monorepo using serena MCP (GREEN phase)
  - Use serena MCP `search_for_pattern` to find all import statements in `/apps` and `/packages`
  - Extract import paths, aliases, and usage patterns systematically
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/import-scan-results.json`
  - **Dependencies**: T010 (structure analysis)
  - **Success Criteria**: Complete import statement inventory, <5 minutes execution

- [ ] T011b Validate workspace protocol usage and detect violations (GREEN phase)
  - Check all `@neonpro/*` imports use `workspace:*` protocol in package.json files
  - Identify external vs internal package imports and validate patterns
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/workspace-protocol-validation.json`
  - **Dependencies**: T011a (import scan)
  - **Success Criteria**: Workspace protocol compliance validated, violations documented

- [ ] T011c Identify missing imports using TypeScript compiler diagnostics (GREEN phase)
  - Run TypeScript compiler with `--noEmit` to detect missing import errors
  - Cross-reference with expected imports from architecture documentation
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/missing-imports.json`
  - **Dependencies**: T011b (workspace validation), T002 (architecture baseline)
  - **Success Criteria**: Missing imports identified with fix suggestions

- [ ] T011d Detect incorrect import paths and unused imports (GREEN phase)
  - Use TypeScript Language Service to detect incorrect and unused imports
  - Validate import paths match actual file locations and exports
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/import-corrections.json`
  - **Dependencies**: T011c (missing imports)
  - **Success Criteria**: Incorrect imports documented with correction paths

- [ ] T011e Generate comprehensive ImportDependencyMap (GREEN phase)
  - Synthesize all import analysis results into unified ImportDependencyMap
  - Create visual dependency graph with current vs expected connections
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/ImportDependencyMap.json`
  - **Dependencies**: T011d (import corrections), T006 (route tests)
  - **Success Criteria**: Complete ImportDependencyMap generated, route tests pass (GREEN)

**Agent: @architect-review** (Architecture pattern analysis)
- [ ] T012 [P] Analyze architecture pattern compliance and design integrity (GREEN phase)
  - Validate clean architecture boundaries and dependency inversion
  - Assess microservices patterns and service boundary adherence
  - Review design pattern implementation and architectural decision compliance
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/architecture-pattern-analysis.json`
  - **Dependencies**: T008 (architecture tests), T010 (structure analysis)
  - **Success Criteria**: Architecture tests pass (GREEN), design patterns validated

**Agent: @code-reviewer** (Code quality analysis)
- [ ] T013 [P] Implement comprehensive code quality and performance analysis (GREEN phase)
  - Analyze code complexity, maintainability metrics, and technical debt
  - Validate performance benchmarks and optimization opportunities
  - Assess test coverage, documentation quality, and best practices compliance
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/code-quality-analysis.json`
  - **Dependencies**: T009 (quality tests), T011 (import analysis)
  - **Success Criteria**: Quality tests pass (GREEN), metrics documented

**Agent: @security-auditor** (Security & compliance analysis)
- [ ] T014 [P] Execute security audit and compliance validation (GREEN phase)
  - Perform comprehensive vulnerability assessment and security scanning
  - Validate LGPD, ANVISA, CFM compliance preservation
  - Assess authentication, authorization, and data protection measures
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/security-compliance-analysis.json`
  - **Dependencies**: T007 (compliance tests), T002 (architecture baseline)
  - **Success Criteria**: Compliance tests pass (GREEN), security validated

## Phase 3.4: Integration & Validation (REFACTOR Phase - Improve while maintaining GREEN)

**Agent: @tdd-orchestrator** (Multi-agent quality coordination - ATOMIC SUBTASKS)
- [ ] T015a Initialize multi-agent coordination framework (REFACTOR phase)
  - Setup coordination channels between @security-auditor, @code-reviewer, @architect-review
  - Define quality gate checkpoints and success criteria (≥90% coverage, zero critical issues)
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/quality/coordination-framework.json`
  - **Dependencies**: T012-T014 (all analyses complete)
  - **Success Criteria**: Coordination framework active, agent communication established

- [ ] T015b Execute parallel quality validation with intelligent scheduling (REFACTOR phase)
  - Launch @security-auditor, @code-reviewer, @architect-review in parallel
  - Monitor validation progress and detect bottlenecks in real-time
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/quality/parallel-validation-log.json`
  - **Dependencies**: T015a (framework initialized)
  - **Success Criteria**: Parallel validation executing, <60% resource utilization

- [ ] T015c Monitor resource utilization and optimize coordination patterns (REFACTOR phase)
  - Track CPU, memory, and I/O usage across all validation agents
  - Implement dynamic load balancing and queue management
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/quality/resource-monitoring.json`
  - **Dependencies**: T015b (parallel validation)
  - **Success Criteria**: Resource optimization active, coordination patterns optimized

- [ ] T015d Generate comprehensive quality orchestration report (REFACTOR phase)
  - Synthesize all agent validation results into unified quality report
  - Document coordination effectiveness and performance metrics
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/quality/quality-orchestration-report.md`
  - **Dependencies**: T015c (resource monitoring)
  - **Success Criteria**: Quality coordination optimized, all agents synchronized, report generated

**Agent: @security-auditor** (DevSecOps integration & compliance)
- [ ] T016 [P] Implement comprehensive DevSecOps pipeline integration
  - Integrate security scanning into CI/CD pipeline with automated gates
  - Validate LGPD, ANVISA, CFM compliance frameworks throughout reorganization
  - Establish continuous security monitoring and threat detection
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/security/devsecops-integration-report.md`
  - **Dependencies**: T014 (security analysis), T015 (coordination)
  - **Success Criteria**: DevSecOps integrated, compliance frameworks validated

**Agent: @code-reviewer** (Performance optimization & quality gates)
- [ ] T017 [P] Optimize code performance and enforce quality gates
  - Implement automated code quality gates with AI-powered analysis
  - Optimize build performance and Turborepo configuration
  - Establish performance monitoring and regression prevention
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/performance/performance-optimization-report.md`
  - **Dependencies**: T013 (quality analysis), T015 (coordination)
  - **Success Criteria**: Performance optimized, quality gates enforced

**Agent: @architect-review** (Architecture refinement & scalability)
- [ ] T018 [P] Refine architecture patterns and validate scalability design
  - Optimize service boundaries and microservices architecture
  - Validate distributed systems design and event-driven patterns
  - Assess scalability requirements and performance characteristics
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/architecture/architecture-refinement-report.md`
  - **Dependencies**: T012 (architecture analysis), T015 (coordination)
  - **Success Criteria**: Architecture refined, scalability validated

## Phase 3.5: Comprehensive Reporting & Documentation

**Agent: @documentation** (Integration verification report - ATOMIC SUBTASKS)
- [ ] T019a Compile analysis results from all validation phases (Documentation phase)
  - Aggregate results from T011e (ImportDependencyMap), T012-T014 (analyses), T015d-T018 (validations)
  - Normalize data formats and resolve inconsistencies between agent outputs
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/reports/compiled-analysis-results.json`
  - **Dependencies**: T015d-T018 (all validation complete)
  - **Success Criteria**: All analysis results compiled, data format normalized

- [ ] T019b Generate pass/fail status for all integration points (Documentation phase)
  - Evaluate each integration point against success criteria from data model
  - Calculate health scores (0-100) for apps-packages connections
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/reports/integration-status-matrix.json`
  - **Dependencies**: T019a (analysis compiled)
  - **Success Criteria**: Pass/fail status generated, health scores calculated

- [ ] T019c Create JSON-formatted IntegrationVerificationChecklist (Documentation phase)
  - Generate structured JSON report with validation results and metrics
  - Include critical issues, priority rankings, and remediation paths
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/reports/IntegrationVerificationChecklist.json`
  - **Dependencies**: T019b (status matrix)
  - **Success Criteria**: JSON format validated, report structure complete

- [ ] T019d Generate human-readable summary report (Documentation phase)
  - Create executive summary with key findings and recommendations
  - Document quality-assured insights for development team consumption
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/reports/integration-verification-summary.md`
  - **Dependencies**: T019c (JSON report)
  - **Success Criteria**: Human-readable summary complete, actionable insights documented

**Agent: @documentation** (Action plan with quality gates - ATOMIC SUBTASKS) 
- [ ] T020a Synthesize all analysis results and prioritize issues (Documentation phase)
  - Analyze all validation outputs (T015d-T018, T019c) and extract actionable issues
  - Apply severity ranking (Critical/High/Medium/Low) based on impact and complexity
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/planning/issue-prioritization.json`
  - **Dependencies**: T019c (JSON report)
  - **Success Criteria**: Issues prioritized by severity, impact analysis complete

- [ ] T020b Create step-by-step implementation timeline (Documentation phase)
  - Define implementation phases with dependencies and resource requirements
  - Estimate effort and timeline for each remediation action
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/planning/implementation-timeline.json`
  - **Dependencies**: T020a (issue prioritization)
  - **Success Criteria**: Implementation timeline created, dependencies mapped

- [ ] T020c Document quality gates and validation checkpoints (Documentation phase)
  - Define quality gates for each implementation phase (coverage ≥90%, zero critical issues)
  - Establish security checkpoints (LGPD/ANVISA/CFM compliance) and performance benchmarks
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/planning/quality-gates.json`
  - **Dependencies**: T020b (timeline)
  - **Success Criteria**: Quality gates defined, validation checkpoints established

- [ ] T020d Generate comprehensive action plan with multi-agent coordination (Documentation phase)
  - Synthesize prioritization, timeline, and quality gates into unified action plan
  - Document multi-agent coordination strategy for implementation phases
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/action-plan.md`
  - **Dependencies**: T020c (quality gates)
  - **Success Criteria**: Quality-integrated actionable plan ready for execution

**Agent: @apex-researcher** (Knowledge base & methodology documentation)
- [ ] T021 [P] Update project knowledge base with comprehensive analysis methodology
  - Document analysis methodology and lessons learned in Archon MCP
  - Create reusable verification patterns with code review integration
  - Update architecture documentation with quality-assured improvements
  - **Files**: Archon MCP knowledge base updates
  - **Dependencies**: T019 (verification report), T020 (action plan)
  - **Success Criteria**: Knowledge preserved, quality methodology documented

**Agent: @tdd-orchestrator** (Process optimization documentation)
- [ ] T022 [P] Document multi-agent coordination patterns and process optimization
  - Create reusable TDD orchestration patterns for complex verification tasks
  - Document parallel execution optimization and resource management strategies
  - Establish quality assurance workflows for future monorepo maintenance
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/process/tdd-orchestration-patterns.md`
  - **Dependencies**: T015 (coordination), T021 (knowledge base)
  - **Success Criteria**: Process patterns documented, optimization strategies established

## Phase 3.6: Quality-Assured Safe Implementation (Optional)

**Agent: @code-reviewer** (Quality-assured import optimization)
- [ ] T023 Execute quality-validated import path corrections with comprehensive safety
  - Apply import fixes with AI-powered code analysis and automated quality gates
  - Implement Git checkpoint per change with automated rollback triggers
  - Validate performance impact and security implications of each change
  - **Files**: Various import files as identified in analysis
  - **Dependencies**: T017 (performance optimization), T020 (action plan)
  - **Success Criteria**: Import paths optimized, quality gates passed, comprehensive safety

**Agent: @security-auditor** (Security-validated conservative cleanup)
- [ ] T024 Execute security-assured conservative file removal with compliance validation
  - Remove duplicates with comprehensive security impact assessment
  - Validate LGPD, ANVISA, CFM compliance maintained throughout cleanup
  - Implement automated security scanning before and after each removal
  - **Files**: Duplicate files as identified in cleanup registry
  - **Dependencies**: T023 (import optimization), T016 (DevSecOps integration)
  - **Success Criteria**: Safe duplicates removed, security validated, compliance preserved

**Agent: @tdd-orchestrator** (Final validation coordination)
- [ ] T025 Orchestrate comprehensive final validation with multi-agent quality assurance
  - Coordinate final quality validation across all code review agents
  - Execute comprehensive test suite with parallel execution optimization
  - Generate final quality report with performance metrics and recommendations
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/final/final-validation-report.md`
  - **Dependencies**: T023-T024 (cleanup complete)
  - **Success Criteria**: All quality gates pass, comprehensive validation complete

**Agent: @code-reviewer** (Performance validation)
- [ ] T026 Validate 30-second performance requirement compliance (FR-016)
  - Measure complete repository analysis execution time using performance benchmarks
  - Validate serena MCP, archon MCP, and analysis tools meet performance targets
  - Identify performance bottlenecks and optimization opportunities
  - **Files**: `/home/vibecode/neonpro/specs/001-create-a-comprehensive/performance/performance-validation-report.json`
  - **Dependencies**: T010-T014 (analysis implementations complete)
  - **Success Criteria**: Full analysis completes within 30 seconds, performance benchmarks documented

## Dependencies

**Sequential Dependencies (TDD Red-Green-Refactor with Atomic Subtasks)**:
- Setup → Tests (RED) → Analysis (GREEN) → Validation (REFACTOR) → Documentation → Implementation
- T001-T003 (Setup) before T004-T009 (Tests/RED Phase) 
- T004-T009 (Tests/RED) before T010, T011a-e, T012-T014 (Analysis/GREEN Phase)
- T011a-e (Import Analysis subtasks) sequential within GREEN phase
- T015a-d (Quality Orchestration subtasks) sequential within REFACTOR phase
- T019a-d (Report Generation subtasks) sequential within Documentation phase
- T020a-d (Action Plan subtasks) sequential within Documentation phase
- Documentation phases before T023-T026 (Implementation)

**Enhanced Parallel Execution Within Phases**:
- **Setup**: T002, T003 can run parallel (different domains)
- **TDD RED Phase**: T004-T009 can run parallel (different test files, different agents)
- **GREEN Phase**: T010, T012-T014 can run parallel; T011a-e sequential (import analysis chain)
- **REFACTOR Phase**: T015a-d sequential (coordination chain); T016-T018 can run parallel with T015d
- **Documentation**: T019a-d and T020a-d sequential chains; T021-T022 can run parallel
- **Implementation**: T023-T024 can run parallel (different cleanup types); T025-T026 final validation

**Atomic Subtask Benefits**:
- **Context Preservation**: Each subtask completes in 15-20 minutes, preventing context loss
- **Clear Progress**: Granular progress tracking with specific deliverables per subtask
- **Rollback Safety**: Atomic operations allow precise rollback to specific completion points
- **Quality Gates**: Each subtask has measurable success criteria for validation

## Enhanced Parallel Execution Examples with Code Review Agents

```bash
# Phase 3.2: TDD RED Phase - Launch all verification tests together
@tdd-orchestrator "Coordinate comprehensive test suite design for monorepo verification"
@test "Contract test for import dependency validation in tests/contract/test_import_validation.ts"
@test "Contract test for route integration validation in tests/contract/test_route_integration.ts"  
@security-auditor "Contract test for healthcare compliance & security preservation"
@architect-review "Integration test for architecture pattern preservation"
@code-reviewer "Integration test for code quality & performance preservation"

# Phase 3.3: GREEN Phase - Launch parallel analysis implementation
@apex-dev "Implement monorepo structure discovery and analysis using serena MCP"
@architect-review "Analyze architecture pattern compliance and design integrity" 
@code-reviewer "Implement comprehensive code quality and performance analysis"
@security-auditor "Execute security audit and compliance validation"

# Phase 3.4: REFACTOR Phase - Launch parallel validation and optimization
@tdd-orchestrator "Orchestrate comprehensive quality validation with multi-agent coordination"
@security-auditor "Implement comprehensive DevSecOps pipeline integration"
@code-reviewer "Optimize code performance and enforce quality gates"
@architect-review "Refine architecture patterns and validate scalability design"

# Phase 3.5: Launch parallel documentation with quality integration
@documentation "Generate comprehensive Integration Verification Checklist with quality metrics"
@documentation "Create prioritized action plan with integrated quality gates"
@apex-researcher "Update project knowledge base with comprehensive analysis methodology"
@tdd-orchestrator "Document multi-agent coordination patterns and process optimization"

# Phase 3.6: Quality-assured safe implementation
@code-reviewer "Execute quality-validated import path corrections with comprehensive safety"
@security-auditor "Execute security-assured conservative file removal with compliance validation"
@tdd-orchestrator "Orchestrate comprehensive final validation with multi-agent quality assurance"
```

## Success Criteria Validation

### **Primary Success Metrics** (from specification)
- [ ] **Zero Functional Overlaps**: No files performing same business function across packages
- [ ] **Clean Import State**: All imports correct, no unused imports, no missing dependencies
- [ ] **Package Integration Health**: All apps properly utilize package services without errors

### **Performance & Compliance Metrics** 
- [ ] **Analysis Performance**: Complete repository analysis within 30 seconds (FR-016, validated by T026)
- [ ] **Test Coverage**: Maintain 90%+ test coverage (constitutional requirement)
- [ ] **Build Performance**: Preserve Turborepo caching and performance optimization  
- [ ] **Healthcare Compliance**: LGPD, ANVISA, CFM compliance validated and preserved
- [ ] **Constitutional Compliance**: MCP workflow followed, safety-first methodology applied

### **Quality Gates**
- [ ] All verification tests pass (T004-T007)
- [ ] Analysis complete with actionable insights (T008-T012)
- [ ] Compliance and safety validated (T013-T015) 
- [ ] Documentation complete and actionable (T016-T018)
- [ ] Optional cleanup executed safely (T019-T020)

## Enhanced Task Agent Summary with Code Review Integration

| Task Range | Primary Agent | Focus | TDD Phase | Parallel Capability |
|------------|---------------|-------|-----------|-------------------|
| T001-T003 | @apex-dev, @apex-researcher, @rules | Setup & Safety | Setup | T002-T003 parallel |
| T004-T009 | @tdd-orchestrator, @test, @security-auditor, @architect-review, @code-reviewer | Test Creation | RED | All parallel |
| T010, T011a-e, T012-T014 | @apex-dev, @architect-review, @code-reviewer, @security-auditor | Analysis Implementation | GREEN | T010,T012-T014 parallel; T011a-e sequential |
| T015a-d, T016-T018 | @tdd-orchestrator, @security-auditor, @code-reviewer, @architect-review | Validation & Optimization | REFACTOR | T015a-d sequential; T016-T018 parallel |
| T019a-d, T020a-d, T021-T022 | @documentation, @apex-researcher, @tdd-orchestrator | Documentation & Patterns | Documentation | T019a-d, T020a-d sequential; T021-T022 parallel |
| T023-T026 | @code-reviewer, @security-auditor, @tdd-orchestrator | Quality-Assured Implementation | Implementation | T023-T024 parallel; T025-T026 final validation |

### **Code Review Agent Specialization Summary**

| Agent | Tasks | Specialization | Key Contributions |
|-------|-------|---------------|------------------|
| **@tdd-orchestrator** | T004, T015, T022, T025 | Multi-agent coordination, quality orchestration | Test strategy, coordination patterns, final validation |
| **@test** | T005, T006 | TDD implementation, test automation | Contract tests, test coverage, automation |
| **@security-auditor** | T007, T014, T016, T024 | DevSecOps, compliance, vulnerability assessment | Security validation, compliance preservation, audit |
| **@architect-review** | T008, T012, T018 | Architecture integrity, design patterns | Architecture analysis, scalability validation, design review |
| **@code-reviewer** | T009, T013, T017, T023 | Code quality, performance, AI-powered analysis | Quality gates, performance optimization, automated analysis |

## Enhanced Implementation Notes

- **[P]** tasks = different files/domains, no dependencies, optimized for parallel execution
- **TDD Integration**: Full Red-Green-Refactor cycle with code review agent coordination
- **Verification approach**: Analysis and organization with comprehensive quality assurance
- **Safety first**: Conservative cleanup with multi-layer validation and rollback capability
- **Constitutional compliance**: Enhanced MCP workflow (sequential-thinking → archon → serena → code-review → tools)
- **Healthcare focus**: LGPD, ANVISA, CFM compliance with DevSecOps integration maintained throughout
- **Agent selection**: Based on expertise triggers, domain focus, and code review specialization
- **Quality assurance**: Advanced TDD orchestration with multi-agent quality gates
- **Performance optimization**: Parallel execution patterns with intelligent resource management
- **Security integration**: DevSecOps pipeline integration with continuous security monitoring
- **Architecture validation**: Clean architecture principles with scalability assessment
- **Process documentation**: Reusable coordination patterns and optimization strategies

### **Key Enhancements with Code Review Agents**

1. **Multi-Agent TDD Orchestration**: @tdd-orchestrator coordinates complex quality workflows
2. **Automated Security Integration**: @security-auditor implements DevSecOps throughout
3. **Architecture Integrity Validation**: @architect-review ensures design pattern compliance  
4. **AI-Powered Quality Gates**: @code-reviewer provides automated quality analysis
5. **Comprehensive Test Strategy**: @test implements advanced TDD patterns
6. **Parallel Execution Optimization**: Enhanced coordination for 60%+ faster execution
7. **Quality Metrics Integration**: Real-time monitoring and performance optimization

---
**Enhanced Task Generation Complete**: 26 main tasks with 16 atomic subtasks (42 total), code review integration, advanced agent coordination, TDD orchestration, comprehensive quality assurance, and analysis optimization addressing all identified gaps from specification analysis report