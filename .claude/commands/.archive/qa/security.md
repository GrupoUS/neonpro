# /security - Universal Security & Data Protection Command

## Command: `/security [target] [--depth=surface|deep|comprehensive] [--standards=owasp|nist|iso27001] [--healthcare]`

### 🎯 **Purpose**
Comprehensive security analysis with vulnerability detection, compliance validation, patient data protection, and automated remediation guidance for any technology stack with specialized healthcare security protocols.

### 🧠 **Intelligence Integration**
```yaml
SECURITY_INTELLIGENCE:
  activation_triggers:
    - "/security [component]"
    - "vulnerability scan [target]"
    - "security audit [system]"
    - "penetration test [application]"
    - "patient data security [module]"
    - "data protection audit [system]"
  
  context_detection:
    scan_depth: "Surface, deep, or comprehensive analysis"
    security_standards: "OWASP, NIST, ISO 27001, CIS Controls"
    technology_stack: "Auto-detect frameworks and identify attack vectors"
    threat_modeling: "Application-specific threat landscape analysis"
    healthcare_mode: "LGPD, HIPAA, patient data protection protocols"
    data_classification: "Personal, sensitive, medical data detection"
```

### 🚀 **Execution Flow**

#### **Phase 1: Security Assessment Planning**
```yaml
PLANNING:
  threat_modeling:
    - "Identify application assets and data flows"
    - "Map patient data touchpoints and processing"
    - "Catalog data classification levels and sensitivity"
    - "Define attack surface and entry points"
    - "Healthcare-specific threat landscape analysis"
    
  security_requirements:
    general: "OWASP Top 10, CIS Controls, NIST Framework"
    healthcare: "LGPD Art. 32 technical safeguards, HIPAA Security Rule"
    compliance: "Data encryption, access controls, audit logging"
    
  assessment_strategy:
    surface: "Automated vulnerability scanning and basic security checks"
    deep: "Manual testing, configuration review, code analysis"
    comprehensive: "Full penetration testing, threat modeling, compliance audit"
```

#### **Phase 2: Multi-Layer Security Analysis**
```yaml
VULNERABILITY_SCANNING:
  automated_security_testing:
    - "OWASP ZAP/Burp Suite integration for web application scanning"
    - "Dependency vulnerability scanning (npm audit, Snyk, OWASP Dependency Check)"
    - "Infrastructure scanning (Nessus, OpenVAS patterns)"
    - "Database security assessment (SQL injection, privilege escalation)"
    
  healthcare_specific_scanning:
    - "Patient data exposure detection"
    - "PHI (Protected Health Information) access control validation"
    - "Medical device communication security"
    - "LGPD consent management validation"
    
  code_security_analysis:
    - "Static Application Security Testing (SAST)"
    - "Dynamic Application Security Testing (DAST)"
    - "Interactive Application Security Testing (IAST)"
    - "Software Composition Analysis (SCA)"
```

#### **Phase 3: Data Protection Validation**
```yaml
DATA_PROTECTION:
  patient_data_security:
    - "PII/PHI identification and classification"
    - "Data encryption at rest and in transit validation"
    - "Access control and role-based permissions audit"
    - "Data retention and disposal policy compliance"
    
  privacy_compliance:
    - "LGPD Article 32 technical safeguards validation"
    - "HIPAA Security Rule compliance assessment"
    - "Data processing consent management verification"
    - "Cross-border data transfer security validation"
    
  audit_trail_verification:
    - "Comprehensive activity logging validation"
    - "User access and modification tracking"
    - "Data breach detection and response procedures"
    - "Incident response plan effectiveness testing"
```

### 🔧 **Security Testing Categories**

#### **Web Application Security**
```yaml
WEB_APPLICATION_TESTING:
  owasp_top_10:
    - "Injection attacks (SQL, NoSQL, LDAP, OS Command)"
    - "Broken authentication and session management"
    - "Sensitive data exposure"
    - "XML External Entities (XXE)"
    - "Broken access control"
    - "Security misconfiguration"
    - "Cross-site scripting (XSS)"
    - "Insecure deserialization"
    - "Using components with known vulnerabilities"
    - "Insufficient logging and monitoring"
    
  healthcare_specific_web_security:
    - "Patient portal authentication security"
    - "Medical record access control validation"
    - "Prescription system security assessment"
    - "Telemedicine platform security testing"
```

#### **Infrastructure Security**
```yaml
INFRASTRUCTURE_TESTING:
  network_security:
    - "Network segmentation and isolation"
    - "Firewall configuration and rule validation"
    - "VPN and remote access security"
    - "Wireless network security assessment"
    
  server_security:
    - "Operating system hardening validation"
    - "Service configuration security"
    - "Patch management assessment"
    - "Backup and recovery security"
    
  cloud_security:
    - "AWS/Azure/GCP security configuration"
    - "Container and orchestration security"
    - "Serverless function security"
    - "Cloud storage and database security"
```

#### **Healthcare-Specific Security**
```yaml
HEALTHCARE_SECURITY:
  patient_data_protection:
    - "PHI access control and authorization"
    - "Medical record integrity verification"
    - "Patient consent management validation"
    - "Data anonymization and pseudonymization"
    
  medical_device_security:
    - "IoMT (Internet of Medical Things) security"
    - "Medical device communication protocols"
    - "Device authentication and authorization"
    - "Firmware security and update management"
    
  regulatory_compliance:
    - "LGPD (Lei Geral de Proteção de Dados) compliance"
    - "ANVISA medical device security requirements"
    - "CFM digital health security standards"
    - "International standards (HIPAA, GDPR) alignment"
```

