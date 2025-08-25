# /performance - Universal Performance & Quality Assurance Command

## Command: `/performance [target] [--type=load|stress|accessibility|e2e|audit|quality] [--users=N] [--duration=Xm] [--healthcare]`

### 🎯 **Purpose**
Comprehensive performance testing, accessibility validation, end-to-end testing, code quality auditing, and healthcare-specific performance optimization with intelligent monitoring and recommendation systems.

### 🧠 **Intelligence Integration**
```yaml
PERFORMANCE_INTELLIGENCE:
  activation_triggers:
    - "/performance [endpoint]"
    - "load test [application]"
    - "stress test [system]"
    - "accessibility audit [page]"
    - "e2e test [workflow]"
    - "quality check [codebase]"
    - "performance audit [system]"
  
  context_detection:
    test_type: "Load, stress, spike, endurance, accessibility, e2e, quality audit"
    technology_stack: "Auto-detect: REST APIs, GraphQL, WebSocket, React, Next.js"
    performance_baseline: "Current metrics and SLA requirements"
    scalability_goals: "Target user capacity and response times"
    healthcare_requirements: "Patient data access <100ms, LGPD compliance"
    accessibility_level: "WCAG 2.1 AA+ compliance for healthcare applications"
```

### 🚀 **Execution Flow**

#### **Phase 1: Performance Assessment Planning**
```yaml
PLANNING:
  baseline_establishment:
    - "Measure current performance metrics and resource usage"
    - "Define healthcare-specific performance requirements (<100ms patient data)"
    - "Establish accessibility baseline (WCAG 2.1 AA+ for medical interfaces)"
    - "Map critical user journeys and patient workflows"
    - "Set up comprehensive monitoring and alerting"
    
  testing_strategy:
    performance: "Load, stress, spike, endurance testing methodology"
    accessibility: "WCAG 2.1 AA+ validation and screen reader testing"
    e2e: "Critical healthcare workflow validation (patient management, scheduling)"
    quality: "Code quality, security, and maintainability assessment"
    
  healthcare_specific_planning:
    - "Patient data access performance requirements"
    - "Medical workflow timeout and reliability standards"
    - "Accessibility for healthcare professionals and patients"
    - "Multi-tenant performance isolation validation"
```

#### **Phase 2: Multi-Dimensional Testing Execution**
```yaml
PERFORMANCE_TESTING:
  load_testing:
    - "Realistic user load simulation with healthcare scenarios"
    - "Patient portal concurrent user testing"
    - "Medical record access performance validation"
    - "API endpoint throughput and latency measurement"
    
  stress_testing:
    - "System breaking point identification"
    - "Resource exhaustion and recovery testing"
    - "Database connection pool stress testing"
    - "Emergency healthcare workflow stress scenarios"
    
  endurance_testing:
    - "Long-running system stability validation"
    - "Memory leak and resource accumulation detection"
    - "24/7 healthcare operation simulation"
    - "Multi-tenant system prolonged load testing"

ACCESSIBILITY_TESTING:
  wcag_compliance:
    - "WCAG 2.1 AA+ compliance validation"
    - "Healthcare-specific accessibility requirements"
    - "Screen reader compatibility (JAWS, NVDA, VoiceOver)"
    - "Keyboard navigation and focus management"
    - "Color contrast and visual accessibility"
    
  healthcare_accessibility:
    - "Medical professional workflow accessibility"
    - "Patient portal accessibility for diverse abilities"
    - "Emergency system accessibility requirements"
    - "Mobile healthcare application accessibility"
    
  assistive_technology_testing:
    - "Screen reader interaction testing"
    - "Voice control system compatibility"
    - "High contrast and magnification support"
    - "Motor impairment accommodation validation"

E2E_TESTING:
  healthcare_workflow_testing:
    - "Patient registration and onboarding flows"
    - "Medical appointment scheduling and management"
    - "Electronic health record (EHR) access and updates"
    - "Prescription management and e-prescribing"
    - "Telemedicine consultation workflows"
    
  critical_user_journeys:
    - "Healthcare provider daily workflow automation"
    - "Patient self-service portal complete journeys"
    - "Emergency access and urgent care scenarios"
    - "Multi-role healthcare team collaboration testing"
    
  cross_browser_device_testing:
    - "Desktop browser compatibility (Chrome, Firefox, Safari, Edge)"
    - "Mobile device testing (iOS, Android healthcare apps)"
    - "Tablet testing for healthcare professional workflows"
    - "Legacy browser support for healthcare institutions"

CODE_QUALITY_AUDITING:
  biome_quality_checks:
    - "TypeScript strict mode compliance and type safety"
    - "Code formatting and style consistency (Biome linter)"
    - "Import organization and dependency management"
    - "Dead code elimination and unused import detection"
    - "Performance optimization recommendations"
    
  security_quality_assessment:
    - "Healthcare data handling security review"
    - "OWASP compliance and vulnerability scanning"
    - "Dependency security audit and update recommendations"
    - "LGPD compliance code review (patient data handling)"
    
  maintainability_audit:
    - "Code complexity analysis and refactoring recommendations"
    - "Test coverage assessment and improvement suggestions"
    - "Documentation completeness and accuracy review"
    - "Architecture and design pattern compliance"
```

