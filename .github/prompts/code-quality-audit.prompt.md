# 🔍 NeonPro Comprehensive Code Quality & Integration Audit (Enhanced)

```yaml
# Prompt Architecture Metadata
version: 3.3.0
last_updated: 2025-09-18
owner: Code Quality Guild
source_of_truth: .github/prompts/code-quality-audit.prompt.md
audit_framework: "Multi-Agent TDD Orchestration"
compliance_standards: ["LGPD", "ANVISA", "CFM", "GDPR"]
technology_stack: "React 19 + Hono + Supabase + Prisma + Turborepo"
```

## 🎯 Objective & Scope

**Primary Mission**: Canonical playbook for orchestrating multi-agent code quality audits across NeonPro's healthcare platform with strict LGPD/ANVISA compliance and intelligent agent coordination.

**Scope Boundaries**:

- ✅ **In Scope**: Full-stack code quality, database integration, security compliance, test orchestration
- ✅ **Healthcare Focus**: Patient data, clinical workflows, consent management, audit trails
- ✅ **Agent Coordination**: Multi-agent TDD workflows with parallel execution optimization
- ❌ **Out of Scope**: Infrastructure provisioning, deployment pipelines, monitoring systems

## 📋 Mandatory Prerequisites

**Documentation Preload**:

- `docs/AGENTS.md` - Agent coordination framework
- `docs/architecture/source-tree.md` - Monorepo structure and boundaries
- `docs/architecture/tech-stack.md` - Technology stack and patterns
- `docs/testing/AGENTS.md` - Testing strategy and patterns
- `docs/testing/database-security-testing.md` - Healthcare security testing
- `docs/rules/coding-standards.md` - Code quality standards

**Tool Access Validation**:

- ✅ `archon` MCP - Task management and knowledge base
- ✅ `serena` MCP - Codebase analysis and semantic search
- ✅ `desktop-commander` MCP - File operations and command execution
- ⚠️ `supabase` MCP - Conditional activation for RLS/database validation

**Compliance Requirements**:

- LGPD compliance for all patient data operations
- ANVISA device registration for adverse events
- CFM professional access controls
- Multi-tenant data isolation with RLS

## 🚀 Mandatory MCP Integration Sequence

```yaml
CRITICAL_MCP_ORDER:
  1. sequential-thinking: "Analyze audit scope and complexity assessment"
  2. archon: "Initialize task tracking and agent coordination"
  3. serena: "Codebase analysis and change surface detection"
  4. desktop-commander: "File operations and command execution"
  5. supabase: "Conditional - Database and RLS validation (when needed)"

WARNING: "Strict order required for Phase 0 setup. Deviation may cause agent coordination failures."
```

## 📊 Stack Snapshot & Health Status

```yaml
CURRENT_STACK:
  frontend: "React 19 + Vite + TanStack Router + TypeScript"
  backend: "Hono + Node 20 + TypeScript strict"
  database: "Supabase (Postgres 15) + Prisma ORM + RLS"
  testing: "Vitest + Playwright + Oxlint + dprint"
  tooling: "Turborepo + PNPM + Bun (workspace scripts)"
  compliance: "LGPD + ANVISA + CFM + Multi-tenant RLS"

HEALTH_STATUS:
  build_system: "✅ Turborepo + PNPM workspace scripts"
  type_safety: "✅ TypeScript strict mode enabled"
  linting: "✅ Oxlint + dprint formatting"
  testing: "✅ Vitest (unit/integration) + Playwright (E2E)"
  security: "✅ RLS policies + tenant isolation"
  compliance: "✅ LGPD consent management + audit trails"
```

## ⚡ Quick Execution Index

| Phase | Focus              | Auto-Triggers       | Primary Agents                                        | Output                              | Estimated Duration |
| ----- | ------------------ | ------------------- | ----------------------------------------------------- | ----------------------------------- | ------------------ |
| **0** | Setup & Scoping    | Audit kickoff       | `sequential-thinking → archon → serena`               | Scope confirmation + task log       | 2-5 min            |
| **1** | Backend ↔ DB      | Schema/API changes  | `architect-review + security-auditor + code-reviewer` | Green Prisma build + RLS validation | 5-15 min           |
| **2** | LGPD Security      | Patient/clinic data | `security-auditor + architect-review + test`          | LGPD compliance report              | 8-20 min           |
| **3** | Code Quality       | Any code changes    | `code-reviewer + test`                                | Lint/type-check/coverage            | 3-10 min           |
| **4** | Test Orchestration | Significant diffs   | `test + security-auditor`                             | Targeted test suites                | 5-15 min           |
| **5** | Systematic Fixing  | Blockers identified | Priority-based agents                                 | Remediation log                     | Variable           |
| **6** | Quality Gates      | Pre-release         | All agents                                            | Final approval package              | 5-10 min           |

**Emergency Hotkeys**:

- `pnpm test:healthcare -- --regression` - Healthcare compliance regression
- `pnpm test:orchestrate -- --all-categories` - Full orchestration test
- `pnpm lint && pnpm type-check` - Quick quality check

---

## 🧰 Process & Tooling Integration Checklist

### Documentation Sync Protocol

```yaml
SYNC_PROTOCOL:
  version_bump_triggers:
    - "Update .github/prompts/code-quality-audit.prompt.md version"
    - "Significant agent orchestration changes"
    - "New compliance requirements added"

  required_doc_updates:
    - "docs/AGENTS.md" - Agent coordination updates
    - "docs/architecture/source-tree.md" - Source tree changes
    - "docs/testing/AGENTS.md" - Testing pattern updates
    - "docs/testing/database-security-testing.md" - Security testing updates
    - "docs/mistakes/automation.md" - Automation lessons learned

  workflow:
    1. "Document target doc owners in Archon task"
    2. "Create 48h follow-up task for confirmation"
    3. "Update docs/features/code-quality-audit.md with version/date"
    4. "Cross-link all related documentation"
    5. "Archive old versions in knowledge base"
```

### Command & Script Mapping

```yaml
WORKSPACE_SCRIPTS: # Preferred - always use these first
  backend_testing: "pnpm test:backend"
  frontend_testing: "pnpm test:frontend"
  healthcare_compliance: "pnpm test:healthcare"
  regression_suite: "pnpm test:healthcare -- --regression"
  linting: "pnpm lint"
  type_checking: "pnpm type-check"
  constitutional_quick: "pnpm constitutional:quick"
  constitutional_full: "pnpm constitutional:full"
  orchestration_full: "pnpm test:orchestrate -- --all-categories"

VS_CODE_TASKS: # Fast execution via IDE
  - "🏛️ Constitutional Audit - Quick"
  - "🏛️ Constitutional Audit - Full"
  - "📈 Performance Benchmark"
  - "🏥 Healthcare Compliance Check"
  - "🧪 Web Tests (apps/web)"
  - "🔎 Web Smoke Test (vite build)"
  - "🧹 Web Lint (apps/web)"
  - "✅ Web Type-Check (apps/web)"

FALLBACK_COMMANDS: # When Bun/Turbo unavailable
  package_manager: "Use pnpm directly: pnpm <command>"
  test_execution: "node --test or vitest directly"
  build_commands: "vite build or tsc directly"

FALLBACK_PROTOCOL:
  - "Log deviation in Archon task notes"
  - "Capture full console output"
  - "Document performance impact"
  - "Create follow-up task to fix Bun/Turbo access"
```

