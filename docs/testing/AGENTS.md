---
title: "Testing Orchestrator with TDD Agent Coordination"
version: 3.1.0
last_updated: 2025-09-17
language: en
form: how-to
tags: [testing, orchestration, tdd, agents, quality]
agent_integration:
  tdd_orchestrator: "Primary coordinator for red-green-refactor cycles"
  architect_review: "Architecture validation and pattern compliance" 
  code_reviewer: "Quality analysis and maintainability"
  security_auditor: "Compliance validation and vulnerability scanning"
  test: "Pattern enforcement and coverage validation"
related:
  - ../agents/code-review/tdd-orchestrator.md
  - ../agents/code-review/architect-review.md
  - ../agents/code-review/code-reviewer.md
  - ../agents/code-review/security-auditor.md
  - ../agents/code-review/test.md
applyTo:
  - "docs/testing/**"
  - "tools/tests/**"
  - "tools/orchestration/**"
llm:
  mandatory_sequence:
    - sequential-thinking
    - archon-task-management
    - serena-codebase-analysis
    - tdd-orchestrator
  pre_read:
    - path: "docs/AGENTS.md"
      reason: "Root docs orchestrator and project patterns"
    - path: "docs/testing/AGENTS.md"
      reason: "Testing orchestration guide (this file)"
    - path: ".claude/CLAUDE.md"
      reason: "Development workflow and MCP integration rules"
  must_use_mcps:
    required: ["archon", "serena", "desktop-commander"]
    optional: ["context7", "tavily", "supabase"]
    never: ["native-search", "native-codebase-tools"]
  retrieval_hints:
    prefer:
      - "docs/testing/AGENTS.md"
      - "docs/testing/front-end-testing.md"
      - "docs/testing/backend-architecture-testing.md"
      - "docs/testing/database-security-testing.md"
      - "docs/testing/code-review-auditfix.md"
      - "tools/orchestration/**"
    avoid:
      - "archived files in /tmp/"
      - "*.pdf"
      - "removed testing documentation"
  guardrails:
    tone: "concise, professional, English-only"
    formatting: "Markdown with clear H2/H3 headings, fenced code blocks, one command per line"
    stop_criteria: "finish end-to-end; only stop when testing is complete and validated"
    execution: "Always complete full Archon → Serena → Implementation → Validation cycle"
  output_preferences:
    - "Always use TodoWrite tool for task tracking"
    - "Use Archon MCP for task management and knowledge storage"
    - "Use Serena MCP for all codebase search and analysis"
    - "Include agent assignments with specific roles"
    - "Provide runnable shell commands in fenced blocks"
    - "Reference consolidated testing guides only"
---

# 🧪 Testing Orchestrator with TDD Agent Coordination — Version: 3.0.0

## Overview

Central coordinator for comprehensive testing ecosystem orchestrated by specialized code review agents. Implements systematic TDD cycles with intelligent agent delegation, quality gate enforcement, and healthcare compliance validation.

**Target Audience**: Development teams, QA engineers, DevOps specialists, LLM agents
**Integration Level**: Advanced (multi-agent orchestration)

## 🤖 LLM Orchestration Guide

### Mandatory Execution Sequence

**ALWAYS follow this exact sequence when handling testing tasks:**

1. **Sequential Thinking** → Analyze requirements and complexity
2. **Archon Task Management** → Create/update tasks and check project context
3. **Serena Codebase Analysis** → Understand existing code and patterns
4. **TDD Implementation** → Execute red-green-refactor cycles
5. **Validation & Documentation** → Verify results and update knowledge base

### MCP Integration Rules

```yaml
CRITICAL_MCPS:
  archon: "MANDATORY - All task management and knowledge storage"
  serena: "MANDATORY - All codebase search and semantic analysis"
  desktop-commander: "MANDATORY - All file operations and terminal commands"

NEVER_USE:
  - Native search tools
  - Native codebase analysis tools
  - Direct file manipulation without desktop-commander

TESTING_WORKFLOW:
  1. archon.get_task() → Understand current testing requirements
  2. serena.get_symbols_overview() → Analyze existing test structure
  3. serena.find_symbol() → Locate relevant test files
  4. desktop-commander.write_file() → Implement tests in chunks ≤30 lines
  5. archon.update_task() → Track progress and findings
```

## Agent-Orchestrated Testing Framework

### TDD Cycle Coordination

#### RED Phase (Test Definition)
- **Primary Agent**: `test.md` - Pattern enforcement and structure
- **Support Agents**:
  - `architect-review.md` - Design validation and architecture tests
  - `security-auditor.md` - Security test requirements (compliance-driven)