#### **Phase 3: Analysis & Optimization**
```yaml
PERFORMANCE_ANALYSIS:
  metric_collection:
    - "Response time percentiles (P50, P95, P99)"
    - "Throughput and requests per second"
    - "Resource utilization (CPU, Memory, Network, Disk)"
    - "Error rates and failure patterns"
    
  bottleneck_identification:
    - "Database query performance analysis"
    - "API endpoint optimization opportunities"
    - "Frontend rendering and bundle size optimization"
    - "Network latency and CDN effectiveness"
    
  healthcare_specific_analysis:
    - "Patient data access time optimization"
    - "Medical workflow efficiency analysis"
    - "Multi-tenant performance isolation validation"
    - "Compliance overhead performance impact"
```

### 🔧 **Testing Categories & Methodologies**

#### **Performance Testing Types**
```yaml
LOAD_TESTING:
  patient_portal_load:
    - "Concurrent patient login and data access"
    - "Medical record retrieval under normal load"
    - "Appointment scheduling system capacity"
    - "Real-time healthcare data synchronization"
    
  healthcare_api_load:
    - "EHR API endpoint stress testing"
    - "FHIR standard compliance performance"
    - "Medical imaging data transfer performance"
    - "Integration with third-party medical systems"

STRESS_TESTING:
  emergency_scenarios:
    - "Mass patient influx simulation (epidemic scenarios)"
    - "System failure and recovery testing"
    - "Database failover and disaster recovery"
    - "Peak usage hospital workflow simulation"
    
  resource_exhaustion:
    - "Memory and CPU stress testing"
    - "Database connection pool exhaustion"
    - "Storage capacity stress scenarios"
    - "Network bandwidth saturation testing"
```

#### **Accessibility Testing Framework**
```yaml
WCAG_2_1_AA_PLUS_TESTING:
  perceivable:
    - "Text alternatives for medical images and charts"
    - "Captions for medical instructional videos"
    - "Color contrast ratios ≥4.5:1 for medical interfaces"
    - "Resizable text up to 200% without horizontal scrolling"
    
  operable:
    - "Keyboard navigation for all healthcare workflows"
    - "No seizure-inducing content in medical visualizations"
    - "Sufficient time limits for healthcare data entry"
    - "Clear navigation and wayfinding for medical portals"
    
  understandable:
    - "Plain language for patient-facing medical content"
    - "Consistent healthcare interface navigation"
    - "Error identification and suggestion for medical forms"
    - "Context-sensitive help for complex medical workflows"
    
  robust:
    - "Screen reader compatibility for medical data"
    - "Assistive technology support for healthcare professionals"
    - "Future-proof markup for medical information systems"
    - "Cross-device compatibility for healthcare applications"
```

#### **End-to-End Testing Scenarios**
```yaml
HEALTHCARE_E2E_WORKFLOWS:
  patient_journey_testing:
    - "New patient registration with insurance verification"
    - "Medical history intake and consent management"
    - "Appointment scheduling with provider availability"
    - "Pre-visit questionnaire and symptom tracking"
    - "Virtual consultation participation and recording"
    - "Post-visit care plan access and medication management"
    
  healthcare_provider_workflows:
    - "Daily patient schedule management and updates"
    - "Electronic health record documentation and coding"
    - "Prescription writing and e-prescribing workflows"
    - "Lab result review and patient communication"
    - "Referral management and specialist coordination"
    - "Billing and insurance claim processing"
    
  administrative_workflows:
    - "Staff scheduling and resource allocation"
    - "Inventory management for medical supplies"
    - "Compliance reporting and audit preparation"
    - "Financial reporting and revenue cycle management"
```

### 📊 **Performance Benchmarks & Standards**

#### **Healthcare Performance Requirements**
```yaml
PERFORMANCE_STANDARDS:
  patient_data_access:
    target: "<100ms response time"
    acceptable: "<200ms response time"
    unacceptable: ">500ms response time"
    
  medical_workflow_operations:
    target: "<250ms for complex operations"
    acceptable: "<500ms for complex operations"
    unacceptable: ">1000ms for any operation"
    
  system_availability:
    target: "99.9% uptime (8.76 hours downtime/year)"
    acceptable: "99.5% uptime (43.8 hours downtime/year)"
    unacceptable: "<99% uptime"
    
  concurrent_user_capacity:
    small_clinic: "50-100 concurrent users"
    medium_hospital: "500-1000 concurrent users"
    large_health_system: "2000-5000 concurrent users"
```

