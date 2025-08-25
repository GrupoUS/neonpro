# /test-dashboard - Healthcare Testing Status Dashboard

## Command: `/test-dashboard [--detailed] [--json] [--watch]`

### 🎯 **Purpose**
Terminal-friendly healthcare testing status dashboard with real-time test results, coverage metrics, compliance status, and actionable insights for Brazilian healthcare systems.

### 🧠 **Dashboard Intelligence**
```yaml
DASHBOARD_INTELLIGENCE:
  activation_triggers:
    - "/test-dashboard"
    - "show test status"
    - "check testing progress"
    - "healthcare test summary"
    - "test coverage dashboard"
  
  data_sources:
    vitest_results: "tools/testing/reports/vitest-results.json"
    playwright_results: "tools/testing/reports/playwright-results.json"
    coverage_data: "tools/testing/coverage/lcov.info"
    compliance_status: ".claude/.cache/healthcare-testing-workflow.json"
    
  real_time_monitoring:
    test_execution: "Live test runner status and progress"
    coverage_tracking: "Real-time coverage percentage updates"
    compliance_validation: "LGPD/ANVISA/CFM compliance status"
    quality_gates: "Healthcare quality metrics monitoring"
```

### 🚀 **Dashboard Display Flow**

#### **Phase 1: System Status Overview**
```yaml
SYSTEM_STATUS_DISPLAY:
  header_information:
    - "🏥 NEONPRO Healthcare Testing Dashboard"
    - "Last Updated: [timestamp]"
    - "Project Status: [active/testing/deploying]"
    - "Overall Health: [excellent/good/needs-attention/critical]"
    
  quick_metrics:
    - "Total Tests: [passed]/[total] ([percentage]%)"
    - "Coverage: [current]% (Target: 85%+ patient portal, 90%+ compliance)"
    - "Compliance: LGPD ✅/❌ ANVISA ✅/❌ CFM ✅/❌"
    - "Quality Score: [score]/10"
    
  status_indicators:
    - "🟢 All systems operational"
    - "🟡 Some tests failing - remediation needed"
    - "🔴 Critical issues detected - immediate attention required"
    - "⚪ Tests not run recently - validation recommended"
```

#### **Phase 2: Detailed Test Suite Status**
```yaml
TEST_SUITE_BREAKDOWN:
  unit_testing_vitest:
    display_format: "📊 Unit Tests (Vitest)"
    metrics:
      - "Passed: [count] tests"
      - "Failed: [count] tests"
      - "Duration: [time]"
      - "Coverage: [percentage]%"
    
    healthcare_modules:
      patient_portal: "85% coverage (✅ Target met)"
      compliance_modules: "90% coverage (✅ Target met)"
      medical_calculations: "95% coverage (✅ Target met)"
      general_modules: "70% coverage (✅ Target met)"
    
    recent_failures:
      - "[test-name] - [error-summary] - [file:line]"
      - "Quick fix suggestions provided"
  
  e2e_testing_playwright:
    display_format: "🎭 E2E Tests (Playwright)"
    metrics:
      - "Browser Coverage: Chromium ✅ Firefox ✅ WebKit ✅"
      - "Patient Workflows: [passed]/[total]"
      - "Doctor Workflows: [passed]/[total]"
      - "Compliance Workflows: [passed]/[total]"
    
    critical_scenarios:
      patient_journey: "✅ Registration → Appointment → Treatment → Billing"
      doctor_workflow: "✅ Login → Patient Review → Treatment → Documentation"
      compliance_validation: "✅ LGPD Consent → Data Access → Rights Exercise"
    
    performance_metrics:
      - "Average Page Load: [time]ms"
      - "Appointment Booking: [time]ms"
      - "Medical Record Access: [time]ms"
  
  compliance_testing:
    display_format: "🏥 Healthcare Compliance"
    lgpd_compliance:
      - "Patient Data Protection: ✅/❌"
      - "Consent Management: ✅/❌"
      - "Data Subject Rights: ✅/❌"
      - "Audit Trail Generation: ✅/❌"
    
    anvisa_compliance:
      - "Procedure Classification: ✅/❌"
      - "Adverse Event Reporting: ✅/❌"
      - "Medical Device Tracking: ✅/❌"
      - "Quality Management: ✅/❌"
    
    cfm_compliance:
      - "Professional Licensing: ✅/❌"
      - "Digital Signatures: ✅/❌"
      - "Medical Documentation: ✅/❌"
      - "Ethics Compliance: ✅/❌"
```

