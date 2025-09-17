# 🔍 NeonPro Comprehensive Code Quality & Integration Audit (Enhanced)

- **version**: 3.2.0
- **last_updated**: 2025-09-17
- **owner**: Code Quality Guild
- **source_of_truth**: `.github/prompts/code-quality-audit.prompt.md` (this document)

**Purpose** — Canonical playbook for orchestrating multi-agent audits across NeonPro’s stack with strict LGPD/ANVISA compliance.

**Prerequisites**
- Read `docs/AGENTS.md`, `docs/architecture/source-tree.md`, `docs/architecture/tech-stack.md`
- Review `docs/testing/AGENTS.md` and `docs/testing/database-security-testing.md`
- Confirm access to required MCPs (`archon`, `serena`, `desktop-commander`, `supabase` when RLS needed)

**Stack Snapshot**
- Frontend: React 19 + Vite + TanStack Router
- Backend: Hono + Node 20
- Data: Supabase (Postgres) + Prisma ORM
- QA Scripts: Vitest, Playwright, Oxlint, dprint, TypeScript strict
- Tooling: Turborepo + PNPM + Bun (workspace scripts only)

**Quick Execution Index**
| Phase | Focus | Auto-Triggers | Primary Agents | Core Output |
|-------|-------|---------------|----------------|-------------|
| 0 | Setup & scoping | Audit kickoff | `sequential-thinking → archon → serena` | Scope confirmation & task log |
| 1 | Backend ↔ DB integration | Prisma/schema or API changes | `architect-review`, `security-auditor`, `code-reviewer` | Green Prisma build + RLS validation |
| 2 | LGPD & healthcare security | Patient/clinic data touched | `security-auditor`, `architect-review`, `test` | LGPD/ANVISA compliance report |
| 3 | Code quality & build | Any code changes | `code-reviewer`, `test` | Lint/type-check/coverage artifacts |
| 4 | Test orchestration | Significant diffs/regressions | `test`, `security-auditor` | Targeted Vitest/Playwright suites |
| 5 | Systematic fixing | Identified blockers | As needed | Remediation log + evidence |
| 6 | Quality gates | Pre-release sign-off | All agents | Final gate approval package |

## 🧰 Process & Tooling Integration

### Documentation Sync Protocol
- Tie every prompt version bump to updates in `docs/AGENTS.md`, `docs/architecture/source-tree.md`, `docs/testing/AGENTS.md`, `docs/testing/database-security-testing.md`, and `docs/mistakes/automation.md`.
- Record the target doc owners inside Archon when scheduling edits and create a 48h follow-up task to confirm publication.
- Store cross-links to the refreshed prompt and supporting docs inside `docs/features/code-quality-audit.md` with version/date metadata.

### Command Mapping
- **Workspace scripts (preferred)**: `pnpm test:backend`, `pnpm test:frontend`, `pnpm test:healthcare`, `pnpm lint`, `pnpm type-check`, `pnpm constitutional:quick`, `pnpm constitutional:full`.
- **VS Code tasks (.vscode/tasks.json)**: “🏛️ Constitutional Audit - Quick”, “🏛️ Constitutional Audit - Full”, “📈 Performance Benchmark”, “🏥 Healthcare Compliance Check”.
- **Fallback when Bun/Turbo unavailable**: run the same scripts with `pnpm`/`node` directly and log the deviation plus console output in Archon task notes.

### Execution Mode Matrix
| Condition | Execution Mode | Required Actions |
|-----------|----------------|------------------|
| Mandatory setup (Phase 0 MCP chain) | Sequential | Respect `sequential-thinking → archon → serena` order before any code actions. |
| Independent agent analyses (Phases 1-3) | Parallel | Launch agents concurrently, checkpoint evidence, and capture combined logs in Archon. |
| Conflicts or compliance escalations | Sequential retry | Follow `fallback_priority`, rerun affected phase serially, and attach remediation notes plus regression IDs. |

### Tooling Notes
- Prefer workspace scripts over ad-hoc commands; capture CLI/stdout artifacts in Archon for traceability.
- Activate Supabase MCP only for RLS/consent verification and record connection scope in task notes.
- Archive Playwright/Vitest reports and PDF artifacts alongside Archon task updates for auditing.

---

## 🤖 Agent Registry & Capabilities Matrix

### Core Code Review Agents

