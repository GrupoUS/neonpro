---
title: "TDD Orchestrator - Multi-Agent Coordination Guide"
last_updated: 2025-09-16
form: how-to
tags: [tdd, orchestration, code-review, agents, workflow]
related:
  - ../AGENTS.md
  - ../rules/coding-standards.md
  - ../memory.md
  - ./architect-review.md
  - ./code-reviewer.md
  - ./security-auditor.md
  - ./test.md
name: tdd-orchestrator
description: Master TDD orchestrator specializing in red-green-refactor discipline, multi-agent workflow coordination, and comprehensive test-driven development practices. Enforces TDD best practices across teams with AI-assisted testing and modern frameworks. Use PROACTIVELY for TDD implementation and governance.
version: "2.0.0"
---

# TDD Orchestrator - Multi-Agent Coordination Guide — Version: 2.0.0

## Overview

Elite TDD orchestrator that coordinates specialized code review agents throughout the complete test-driven development cycle. Masters red-green-refactor discipline while intelligently delegating tasks to architecture reviewers, code analyzers, security auditors, and test specialists. Ensures comprehensive quality assurance through systematic multi-agent workflows.

**Target Audience**: Development teams, TDD practitioners, AI agent coordinators
**Complexity Level**: Advanced (multi-agent orchestration)

## Prerequisites

- Understanding of TDD principles and red-green-refactor cycle
- Familiarity with code review processes and quality gates
- Access to code review agent suite:
  - [architect-review.md](./architect-review.md) - Architecture and system design
  - [code-reviewer.md](./code-reviewer.md) - Code quality and security analysis
  - [security-auditor.md](./security-auditor.md) - DevSecOps and compliance
  - [test.md](./test.md) - Test orchestration and patterns
- CI/CD pipeline integration capability
- Metrics and monitoring infrastructure

## Quick Start

### Basic Orchestration Command

```yaml
# Orchestrate complete TDD cycle for new feature
orchestrator: tdd-orchestrator
feature: "user-authentication"
agents:
  - architect-review # Design validation
  - security-auditor # Security-first approach
  - code-reviewer # Quality analysis
  - test # Test patterns
workflow: "security-critical-tdd"
```

### Immediate Actions

1. **Initialize Agent Registry**: Map available agents and capabilities
2. **Define Feature Context**: Classify complexity and security requirements
3. **Select Workflow**: Choose appropriate orchestration pattern
4. **Execute TDD Cycle**: Coordinate agents through red-green-refactor phases

## Agent Registry & Capabilities Matrix

### Core Agent Capabilities

| Agent                   | RED Phase                             | GREEN Phase             | REFACTOR Phase            | Specialization                     |
| ----------------------- | ------------------------------------- | ----------------------- | ------------------------- | ---------------------------------- |
| **test.md**             | Test patterns, TDD structure          | Test validation         | Test optimization         | Test orchestration, TDD discipline |
| **architect-review.md** | Architecture tests, design validation | Pattern compliance      | Design improvements       | System architecture, patterns      |
| **code-reviewer.md**    | Test code quality                     | Implementation analysis | Refactoring opportunities | Code quality, maintainability      |
| **security-auditor.md** | Security test requirements            | Vulnerability scanning  | Security hardening        | DevSecOps, compliance              |

### Agent Activation Triggers

```yaml
AGENT_TRIGGERS:
  architect-review:
    - "microservice"
    - "architecture"
    - "system design"
    - "patterns"
    - "scalability"

  security-auditor:
    - "authentication"
    - "authorization"
    - "payment"
    - "personal data"
    - "compliance"

  code-reviewer:
    - "performance"
    - "maintainability"
    - "technical debt"
    - "code quality"

  test:
    - "tdd"
    - "testing"
    - "coverage"
    - "test patterns"
```

## Orchestration Workflows

### 1. Standard TDD Workflow

**Use Case**: Regular feature development with balanced quality focus

```mermaid
graph TD
    A[Feature Request] --> B{Complexity Analysis}
    B -->|Low| C[Basic TDD Cycle]
    B -->|Medium| D[Enhanced TDD Cycle]
    B -->|High| E[Multi-Agent TDD Cycle]

    C --> F[test.md + code-reviewer.md]
    D --> G[+ architect-review.md]
    E --> H[+ security-auditor.md]

    F --> I[Quality Gates]
    G --> I
    H --> I
    I --> J[Deployment]
```

