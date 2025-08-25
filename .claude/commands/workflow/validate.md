# Command: /validate | /validar

## Universal Description
**Phase 6: Validation & Quality Assurance** - Comprehensive quality validation with multi-dimensional testing and constitutional compliance verification for any project.

## Purpose
Perform exhaustive validation of implementation quality, security, performance, and constitutional compliance, ensuring production readiness and adherence to progressive quality standards.

## Context Detection
- **Quality Assurance**: Comprehensive testing and validation workflows
- **Security Validation**: Security testing, vulnerability assessment, compliance
- **Performance Testing**: Load testing, optimization validation, benchmarking
- **Constitutional Compliance**: AI ethics validation, decision quality assessment
- **Production Readiness**: Deployment validation, monitoring setup, documentation

## Auto-Activation Triggers
```yaml
bilingual_triggers:
  portuguese: ["validar", "testar", "verificar", "auditar", "revisar", "certificar"]
  english: ["validate", "test", "verify", "audit", "review", "certify"]
  
workflow_triggers:
  - "Execution phase completed with implementation artifacts"
  - "Quality gates ready for comprehensive validation"
  - "Implementation ready for production assessment"
  - "Security validation required before deployment"
  - "Performance benchmarking needed"
  
automatic_scenarios:
  - Implementation phase completed successfully
  - Quality validation triggered by execution completion
  - Production deployment preparation initiated
  - Security audit required by complexity level
  - Performance validation needed for optimization
```

## Execution Pattern

### 1. Validation Strategy Assessment
```bash
# Load execution results and determine validation scope
EXECUTION_REPORT=$(cat .claude/.cache/execution/execution-report.md)
COMPLEXITY_LEVEL=$(cat .claude/.cache/context.tmp | grep COMPLEXITY_LEVEL)
QUALITY_TARGET=$(cat .claude/.cache/routing.tmp | grep QUALITY_TARGET)

echo "🔍 Assessing validation requirements..."

# Determine validation depth based on complexity
case $COMPLEXITY_LEVEL in
    "L1-L2")
        VALIDATION_MODE="basic"
        VALIDATION_DEPTH="essential"
        ;;
    "L3-L4") 
        VALIDATION_MODE="standard"
        VALIDATION_DEPTH="comprehensive"
        ;;
    "L5-L6")
        VALIDATION_MODE="advanced"
        VALIDATION_DEPTH="thorough"
        ;;
    "L7-L8")
        VALIDATION_MODE="enterprise"
        VALIDATION_DEPTH="exhaustive"
        ;;
    "L9-L10")
        VALIDATION_MODE="critical"
        VALIDATION_DEPTH="mission_critical"
        ;;
esac
```

### 2. Multi-Dimensional Validation Framework
```bash
echo "🎯 Executing multi-dimensional validation..."

# Initialize validation workspace
VALIDATION_DIR=".claude/.cache/validation"
mkdir -p "$VALIDATION_DIR"

# Execute validation dimensions
validate_code_quality
validate_security_compliance  
validate_performance_standards
validate_constitutional_compliance
validate_production_readiness
```

## Validation Dimensions

### Code Quality Validation
```yaml
static_analysis:
  linting_validation:
    - "ESLint/TSLint zero errors for TypeScript projects"
    - "Pylint/Black compliance for Python projects"
    - "Custom linting rules for project-specific standards"
    - "Code formatting consistency validation"
    
  type_checking:
    - "TypeScript strict mode compliance"
    - "Python type hints validation with mypy"
    - "Type coverage analysis and reporting"
    - "Interface and contract validation"
    
  complexity_analysis:
    - "Cyclomatic complexity within acceptable thresholds"
    - "Code duplication analysis and refactoring recommendations"
    - "Maintainability index calculation and validation"
    - "Technical debt assessment and prioritization"

testing_validation:
  unit_testing:
    - "≥90% code coverage for L5+ complexity"
    - "≥80% code coverage for L3-L4 complexity"
    - "≥70% code coverage for L1-L2 complexity"
    - "Test quality assessment and improvement recommendations"
    
  integration_testing:
    - "API contract testing and validation"
    - "Database integration testing"
    - "External service integration validation"
    - "Cross-component integration verification"
    
  end_to_end_testing:
    - "Critical user journey validation"
    - "Cross-browser compatibility testing"
    - "Mobile responsiveness validation"
    - "Accessibility compliance testing"
```