#### **Phase 3: Quality Gates and Performance Metrics**
```yaml
QUALITY_METRICS_DISPLAY:
  code_quality_biome:
    display_format: "🔍 Code Quality (Biome + UltraCite)"
    metrics:
      - "Linting Issues: [count] (Target: 0)"
      - "Formatting Consistency: ✅/❌"
      - "Healthcare Rules: ✅/❌"
      - "Accessibility Compliance: ✅/❌"
    
    healthcare_specific_rules:
      - "Patient Data Security: ✅/❌"
      - "Medical Terminology: ✅/❌"
      - "WCAG 2.1 AA+ Compliance: ✅/❌"
      - "Brazilian Healthcare Standards: ✅/❌"
  
  performance_benchmarks:
    display_format: "⚡ Performance Metrics"
    healthcare_scenarios:
      - "Patient Portal Load Time: [time]ms (Target: <2000ms)"
      - "Appointment Booking: [time]ms (Target: <1000ms)"
      - "Medical Record Access: [time]ms (Target: <500ms)"
      - "Database Query Performance: [time]ms (Target: <100ms)"
    
    scalability_metrics:
      - "Concurrent Patient Sessions: [count] (Target: 500+)"
      - "Appointment Booking Load: [rps] (Target: 100+ rps)"
      - "Medical Record Queries: [qps] (Target: 1000+ qps)"
  
  security_validation:
    display_format: "🔒 Security Status"
    metrics:
      - "Patient Data Encryption: ✅/❌"
      - "RLS Policy Validation: ✅/❌"
      - "Authentication Security: ✅/❌"
      - "Audit Trail Integrity: ✅/❌"
    
    threat_prevention:
      - "SQL Injection Prevention: ✅/❌"
      - "XSS Protection: ✅/❌"
      - "CSRF Protection: ✅/❌"
      - "Data Breach Prevention: ✅/❌"
```

#### **Phase 4: Actionable Insights and Recommendations**
```yaml
ACTIONABLE_INSIGHTS:
  immediate_actions:
    display_format: "🚨 Immediate Actions Required"
    critical_issues:
      - "[Issue]: [Description] - Fix: [Quick Action]"
      - "Estimated time: [duration]"
      - "Impact: [High/Medium/Low]"
    
    quick_fixes:
      - "Run: pnpm claude:biome-quality-check --fix"
      - "Run: pnpm claude:healthcare-compliance"
      - "Check: tools/testing/reports/ for detailed logs"
  
  optimization_opportunities:
    display_format: "📈 Optimization Opportunities"
    suggestions:
      - "Increase test coverage in [module] to meet [target]%"
      - "Optimize [workflow] performance - current: [time]ms, target: [target]ms"
      - "Enhance [compliance] validation - missing [requirement]"
    
    performance_improvements:
      - "Database query optimization opportunities"
      - "Frontend bundle size reduction recommendations"
      - "Healthcare workflow automation suggestions"
  
  compliance_reminders:
    display_format: "⚖️ Compliance Reminders"
    regulatory_updates:
      - "LGPD compliance review due: [date]"
      - "ANVISA procedure update required: [procedure]"
      - "CFM professional license renewal: [professional]"
    
    audit_preparation:
      - "Compliance documentation status: [percentage]% complete"
      - "Audit trail completeness: [status]"
      - "Regulatory reporting readiness: [status]"
```

### 🔧 **Dashboard Configuration and Customization**

