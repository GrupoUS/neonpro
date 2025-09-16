# 🔍 Quality Control - MEGA Quality Assurance Command

## Command: `/quality-control [action] [target] [--type=test|analyze|debug|validate|compliance|performance|security|cleanup|format] [--depth=L1-L10] [--healthcare]`

### 🎯 **Purpose**

Ultimate quality assurance orchestrator combining comprehensive testing (Vitest/Playwright),
multi-dimensional analysis, intelligent debugging, compliance validation (LGPD/ANVISA/CFM),
performance testing, security scanning, code cleanup, and ultra-fast formatting in a single
comprehensive command.

### 🧠 **Intelligence Integration**

```yaml
QUALITY_INTELLIGENCE:
  activation_triggers:
    - "/quality-control [action]"
    - "/test", "/analyze", "/debug", "/validate", "/compliance", "/performance", "/security", "/cleanup", "/format"
    - "comprehensive quality check", "healthcare validation", "30-second reality check"
  
  context_detection:
    quality_scope: "Testing, analysis, debugging, validation, compliance, performance, security, cleanup, formatting"
    technology_stack: "Auto-detect: React, Vue, Angular, Node.js, Python, Java, Next.js, Supabase"
    complexity_assessment: "L1-L10 based on scope and requirements"
    healthcare_mode: "LGPD/ANVISA/CFM compliance awareness"
    quality_standards: "≥9.5/10 quality enforcement"

  # 📊 EXECUTION LEARNINGS & IMPROVEMENTS (Updated: $(date))
  timeout_strategy:
    command_timeouts: "All terminal commands now use timeout prefix to prevent infinite loops"
    performance_tests: "45s timeout for performance tests (previously caused hangs)"
    linter_validation: "30s timeout for lint operations"
    comprehensive_tests: "60s timeout for full test suites"
    
  performance_optimizations:
    database_operations: "Reduced iterations from 1000→100, 500→50 to prevent timeouts"
    connection_pools: "Optimized concurrent connections: 100→20, 10000→1000 operations"
    consent_validation: "Reduced patient validation from 1000→100 patients"
    audit_operations: "Reduced audit log iterations from 500→50"
    
  test_execution_results:
     performance_tests: "20 tests passed, 0 failed, 75 expectations, 14.61s execution"
     linter_validation: "0 warnings, 0 errors - unused catch parameter fixed"
     compliance_coverage: "LGPD compliance overhead analysis validated"
     healthcare_performance: "Emergency response times ≤100ms validated"
     memory_leak_detection: "Memory usage patterns validated for LGPD operations"
     
   continuous_improvement_cycle:
     iteration_1: "Fixed performance test timeouts by reducing iterations"
     iteration_2: "Added timeout protection to all terminal commands"
     iteration_3: "Corrected linter warning in cold-start-measurement.ts"
     iteration_4: "Documented all learnings and timeout strategies"
     next_actions: "Continue iterative testing with documented improvements"
```

## 🧩 **Execution Protocol Alignment**

- Follow the mandatory chain from `docs/testing/AGENTS.md`: sequential-thinking → Archon task sync → Serena analysis → implement with TDD → validate and document.
- Load the code-review agents before issuing `/quality-control` commands:
  - `tdd-orchestrator` (`.claude/agents/code-review/tdd-orchestrator.md`) for phase governance.
  - `architect-review`, `code-reviewer`, `security-auditor`, and `test` (all in `.claude/agents/code-review/`) for specialized reviews per TDD phase.
- Reference `docs/testing/*.md` to pick the right testing playbook (frontend, backend, database, auditfix) before choosing action flags.
- Use Archon to register sub-tasks and Serena to inspect impacted code/tests prior to invoking the command.
- After each `/quality-control` run, review the returned `nextActions` and `recommendations`; the orchestrator now surfaces security/compliance follow-ups even when all agents succeed.

## 🧠 **Agent Suite Integration**

| Agent | File | Primary Focus |
| --- | --- | --- |
| `tdd-orchestrator` | `.claude/agents/code-review/tdd-orchestrator.md` | Coordinates red/green/refactor phases and selects orchestration patterns. |
| `architect-review` | `.claude/agents/code-review/architect-review.md` | Architecture, scalability, pattern compliance, and workflow design. |
| `code-reviewer` | `.claude/agents/code-review/code-reviewer.md` | Code quality metrics, maintainability, static analysis, performance gates. |
| `security-auditor` | `.claude/agents/code-review/security-auditor.md` | LGPD/ANVISA/CFM enforcement, vulnerability analysis, zero-trust review. |
| `test` | `.claude/agents/code-review/test.md` | TDD pattern enforcement, coverage validation, Vitest/Playwright strategy. |

> ✅ Activate the relevant agents per phase using the orchestration patterns defined in `tools/orchestration/agent-registry.ts`.

## 🧪 **Testing Toolkit (tools)**

Run the categorized suites shipped under `tools/` to satisfy the coverage targets from `docs/testing`, *ALWAYS* run with `DESKTOP COMMANDER MCP`:

