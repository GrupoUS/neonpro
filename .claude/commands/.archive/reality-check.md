# /reality-check - 30-Second Reality Check Validation Command

## Command: `/reality-check [scope] [--auto] [--healthcare] [--comprehensive] [--ci-mode]`

### 🎯 **Purpose**
**30-Second Reality Check** implementation with comprehensive validation ensuring "Test changes instead of assuming they work". Mandatory quality gate that must answer YES to ALL validation criteria before task completion.

### ✅ **Core Reality Check Philosophy**
```yaml
REALITY_CHECK_PRINCIPLES:
  test_not_assume: "Test changes instead of assuming they work"
  verify_expectations: "Verify outputs match expectations"
  handle_errors_properly: "Handle errors properly"
  follow_complete_checklist: "Follow the complete checklist"
  should_vs_does: "'Should work' ≠ 'does work' - Pattern matching isn't enough"
  solve_problems: "I'm not paid to write code, I'm paid to solve problems"  
  untested_is_guess: "Untested code is just a guess, not a solution"
  
VALIDATION_GATE:
  mandatory: "Must answer YES to ALL criteria"
  blocking: "Task cannot be marked complete until validation passes"
  comprehensive: "No shortcuts or assumptions allowed"
  healthcare: "Enhanced validation for medical applications"
```

### 🚀 **The 30-Second Reality Check Criteria**

#### **Mandatory Validation Checklist**
```yaml
REALITY_CHECK_CRITERIA:
  1_run_build_code: "Did I run/build the code?"
  2_trigger_feature: "Did I trigger the exact feature I changed?"
  3_observed_result: "Did I see the expected result with my own observations?"
  4_test_edge_cases: "Did I test edge cases?"
  5_check_errors: "Did I check for error messages?"
  6_verify_warnings: "Did I verify no new warnings or errors appeared?"
  7_performance_impact: "Did I check performance impact?"
  8_accessibility_validation: "Did I validate accessibility requirements?"
  9_code_style_review: "Did I review the code for style and consistency?"
  10_security_vulnerabilities: "Did I ensure no security vulnerabilities were introduced?"
  
HEALTHCARE_ENHANCED:
  11_lgpd_compliance: "Did I validate LGPD compliance requirements?"
  12_medical_performance: "Did I verify ≤100ms patient data operations?"
  13_audit_trail: "Did I ensure audit trail functionality works?"
  14_multi_tenant_isolation: "Did I test multi-tenant data isolation?"
  15_healthcare_accessibility: "Did I validate medical interface accessibility?"
```

### 🔬 **Execution Flow**

#### **Phase 1: Automated Testing & Validation**
```yaml
AUTOMATED_TESTING:
  build_execution:
    - "Execute complete build process"
    - "Verify build succeeds without errors"
    - "Check for new build warnings"
    - "Validate healthcare-specific build requirements"
    
  feature_triggering:
    - "Automatically trigger the exact modified feature"
    - "Execute feature workflows end-to-end"
    - "Validate expected behavior occurs"
    - "Test healthcare-specific feature scenarios"
    
  comprehensive_testing:
    - "Run complete test suite"
    - "Execute integration tests"
    - "Run healthcare compliance tests"
    - "Validate medical workflow tests"
```

#### **Phase 2: Quality & Performance Validation**
```yaml
QUALITY_VALIDATION:
  performance_analysis:
    - "Measure execution time and memory usage"
    - "Validate ≤100ms patient data operations"
    - "Check bundle size impact"
    - "Analyze medical workflow performance"
    
  accessibility_compliance:
    - "Run accessibility audit (WCAG 2.1 AA+)"
    - "Validate keyboard navigation"
    - "Check color contrast ratios"
    - "Test screen reader compatibility"
    - "Enhanced medical interface accessibility"
    
  security_scanning:
    - "Run security vulnerability scan"
    - "Check for XSS vulnerabilities"
    - "Validate input sanitization"
    - "Healthcare data security validation"
```

#### **Phase 3: Healthcare & Compliance Validation**
```yaml
HEALTHCARE_VALIDATION:
  lgpd_compliance:
    - "Validate patient data protection"
    - "Check consent management functionality"
    - "Verify audit trail completeness"
    - "Test multi-tenant data isolation"
    
  medical_performance:
    - "Validate medical workflow performance"
    - "Check patient data operation speed"
    - "Test clinical workflow efficiency"
    - "Verify emergency response performance"
    
  regulatory_compliance:
    - "ANVISA medical device compliance"
    - "CFM digital health standards"
    - "Medical audit requirements"
    - "Healthcare security standards"
```

