# /test - NeonPro Healthcare Testing Command

## Command: `/test [scope] [--type=unit|integration|e2e|performance|compliance] [--coverage=target] [--healthcare]`

### 🎯 **Purpose**
Intelligent healthcare testing framework with Vitest + Playwright integration, LGPD/ANVISA/CFM compliance validation, and automated quality gates for Brazilian healthcare systems.

### 🧠 **NeonPro Intelligence Integration**
```yaml
NEONPRO_TEST_INTELLIGENCE:
  activation_triggers:
    - "/test [component]"
    - "test patient data security"
    - "validate LGPD compliance" 
    - "check ANVISA procedures"
    - "verify CFM requirements"
    - "audit healthcare compliance"
  
  configured_stack:
    unit_framework: "Vitest (v1.6.0) - Pre-configured with healthcare setup"
    e2e_framework: "Playwright (latest) - Multi-browser healthcare workflows"
    linting: "Biome + UltraCite - Healthcare-specific rules"
    coverage: "v8 provider - 70-90% thresholds by module criticality"
    
  healthcare_context:
    compliance_testing: "LGPD, ANVISA, CFM validation suites"
    patient_data: "RLS, encryption, audit trail validation"
    medical_workflows: "Appointment, treatment, procedure e2e testing"
    regulatory_audit: "Automated compliance reporting"
    
  monorepo_awareness:
    workspace_detection: "apps/web, packages/ui, packages/utils auto-detection"
    parallel_execution: "Optimized for PNPM workspaces + Turborepo"
    coverage_aggregation: "Cross-package healthcare module analysis"
```

### 🚀 **NeonPro Execution Flow**

#### **Phase 1: Healthcare Test Strategy & Planning**
```yaml
NEONPRO_STRATEGY:
  healthcare_analysis:
    - "Analyze patient data flows and privacy compliance gaps"
    - "Identify critical healthcare workflows and LGPD touchpoints"
    - "Determine compliance test types (LGPD/ANVISA/CFM)"
    - "Plan test data with realistic patient scenarios (anonymized)"
    
  compliance_scope_assessment:
    unit: "Patient data functions, encryption, consent management"
    integration: "Healthcare modules interaction, RLS validation"
    e2e: "Complete patient journey workflows (booking → treatment → billing)"
    compliance: "LGPD consent flows, ANVISA procedure tracking, CFM documentation"
    performance: "Clinic load testing, appointment system scalability"
    
  healthcare_coverage_targets:
    patient_portal: "≥85% coverage - Patient-facing critical functionality"
    compliance_modules: "≥90% coverage - LGPD/ANVISA/CFM required"
    medical_records: "≥90% coverage - Patient data security critical"
    general_modules: "≥70% coverage - Standard business logic"
    
  regulatory_validation:
    - "LGPD compliance testing with consent tracking"
    - "ANVISA procedure classification and tracking"
    - "CFM medical professional requirements validation"
    - "Data breach simulation and response testing"
```#### **Phase 2: NeonPro Test Implementation**
```yaml
NEONPRO_IMPLEMENTATION:
  vitest_execution:
    commands:
      - "pnpm test:unit - Run Vitest unit tests with healthcare setup"
      - "pnpm test:healthcare - Run LGPD/ANVISA/CFM compliance tests"
      - "pnpm test:patient - Run patient data security validation"
      - "pnpm test:unit:coverage - Generate coverage with v8 provider"
    
    healthcare_utilities:
      - "Use test/healthcare-setup.ts for compliance mocks"
      - "Use test/supabase-setup.ts for RLS validation"
      - "Leverage existing patient data generators"
      - "Apply healthcare-specific test thresholds"
  
  playwright_execution:
    commands:
      - "pnpm test:e2e - Run complete healthcare workflows"
      - "pnpm test:e2e:headed - Visual debugging for complex flows"
      - "pnpm test:e2e:report - Generate HTML reports"
    
    healthcare_scenarios:
      - "Patient registration and consent flows"
      - "Doctor appointment booking and management"
      - "Treatment tracking and medical records"
      - "LGPD data subject rights (access, deletion, portability)"
      - "Multi-tenant clinic data isolation validation"
  
  biome_quality_integration:
    commands:
      - "pnpm check - Run Biome + UltraCite with healthcare rules"
      - "pnpm check:fix - Auto-fix healthcare compliance issues"
      - "pnpm lint:biome - Validate healthcare coding standards"
    
    quality_gates:
      - "Healthcare accessibility compliance (WCAG 2.1 AA+)"
      - "Patient data exposure detection"
      - "Medical terminology validation"
      - "Brazilian healthcare regulation compliance"
```