```bash
pnpm run test:frontend     # @neonpro/tools-frontend-tests
pnpm run test:backend      # @neonpro/tools-backend-tests
pnpm run test:database     # @neonpro/tools-database-tests (RLS + compliance)
pnpm run test:quality      # @neonpro/tools-quality-tests (coverage, performance)
pnpm run test:orchestrate  # Cross-category orchestration with healthcare mode
pnpm run test:healthcare   # Full LGPD/ANVISA/CFM validation sweep
```

- Scope with `pnpm --filter` to re-run focused packages (`test:components`, `test:integration`, etc.).
- Use `bun` wrappers when speed matters (e.g., `bun run test:parallel` inside `tools/orchestration`).
- Align results with the coverage thresholds defined in `docs/testing/AGENTS.md` → `COVERAGE_BY_AGENT`.

## 🕹️ **Orchestration Bridge (`tools/orchestration`)**

- `quality-control-orchestrator.ts` links this command with the runtime orchestrator.
- `tdd-orchestrator.ts`, `agent-registry.ts`, and `execution-pattern-selector.ts` choose the coordination pattern (`sequential`, `parallel`, `hierarchical`, `event-driven`, `consensus`).
- Use the provided scripts to dry-run coordination flows:
  
  ```bash
  bun run tools/orchestration/scripts/test-integration.ts   # End-to-end quality bridge test
  bun run tools/orchestration/test-integration.ts           # Legacy alias
  bun run tools/orchestration/test-parallel.ts              # Parallel agent verification
  bun run orchestrate                                      # Shortcut defined in package.json
  ```

- Monitor orchestration metrics via `tools/orchestration/metrics` and compliance logs under `tools/orchestration/logs`.

## ✅ **Sequential Quality Sweep (recommended)**

Run the complete workflow every time you need a full-system assurance check:

```bash
# 1. Prime orchestrator metrics and agent registry
pnpm run test:orchestrate -- --healthcare

# 2. Execute every QC action with healthcare mode enabled
node -e '(
  async () => {
    const spec = "./tools/orchestration/dist/quality-control-bridge.js?" + Date.now();
    const bridge = await import(spec);
    const commands = [
      "/quality-control test --healthcare",
      "/quality-control analyze --parallel",
      "/quality-control security --depth=L8",
      "/quality-control comprehensive --healthcare",
      "/quality-control healthcare --regulation=all",
      "/quality-control tdd-cycle --feature=full-quality-scan --healthcare"
    ];
    for (const cmd of commands) {
      const result = await bridge.executeQualityControlCommand(cmd, {
        healthcareMode: true,
        enableCompliance: true
      });
      console.log("\n===", cmd, "===");
      console.log(JSON.stringify({ success: result.success, qualityScore: result.qualityScore, nextActions: result.nextActions }, null, 2));
    }
  }
)()'
```

- Confirm each step returns `success: true`, `qualityScore ≥ 8`, and review `nextActions` for follow-up (especially security and healthcare commands which will surface compliance remediation items).
- If any command fails, inspect `tools/orchestration/dist/quality-control-bridge.js` logs and re-run the failing action individually after fixing the underlying issue.

## 🚀 **Core Quality Actions**

### **1. COMPREHENSIVE TESTING (test)**

```yaml
TESTING_SUITE:
  purpose: "Complete testing framework with healthcare compliance validation"

  unit_testing_vitest:
    - "Healthcare-specific unit tests with Vitest configuration"
    - "Patient data security validation"
    - "LGPD compliance testing"
    - "Medical calculation accuracy verification"
    - "Multi-tenant isolation testing"

  e2e_testing_playwright:
    - "Complete healthcare workflow validation"
    - "Patient journey end-to-end testing"
    - "Doctor workflow automation testing"
    - "Compliance workflow validation"
    - "Cross-browser healthcare compatibility"

  testing_dashboard:
    - "Real-time healthcare testing status"
    - "LGPD/ANVISA/CFM compliance indicators"
    - "Coverage metrics by medical criticality"
    - "Performance benchmarks for medical workflows"

  testing_reports:
    - "Comprehensive HTML/JSON/PDF reports"
    - "Healthcare compliance documentation"
    - "Regulatory audit preparation"
    - "Medical workflow validation summaries"

  testing_watch_mode:
    - "Intelligent file change monitoring"
    - "Healthcare-specific test prioritization"
    - "Real-time compliance validation"
    - "Medical workflow performance tracking"
```

### **2. MULTI-DIMENSIONAL ANALYSIS (analyze)**

