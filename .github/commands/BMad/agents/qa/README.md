# QA Command Templates for NeonPro Brownfield Testing

## 📋 Command Templates Overview

This directory contains standardized templates for NeonPro's brownfield testing commands. Each template corresponds to a specific stage in the Test Architect workflow and includes healthcare-specific validation requirements.

## 🔧 Template Usage

### Risk Assessment Template (`*risk` command)
```bash
# Usage: @qa *risk "{epic}.{story-name}"
# Output: docs/qa/assessments/{epic}.{story}-risk-{YYYYMMDD}.md
```

### Test Design Template (`*design` command)  
```bash
# Usage: @qa *design "{epic}.{story-name}"
# Output: docs/qa/assessments/{epic}.{story}-test-design-{YYYYMMDD}.md
```

### Requirements Traceability Template (`*trace` command)
```bash
# Usage: @qa *trace "{epic}.{story-name}"
# Output: docs/qa/assessments/{epic}.{story}-trace-{YYYYMMDD}.md
```

### Non-Functional Requirements Template (`*nfr` command)
```bash
# Usage: @qa *nfr "{epic}.{story-name}"
# Output: docs/qa/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md
```

### Comprehensive Review Template (`*review` command)
```bash
# Usage: @qa *review "{completed-story}"
# Output: QA Results section in story file + docs/qa/gates/{epic}.{story}-{slug}.yml
```

### Quality Gate Template (`*gate` command)
```bash
# Usage: @qa *gate "{reviewed-story}"
# Output: Updated docs/qa/gates/{epic}.{story}-{slug}.yml
```

## 🏥 Healthcare-Specific Requirements

### Mandatory Validations for All Commands
- **Patient Data Integrity**: Verify no existing healthcare data is compromised
- **LGPD Compliance**: Ensure AI processing respects patient privacy
- **ANVISA Standards**: Validate medical device compliance for AI features
- **CFM Ethics**: Confirm AI assistance within professional medical guidelines
- **Performance Baseline**: Maintain <2s dashboard load time requirement

### Risk Scoring Healthcare Context
```yaml
Healthcare Criticality Multipliers:
  Patient_Data_Systems: 3.0      # Patient registration, records, history
  Appointment_Management: 2.5    # Scheduling, calendar, availability
  Compliance_Reporting: 2.5      # LGPD/ANVISA/CFM regulatory features
  Real_Time_Features: 2.0        # Live dashboards, notifications, updates
  AI_Integration_Points: 2.0     # New AI features touching existing systems
  UI_UX_Healthcare: 1.5          # Healthcare professional interface changes
  Documentation_Only: 1.0        # Non-functional documentation updates
```

## 📁 Directory Structure

```
docs/qa/
├── assessments/                 # Individual assessment reports
│   ├── {epic}.{story}-risk-{date}.md
│   ├── {epic}.{story}-test-design-{date}.md
│   ├── {epic}.{story}-trace-{date}.md
│   └── {epic}.{story}-nfr-{date}.md
├── gates/                       # Quality gate decisions
│   └── {epic}.{story}-{slug}.yml
└── templates/                   # Reusable assessment templates
    ├── risk-assessment.md
    ├── test-design.md
    ├── requirements-trace.md
    ├── nfr-validation.md
    ├── comprehensive-review.md
    └── quality-gate.yml
```

## 🎯 Template Categories

### Pre-Development Assessment Templates
- **Risk Assessment**: Brownfield integration risk analysis
- **Test Design**: Comprehensive strategy covering regression and new features

### Development Validation Templates  
- **Requirements Traceability**: Coverage verification for existing and new functionality
- **NFR Validation**: Non-functional requirements maintenance verification

### Post-Development Review Templates
- **Comprehensive Review**: Deep integration analysis with improvement recommendations
- **Quality Gate**: Final go/no-go decisions with documented rationale

## 🚨 Critical Healthcare Safeguards

### Before Using Any Template
1. **Verify Healthcare Context**: Confirm understanding of affected healthcare workflows
2. **Check Compliance Requirements**: Identify LGPD/ANVISA/CFM implications
3. **Establish Performance Baseline**: Document current system metrics
4. **Plan Rollback Strategy**: Ensure emergency procedures are ready

### Template Customization Guidelines
- **Always Include Healthcare Impact**: Every template must address patient workflow implications
- **Maintain Compliance Focus**: LGPD/ANVISA/CFM considerations in every assessment
- **Performance Consciousness**: Include <2s dashboard load time in all evaluations
- **Rollback Readiness**: Document emergency procedures in every template

## 📋 Quality Standards

### Template Completeness Requirements
- **Healthcare Risk Assessment**: Mandatory for all patient-touching features
- **Regulatory Compliance Review**: Required for any data processing changes
- **Performance Impact Analysis**: Necessary for all UI/UX or API modifications
- **Rollback Procedure Documentation**: Essential for all production deployments

### Documentation Quality Gates
- **Technical Accuracy**: All healthcare business rules correctly understood
- **Compliance Precision**: LGPD/ANVISA/CFM requirements accurately interpreted  
- **Risk Calibration**: Scoring reflects true healthcare criticality
- **Actionable Recommendations**: Clear next steps for issue resolution

## 🔄 Template Evolution

### Continuous Improvement Process
1. **Usage Analytics**: Track which templates prevent the most issues
2. **Healthcare Feedback**: Incorporate medical professional input
3. **Compliance Updates**: Evolve templates with regulatory changes
4. **Performance Learning**: Refine based on actual performance impact data

### Template Versioning
- **Version Control**: All templates tracked in git with changelog
- **Backward Compatibility**: Ensure existing assessments remain valid
- **Migration Guidance**: Clear upgrade paths for template improvements
- **Archive Strategy**: Preserve historical assessment formats

---

**Key Principle**: These templates are your brownfield safety net. Use them to ensure NeonPro's AI transformation never compromises existing healthcare functionality while enabling revolutionary patient care improvements.