#### **Phase 3: NeonPro Execution & Claude Code Reporting**
```yaml
NEONPRO_EXECUTION:
  intelligent_orchestration:
    - "Detect changed files and run related healthcare tests"
    - "Parallel execution optimized for PNPM workspaces"
    - "Generate JSON reports for Claude Code consumption"
    - "Terminal-friendly output with healthcare compliance indicators"
    
  claude_code_reporting:
    json_outputs:
      - "tools/testing/reports/vitest-results.json - Unit test results"
      - "tools/testing/reports/playwright-results.json - E2E results"  
      - "tools/testing/coverage/lcov.info - Coverage data"
      - ".claude/test-summary.json - Healthcare compliance summary"
    
    terminal_dashboards:
      - "Healthcare compliance status (🏥 LGPD ✅ ANVISA ✅ CFM ✅)"
      - "Coverage by criticality (Patient Portal: 85% | Compliance: 90%)"
      - "Failed tests with actionable fixes"
      - "Performance benchmarks for clinic workflows"
  
  healthcare_monitoring:
    compliance_alerts:
      - "Patient data exposure warnings"
      - "LGPD consent flow failures"
      - "ANVISA procedure validation errors"
      - "CFM medical documentation gaps"
    
    quality_metrics:
      - "Healthcare accessibility violations"
      - "Brazilian regulation compliance score"
      - "Patient journey completion rates"
      - "Medical data encryption validation"
      
  automated_fixes:
    - "Biome auto-fix for healthcare coding standards"
    - "Test data anonymization for failed tests"
    - "RLS policy validation and suggestions"
    - "Healthcare compliance remediation guidance"
```

### 🔧 **NeonPro Configured Stack**

#### **Frontend Healthcare Testing (Next.js 15)**
```yaml
NEONPRO_REACT_TESTING:
  frameworks: "Vitest + @testing-library/react + Playwright (PRE-CONFIGURED)"
  healthcare_patterns:
    - "Patient portal component accessibility testing"
    - "Medical form validation and error handling"
    - "Healthcare data context and state management"
    - "LGPD consent component interaction testing"
    - "Doctor appointment calendar component testing"
  
  configured_utilities:
    - "@testing-library/jest-dom - Healthcare-specific matchers"
    - "test/healthcare-setup.ts - LGPD/ANVISA/CFM mocks"
    - "test/supabase-setup.ts - RLS and patient data mocks"
    - "packages/ui testing - Shared healthcare components"
  
  accessibility_focus:
    - "WCAG 2.1 AA+ compliance for patient interfaces"
    - "Screen reader compatibility for medical forms"
    - "Keyboard navigation for clinic workflows"
    - "Color contrast for medical emergency indicators"
```