### Security Validation
```yaml
vulnerability_assessment:
  dependency_scanning:
    - "npm audit / pip safety dependency vulnerability scanning"
    - "Automated security updates and patch management"
    - "License compliance and security verification"
    - "Supply chain security validation"
    
  static_security_analysis:
    - "SAST (Static Application Security Testing) execution"
    - "Code injection vulnerability detection"
    - "Authentication and authorization validation"
    - "Data encryption and protection verification"
    
  dynamic_security_testing:
    - "DAST (Dynamic Application Security Testing) for web applications"
    - "Penetration testing for critical systems (L7+)"
    - "API security testing and validation"
    - "Input validation and sanitization testing"

compliance_validation:
  data_protection:
    - "GDPR compliance validation for EU data processing"
    - "Privacy policy implementation and validation"
    - "Data retention and deletion policy compliance"
    - "Consent management system validation"
    
  industry_standards:
    - "SOC 2 compliance for enterprise systems"
    - "HIPAA compliance for healthcare systems"
    - "PCI DSS compliance for payment processing"
    - "ISO 27001 security management compliance"
```

### Performance Validation
```yaml
performance_testing:
  load_testing:
    - "Expected load capacity testing and validation"
    - "Stress testing to identify breaking points"
    - "Spike testing for traffic surge handling"
    - "Volume testing for large data processing"
    
  performance_benchmarking:
    - "Response time benchmarks (API <100ms, Page load <2s)"
    - "Throughput capacity measurement and optimization"
    - "Resource utilization analysis and optimization"
    - "Scalability testing and validation"
    
  optimization_validation:
    - "Bundle size optimization and validation"
    - "Database query optimization and indexing"
    - "Caching strategy effectiveness validation"
    - "CDN and asset optimization verification"

monitoring_setup:
  observability:
    - "Application performance monitoring (APM) setup"
    - "Error tracking and alerting configuration"
    - "Business metrics and KPI tracking"
    - "Infrastructure monitoring and alerting"
    
  logging_validation:
    - "Structured logging implementation and validation"
    - "Log aggregation and analysis setup"
    - "Security event logging and monitoring"
    - "Audit trail completeness and integrity"
```

### Constitutional AI Compliance
```yaml
decision_validation:
  constitutional_analysis:
    - "Implementation decisions constitutional compliance review"
    - "Multi-perspective stakeholder impact assessment"
    - "Ethical AI implementation validation (if applicable)"
    - "Bias detection and mitigation validation"
    
  quality_framework_compliance:
    - "Progressive quality standards achievement validation"
    - "Constitutional principle adherence verification"
    - "Risk assessment and mitigation effectiveness"
    - "Continuous improvement integration validation"
    
pattern_optimization:
  success_pattern_analysis:
    - "Implementation pattern effectiveness analysis"
    - "Quality improvement pattern identification"
    - "Performance optimization pattern validation"
    - "Best practice adherence pattern recognition"
```

## Progressive Validation Standards

### L1-L2 Basic Validation
```yaml
validation_scope: "Essential quality and security validation"
quality_target: "≥9.0/10"
validation_time: "< 30 minutes"

validation_checklist:
  - "Code quality: Basic linting and formatting"
  - "Testing: Core functionality testing"
  - "Security: Basic vulnerability scanning"
  - "Performance: Basic performance verification"
  - "Documentation: Essential documentation validation"
```

### L3-L4 Standard Validation
```yaml
validation_scope: "Comprehensive quality, security, and performance validation"
quality_target: "≥9.2/10"
validation_time: "< 60 minutes"

validation_checklist:
  - "Code quality: Comprehensive static analysis"
  - "Testing: Unit and integration testing"
  - "Security: Vulnerability assessment and compliance"
  - "Performance: Load testing and optimization"
  - "Documentation: Complete documentation validation"
```