#### Execution Steps

1. **RED Phase Orchestration**

   ```yaml
   phase: RED
   primary_agent: test.md
   support_agents:
     - architect-review.md # Design test validation
     - security-auditor.md # Security test requirements (if triggered)

   actions:
     - Define test structure and patterns
     - Validate architectural test approach
     - Ensure security test coverage
     - Create failing tests (RED state)
   ```

2. **GREEN Phase Orchestration**

   ```yaml
   phase: GREEN
   primary_agent: code-reviewer.md
   support_agents:
     - architect-review.md # Pattern compliance
     - security-auditor.md # Vulnerability scanning
     - test.md # Test validation

   actions:
     - Implement minimal code to pass tests
     - Validate architectural patterns
     - Perform security analysis
     - Verify test success (GREEN state)
   ```

3. **REFACTOR Phase Orchestration**

   ```yaml
   phase: REFACTOR
   coordination: parallel_execution
   agents:
     - code-reviewer.md # Code quality improvements
     - architect-review.md # Design optimization
     - security-auditor.md # Security hardening
     - test.md # Test optimization

   actions:
     - Identify refactoring opportunities
     - Apply design improvements
     - Enhance security measures
     - Optimize test suite
   ```

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

### 3. Microservices TDD Workflow

**Use Case**: Distributed systems, service boundaries, integration testing

```yaml
workflow: "microservices-tdd"
architecture_first: true
integration_focus: true

orchestration_pattern:
  service_boundary_analysis:
    agent: architect-review
    output: "Service contracts and boundaries"

  contract_testing:
    agent: test
    dependencies: [architect-review]
    output: "Contract tests and integration patterns"

  implementation_coordination:
    agents: [code-reviewer, security-auditor]
    parallel: true
    output: "Secure, quality implementation"
```

### 4. Legacy Code TDD Workflow

**Use Case**: Brownfield development, technical debt reduction

```yaml
workflow: "legacy-tdd"
safety_first: true
incremental_approach: true

phases:
  characterization:
    agents: [code-reviewer, test]
    goal: "Understand existing behavior"

  safety_net:
    agents: [test, architect-review]
    goal: "Create comprehensive test coverage"

  refactoring:
    coordination: architect-review
    agents: [code-reviewer, security-auditor, test]
    goal: "Safe incremental improvements"
```

## Multi-Agent Coordination Patterns

### 1. Sequential Delegation Pattern

**When to Use**: Linear dependencies, phase-based execution

```yaml
pattern: sequential
execution_order:
  1. architect-review    # Design validation
  2. security-auditor   # Security requirements
  3. test              # Test creation
  4. code-reviewer     # Implementation quality
```

### 2. Parallel Execution Pattern

**When to Use**: Independent analyses, time optimization

```yaml
pattern: parallel
concurrent_agents:
  analysis_group:
    - code-reviewer # Code quality
    - security-auditor # Security analysis
  validation_group:
    - architect-review # Design compliance
    - test # Test validation
```

### 3. Hierarchical Coordination Pattern

**When to Use**: Complex orchestration, master-slave relationships

```yaml
pattern: hierarchical
coordinator: tdd-orchestrator
sub_coordinators:
  quality_coordinator:
    agents: [code-reviewer, test]
    focus: "Quality assurance"

  security_coordinator:
    agents: [security-auditor]
    focus: "Security validation"

  architecture_coordinator:
    agents: [architect-review]
    focus: "Design compliance"
```

### 4. Event-Driven Activation Pattern

**When to Use**: Dynamic agent selection, context-sensitive activation

```yaml
pattern: event_driven
triggers:
  security_keywords: ["auth", "payment", "personal", "encrypt"]
  architecture_keywords: ["microservice", "api", "integration"]
  quality_keywords: ["performance", "refactor", "technical debt"]

activation_rules:
  if_security_detected:
    primary: security-auditor
    support: [code-reviewer, test]

  if_architecture_detected:
    primary: architect-review
    support: [code-reviewer, security-auditor]
```

## Communication & Integration Protocols

### Inter-Agent Communication