### 🔧 **Core Actions & Commands**

#### **Quick Reality Check**
```yaml
QUICK_VALIDATION:
  reality_check:
    command: "/reality-check quick"
    purpose: "30-second validation of all criteria"
    timeout: "≤30 seconds for complete validation"
    blocking: "Fails if any criterion not met"
    
  reality_check_auto:
    command: "/reality-check auto"
    purpose: "Automated validation with self-healing"
    features: "Auto-fix minor issues, comprehensive reporting"
    healthcare: "Enhanced medical validation"
    
  reality_check_ci:
    command: "/reality-check ci"
    purpose: "CI/CD pipeline validation"
    optimized: "Fast execution for automated environments"
    reporting: "Machine-readable validation results"
```

#### **Comprehensive Reality Check**
```yaml
COMPREHENSIVE_VALIDATION:
  reality_check_full:
    command: "/reality-check comprehensive"
    purpose: "Deep validation with detailed analysis"
    includes: "Performance profiling, security audit, accessibility"
    healthcare: "Full medical compliance validation"
    
  reality_check_healthcare:
    command: "/reality-check healthcare"
    purpose: "Healthcare-specific validation"
    focus: "LGPD, ANVISA, CFM compliance + medical performance"
    standards: "Enhanced validation for medical applications"
    
  reality_check_security:
    command: "/reality-check security"  
    purpose: "Security-focused validation"
    includes: "Vulnerability scanning, penetration testing"
    healthcare: "Medical data security validation"
```

#### **Validation Scopes**
```yaml
SCOPE_VALIDATION:
  scope_feature:
    command: "/reality-check feature --name=feature"
    purpose: "Validate specific feature implementation"
    testing: "Feature-specific test execution"
    
  scope_component:
    command: "/reality-check component --path=component"
    purpose: "Validate component functionality"
    includes: "Unit tests, integration tests, visual tests"
    
  scope_medical:
    command: "/reality-check medical --workflow=patient-data"
    purpose: "Validate medical workflow functionality"
    compliance: "Healthcare-specific requirements"
```

### 📋 **Detailed Validation Implementation**

#### **1. Build & Code Execution**
```yaml
BUILD_VALIDATION:
  build_execution:
    - "pnpm build (following PNPM over NPM rule)"
    - "Verify build artifacts generated correctly"
    - "Check for build warnings or errors"
    - "Validate healthcare-specific build outputs"
    
  code_execution:
    - "Start development server"
    - "Execute modified functionality"
    - "Verify application starts without errors"
    - "Test healthcare-specific startup sequences"
```

#### **2. Feature Triggering & Observation**
```yaml
FEATURE_VALIDATION:
  exact_feature_trigger:
    - "Navigate to exact modified feature"
    - "Execute specific user interactions"
    - "Trigger all modified code paths"
    - "Test healthcare-specific workflows"
    
  result_observation:
    - "Visual verification of expected behavior"
    - "Console output validation"
    - "Network request/response validation"
    - "Healthcare data flow validation"
```

#### **3. Edge Case & Error Testing**
```yaml
EDGE_CASE_TESTING:
  boundary_conditions:
    - "Empty input validation"
    - "Maximum input size testing"
    - "Invalid input handling"
    - "Healthcare edge case scenarios"
    
  error_scenarios:
    - "Network failure simulation"
    - "Database connection errors"
    - "Authentication failure handling"
    - "Medical emergency scenarios"
    
  warning_detection:
    - "Console warning scanning"
    - "Browser dev tools error checking"
    - "Healthcare compliance warnings"
    - "Performance warning validation"
```

#### **4. Performance Impact Analysis**
```yaml
PERFORMANCE_VALIDATION:
  medical_performance:
    - "≤100ms patient data operation validation"
    - "Clinical workflow performance testing"
    - "Medical dashboard load time validation"
    - "Emergency response performance checking"
    
  general_performance:
    - "Page load time measurement"
    - "Bundle size impact analysis"
    - "Memory usage profiling"
    - "CPU utilization monitoring"
```

#### **5. Accessibility Validation**
```yaml
ACCESSIBILITY_VALIDATION:
  wcag_compliance:
    - "WCAG 2.1 AA+ automated testing"
    - "Color contrast ratio validation"
    - "Keyboard navigation testing"
    - "Screen reader compatibility"
    
  healthcare_accessibility:
    - "Medical interface accessibility enhanced"
    - "Emergency access pattern validation"
    - "Healthcare device compatibility"
    - "Patient accessibility requirements"
```

