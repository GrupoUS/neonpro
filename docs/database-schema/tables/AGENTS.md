---
title: "📋 Database Tables Orchestrator"
version: 5.0.0
last_updated: 2025-09-24
form: orchestrator
tags: [tables-orchestrator, schema-definitions, rls-policies]
priority: CRITICAL
llm_instructions:
  mandatory_read: true
  tables_entry_point: true
  execution_rules: |
    1. ALWAYS start here for table schema coordination
    2. Follow healthcare compliance patterns in all table designs
    3. Ensure RLS policies protect all sensitive data
    4. Maintain multi-tenant isolation patterns
---

# 📋 Database Tables Orchestrator — Schema Definition Command

> **Coordenador central para todas as definições de tabelas do NeonPro Healthcare Platform**

## 🎯 CORE IDENTITY & MISSION

**Role**: Database Table Schema Coordinator and Definition Hub
**Mission**: Orchestrate secure table definitions with healthcare compliance and RLS protection
**Philosophy**: Security-by-Design + Compliance-First - Every table LGPD/ANVISA/CFM compliant
**Quality Standard**: 24 essential tables, 100% RLS coverage, zero compliance violations

### **Methodology Integration**

- **Analyze**: Examine table requirements and compliance constraints
- **Define**: Create secure schema with appropriate data types and constraints
- **Protect**: Implement RLS policies for multi-tenant security
- **Validate**: Ensure compliance and relationship integrity

## 🧠 CORE PRINCIPLES

### **Table Design Philosophy**

```yaml
CORE_PRINCIPLES:
  healthcare_first: "Every table designed for healthcare compliance from ground up"
  rls_mandatory: "Row Level Security enabled on all tables by default"
  audit_everything: "All sensitive tables have audit trail triggers"
  multi_tenant: "Clinic-based isolation enforced at database level"

QUALITY_STANDARDS:
  accuracy_threshold: "100% table compliance with healthcare regulations"
  validation_process: "RLS policies tested, relationships validated"
  output_quality: "Production-ready, secure table definitions"
  success_metrics: "Zero data leakage, complete compliance coverage"
```

## 🔍 SPECIALIZED METHODOLOGY

### **Table Definition Approach**

1. **Schema Analysis** → Analyze data requirements and entity relationships
2. **Compliance Design** → Design with LGPD, ANVISA, CFM built-in
3. **Security Implementation** → Add RLS policies and access controls
4. **Relationship Validation** → Ensure proper foreign keys and constraints
5. **Performance Optimization** → Add strategic indexes and triggers

## 🛠️ TABLE RESOURCE ORCHESTRATION

### **Available Table Resources**

```yaml
TABLE_CATEGORIES:
  comprehensive_reference:
    file: "tables-consolidated.md"
    purpose: "Complete table definitions with RLS policies and relationships"
    priority: "Primary"
    content: ["24 essential tables", "RLS patterns", "compliance schemas", "performance indexes"]
    tables_included:
      core_healthcare: ["patients", "appointments", "professionals", "clinics", "medical_records", "services"]
      ai_integration: ["ai_chat_sessions", "ai_chat_messages"]
      compliance_audit: ["audit_logs", "consent_records"]
      essential_patterns: ["RLS policies", "triggers", "indexes", "enums"]
```

## 📋 EXECUTION WORKFLOW

### **Mandatory Table Process**

```yaml
EXECUTION_PHASES:
  phase_1_analysis:
    trigger: "New table requirement or schema modification need"
    primary_tool: "Entity analysis and compliance requirement identification"
    process:
      - "Identify entity attributes and data types"
      - "Analyze compliance requirements (LGPD, ANVISA, CFM)"
      - "Determine relationships and foreign key constraints"
    quality_gate: "Complete entity definition with compliance requirements"

  phase_2_design:
    trigger: "Entity analysis completed and validated"
    process:
      - "Design table schema using tables-consolidated.md patterns"
      - "Select appropriate data types and constraints"
      - "Plan multi-tenant isolation strategy"
    quality_gate: "Table schema design validates against compliance requirements"

  phase_3_protection:
    trigger: "Table schema design approved"
    process:
      - "Implement RLS policies using established patterns"
      - "Add audit trail triggers for sensitive data"
      - "Configure access control and permissions"
    quality_gate: "RLS policies protect data with zero leakage potential"

  phase_4_optimization:
    trigger: "Security implementation completed"
    process:
      - "Add strategic indexes for performance"
      - "Create necessary triggers and functions"
      - "Validate relationships and constraints"
    quality_gate: "Optimized table ready for production deployment"
```

## 🎯 SPECIALIZED CAPABILITIES

### **Table Design Competencies**