```yaml
ANALYSIS_FRAMEWORK:
  purpose: "Universal analysis combining code review, technical assessment, and healthcare compliance"

  code_analysis:
    - "Git diff analysis for healthcare context"
    - "Patient data touchpoint identification"
    - "LGPD compliance validation"
    - "Security vulnerability assessment"
    - "Performance validation for medical workflows"

  technical_analysis:
    - "Architecture assessment and validation"
    - "Scalability and performance bottlenecks"
    - "Integration complexity analysis"
    - "Healthcare technology stack evaluation"

  business_analysis:
    - "Healthcare market positioning assessment"
    - "Clinical workflow optimization analysis"
    - "Regulatory compliance impact evaluation"
    - "Medical practice efficiency improvements"

  investigation_framework:
    - "Systematic evidence-based analysis"
    - "Medical workflow failure investigation"
    - "Patient data anomaly analysis"
    - "Healthcare security incident investigation"

  insights_generation:
    - "Healthcare trend analysis and prediction"
    - "Medical workflow optimization insights"
    - "Patient outcome improvement opportunities"
    - "Clinical efficiency enhancement recommendations"
```

### **3. INTELLIGENT DEBUGGING (debug)**

```yaml
DEBUGGING_SYSTEM:
  purpose: "Universal debugging with healthcare safety protocols"

  healthcare_debugging:
    - "Patient data safety protocols during debugging"
    - "LGPD compliance maintenance during investigation"
    - "Medical workflow integrity preservation"
    - "Healthcare audit trail maintenance"

  multi_stack_debugging:
    - "React/Vue/Angular frontend debugging"
    - "Node.js/Python/Java backend debugging"
    - "Supabase database debugging with RLS validation"
    - "Multi-tenant isolation debugging"

  performance_debugging:
    - "Medical workflow performance investigation"
    - "Patient data access optimization"
    - "Clinical operation efficiency analysis"
    - "Healthcare system scalability debugging"

  security_debugging:
    - "Patient data exposure prevention"
    - "Healthcare authentication debugging"
    - "Medical audit trail integrity validation"
    - "Compliance violation investigation"
```

### **4. 30-SECOND REALITY CHECK (validate)**

```yaml
REALITY_CHECK_VALIDATION:
  purpose: "Mandatory 30-second validation ensuring 'Test changes instead of assuming they work'"

  mandatory_criteria:
    build_validation: "Did I run/build the code successfully?"
    feature_triggering: "Did I trigger the exact feature I changed?"
    result_observation: "Did I see expected results with own observations?"
    edge_case_testing: "Did I test edge cases and error scenarios?"
    performance_validation: "Did I check performance impact?"

  healthcare_criteria:
    lgpd_compliance: "Did I validate LGPD compliance requirements?"
    medical_performance: "Did I verify ≤100ms patient data operations?"
    audit_trail: "Did I ensure audit trail functionality works?"
    accessibility: "Did I validate medical interface accessibility?"
    security_validation: "Did I ensure no healthcare security vulnerabilities?"

  automated_validation:
    - "Complete build process execution"
    - "Feature workflow end-to-end testing"
    - "Healthcare compliance automated checking"
    - "Medical performance benchmark validation"
    - "Security vulnerability scanning"
```

### **5. COMPLIANCE VALIDATION (compliance)**

```yaml
REGULATORY_COMPLIANCE:
  purpose: "Multi-regulatory compliance validation for Brazilian healthcare"

  lgpd_compliance:
    - "Data Controller and Processor identification"
    - "Patient consent management validation"
    - "Data Subject Rights implementation"
    - "Cross-border data transfer compliance"
    - "Data breach notification procedures"

  anvisa_compliance:
    - "Medical device software classification"
    - "Clinical evaluation requirements"
    - "Post-market surveillance validation"
    - "Quality management system compliance"
    - "Risk management validation"

  cfm_compliance:
    - "Medical professional licensing verification"
    - "Telemedicine practice compliance"
    - "Digital prescription requirements"
    - "Medical documentation standards"
    - "Patient confidentiality validation"

  international_standards:
    - "HIPAA Security and Privacy Rules"
    - "GDPR compliance validation"
    - "ISO 27001 security controls"
    - "OWASP security standards"
```

### **6. PERFORMANCE TESTING (performance)**

```yaml
PERFORMANCE_VALIDATION:
  purpose: "Comprehensive performance testing with healthcare-specific requirements"

  healthcare_performance:
    - "≤100ms patient data access validation"
    - "Medical workflow efficiency testing"
    - "Clinical operation performance benchmarks"
    - "Emergency response performance validation"

  load_testing:
    - "Patient portal concurrent user testing"
    - "Medical record access performance"
    - "Healthcare API endpoint stress testing"
    - "Multi-tenant system load validation"

  accessibility_testing:
    - "WCAG 2.1 AA+ compliance validation"
    - "Healthcare-specific accessibility requirements"
    - "Medical professional workflow accessibility"
    - "Patient portal accessibility testing"

  quality_auditing:
    - "TypeScript strict compliance validation"
    - "Code quality metrics assessment"
    - "Healthcare security patterns validation"
    - "Medical workflow maintainability audit"
```

### **7. SECURITY SCANNING (security)**