### Execution Mode Decision Matrix

```yaml
EXECUTION_MODES:
  sequential_mandatory:
    conditions: ["Phase 0 setup", "Agent conflicts", "Compliance escalations"]
    order: "strict MCP order: sequential-thinking → archon → serena → desktop-commander"
    notes: "Never skip or reorder Phase 0 MCP sequence"

  parallel_preferred:
    conditions:
      [
        "Independent agent analyses",
        "Phase 1-3 execution",
        "Multiple quality gates",
      ]
    coordination: "Launch concurrently, checkpoint evidence, capture combined logs"
    conflict_handling: "Use fallback_priority, rerun serially if conflicts"

  hybrid_mixed:
    conditions:
      ["Complex audits", "Multi-phase workflows", "Recovery scenarios"]
    approach: "Sequential setup, parallel execution, sequential validation"
    notes: "Maintain context across phase transitions"
```

### Tooling Usage Guidelines

```yaml
TOOLING_PREFERENCES:
  workspace_scripts: "Always prefer over ad-hoc commands"
  cli_artifacts: "Capture all stdout/stderr in Archon"
  supabase_mcp: "Activate only for RLS/consent verification"
  test_reports: "Archive Playwright/Vitest reports and PDFs"
  knowledge_base: "Upload all artifacts to Archon KB"

PERFORMANCE_NOTES:
  script_execution: "Bun 3-5x faster than npm, use when available"
  parallel_agents: "Significant speedup for independent analyses"
  caching: "Leverage Turborepo cache for repeated operations"
  incremental: "Run only affected tests when possible"
```

---

## 🤖 Enhanced Agent Registry & Orchestration

### Core Agent Capabilities Matrix

| Agent                | Primary Focus                          | Execution Phase         | Parallel Capable | Dependencies     | Healthcare Critical |
| -------------------- | -------------------------------------- | ----------------------- | ---------------- | ---------------- | ------------------- |
| **architect-review** | System design, patterns, scalability   | Architecture validation | ✅               | None             | 🔶 Medium           |
| **security-auditor** | DevSecOps, compliance, vulnerabilities | Security analysis       | ✅               | None             | 🔴 Critical         |
| **code-reviewer**    | Quality, maintainability, performance  | Code analysis           | ✅               | architect-review | 🔶 Medium           |
| **test**             | TDD patterns, coverage, test quality   | Test orchestration      | ✅               | code-reviewer    | 🔶 Medium           |

### Enhanced Agent Activation Triggers

```yaml
AGENT_TRIGGERS:
  architect-review:
    keywords:
      [
        "microservice",
        "architecture",
        "system design",
        "patterns",
        "scalability",
        "database schema",
        "api design",
        "service boundaries",
        "integration patterns",
      ]
    file_patterns:
      [
        "**/routes/**",
        "**/api/**",
        "**/services/**",
        "**/lib/**",
        "packages/database/prisma/schema.prisma",
        "**/migrations/**",
      ]
    always_active: true
    complexity_threshold: "Medium-High"

  security-auditor:
    keywords:
      [
        "authentication",
        "authorization",
        "payment",
        "personal data",
        "compliance",
        "rls",
        "tenant",
        "consent",
        "audit",
        "break-glass",
        "lgpd",
        "phi",
        "pii",
        "healthcare",
        "patient",
        "clinic",
        "professional",
        "anvisa",
        "cfm",
      ]
    file_patterns:
      [
        "**/auth/**",
        "**/security/**",
        "**/*patient*",
        "**/*clinic*",
        "packages/database/**",
        "apps/api/src/routes/**",
        "**/consent/**",
        "**/audit/**",
        "apps/web/src/components/patients/**",
      ]
    healthcare_critical: true
    always_active: false
    priority: "P0-Critical"

  code-reviewer:
    keywords:
      [
        "performance",
        "maintainability",
        "technical debt",
        "code quality",
        "regression",
        "refactor",
        "optimization",
        "bug fix",
        "hotfix",
      ]
    file_patterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
    always_active: true
    regression_focus: true

  test:
    keywords:
      [
        "tdd",
        "testing",
        "coverage",
        "test patterns",
        "vitest",
        "playwright",
        "spec",
        "mock",
        "fixture",
        "healthcare compliance",
        "integration test",
      ]
    file_patterns: ["**/*.test.*", "**/*.spec.*", "**/tests/**"]
    always_active: true
    healthcare_validation: true
```

### Agent Conflict Resolution & Fallback Priority

```yaml
FALLBACK_PRIORITY:
  resolution_order:
    ["security-auditor", "architect-review", "code-reviewer", "test"]
  conflict_resolution_protocol: |
    1. Deactivate lower-priority agent when conflicts occur
    2. Rerun impacted phase sequentially using priority order
    3. Document conflict rationale and resolution in Archon task notes
    4. Re-trigger regression suite with ID: pnpm test:healthcare -- --regression
    5. Log agent coordination lessons in knowledge base

  ESCALATION_PATH:
    - "First conflict: Automatic resolution with fallback_priority"
    - "Second conflict: Manual review with project owner"
    - "Third conflict: System architecture review required"
    - "Chronic conflicts: Agent orchestration framework update"

AGENT_COORDINATION_RULES:
  healthcare_critical: "security-auditor always takes precedence"
  api_changes: "architect-review + security-auditor mandatory"
  database_changes: "security-auditor + architect-review + code-reviewer"
  frontend_changes: "code-reviewer + test (with security-auditor if PHI)"
  compliance_failures: "security-auditor leads full re-validation"
```

### Post-API-Fix Regression Requirements

````yaml
POST_API_FIX_CHECKLIST:
  mandatory_regression_triggers:
    - "Any changes to apps/api/src/routes/**"
    - "Patient/clinic data model modifications"
    - "Authentication/authorization updates"
    - "RLS policy changes"

  regression_suite_ids:
    healthcare_compliance: "pnpm test:healthcare -- --regression"
    api_contract: "pnpm test:backend -- --api-contract"
    security_validation: "pnpm test:healthcare -- --audit-only"

  documentation_requirements:
    - "Log regression execution in Archon with full console output"
    - "Attach coverage reports and test artifacts"
    - "Document any compliance deviations or security concerns"
    - "Update knowledge base with new API patterns discovered"