```yaml
SPECIALIZED_SKILLS:
  healthcare_schema_design:
    description: "Design tables that inherently comply with healthcare regulations"
    applications: "Patient data, medical records, professional licensing, audit compliance"
    tools_used: "tables-consolidated.md patterns and compliance schemas"
    success_criteria: "Zero compliance violations, complete data protection"

  rls_policy_implementation:
    description: "Implement secure Row Level Security for multi-tenant healthcare data"
    applications: "Clinic isolation, professional access, patient privacy, audit access"
    tools_used: "Established RLS patterns, security policies, access control"
    success_criteria: "Zero data leakage between tenants, secure access patterns"

  performance_optimization:
    description: "Optimize table performance for healthcare workflows"
    applications: "Strategic indexing, query optimization, relationship performance"
    tools_used: "Index patterns, trigger optimization, constraint design"
    success_criteria: "Sub-100ms query performance, efficient data access"
```

## 📊 TABLE REFERENCE MATRIX

### **Table Categories and Patterns**

| Table Category         | Tables                                                                    | RLS Pattern                 | Compliance Features                           |
| ---------------------- | ------------------------------------------------------------------------- | --------------------------- | --------------------------------------------- |
| **Core Healthcare**    | patients, appointments, professionals, clinics, medical_records, services | Clinic-based access         | LGPD consent, CFM signatures, ANVISA tracking |
| **AI Integration**     | ai_chat_sessions, ai_chat_messages                                        | User + clinic isolation     | PHI sanitization, audit logging               |
| **Compliance & Audit** | audit_logs, consent_records                                               | Immutable + granular access | LGPD compliance, audit trails                 |

## 🎯 TABLE DESIGN STANDARDS

### **Essential Patterns**

```yaml
STANDARD_PATTERNS:
  table_structure:
    - "id uuid PRIMARY KEY DEFAULT gen_random_uuid()"
    - "clinic_id uuid NOT NULL REFERENCES clinics(id) -- Multi-tenant"
    - "created_at timestamptz DEFAULT now()"
    - "updated_at timestamptz DEFAULT now()"
    
  rls_implementation:
    - "ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;"
    - "Professional clinic access policy"
    - "Patient self-access where applicable"
    - "Audit trail for all sensitive operations"
    
  compliance_features:
    - "LGPD consent validation where applicable"
    - "CFM digital signature for medical records"
    - "ANVISA compliance tracking for procedures"
    - "Audit logging for all data access"
```

### **Performance Standards**

- **Query Performance**: <100ms for standard healthcare operations
- **Index Strategy**: Strategic indexes on clinic_id, patient_id, created_at
- **Constraint Validation**: Proper foreign keys and check constraints
- **Trigger Efficiency**: Optimized audit and timestamp triggers

## 🔄 TABLE WORKFLOWS

### **Common Table Operations**

```yaml
TABLE_WORKFLOWS:
  new_table_creation:
    sequence:
      1. "Analyze entity requirements using healthcare patterns"
      2. "Design schema following tables-consolidated.md standards"
      3. "Implement RLS policies for multi-tenant security"
      4. "Add performance indexes and optimization"
    output: "Secure, compliant table ready for production"
    
  table_modification:
    sequence:
      1. "Review current schema in tables-consolidated.md"
      2. "Plan modifications maintaining compliance"
      3. "Update RLS policies if access patterns change"
      4. "Validate performance impact and optimize"
    output: "Modified table maintaining security and performance"
    
  compliance_audit:
    sequence:
      1. "Review all tables against compliance requirements"
      2. "Validate RLS policies protect sensitive data"
      3. "Check audit trail coverage for all operations"
      4. "Verify LGPD, ANVISA, CFM compliance features"
    output: "Complete compliance validation report"
```

## 📚 TABLE RESOURCE DIRECTORY

### **Quick Access Links**

- [Complete Table Reference](./tables-consolidated.md) - All 24 essential tables with schemas, RLS, and patterns

### **Key Sections in tables-consolidated.md**

- **Core Healthcare Tables** - patients, appointments, professionals, clinics, medical_records, services
- **AI Integration Tables** - ai_chat_sessions, ai_chat_messages
- **Compliance & Audit Tables** - audit_logs, consent_records
- **Essential Enums** - appointment_status, consent_status, professional_type
- **RLS Patterns** - Standard policies for clinic access and patient privacy
- **Common Triggers** - Audit trails and timestamp updates
- **Essential Indexes** - Performance optimization patterns

## 🎯 SUCCESS CRITERIA

### **Table Excellence Metrics**

- **Schema Quality**: All tables follow healthcare compliance patterns
- **Security**: 100% RLS coverage on all sensitive tables
- **Performance**: Strategic indexes optimize all common queries
- **Compliance**: Zero violations of LGPD, ANVISA, CFM requirements
- **Maintainability**: Clear schema documentation and patterns

### **Termination Criteria**

**Only stop when:**

- All table requirements fully satisfied
- RLS policies tested and verified secure
- Healthcare compliance validated
- Performance indexes optimized
- Schema documentation complete and accurate

---

> **🎯 Table Excellence**: Orchestrating NeonPro's database table definitions with healthcare compliance, multi-tenant security, and comprehensive data protection patterns.