| Agent                | Primary Focus                          | Execution Phase         | Parallel Capable | Dependencies     |
| -------------------- | -------------------------------------- | ----------------------- | ---------------- | ---------------- |
| **architect-review** | System design, patterns, scalability   | Architecture validation | ✅               | None             |
| **security-auditor** | DevSecOps, compliance, vulnerabilities | Security analysis       | ✅               | None             |
| **code-reviewer**    | Quality, maintainability, performance  | Code analysis           | ✅               | architect-review |
| **test**             | TDD patterns, coverage, test quality   | Test orchestration      | ✅               | code-reviewer    |

### Agent Activation Triggers

```yaml
AGENT_TRIGGERS:
  architect-review:
    keywords: ["microservice", "architecture", "system design", "patterns", "scalability"]
    file_patterns: ["**/routes/**", "**/api/**", "**/services/**"]
    always_active: true

  security-auditor:
    keywords: ["authentication", "authorization", "payment", "personal data", "compliance", "rls", "tenant", "consent", "audit", "break-glass"]
    file_patterns: ["**/auth/**", "**/security/**", "**/*patient*", "**/*clinic*", "packages/database/**", "apps/api/src/routes/**"]
    healthcare_critical: true

  code-reviewer:
    keywords: ["performance", "maintainability", "technical debt", "code quality", "regression"]
    file_patterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
    always_active: true

  test:
    keywords: ["tdd", "testing", "coverage", "test patterns", "vitest", "playwright"]
    file_patterns: ["**/*.test.*", "**/*.spec.*", "**/tests/**"]
    always_active: true

fallback_priority:
  order: ["security-auditor", "architect-review", "code-reviewer", "test"]
  conflict_resolution: "Deactivate lower-priority agent, rerun impacted phase sequentially, document rationale in Archon task notes, and re-trigger regression suite if compliance agents intervened."
```

---

## 📋 Enhanced Execution Sequence with Agent Orchestration

### Phase 0: Orchestration Initialization

```yaml
orchestration_setup:
  1. sequential-thinking: "Analyze audit scope and complexity"
  2. archon_mcp: "Initialize task tracking and agent coordination"
  3. serena_mcp: "Codebase analysis and change surface detection"
  4. agent_selection: "Activate agents based on triggers and complexity"
  5. regression_register: "Record post-API-fix regression suite IDs (e.g., `pnpm test:healthcare`) in Archon task notes"
  6. workflow_selection: "Choose orchestration pattern (standard/security-critical/microservices)"
```

### Mandatory MCP Integration

```yaml
CRITICAL_MCPS:
  archon: "MANDATORY - Task management and agent coordination"
  serena: "MANDATORY - Codebase analysis and semantic search"
  desktop-commander: "MANDATORY - File operations and command execution"
  supabase: "CONDITIONAL - Database and RLS validation when applicable"

DOCUMENTATION_PRELOAD:
  architecture:
    - "docs/architecture/source-tree.md"
    - "docs/architecture/tech-stack.md"
  testing:
    - "docs/testing/AGENTS.md"
    - "docs/testing/coverage-policy.md"
    - "docs/testing/integration-testing.md"
  standards:
    - "docs/rules/coding-standards.md"
    - ".claude/agents/code-review/tdd-orchestrator.md"
```

---

## 🔄 TDD-Integrated Orchestration Workflows

### 1. Standard Multi-Agent TDD Workflow

**Use Case**: Regular feature development with balanced quality focus

```mermaid
graph TD
    A[Feature Analysis] --> B{Complexity Assessment}
    B -->|Low| C[Basic TDD + 2 Agents]
    B -->|Medium| D[Enhanced TDD + 3 Agents]
    B -->|High| E[Full TDD + 4 Agents]

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
support_agents:
  - architect-review  # Design test validation
  - security-auditor  # Security test requirements (if triggered)

parallel_execution:
  - test: "Define test structure and patterns"
  - architect-review: "Validate architectural test approach"
  - security-auditor: "Ensure security test coverage"

quality_gate: "All failing tests created with proper structure"
```

#### GREEN Phase Orchestration

```yaml
phase: GREEN
primary_agent: code-reviewer
support_agents:
  - architect-review  # Pattern compliance
  - security-auditor  # Vulnerability scanning
  - test             # Test validation

sequential_execution:
  1. code-reviewer: "Implement minimal code to pass tests"
  2. architect-review: "Validate architectural patterns"
  3. security-auditor: "Perform security analysis"
  4. test: "Verify test success"

quality_gate: "All tests pass with security and architecture compliance"
```