```yaml
SECURITY_VALIDATION:
  purpose: "Comprehensive security analysis with patient data protection"

  vulnerability_scanning:
    - "OWASP Top 10 validation"
    - "Healthcare-specific security assessment"
    - "Patient data exposure detection"
    - "Medical audit trail security validation"

  data_protection:
    - "PII/PHI identification and classification"
    - "Patient data encryption validation"
    - "Healthcare access control audit"
    - "Medical data retention compliance"

  compliance_security:
    - "LGPD technical safeguards validation"
    - "HIPAA Security Rule compliance"
    - "Healthcare audit trail verification"
    - "Medical incident response testing"

  threat_assessment:
    - "Healthcare threat landscape analysis"
    - "Medical device security validation"
    - "Patient data breach prevention"
    - "Clinical workflow security assessment"
```

### **8. INTELLIGENT CLEANUP (cleanup)**

```yaml
CODE_CLEANUP:
  purpose: "Constant cleanup with duplicate/obsolete code elimination"

  duplicate_detection:
    - "AST-based code similarity analysis"
    - "Healthcare workflow duplication identification"
    - "Medical utility function consolidation"
    - "Patient data handling pattern optimization"

  obsolete_removal:
    - "Dead code elimination with no backwards compatibility"
    - "Unused import and dependency cleanup"
    - "Deprecated healthcare compliance code removal"
    - "Legacy medical workflow pattern elimination"

  path_correction:
    - "Broken import path automatic fixing"
    - "Healthcare module path optimization"
    - "Medical workflow import corrections"
    - "Compliance module path validation"

  system_optimization:
    - "Bundle size optimization for healthcare apps"
    - "Medical workflow performance enhancement"
    - "Patient data operation optimization"
    - "Clinical efficiency code improvements"
```

### **9. OXLINT + DPRINT FORMATTING (format)**

```yaml
OXLINT_DPRINT_FORMATTING:
  purpose: "Lightning-fast linting with oxlint and formatting with dprint + prettier fallback"

  quality_enforcement:
    - "≥9.5/10 quality standards (non-negotiable)"
    - "Subsecond performance formatting"
    - "Maximum TypeScript type safety"
    - "AI-friendly code generation optimization"

  accessibility_compliance:
    - "WCAG 2.1 AA+ compliance for medical interfaces"
    - "Healthcare accessibility pattern enforcement"
    - "Medical device compatibility validation"
    - "Patient portal accessibility optimization"

  healthcare_patterns:
    - "LGPD compliance code patterns"
    - "Medical data handling best practices"
    - "Patient workflow optimization patterns"
    - "Healthcare audit trail code standards"

  security_enforcement:
    - "Patient data security pattern validation"
    - "Healthcare XSS prevention enforcement"
    - "Medical input validation patterns"
    - "Clinical data protection enforcement"
```

## 🔧 **TDD Orchestration Usage Patterns**

### **TDD Orchestration Commands**

```bash
# Complete TDD cycle with multi-agent orchestration (with timeout protection)
timeout 120s /quality-control tdd-cycle --feature="user-authentication" --healthcare
# → Full red-green-refactor cycle with healthcare compliance validation

# Security-critical TDD workflow (with timeout protection)
timeout 90s /quality-control tdd-critical --feature="patient-data-handler" --compliance=all
# → Enhanced security validation with LGPD/ANVISA/CFM compliance

# Parallel agent coordination for microservices (with timeout protection)
timeout 150s /quality-control tdd-parallel --feature="api-gateway" --microservice
# → Parallel agent execution for distributed system testing

# Agent-specific quality validation (with timeout protection)
timeout 60s /quality-control agent-review --agent="security-auditor" --depth=comprehensive
# → Focused security auditor validation with healthcare protocols
```

### **Comprehensive Quality Control**

```bash
# Complete quality assurance suite with TDD orchestration (with timeout protection)
timeout 180s /quality-control comprehensive --healthcare --depth=L8 --tdd-enabled
# → Full TDD cycle + testing + analysis + debugging + compliance + performance + security + cleanup + formatting

# Healthcare-specific TDD quality validation (with timeout protection)
timeout 120s /quality-control healthcare --lgpd --anvisa --cfm --tdd-workflow=security-critical
# → Complete Brazilian healthcare compliance with security-critical TDD workflow

# 30-second reality check with TDD validation (with timeout protection)
timeout 45s /quality-control reality-check --mandatory --tdd-phases=all
# → Mandatory validation including all TDD phases before task completion

# Performance-focused quality control with orchestration (with timeout protection)
timeout 90s /quality-control performance --medical-workflows --agent-coordination=hierarchical
# → Healthcare performance testing with hierarchical agent coordination

# 📊 TIMEOUT STRATEGY IMPLEMENTATION
# All commands now include timeout prefixes to prevent infinite loops:
# - Short operations: 30-60s (linting, quick validation)
# - Medium operations: 90-120s (testing, analysis)
# - Long operations: 150-180s (comprehensive testing, full orchestration)
```

### **Agent-Orchestrated Quality Actions**