#### **Backend Healthcare Testing (Next.js API + Supabase)**
```yaml
NEONPRO_API_TESTING:
  frameworks: "Vitest + Supabase Client + Next.js API Testing (PRE-CONFIGURED)"
  healthcare_api_patterns:
    - "Patient CRUD operations with RLS validation"
    - "Medical appointment scheduling with conflict resolution"
    - "LGPD consent management API testing"
    - "ANVISA procedure tracking API validation"
    - "CFM medical professional authentication"
    - "Healthcare data encryption in transit and at rest"
  
  supabase_integration:
    configured_testing:
      - "test/supabase-setup.ts - Mock Supabase client"
      - "RLS policy simulation for multi-tenant testing"
      - "Healthcare database schema validation"
      - "Patient data anonymization utilities"
    
    healthcare_operations:
      - "Patient registration with LGPD compliance"
      - "Medical record creation with audit trails"
      - "Appointment booking with availability validation"
      - "Treatment progress tracking with ANVISA compliance"
      - "Billing integration with healthcare regulations"
  
  regulatory_api_validation:
    lgpd_compliance:
      - "Data subject rights API (access, rectification, deletion)"
      - "Consent withdrawal and granular permissions"
      - "Personal data processing audit trails"
      - "Cross-border data transfer validation"
    
    anvisa_compliance:
      - "Medical procedure classification API"
      - "Treatment protocol validation"
      - "Adverse event reporting API"
      - "Medical device tracking integration"
    
    cfm_compliance:
      - "Medical professional license validation"
      - "Digital prescription authentication"
      - "Telemedicine session recording compliance"
      - "Medical ethics violation reporting"
```

### 📊 **NeonPro Healthcare Testing Strategies**

#### **Unit Testing (Vitest Configured)**
```yaml
HEALTHCARE_UNIT_TESTING:
  critical_focus_areas:
    - "Patient data encryption and decryption functions"
    - "LGPD consent management business logic"
    - "Medical calculation functions (dosage, BMI, etc.)"
    - "Brazilian healthcare validation (CPF, SUS, CRM)"
    - "Appointment scheduling conflict resolution"
    - "ANVISA procedure classification algorithms"
    
  healthcare_best_practices:
    - "Patient data anonymization in all test scenarios"
    - "Medical accuracy validation for calculations"
    - "LGPD compliance verification in data operations"
    - "Accessibility compliance for patient interfaces"
    - "Fast execution (< 1ms per test) with realistic medical data"
    
  configured_coverage_targets:
    patient_portal: "≥85% line coverage - Patient-facing functionality"
    compliance_modules: "≥90% line coverage - LGPD/ANVISA/CFM critical"
    medical_calculations: "≥95% line coverage - Safety-critical computations"
    general_business_logic: "≥70% line coverage - Standard functionality"
    
  existing_commands:
    - "pnpm test:unit - Run all unit tests with healthcare setup"
    - "pnpm test:patient - Run patient-specific unit tests"
    - "pnpm test:compliance - Run LGPD/ANVISA/CFM unit tests"
```

#### **Integration Testing (Supabase + Next.js API)**
```yaml
HEALTHCARE_INTEGRATION_TESTING:
  critical_focus_areas:
    - "Patient portal → Backend API → Supabase RLS validation"
    - "Healthcare module interactions (scheduling ↔ billing ↔ records)"
    - "LGPD consent flow across multiple components"
    - "Multi-tenant clinic data isolation verification"
    - "Supabase authentication with healthcare role management"
    - "External integrations (payment, SMS, email with patient data)"
    
  configured_testing_patterns:
    - "Supabase test client with RLS policy simulation"
    - "Mock healthcare external services (SUS, ANVISA APIs)"
    - "Realistic patient journey data scenarios"
    - "Healthcare error handling and LGPD-compliant logging"
    - "Medical emergency workflow validation"
    
  healthcare_scenarios:
    patient_registration:
      - "Registration → LGPD consent → Data storage → Audit trail"
      - "Patient data validation → Encryption → RLS verification"
    
    appointment_flow:
      - "Booking → Calendar integration → Notification → Confirmation"
      - "Conflict resolution → Rescheduling → Patient communication"
    
    medical_records:
      - "Record creation → Doctor authentication → Patient access"
      - "Medical data sharing → Consent validation → Audit logging"
    
    compliance_workflows:
      - "LGPD data subject rights → Validation → Execution → Reporting"
      - "ANVISA procedure tracking → Classification → Reporting"
      - "CFM professional validation → Authentication → Authorization"
    
  execution_optimization: "Target: < 30 seconds per healthcare workflow"
  existing_setup: "test/supabase-setup.ts + test/healthcare-setup.ts"
```

