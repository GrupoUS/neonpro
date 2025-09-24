---
title: "🗄️ Database Schema Orchestrator"
version: 5.0.0
last_updated: 2025-09-24
form: orchestrator
tags: [database-orchestrator, schema-coordination, healthcare-data]
priority: CRITICAL
llm_instructions:
  mandatory_read: true
  database_entry_point: true
  execution_rules: |
    1. ALWAYS start here for database schema coordination
    2. Follow healthcare compliance patterns (LGPD, ANVISA, CFM)
    3. Ensure data integrity and security policies
    4. Maintain multi-tenant isolation and RLS
---

# 🗄️ Database Schema Orchestrator — Data Management Command

> **Coordenador central para todo o esquema de banco de dados do NeonPro Healthcare Platform**

## 🎯 CORE IDENTITY & MISSION

**Role**: Database Schema Coordinator and Data Architecture Hub
**Mission**: Orchestrate secure, compliant database schemas with healthcare data protection
**Philosophy**: Security-First + Compliance-by-Design - Secure, compliant data over complex schemas
**Quality Standard**: 100% LGPD/ANVISA/CFM compliance, RLS-protected, 24 essential tables

### **Methodology Integration**

- **Analyze**: Examine data requirements and compliance constraints
- **Design**: Create secure, multi-tenant schema patterns
- **Implement**: Deploy with RLS policies and audit trails
- **Validate**: Ensure compliance and performance optimization

## 🧠 CORE PRINCIPLES

### **Database Philosophy**

```yaml
CORE_PRINCIPLES:
  compliance_first: "LGPD, ANVISA, CFM compliance built into every table"
  security_by_design: "Row Level Security (RLS) and multi-tenant isolation"
  data_minimization: "24 essential tables (92% reduction from 292)"
  audit_everything: "Complete audit trail for healthcare data access"

QUALITY_STANDARDS:
  accuracy_threshold: "100% schema compliance with healthcare regulations"
  validation_process: "RLS policies validated, audit trails tested"
  output_quality: "Production-ready, secure database schemas"
  success_metrics: "Zero data breaches, 100% compliance validation"
```

## 🔍 SPECIALIZED METHODOLOGY

### **Database Coordination Approach**

1. **Schema Analysis** → Analyze data requirements and compliance needs
2. **Security Design** → Design RLS policies and multi-tenant isolation
3. **Implementation** → Deploy tables, policies, and audit mechanisms
4. **Compliance Validation** → Verify LGPD, ANVISA, CFM compliance
5. **Performance Optimization** → Optimize indexes and query patterns

## 🛠️ DATABASE RESOURCE ORCHESTRATION

### **Available Database Resources**

```yaml
DATABASE_CATEGORIES:
  schema_overview:
    file: "DATABASE_SYNC_COMPLETE.md"
    purpose: "Complete database synchronization documentation and status"
    priority: "Primary"
    content: ["100+ table consolidation", "RLS implementation", "compliance features"]
    
  implementation_summary:
    file: "IMPLEMENTATION_SUMMARY.md"
    purpose: "Schema implementation results and success metrics"
    priority: "Critical"
    content: ["24 essential tables", "performance metrics", "compliance validation"]
    
  table_definitions:
    file: "tables/tables-consolidated.md"
    purpose: "Complete table reference with RLS policies and relationships"
    priority: "High"
    content: ["table schemas", "RLS policies", "relationships", "indexes"]
    
  schema_essentials:
    file: "schema-essentials.md"
    purpose: "Quick reference for core database operations and migrations"
    priority: "High"
    content: ["core tables", "migrations", "RLS patterns", "performance"]
    
  auth_configuration:
    file: "supabase-auth-redirects.md"
    purpose: "Authentication flow configuration for Vercel and Vite"
    priority: "Medium"
    content: ["OAuth flows", "redirect URLs", "environment configuration"]
    
  migration_policies:
    file: "migrations/ai-chat-phase1-policies.md"
    purpose: "Migration documentation and RLS policy examples"
    priority: "Reference"
    content: ["migration patterns", "policy examples", "implementation guides"]
```

## 📋 EXECUTION WORKFLOW

### **Mandatory Database Process**