```---

## 📋 Enhanced Execution Sequence with Agent Orchestration

### Phase 0: Orchestration Initialization (Critical Sequential)

```yaml
ORCHESTRATION_SETUP:
  steps:
    1. sequential-thinking:
        action: "Analyze audit scope and complexity assessment"
        output: "Complexity score (1-10) and agent routing recommendation"

    2. archon_mcp:
        action: "Initialize task tracking and agent coordination"
        output: "Task registry with agent assignments and dependencies"

    3. serena_mcp:
        action: "Codebase analysis and change surface detection"
        output: "Change impact analysis and affected components"

    4. agent_selection:
        action: "Activate agents based on triggers and complexity"
        output: "Agent activation plan with coordination strategy"

    5. regression_register:
        action: "Record post-API-fix regression suite IDs"
        output: "Regression checklist stored in Archon task notes"

    6. workflow_selection:
        action: "Choose orchestration pattern based on triggers"
        output: "Execution plan (standard/security-critical/microservices)"

    7. documentation_preload:
        action: "Load required documentation from /docs"
        output: "Documentation cache with version tracking"

  QUALITY_GATE: "All Phase 0 steps complete with MCP order validation"
  FAILURE_HANDLING: "Restart Phase 0 if any MCP tool fails to initialize"
````

### Critical Documentation Preload

```yaml
DOCUMENTATION_PRELOAD:
  architecture_docs:
    - "docs/architecture/source-tree.md"
    - "docs/architecture/tech-stack.md"
    - "docs/architecture/AGENTS.md"

  testing_docs:
    - "docs/testing/AGENTS.md"
    - "docs/testing/coverage-policy.md"
    - "docs/testing/integration-testing.md"
    - "docs/testing/database-security-testing.md"

  standards_docs:
    - "docs/rules/coding-standards.md"
    - ".claude/agents/code-review/tdd-orchestrator.md"
    - "CLAUDE.md"

  compliance_docs:
    - "docs/features/lgpd-compliance.md"
    - "docs/features/healthcare-security.md"

  VERSION_TRACKING: "Record all loaded doc versions in Archon task"
```

---

## 🔄 TDD-Integrated Orchestration Workflows

### 1. Standard Multi-Agent TDD Workflow

**Use Case**: Regular feature development with balanced quality focus

```mermaid
graph TD
    A[Feature Analysis] --> B{Complexity Assessment}
    B -->|Low (1-3)| C[Basic TDD + 2 Agents]
    B -->|Medium (4-6)| D[Enhanced TDD + 3 Agents]
    B -->|High (7-10)| E[Full TDD + 4 Agents]

    C --> F[test + code-reviewer]
    D --> G[+ architect-review]
    E --> H[+ security-auditor]

    F --> I[Quality Gates]
    G --> I
    H --> I
    I --> J[Deployment Ready]
```

#### RED Phase Orchestration

```yaml
phase: RED
primary_agent: test
support_agents: [architect-review, security-auditor]
parallel_execution: true

agent_tasks:
  test:
    - "Define test structure and patterns"
    - "Create failing test cases"
    - "Validate test environment setup"

  architect-review:
    - "Validate architectural test approach"
    - "Review test design patterns"
    - "Ensure test coverage of system boundaries"

  security-auditor:
    - "Define security test requirements"
    - "Ensure compliance test coverage"
    - "Validate PHI handling in tests"

QUALITY_GATE: "All failing tests created with proper structure and security considerations"
```

#### GREEN Phase Orchestration

```yaml
phase: GREEN
primary_agent: code-reviewer
support_agents: [architect-review, security-auditor, test]
sequential_execution: true

execution_order:
  1. code-reviewer: "Implement minimal code to pass tests"
  2. architect-review: "Validate architectural patterns compliance"
  3. security-auditor: "Perform security vulnerability analysis"
  4. test: "Verify all tests pass with new implementation"

QUALITY_GATE: "All tests pass with security and architecture compliance"
```

#### REFACTOR Phase Orchestration

```yaml
phase: REFACTOR
coordination: parallel_execution
agents: [code-reviewer, architect-review, security-auditor, test]

parallel_tasks:
  code-reviewer:
    - "Optimize code quality and maintainability"
    - "Improve performance bottlenecks"
    - "Enhance error handling patterns"

  architect-review:
    - "Refine architectural patterns"
    - "Optimize system design"
    - "Improve modularity and separation of concerns"

  security-auditor:
    - "Enhance security measures"
    - "Improve compliance implementation"
    - "Strengthen data protection mechanisms"

  test:
    - "Optimize test performance and coverage"
    - "Refine test patterns and mocks"
    - "Validate test quality improvements"

QUALITY_GATE: "Code quality improved while maintaining 100% test coverage"
```

### 2. Security-Critical TDD Workflow

**Use Case**: Authentication, payments, personal data handling

```yaml
workflow: security-critical-tdd
security_first: true
compliance_gates: ["GDPR", "PCI-DSS", "LGPD"]
agent_leadership: "security-auditor"

phase_sequence:
  RED:
    primary: security-auditor
    secondary: [test, architect-review]
    coordination: sequential
    focus: "Security test requirements definition"
    mandatory_output: "Security test specifications with compliance validation"

  GREEN:
    primary: security-auditor
    secondary: [code-reviewer, test]
    coordination: sequential
    focus: "Secure implementation with vulnerability prevention"
    mandatory_output: "Secure code implementation passing all security tests"

  REFACTOR:
    coordination: security-auditor
    agents: [code-reviewer, architect-review, test]
    execution: parallel
    focus: "Security hardening and compliance validation"
    mandatory_output: "Enhanced security implementation with improved performance"

QUALITY_ASSURANCE: "Security-auditor must sign off each phase"
```

### 3. Healthcare Compliance Workflow

**Use Case**: Patient data, clinical records, LGPD compliance

````yaml
workflow: healthcare-compliance-tdd
compliance_first: true
regulations: ["LGPD", "CFM", "ANVISA"]
agent_leadership: "security-auditor"

agent_coordination:
  security-auditor:
    role: "Primary - LGPD compliance validation"
    responsibilities: [
      "Consent mechanism validation",
      "Audit trail implementation",
      "PHI handling verification",
      "Data retention compliance",
      "Professional access controls"
    ]

  architect-review:
    role: "Data architecture and privacy by design"
    responsibilities: [
      "Privacy-by-design architecture",
      "Data flow analysis",
      "Service boundary security",
      "Multi-tenant isolation design"
    ]

  code-reviewer:
    role: "PHI handling and audit trail implementation"
    responsibilities: [
      "PHI handling code review",
      "Error handling without data leakage",
      "Audit logging implementation",
      "Data sanitization validation"
    ]

  test:
    role: "Compliance test patterns and data protection"
    responsibilities: [
      "Compliance test development",
      "Data protection validation",
      "Test data anonymization",
      "Regression testing"
    ]

