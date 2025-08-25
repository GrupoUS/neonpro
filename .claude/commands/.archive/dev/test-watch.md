# /test-watch - Healthcare Testing Watch Mode

## Command: `/test-watch [scope] [--verbose] [--coverage] [--healthcare-only]`

### 🎯 **Purpose**
Intelligent watch mode for healthcare testing with automatic test execution on file changes, real-time coverage updates, and immediate compliance validation feedback for Brazilian healthcare systems.

### 🧠 **Watch Mode Intelligence**
```yaml
WATCH_INTELLIGENCE:
  activation_triggers:
    - "/test-watch"
    - "start test watch mode"
    - "monitor test changes"
    - "continuous testing"
    - "live test feedback"
  
  file_monitoring:
    source_patterns: "apps/**/*.{ts,tsx,js,jsx}, packages/**/*.{ts,tsx,js,jsx}"
    test_patterns: "**/*.{test,spec}.{ts,tsx,js,jsx}, test/**/*.{ts,tsx,js,jsx}"
    config_patterns: "*.config.{js,ts,mjs}, package.json, biome.jsonc"
    healthcare_patterns: "**/*{patient,lgpd,anvisa,cfm,medical,clinic}*.{ts,tsx}"
    
  intelligent_execution:
    related_tests: "Run only tests related to changed files"
    affected_modules: "Execute tests for dependent modules"
    compliance_validation: "Trigger compliance tests for healthcare changes"
    performance_impact: "Monitor performance impact of changes"
```

### 🚀 **Watch Mode Execution Flow**

#### **Phase 1: Intelligent File Change Detection**
```yaml
FILE_CHANGE_DETECTION:
  smart_monitoring:
    - "Monitor source file changes with debouncing (300ms)"
    - "Detect file type and determine appropriate test strategy"
    - "Identify healthcare-specific changes requiring compliance validation"
    - "Calculate test execution scope based on dependency graph"
    
  change_categorization:
    patient_data_changes:
      - "Files containing patient data models or operations"
      - "Triggers: LGPD compliance validation + data security tests"
      - "Priority: High (immediate execution)"
    
    medical_workflow_changes:
      - "Files related to medical procedures or workflows"
      - "Triggers: ANVISA compliance validation + workflow tests"
      - "Priority: High (immediate execution)"
    
    professional_auth_changes:
      - "Files related to medical professional authentication"
      - "Triggers: CFM compliance validation + security tests"
      - "Priority: High (immediate execution)"
    
    ui_component_changes:
      - "Patient portal and healthcare interface components"
      - "Triggers: Accessibility tests + component tests"
      - "Priority: Medium (batched execution)"
    
    configuration_changes:
      - "Build, test, or project configuration files"
      - "Triggers: Full test suite execution"
      - "Priority: Low (delayed execution)"
```

#### **Phase 2: Adaptive Test Execution Strategy**
```yaml
EXECUTION_STRATEGY:
  healthcare_priority_execution:
    immediate_execution: "Patient data, medical workflows, professional authentication"
    batched_execution: "UI components, utilities, general business logic"
    deferred_execution: "Documentation, configuration, non-critical changes"
    
  test_scope_determination:
    single_file_change:
      - "Run related unit tests for the specific file"
      - "Execute integration tests if healthcare module affected"
      - "Skip E2E tests unless critical healthcare workflow impacted"
    
    multiple_file_changes:
      - "Batch related tests and execute together"
      - "Run affected integration tests"
      - "Consider E2E execution if multiple healthcare modules affected"
    
    healthcare_module_changes:
      - "Always run compliance validation tests"
      - "Execute related security and privacy tests"
      - "Run performance tests for critical patient workflows"
    
    dependency_impact_analysis:
      - "Analyze import/export relationships"
      - "Identify downstream effects on healthcare modules"
      - "Execute tests for all potentially affected components"
```