#### **End-to-End Testing (Playwright Configured)**
```yaml
HEALTHCARE_E2E_TESTING:
  critical_healthcare_workflows:
    patient_complete_journey:
      - "Patient registration → LGPD consent → Profile completion"
      - "Appointment booking → Payment → Confirmation → Reminder"
      - "Check-in → Treatment → Record update → Follow-up"
      - "Data access request → Validation → Export → Delivery"
    
    doctor_clinical_workflow:
      - "Doctor login → Patient selection → Medical record review"
      - "Treatment planning → Procedure execution → Record update"
      - "Prescription → CFM digital signature → Patient notification"
      - "Follow-up scheduling → Progress tracking → Outcome recording"
    
    clinic_management_workflow:
      - "Staff login → Dashboard → Daily schedule review"
      - "Patient check-in → Treatment room assignment → Billing"
      - "ANVISA compliance reporting → Procedure classification"
      - "Monthly reports → LGPD audit → Regulatory submission"
  
  configured_playwright_setup:
    browsers: "Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari"
    test_location: "tools/testing/e2e/ (PRE-CONFIGURED)"
    reports: "tools/testing/reports/html + JSON + JUnit"
    healthcare_fixtures: "Patient personas + Medical scenarios + Compliance data"
    
  accessibility_validation:
    - "WCAG 2.1 AA+ compliance for patient interfaces"
    - "Screen reader compatibility testing"
    - "Keyboard navigation for all clinical workflows"
    - "Color contrast validation for medical alerts"
    
  security_e2e_validation:
    - "Multi-tenant data isolation verification"
    - "Session management and timeout handling"
    - "Patient data exposure prevention testing"
    - "HTTPS and data encryption validation"
    
  brazilian_compliance_scenarios:
    lgpd_validation:
      - "Consent collection and withdrawal workflows"
      - "Data subject rights exercise (access, rectification, deletion)"
      - "Cross-border data transfer consent validation"
    
    anvisa_validation:
      - "Medical procedure classification workflows"
      - "Adverse event reporting end-to-end"
      - "Medical device tracking integration"
    
    cfm_validation:
      - "Medical professional authentication workflows"
      - "Digital prescription signing and validation"
      - "Telemedicine session compliance testing"
  
  performance_targets: "≥95% critical healthcare path coverage"
  existing_commands:
    - "pnpm test:e2e - Run all healthcare E2E workflows"
    - "pnpm test:e2e:headed - Visual debugging mode"
    - "pnpm test:e2e:report - Generate comprehensive HTML reports"
```

#### **Performance Testing (Healthcare Clinic Load)**
```yaml
HEALTHCARE_PERFORMANCE_TESTING:
  clinic_load_scenarios:
    peak_hours: "Morning appointment rush (8-10 AM) simulation"
    emergency_spike: "Sudden influx during medical emergencies"
    end_of_day: "Evening billing and reporting load"
    month_end: "Regulatory reporting and compliance aggregation"
    
  healthcare_metrics:
    - "Patient portal response times (target: < 2s)"
    - "Appointment booking system throughput"
    - "Medical record access performance"
    - "Supabase RLS query optimization"
    - "Multi-tenant data isolation overhead"
    - "LGPD audit trail generation performance"
    
  brazilian_healthcare_scale:
    concurrent_patients: "500+ simultaneous patient portal users"
    appointment_booking: "100+ concurrent appointment requests"
    medical_records: "Real-time access to 10,000+ patient records"
    regulatory_reporting: "Monthly ANVISA/CFM report generation"
    
  tools_integration: "Playwright performance testing + Vitest benchmarks"
```