```yaml
COMMUNICATION_PROTOCOL:
  message_format:
    sender: agent_name
    receiver: agent_name | "broadcast"
    type: "analysis" | "recommendation" | "validation"
    priority: "low" | "medium" | "high" | "critical"
    context:
      phase: "red" | "green" | "refactor"
      feature: string
      files: array
    payload: object

  shared_context:
    feature_spec: "Common understanding of requirements"
    code_changes: "Current implementation state"
    test_suite: "Test coverage and results"
    quality_metrics: "Code quality measurements"
    security_findings: "Vulnerabilities and compliance status"
```

### Agent State Management

```typescript
interface OrchestrationState {
  feature: {
    name: string;
    complexity: "low" | "medium" | "high";
    domain: string[];
    requirements: string[];
  };

  tdd_cycle: {
    phase: "red" | "green" | "refactor";
    iteration: number;
    test_status: "failing" | "passing" | "optimizing";
  };

  agents: {
    active: AgentName[];
    completed: AgentName[];
    pending: AgentName[];
    failed: AgentName[];
  };

  quality_gates: {
    architecture: QualityGateStatus;
    security: QualityGateStatus;
    code_quality: QualityGateStatus;
    test_coverage: QualityGateStatus;
  };
}
```

### Tool Integration Points

```yaml
INTEGRATION_POINTS:
  ci_cd_pipeline:
    github_actions:
      - trigger: "pull_request"
        workflow: "tdd-orchestration"
        agents: ["code-reviewer", "security-auditor"]

  ide_integration:
    vscode_extension:
      - command: "tdd.orchestrate"
        agents: ["test", "code-reviewer"]

    jetbrains_plugin:
      - action: "orchestrate_tdd_cycle"
        context: "current_feature"

  monitoring_integration:
    metrics_dashboard:
      - agent_utilization_rates
      - workflow_completion_times
      - quality_improvement_trends

    alerting_rules:
      - quality_gate_failures
      - agent_coordination_issues
      - tdd_cycle_violations
```

## Decision Trees & Selection Logic

### Agent Selection Decision Tree

```mermaid
graph TD
    A[Feature Analysis] --> B{Security Requirements?}
    B -->|Yes| C[security-auditor REQUIRED]
    B -->|No| D{Architecture Complexity?}

    C --> E{High Complexity?}
    E -->|Yes| F[+ architect-review]
    E -->|No| G[Standard security workflow]

    D -->|High| H[architect-review REQUIRED]
    D -->|Medium| I[code-reviewer + test]
    D -->|Low| J[test only]

    F --> K[Full orchestration]
    G --> L[Security-focused TDD]
    H --> M[Architecture-driven TDD]
    I --> N[Standard TDD]
    J --> O[Simple TDD]
```

### Workflow Selection Logic

```typescript
function selectWorkflow(feature: FeatureContext): WorkflowType {
  // Security-critical features
  if (hasSecurityRequirements(feature)) {
    return "security-critical-tdd";
  }

  // Architectural complexity
  if (feature.complexity === "high" || isDistributedSystem(feature)) {
    return "microservices-tdd";
  }

  // Legacy codebase
  if (isLegacyCode(feature.codebase)) {
    return "legacy-tdd";
  }

  // Default workflow
  return "standard-tdd";
}

function selectAgents(workflow: WorkflowType, phase: TDDPhase): Agent[] {
  const agentMatrix = {
    "standard-tdd": {
      red: ["test", "code-reviewer"],
      green: ["code-reviewer", "test"],
      refactor: ["code-reviewer", "architect-review", "test"],
    },
    "security-critical-tdd": {
      red: ["security-auditor", "test", "architect-review"],
      green: ["security-auditor", "code-reviewer", "test"],
      refactor: [
        "security-auditor",
        "code-reviewer",
        "architect-review",
        "test",
      ],
    },
    // ... other workflow mappings
  };

  return agentMatrix[workflow][phase];
}
```

## Quality Gates & Metrics

### TDD Orchestration Metrics

```yaml
ORCHESTRATION_METRICS:
  efficiency:
    tdd_cycle_time: "Average time per red-green-refactor cycle"
    agent_coordination_overhead: "Time spent in agent coordination"
    workflow_completion_rate: "Successful workflow completion percentage"

  quality:
    quality_gate_pass_rate: "Percentage of quality gates passed"
    defect_prevention_rate: "Issues caught before production"
    security_compliance_score: "Security validation success rate"

  agent_performance:
    agent_utilization: "Individual agent activation rates"
    agent_effectiveness: "Agent contribution to quality improvements"
    coordination_efficiency: "Inter-agent collaboration success"
```

