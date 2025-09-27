# CodeRabbit Integration Guide - NeonPro Platform

## Overview

This guide provides comprehensive configuration for CodeRabbit AI code review integration specifically tailored for the NeonPro healthcare platform with Brazilian regulatory compliance requirements.

## Platform Context

**NeonPro Platform:** Aesthetic clinic management system for Brazilian healthcare market
**Compliance Requirements:** LGPD, ANVISA, CFM, WCAG 2.1 AA+
**Technology Stack:** React 19, TypeScript, Hono, PostgreSQL, Supabase
**Critical Focus:** Healthcare data protection, emergency response, accessibility

## CodeRabbit Configuration

### 1. Repository Configuration

```yaml
# .coderabbit.yml
version: 2
project:
  name: "neonpro-healthcare-platform"
  description: "Brazilian aesthetic clinic management platform with LGPD compliance"
  industry: "healthcare"
  compliance_frameworks: ["LGPD", "ANVISA", "CFM", "WCAG_2_1_AA"]

review:
  # Healthcare-specific review rules
  healthcare_rules:
    enabled: true
    strictness: "high"
    
  # Security review focus
  security_focus:
    enabled: true
    priority: "critical"
    
  # Performance requirements
  performance_targets:
    emergency_response_time: "<2000ms"
    bundle_size_limit: "1MB"
    core_web_vitals: "LCP_2.5s_INP_200ms_CLS_0.1"
    
  # Accessibility compliance
  accessibility:
    standard: "WCAG_2_1_AA"
    healthcare_specific: true
    mobile_optimization: true
```

### 2. Healthcare-Specific Review Rules

#### LGPD Compliance Rules
```yaml
lgpd_rules:
  data_classification:
    - rule: "sensitive_data_identification"
      description: "Identify and classify sensitive healthcare data"
      severity: "critical"
      patterns:
        - "cpf|rg|cns"  # Brazilian identifiers
        - "medical_record|diagnosis|treatment"
        - "biometric|genetic_data"
    
  consent_management:
    - rule: "granular_consent_validation"
      description: "Validate granular consent implementation"
      severity: "high"
      checks:
        - "explicit_consent_mechanism"
        - "withdrawal_capability"
        - "purpose_specification"
        - "retention_period"
    
  audit_requirements:
    - rule: "comprehensive_audit_trail"
      description: "Ensure complete audit trail for data operations"
      severity: "critical"
      requirements:
        - "immutable_audit_logs"
        - "user_activity_tracking"
        - "data_access_logging"
        - "consent_modification_tracking"
```

#### ANVISA Medical Device Compliance
```yaml
anvisa_rules:
  medical_device_software:
    - rule: "software_validation"
      description: "ANVISA medical device software validation"
      severity: "critical"
      checks:
        - "risk_classification"
        - "validation_protocol"
        - "quality_management"
        - "post_market_surveillance"
    
  regulatory_documentation:
    - rule: "compliance_documentation"
      description: "ANVISA regulatory documentation requirements"
      severity: "high"
      requirements:
        - "technical_files"
        - "clinical_evidence"
        - "risk_analysis"
        - "labeling_compliance"
```

#### CFM Medical Ethics Compliance
```yaml
cfm_rules:
  telemedicine_compliance:
    - rule: "cfm_resolution_2314"
      description: "CFM Resolution 2.314/2022 compliance"
      severity: "high"
      checks:
        - "professional_liability"
        - "patient_consent_telemedicine"
        - "data_protection"
        - "emergency_protocols"
    
  ethics_requirements:
    - rule: "medical_ethics_compliance"
      description: "Brazilian medical ethics compliance"
      severity: "medium"
      requirements:
        - "confidentiality_maintenance"
        - "professional_boundaries"
        - "informed_consent"
        - "conflict_of_interest"
```

### 3. Security Review Configuration

#### Cryptographic Implementation
```yaml
security_rules:
  cryptography:
    - rule: "secure_implementation"
      description: "Validate secure cryptographic practices"
      severity: "critical"
      checks:
        - "key_management"
        - "algorithm_selection"
        - "random_generation"
        - "error_handling"
      forbidden_patterns:
        - "privateDecrypt.*signature"  # Common cryptographic flaw
        - "hardcoded_keys|passwords"
        - "weak_encryption|md5|sha1"
    
  data_protection:
    - rule: "healthcare_data_protection"
      description: "Healthcare-specific data protection"
      severity: "critical"
      requirements:
        - "encryption_at_rest"
        - "encryption_in_transit"
        - "access_controls"
        - "data_masking"
```