#### REFACTOR Phase Orchestration

```yaml
phase: REFACTOR
coordination: parallel_execution
agents:
  - code-reviewer     # Code quality improvements
  - architect-review  # Design optimization
  - security-auditor  # Security hardening
  - test             # Test optimization

quality_gate: "Code quality improved while maintaining test coverage"
```

---

### 2. Security-Critical TDD Workflow

**Use Case**: Authentication, payments, personal data handling

```yaml
workflow: "security-critical-tdd"
security_first: true
compliance_gates: ["GDPR", "PCI-DSS", "LGPD"]

phase_sequence:
  RED:
    primary: security-auditor
    secondary: [test, architect-review]
    focus: "Security test requirements definition"

  GREEN:
    primary: security-auditor
    secondary: [code-reviewer, test]
    focus: "Secure implementation with vulnerability prevention"

  REFACTOR:
    coordination: security-auditor
    agents: [code-reviewer, architect-review, test]
    focus: "Security hardening and compliance validation"
```

### 3. Healthcare Compliance Workflow

**Use Case**: Patient data, clinical records, LGPD compliance

```yaml
workflow: "healthcare-compliance-tdd"
compliance_first: true
regulations: ["LGPD", "CFM", "ANVISA"]

agent_coordination:
  security-auditor: "Primary - LGPD compliance validation"
  architect-review: "Data architecture and privacy by design"
  code-reviewer: "PHI handling and audit trail implementation"
  test: "Compliance test patterns and data protection validation"
```

---

## 🗂 Phase 1 — Backend↔Database Integration (Agent-Orchestrated)

**Agent Coordination**: `architect-review` (primary) + `security-auditor` + `code-reviewer`

### 1.1 Schema & Client Validation (Parallel Execution)

```yaml
parallel_agents:
  architect-review:
    - "Validate database schema design patterns"
    - "Review service boundaries and data relationships"

  security-auditor:
    - "Verify RLS policies on sensitive tables"
    - "Audit data access patterns and permissions"

  code-reviewer:
    - "Analyze Prisma client generation and type safety"
    - "Review API-database contract consistency"
```

```bash
# Parallel execution commands
pnpm --filter @neonpro/api prisma:generate
pnpm --filter @neonpro/api build
```

### 1.2 Database Structure & RLS Analysis (Sequential with Validation)

```yaml
sequential_execution:
  1. architect-review: "Analyze database architecture and relationships"
  2. security-auditor: "Validate RLS policies and tenant isolation"
  3. code-reviewer: "Review field mapping and error handling"

quality_gates:
  - "RLS enabled on all patient/clinic tables"
  - "Multi-tenant scoping verified in all queries"
  - "No cross-tenant data leakage possible"
```

**Agent Tasks**:

- **architect-review**: Validate schema design patterns, FK relationships, enum consistency
- **security-auditor**: Verify RLS policies, audit data access patterns, tenant isolation
- **code-reviewer**: Check snake_case/camelCase mapping, error handling coverage

### 1.3 API-Database Contract Validation (Multi-Agent Analysis)

```yaml
agent_coordination:
  code-reviewer:
    - "Scan Hono routes for field name consistency"
    - "Validate error handling for DB errors and RLS denials"

  security-auditor:
    - "Ensure multi-tenant scoping in patient/clinic queries"
    - "Verify audit trail implementation for data access"

  architect-review:
    - "Review API contract alignment with database schema"
    - "Validate service layer abstraction patterns"
```

---

## 🏥 Phase 2 — LGPD & Healthcare Security (Agent-Orchestrated Critical)

**Agent Coordination**: `security-auditor` (primary) + `architect-review` + `code-reviewer` + `test`

### 2.1 LGPD Compliance Validation (Security-First Orchestration)

