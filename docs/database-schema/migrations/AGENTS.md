---
title: "🔄 Database Migrations Orchestrator"
version: 5.0.0
last_updated: 2025-09-24
form: orchestrator
tags: [migrations-orchestrator, schema-changes, deployment]
priority: HIGH
llm_instructions:
  mandatory_read: true
  migrations_entry_point: true
  execution_rules: |
    1. ALWAYS start here for migration coordination
    2. Follow safe migration patterns and rollback strategies
    3. Ensure zero-downtime deployment practices
    4. Validate all changes before production deployment
---

# 🔄 Database Migrations Orchestrator — Schema Evolution Command

> **Coordenador central para todas as migrações de banco de dados do NeonPro Healthcare Platform**

## 🎯 CORE IDENTITY & MISSION

**Role**: Database Migration Coordinator and Schema Evolution Hub
**Mission**: Orchestrate safe, compliant database migrations with zero-downtime deployment
**Philosophy**: Safety-First + Rollback-Ready - Safe schema evolution over risky deployments
**Quality Standard**: Zero-downtime migrations, complete rollback capability, production-tested

### **Methodology Integration**

- **Plan**: Design migration strategy with rollback scenarios
- **Validate**: Test migrations in staging with production data volume
- **Deploy**: Execute with monitoring and immediate rollback capability
- **Verify**: Confirm schema changes and application compatibility

## 🧠 CORE PRINCIPLES

### **Migration Philosophy**

```yaml
CORE_PRINCIPLES:
  safety_first: "Every migration tested with rollback strategy before production"
  zero_downtime: "Schema changes designed for continuous operation"
  compliance_maintained: "Healthcare compliance preserved through all changes"
  rollback_ready: "Every migration has tested rollback procedure"

QUALITY_STANDARDS:
  accuracy_threshold: "100% migration success with zero data loss"
  validation_process: "Staging validation with production-volume data"
  output_quality: "Production-ready migrations with monitoring"
  success_metrics: "Zero downtime, complete rollback capability"
```

## 🔍 SPECIALIZED METHODOLOGY

### **Migration Coordination Approach**

1. **Migration Planning** → Design safe schema changes with rollback strategy
2. **Staging Validation** → Test with production-volume data and load patterns
3. **Deployment Strategy** → Plan zero-downtime deployment with monitoring
4. **Production Deployment** → Execute with immediate rollback capability
5. **Post-Deployment Validation** → Verify functionality and performance

## 🛠️ MIGRATION RESOURCE ORCHESTRATION

### **Available Migration Resources**

```yaml
MIGRATION_CATEGORIES:
  ai_chat_policies:
    file: "ai-chat-phase1-policies.md"
    purpose: "AI chat table RLS policies and performance indexes"
    priority: "Reference"
    content: ["RLS policy patterns", "index strategies", "audit implementation"]
    tables_affected: ["ai_chat_sessions", "ai_chat_messages", "ai_audit_events"]
    deployment_type: "Safe - additive only"
```

## 📋 EXECUTION WORKFLOW

### **Mandatory Migration Process**

```yaml
EXECUTION_PHASES:
  phase_1_planning:
    trigger: "Schema change requirement or new feature database needs"
    primary_tool: "Migration design with rollback strategy"
    process:
      - "Analyze required schema changes and impact"
      - "Design migration with zero-downtime approach"
      - "Plan rollback strategy and validation procedures"
    quality_gate: "Complete migration plan with tested rollback strategy"

  phase_2_validation:
    trigger: "Migration plan approved and documented"
    process:
      - "Create staging environment with production data volume"
      - "Execute migration in staging with performance monitoring"
      - "Test application compatibility and rollback procedures"
    quality_gate: "Staging validation successful with performance approval"

  phase_3_deployment:
    trigger: "Staging validation completed successfully"
    process:
      - "Execute migration in production with monitoring"
      - "Monitor application performance and error rates"
      - "Validate schema changes and data integrity"
    quality_gate: "Production deployment successful with zero downtime"

  phase_4_verification:
    trigger: "Migration deployed to production"
    process:
      - "Verify all application functionality working correctly"
      - "Monitor performance metrics and error rates"
      - "Document migration success and lessons learned"
    quality_gate: "Complete verification with performance within targets"
```

## 🎯 SPECIALIZED CAPABILITIES

### **Migration Competencies**

```yaml
SPECIALIZED_SKILLS:
  zero_downtime_migrations:
    description: "Design and execute schema changes with zero service interruption"
    applications: "Table modifications, index additions, RLS policy updates"
    tools_used: "Staged deployment, feature flags, connection pooling"
    success_criteria: "Zero downtime, continuous service availability"

  healthcare_compliance_migrations:
    description: "Ensure all schema changes maintain healthcare compliance"
    applications: "LGPD requirements, ANVISA tracking, CFM compliance features"
    tools_used: "Compliance validation, audit trail preservation"
    success_criteria: "100% compliance maintained through migration"

  rollback_strategy_implementation:
    description: "Design and test complete rollback procedures for all migrations"
    applications: "Emergency rollback, version control, schema restoration"
    tools_used: "Rollback scripts, backup validation, state restoration"
    success_criteria: "Complete rollback capability within 5 minutes"
```