#### **Display Modes**
```yaml
DASHBOARD_MODES:
  compact_mode:
    description: "Essential metrics only - quick overview"
    content: "Status indicators, pass/fail counts, compliance status"
    usage: "/test-dashboard"
  
  detailed_mode:
    description: "Comprehensive metrics with breakdowns"
    content: "Full test results, coverage details, performance metrics"
    usage: "/test-dashboard --detailed"
  
  json_mode:
    description: "Machine-readable output for Claude Code integration"
    content: "Structured JSON for automated processing"
    usage: "/test-dashboard --json"
  
  watch_mode:
    description: "Real-time updates with auto-refresh"
    content: "Live monitoring with automatic status updates"
    usage: "/test-dashboard --watch"
```

#### **Healthcare-Specific Customizations**
```yaml
HEALTHCARE_CUSTOMIZATIONS:
  brazilian_compliance_focus:
    - "LGPD compliance metrics prioritized"
    - "ANVISA procedure tracking highlighted"
    - "CFM professional requirements emphasized"
    - "SUS integration status displayed"
  
  clinic_workflow_optimization:
    - "Patient journey performance metrics"
    - "Doctor workflow efficiency indicators"
    - "Clinic management dashboard insights"
    - "Emergency procedure readiness status"
  
  regulatory_audit_readiness:
    - "Documentation completeness tracking"
    - "Compliance gap identification"
    - "Audit trail validation status"
    - "Regulatory reporting preparation"
```

### 🤝 **Dashboard Agent Orchestration**

```yaml
DASHBOARD_AGENT_COORDINATION:
  apex_qa_debugger:
    role: "Primary dashboard data aggregation and analysis"
    focus: "Test result parsing, quality metrics calculation, issue prioritization"
    activation: "Dashboard data generation, test result analysis, quality reporting"
    
  supabase_mcp:
    role: "Healthcare database metrics and compliance validation"
    focus: "Patient data security metrics, RLS validation, audit trail status"
    activation: "Database performance monitoring, compliance data aggregation"
    
  sequential_thinking:
    role: "Intelligent insights generation and recommendation engine"
    focus: "Pattern analysis, optimization suggestions, compliance recommendations"
    activation: "Complex analysis requiring multi-step reasoning and insights"
```

### 🔍 **Usage Examples**

```bash
# Quick healthcare testing overview
/test-dashboard

# Detailed testing metrics with full breakdown
/test-dashboard --detailed

# JSON output for Claude Code integration
/test-dashboard --json

# Real-time monitoring mode
/test-dashboard --watch

# Compliance-focused dashboard
/test-dashboard --detailed | grep -E "LGPD|ANVISA|CFM"

# Performance metrics only
/test-dashboard --detailed | grep -E "Performance|Load Time"

# Critical issues summary
/test-dashboard | grep -E "🚨|🔴|❌"
```

### 🎯 **Dashboard Success Criteria**

```yaml
DASHBOARD_COMPLETION_VALIDATION:
  real_time_accuracy:
    data_freshness: "Dashboard reflects current test status within 30 seconds"
    metric_accuracy: "All displayed metrics match source data with 100% accuracy"
    status_reliability: "Health indicators correctly reflect system status"
  
  healthcare_compliance_visibility:
    lgpd_status: "Clear LGPD compliance status with specific gap identification"
    anvisa_tracking: "ANVISA procedure compliance with detailed breakdowns"
    cfm_validation: "CFM professional requirements with renewal tracking"
    audit_readiness: "Comprehensive audit trail status and documentation completeness"
  
  actionable_insights:
    immediate_actions: "Clear identification of critical issues requiring immediate attention"
    optimization_suggestions: "Specific recommendations for performance and compliance improvements"
    compliance_reminders: "Proactive alerts for regulatory deadlines and requirements"
    automation_opportunities: "Identification of manual processes that can be automated"
  
  terminal_optimization:
    claude_code_compatibility: "Optimized display for Claude Code terminal environment"
    responsive_layout: "Adaptive layout for different terminal sizes and contexts"
    color_coding: "Effective use of colors and symbols for quick status identification"
    json_integration: "Machine-readable output for Claude Code automation workflows"
```

---

**Status**: 🟢 **Healthcare Testing Dashboard Command** | **Real-time**: ✅ | **Compliance Focus**: LGPD+ANVISA+CFM ✅ | **Claude Code Optimized**: ✅