```yaml
red_phase:
  coordinator: test
  workflow:
    1. "Define test structure and patterns"
    2. "Validate architectural test approach" 
    3. "Ensure security test coverage"
    4. "Create failing tests (RED state)"
  quality_gates:
    - "Test patterns compliance ≥95%"
    - "Architecture alignment ≥90%"
    - "Security coverage ≥100%"
```

#### GREEN Phase (Implementation)
- **Primary Agent**: `code-reviewer.md` - Quality analysis
- **Support Agents**:
  - `architect-review.md` - Pattern compliance validation
  - `security-auditor.md` - Vulnerability scanning
  - `test.md` - Test execution validation

```yaml
green_phase:
  coordinator: code-reviewer
  workflow:
    1. "Implement minimal code to pass tests"
    2. "Validate architectural patterns"
    3. "Perform security analysis"
    4. "Verify test success (GREEN state)"
  quality_gates:
    - "All tests passing ≥100%"
    - "Code quality metrics ≥85%"
    - "Security validation ≥100%"
    - "Pattern compliance ≥90%"
```

#### REFACTOR Phase (Optimization)
- **Coordination**: Parallel execution across all agents
- **Agents**:
  - `code-reviewer.md` - Code quality improvements
  - `architect-review.md` - Design optimization
  - `security-auditor.md` - Security hardening
  - `test.md` - Test optimization

```yaml
refactor_phase:
  coordination: parallel
  workflow:
    1. "Identify refactoring opportunities"
    2. "Apply design improvements"
    3. "Enhance security measures"
    4. "Optimize test suite"
  quality_gates:
    - "Quality metrics improved ≥10%"
    - "Architecture score maintained ≥90%"
    - "Security posture improved ≥100%"
    - "Test performance improved ≥5%"
```

## Testing Hierarchy with Agent Assignment

### Unit Tests (code-reviewer coordination)
- **Focus**: Functions, components, business logic
- **Agent**: `code-reviewer.md` validates quality metrics
- **Coverage Target**: ≥90% for critical paths
- **Location**: `tools/tests/unit/`

### Integration Tests (architect-review coordination)
- **Focus**: API contracts, service boundaries, data flow
- **Agent**: `architect-review.md` validates patterns
- **Support**: `security-auditor.md` for compliance
- **Coverage Target**: ≥80% for integrations
- **Location**: `tools/tests/integration/`

### E2E Tests (tdd-orchestrator coordination)
- **Focus**: Critical user workflows, end-to-end validation
- **Agent**: All agents parallel validation
- **Special**: Healthcare compliance workflows
- **Coverage Target**: ≥70% for critical flows
- **Location**: `tools/tests/e2e/`

### Security Tests (security-auditor coordination)
- **Focus**: LGPD/GDPR/HIPAA compliance, vulnerability scanning
- **Agent**: `security-auditor.md` primary validation
- **Support**: `architect-review.md` for design security
- **Coverage Target**: ≥95% for compliance paths
- **Location**: `tools/tests/security/`

## Quick Navigation & Commands

### Agent-Specific Testing

```bash
# Backend ↔ database regression (architect-review + code-reviewer)
pnpm test:backend

# Frontend regression & accessibility (test + code-reviewer)
pnpm test:frontend
pnpm test:a11y

# Healthcare compliance suites (security-auditor primary)
pnpm test:healthcare -- --regression
pnpm test:healthcare -- --audit-only
```

### Master Orchestration Commands

```bash
# Full constitutional audit (all agents)
pnpm constitutional:full

# Quick audit smoke
pnpm constitutional:quick

# Performance benchmark snapshot
pnpm constitutional:benchmark
```

Log every run ID and console summary in Archon task notes so audit evidence stays traceable.

## Testing Documentation Matrix

### Consolidated Testing Guides

| Document | Agent Coordinator | MCP Tools Required | Focus Area | Use When |
|----------|-------------------|-------------------|------------|-----------|
| **[front-end-testing.md](./front-end-testing.md)** | `test` + `tdd-orchestrator` | `serena`, `desktop-commander`, `shadcn` | React, E2E, accessibility, UI components | Frontend testing, user journeys, component validation |
| **[backend-architecture-testing.md](./backend-architecture-testing.md)** | `architect-review` + `tdd-orchestrator` | `serena`, `desktop-commander`, `context7` | Hono APIs, integration, monorepo strategies | Backend services, API endpoints, system integration |
| **[database-security-testing.md](./database-security-testing.md)** | `security-auditor` + `compliance-checker` | `serena`, `supabase`, `desktop-commander` | Supabase, RLS, LGPD, healthcare compliance | Database testing, security validation, compliance checks |
| **[code-review-auditfix.md](./code-review-auditfix.md)** | `code-reviewer` + `security-auditor` | `archon`, `serena`, `desktop-commander` | Review standards, coverage, CI/CD, audit procedures | Code quality, PR validation, audit fixes, compliance enforcement |