#### **Phase 3: Real-time Feedback and Reporting**
```yaml
REAL_TIME_FEEDBACK:
  terminal_output_optimization:
    live_status_display:
      - "🟢 Watching... [file-count] files monitored"
      - "⚡ Change detected: [file-path] - Running related tests..."
      - "🏥 Healthcare compliance: LGPD ✅ ANVISA ✅ CFM ✅"
      - "📊 Coverage: [current]% (Target: [target]%)"
    
    test_execution_feedback:
      running: "🔄 Running [test-suite] ([progress]/[total])"
      passed: "✅ [test-name] passed ([duration]ms)"
      failed: "❌ [test-name] failed - [error-summary]"
      skipped: "⏭️ [test-name] skipped - [reason]"
    
    healthcare_specific_feedback:
      compliance_validation:
        - "🏥 LGPD patient data validation: ✅ Passed"
        - "🏛️ ANVISA procedure compliance: ✅ Validated"
        - "👨‍⚕️ CFM professional requirements: ✅ Met"
        - "🔒 Patient data security: ✅ Verified"
      
      performance_monitoring:
        - "⚡ Patient portal load time: [time]ms (Target: <2000ms)"
        - "📊 Medical record query: [time]ms (Target: <100ms)"
        - "🔄 Appointment booking: [time]ms (Target: <1000ms)"
  
  coverage_monitoring:
    real_time_coverage:
      - "Live coverage percentage updates"
      - "Module-specific coverage tracking"
      - "Healthcare compliance module coverage"
      - "Critical path coverage validation"
    
    coverage_targets:
      patient_portal: "Target: 85% | Current: [current]% | Status: ✅/⚠️/❌"
      compliance_modules: "Target: 90% | Current: [current]% | Status: ✅/⚠️/❌"
      medical_calculations: "Target: 95% | Current: [current]% | Status: ✅/⚠️/❌"
      general_modules: "Target: 70% | Current: [current]% | Status: ✅/⚠️/❌"
```

#### **Phase 4: Intelligent Error Handling and Recovery**
```yaml
ERROR_HANDLING:
  test_failure_analysis:
    immediate_feedback:
      - "Clear error messages with file locations"
      - "Suggested fixes for common healthcare compliance issues"
      - "Links to relevant documentation or examples"
      - "Quick commands to resolve issues"
    
    healthcare_specific_errors:
      lgpd_violations:
        - "Patient data exposed in logs - Fix: Remove console.log statements"
        - "Missing consent validation - Fix: Add consent check before data access"
        - "Unencrypted patient data - Fix: Apply field-level encryption"
      
      anvisa_compliance_issues:
        - "Procedure not classified - Fix: Add ANVISA category to procedure definition"
        - "Missing adverse event tracking - Fix: Implement event reporting"
        - "Medical device not tracked - Fix: Add device registration"
      
      cfm_compliance_issues:
        - "Digital signature missing - Fix: Add CFM-compliant signature"
        - "Professional license not validated - Fix: Verify license status"
        - "Medical documentation incomplete - Fix: Complete required fields"
  
  automatic_recovery:
    test_retry_logic:
      - "Retry failed tests up to 3 times with exponential backoff"
      - "Skip flaky tests after multiple failures"
      - "Report persistent failures for manual investigation"
    
    dependency_resolution:
      - "Detect missing dependencies and suggest installation"
      - "Identify configuration issues and provide fixes"
      - "Validate environment setup and report problems"
```

### 🔧 **Healthcare Watch Mode Configuration**

#### **Optimized Watch Patterns**
```yaml
HEALTHCARE_WATCH_CONFIG:
  high_priority_patterns:
    - "apps/web/lib/patient-portal/**/*.{ts,tsx}"
    - "apps/web/lib/compliance/**/*.{ts,tsx}"
    - "packages/ui/src/components/*{Patient,Medical,Clinic}*.{ts,tsx}"
    - "test/compliance/**/*.{test,spec}.{ts,tsx}"
  
  medium_priority_patterns:
    - "apps/web/components/**/*.{ts,tsx}"
    - "packages/ui/src/components/**/*.{ts,tsx}"
    - "apps/web/lib/**/*.{ts,tsx}"
  
  low_priority_patterns:
    - "**/*.md"
    - "**/*.json"
    - "**/README.md"
    - "docs/**/*"
  
  ignored_patterns:
    - "node_modules/**"
    - "dist/**"
    - "build/**"
    - ".next/**"
    - "coverage/**"
    - "test-results/**"
```