### 🤝 **NeonPro Agent Orchestration**

```yaml
NEONPRO_AGENT_COORDINATION:
  apex_qa_debugger:
    role: "Healthcare testing specialist and compliance validator"
    focus: "LGPD/ANVISA/CFM test strategy, implementation, and regulatory validation"
    triggers: "Healthcare compliance testing, patient data security validation"
    
  apex_dev:
    role: "Healthcare test code implementation and Vitest/Playwright integration"
    activation: "Complex healthcare scenarios, RLS testing, medical workflow automation"
    specialization: "Next.js 15 + Supabase + Healthcare compliance code generation"
    
  apex_researcher:
    role: "Brazilian healthcare regulation research and testing best practices"
    activation: "LGPD/ANVISA/CFM compliance updates, new medical technology integration"
    focus: "Healthcare testing standards, medical device regulations, patient privacy laws"
    
  supabase_mcp:
    role: "Database testing and RLS validation specialist"
    activation: "Patient data operations, multi-tenant testing, healthcare schema validation"
    project: "ownkoxryswokcdanrdgj (São Paulo region - LGPD compliant)"
```

### 🔍 **NeonPro Healthcare Usage Examples**

```bash
# Healthcare compliance comprehensive testing
/test patient-portal --type=compliance --coverage=90

# Patient data security unit testing
/test patient-data-encryption --type=unit --coverage=95

# LGPD consent flow integration testing
/test lgpd-consent-management --type=integration

# Complete patient journey E2E testing
/test patient-appointment-workflow --type=e2e --healthcare

# Clinic peak hours performance testing
/test appointment-booking --type=performance

# ANVISA procedure tracking validation
/test anvisa-procedures --type=compliance

# Multi-tenant data isolation testing
/test rls-patient-isolation --type=integration

# Brazilian healthcare accessibility testing
/test patient-portal-accessibility --type=e2e

# CFM medical professional validation
/test cfm-doctor-authentication --type=compliance

# Complete healthcare test suite
/test neonpro-healthcare --type=all --coverage=85
```

### 🎯 **NeonPro Healthcare Success Criteria**

```yaml
NEONPRO_COMPLETION_VALIDATION:
  healthcare_coverage_achieved:
    patient_portal: "≥85% coverage achieved"
    compliance_modules: "≥90% coverage achieved" 
    medical_calculations: "≥95% coverage achieved"
    general_modules: "≥70% coverage achieved"
  
  regulatory_compliance_validated:
    lgpd_compliance: "All patient data operations LGPD compliant"
    anvisa_validation: "Medical procedures properly classified and tracked"
    cfm_requirements: "Medical professional authentication working"
    accessibility: "WCAG 2.1 AA+ compliance verified"
  
  healthcare_test_reliability:
    unit_tests: "Vitest tests pass consistently (>99% reliability)"
    e2e_workflows: "Playwright healthcare workflows stable (>98% reliability)"
    integration_tests: "Supabase RLS and multi-tenant isolation verified"
    performance_benchmarks: "Clinic load testing meets Brazilian healthcare standards"
  
  claude_code_optimization:
    terminal_reporting: "JSON reports generated for Claude Code consumption"
    healthcare_dashboard: "Compliance status visible in terminal"
    automated_fixes: "Biome + UltraCite auto-fixes healthcare issues"
    hook_integration: "Git hooks trigger appropriate healthcare tests"
  
  production_readiness:
    ci_cd_integration: "Husky + GitHub Actions with healthcare quality gates"
    monorepo_optimization: "PNPM workspaces + Turborepo healthcare testing"
    documentation_complete: "Healthcare testing guides and compliance docs ready"
    team_training: "Development team ready for healthcare compliance testing"
```

---

**Status**: 🟢 **NeonPro Healthcare Test Command** | **Coverage**: Patient Portal: ≥85%, Compliance: ≥90%, Medical: ≥95% | **Compliance**: LGPD + ANVISA + CFM ✅