COMPLIANCE_VALIDATION: "Must pass pnpm test:healthcare -- --compliance"
```---

## 🗂 Phase 1 — Backend↔Database Integration (Agent-Orchestrated)

**Agent Coordination**: `architect-review` (primary) + `security-auditor` + `code-reviewer`

### 1.1 Schema & Client Validation (Parallel Execution)

```yaml
parallel_agents:
  architect-review:
    - "Validate database schema design patterns"
    - "Review service boundaries and data relationships"
    - "Ensure proper foreign key constraints and indexing"

  security-auditor:
    - "Verify RLS policies on sensitive tables"
    - "Audit data access patterns and permissions"
    - "Validate tenant isolation mechanisms"

  code-reviewer:
    - "Analyze Prisma client generation and type safety"
    - "Review API-database contract consistency"
    - "Check field mapping and error handling"

execution_commands:
  - "pnpm --filter @neonpro/api prisma:generate"
  - "pnpm --filter @neonpro/api build"

quality_gate: "Prisma generation successful + API builds green"
````

### 1.2 Database Structure & RLS Analysis (Sequential Security Focus)

```yaml
sequential_execution:
  1. architect-review:
    - "Analyze database architecture and relationships"
    - "Review schema design patterns"
    - "Validate data model consistency"

  2. security-auditor:
    - "Validate RLS policies and tenant isolation"
    - "Test user context propagation"
    - "Verify audit trail implementation"

  3. code-reviewer:
    - "Review field mapping and error handling"
    - "Check snake_case/camelCase consistency"
    - "Validate type safety across boundaries"

security_requirements:
  - "RLS enabled on all patient/clinic tables: 100%"
  - "Multi-tenant scoping verified in all queries: 100%"
  - "No cross-tenant data leakage possible: 100%"
  - "User context propagation (clinic, role, professional id): 100%"
```

### 1.3 API-Database Contract Validation (Multi-Agent Analysis)

```yaml
agent_coordination:
  code-reviewer:
    - "Scan Hono routes for field name consistency"
    - "Validate error handling for DB errors and RLS denials"
    - "Review API response type alignment"

  security-auditor:
    - "Ensure multi-tenant scoping in patient/clinic queries"
    - "Verify audit trail implementation for data access"
    - "Test for potential data leakage vectors"

  architect-review:
    - "Review API contract alignment with database schema"
    - "Validate service layer abstraction patterns"
    - "Ensure proper separation of concerns"

validation_commands:
  - "pnpm test:backend -- --api-contract"
  - "pnpm test:healthcare -- --database-validation"

blocking_criteria: "All API-Database contracts validated and secure"
```

---

## 🏥 Phase 2 — LGPD & Healthcare Security (Critical Path)

**Agent Coordination**: `security-auditor` (primary) + `architect-review` + `code-reviewer` + `test`

### 2.1 LGPD Compliance Validation (Security-First Orchestration)

```yaml
workflow: healthcare-compliance-tdd
primary_agent: security-auditor
compliance_focus: "LGPD + ANVISA + CFM"

RED_phase:
  security-auditor:
    - "Define LGPD compliance test requirements"
    - "Create consent validation test patterns"
    - "Establish audit trail test structure"
    - "Design data retention validation tests"

  test:
    - "Implement failing compliance tests"
    - "Create PHI handling test scenarios"
    - "Develop consent mechanism tests"
    - "Build audit trail validation tests"

GREEN_phase:
  code-reviewer:
    - "Implement consent validation logic"
    - "Add audit trail mechanisms"
    - "Create data retention implementations"
    - "Build PHI handling safeguards"

  security-auditor:
    - "Validate LGPD compliance implementation"
    - "Verify data protection measures"
    - "Test consent enforcement mechanisms"
    - "Audit data access logging"

REFACTOR_phase:
  parallel_execution:
    - security-auditor: "Enhance security measures and compliance"
    - architect-review: "Optimize privacy-by-design patterns"
    - code-reviewer: "Improve audit trail performance and PHI handling"
    - test: "Optimize compliance test suite and coverage"

compliance_gate: "Must pass pnpm test:healthcare -- --compliance"
```

### 2.2 Healthcare Security Analysis (Multi-Agent Coordination)

```yaml
agent_tasks:
  security-auditor:
    priority: "P0 - Critical"
    tasks:
      - "Consent validation enforced on routes touching PHI/PII"
      - "Audit trails for read/write operations validated"
      - "Data retention and deletion logic compliance"
      - "Consent RPC validation (packages/core-services / Supabase edge functions)"
      - "ANVISA device/adverse-event verification"
      - "Professional access controls (CFM) verification"
      - "No PHI in logs or test fixtures (enforce anonymized fixtures)"
      - "TLS in transit, encrypted storage at rest validation"
      - "Run pnpm test:healthcare and archive results in Archon"

  architect-review:
    priority: "P0 - Critical"
    tasks:
      - "Privacy-by-design architecture validation"
      - "Data flow analysis for PHI handling"
      - "Service boundary security review"
      - "Multi-tenant isolation architecture verification"

  code-reviewer:
    priority: "P1 - High"
    tasks:
      - "PHI handling code review"
      - "Error handling without data leakage"
      - "Logging sanitization validation"
      - "Verify anonymization helpers and data minimization rules"

  test:
    priority: "P1 - High"
    tasks:
      - "Compliance test coverage validation"
      - "PHI handling test development"
      - "Integration testing for consent flows"
      - "Regression testing for security fixes"
```

### 2.3 RLS Integration Validation (Sequential Security Analysis)

```yaml
sequential_execution:
  1. architect-review:
    - "Review RLS policy architecture"
    - "Validate tenant isolation design"
    - "Ensure proper context propagation"

  2. security-auditor:
    - "Verify policies active for patient/clinic tables"
    - "Test user context propagation (clinic, role, professional id)"
    - "Validate tenant isolation effectiveness"
    - "Test for privilege escalation vulnerabilities"

  3. code-reviewer:
    - "Review RLS policy implementation in queries"
    - "Validate context passing in API layers"
    - "Check for bypass or circumvention attempts"

  4. test:
    - "Execute tenant isolation tests"
    - "Validate cross-tenant access prevention"
    - "Test RLS policy effectiveness"
    - "Verify audit trail completeness"

quality_gates:
  - "RLS policies active on all sensitive tables: ≥100%"
  - "User context propagation verified: ≥100%"
  - "Tenant isolation tests pass: ≥100%"
  - "No cross-tenant data access possible: ≥100%"
  - "Audit trail integrity confirmed (retention ≥7 years)"
  - "Test data anonymization validated: ≥100%"

failure_protocol: "Gate failures trigger pnpm test:healthcare -- --audit-only rerun"
```

### 2.4 Emergency Access & Documentation (Compliance Orchestration)

````yaml
agent_coordination:
  security-auditor:
    - "Validate emergency access protocols"
    - "Review break-glass procedures"
    - "Audit emergency access logging"
    - "Verify alert delivery and session expiry"
    - "Log break-glass review outcome in Archon"

  architect-review:
    - "Review emergency access architecture"
    - "Validate failsafe mechanisms"
    - "Ensure proper audit trail integration"

  code-reviewer:
    - "Review emergency access implementation"
    - "Validate audit trail for emergency procedures"
    - "Test emergency access controls"