```bash
# TDD-orchestrated comprehensive testing (with timeout protection)
timeout 150s /quality-control test patient-portal --e2e --compliance --orchestrator=tdd --agents=all
# → Complete healthcare testing with TDD orchestration and all code review agents

# Multi-agent system analysis with TDD coordination (with timeout protection)
timeout 120s /quality-control analyze medical-system --orchestrator=tdd --coordination=hierarchical
# → TDD-coordinated multi-agent analysis with primary/secondary agent delegation

# Agent-coordinated healthcare debugging (with timeout protection)
timeout 90s /quality-control debug lgpd-compliance --severity=critical --agents="security-auditor,architect-review"
# → Coordinated debugging with security-auditor (primary) and architect-review (secondary)

# Orchestrated multi-regulatory compliance check (with timeout protection)
timeout 120s /quality-control compliance --regulation=all --orchestrator=tdd --workflow=security-critical
# → Security-critical TDD workflow with complete compliance validation

# Agent-coordinated medical performance testing (with timeout protection)
timeout 90s /quality-control performance patient-data --orchestrator=tdd --coordination=parallel --agents="test,architect-review"
# → Parallel agent coordination for performance testing with medical requirements

# Multi-agent security assessment (with timeout protection)
timeout 75s /quality-control security --agents="security-auditor,code-reviewer" --depth=L8
/quality-control security patient-data --orchestrator=tdd --agents="security-auditor,code-reviewer,architect-review"
# → Complete healthcare security validation with coordinated agent execution

# Orchestrated intelligent code cleanup
/quality-control cleanup --auto-fix --healthcare --orchestrator=tdd --refactor-phase
# → TDD refactor phase with coordinated code cleanup and healthcare preservation

# Agent-coordinated ultra-fast quality formatting
/quality-control format --healthcare --accessibility --security --orchestrator=tdd --agents=all
# → Complete code quality enforcement with all agents coordinated through TDD orchestrator
```

### **Advanced Orchestration Patterns**

```bash
# Sequential agent coordination for critical features
/quality-control orchestrate --pattern=sequential --agents="test,architect-review,security-auditor,code-reviewer"
# → Sequential execution ensuring proper validation order for critical features

# Hierarchical coordination with primary/secondary agents
/quality-control orchestrate --pattern=hierarchical --primary="security-auditor" --secondary="test,code-reviewer"
# → Primary agent leads execution with secondary agents providing support

# Event-driven coordination for reactive validation
/quality-control orchestrate --pattern=event-driven --trigger="healthcare-compliance" --agents=auto
# → Reactive agent activation based on compliance events and context

# Custom workflow execution
/quality-control workflow --name="security-critical" --feature="patient-registration" --compliance=full
# → Execute security-critical workflow with full healthcare compliance validation

# Agent capability-based selection
/quality-control capability --requirement="healthcare-compliance-validation" --auto-select
# → Automatically select agents based on specific capability requirements
```

## 🏥 **Healthcare & Compliance Integration**

```yaml
HEALTHCARE_QUALITY_STANDARDS:
  lgpd_compliance:
    - "Automated patient data protection validation"
    - "Consent management system testing"
    - "Medical audit trail verification"
    - "Healthcare data subject rights validation"

  performance_medical:
    - "≤100ms patient data operation requirements"
    - "Medical workflow efficiency benchmarks"
    - "Clinical decision support performance"
    - "Emergency response system performance"

  security_healthcare:
    - "Medical-grade security scanning"
    - "Patient data encryption validation"
    - "Healthcare access control testing"
    - "Medical device integration security"

  accessibility_medical:
    - "WCAG 2.1 AA+ for medical interfaces"
    - "Healthcare professional workflow accessibility"
    - "Patient portal accessibility testing"
    - "Emergency system accessibility validation"
```

## 🤝 **TDD Orchestration & Agent Integration**