### L5-L6 Advanced Validation
```yaml
validation_scope: "Thorough validation with enterprise standards"
quality_target: "≥9.5/10"
validation_time: "< 120 minutes"

validation_checklist:
  - "Code quality: Advanced analysis and complexity validation"
  - "Testing: Full testing suite with high coverage"
  - "Security: Comprehensive security audit"
  - "Performance: Advanced performance testing and optimization"
  - "Documentation: Enterprise documentation standards"
  - "Compliance: Industry standard compliance validation"
```

### L7-L8 Enterprise Validation
```yaml
validation_scope: "Enterprise-grade validation with comprehensive compliance"
quality_target: "≥9.7/10"
validation_time: "< 180 minutes"

validation_checklist:
  - "Code quality: Enterprise static analysis and governance"
  - "Testing: Enterprise testing with chaos engineering"
  - "Security: Enterprise security audit and penetration testing"
  - "Performance: Enterprise performance validation and capacity planning"
  - "Documentation: Enterprise documentation and governance"
  - "Compliance: Full compliance audit and certification"
```

### L9-L10 Critical Validation
```yaml
validation_scope: "Mission-critical validation with maximum compliance"
quality_target: "≥9.9/10"
validation_time: "< 240 minutes"

validation_checklist:
  - "Code quality: Mission-critical quality governance"
  - "Testing: Mission-critical testing with fault injection"
  - "Security: Maximum security validation and certification"
  - "Performance: Mission-critical performance and disaster recovery"
  - "Documentation: Mission-critical documentation and audit trails"
  - "Compliance: Maximum compliance and regulatory validation"
```

## MCP Integration for Validation

### Apex-QA-Debugger Agent (Primary)
```yaml
specialization: "Advanced debugging and comprehensive quality assurance"
validation_responsibilities:
  - "Quality gate enforcement and validation"
  - "Testing strategy execution and reporting"
  - "Performance testing and benchmarking"
  - "Security testing and vulnerability assessment"
  - "Production readiness certification"
```

### Sequential Thinking (Complex Validation)
```yaml
systematic_validation:
  - "Multi-dimensional validation strategy analysis"
  - "Quality gate optimization and enhancement"
  - "Risk assessment and mitigation validation"
  - "Performance optimization strategy validation"
  - "Constitutional compliance verification"
```

### Context7 (Standards Validation)
```yaml
standards_verification:
  - "Framework best practice compliance validation"
  - "Security standard adherence verification"
  - "Performance benchmark validation"
  - "Documentation standard compliance"
```

## Validation Automation

### Automated Testing Pipeline
```bash
# Automated validation pipeline
echo "🤖 Executing automated validation pipeline..."

cat > "$VALIDATION_DIR/validation-pipeline.sh" << 'EOF'
#!/bin/bash
# Comprehensive validation automation

set -e

echo "Starting comprehensive validation pipeline..."

# Code Quality Validation
echo "1. Code Quality Validation"
if command -v pnpm &> /dev/null; then
    pnpm run lint || exit 1
    pnpm run typecheck || exit 1
    pnpm run test:coverage || exit 1
elif command -v npm &> /dev/null; then
    npm run lint || exit 1
    npm run typecheck || exit 1
    npm run test:coverage || exit 1
elif command -v python &> /dev/null; then
    python -m pylint src/ || exit 1
    python -m mypy src/ || exit 1
    python -m pytest --cov=src --cov-report=html || exit 1
fi

# Security Validation
echo "2. Security Validation"
if command -v pnpm &> /dev/null; then
    pnpm audit --audit-level=moderate || exit 1
elif command -v npm &> /dev/null; then
    npm audit --audit-level=moderate || exit 1
elif command -v pip &> /dev/null; then
    pip-audit || exit 1
fi

# Performance Validation
echo "3. Performance Validation"
if [ -f "package.json" ]; then
    if command -v pnpm &> /dev/null; then
        pnpm run build
        pnpm run test:performance || echo "Performance tests not configured"
    elif command -v npm &> /dev/null; then
        npm run build
        npm run test:performance || echo "Performance tests not configured"
    fi
fi

# Documentation Validation
echo "4. Documentation Validation"
if [ -f "README.md" ]; then
    echo "✅ README.md exists"
else
    echo "❌ README.md missing"
    exit 1
fi

echo "✅ Validation pipeline completed successfully"
EOF

chmod +x "$VALIDATION_DIR/validation-pipeline.sh"
```