documentation_requirements:
  - "Emergency access procedures documented"
  - "Break-glass request templates available"
  - "Audit log review procedures defined"
  - "Compliance officer notification process"
```---

## 🧪 Phase 3 — Code Quality & Build Checks (Parallel Agent Execution)

**Agent Coordination**: `code-reviewer` (primary) + `architect-review` + `security-auditor` + `test`

### 3.1 Parallel Quality Analysis (Optimized Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "TypeScript strict type checking"
    - "Code quality metrics analysis"
    - "Performance bottleneck detection"
    - "Maintainability assessment"

  security-auditor:
    - "Dependency vulnerability scanning"
    - "Security advisory analysis"
    - "Code security pattern validation"
    - "Compliance verification"

  architect-review:
    - "Architecture pattern compliance"
    - "Design consistency validation"
    - "Module dependency analysis"
    - "System boundary validation"

  test:
    - "Test coverage analysis"
    - "Test quality assessment"
    - "TDD pattern validation"
    - "Integration testing review"

execution_commands:
  - "pnpm test:backend"
  - "pnpm test:frontend"
  - "pnpm test:healthcare -- --regression"
  - "pnpm lint"
  - "pnpm type-check"
  - "pnpm audit --json > audit-report.json || true"
````

### 3.2 Quality Gates & Thresholds (Multi-Agent Validation)

```yaml
quality_gates:
  code-reviewer:
    - "TypeScript strict mode: 0 errors"
    - "Oxlint errors: 0 (warnings <100)"
    - "Code complexity: Cyclomatic <10"
    - "Maintainability index: >70"

  security-auditor:
    - "Critical vulnerabilities: 0"
    - "High vulnerabilities: <5"
    - "Security patterns: 100% compliance"
    - "Dependency security: No critical alerts"

  architect-review:
    - "Architecture violations: 0"
    - "Design pattern compliance: >90%"
    - "Module coupling: <80%"
    - "System boundary integrity: 100%"

  test:
    - "Test coverage: ≥90% critical / ≥85% important / ≥80% useful"
    - "Test quality score: >8/10"
    - "TDD compliance: 100%"

parallel_validation: "All agents validate gates simultaneously"
failure_handling: "Any gate failure blocks progression to Phase 4"
```

---

## 🧭 Phase 4 — Intelligent Test Orchestration (Agent-Coordinated)

**Agent Coordination**: `test` (primary) + `architect-review` + `code-reviewer` + `security-auditor`

### 4.1 Intelligent Test Selection (Multi-Agent Analysis)

```yaml
agent_analysis:
  test:
    - "Analyze changed files and determine test scope"
    - "Select appropriate test strategies based on file patterns"
    - "Coordinate test execution across different domains"
    - "Validate test environment readiness"

  architect-review:
    - "Validate test architecture and patterns"
    - "Review integration test strategies"
    - "Ensure test coverage aligns with system boundaries"
    - "Verify test isolation and independence"

  code-reviewer:
    - "Analyze code changes for test impact"
    - "Review test quality and maintainability"
    - "Validate test performance and efficiency"
    - "Check test data management"

  security-auditor:
    - "Ensure security test coverage for sensitive changes"
    - "Validate compliance test execution"
    - "Review test data security and PHI handling"
    - "Verify penetration testing coverage"
```

### 4.2 Intelligent Routing Rules (Agent-Driven)

```yaml
routing_strategy:
  inputs:
    - changed_files: "git diff analysis"
    - integration_issues: "schema, API, compliance changes"
    - monorepo_map: "docs/architecture/source-tree.md"
    - complexity_score: "Phase 0 assessment"

  path_to_strategy:
    "apps/api/**":
      primary_agent: architect-review
      strategy: "Hono API integration + DB/RLS validation"
      tests: ["integration", "api-contract", "rls-security"]
      regression_suite: "pnpm test:healthcare -- --regression"
      notes: "Always enqueue regression when routes touching clinics/patients change"

    "packages/database/**":
      primary_agent: security-auditor
      strategy: "Schema & RLS verification + API regression"
      tests: ["schema-validation", "rls-policies", "migration-safety"]
      regression_suite: "pnpm test:healthcare -- --audit-only"
      notes: "Auto-run audit-only regression when database objects change"

    "apps/web/src/routes/**":
      primary_agent: code-reviewer
      strategy: "TanStack Router tests + API contract checks"
      tests: ["routing", "api-integration", "navigation"]

    "apps/web/src/components|hooks/**":
      primary_agent: test
      strategy: "Unit tests + Supabase client usage"
      tests: ["component", "hook", "client-integration"]

    "healthcare_domains":
      primary_agent: security-auditor
      strategy: "LGPD + RLS suites"
      tests: ["compliance", "data-protection", "audit-trails"]
      compliance_required: true
```

### 4.3 Test Execution Commands (Agent-Coordinated)

```yaml
test_execution_matrix:
  api_db_regression:
    agents: ["architect-review", "code-reviewer"]
    command: "pnpm test:backend"
    artifacts: ["api-test-results.json", "integration-logs.txt"]

  frontend_integration:
    agents: ["test", "code-reviewer"]
    commands: ["pnpm test:frontend", "pnpm test:a11y"]
    artifacts: ["frontend-coverage.html", "a11y-report.json"]

  healthcare_compliance:
    agents: ["test", "security-auditor"]
    commands:
      [
        "pnpm test:healthcare -- --compliance",
        "pnpm test:e2e",
        "pnpm test:orchestrate -- --healthcare-compliance",
      ]
    artifacts:
      [
        "compliance-report.pdf",
        "playwright-results/",
        "healthcare-audit-trail.json",
      ]
    evidence_requirements: "Archive screenshots/videos for compliance evidence"

archive_requirements: "All test artifacts uploaded to Archon knowledge base"
```

### 4.4 Coverage Policy & Quality Gates

````yaml
coverage_policy:
  critical: "≥90% (healthcare data, authentication, payments)"
  important: "≥85% (business logic, integrations)"
  useful: "≥80% (UI components, utilities)"

agent_validation:
  test:
    - "Validate coverage thresholds met"
    - "Review test quality metrics"
    - "Ensure test isolation and independence"

  security-auditor:
    - "Ensure compliance test coverage"
    - "Validate security test execution"
    - "Review penetration test results"

  code-reviewer:
    - "Review test maintainability"
    - "Validate test performance"
    - "Check test data management"

coverage_gate: "Attach Vitest coverage report to Archon task"
```---

## 🛠️ Phase 5 — Systematic Fixing (Agent-Orchestrated Priorities)

**Agent Coordination**: Priority-based agent assignment with parallel execution where possible

### 5.1 P0 — Integration Blockers (Critical - Sequential Execution)