```yaml
workflow: healthcare-compliance-tdd
primary_agent: security-auditor

RED_phase:
  security-auditor:
    - "Define LGPD compliance test requirements"
    - "Create consent validation test patterns"
    - "Establish audit trail test structure"

  test:
    - "Implement failing compliance tests"
    - "Create PHI handling test scenarios"

GREEN_phase:
  code-reviewer:
    - "Implement consent validation logic"
    - "Add audit trail mechanisms"

  security-auditor:
    - "Validate LGPD compliance implementation"
    - "Verify data protection measures"

REFACTOR_phase:
  parallel_execution:
    - security-auditor: "Enhance security measures"
    - architect-review: "Optimize privacy-by-design patterns"
    - code-reviewer: "Improve audit trail performance"
    - test: "Optimize compliance test suite"
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
      - "Consent RPC validation (`packages/core-services` / Supabase edge functions)"
      - "ANVISA device/adverse-event verification per `docs/testing/database-security-testing.md`"
      - "Professional access controls (CFM) verification"
      - "No PHI in logs or test fixtures (enforce anonymized fixtures per `docs/testing/database-security-testing.md`)"
      - "TLS in transit, encrypted storage at rest validation"
      - "Run `pnpm test:healthcare` (LGPD suite) and archive results in Archon"

  architect-review:
    priority: "P0 - Critical"
    tasks:
      - "Privacy-by-design architecture validation"
      - "Data flow analysis for PHI handling"
      - "Service boundary security review"

  code-reviewer:
    priority: "P1 - High"
    tasks:
      - "PHI handling code review"
      - "Error handling without data leakage"
      - "Logging sanitization validation"
      - "Verify anonymization helpers and data minimization rules are in place"
```

### 2.3 RLS Integration Validation (Sequential Security Analysis)

```yaml
sequential_execution:
  1. architect-review:
     - "Review RLS policy architecture"
     - "Validate tenant isolation design"

  2. security-auditor:
     - "Verify policies active for patient/clinic tables"
     - "Test user context propagation (clinic, role, professional id)"
     - "Validate tenant isolation effectiveness"

  3. code-reviewer:
     - "Review RLS policy implementation in queries"
     - "Validate context passing in API layers"

  4. test:
     - "Execute tenant isolation tests"
     - "Validate cross-tenant access prevention"

quality_gates:
  - "RLS policies active on all sensitive tables: ≥100%"
  - "User context propagation verified: ≥100%"
  - "Tenant isolation tests pass: ≥100%"
  - "No cross-tenant data access possible: ≥100%"
  - "Audit trail integrity confirmed (no missing entries, retention ≥7 years)"
  - "Test data anonymization validated before sharing outputs"
  - "Gate failures trigger `pnpm test:healthcare -- --audit-only` rerun with evidence logged in Archon"
```

### 2.4 Emergency Access & Documentation (Compliance Orchestration)

```yaml
agent_coordination:
  security-auditor:
    - "Validate emergency access protocols"
    - "Review break-glass procedures"
    - "Audit emergency access logging (including alert delivery and session expiry)"
    - "Log break-glass review outcome in Archon referencing compliance doc"

  architect-review:
    - "Review emergency access architecture"
    - "Validate failsafe mechanisms"

  code-reviewer:
    - "Review emergency access implementation"
    - "Validate audit trail for emergency procedures"
```

---

## 🧪 Phase 3 — Code Quality & Build Checks (Parallel Agent Execution)

**Agent Coordination**: `code-reviewer` (primary) + `architect-review` + `security-auditor` + `test`

### 3.1 Parallel Quality Analysis (Optimized Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "TypeScript strict type checking"
    - "Code quality metrics analysis"
    - "Performance bottleneck detection"

  security-auditor:
    - "Dependency vulnerability scanning"
    - "Security advisory analysis"
    - "Code security pattern validation"

  architect-review:
    - "Architecture pattern compliance"
    - "Design consistency validation"
    - "Module dependency analysis"

  test:
    - "Test coverage analysis"
    - "Test quality assessment"
    - "TDD pattern validation"
```

### 3.2 Build & Quality Commands (Agent-Coordinated)

```bash
# Root workspace scripts (executed via Bun/PNPM)
pnpm test:backend
pnpm test:frontend
pnpm test:healthcare -- --regression
pnpm lint
pnpm type-check
pnpm audit --json > audit-report.json || true
```

Optional VS Code tasks (fast):

- “🧪 Web Tests (apps/web)”
- “🔎 Web Smoke Test (vite build)”
- “🧹 Web Lint (apps/web)”
- “✅ Web Type-Check (apps/web)”

---

### 3.3 Quality Gates & Thresholds

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

  architect-review:
    - "Architecture violations: 0"
    - "Design pattern compliance: >90%"
    - "Module coupling: <80%"

  test:
    - "Test coverage: ≥90% critical / ≥85% important / ≥80% useful (attach Vitest coverage report)"
    - "Test quality score: >8/10"
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

  architect-review:
    - "Validate test architecture and patterns"
    - "Review integration test strategies"
    - "Ensure test coverage aligns with system boundaries"

  code-reviewer:
    - "Analyze code changes for test impact"
    - "Review test quality and maintainability"
    - "Validate test performance and efficiency"

  security-auditor:
    - "Ensure security test coverage for sensitive changes"
    - "Validate compliance test execution"
    - "Review test data security and PHI handling"
```