## Deliverables

### 1. Comprehensive Validation Report
```markdown
# Validation Report

## Executive Summary
- **Validation Mode**: [Basic/Standard/Advanced/Enterprise/Critical]
- **Quality Achievement**: [Final score vs. target]
- **Validation Status**: [Pass/Conditional Pass/Fail]
- **Production Readiness**: [Ready/Needs Improvements/Not Ready]

## Validation Results by Dimension

### Code Quality Validation
- **Static Analysis**: [Results and score]
- **Type Checking**: [Coverage and compliance]
- **Complexity Analysis**: [Metrics and recommendations]
- **Testing Coverage**: [Coverage percentage and quality]

### Security Validation
- **Vulnerability Assessment**: [Critical/High/Medium/Low findings]
- **Compliance Validation**: [Standards met and gaps identified]
- **Security Testing**: [Results and recommendations]

### Performance Validation
- **Load Testing**: [Results and capacity analysis]
- **Performance Benchmarks**: [Metrics vs. targets]
- **Optimization Validation**: [Effectiveness and recommendations]

### Constitutional Compliance
- **Decision Quality**: [Constitutional compliance assessment]
- **Pattern Validation**: [Success patterns and optimizations]
- **Risk Mitigation**: [Effectiveness and recommendations]

## Recommendations
1. **Critical Issues**: [Must-fix issues for production]
2. **Quality Improvements**: [Optimization opportunities]
3. **Security Enhancements**: [Security strengthening recommendations]
4. **Performance Optimizations**: [Performance improvement opportunities]

## Production Readiness Checklist
- [ ] All quality gates passed
- [ ] Security validation completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Deployment procedures validated
```

### 2. Quality Certification
```yaml
certification_levels:
  basic_certification: "L1-L2 projects meeting ≥9.0/10 standards"
  standard_certification: "L3-L4 projects meeting ≥9.2/10 standards"
  advanced_certification: "L5-L6 projects meeting ≥9.5/10 standards"
  enterprise_certification: "L7-L8 projects meeting ≥9.7/10 standards"
  critical_certification: "L9-L10 projects meeting ≥9.9/10 standards"
  
certification_includes:
  - "Quality metrics and achievement verification"
  - "Security compliance and validation"
  - "Performance benchmarks and optimization"
  - "Constitutional compliance verification"
  - "Production readiness certification"
```

## Bilingual Support

### Portuguese Validation Commands
- **`/validar`** - Validação abrangente de qualidade
- **`/testar`** - Execução de testes e validação
- **`/auditar`** - Auditoria completa de segurança e qualidade
- **`/certificar`** - Certificação de prontidão para produção

### English Validation Commands
- **`/validate`** - Comprehensive quality validation
- **`/test`** - Testing and validation execution
- **`/audit`** - Complete security and quality audit
- **`/certify`** - Production readiness certification

## Success Metrics

### Validation Effectiveness
- **Quality Achievement**: Quality targets met or exceeded for complexity level
- **Security Compliance**: Zero critical/high security vulnerabilities
- **Performance Standards**: Performance benchmarks achieved
- **Production Readiness**: Complete validation and certification achieved

### Constitutional Validation
- **Decision Quality**: All implementation decisions constitutionally compliant
- **Pattern Optimization**: Success patterns identified and optimized
- **Risk Mitigation**: Comprehensive risk assessment and effective mitigation
- **Continuous Improvement**: Quality improvement recommendations provided

---

## Ready for Validation

Comprehensive validation system activated. The validation phase will:

✅ **Execute multi-dimensional validation** across quality, security, performance, and compliance  
✅ **Enforce progressive quality standards** appropriate for project complexity level  
✅ **Validate constitutional compliance** with AI ethics and decision quality assessment  
✅ **Certify production readiness** with comprehensive quality and security validation  
✅ **Generate actionable insights** with optimization recommendations and improvement guidance  
✅ **Prepare delivery inputs** with validated, production-ready implementation  

**Usage**: Type `/validate` or `/validar` to begin comprehensive validation, or let the system auto-activate after execution phase completion.

The validation phase ensures every implementation meets the highest quality standards, security requirements, and constitutional compliance for confident production deployment and long-term success.