```yaml
sequential_execution:
  1. architect-review:
     - "Analyze DB schema mismatches and relationship issues"
     - "Review API field mapping and contract alignment"
     - "Validate service boundary integrity"

  2. security-auditor:
     - "Identify RLS bypass risks and tenant isolation issues"
     - "Validate consent/audit logging on PHI paths"
     - "Test for privilege escalation vulnerabilities"

  3. code-reviewer:
     - "Fix API field errors and implement tenant/role scoping"
     - "Implement missing consent/audit logging mechanisms"
     - "Resolve data consistency issues"

blocking_issues:
  - "DB mismatches (naming/relations), RLS bypass risks"
  - "API field errors, missing tenant/role scoping"
  - "Missing consent/audit logging on PHI paths"
  - "Service boundary violations"

quality_gate: "All P0 issues resolved before proceeding"
escalation: "P0 failures require immediate project owner notification"
````

### 5.2 P1 — Security & Compliance (Parallel Execution)

```yaml
parallel_execution:
  security-auditor:
    - "Implement no-eval policies and safe fetch options"
    - "Validate URL safety and input sanitization"
    - "Implement PHI redaction in logs and error messages"
    - "Add audit logs for sensitive operations"
    - "Test for injection vulnerabilities"

  code-reviewer:
    - "Review and fix security code patterns"
    - "Optimize error handling without data leakage"
    - "Validate logging sanitization implementation"
    - "Implement secure coding practices"

security_compliance:
  - "no-eval, safe fetch options, URL safety"
  - "PHI redaction; audit logs for sensitive ops"
  - "Input validation and output encoding"
  - "Secure session management"
```

### 5.3 P2 — Type Safety & Contracts (Parallel Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "Replace `any` with `unknown`/specific types"
    - "Align response types and zod schemas with routes"
    - "Improve type safety across API boundaries"
    - "Validate input/output type consistency"

  architect-review:
    - "Review API contract consistency"
    - "Validate type system architecture"
    - "Ensure schema alignment across layers"
    - "Check for type consistency in integrations"

type_safety:
  - "Replace `any` with `unknown`/specific types"
  - "Align response types and zod schemas with routes"
  - "Ensure strict TypeScript compliance"
```

### 5.4 P3 — Module & Hygiene (Parallel Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "Convert to ES module imports"
    - "Remove dead code and unused dependencies"
    - "Optimize query performance"
    - "Improve error handling patterns"
    - "Refactor complex functions"

  architect-review:
    - "Review module architecture and dependencies"
    - "Validate import/export patterns"
    - "Optimize module boundaries"
    - "Check for circular dependencies"

module_hygiene:
  - "ES module imports, remove dead code"
  - "Query optimization and error handling"
  - "Dependency management and versioning"
```

### 5.5 Enhanced Error Handling & Rollback Strategy

````yaml
error_handling:
  agent_failure:
    - "Log agent failure with full context"
    - "Attempt automatic recovery with alternative agent"
    - "Implement fallback_priority sequence"
    - "Escalate to manual intervention if needed"

  quality_gate_failure:
    - "Stop execution at failed gate"
    - "Provide detailed failure analysis"
    - "Suggest remediation steps"
    - "Create recovery task in Archon"

  rollback_strategy:
    - "Maintain checkpoint before each phase"
    - "Enable selective rollback to last successful state"
    - "Preserve audit trail of all changes"
    - "Document rollback rationale and lessons"

coordination_requirements:
  - "All agent decisions logged in Archon"
  - "Recovery attempts documented with reasoning"
  - "Lessons learned captured in knowledge base"
```---

## ✅ Phase 6 — Comprehensive Quality Gates (Agent-Validated)

**Agent Coordination**: All agents participate in validation with specific responsibilities

### 6.1 Gate 0 — Backend/DB Integration (Blocking)

```yaml
validation_agents:
  architect-review:
    - "API architecture integrity validation"
    - "Database schema design compliance"
    - "Service boundary validation"

  security-auditor:
    - "RLS policies active and effective"
    - "Data access pattern security validation"
    - "Tenant isolation verification"

  code-reviewer:
    - "API builds green; Prisma client generates successfully"
    - "No schema/field mapping errors"
    - "Error handling coverage validation"

blocking_criteria:
  - "API builds green; Prisma client generates: ≥100%"
  - "No schema/field errors; RLS policies verified: ≥100%"
  - "Multi-tenant scoping implemented: ≥100%"

test_commands: ["pnpm test:backend", "pnpm test:healthcare -- --database-validation"]
````

### 6.2 Gate 1 — LGPD Compliance (Blocking)

```yaml
validation_agents:
  security-auditor:
    - "LGPD compliance validation (primary)"
    - "Consent mechanism verification"
    - "Audit trail completeness validation"
    - "Data protection measure verification"

  architect-review:
    - "Privacy-by-design architecture validation"
    - "Data flow compliance verification"

  code-reviewer:
    - "Consent implementation code review"
    - "Audit logging implementation validation"

blocking_criteria:
  - "Consent checks present on PHI routes: ≥100%"
  - "Audit logs exist, immutable, and meet 7-year retention"
  - "LGPD compliance validated: ≥100%"
  - "PHI handling secure: ≥100%"
  - "Regression suite executed (pnpm test:healthcare)"

compliance_evidence: "Archive compliance reports in Archon"
```

### 6.3 Gate 2 — RLS Security (Blocking)

```yaml
validation_agents:
  security-auditor:
    - "RLS policy effectiveness validation (primary)"
    - "Cross-tenant access prevention verification"
    - "Security boundary enforcement validation"

  architect-review:
    - "RLS architecture design validation"
    - "Tenant isolation architecture review"

  test:
    - "RLS test execution and validation"
    - "Cross-tenant leakage test verification"

blocking_criteria:
  - "Queries enforce tenant + role context: ≥100%"
  - "No cross-tenant leakage in tests: ≥100%"
  - "RLS policies active on sensitive tables: ≥100%"
  - "User context propagation verified: ≥100%"
  - "Audit trail entries captured for access attempts"
  - "ANVISA device/adverse-event validation documented: ≥100%"

audit_requirements: "Run pnpm test:healthcare -- --audit-only"
```

### 6.4 Gate 3 — Code Quality & Security (Blocking)

```yaml
validation_agents:
  code-reviewer:
    - "TypeScript strict mode compliance (primary)"
    - "Linting standards compliance"
    - "Code quality metrics validation"

  security-auditor:
    - "Security vulnerability assessment (primary)"
    - "Dependency security validation"
    - "Security pattern compliance"

  architect-review:
    - "Architecture pattern compliance"
    - "Design consistency validation"

blocking_criteria:
  - "Oxlint: 0 errors (<100 warnings)"
  - "pnpm type-check passes: ≥100%"
  - "pnpm audit has 0 criticals: ≥100%"
  - "Security patterns compliant: ≥100%"