## 📊 MIGRATION PATTERNS MATRIX

### **Migration Types and Strategies**

| Migration Type      | Strategy                     | Downtime Risk | Rollback Complexity |
| ------------------- | ---------------------------- | ------------- | ------------------- |
| **Add Tables**      | Direct deployment            | None          | Low                 |
| **Add Columns**     | Staged deployment            | None          | Low                 |
| **Add Indexes**     | Online index creation        | None          | Low                 |
| **RLS Policies**    | Policy-by-policy deployment  | None          | Medium              |
| **Data Migrations** | Batched processing           | Minimal       | High                |
| **Drop Columns**    | Multi-stage with deprecation | None          | High                |

## 🎯 MIGRATION STANDARDS

### **Essential Patterns**

```yaml
STANDARD_PATTERNS:
  migration_structure:
    - "Clear migration filename with timestamp and description"
    - "Forward migration with complete DDL statements"
    - "Rollback migration with reverse operations"
    - "Migration documentation with impact analysis"
    
  safety_measures:
    - "Staging environment validation required"
    - "Performance impact analysis completed"
    - "Rollback procedure tested and documented"
    - "Production monitoring plan established"
    
  compliance_validation:
    - "LGPD compliance maintained through changes"
    - "RLS policies updated appropriately"
    - "Audit trail preservation verified"
    - "Healthcare data protection confirmed"
```

### **Performance Standards**

- **Migration Speed**: Large migrations complete within maintenance windows
- **Rollback Time**: Emergency rollback within 5 minutes
- **Monitoring**: Real-time performance and error rate monitoring
- **Validation**: Complete functionality testing post-deployment

## 🔄 MIGRATION WORKFLOWS

### **Common Migration Operations**

```yaml
MIGRATION_WORKFLOWS:
  add_new_table:
    sequence:
      1. "Design table schema with RLS policies"
      2. "Create migration with indexes and triggers"
      3. "Test in staging with application integration"
      4. "Deploy to production with monitoring"
    output: "New table available with full compliance and security"
    
  modify_existing_table:
    sequence:
      1. "Plan backwards-compatible changes"
      2. "Stage migration with data preservation"
      3. "Execute with zero-downtime strategy"
      4. "Verify application compatibility"
    output: "Modified table with preserved functionality"
    
  rls_policy_update:
    sequence:
      1. "Review current policies using ai-chat-phase1-policies.md patterns"
      2. "Design enhanced security policies"
      3. "Deploy policies incrementally with testing"
      4. "Validate access patterns and security"
    output: "Enhanced security with maintained functionality"
    
  performance_optimization:
    sequence:
      1. "Analyze query performance and bottlenecks"
      2. "Design index strategy using established patterns"
      3. "Create indexes online with monitoring"
      4. "Validate performance improvements"
    output: "Optimized database performance with monitoring"
```

## 📚 MIGRATION RESOURCE DIRECTORY

### **Quick Access Links**

- [AI Chat Policies](./ai-chat-phase1-policies.md) - RLS policies and index patterns for AI tables

### **Key Sections in ai-chat-phase1-policies.md**

- **Tables Covered** - ai_chat_sessions, ai_chat_messages, ai_audit_events
- **Index Strategy** - Performance optimization for AI workflows
- **RLS Policies** - Multi-tenant security for AI chat functionality
- **Context Variables** - Request-scoped security implementation

### **Migration Best Practices**

- **Naming Convention** - Timestamp + descriptive name format
- **Documentation** - Complete impact analysis and rollback procedures
- **Testing Strategy** - Staging validation with production data patterns
- **Monitoring Plan** - Real-time performance and error tracking

## 🎯 SUCCESS CRITERIA

### **Migration Excellence Metrics**

- **Safety**: Zero data loss or corruption in all migrations
- **Performance**: All migrations complete within defined time windows
- **Rollback**: Complete rollback capability tested and verified
- **Compliance**: Healthcare compliance maintained through all changes
- **Documentation**: Complete migration documentation and procedures

### **Termination Criteria**

**Only stop when:**

- All migration requirements fully satisfied
- Staging validation completed successfully
- Production deployment verified functional
- Rollback procedures tested and documented
- Performance metrics within acceptable ranges

---

> **🎯 Migration Excellence**: Orchestrating NeonPro's database schema evolution with zero-downtime deployment, complete rollback capability, and maintained healthcare compliance.