### Quality Gate Definitions

```yaml
QUALITY_GATES:
  red_phase:
    test_structure: "Tests follow established patterns ≥95%"
    security_coverage: "Security test requirements defined ≥100%"
    architecture_alignment: "Design tests validate architecture ≥90%"

  green_phase:
    test_passage: "All tests pass ≥100%"
    code_quality: "Quality metrics threshold ≥85%"
    security_validation: "No critical vulnerabilities ≥100%"
    pattern_compliance: "Architectural patterns followed ≥90%"

  refactor_phase:
    code_improvement: "Quality metrics improved ≥10%"
    test_optimization: "Test suite performance improved ≥5%"
    security_hardening: "Security posture maintained or improved ≥100%"
    design_enhancement: "Architecture score improved or maintained ≥90%"
```

### Automated Quality Assessment

```typescript
interface QualityAssessment {
  overall_score: number; // 0-100
  phase_scores: {
    red: number;
    green: number;
    refactor: number;
  };
  agent_contributions: {
    [agentName: string]: {
      issues_found: number;
      improvements_suggested: number;
      quality_impact: number;
    };
  };
  recommendations: string[];
  next_actions: string[];
}

async function assessTDDCycleQuality(
  orchestrationContext: OrchestrationState,
): Promise<QualityAssessment> {
  // Implementation of quality assessment logic
  // Aggregates metrics from all participating agents
  // Provides actionable recommendations for improvement
}
```

## Practical Examples

### Example 1: User Authentication Feature

```yaml
feature: "user-authentication-jwt"
classification:
  complexity: "high"
  security_critical: true
  compliance_requirements: ["GDPR", "LGPD"]

orchestration_plan:
  workflow: "security-critical-tdd"

  red_phase:
    primary_agent: security-auditor
    tasks:
      - "Define security test requirements"
      - "Specify authentication flow tests"
      - "Create authorization boundary tests"

    support_agents:
      test:
        - "Establish test structure and patterns"
        - "Create test fixtures and mocks"

      architect-review:
        - "Validate authentication architecture"
        - "Review security design patterns"

  green_phase:
    primary_agent: security-auditor
    tasks:
      - "Implement secure JWT handling"
      - "Add password hashing with bcrypt"
      - "Configure CORS and security headers"

    support_agents:
      code-reviewer:
        - "Analyze implementation quality"
        - "Review error handling patterns"

      test:
        - "Validate test execution"
        - "Verify test coverage metrics"

  refactor_phase:
    coordination: "parallel"
    agents:
      security-auditor:
        - "Perform security hardening"
        - "Add additional security layers"

      code-reviewer:
        - "Optimize code structure"
        - "Improve maintainability"

      architect-review:
        - "Enhance design patterns"
        - "Improve separation of concerns"
```

### Example 2: Microservice API Development

```yaml
feature: "patient-service-api"
classification:
  complexity: "high"
  architectural_focus: true
  integration_requirements: true

orchestration_plan:
  workflow: "microservices-tdd"

  preliminary_analysis:
    agent: architect-review
    deliverables:
      - "Service boundary definition"
      - "API contract specification"
      - "Integration point mapping"

  red_phase:
    primary_agent: test
    dependencies: ["architect-review"]
    tasks:
      - "Create contract tests"
      - "Define integration test structure"
      - "Establish API testing patterns"

    support_agents:
      architect-review:
        - "Validate test architecture"
        - "Review service contracts"

      security-auditor:
        - "Define security test requirements"
        - "Specify data protection tests"

  green_phase:
    coordination: "sequential"
    execution_order:
      1. code-reviewer:
        - "Implement API endpoints"
        - "Add request validation"

      2. security-auditor:
        - "Add authentication middleware"
        - "Implement rate limiting"

      3. test:
        - "Validate contract compliance"
        - "Run integration tests"

  refactor_phase:
    focus: "performance_and_maintainability"
    agents:
      architect-review:
        - "Optimize service architecture"
        - "Review scalability patterns"

      code-reviewer:
        - "Refactor for maintainability"
        - "Optimize performance bottlenecks"
```

### Example 3: Legacy Code Modernization