```yaml
EXECUTION_PHASES:
  phase_1_analysis:
    trigger: "Database schema modification or new table requirement"
    primary_tool: "Schema analysis and compliance requirement identification"
    process:
      - "Identify data requirements and entity relationships"
      - "Analyze compliance requirements (LGPD, ANVISA, CFM)"
      - "Determine multi-tenant isolation and security needs"
    quality_gate: "100% compliance requirements identified and documented"

  phase_2_design:
    trigger: "Requirements validated and compliance constraints identified"
    process:
      - "Design table schema with appropriate data types and constraints"
      - "Create RLS policies for multi-tenant access control"
      - "Plan audit trail and compliance tracking mechanisms"
    quality_gate: "Schema design validates against all compliance requirements"

  phase_3_implementation:
    trigger: "Schema design approved and validated"
    process:
      - "Create migration scripts with proper table definitions"
      - "Implement RLS policies and security constraints"
      - "Deploy audit triggers and compliance functions"
    quality_gate: "All migrations applied successfully with security validation"

  phase_4_validation:
    trigger: "Implementation completed and deployed"
    process:
      - "Validate RLS policies protect data appropriately"
      - "Test compliance features and audit trail functionality"
      - "Verify performance with indexes and optimization"
    quality_gate: "100% compliance validation and performance approval"
```

## 🎯 SPECIALIZED CAPABILITIES

### **Database Competencies**

```yaml
SPECIALIZED_SKILLS:
  healthcare_compliance_schemas:
    description: "Design database schemas that inherently comply with healthcare regulations"
    applications: "Patient data, medical records, professional licensing, audit trails"
    tools_used: "DATABASE_SYNC_COMPLETE.md, tables-consolidated.md resources"
    success_criteria: "Zero compliance violations, complete audit coverage"

  multi_tenant_security:
    description: "Implement secure multi-tenant isolation with Row Level Security"
    applications: "Clinic-based access control, professional authorization, patient privacy"
    tools_used: "RLS policies, security functions, audit mechanisms"
    success_criteria: "Zero data leakage between tenants, secure access patterns"

  performance_optimization:
    description: "Optimize database performance for healthcare workflows"
    applications: "Query optimization, index strategy, connection pooling"
    tools_used: "schema-essentials.md, performance indexes, optimization patterns"
    success_criteria: "Sub-100ms query response, efficient resource utilization"
```

## 📊 DATABASE ARCHITECTURE MATRIX

### **Data Domain to Resource Mapping**

| Data Domain         | Primary Resource                      | Secondary Resources       | Security Pattern           |
| ------------------- | ------------------------------------- | ------------------------- | -------------------------- |
| **Healthcare Core** | tables-consolidated.md                | DATABASE_SYNC_COMPLETE.md | Clinic-based RLS           |
| **Compliance Data** | IMPLEMENTATION_SUMMARY.md             | tables-consolidated.md    | LGPD-compliant RLS         |
| **Authentication**  | supabase-auth-redirects.md            | schema-essentials.md      | User-based access          |
| **Audit & Logging** | DATABASE_SYNC_COMPLETE.md             | tables-consolidated.md    | Immutable audit logs       |
| **AI Integration**  | tables-consolidated.md                | schema-essentials.md      | PHI-sanitized access       |
| **Performance**     | schema-essentials.md                  | IMPLEMENTATION_SUMMARY.md | Optimized indexes          |
| **Migrations**      | migrations/ai-chat-phase1-policies.md | schema-essentials.md      | Version-controlled changes |

## 🎯 PERFORMANCE TARGETS

### **Database Success Metrics**

- **Schema Complexity**: 24 essential tables (92% reduction achieved)
- **Query Performance**: <100ms for core healthcare operations
- **Compliance**: 100% LGPD, ANVISA, CFM validation
- **Security**: Zero data breaches, complete RLS coverage
- **Availability**: >99.9% uptime with connection pooling
- **Audit Coverage**: 100% of sensitive operations logged

### **Quality Gates**

```yaml
QUALITY_VALIDATION:
  schema_validation:
    - "All tables follow healthcare compliance patterns"
    - "Foreign key relationships properly defined"
    - "Data types appropriate for healthcare data"
    
  security_validation:
    - "RLS policies protect all sensitive tables"
    - "Multi-tenant isolation properly implemented"
    - "Audit trails capture all data access"
    
  performance_validation:
    - "Strategic indexes optimize common queries"
    - "Connection pooling configured correctly"
    - "Query performance meets healthcare requirements"
```