### 📊 **Security Assessment Levels**

#### **Surface Level Security (L1-L3)**
```yaml
SURFACE_SECURITY:
  scope: "Basic vulnerability scanning and configuration review"
  time_investment: "30-60 minutes"
  automated_tools: "OWASP ZAP, npm audit, basic configuration checks"
  deliverables:
    - "Vulnerability summary report"
    - "High and critical findings prioritization"
    - "Basic remediation recommendations"
    - "Healthcare compliance quick check"
  
  quality_standard: "≥8.0/10 coverage of critical vulnerabilities"
```

#### **Deep Security Assessment (L4-L6)**
```yaml
DEEP_SECURITY:
  scope: "Comprehensive testing with manual verification"
  time_investment: "2-4 hours"
  testing_approach: "Automated + manual testing, code review"
  deliverables:
    - "Detailed security assessment report"
    - "Threat model and attack path analysis"
    - "Comprehensive remediation roadmap"
    - "Healthcare compliance detailed validation"
  
  quality_standard: "≥9.0/10 security coverage with verification"
```

#### **Comprehensive Security Audit (L7-L10)**
```yaml
COMPREHENSIVE_SECURITY:
  scope: "Full penetration testing and compliance audit"
  time_investment: "6-12+ hours"
  expert_analysis: "Professional security assessment methodology"
  deliverables:
    - "Executive security summary and technical report"
    - "Complete threat landscape and risk assessment"
    - "Compliance certification readiness report"
    - "Long-term security strategy recommendations"
  
  quality_standard: "≥9.5/10 enterprise-grade security validation"
```

### 🤝 **MCP Integration**

- **Desktop-Commander**: Local security scanning and file analysis
- **Sequential-Thinking**: Complex threat modeling and risk analysis
- **Context7**: Security framework documentation and best practices
- **Tavily**: Latest vulnerability research and threat intelligence

### 🔍 **Usage Examples**

```bash
# Quick security scan
/security api --depth=surface

# Comprehensive healthcare application audit
/security patient-portal --depth=comprehensive --healthcare --standards=owasp

# Database security assessment
/security database --depth=deep --standards=nist

# Full application penetration test
/security webapp --depth=comprehensive --standards=iso27001

# Healthcare-specific patient data security
/security patient-data --healthcare --depth=deep
```

### 🏥 **Healthcare Security Standards**

#### **LGPD (Lei Geral de Proteção de Dados) Validation**
- ✅ **Data Processing Consent**: Verify consent management systems
- ✅ **Data Minimization**: Validate minimal data collection practices
- ✅ **Purpose Limitation**: Ensure data used only for stated purposes
- ✅ **Storage Limitation**: Verify data retention and deletion policies
- ✅ **Data Security**: Technical and organizational security measures
- ✅ **Data Subject Rights**: Validate access, rectification, and erasure capabilities

#### **Medical Device Security Standards**
- ✅ **ANVISA Compliance**: Brazilian medical device software standards
- ✅ **IEC 62304**: Medical device software lifecycle compliance
- ✅ **ISO 14155**: Clinical investigation of medical devices
- ✅ **FDA Cybersecurity**: Medical device cybersecurity guidelines

### 📋 **Security Assessment Deliverables**

#### **1. Executive Security Summary**
```markdown
# Security Assessment Report

## Executive Summary
- **Assessment Scope**: [Application/Infrastructure components]
- **Security Level**: [L1-L10 complexity assessment]
- **Standards Compliance**: [OWASP/NIST/ISO27001/Healthcare]
- **Critical Findings**: [Number and severity of vulnerabilities]
- **Healthcare Compliance**: [LGPD/ANVISA/CFM status]

## Risk Assessment
### High Risk Findings
- Vulnerability details and potential impact
- Patient data exposure risks (if applicable)
- Regulatory compliance violations

### Medium Risk Findings
- Security improvements and hardening opportunities
- Compliance gaps and remediation steps

### Low Risk Findings
- Best practice recommendations
- Monitoring and maintenance improvements
```

#### **2. Technical Security Report**
```yaml
vulnerability_details:
  critical_findings:
    - vulnerability_type: "SQL Injection"
      affected_component: "Patient search API"
      cvss_score: 9.1
      remediation: "Parameterized queries implementation"
      
  compliance_status:
    lgpd_compliance: "85% - Missing consent audit trail"
    owasp_compliance: "92% - XSS prevention needs improvement"
    data_encryption: "100% - All patient data encrypted"
```

### 🎯 **Success Criteria**

```yaml
SECURITY_VALIDATION:
  vulnerability_coverage: "≥95% of critical and high vulnerabilities identified"
  compliance_validation: "Full regulatory requirement coverage"
  healthcare_privacy: "100% patient data protection validation"
  remediation_guidance: "Actionable fix recommendations provided"
  risk_assessment: "Comprehensive threat impact analysis"
  audit_readiness: "Compliance certification preparation complete"
```

---

**Status**: 🟢 **Universal Security Command** | **Standards**: OWASP + NIST + ISO27001 | **Healthcare**: ✅ LGPD + ANVISA + CFM | **Assessment**: Surface → Deep → Comprehensive

**Ready for Security Assessment**: Comprehensive security testing with healthcare-specific patient data protection and regulatory compliance validation.