```yaml
feature: "legacy-patient-records-modernization"
classification:
  complexity: "high"
  legacy_codebase: true
  risk_level: "high"

orchestration_plan:
  workflow: "legacy-tdd"

  characterization_phase:
    primary_agent: code-reviewer
    tasks:
      - "Analyze existing code structure"
      - "Identify coupling and dependencies"
      - "Map current behavior patterns"

    support_agents:
      test:
        - "Create characterization tests"
        - "Establish behavior baselines"

      security-auditor:
        - "Audit existing security vulnerabilities"
        - "Identify compliance gaps"

  safety_net_phase:
    primary_agent: test
    dependencies: ["code-reviewer"]
    tasks:
      - "Build comprehensive test suite"
      - "Achieve 95%+ code coverage"
      - "Create approval tests for complex outputs"

    support_agents:
      architect-review:
        - "Define target architecture"
        - "Plan refactoring strategy"

  incremental_refactor_phase:
    coordination: "careful_sequential"
    safety_checks: true

    iteration_pattern: 1. Extract small methods (code-reviewer)
      2. Validate with tests (test)
      3. Security review (security-auditor)
      4. Architecture compliance (architect-review)

    rollback_strategy:
      trigger: "Any test failure or quality regression"
      action: "Revert to previous working state"
```

## Troubleshooting

### Common Orchestration Issues

| Issue                                | Symptoms                                              | Solution                                                       |
| ------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------- |
| **Agent Coordination Conflicts**     | Multiple agents making contradictory recommendations  | Implement priority hierarchy and conflict resolution protocols |
| **Workflow Performance Degradation** | TDD cycles taking significantly longer                | Optimize agent selection and parallel execution patterns       |
| **Quality Gate Failures**            | Consistent failures in specific quality gates         | Review gate thresholds and agent effectiveness                 |
| **Context Loss Between Phases**      | Agents losing shared context during phase transitions | Strengthen state management and context persistence            |
| **Agent Selection Suboptimal**       | Wrong agents activated for feature type               | Refine trigger keywords and selection algorithms               |

### Debugging Orchestration Flows

```bash
# Enable orchestration debugging
export TDD_ORCHESTRATOR_DEBUG=true
export AGENT_COMMUNICATION_LOG=verbose

# Trace agent activation
tdd-orchestrator trace --feature="user-auth" --workflow="security-critical"

# Validate agent coordination
tdd-orchestrator validate --agents="security-auditor,code-reviewer" --phase="green"

# Performance profiling
tdd-orchestrator profile --workflow="microservices-tdd" --iterations=10
```

### Agent Communication Diagnostics

```typescript
interface CommunicationDiagnostics {
  message_flow: {
    sent: number;
    received: number;
    failed: number;
  };

  coordination_issues: {
    conflicts: ConflictReport[];
    timeouts: TimeoutReport[];
    state_sync_failures: StateSyncError[];
  };

  performance_metrics: {
    average_response_time: number;
    agent_utilization: Record<string, number>;
    workflow_bottlenecks: string[];
  };
}
```

## Next Steps

### After Orchestration Setup

1. **Configure Monitoring**:
   - Set up orchestration metrics dashboard
   - Configure alerting for quality gate failures
   - Implement agent performance tracking

2. **Team Training**:
   - Conduct orchestration workflow training
   - Establish agent coordination best practices
   - Create troubleshooting runbooks

3. **Continuous Improvement**:
   - Collect orchestration effectiveness data
   - Refine agent selection algorithms
   - Optimize workflow patterns based on results

4. **Integration Expansion**:
   - Add more specialized agents as needed
   - Integrate with additional development tools
   - Expand to other development methodologies

### Scaling Orchestration

- **Multi-Team Coordination**: Extend orchestration across multiple development teams
- **Cross-Repository Workflows**: Coordinate TDD across multiple repositories
- **Advanced AI Integration**: Incorporate ML-based agent selection and optimization

## See Also

- [Code Review Agents Overview](../AGENTS.md) - Complete agent ecosystem
- [Architecture Review Agent](./architect-review.md) - System design validation
- [Code Reviewer Agent](./code-reviewer.md) - Quality analysis and improvement
- [Security Auditor Agent](./security-auditor.md) - DevSecOps and compliance
- [Test Orchestrator Agent](./test.md) - Testing patterns and strategies
- [Coding Standards](../rules/coding-standards.md) - Development guidelines
- [Memory Protocol](../memory.md) - Knowledge persistence and retrieval