#### Session Management
```yaml
session_management:
  - rule: "secure_session_handling"
    description: "Secure session management for healthcare"
    severity: "critical"
    validation:
      - "session_validation_methods"
      - "mfa_implementation"
      - "timeout_handling"
      - "emergency_access"
    required_methods:
      - "validateSession"
      - "renewSession"
      - "terminateSession"
      - "emergencyOverride"
```

### 4. Performance Optimization Rules

#### Emergency Response Requirements
```yaml
performance_rules:
  emergency_response:
    - rule: "sub_2_second_response"
      description: "Emergency response time validation"
      severity: "critical"
      threshold: "2000ms"
      monitoring_points:
        - "emergency_contact_routing"
        - "critical_alert_dispatch"
        - "emergency_data_access"
        - "medical_emergency_protocols"
    
  core_web_vitals:
    - rule: "healthcare_cwv_compliance"
      description: "Healthcare-specific Core Web Vitals"
      severity: "high"
      targets:
        lcp: "2500ms"
        inp: "200ms"
        cls: "0.1"
        fcp: "1800ms"
        tti: "3800ms"
```

### 5. Accessibility Compliance Configuration

#### WCAG 2.1 AA+ Healthcare Enhancement
```yaml
accessibility_rules:
  healthcare_accessibility:
    - rule: "clinical_environment_compliance"
      description: "Accessibility for clinical environments"
      severity: "high"
      requirements:
        - "44px_touch_targets"
        - "high_contrast_mode"
        - "screen_reader_compatibility"
        - "keyboard_navigation"
        - "voice_control_ready"
    
  medical terminology:
    - rule: "accessible_medical_content"
      description: "Accessible medical terminology and content"
      severity: "medium"
      checks:
        - "plain_language_alternatives"
        - "medical_term_definitions"
        - "visual_aids_compatibility"
        - "multilingual_support"
```

### 6. Testing Requirements

#### Healthcare-Specific Testing
```yaml
testing_rules:
  critical_tests:
    - rule: "emergency_protocol_testing"
      description: "Emergency response protocol testing"
      severity: "critical"
      coverage_requirement: "100%"
      test_types:
        - "unit"
        - "integration"
        - "e2e"
        - "load"
    
  compliance_testing:
    - rule: "regulatory_compliance_validation"
      description: "LGPD/ANVISA/CFM compliance testing"
      severity: "high"
      requirements:
        - "data_subject_rights"
        - "consent_workflows"
        - "audit_trail_verification"
        - "breach_response"
```

### 7. Code Quality Standards

#### Healthcare Code Quality
```yaml
quality_standards:
  typescript_strictness:
    level: "strict"
    no_implicit_any: true
    strict_null_checks: true
    
  error_handling:
    - rule: "comprehensive_error_handling"
      description: "Healthcare-specific error handling"
      severity: "high"
      requirements:
        - "patient_safe_failures"
        - "graceful_degradation"
        - "emergency_fallbacks"
        - "error_logging"
    
  documentation:
    - rule: "healthcare_documentation"
      description: "Medical and technical documentation"
      severity: "medium"
      requirements:
        - "api_documentation"
        - "clinical_workflow_docs"
        - "compliance_documentation"
        - "emergency_procedures"
```

## Integration Setup Steps

### 1. Repository Integration
```bash
# Add CodeRabbit to GitHub repository
# Repository Settings > Integrations > CodeRabbit
# Configure webhook for pull request reviews
```

### 2. Configuration File Deployment
```bash
# Place .coderabbit.yml in repository root
cp CODERABBIT_INTEGRATION_GUIDE.md .coderabbit.yml
git add .coderabbit.yml
git commit -m "feat: Add CodeRabbit AI review configuration for healthcare compliance"
```

### 3. Webhook Configuration
```yaml
# GitHub Repository Settings
Webhook URL: https://api.coderabbit.ai/webhook
Events: 
  - Pull requests
  - Push events
  - Issue comments
Content type: application/json
Secret: ${CODERABBIT_WEBHOOK_SECRET}
```

### 4. Environment Variables
```bash
# .env.production
CODERABBIT_API_KEY=your_api_key_here
CODERABBIT_WEBHOOK_SECRET=your_webhook_secret
CODERABBIT_PROJECT_ID=neonpro-healthcare-platform
```

## Review Process Workflow

### 1. Pull Request Creation
```yaml
trigger: "pull_request_opened"
actions:
  - "automated_code_review"
  - "security_scanning"
  - "compliance_validation"
  - "performance_analysis"
  - "accessibility_check"
```

### 2. Review Quality Gates
```yaml
quality_gates:
  must_pass:
    - "security_scan"
    - "compliance_check"
    - "critical_test_coverage"
    - "typescript_compilation"
  
  should_pass:
    - "code_quality_score > 8.0"
    - "test_coverage > 85%"
    - "documentation_completeness"
    - "performance_benchmarks"
  
  warnings:
    - "style_guide_violations"
    - "minor_optimizations"
    - "documentation_improvements"
```