#### **Performance Optimizations**
```yaml
PERFORMANCE_OPTIMIZATIONS:
  debouncing_strategy:
    - "300ms debounce for rapid file changes"
    - "Batch multiple changes within 1-second window"
    - "Intelligent deduplication of redundant test executions"
  
  resource_management:
    - "Limit concurrent test processes to available CPU cores"
    - "Memory usage monitoring and cleanup"
    - "Test execution timeout management"
    - "Cleanup of temporary files and artifacts"
  
  cache_optimization:
    - "Leverage Vitest cache for unchanged files"
    - "Module dependency cache for faster startup"
    - "Test result cache for skipping unchanged tests"
    - "Coverage cache for incremental updates"
```

### 🤝 **Watch Mode Agent Orchestration**

```yaml
WATCH_AGENT_COORDINATION:
  apex_qa_debugger:
    role: "Primary test execution monitoring and healthcare validation"
    focus: "Test failure analysis, compliance validation, quality monitoring"
    activation: "Continuous monitoring during watch mode execution"
    
  desktop_commander:
    role: "File system monitoring and test execution orchestration"
    focus: "File change detection, process management, resource optimization"
    activation: "File system events, test process lifecycle management"
    
  sequential_thinking:
    role: "Intelligent test scope determination and optimization"
    focus: "Dependency analysis, execution strategy, performance optimization"
    activation: "Complex decision making for test execution scope"
```

### 🔍 **Usage Examples**

```bash
# Standard healthcare testing watch mode
/test-watch

# Verbose output with detailed logging
/test-watch --verbose

# Watch mode with real-time coverage tracking
/test-watch --coverage

# Healthcare-specific tests only
/test-watch --healthcare-only

# Watch specific module or scope
/test-watch patient-portal --verbose

# High-priority healthcare modules only
/test-watch compliance-modules --coverage

# Performance monitoring mode
/test-watch --verbose --coverage | grep -E "Performance|Load Time"
```

### 🎯 **Watch Mode Success Criteria**

```yaml
WATCH_COMPLETION_VALIDATION:
  real_time_responsiveness:
    change_detection: "File changes detected within 100ms"
    test_execution: "Related tests start within 500ms of change detection"
    feedback_display: "Results displayed within 2 seconds of test completion"
    coverage_updates: "Coverage metrics updated in real-time"
  
  healthcare_compliance_monitoring:
    compliance_validation: "LGPD/ANVISA/CFM tests triggered for relevant changes"
    security_monitoring: "Patient data security tests executed automatically"
    performance_tracking: "Healthcare workflow performance monitored continuously"
    accessibility_validation: "WCAG 2.1 AA+ compliance verified for UI changes"
  
  intelligent_execution:
    scope_optimization: "Only necessary tests executed based on change analysis"
    dependency_awareness: "Downstream effects properly identified and tested"
    error_recovery: "Automatic retry and recovery for transient failures"
    resource_efficiency: "CPU and memory usage optimized for continuous operation"
  
  developer_experience:
    clear_feedback: "Immediate, actionable feedback for all test results"
    error_guidance: "Specific suggestions for resolving healthcare compliance issues"
    performance_insights: "Real-time performance metrics and optimization suggestions"
    coverage_guidance: "Clear indicators when coverage targets are met or missed"
```

---

**Status**: 🟢 **Healthcare Testing Watch Command** | **Real-time**: ✅ | **Intelligence**: ✅ | **Healthcare Focus**: LGPD+ANVISA+CFM ✅