quality_commands: ["pnpm lint", "pnpm type-check", "pnpm audit"]
```

### 6.5 Gate 4 — Test Coverage & Quality (Blocking)

```yaml
validation_agents:
  test:
    - "Test coverage validation (primary)"
    - "Test quality assessment"
    - "TDD pattern compliance"

  code-reviewer:
    - "Test maintainability review"
    - "Test performance validation"

  security-auditor:
    - "Security test coverage validation"
    - "Compliance test execution verification"

blocking_criteria:
  - "Critical path coverage: ≥90% (attach Vitest coverage report)"
  - "Important feature coverage: ≥85%"
  - "Security test coverage: ≥100%"
  - "Compliance test execution: ≥100%"
  - "Useful feature coverage: ≥80%"

coverage_requirements: "Upload coverage reports to Archon knowledge base"
```

### 6.6 Final Orchestration Validation

```yaml
final_validation:
  all_agents_consensus:
    - "All quality gates passed"
    - "No blocking issues remaining"
    - "Agent coordination successful"
    - "TDD cycles completed successfully"

  deployment_readiness:
    - "Healthcare compliance validated"
    - "Security posture verified"
    - "Architecture integrity confirmed"
    - "Code quality standards met"

  sign_off_requirements:
    - "Security-auditor approval for healthcare features"
    - "Architect-review approval for system changes"
    - "Code-reviewer approval for quality standards"
    - "Test agent approval for coverage and quality"
```

---

## 🧾 Artifacts & Reporting (Agent-Coordinated)

### Agent-Specific Reporting

```yaml
reporting_coordination:
  architect-review:
    - "Architecture compliance report"
    - "Design pattern analysis"
    - "System boundary validation results"

  security-auditor:
    - "Security vulnerability assessment"
    - "LGPD compliance validation report"
    - "RLS policy effectiveness analysis"

  code-reviewer:
    - "Code quality metrics and analysis"
    - "Type safety validation results"
    - "Performance optimization recommendations"

  test:
    - "Test coverage and quality report"
    - "TDD compliance validation"
    - "Test execution results"

consolidated_outputs:
  - "quality-report.txt (aggregated from all agents)"
  - "security-report.json (security-auditor primary)"
  - "architecture-analysis.md (architect-review primary)"
  - "test-coverage-report.json (test agent primary)"
  - "compliance-evidence.pdf (regulatory archive)"
```

### Archon Integration Requirements

````yaml
archon_integration:
  task_updates:
    - "Update tasks with agent decisions and evidence"
    - "Upload all artifacts to Archon knowledge base"
    - "Refresh docs/features/code-quality-audit.md with version/date"
    - "Cross-link to supporting documentation"

  knowledge_base:
    - "Store agent coordination lessons learned"
    - "Archive quality reports and compliance evidence"
    - "Document new patterns and best practices"
    - "Track regression suite IDs and results"

  follow_up_tasks:
    - "Create 48h follow-up for documentation updates"
    - "Schedule regression testing for critical fixes"
    - "Monitor agent coordination effectiveness"
```---

## 🔧 Orchestration Examples

### Example 1: Healthcare Feature Development

```yaml
feature: "patient-appointment-scheduling"
complexity: "high (8/10)"
triggers: ["healthcare", "patient", "appointment", "scheduling", "phi"]

agent_activation:
  - security-auditor: "LGPD compliance, PHI handling, consent validation"
  - architect-review: "Appointment system architecture, database design"
  - code-reviewer: "Business logic implementation, API design"
  - test: "Healthcare compliance testing, integration testing"

workflow: "healthcare-compliance-tdd"
execution: "Security-critical with full agent coordination"
regression_requirements: "pnpm test:healthcare -- --regression"
compliance_evidence: "Archive consent validation logs and audit trails"
````

### Example 2: API Integration Enhancement

```yaml
feature: "external-laboratory-api-integration"
complexity: "medium (5/10)"
triggers: ["api", "integration", "external", "laboratory", "healthcare"]

agent_activation:
  - architect-review: "Integration architecture patterns, API design"
  - security-auditor: "API security validation, data transmission security"
  - code-reviewer: "Integration code quality, error handling"
  - test: "Integration testing, contract testing"

workflow: "standard-tdd"
execution: "Parallel where possible, sequential for dependencies"
regression_requirements: "pnpm test:backend -- --api-contract"
```

### Example 3: Database Schema Changes

```yaml
feature: "patient-data-model-enhancement"
complexity: "high (9/10)"
triggers: ["database", "schema", "patient", "phi", "migration"]

agent_activation:
  - security-auditor: "RLS policies, tenant isolation, data protection"
  - architect-review: "Schema design, relationships, migration strategy"
  - code-reviewer: "Type safety, API-database alignment"
  - test: "Migration testing, data validation, RLS testing"

workflow: "security-critical-tdd"
execution: "Sequential security validation first"
compliance_requirements: "Must pass all RLS and compliance tests"
```

## 🧩 Minimal Code Examples

### Type Safety Improvements

```typescript
// Before - unsafe any types
type Handler = (c: any) => any;
const patientData: any = getPatientData(id);

// After - strict TypeScript with proper typing
type Handler = (c: Context) => Response | Promise<Response>;
interface Patient {
  id: string;
  name: string;
  // Properly typed patient interface
}
const patientData: Patient = await getPatientData(id);
```

### ES Module Imports

```typescript
// Before - CommonJS
const { execSync } = require("node:child_process");
const express = require("express");

// After - ES modules
import { execSync } from "node:child_process";
import express from "express";
```

### Security Pattern Examples

```typescript
// Before - potential SQL injection
const query = `SELECT * FROM patients WHERE name = '${name}'`;

// After - parameterized queries with RLS
const patients = await prisma.patient.findMany({
  where: {
    name: { contains: name },
    clinicId: context.clinicId, // RLS enforced
  },
});
```

---

## 🧭 Quick Start (Task Runner)

### VS Code Tasks (Fast Execution)

- "🧪 Web Tests (apps/web)" → Vitest suite para frontend
- "🔎 Web Smoke Test (vite build)" → build rápido de verificação
- "🧹 Web Lint (apps/web)" → lint local
- "✅ Web Type-Check (apps/web)" → type-check dedicado

### CLI Commands (Fallback)

```bash
# Root workspace helpers
pnpm test:orchestrate -- --all-categories
pnpm test:healthcare -- --regression
pnpm test:healthcare -- --compliance
pnpm test:healthcare -- --audit-only

# Quality checks
pnpm lint
pnpm type-check
pnpm audit

# Development
pnpm dev
pnpm build
```

### Emergency Healthcare Commands

```bash
# Healthcare compliance regression
pnpm test:healthcare -- --regression

# Security audit only
pnpm test:healthcare -- --audit-only

# API contract validation
pnpm test:backend -- --api-contract