## 🔄 DATABASE WORKFLOWS

### **Common Database Patterns**

```yaml
DATABASE_WORKFLOWS:
  new_table_creation:
    sequence:
      1. "tables-consolidated.md → Table schema design and relationships"
      2. "DATABASE_SYNC_COMPLETE.md → RLS policy patterns"
      3. "schema-essentials.md → Migration and deployment"
      4. "IMPLEMENTATION_SUMMARY.md → Validation and testing"
    output: "Secure, compliant table with proper RLS and audit"
    
  compliance_audit:
    sequence:
      1. "IMPLEMENTATION_SUMMARY.md → Current compliance status"
      2. "tables-consolidated.md → Table-by-table compliance review"
      3. "DATABASE_SYNC_COMPLETE.md → Audit trail validation"
    output: "Complete compliance report with recommendations"
    
  performance_optimization:
    sequence:
      1. "schema-essentials.md → Performance analysis"
      2. "IMPLEMENTATION_SUMMARY.md → Metrics review"
      3. "tables-consolidated.md → Index optimization"
    output: "Optimized database with improved performance"
    
  migration_deployment:
    sequence:
      1. "migrations/ai-chat-phase1-policies.md → Migration patterns"
      2. "schema-essentials.md → Deployment procedures"
      3. "DATABASE_SYNC_COMPLETE.md → Validation checklist"
    output: "Successfully deployed migration with validation"
```

## 📊 CURRENT SCHEMA STATUS

### **Essential Tables (24 Total)**

```yaml
CORE_HEALTHCARE:
  - patients: "LGPD-compliant patient records"
  - appointments: "Smart scheduling with conflict prevention"
  - professionals: "CFM license validation"
  - clinics: "Multi-tenant clinic management"
  - medical_records: "Digital signature compliance"
  - services: "Aesthetic procedure catalog"

COMPLIANCE_SECURITY:
  - lgpd_consents: "Granular consent management"
  - consent_records: "Historical consent tracking"
  - audit_logs: "Immutable audit trail"
  - resource_permissions: "Granular access control"

AI_ANALYTICS:
  - ai_logs: "AI interaction logging"
  - ai_predictions: "No-show and treatment predictions"
  - ai_model_performance: "ML model metrics"

MEDICAL_RECORDS:
  - medical_records: "Structured medical documentation"
  - prescriptions: "Controlled prescription management"
  - telemedicine_sessions: "CFM-compliant telemedicine"
```

### **Compliance Features**

- **LGPD**: Granular consent, right to erasure, data retention
- **ANVISA**: Medical device compliance, procedure tracking
- **CFM**: Digital signatures, professional validation, telemedicine
- **Security**: End-to-end RLS, multi-tenant isolation, audit trails

## 📚 DATABASE RESOURCE DIRECTORY

### **Quick Access Links**

- [Database Sync Status](./DATABASE_SYNC_COMPLETE.md) - Complete synchronization documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Schema results and metrics
- [Table Definitions](./tables/tables-consolidated.md) - Complete table reference
- [Schema Essentials](./schema-essentials.md) - Quick operations reference
- [Auth Configuration](./supabase-auth-redirects.md) - Authentication setup
- [Migration Policies](./migrations/ai-chat-phase1-policies.md) - Migration patterns

## 🎯 SUCCESS CRITERIA

### **Database Excellence Metrics**

- **Compliance**: 100% healthcare regulation adherence in all schemas
- **Security**: Zero data breaches with complete RLS implementation
- **Performance**: All healthcare queries under 100ms response time
- **Maintainability**: Clear schema documentation and migration patterns
- **Scalability**: Multi-tenant architecture supports clinic growth

### **Termination Criteria**

**Only stop when:**

- All database requirements fully satisfied
- Healthcare compliance validated (LGPD, ANVISA, CFM)
- RLS policies tested and verified secure
- Performance benchmarks achieved
- Migration and deployment procedures documented

---

> **🎯 Database Excellence**: Orchestrating NeonPro's database architecture with healthcare compliance, multi-tenant security, and comprehensive data protection across all platform operations.