### 4.2 Intelligent Routing Rules (Agent-Driven)

```yaml
routing_strategy:
  inputs:
    - changed_files: "git diff analysis"
    - integration_issues: "schema, API, compliance changes"
    - monorepo_map: "docs/architecture/source-tree.md"

  path_to_strategy:
    "apps/api/**":
      primary_agent: architect-review
      strategy: "Hono API integration + DB/RLS validation"
      tests: ["integration", "api-contract", "rls-security"]
      regression_suite: "pnpm test:healthcare -- --regression"
      notes: "Always enqueue this regression when `changed_files` includes `apps/api/src/routes/**`."

    "packages/database/**":
      primary_agent: security-auditor
      strategy: "Schema & RLS verification + API regression"
      tests: ["schema-validation", "rls-policies", "migration-safety"]
      regression_suite: "pnpm test:healthcare -- --audit-only"
      notes: "Auto-run audit-only regression when database objects change; log evidence in Archon."

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
```

### 4.3 Test Execution Commands (Agent-Coordinated)

```bash
# API + DB regression (architect-review + code-reviewer)
pnpm test:backend

# Frontend integration (test + code-reviewer)
pnpm test:frontend
pnpm test:a11y

# Healthcare compliance / Playwright suite (test + security-auditor)
pnpm test:healthcare -- --compliance
pnpm test:e2e
pnpm test:orchestrate -- --healthcare-compliance
# Playwright results must be archived with screenshots/videos for compliance evidence
```

### 4.4 Coverage Policy & Quality Gates

```yaml
coverage_policy:
  critical: "≥90% (healthcare data, authentication, payments)"
  important: "≥85% (business logic, integrations)"
  useful: "≥80% (UI components, utilities)"

agent_validation:
  test:
    - "Validate coverage thresholds met"
    - "Review test quality metrics"

  security-auditor:
    - "Ensure compliance test coverage"
    - "Validate security test execution"

  code-reviewer:
    - "Review test maintainability"
    - "Validate test performance"
```

---

## 🛠️ Phase 5 — Systematic Fixing (Agent-Orchestrated Priorities)

**Agent Coordination**: Priority-based agent assignment with parallel execution where possible

### 5.1 P0 — Integration Blockers (Critical - Sequential Execution)

```yaml
sequential_execution:
  1. architect-review:
     - "Analyze DB schema mismatches and relationship issues"
     - "Review API field mapping and contract alignment"

  2. security-auditor:
     - "Identify RLS bypass risks and tenant isolation issues"
     - "Validate consent/audit logging on PHI paths"

  3. code-reviewer:
     - "Fix API field errors and implement tenant/role scoping"
     - "Implement missing consent/audit logging mechanisms"

blocking_issues:
  - "DB mismatches (naming/relations), RLS bypass risks"
  - "API field errors, missing tenant/role scoping"
  - "Missing consent/audit logging on PHI paths"

quality_gate: "All P0 issues resolved before proceeding"
```

### 5.2 P1 — Security & Compliance (Parallel Execution)

```yaml
parallel_execution:
  security-auditor:
    - "Implement no-eval policies and safe fetch options"
    - "Validate URL safety and input sanitization"
    - "Implement PHI redaction in logs and error messages"
    - "Add audit logs for sensitive operations"

  code-reviewer:
    - "Review and fix security code patterns"
    - "Optimize error handling without data leakage"
    - "Validate logging sanitization implementation"

security_compliance:
  - "no-eval, safe fetch options, URL safety"
  - "PHI redaction; audit logs for sensitive ops"
```

### 5.3 P2 — Type Safety & Contracts (Parallel Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "Replace `any` with `unknown`/specific types"
    - "Align response types and zod schemas with routes"
    - "Improve type safety across API boundaries"

  architect-review:
    - "Review API contract consistency"
    - "Validate type system architecture"
    - "Ensure schema alignment across layers"

type_safety:
  - "Replace `any` with `unknown`/specific types"
  - "Align response types and zod schemas with routes"
```

### 5.4 P3 — Module & Hygiene (Parallel Execution)

```yaml
parallel_execution:
  code-reviewer:
    - "Convert to ES module imports"
    - "Remove dead code and unused dependencies"
    - "Optimize query performance"
    - "Improve error handling patterns"

  architect-review:
    - "Review module architecture and dependencies"
    - "Validate import/export patterns"
    - "Optimize module boundaries"

module_hygiene:
  - "ES module imports, remove dead code"
  - "Query optimization and error handling"
```

### 5.5 Error Handling & Rollback Strategy

```yaml
error_handling:
  agent_failure:
    - "Log agent failure with context"
    - "Attempt automatic recovery with alternative agent"
    - "Escalate to manual intervention if needed"

  quality_gate_failure:
    - "Stop execution at failed gate"
    - "Provide detailed failure analysis"
    - "Suggest remediation steps"

  rollback_strategy:
    - "Maintain checkpoint before each phase"
    - "Enable selective rollback to last successful state"
    - "Preserve audit trail of all changes"
```

---

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
```

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
  - "Consent checks present on PHI routes: ≥100% (verify consent records complete)"
  - "Audit logs exist, immutable, and meet 7-year retention"
  - "LGPD compliance validated: ≥100%"
  - "PHI handling secure: ≥100%"
  - "Regression suite executed (`pnpm test:healthcare`) with artifacts stored in Archon"
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
  - "Audit trail entries captured for access attempts (review with `pnpm test:healthcare -- --audit-only`)"
  - "ANVISA device/adverse-event registration validation documented: ≥100%"
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
```

### Consolidated Reporting

- **Quality Report**: `quality-report.txt` (aggregated from all agents)
- **Security Report**: `security-report.json` (security-auditor primary)
- **Architecture Report**: `architecture-analysis.md` (architect-review primary)
- **Test Report**: `test-coverage-report.json` (test agent primary)
- **Archon Tasks**: Update with agent decisions and evidence
- **Knowledge Base**: Upload artifacts to Archon KB and refresh `docs/features/code-quality-audit.md` with version/date
- **Documentation**: Append findings to `docs/mistakes/*.md` when applicable

## 🔧 Orchestration Examples

### Example 1: Healthcare Feature Development

```yaml
feature: "patient-appointment-scheduling"
complexity: "high"
triggers: ["healthcare", "patient", "appointment", "scheduling"]

agent_activation:
  - security-auditor: "LGPD compliance, PHI handling"
  - architect-review: "Appointment system architecture"
  - code-reviewer: "Business logic implementation"
  - test: "Healthcare compliance testing"

workflow: "healthcare-compliance-tdd"
execution: "security-critical with full agent coordination"
```

### Example 2: API Integration Enhancement

```yaml
feature: "external-api-integration"
complexity: "medium"
triggers: ["api", "integration", "external"]

agent_activation:
  - architect-review: "Integration architecture patterns"
  - security-auditor: "API security validation"
  - code-reviewer: "Integration code quality"
  - test: "Integration testing patterns"

workflow: "standard-tdd"
execution: "parallel where possible, sequential for dependencies"
```

## 🧩 Minimal Examples

Type safety

```ts
// Before
type Handler = (c: any) => any;
// After
type Handler = (c: import('hono').Context) => Response | Promise<Response>;
```

ESM imports

```ts
// Before
const { execSync } = require('node:child_process');
// After
import { execSync } from 'node:child_process';
```

---

## 🧭 Quick Start (Task Runner)

Use workspace tasks for speed:

- “🧪 Web Tests (apps/web)” → Vitest suite para frontend
- “🔎 Web Smoke Test (vite build)” → build rápido de verificação
- “🧹 Web Lint (apps/web)” → lint local
- “✅ Web Type-Check (apps/web)” → type-check dedicado

CLI fallbacks

```bash
# Root helpers
pnpm test:orchestrate -- --all-categories
pnpm workflow:ci

# Suites focadas
pnpm test:backend
pnpm test:frontend
pnpm test:healthcare -- --regression
```

---

## This enhanced audit prompt integrates the Quality Control command’s strengths (testing, compliance, performance, security, cleanup, formatting) into our existing phases—mapped to NeonPro’s stack and source tree, without overengineering or redundant rules.

## 🔬 Optional Advanced DB Checks (keep if needed)

Prisma advanced (use only when investigating schema drift):

```bash
# Validate schema against DB (if script exists in packages/database)
cd packages/database && pnpm prisma:validate || npx prisma validate --schema prisma/schema.prisma

# Compare actual DB schema (read‑only)
cd packages/database && npx prisma db pull --print > schema-actual.prisma

diff packages/database/prisma/schema.prisma schema-actual.prisma || true
```

## 🧯 Optional Project-Specific Tests (if available)

```bash
# API route/database integration suites (run if these scripts exist)
cd apps/api && pnpm test:routes || true
cd apps/api && pnpm test:db-integration || true
cd apps/api && pnpm test:lgpd-compliance || true
cd apps/api && pnpm test:rls-security || true
```

---

## 🔍 Troubleshooting Agent Orchestration

### Common Orchestration Issues

| Issue                            | Symptoms                                             | Solution                                             | Responsible Agent  |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------ |
| **Agent Coordination Conflicts** | Multiple agents making contradictory recommendations | Implement priority hierarchy and conflict resolution | All agents         |
| **Quality Gate Failures**        | Consistent failures in specific quality gates        | Review gate thresholds and agent effectiveness       | Primary gate agent |
| **Performance Degradation**      | Audit cycles taking significantly longer             | Optimize agent selection and parallel execution      | architect-review   |
| **Context Loss Between Phases**  | Agents losing shared context during transitions      | Strengthen state management and context persistence  | All agents         |
| **Healthcare Compliance Issues** | LGPD or RLS validation failures                      | Enhanced security-auditor focus and validation       | security-auditor   |

### Recovery Strategies

```yaml
recovery_strategies:
  agent_failure:
    - "Automatic failover to backup agent"
    - "Graceful degradation with reduced functionality"
    - "Manual intervention escalation"
    - "Apply `fallback_priority` order and log reassignment in Archon"

  quality_gate_failure:
    - "Detailed failure analysis and reporting"
    - "Suggested remediation steps"
    - "Rollback to last successful state"
    - "Rerun impacted phase sequentially with regression suite IDs attached"

  orchestration_failure:
    - "Reset to last known good state"
    - "Re-initialize agent coordination"
    - "Fallback to manual execution mode"
    - "Escalate to project owner if two sequential retries fail"
```

## 🎯 Summary

**This enhanced multi-agent orchestration system transforms the basic audit into a sophisticated, intelligent quality assurance workflow. It integrates TDD methodology, parallel execution optimization, comprehensive quality gates, and healthcare compliance validation—all while maintaining compatibility with NeonPro's existing tech stack and development workflows.**

### Key Enhancements

- **🤖 Multi-Agent Coordination**: Intelligent orchestration of specialized code review agents
- **🔄 TDD Integration**: Red-green-refactor cycles with agent coordination
- **⚡ Parallel Execution**: Optimized performance through concurrent agent execution
- **🛡️ Healthcare Compliance**: Enhanced LGPD and security validation
- **✅ Comprehensive Quality Gates**: Multi-layered validation with agent-specific responsibilities
- **🔧 Error Handling**: Robust rollback and recovery strategies
- **📊 Advanced Reporting**: Agent-coordinated reporting and documentation

### Documentation & Rollout
- Update supporting docs in lockstep: `docs/AGENTS.md`, `docs/architecture/source-tree.md`, `docs/testing/AGENTS.md`, `docs/testing/database-security-testing.md`, and `docs/mistakes/automation.md` (note the prompt version/date in each).
- Link the refreshed workflow inside `docs/features/code-quality-audit.md` and sanitize PHI fixtures per `docs/testing/database-security-testing.md` before sharing artifacts.
- Rollout checklist:
  - Executar `pnpm test:orchestrate -- --all-categories` e `pnpm test:healthcare -- --regression`, anexando os logs/relatórios resultantes ao task do Archon.
  - Capture all sequential/parallel agent logs, Playwright evidence, and coverage reports in Archon + knowledge base.
  - Schedule a 48h follow-up task in Archon to confirm documentation merges and knowledge base updates.
- Store new lessons in Archon knowledge base; open an optional memory entry if novel mistakes or edge cases surface.