### LLM Decision Matrix for Testing Tasks

```yaml
task_routing:
  frontend_components:
    guide: "front-end-testing.md"
    agents: ["test", "tdd-orchestrator"]
    mcps: ["serena", "desktop-commander", "shadcn"]
    triggers: ["React", "component", "UI", "accessibility", "E2E"]
    
  api_endpoints:
    guide: "backend-architecture-testing.md"
    agents: ["architect-review", "tdd-orchestrator"]
    mcps: ["serena", "desktop-commander", "context7"]
    triggers: ["Hono", "API", "endpoint", "integration", "monorepo"]
    
  database_security:
    guide: "database-security-testing.md"
    agents: ["security-auditor", "compliance-checker"]
    mcps: ["serena", "supabase", "desktop-commander"]
    triggers: ["Supabase", "RLS", "database", "LGPD", "compliance"]
    
  code_quality:
    guide: "code-review-auditfix.md"
    agents: ["code-reviewer", "security-auditor"]
    mcps: ["archon", "serena", "desktop-commander"]
    triggers: ["review", "coverage", "audit", "CI/CD", "quality"]
```

## Agent Responsibilities Matrix

### By Test Type

| Test Type | Primary Agent | Support Agents | Validation Focus |
|-----------|---------------|----------------|------------------|
| **Unit** | `code-reviewer` | `test` | Quality metrics, maintainability |
| **Integration** | `architect-review` | `security-auditor`, `code-reviewer` | Patterns, contracts, security |
| **E2E** | `tdd-orchestrator` | All agents | Complete workflows, compliance |
| **Security** | `security-auditor` | `architect-review` | Vulnerabilities, compliance |
| **Performance** | `code-reviewer` | `architect-review` | Metrics, scalability |
| **Compliance** | `security-auditor` | `tdd-orchestrator` | LGPD/ANVISA/CFM validation |

### By Development Phase

| Phase | Coordinating Agent | Executing Agents | Key Activities |
|-------|-------------------|------------------|----------------|
| **Planning** | `tdd-orchestrator` | `architect-review` | Test strategy, architecture design |
| **RED Phase** | `test` | `architect-review`, `security-auditor` | Test definition, requirements |
| **GREEN Phase** | `code-reviewer` | `security-auditor`, `test` | Implementation, validation |
| **REFACTOR** | `tdd-orchestrator` | All agents | Optimization, improvement |
| **Review** | `code-reviewer` | All agents | Quality validation, approval |
| **Deploy** | `security-auditor` | `tdd-orchestrator` | Security, compliance final check |

## Quality Gates & Enforcement

### Agent-Validated Coverage Targets

```yaml
COVERAGE_BY_AGENT:
  architect_review:
    patterns: "≥90% architecture pattern compliance"
    boundaries: "≥85% service boundary validation"
    scalability: "≥80% scalability test coverage"
  
  code_reviewer:
    quality: "≥85% code quality metrics"
    performance: "≥80% performance test coverage"
    maintainability: "≥85% maintainability score"
  
  security_auditor:
    compliance: "≥95% regulatory compliance"
    vulnerabilities: "0 critical, ≤3 high severity"
    authentication: "≥100% auth flow coverage"
  
  test:
    patterns: "≥90% TDD pattern compliance"
    coverage: "≥90% critical / ≥85% important / ≥80% useful with Vitest report attached"
    structure: "≥95% test structure compliance"
```

### Healthcare Compliance Requirements

```yaml
HEALTHCARE_COMPLIANCE:
  lgpd_requirements:
    - "Patient data anonymization in test fixtures"
    - "Consent management workflow testing"
    - "Data subject rights validation"
    - "Audit trail functionality testing"
  
  anvisa_requirements:
    - "Medical device software classification tests"
    - "Clinical workflow validation"
    - "Risk management testing"
    - "Post-market surveillance compliance"
  
  cfm_requirements:
    - "Medical professional licensing validation"
    - "Telemedicine compliance testing"
    - "Digital prescription workflow testing"
    - "Patient confidentiality validation"
```

