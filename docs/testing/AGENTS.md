---
title: "Testing Orchestrator with TDD Agent Coordination"
version: 3.0.0
last_updated: 2025-09-16
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
    - tdd-orchestrator
    - agent-coordination
  pre_read:
    - path: "docs/AGENTS.md"
      reason: "Root docs orchestrator"
    - path: "docs/agents/code-review/tdd-orchestrator.md"
      reason: "TDD orchestration patterns"
  retrieval_hints:
    prefer:
      - "docs/testing/AGENTS.md"
      - "docs/testing/**/*.md"
      - "tools/orchestration/**"
    avoid:
      - "images/**"
      - "*.pdf"
  guardrails:
    tone: "concise, professional, English"
    formatting: "Markdown with clear headings and short lists"
    stop_criteria: "finish only when the task is 100% resolved"
  output_preferences:
    - "Use short bullets with agent assignments"
    - "Include relative paths in backticks"
    - "Provide shell commands in fenced code blocks when applicable"
    - "Reference agent orchestration patterns"
---

# 🧪 Testing Orchestrator with TDD Agent Coordination — Version: 3.0.0

## Overview

Central coordinator for comprehensive testing ecosystem orchestrated by specialized code review agents. Implements systematic TDD cycles with intelligent agent delegation, quality gate enforcement, and healthcare compliance validation.

**Target Audience**: Development teams, QA engineers, DevOps specialists
**Integration Level**: Advanced (multi-agent orchestration)

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
# Architecture validation tests
/quality-control architect --validate-patterns --check-scalability

# Code quality and performance tests  
/quality-control code-review --quality-metrics --performance

# Security and compliance validation
/quality-control security --scan-vulnerabilities --check-compliance

# TDD cycle and pattern enforcement
/quality-control test --red-green-refactor --validate-coverage
```

### Master Orchestration Commands

```bash
# Complete TDD cycle with all agents
/quality-control orchestrate --full-cycle --all-agents

# Workflow-specific orchestration
/quality-control orchestrate --workflow=security-critical --feature=authentication

# Phase-specific validation
/quality-control orchestrate --phase=red --agents=test,architect-review
```

## Testing Documentation Matrix

### Core Testing Guides

| Document | Agent Coordinator | Focus Area | Use When |
|----------|-------------------|------------|-----------|
| **[coverage-policy.md](./coverage-policy.md)** | `code-reviewer` | Coverage thresholds, compliance | Setting coverage requirements |
| **[react-test-patterns.md](./react-test-patterns.md)** | `test` | React component testing | Testing UI components |
| **[integration-testing.md](./integration-testing.md)** | `architect-review` | API, database, services | Testing system integration |
| **[e2e-testing.md](./e2e-testing.md)** | `tdd-orchestrator` | End-to-end workflows | Testing user journeys |
| **[ci-pipelines.md](./ci-pipelines.md)** | `tdd-orchestrator` | CI/CD integration | Configuring automated testing |

### Specialized Testing Guides

| Document | Agent Coordinator | Focus Area | Use When |
|----------|-------------------|------------|-----------|
| **[supabase-testing-guide.md](./supabase-testing-guide.md)** | `security-auditor` | Database, RLS, Auth | Testing Supabase integration |
| **[hono-api-testing.md](./hono-api-testing.md)** | `architect-review` | API endpoints | Testing Hono routes |
| **[tanstack-router-testing.md](./tanstack-router-testing.md)** | `code-reviewer` | Route testing | Testing navigation |
| **[monorepo-testing-strategies.md](./monorepo-testing-strategies.md)** | `tdd-orchestrator` | Monorepo coordination | Managing complex projects |
| **[code-review-checklist.md](./code-review-checklist.md)** | `code-reviewer` | Review standards | PR validation |

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
    coverage: "≥90% test coverage critical paths"
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
- **[CI/CD Integration](./ci-pipelines.md)** - Automated testing workflows
- **[Coverage Policy](./coverage-policy.md)** - Coverage requirements and enforcement