```yaml
TDD_ORCHESTRATION_FRAMEWORK:
  orchestrator_engine:
    path: "tools/orchestration/tdd-orchestrator.ts"
    role: "Master TDD cycle coordinator with multi-agent delegation"
    coordination_patterns: ["sequential", "parallel", "hierarchical", "event-driven"]
    phases: ["red", "green", "refactor"]
    quality_gates: "≥9.5/10 enforcement with healthcare compliance"

  agent_registry:
    path: "tools/orchestration/agent-registry.ts"
    role: "Agent capability management and selection optimization"
    registered_agents:
      tdd_orchestrator: "Primary TDD cycle coordinator"
      architect_review: "Architecture validation and pattern compliance"
      code_reviewer: "Quality analysis and maintainability assessment"
      security_auditor: "Healthcare compliance and vulnerability scanning"
      test: "Testing pattern enforcement and coverage validation"

  workflow_engines:
    standard_tdd:
      path: "tools/orchestration/workflows/standard-tdd.ts"
      complexity: "medium"
      use_case: "Regular development tasks with standard quality requirements"
    security_critical:
      path: "tools/orchestration/workflows/security-critical.ts"
      complexity: "high"
      use_case: "Healthcare compliance, patient data, security-critical operations"

CODE_REVIEW_AGENTS_INTEGRATION:
  agent_coordination:
    red_phase:
      primary: "test (Test Coordination Agent)"
      secondary: ["architect-review", "security-auditor"]
      workflow: "Define test structure → Validate architecture → Ensure security coverage"

    green_phase:
      primary: "code-reviewer (Code Review Agent)"
      secondary: ["security-auditor", "test"]
      workflow: "Quality implementation → Security validation → Test verification"

    refactor_phase:
      primary: ["architect-review", "code-reviewer"]
      secondary: ["security-auditor", "test"]
      workflow: "Architecture improvements → Code quality → Security maintenance → Test validity"

  specialized_capabilities:
    architect_review:
      specializations: ["microservices-architecture", "healthcare-systems", "supabase-integration"]
      triggers: ["architecture", "scalability", "integration", "complex-system"]
      healthcare_compliance: "LGPD + ANVISA + CFM + Audit Trail"

    code_reviewer:
      specializations: ["typescript-review", "react-patterns", "healthcare-code-patterns"]
      triggers: ["code-review", "quality-analysis", "maintainability", "refactoring"]
      quality_thresholds: "Cyclomatic Complexity ≤10, Maintainability ≥70, Zero Code Smells"

    security_auditor:
      specializations: ["healthcare-security", "lgpd-compliance", "patient-data-protection"]
      triggers: ["security", "compliance", "vulnerability", "patient-data", "lgpd", "anvisa"]
      security_standards: ["OWASP", "LGPD", "ANVISA", "CFM", "HIPAA"]

    test:
      specializations: ["vitest-patterns", "playwright-e2e", "healthcare-workflows"]
      triggers: ["testing", "coverage", "healthcare-testing", "integration-testing"]
      coverage_thresholds: "Critical: 95%, High: 85%, Medium: 75%, Low: 70%"

ORCHESTRATION_ACTIVATION:
  automatic_triggers:
    complexity_based:
      low_medium: "standard-tdd workflow with sequential coordination"
      high_critical: "security-critical workflow with hierarchical coordination"

    context_based:
      healthcare_features: "security-critical workflow + compliance validation"
      microservices: "parallel coordination pattern for distributed testing"
      patient_data: "sequential coordination with enhanced security validation"

    feature_based:
      authentication: "security-auditor (primary) + architect-review + test"
      data_processing: "code-reviewer (primary) + security-auditor + test"
      ui_components: "test (primary) + code-reviewer + architect-review"
      api_endpoints: "architect-review (primary) + security-auditor + code-reviewer"

MCP_TOOL_INTEGRATION:
  primary_tools:
    desktop_commander: "File operations, testing execution, performance monitoring"
    sequential_thinking: "Complex orchestration decisions and multi-agent coordination"
    context7: "Quality standards, healthcare regulations, technical documentation"
    supabase_mcp: "Database testing, RLS validation, healthcare data compliance"

  orchestration_tools:
    tdd_orchestrator: "Master coordination engine with quality gate enforcement"
    agent_registry: "Optimal agent selection based on context and capabilities"
    workflow_engine: "Context-aware workflow selection and execution"
    quality_metrics: "Real-time quality scoring and compliance validation"
```

## 📊 **Quality Standards & Metrics**

```yaml
QUALITY_ENFORCEMENT:
  testing_standards:
    patient_portal: "≥85% coverage with healthcare workflows"
    compliance_modules: "≥90% coverage with regulatory validation"
    medical_calculations: "≥95% coverage with safety-critical validation"
    general_modules: "≥70% coverage with standard business logic"

  performance_targets:
    patient_data_access: "≤100ms for all patient data operations"
    medical_workflows: "≤200ms for clinical operations"
    healthcare_dashboards: "≤2s for medical interface loading"
    emergency_systems: "≤50ms for emergency response functions"

  security_compliance:
    vulnerability_scanning: "0 critical vulnerabilities allowed"
    healthcare_compliance: "100% LGPD/ANVISA/CFM regulatory compliance"
    data_protection: "Complete patient data encryption validation"
    access_control: "Multi-tenant isolation verified"

  code_quality:
    oxlint_dprint_standard: "≥9.5/10 quality score with oxlint + dprint (non-negotiable)"
    type_safety: "Strict TypeScript without 'any' usage"
    accessibility: "WCAG 2.1 AA+ compliance for medical interfaces"
    maintainability: "Clean, optimized, duplicate-free codebase"
```

## 🌐 **Bilingual Support**

### **Portuguese Commands**

- **`/controle-qualidade test`** - Suite de testes com compliance médico
- **`/controle-qualidade analisar`** - Análise multi-dimensional para saúde
- **`/controle-qualidade debug`** - Debug com protocolos de segurança médica
- **`/controle-qualidade compliance`** - Validação LGPD/ANVISA/CFM
- **`/controle-qualidade performance`** - Testes de performance médica
- **`/controle-qualidade seguranca`** - Análise de segurança para dados de pacientes
- **`/controle-qualidade limpeza`** - Limpeza inteligente de código médico
- **`/controle-qualidade formatar`** - Formatação ultra-rápida com compliance