#### **6. Security Vulnerability Scanning**
```yaml
SECURITY_VALIDATION:
  vulnerability_scanning:
    - "OWASP Top 10 validation"
    - "XSS prevention verification"
    - "Input sanitization testing"
    - "Authentication security validation"
    
  healthcare_security:
    - "Patient data encryption validation"
    - "Medical audit trail security"
    - "LGPD compliance security checks"
    - "Healthcare data access controls"
```

### 🏥 **Healthcare Reality Check Extensions**

#### **LGPD Compliance Validation**
```yaml
LGPD_VALIDATION:
  data_protection:
    - "Patient data encryption verification"
    - "Consent management functionality testing"
    - "Data anonymization validation"
    - "Patient rights implementation testing"
    
  audit_compliance:
    - "Medical audit trail completeness"
    - "Healthcare data access logging"
    - "Patient data modification tracking"
    - "Compliance reporting functionality"
```

#### **Medical Performance Standards**
```yaml
MEDICAL_PERFORMANCE:
  response_times:
    - "Patient data operations ≤100ms"
    - "Clinical workflow response ≤200ms"
    - "Emergency access ≤50ms"
    - "Medical dashboard load ≤2s"
    
  reliability_testing:
    - "Medical workflow reliability 99.9%"
    - "Patient data consistency validation"
    - "Healthcare system uptime requirements"
    - "Medical emergency response testing"
```

#### **Multi-Tenant Isolation Testing**
```yaml
MULTI_TENANT_VALIDATION:
  data_isolation:
    - "Clinic data separation validation"
    - "Patient data access control testing"
    - "Healthcare provider isolation checking"
    - "Medical data cross-contamination prevention"
    
  performance_isolation:
    - "Tenant performance independence"
    - "Healthcare resource allocation"
    - "Medical workflow isolation"
    - "Clinical operation independence"
```

### 🔄 **Integration with NEONPRO Workflow**

#### **Archon Task Integration**
```yaml
ARCHON_INTEGRATION:
  task_completion_gate:
    - "Reality check required before task marked complete"
    - "Automated task status update based on validation"
    - "Research validation against implementation"
    - "Healthcare compliance task verification"
    
  research_validation:
    - "Verify implementation matches researched patterns"
    - "Validate code examples were followed correctly"
    - "Check best practices implementation"
    - "Healthcare research compliance validation"
```

#### **Ultracite Quality Integration**
```yaml
ULTRACITE_INTEGRATION:
  quality_validation:
    - "≥9.5/10 quality standard verification"
    - "Code formatting and style validation"
    - "Type safety verification"
    - "Healthcare code excellence validation"
    
  automated_fixes:
    - "Ultracite format validation"
    - "Quality improvement verification"
    - "Type error resolution checking"
    - "Healthcare quality standards maintenance"
```

#### **PNPM Build Integration**
```yaml
PNPM_INTEGRATION:
  build_validation:
    - "PNPM build execution and validation"
    - "Dependency resolution verification"
    - "Package optimization validation"
    - "Healthcare build requirements"
    
  performance_validation:
    - "Build performance measurement"
    - "Bundle optimization verification"
    - "Healthcare deployment validation"
    - "Medical application performance"
```

### 🔍 **Usage Examples**

```bash
# Quick 30-second reality check
/reality-check quick
# → Complete validation in ≤30 seconds

# Comprehensive healthcare reality check
/reality-check comprehensive --healthcare
# → Full validation with LGPD/ANVISA/CFM compliance

# Feature-specific validation
/reality-check feature --name="patient-dashboard"
# → Validate specific medical feature

# CI/CD pipeline validation
/reality-check ci --auto-fix
# → Fast validation for automated environments

# Security-focused validation
/reality-check security --medical
# → Medical-grade security validation

# Performance validation for medical workflows
/reality-check performance --medical-workflows
# → ≤100ms patient data operation validation

# Accessibility validation with healthcare extensions
/reality-check accessibility --wcag-aa --healthcare
# → Enhanced accessibility for medical interfaces

# Auto-healing reality check
/reality-check auto --fix --healthcare
# → Automatic issue detection and resolution
```

### 🌐 **Bilingual Support**

#### **Portuguese Commands**
- **`/realidade-check`** - Verificação de realidade 30 segundos
- **`/validar-completo`** - Validação completa com compliance médico
- **`/testar-funcionalidade`** - Teste de funcionalidade médica específica
- **`/verificar-saude`** - Verificação de compliance LGPD/ANVISA
- **`/validar-performance-medica`** - Validação performance ≤100ms médica

