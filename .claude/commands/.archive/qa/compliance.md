# /compliance - Universal Regulatory Compliance Validation

## Command: `/compliance [module] [--regulation=lgpd|anvisa|cfm|owasp|iso27001|hipaa|all] [--audit-level=basic|comprehensive]`

### 🎯 **Purpose**
Comprehensive regulatory compliance validation for Brazilian healthcare (LGPD, ANVISA, CFM), international standards (HIPAA, GDPR, ISO27001), and industry best practices with automated regulatory audit reporting.

### 🧠 **NeonPro Compliance Intelligence**
```yaml
COMPLIANCE_INTELLIGENCE:
  activation_triggers:
    - "/compliance [module]"
    - "validate LGPD compliance"
    - "audit ANVISA procedures"
    - "check CFM requirements"
    - "regulatory compliance scan"
    - "Brazilian healthcare audit"
    - "HIPAA compliance check"
    - "GDPR validation"
    - "ISO 27001 audit"
  
  regulatory_frameworks:
    brazilian_healthcare:
      lgpd: "Lei Geral de Proteção de Dados (Brazilian GDPR)"
      anvisa: "Agência Nacional de Vigilância Sanitária"
      cfm: "Conselho Federal de Medicina"
      sus: "Sistema Único de Saúde integration requirements"
    
    international_standards:
      hipaa: "Health Insurance Portability and Accountability Act"
      gdpr: "General Data Protection Regulation"
      iso27001: "ISO/IEC 27001 Information Security Management"
      owasp: "OWASP Application Security Verification Standard"
    
  configured_detection:
    patient_data_flows: "Automatic detection of personal data processing"
    medical_procedures: "ANVISA classification and tracking validation"
    professional_licensing: "CFM medical professional requirements"
    audit_trails: "Compliance audit log generation and validation"
    data_governance: "Cross-regulatory compliance orchestration"
```

### 🚀 **Execution Flow**

#### **Phase 1: Compliance Assessment Planning**
```yaml
PLANNING:
  regulatory_scope_analysis:
    - "Identify applicable regulatory frameworks"
    - "Map data processing activities to compliance requirements"
    - "Assess current compliance posture and gaps"
    - "Define audit scope and methodology"
    - "Healthcare-specific requirement prioritization"
    
  compliance_requirements_mapping:
    brazilian_healthcare:
      - "LGPD Articles 32, 46-49 (Technical Safeguards)"
      - "ANVISA RDC 611/2022 (Medical Software)"
      - "CFM Resolution 2314/2022 (Telemedicine)"
      - "Marco Civil da Internet compliance"
    
    international_compliance:
      - "HIPAA Security and Privacy Rules"
      - "GDPR Articles 25, 32 (Privacy by Design)"
      - "ISO 27001:2022 Security Controls"
      - "NIST Cybersecurity Framework alignment"
    
  audit_strategy:
    basic: "Automated compliance checking and documentation review"
    comprehensive: "Full regulatory audit with expert validation"
```

#### **Phase 2: Multi-Regulatory Compliance Analysis**
```yaml
BRAZILIAN_HEALTHCARE_COMPLIANCE:
  lgpd_compliance:
    - "Data Controller and Processor identification"
    - "Legal basis for personal data processing validation"
    - "Consent management system audit"
    - "Data Subject Rights implementation verification"
    - "Data Protection Officer (DPO) requirements"
    - "Data breach notification procedures"
    - "Cross-border data transfer compliance"
    - "Data retention and deletion policies"
    
  anvisa_medical_device_compliance:
    - "Medical device software classification (Class I-IV)"
    - "RDC 611/2022 software lifecycle requirements"
    - "Clinical evaluation and post-market surveillance"
    - "Quality management system validation"
    - "Risk management according to ISO 14971"
    - "Usability engineering compliance (IEC 62366)"
    - "Software validation and verification"
    
  cfm_professional_standards:
    - "Medical professional licensing verification"
    - "Telemedicine practice compliance (CFM 2314/2022)"
    - "Digital prescription requirements"
    - "Patient confidentiality and medical secrecy"
    - "Electronic health record standards"
    - "Medical ethics in digital health"

INTERNATIONAL_COMPLIANCE:
  hipaa_compliance:
    - "HIPAA Security Rule (45 CFR Part 164, Subpart C)"
    - "HIPAA Privacy Rule (45 CFR Part 164, Subpart E)"
    - "Administrative, Physical, and Technical Safeguards"
    - "Business Associate Agreements (BAA)"
    - "Breach Notification Rule compliance"
    - "Patient rights and access controls"
    
  gdpr_compliance:
    - "Lawful basis for processing (Article 6)"
    - "Special categories of personal data (Article 9)"
    - "Data Protection by Design and by Default (Article 25)"
    - "Data Protection Impact Assessment (DPIA)"
    - "Records of processing activities (Article 30)"
    - "Data portability and right to be forgotten"
    
  iso27001_compliance:
    - "Information Security Management System (ISMS)"
    - "Annex A Security Controls implementation"
    - "Risk assessment and treatment process"
    - "Incident management procedures"
    - "Business continuity and disaster recovery"
    - "Supplier relationship security management"
```