### 3. Approval Workflow
```yaml
approval_requirements:
  automatic_approval:
    conditions:
      - "quality_gates_passed"
      - "security_scan_clean"
      - "compliance_validated"
      - "tests_passing"
  
  manual_review_required:
    conditions:
      - "security_vulnerabilities_found"
      - "compliance_issues_detected"
      - "performance_regression"
      - "accessibility_violations"
```

## Monitoring and Reporting

### 1. Review Metrics
```yaml
metrics:
  code_quality:
    - "review_accuracy"
    - "false_positive_rate"
    - "critical_issue_detection"
  
  compliance:
    - "lgpd_compliance_score"
    - "anvisa_validation_status"
    - "cfm_ethics_compliance"
  
  performance:
    - "review_processing_time"
    - "impact_on_development_velocity"
    - "quality_improvement_trend"
```

### 2. Alert Configuration
```yaml
alerts:
  critical:
    - "security_vulnerability_detected"
    - "compliance_breach_identified"
    - "emergency_response_regression"
  
  warning:
    - "quality_score_degradation"
    - "test_coverage_decline"
    - "performance_regression"
  
  info:
    - "review_improvement_suggestions"
    - "documentation_updates"
    - "best_practice_recommendations"
```

## Healthcare-Specific Review Templates

### 1. LGPD Compliance Review Template
```markdown
## LGPD Compliance Review
- [ ] Data subject rights implementation
- [ ] Granular consent mechanisms
- [ ] Audit trail completeness
- [ ] Data breach procedures
- [ ] International data transfer validation
- [ ] Sensitive data protection measures
```

### 2. Emergency Response Review Template
```markdown
## Emergency Response Validation
- [ ] Sub-2 second response time
- [ ] Emergency override functionality
- [ ] Critical data access protocols
- [ ] Medical emergency workflows
- [ ] Fallback mechanisms
- [ ] Disaster recovery procedures
```

### 3. Accessibility Review Template
```markdown
## Healthcare Accessibility Review
- [ ] WCAG 2.1 AA+ compliance
- [ ] 44px+ touch targets
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Medical terminology accessibility
```

## Continuous Improvement

### 1. Review Effectiveness Tracking
```yaml
improvement_tracking:
  metrics:
    - "issue_resolution_rate"
    - "false_positive_reduction"
    - "developer_satisfaction"
    - "compliance_improvement"
  
  feedback_loops:
    - "developer_feedback_collection"
    - "compliance_officer_review"
    - "security_team_validation"
    - "accessibility_expert_assessment"
```

### 2. Rule Optimization
```yaml
rule_optimization:
  frequency: "monthly"
  stakeholders:
    - "development_team"
    - "compliance_officer"
    - "security_team"
    - "accessibility_specialist"
    - "healthcare_domain_expert"
  
  process:
    1. "Collect review feedback"
    2. "Analyze effectiveness metrics"
    3. "Update rule configurations"
    4. "Test new configurations"
    5. "Deploy optimized rules"
```

## Support and Maintenance

### 1. CodeRabbit Support
- **Documentation:** https://docs.coderabbit.ai
- **Support:** support@coderabbit.ai
- **Healthcare Domain:** healthcare@coderabbit.ai (specialized support)

### 2. Platform-Specific Resources
- **LGPD Guidelines:** https://www.gov.br/lgpd
- **ANVISA Regulations:** https://www.gov.br/anvisa
- **CFM Ethics:** https://portal.cfm.org.br
- **WCAG Standards:** https://www.w3.org/WAI/WCAG21/AA/

## Conclusion

This CodeRabbit integration configuration provides comprehensive AI-powered code review specifically tailored for the NeonPro healthcare platform. The configuration ensures:

1. **Regulatory Compliance:** Automated validation of LGPD, ANVISA, and CFM requirements
2. **Security Excellence:** Healthcare-specific security validation and vulnerability detection
3. **Performance Optimization:** Emergency response and healthcare performance standards
4. **Accessibility Assurance:** WCAG 2.1 AA+ compliance with healthcare enhancements
5. **Quality Assurance:** Comprehensive code quality standards and best practices

The integration will significantly improve code quality, reduce compliance risks, and accelerate development velocity while maintaining the highest standards for healthcare software development.

---

**Next Steps:**
1. Deploy configuration to repository
2. Configure webhooks and environment variables
3. Test integration with sample pull requests
4. Train development team on healthcare-specific rules
5. Establish monitoring and feedback loops
6. Schedule regular optimization reviews