## Workflow Integration

### CI/CD Pipeline Integration

```yaml
CI_ORCHESTRATION:
  stages:
    1. "Unit tests (code-reviewer validation)"
    2. "Integration tests (architect-review patterns)"
    3. "Security tests (security-auditor compliance)"
    4. "E2E tests (tdd-orchestrator coordination)"
    5. "Performance tests (code-reviewer metrics)"
    6. "Compliance validation (security-auditor audit)"
  
  parallel_execution:
    - "Unit + Integration tests"
    - "Security + Performance tests"
    - "Final compliance validation"
  
  quality_gates:
    - "All agent validations pass"
    - "Coverage thresholds met"
    - "Security compliance verified"
    - "Performance benchmarks achieved"
```

### Audit Workflow Alignment (Prompt v3.2.0)
- Preload the audit prompt’s **Process & Tooling Integration** section and stick to the workspace scripts listed there.
- Record every `pnpm test:healthcare -- --regression` and `-- --audit-only` execution in Archon with links to Vitest/Playwright artifacts.
- When the prompt version increments, attach the documentation diff and schedule the mandated 48h follow-up task.

### IDE Integration

```yaml
IDE_COMMANDS:
  vscode:
    - "Test: Run Agent-Coordinated Tests"
    - "Quality: Validate with All Agents"
    - "TDD: Start Orchestrated Cycle"
  
  jetbrains:
    - "Orchestrate TDD Cycle"
    - "Run Agent-Specific Tests"
    - "Validate Quality Gates"
```

## Performance & Metrics

### Orchestration Efficiency

```yaml
PERFORMANCE_TARGETS:
  test_execution:
    unit: "≤5 minutes with agent validation"
    integration: "≤10 minutes with pattern validation"
    e2e: "≤15 minutes with compliance checks"
  
  agent_coordination:
    parallel_efficiency: "≥80% resource utilization"
    communication_overhead: "≤10% of total time"
    quality_gate_validation: "≤2 minutes per gate"
```

### Quality Metrics Dashboard

```yaml
METRICS_TRACKING:
  agent_effectiveness:
    - "Issues detected per agent"
    - "Quality improvements suggested"
    - "Compliance violations prevented"
  
  workflow_efficiency:
    - "TDD cycle completion time"
    - "Agent coordination success rate"
    - "Quality gate pass/fail ratios"
  
  system_health:
    - "Overall test coverage trends"
    - "Security compliance scores"
    - "Performance benchmark tracking"
```

## Troubleshooting & Support

### Common Issues

| Issue | Primary Agent | Solution Path |
|-------|---------------|---------------|
| **Test Pattern Violations** | `test` | Review TDD orchestrator patterns |
| **Architecture Compliance** | `architect-review` | Validate design patterns |
| **Security Vulnerabilities** | `security-auditor` | Run compliance validation |
| **Quality Gate Failures** | `code-reviewer` | Check quality metrics |
| **Integration Failures** | `tdd-orchestrator` | Coordinate agent resolution |

### Debug Commands

```bash
# Debug agent coordination
/quality-control debug --agent-communication --verbose

# Trace test execution
/quality-control trace --workflow=full --show-agents

# Validate quality gates
/quality-control validate --all-gates --detailed-report
```

## Next Steps

### Getting Started
1. **Initialize Orchestration**: Configure agent registry
2. **Setup Quality Gates**: Define thresholds per agent
3. **Configure Workflows**: Choose appropriate TDD patterns
4. **Integrate CI/CD**: Setup pipeline orchestration

### Advanced Configuration
- **Multi-Team Coordination**: Scale across development teams  
- **Custom Workflows**: Create project-specific patterns
- **Metrics Integration**: Connect to monitoring dashboards
- **Compliance Automation**: Automate regulatory validation

## See Also

- **[TDD Orchestrator](../agents/code-review/tdd-orchestrator.md)** - Complete orchestration framework
- **[Quality Control Command](../../.claude/commands/quality-control.md)** - Master command interface
- **[Testing Tools](../../tools/orchestration/)** - Implementation utilities
- **[Frontend Testing Guide](./front-end-testing.md)** - React, E2E, and accessibility testing
- **[Backend Architecture Testing](./backend-architecture-testing.md)** - API, integration, and monorepo testing
- **[Database Security Testing](./database-security-testing.md)** - Supabase, RLS, and compliance testing
- **[Code Review & Audit Fix](./code-review-auditfix.md)** - Quality standards and audit procedures## 🎯 LLM Quick Start Protocol