#### **Phase 3: Compliance Validation & Audit**
```yaml
VALIDATION:
  automated_compliance_checking:
    - "Data flow mapping and classification"
    - "Security control implementation verification"
    - "Policy and procedure documentation audit"
    - "Technical safeguard configuration validation"
    
  manual_compliance_validation:
    - "Process and procedure effectiveness review"
    - "Staff training and awareness assessment"
    - "Incident response plan testing"
    - "Third-party vendor compliance verification"
    
  continuous_monitoring:
    - "Real-time compliance dashboard implementation"
    - "Automated policy violation detection"
    - "Compliance metric tracking and reporting"
    - "Regulatory change impact assessment"
```

### 🔧 **Regulatory Framework Coverage**

#### **Brazilian Healthcare Regulations**
```yaml
LGPD_COMPLIANCE:
  data_protection_principles:
    - "Lawfulness, fairness, and transparency"
    - "Purpose limitation and data minimization"
    - "Accuracy and storage limitation"
    - "Integrity, confidentiality, and accountability"
    
  technical_safeguards:
    - "Pseudonymization and encryption"
    - "Access control and authentication"
    - "Data integrity and confidentiality"
    - "Incident response and breach notification"
    
  organizational_measures:
    - "Data Protection Officer (DPO) designation"
    - "Privacy impact assessment procedures"
    - "Staff training and awareness programs"
    - "Vendor and third-party management"

ANVISA_MEDICAL_SOFTWARE:
  software_classification:
    - "Non-medical software (no ANVISA regulation)"
    - "Class I: Low risk medical software"
    - "Class II: Medium risk medical software"  
    - "Class III: High risk medical software"
    
  lifecycle_requirements:
    - "Software development lifecycle (IEC 62304)"
    - "Risk management process (ISO 14971)"
    - "Quality management system (ISO 13485)"
    - "Clinical evaluation requirements"
    
  post_market_surveillance:
    - "Adverse event reporting"
    - "Software update management"
    - "Performance monitoring"
    - "Corrective and preventive actions"

CFM_TELEMEDICINE:
  practice_requirements:
    - "Medical professional registration verification"
    - "Patient identification and authentication"
    - "Informed consent for telemedicine"
    - "Medical record documentation standards"
    
  technical_standards:
    - "Secure communication protocols"
    - "Data encryption and storage"
    - "Access control and audit trails"
    - "System availability and reliability"
```

#### **International Compliance Standards**
```yaml
HIPAA_SECURITY_PRIVACY:
  administrative_safeguards:
    - "Security Officer designation"
    - "Workforce training and access management"
    - "Information system access controls"
    - "Security awareness and training programs"
    
  physical_safeguards:
    - "Facility access controls"
    - "Workstation use restrictions"
    - "Device and media controls"
    - "Equipment disposal procedures"
    
  technical_safeguards:
    - "Access control and user authentication"
    - "Audit controls and integrity verification"
    - "Data transmission security"
    - "Encryption and decryption standards"

ISO27001_CONTROLS:
  security_control_categories:
    - "Information security policies (5 controls)"
    - "Organization of information security (7 controls)"
    - "Human resource security (6 controls)"
    - "Asset management (10 controls)"
    - "Access control (14 controls)"
    - "Cryptography (2 controls)"
    - "Physical and environmental security (15 controls)"
    - "Operations security (14 controls)"
    - "Communications security (7 controls)"
    - "System acquisition, development and maintenance (13 controls)"
    - "Supplier relationships (5 controls)"
    - "Information security incident management (7 controls)"
    - "Business continuity management (4 controls)"
    - "Compliance (2 controls)"
```

### 📊 **Compliance Assessment Levels**

#### **Basic Compliance Check (L1-L3)**
```yaml
BASIC_COMPLIANCE:
  scope: "Automated compliance scanning and documentation review"
  time_investment: "1-2 hours"
  automated_tools: "Policy checkers, configuration audits, documentation review"
  deliverables:
    - "Compliance status dashboard"
    - "High-priority gap identification"
    - "Basic remediation recommendations"
    - "Regulatory requirement mapping"
  
  quality_standard: "≥85% regulatory requirement coverage"
```