# Full orchestration test
pnpm test:orchestrate -- --all-categories
```

---

## 📊 Agent Coordination Metrics & Monitoring

### Performance Metrics

```yaml
agent_performance:
  execution_time:
    phase_0_setup: "2-5 minutes"
    phase_1_db_integration: "5-15 minutes"
    phase_2_compliance: "8-20 minutes"
    phase_3_quality: "3-10 minutes"
    phase_4_testing: "5-15 minutes"
    phase_5_fixing: "variable based on issues"
    phase_6_gates: "5-10 minutes"

  success_rates:
    agent_coordination: "Target >95%"
    quality_gate_passage: "Target >90% first attempt"
    regression_detection: "Target >99%"

  bottlenecks:
    healthcare_compliance: "Often longest phase, security-auditor dependent"
    database_integration: "Schema changes require sequential validation"
    test_execution: "E2E tests can be time-consuming"
```

### Agent Coordination Health Checks

```yaml
health_checks:
  agent_communication:
    - "All agents can access Archon task system"
    - "Serena MCP responsive for codebase analysis"
    - "Desktop-commander executing commands properly"
    - "Supabase MCP available when needed"

  quality_metrics:
    - "Agent decision quality assessment"
    - "Conflict resolution effectiveness"
    - "Regression detection accuracy"
    - "Compliance validation thoroughness"

  continuous_improvement:
    - "Monthly agent orchestration reviews"
    - "Quarterly workflow optimization"
    - "Semi-annual compliance framework updates"
    - "Annual architecture review and refresh"
```

---

## 🔄 Recovery Strategies & Conflict Resolution

### Enhanced Recovery Procedures

```yaml
recovery_strategies:
  agent_coordination_failure:
    immediate_actions:
      - "Pause all agent execution"
      - "Log failure state in Archon with full context"
      - "Apply fallback_priority sequence"
      - "Restart with minimal agent set"

    escalation_path:
      - "First failure: Automatic recovery with fallback"
      - "Second failure: Manual intervention with project owner"
      - "Third failure: System architecture review required"
      - "Chronic failures: Agent orchestration framework update"

    documentation_requirements:
      - "Document root cause analysis"
      - "Update conflict resolution procedures"
      - "Add new patterns to knowledge base"
      - "Schedule framework improvement task"

  quality_gate_failure:
    analysis_protocol:
      - "Determine if gate threshold is appropriate"
      - "Assess agent effectiveness for failed gate"
      - "Review system design for inherent issues"
      - "Evaluate test coverage and quality"

    resolution_strategies:
      - "Adjust gate thresholds if unrealistic"
      - "Enhance agent capabilities for specific domains"
      - "Improve system design or architecture"
      - "Expand test coverage and validation"

    prevention_measures:
      - "Implement progressive gate validation"
      - "Add early warning systems for gate failures"
      - "Enhance agent training and patterns"
      - "Improve system design reviews"

  compliance_violation:
    immediate_response:
      - "Halt all further processing"
      - "Security-auditor takes immediate control"
      - "Document violation scope and impact"
      - "Notify compliance officer and project owner"

    remediation_process:
      - "Full security audit by security-auditor"
      - "System architecture review by architect-review"
      - "Code quality assessment by code-reviewer"
      - "Compliance testing by test agent"

    prevention_protocol:
      - "Enhanced pre-commit compliance checks"
      - "Improved agent training on compliance"
      - "Enhanced security patterns and validation"
      - "Regular compliance framework updates"
```

### Agent Conflict Resolution

```yaml
conflict_resolution:
  priority_hierarchy: 1. "security-auditor (P0-Critical for healthcare)"
    2. "architect-review (System design authority)"
    3. "code-reviewer (Code quality standards)"
    4. "test (Validation and coverage)"

  resolution_protocol: 1. "Identify conflicting agents and recommendations"
    2. "Apply priority hierarchy to select dominant agent"
    3. "Deactivate lower-priority agents for conflict duration"
    4. "Execute dominant agent recommendation"
    5. "Validate resolution effectiveness"
    6. "Document conflict and resolution in knowledge base"

  learning_and_improvement:
    - "Analyze conflict patterns and root causes"
    - "Update agent coordination procedures"
    - "Enhance agent training and communication"
    - "Improve conflict detection and prevention"
```

---

## 🎯 Summary & Deployment Readiness

**This enhanced multi-agent orchestration system transforms the basic audit into a sophisticated, intelligent quality assurance workflow. It integrates TDD methodology, parallel execution optimization, comprehensive quality gates, and healthcare compliance validation—all while maintaining compatibility with NeonPro's existing tech stack and development workflows.**

### Key Enhancements (v3.3.0)

- **🤖 Enhanced Agent Coordination**: Intelligent triggers, conflict resolution, and fallback sequencing
- **📋 Process Integration**: Comprehensive documentation sync protocols and tooling mappings
- **🔄 Healthcare Compliance**: Strengthened LGPD/ANVISA/CFM validation with agent orchestration
- **✅ Quality Gates**: Multi-layered validation with agent-specific responsibilities
- **🔧 Error Handling**: Robust rollback and recovery strategies with escalation paths
- **📊 Advanced Reporting**: Agent-coordinated reporting with Archon integration

### Deployment Checklist

```yaml
deployment_readiness:
  documentation_updates:
    - "✅ Update docs/AGENTS.md with agent coordination changes"
    - "✅ Refresh docs/architecture/source-tree.md with new patterns"
    - "✅ Update docs/testing/AGENTS.md with enhanced testing workflows"
    - "✅ Refresh docs/testing/database-security-testing.md"
    - "✅ Update docs/mistakes/automation.md with new lessons"

  validation_requirements:
    - "Execute pnpm test:orchestrate -- --all-categories"
    - "Run pnpm test:healthcare -- --regression"
    - "Validate all agent coordination workflows"
    - "Test conflict resolution procedures"
    - "Verify compliance validation effectiveness"

  archon_integration:
    - "Upload all artifacts to knowledge base"
    - "Create 48h follow-up task for documentation confirmation"
    - "Schedule regression testing monitoring"
    - "Document agent coordination effectiveness"

  rollout_protocol:
    - "Communicate changes to development team"
    - "Provide training on new agent workflows"
    - "Monitor effectiveness and gather feedback"
    - "Schedule continuous improvement reviews"
```

### Success Metrics

```yaml
success_metrics:
  quality_improvement:
    - "Defect reduction rate: >30%"
    - "Code quality score improvement: >20%"
    - "Test coverage increase: >15%"
    - "Security vulnerability reduction: >50%"

  efficiency_gains:
    - "Audit time reduction: >25%"
    - "Agent coordination success: >95%"
    - "First-pass quality gates: >90%"
    - "Regression detection accuracy: >99%"

  compliance_excellence:
    - "LGPD compliance validation: 100%"
    - "Security audit pass rate: >95%"
    - "RLS policy effectiveness: 100%"
    - "Healthcare validation success: >98%"
```

---

**This enhanced audit prompt represents a significant advancement in automated code quality assurance, combining intelligent agent orchestration with healthcare compliance rigor to deliver exceptional software quality for the NeonPro platform.**