### For Any Testing Task

```bash
# 1. ALWAYS start with sequential thinking
sequential-thinking → analyze requirements, complexity, and approach

# 2. MANDATORY Archon integration
archon.list_tasks() → check current testing tasks
archon.get_task(task_id) → understand specific requirements
archon.update_task(status="doing") → mark as in progress

# 3. MANDATORY Serena codebase analysis
serena.get_symbols_overview() → understand project structure
serena.find_symbol() → locate relevant test files and patterns
serena.search_for_pattern() → find existing test implementations

# 4. Select appropriate guide and execute
# Based on triggers above, choose the correct testing guide
# Follow the specific patterns and examples in that guide

# 5. Implementation with desktop-commander
desktop-commander.write_file() → create tests in ≤30 line chunks
desktop-commander.start_process("bun test") → run tests
desktop-commander.start_process("bun run lint:fix") → fix issues

# 6. MANDATORY task completion
archon.update_task(status="review") → mark for review
archon.create_document() → document any new patterns or learnings
```

### Healthcare Compliance Priority

**CRITICAL**: For patient data or healthcare features, ALWAYS prioritize:
1. **Security-first testing** → Use `database-security-testing.md`
2. **LGPD compliance validation** → Include data protection tests
3. **Audit trail verification** → Test logging and monitoring
4. **RLS policy enforcement** → Validate access controls

### Common LLM Patterns

```typescript
// ✅ ALWAYS use this pattern for healthcare tests
describe('Patient Data Access - LGPD Compliance', () => {
  beforeEach(async () => {
    // security-auditor: Setup isolated test environment
    await setupTestDatabase();
    await seedTestData();
  });

  it('enforces RLS policies for cross-clinic access', async () => {
    // security-auditor: Validate unauthorized access is blocked
    const unauthorizedAccess = async () => {
      // Test implementation
    };
    await expect(unauthorizedAccess()).rejects.toThrow('Access denied');
  });
});

// ✅ ALWAYS include audit logging tests
it('logs patient data access for compliance', async () => {
  // compliance-checker: Verify audit trail
  const patientData = await getPatientData(patientId, userId);
  const auditLogs = await getAuditLogs({ action: 'patient_data_access' });
  expect(auditLogs).toHaveLength(1);
  expect(auditLogs[0]).toMatchObject({
    userId,
    patientId,
    action: 'patient_data_access'
  });
});
```## 📋 LLM Quality Gates

### Before Implementation
- [ ] Sequential thinking completed with 5-step breakdown
- [ ] Archon task created/updated with clear requirements
- [ ] Serena analysis reveals existing patterns and structure
- [ ] Appropriate testing guide selected based on triggers
- [ ] MCP tools identified and ready

### During Implementation
- [ ] Tests written following TDD red-green-refactor cycle
- [ ] Healthcare compliance patterns applied (if applicable)
- [ ] Code follows project conventions found via Serena
- [ ] File operations use desktop-commander with ≤30 line chunks
- [ ] Progress tracked in Archon throughout process

### After Implementation
- [ ] All tests pass (`bun test`)
- [ ] Code quality checks pass (`bun run lint:fix`)
- [ ] Type checking passes (`bun run type-check`)
- [ ] Coverage meets thresholds (≥90% for critical paths)
- [ ] Archon task updated with results and learnings
- [ ] Documentation updated if new patterns introduced

### Escalation Triggers

```yaml
escalate_to_human:
  - "Tests failing >3 consecutive attempts"
  - "Healthcare compliance uncertainty"
  - "Breaking changes to existing functionality"
  - "Security vulnerabilities detected"
  - "Architecture decisions required"

escalate_to_research:
  - "Unknown testing patterns needed"
  - "New library/framework integration"
  - "Performance optimization required"
  - "Complex domain logic validation"
```

## 🔄 Continuous Improvement

### Learning Loop
1. **Capture Patterns** → Document successful test implementations in Archon
2. **Identify Gaps** → Note missing test coverage or patterns
3. **Update Guides** → Enhance testing documentation with new learnings
4. **Share Knowledge** → Cross-reference between consolidated guides

### Success Metrics
- **Test Coverage**: ≥90% for critical healthcare paths
- **Quality Score**: ≥9.5/10 for all implementations
- **Compliance Rate**: 100% for LGPD and healthcare regulations
- **Agent Coordination**: Seamless handoffs between specialized agents
- **MCP Utilization**: 100% compliance with mandatory tool usage