#### **Comprehensive Compliance Audit (L4-L10)**
```yaml
COMPREHENSIVE_COMPLIANCE:
  scope: "Full regulatory audit with expert validation"
  time_investment: "8-20+ hours"
  expert_analysis: "Professional compliance assessment methodology"
  deliverables:
    - "Executive compliance summary and detailed report"
    - "Compliance gap analysis and remediation roadmap"
    - "Regulatory certification readiness assessment"
    - "Continuous monitoring implementation plan"
  
  quality_standard: "≥95% compliance validation with certification readiness"
```

### 🤝 **MCP Integration**

- **Desktop-Commander**: Local compliance documentation and configuration analysis
- **Sequential-Thinking**: Complex regulatory requirement analysis and mapping
- **Context7**: Regulatory framework documentation and official guidance
- **Tavily**: Latest regulatory updates and compliance best practices

### 🔍 **Usage Examples**

```bash
# Quick LGPD compliance check
/compliance patient-portal --regulation=lgpd --audit-level=basic

# Comprehensive Brazilian healthcare audit
/compliance medical-system --regulation=all --audit-level=comprehensive

# HIPAA compliance validation
/compliance patient-data --regulation=hipaa --audit-level=comprehensive

# Multi-regulatory compliance assessment
/compliance healthcare-platform --regulation=lgpd,hipaa,iso27001 --audit-level=comprehensive

# ANVISA medical device compliance
/compliance medical-device --regulation=anvisa --audit-level=comprehensive
```

### 📋 **Compliance Assessment Deliverables**

#### **1. Executive Compliance Report**
```markdown
# Regulatory Compliance Assessment Report

## Executive Summary
- **Assessment Scope**: [Applications/Systems assessed]
- **Regulatory Frameworks**: [LGPD/ANVISA/CFM/HIPAA/GDPR/ISO27001]
- **Compliance Status**: [Overall percentage and certification readiness]
- **Critical Gaps**: [High-priority compliance violations]
- **Certification Timeline**: [Readiness for regulatory certification]

## Compliance Dashboard
### Brazilian Healthcare Compliance
- LGPD Compliance: 92% (8 minor gaps identified)
- ANVISA Class II Medical Software: 88% (Documentation updates needed)
- CFM Telemedicine Standards: 96% (Minor technical requirements)

### International Standards
- HIPAA Security & Privacy Rules: 94% (2 technical safeguards missing)
- ISO 27001 Controls: 91% (Access control improvements needed)
```

#### **2. Detailed Compliance Matrix**
```yaml
compliance_status:
  lgpd_articles:
    article_32_technical_safeguards: "compliant"
    article_46_data_processing_records: "non_compliant - Missing DPO logs"
    article_48_breach_notification: "compliant"
    
  anvisa_rdc_611:
    software_classification: "compliant - Class II confirmed"
    lifecycle_documentation: "non_compliant - Risk management gaps"
    clinical_evaluation: "compliant"
    
  hipaa_security_rule:
    administrative_safeguards: "compliant"
    physical_safeguards: "compliant"
    technical_safeguards: "non_compliant - Encryption key management"
```

### 🎯 **Success Criteria**

```yaml
COMPLIANCE_VALIDATION:
  regulatory_coverage: "≥95% of applicable requirements validated"
  gap_identification: "Complete compliance gap analysis"
  remediation_guidance: "Actionable compliance improvement roadmap"
  certification_readiness: "Clear path to regulatory certification"
  continuous_monitoring: "Ongoing compliance maintenance strategy"
  multi_regulatory_alignment: "Cross-framework compliance optimization"
```

### 🏥 **Healthcare Compliance Specialization**

- ✅ **LGPD Data Protection**: Complete personal data protection compliance
- ✅ **ANVISA Medical Devices**: Medical software regulatory compliance
- ✅ **CFM Professional Standards**: Medical practice digital health compliance
- ✅ **HIPAA Healthcare Privacy**: International healthcare privacy standards
- ✅ **Cross-Border Data**: International healthcare data transfer compliance
- ✅ **Audit Readiness**: Regulatory inspection and certification preparation

---

**Status**: 🟢 **Universal Compliance Command** | **Frameworks**: LGPD + ANVISA + CFM + HIPAA + GDPR + ISO27001 | **Certification**: ✅ Audit Ready | **Monitoring**: Continuous Compliance

**Ready for Regulatory Compliance**: Comprehensive multi-regulatory compliance validation with Brazilian healthcare specialization and international standards alignment.