#### **English Commands**
- **`/reality-check`** - 30-second reality check validation
- **`/validate-complete`** - Complete validation with medical compliance
- **`/test-functionality`** - Specific medical functionality testing
- **`/verify-healthcare`** - LGPD/ANVISA compliance verification
- **`/validate-medical-performance`** - Medical performance ≤100ms validation

### 📊 **Validation Metrics & Reporting**

#### **Reality Check Success Criteria**
```yaml
SUCCESS_METRICS:
  validation_speed: "Complete validation ≤30 seconds"
  criteria_coverage: "All 15 criteria (10 general + 5 healthcare) passed"
  healthcare_compliance: "LGPD/ANVISA/CFM requirements validated"
  performance_standards: "≤100ms medical operations verified"
  quality_maintenance: "≥9.5/10 quality standards preserved"
  
FAILURE_INDICATORS:
  build_failures: "Build process errors or warnings"
  test_failures: "Failed test cases or edge case issues"
  performance_degradation: "Medical operations >100ms"
  compliance_violations: "Healthcare regulatory issues"
  security_vulnerabilities: "Security scan failures"
```

#### **Comprehensive Reporting**
```yaml
VALIDATION_REPORT:
  executive_summary:
    - "Overall validation status (PASS/FAIL)"
    - "Critical issues requiring immediate attention"
    - "Healthcare compliance status"
    - "Performance benchmark results"
    
  detailed_analysis:
    - "Criterion-by-criterion validation results"
    - "Healthcare-specific validation outcomes"
    - "Performance metrics and benchmarks"
    - "Security and accessibility compliance"
    
  recommendations:
    - "Priority actions for failed criteria"
    - "Healthcare compliance improvements"
    - "Performance optimization opportunities"
    - "Quality enhancement suggestions"
```

### 🎯 **Success Criteria & Validation**

```yaml
REALITY_CHECK_COMPLIANCE:
  mandatory_criteria: "All 10 general criteria must pass ✓"
  healthcare_criteria: "All 5 healthcare criteria must pass ✓"
  validation_speed: "Complete validation ≤30 seconds ✓"
  blocking_enforcement: "Tasks cannot complete without validation ✓"
  quality_maintenance: "≥9.5/10 standards preserved ✓"
  
HEALTHCARE_COMPLIANCE:
  lgpd_validation: "Patient data protection verified ✓"
  medical_performance: "≤100ms operations validated ✓"
  audit_trail: "Medical audit functionality verified ✓"
  accessibility_enhanced: "Medical interface accessibility validated ✓"
  security_medical: "Healthcare security standards met ✓"
```

### 📋 **Automated Validation Pipeline**

#### **CI/CD Integration**
```yaml
CI_CD_INTEGRATION:
  pre_deployment:
    - "Automated reality check execution"
    - "Healthcare compliance validation"
    - "Performance benchmark verification"
    - "Security vulnerability scanning"
    
  deployment_gate:
    - "Reality check must pass for deployment"
    - "Healthcare compliance blocking gate"
    - "Medical performance validation required"
    - "Quality standards enforcement"
    
  post_deployment:
    - "Production reality check validation"
    - "Healthcare monitoring verification"
    - "Medical performance continuous monitoring"
    - "Compliance audit trail validation"
```

### 🏆 **Quality Standards**

- ⚡ **30-Second Validation**: Complete reality check in ≤30 seconds
- ✅ **Mandatory Criteria**: All 15 criteria (10 general + 5 healthcare) must pass
- 🏥 **Healthcare Enhanced**: LGPD/ANVISA/CFM compliance validation
- 🚫 **Blocking Gate**: Tasks cannot complete without validation
- 📊 **Performance Verified**: ≤100ms medical operations validated
- 🔒 **Security Validated**: Healthcare data security compliance
- 🌐 **Bilingual**: Portuguese/English healthcare validation support

---

**Status**: ✅ **30-Second Reality Check Enforcer** | **Criteria**: 15 mandatory validations | **Speed**: ≤30 seconds | **Healthcare**: ✅ LGPD/ANVISA/CFM Validated | **Blocking**: ✅ Task completion gate | **Bilingual**: 🇧🇷 🇺🇸

**Ready for Reality**: Comprehensive validation ensuring "Test changes instead of assuming they work" with healthcare compliance, performance verification, and quality enforcement ≥9.5/10.