### **English Commands**

- **`/quality-control test`** - Testing suite with medical compliance
- **`/quality-control analyze`** - Multi-dimensional healthcare analysis
- **`/quality-control debug`** - Debugging with medical safety protocols
- **`/quality-control compliance`** - LGPD/ANVISA/CFM validation
- **`/quality-control performance`** - Medical performance testing
- **`/quality-control security`** - Patient data security analysis
- **`/quality-control cleanup`** - Intelligent medical code cleanup
- **`/quality-control format`** - Ultra-fast formatting with compliance

## 🎯 **Success Criteria & Validation**

```yaml
QUALITY_COMPLETION_VALIDATION:
  comprehensive_coverage: "All quality dimensions validated (testing, analysis, debugging, compliance, performance, security, cleanup, formatting)"
  healthcare_compliance: "Complete LGPD/ANVISA/CFM regulatory compliance verified"
  performance_standards: "Medical workflow performance requirements met (≤100ms patient data operations)"
  security_validation: "Healthcare security standards enforced with zero critical vulnerabilities"
  code_quality: "≥9.5/10 quality standards maintained across all modules"
  accessibility_compliance: "WCAG 2.1 AA+ compliance verified for medical interfaces"

MANDATORY_VALIDATION:
  reality_check_passed: "30-second reality check criteria all met"
  build_success: "Complete build and test execution successful"
  functionality_preserved: "All medical workflows functioning correctly"
  compliance_maintained: "Healthcare regulatory requirements preserved"
  performance_verified: "Medical performance benchmarks achieved"
  security_confirmed: "Patient data protection validated"
```

## 🎆 **Bilingual TDD Orchestration Support**

### **Portuguese Commands with TDD Orchestration**

- **`/controle-qualidade tdd-ciclo`** - Ciclo TDD completo com orquestração multi-agente
- **`/controle-qualidade tdd-critico`** - Workflow TDD crítico para dados de pacientes
- **`/controle-qualidade agente-review`** - Revisão focada com agente específico
- **`/controle-qualidade orquestrar`** - Orquestração manual de agentes com padrões
- **`/controle-qualidade test`** - Suite de testes com orquestração TDD e compliance médico
- **`/controle-qualidade analisar`** - Análise multi-dimensional coordenada por TDD
- **`/controle-qualidade debug`** - Debug coordenado com protocolos de segurança médica
- **`/controle-qualidade compliance`** - Validação LGPD/ANVISA/CFM com workflow crítico
- **`/controle-qualidade performance`** - Testes de performance com coordenação hierárquica
- **`/controle-qualidade seguranca`** - Análise multi-agente para segurança de pacientes
- **`/controle-qualidade limpeza`** - Limpeza coordenada na fase de refatoração TDD
- **`/controle-qualidade formatar`** - Formatação coordenada com todos os agentes

### **English Commands with TDD Orchestration**

- **`/quality-control tdd-cycle`** - Complete TDD cycle with multi-agent orchestration
- **`/quality-control tdd-critical`** - Security-critical TDD workflow for patient data
- **`/quality-control agent-review`** - Focused review with specific agent
- **`/quality-control orchestrate`** - Manual agent orchestration with patterns
- **`/quality-control test`** - Testing suite with TDD orchestration and medical compliance
- **`/quality-control analyze`** - Multi-dimensional TDD-coordinated healthcare analysis
- **`/quality-control debug`** - Coordinated debugging with medical safety protocols
- **`/quality-control compliance`** - LGPD/ANVISA/CFM validation with security-critical workflow
- **`/quality-control performance`** - Medical performance testing with hierarchical coordination
- **`/quality-control security`** - Multi-agent patient data security analysis
- **`/quality-control cleanup`** - Coordinated cleanup in TDD refactor phase
- **`/quality-control format`** - Coordinated formatting with all agents

## 🎯 **TDD Orchestration Success Criteria & Validation**