#### **Accessibility Compliance Targets**
```yaml
ACCESSIBILITY_STANDARDS:
  wcag_2_1_compliance:
    level_aa: "All healthcare interfaces must meet AA standards"
    level_aaa: "Patient-critical interfaces should achieve AAA where possible"
    
  healthcare_specific_requirements:
    - "Medical terminology pronunciation support"
    - "High contrast mode for clinical environments"
    - "Large text support for aging patient populations"
    - "Voice navigation for hands-free medical environments"
```

### 🤝 **MCP Integration & Tooling**

- **Desktop-Commander**: Local testing execution and report generation
- **Sequential-Thinking**: Complex performance analysis and optimization strategies
- **Context7**: Performance testing best practices and framework documentation
- **Playwright**: Comprehensive E2E testing automation for healthcare workflows

### 🔍 **Usage Examples**

```bash
# Comprehensive healthcare application performance audit
/performance patient-portal --type=load --users=500 --duration=30m --healthcare

# Accessibility compliance validation
/performance patient-interface --type=accessibility --healthcare

# End-to-end healthcare workflow testing
/performance appointment-booking --type=e2e --healthcare

# Code quality and performance audit
/performance codebase --type=audit --healthcare

# Emergency scenario stress testing
/performance emergency-system --type=stress --users=2000 --duration=60m

# Multi-type comprehensive performance assessment
/performance healthcare-platform --type=load,accessibility,e2e,quality --healthcare
```

### 📋 **Performance Assessment Deliverables**

#### **1. Executive Performance Report**
```markdown
# Healthcare Application Performance Assessment

## Executive Summary
- **Assessment Scope**: [Applications/Workflows tested]
- **Performance Standards**: [Healthcare-specific requirements met]
- **Accessibility Compliance**: [WCAG 2.1 AA+ status]
- **Critical Issues**: [Performance bottlenecks and accessibility barriers]
- **Healthcare Readiness**: [Clinical workflow performance validation]

## Performance Metrics Dashboard
### Response Time Analysis
- Patient Data Access: 85ms (✅ <100ms target)
- Medical Record Load: 145ms (✅ <200ms acceptable)
- Appointment Scheduling: 95ms (✅ <100ms target)

### Accessibility Compliance
- WCAG 2.1 AA Compliance: 96% (4% minor issues)
- Screen Reader Support: 100% compatible
- Keyboard Navigation: 98% accessible
- Healthcare-Specific Requirements: 94% met
```

#### **2. Technical Performance Analysis**
```yaml
performance_metrics:
  load_testing_results:
    concurrent_users: 1000
    average_response_time: "125ms"
    p95_response_time: "280ms"
    p99_response_time: "450ms"
    throughput: "2500 requests/second"
    error_rate: "0.02%"
    
  accessibility_audit:
    wcag_2_1_aa_compliance: "96%"
    critical_accessibility_issues: 2
    moderate_accessibility_issues: 8
    screen_reader_compatibility: "100%"
    
  code_quality_metrics:
    typescript_compliance: "98%"
    test_coverage: "87%"
    code_complexity: "Low-Medium"
    security_vulnerabilities: 0
    performance_optimizations: 12
```

### 🎯 **Success Criteria**

```yaml
PERFORMANCE_VALIDATION:
  response_time_targets: "≥95% of operations under healthcare performance thresholds"
  accessibility_compliance: "≥95% WCAG 2.1 AA+ compliance"
  healthcare_workflow_validation: "All critical patient journeys tested and optimized"
  code_quality_standards: "≥90% quality metrics across all dimensions"
  scalability_verification: "Verified performance at target concurrent user loads"
  monitoring_implementation: "Comprehensive performance monitoring established"
```

### 🏥 **Healthcare Performance Specialization**

- ✅ **Patient Data Performance**: <100ms patient data access guaranteed
- ✅ **Medical Workflow Optimization**: Healthcare-specific performance tuning
- ✅ **Accessibility Excellence**: WCAG 2.1 AA+ compliance for medical interfaces
- ✅ **Multi-Tenant Performance**: Isolated healthcare organization performance
- ✅ **Emergency Scalability**: Rapid scale-up for healthcare emergencies
- ✅ **Compliance Performance**: LGPD/HIPAA compliant high-performance architecture

---

**Status**: 🟢 **Universal Performance & QA Command** | **Testing**: Load + Stress + Accessibility + E2E + Quality | **Healthcare**: ✅ <100ms Patient Data + WCAG 2.1 AA+ | **Monitoring**: Real-time Performance

**Ready for Comprehensive Performance Assessment**: Multi-dimensional performance testing with healthcare-specific optimization and accessibility excellence.