```yaml
TDD_ORCHESTRATION_VALIDATION:
  cycle_completion: "Complete red-green-refactor cycle executed successfully with all agents"
  agent_coordination: "All agents coordinated properly with selected pattern (sequential/parallel/hierarchical/event-driven)"
  phase_quality_gates: "All TDD phase quality gates passed (≥9.5/10 per phase)"
  workflow_execution: "Selected workflow (standard-tdd/security-critical) completed successfully"
  agent_results_aggregation: "All agent results properly aggregated and validated"

QUALITY_COMPLETION_VALIDATION:
  comprehensive_coverage: "All quality dimensions validated through TDD orchestration (testing, analysis, debugging, compliance, performance, security, cleanup, formatting)"
  healthcare_compliance: "Complete LGPD/ANVISA/CFM regulatory compliance verified through security-auditor coordination"
  performance_standards: "Medical workflow performance requirements met (≤100ms patient data operations) validated by test and architect-review agents"
  security_validation: "Healthcare security standards enforced with zero critical vulnerabilities through security-auditor agent"
  code_quality: "≥9.5/10 quality standards maintained across all modules through code-reviewer agent coordination"
  accessibility_compliance: "WCAG 2.1 AA+ compliance verified for medical interfaces through code-reviewer specializations"
  architecture_validation: "System architecture and patterns validated through architect-review agent coordination"

AGENT_COORDINATION_VALIDATION:
  agent_selection: "Optimal agents selected based on context, triggers, and capability requirements"
  coordination_pattern: "Appropriate coordination pattern selected based on complexity and criticality"
  quality_gates_per_agent: "Each agent meets quality gate requirements specific to their capabilities"
  healthcare_agent_compliance: "All healthcare-required agents (security-auditor) properly executed for compliance features"
  workflow_agent_mapping: "Agents properly mapped to workflow phases and execution order"

MANDATORY_TDD_VALIDATION:
  red_phase_complete: "RED phase completed with failing tests and architectural validation"
  green_phase_complete: "GREEN phase completed with passing tests and quality implementation"
  refactor_phase_complete: "REFACTOR phase completed with improved code quality and maintained test validity"
  agent_execution_success: "All selected agents executed successfully within their assigned phases"
  reality_check_passed: "30-second reality check criteria all met including TDD phase validation"
  build_success: "Complete build and test execution successful after TDD cycle"
  functionality_preserved: "All medical workflows functioning correctly after orchestrated TDD cycle"
  compliance_maintained: "Healthcare regulatory requirements preserved through security-critical workflow"
  performance_verified: "Medical performance benchmarks achieved through coordinated performance testing"
  security_confirmed: "Patient data protection validated through security-auditor orchestration"
  metrics_collected: "TDD cycle metrics collected and updated (duration, success rate, quality scores)"
```

---

## 🚀 **Ready for Complete TDD Orchestrated Quality Control**

**TDD Orchestrated Quality Control Command** activated with comprehensive multi-agent coordination:

✅ **TDD Cycle Orchestration** - Complete red-green-refactor cycle with multi-agent coordination\
✅ **5 Specialized Code Review Agents** - tdd-orchestrator, architect-review, code-reviewer, security-auditor, test\
✅ **4 Coordination Patterns** - Sequential, Parallel, Hierarchical, Event-Driven agent execution\
✅ **2 Context-Aware Workflows** - Standard TDD & Security-Critical workflows with healthcare compliance\
✅ **Agent-Specific Quality Gates** - ≥9.5/10 quality enforcement per agent with specialized validation\
✅ **Comprehensive Testing** - Vitest/Playwright orchestrated through test agent with healthcare compliance\
✅ **Multi-Dimensional Analysis** - Coordinated architect-review and code-reviewer agents with TDD phases\
✅ **Intelligent Debugging** - Universal debugging with healthcare safety protocols through coordinated agents\
✅ **30-Second Reality Check** - Mandatory validation including TDD phase completion and agent coordination\
✅ **Compliance Validation** - LGPD/ANVISA/CFM + HIPAA/GDPR/ISO27001 through security-auditor orchestration\
✅ **Performance Testing** - Load + Accessibility + Quality auditing coordinated through test and architect-review agents\
✅ **Security Scanning** - OWASP + Healthcare-specific validation through specialized security-auditor agent\
✅ **Intelligent Cleanup** - Duplicate/obsolete code elimination in TDD refactor phase with healthcare preservation\
✅ **Ultra-Fast Formatting** - Zero-configuration quality enforcement ≥9.5/10 through coordinated agent execution

**TDD Framework Ready**: Complete test-driven development cycle with multi-agent orchestration\
**Agent Coordination**: 5 specialized agents with 4 coordination patterns for optimal execution\
**Healthcare Ready**: Complete Brazilian healthcare compliance through security-critical workflow + international standards\
**Quality Enforced**: ≥9.5/10 standards across all quality dimensions with agent-specific validation\
**Performance Validated**: ≤100ms patient data operations guaranteed through coordinated performance testing\
**Security Assured**: Medical-grade security with patient data protection through specialized security-auditor agent

**Status**: 🟢 **MEGA TDD Orchestrated Quality Control Command** | **Coverage**: Complete TDD Lifecycle with Multi-Agent Coordination |
**Healthcare**: ✅ LGPD/ANVISA/CFM Compliant through Security-Critical Workflow | **Standards**: ≥9.5/10 Enforced per Agent | **Bilingual**: 🇧🇷🇺🇸

**TDD Framework**: ✅ Red-Green-Refactor Orchestration | **Agents**: 5 Specialized Code Review Agents | **Workflows**: 2 Context-Aware Patterns |
**Coordination**: 4 Patterns (Sequential/Parallel/Hierarchical/Event-Driven) | **Testing**: Comprehensive Agent-Specific Test Suites
