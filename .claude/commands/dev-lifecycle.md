# 🔄 Dev Lifecycle - MEGA Development Command

## Command: `/dev-lifecycle [action] [target] [--complexity=L1-L10] [--type=init|feature|refactor|deploy|review|optimize|error-fix|typescript-patterns|infrastructure]`

### 🎯 **Purpose**

Universal development lifecycle orchestrator - from project initialization to production deployment.
Combines intelligent project setup, feature development, code refactoring, deployment strategies,
code review, performance optimization, systematic error resolution, and production infrastructure
management in a single comprehensive command.

**💎 Optimized for NeonPro**: Advanced aesthetic clinic management platform with LGPD + ANVISA + CFM compliance

### 🧠 **Intelligence Integration**

```yaml
DEV_INTELLIGENCE:
  activation_triggers:
    - "/dev-lifecycle [action]"
    - "/init-project", "/feature", "/refactor", "/deploy", "/review", "/optimize", "/error-fix", "/infrastructure"
    - "create [project]", "develop [feature]", "optimize [code]", "deploy [app]", "fix errors", "setup infrastructure"
  
  context_detection:
    project_state: "Empty, existing, production-ready, error-prone, performance-critical"
    technology_stack: "NeonPro Stack: TanStack Router, Vite, React 19, Hono.dev, Supabase, TypeScript 5.7.2"
    complexity_assessment: "L1-L10 based on scope, requirements, and aesthetic compliance"
    lifecycle_stage: "Init → Develop → ErrorFix → Optimize → Deploy → Monitor → Maintain"
    error_patterns: "TypeScript errors, React compatibility, aesthetic compliance, deployment issues"
```

## 🚀 **Core Actions**### **7. ERROR RESOLUTION (error-fix)**

```yaml
ERROR_RESOLUTION:
  purpose: "Systematic TypeScript and compilation error resolution with proven methodologies for NeonPro aesthetic platform"

  proven_methodology:
    analysis_phase: "Error categorization, impact assessment, aesthetic compliance validation"
    grouping_strategy: "Group related errors (3-5 per batch), prioritize by business impact"
    incremental_validation: "Fix → Validate → Test → Document → Next group"
    strategic_approach: "Pragmatic solutions over perfect types for rapid aesthetic development"

  neonpro_specific_patterns:
    aesthetic_types:
      client_id: "type ClientId = string & { readonly __brand: unique symbol }"
      cpf_validation: "CPF branded type with Zod regex validation"
      appointment_status: "Discriminated unions for appointment states"
      treatment_id: "type TreatmentId = string & { readonly __brand: unique symbol }"

    react_19_aesthetic_compatibility:
      jsx_namespace: "JSX.Element → React.JSX.Element with proper React import"
      consent_context: "Extend ConsentContextValue with LGPD compliance properties"
      clinic_routing: "TanStack Router with clinic-specific access controls"

  error_categories:
    critical_business: "Client data access errors, no-show prediction system failures"
    compliance_blocking: "LGPD consent validation, ANVISA device registration"
    performance_critical: "Client booking >300ms, AI chat >200ms, no-show prediction >100ms"
    integration_issues: "Supabase RLS policies, Hono.dev context typing"

  aesthetic_validation_protocol:
    batch_validation: "Run 'bun run type-check' + aesthetic compliance checks"
    client_data_integrity: "Validate client record access patterns"
    lgpd_compliance_verification: "Ensure consent management remains functional"
```

### **8. TYPESCRIPT & REACT 19 PATTERNS (typescript-patterns)**

```yaml
TYPESCRIPT_REACT19_PATTERNS:
  purpose: "Production-tested patterns for React 19 + TypeScript compatibility in NeonPro aesthetic platform"

  neonpro_aesthetic_solutions:
    branded_types_implementation:
      client_safety: |
        // Aesthetic-specific branded types for data safety
        type ClientId = string & { readonly __brand: unique symbol };
        type CPF = string & { readonly __brand: unique symbol };
        type AppointmentId = string & { readonly __brand: unique symbol };
        type TreatmentId = string & { readonly __brand: unique symbol };
        type ProfessionalId = string & { readonly __brand: unique symbol };

    aesthetic_context_extensions:
      clinic_context: |
        interface ClinicContextValue {
          // Core properties
          currentClinic: AestheticClinic;
          currentUser: AestheticProfessional;
          // LGPD compliance
          consentManager: ConsentManager;
          auditLogger: AuditLogger;
          // No-show prevention
          noShowEngine: NoShowPredictionEngine;
          clientAccess: ClientAccessControl;
        }

    supabase_rls_patterns:
      client_access_policy: |
        // RLS policy integration with TypeScript
        type RLSContext = {
          userId: string;
          clinicId: string;
          role: 'owner' | 'manager' | 'professional' | 'receptionist';
        };

        async function getClientWithRLS(
          clientId: ClientId,
          context: RLSContext
        ): Promise<AestheticClient | null>

  hono_aesthetic_patterns:
    clinic_context_typing:
      problem: "Hono context not properly typed for multi-tenant clinic access"
      solution: "Define aesthetic-specific Variables type with clinic isolation"
      implementation: |
        type AestheticVariables = {
          userId: string;
          clinicId: string;
          clientAccess: ClientAccessControl;
          auditLogger: AuditLogger;
          noShowEngine: NoShowPredictionEngine;
        };
        
        async (c: Context<{ Variables: AestheticVariables }>) => {
          const clientId = c.req.param('clientId') as ClientId;
          const clinicAccess = c.get('clientAccess');
          
          if (!await clinicAccess.canAccessClient(clientId)) {
            throw new AestheticError('Acesso negado aos dados do cliente');
          }
        }

  ai_integration_patterns:
    vercel_ai_sdk_typing: |
      // Vercel AI SDK v5.0 with aesthetic compliance
      interface AestheticAIConfig {
        model: 'gpt-4o';
        maxTokens: number;
        temperature: number;
        systemPrompt: string;
        piiRedaction: boolean;
        auditLogging: boolean;
        aestheticContext: AestheticKnowledgeBase;
      }

  performance_patterns:
    client_data_loading: "useOptimistic for client updates with <300ms target"
    appointment_booking: "Concurrent features for sub-300ms booking response"
    ai_chat_streaming: "Streaming responses with <200ms first token"
    no_show_prediction: "Real-time predictions with <100ms response time"
```### **9. PRODUCTION INFRASTRUCTURE (infrastructure)**

```yaml
PRODUCTION_INFRASTRUCTURE:
  purpose: "Complete production-ready infrastructure for NeonPro aesthetic platform with LGPD + ANVISA + CFM compliance"

  neonpro_deployment_automation:
    comprehensive_deploy: "/scripts/deploy.sh - Aesthetic-compliant deployment with regulatory validation"
    health_checks: "Multi-layer validation: TypeScript, lint, test, build, aesthetic compliance"
    clinic_data_validation: "Multi-tenant clinic isolation verification"
    no_show_engine_checks: "No-show prediction engine functionality validation"

  aesthetic_monitoring_system:
    alerting_infrastructure: "/scripts/monitoring/setup-alerts.sh - 511 lines aesthetic monitoring"
    client_data_access_monitoring: "Real-time audit of client record access"
    lgpd_compliance_monitoring: "Automated consent validation and data retention tracking"
    anvisa_device_monitoring: "Aesthetic device registration status tracking"

  neonpro_performance_targets:
    ai_chat_first_token: "≤200ms for aesthetic AI consultations"
    client_booking: "≤300ms for appointment booking operations"
    appointment_scheduling: "≤300ms for scheduling operations"
    no_show_predictions: "≤100ms for ML-powered no-show predictions"

  aesthetic_e2e_testing:
    post_deploy_validation: "/tests/e2e/post-deploy-tests.js - 362 lines aesthetic-specific testing"
    test_categories: "Client records, LGPD consent, No-show prevention, AI chat, Appointment scheduling"
    compliance_validation: "LGPD data protection, ANVISA device compliance, CFM professional validation"
    multi_tenant_testing: "Clinic isolation, cross-tenant access prevention"
```

### **1. PROJECT INITIALIZATION (init)**

```yaml
PROJECT_INIT:
  purpose: "Bootstrap NeonPro-style aesthetic projects with intelligent technology stack setup and regulatory compliance"

  neonpro_technology_stacks:
    aesthetic_clinic_saas:
      - "TanStack Router + Vite + React 19 + TypeScript 5.7.2"
      - "Hono.dev + Bun runtime + Supabase PostgreSQL 17"
      - "Vercel AI SDK v5.0 + OpenAI GPT-4o"
      - "Multi-tenant clinic management with RLS"
      - "LGPD + ANVISA + CFM compliance built-in"

    aesthetic_compliance:
      - "Client data protection with branded types"
      - "No-show prediction and prevention systems"
      - "Aesthetic audit trail (immutable)"
      - "Aesthetic device integration (ANVISA)"
      - "Professional license validation (CFM)"

    performance_optimization:
      - "Bun-first setup for 3-5x performance improvements"
      - "Aesthetic performance targets (<200ms AI, <300ms booking)"
      - "Brazilian edge deployment (São Paulo region)"
      - "Oxlint + dprint + TypeScript strict quality gates"

  aesthetic_deliverables:
    - "Multi-tenant clinic architecture with RLS policies"
    - "LGPD consent management system"
    - "No-show prediction and prevention engine"
    - "Aesthetic audit logging infrastructure"
    - "AI integration with compliance monitoring"
    - "Production monitoring with aesthetic SLA requirements"
```### **2. FEATURE DEVELOPMENT (feature)**

```yaml
FEATURE_DEVELOPMENT:
  purpose: "Universal feature development for NeonPro aesthetic platform with intelligent routing and compliance validation"

  neonpro_execution_flow:
    aesthetic_discovery: "Parse aesthetic requirements, assess client data impact, determine LGPD compliance"
    architecture: "Design component structure, API contracts, multi-tenant isolation, audit trails"
    implementation: "Research-driven development with aesthetic quality validation"
    compliance_validation: "LGPD consent checks, ANVISA device integration, no-show system testing"

  aesthetic_tech_stack_support:
    frontend_clinic: "TanStack Router + React 19 - Client management, appointment scheduling, no-show prevention"
    backend_aesthetic: "Hono.dev + Supabase - Multi-tenant RLS, aesthetic API, compliance monitoring"
    ai_integration: "Vercel AI SDK v5.0 - Aesthetic AI consultations with PII redaction and audit logging"
    database_aesthetic: "PostgreSQL 17 + RLS - Client records, treatment history, compliance tracking"

  aesthetic_error_prevention:
    client_data_safety: "Apply branded types (ClientId, CPF, TreatmentId) from implementation start"
    no_show_system_validation: "Test no-show prediction engine and prevention workflows"
    lgpd_consent_verification: "Ensure consent management interfaces remain functional"
    multi_tenant_isolation: "Validate clinic data separation and access controls"
```

### **3. CODE REFACTORING (refactor)**

```yaml
CODE_REFACTOR:
  purpose: "Intelligent code improvement for NeonPro aesthetic platform with compliance preservation and performance optimization"

  neonpro_execution_flow:
    aesthetic_analysis: "Code complexity metrics, client data flow assessment, compliance impact analysis"
    business_safety_assessment: "No-show system impact, client data integrity, audit trail preservation"
    strategy: "Performance, maintainability, security, or aesthetic compliance focus"
    implementation: "Progressive refactoring with comprehensive aesthetic testing"
    compliance_validation: "LGPD compliance maintenance, ANVISA integration testing, no-show system verification"

  aesthetic_refactor_types:
    performance_aesthetic: "Client booking optimization, AI chat response time, no-show prediction speed"
    maintainability_clinical: "Aesthetic code readability, treatment terminology consistency, documentation"
    security_client_data: "Client data encryption, access control improvements, audit trail enhancement"
    architecture_clinic: "Multi-tenant isolation, no-show system design, compliance framework"
    ai_integration_optimization: "Vercel AI SDK performance, PII redaction efficiency, aesthetic prompt optimization"

  neonpro_validation_metrics:
    performance_targets: "AI chat <200ms, client booking <300ms, no-show prediction <100ms"
    aesthetic_maintainability: "Treatment terminology consistency, compliance documentation completeness"
    client_data_security: "Encryption verification, access control validation, audit trail integrity"
    clinic_architecture: "Tenant isolation verification, no-show system reliability, compliance automation"
```

### **4. DEPLOYMENT ORCHESTRATION (deploy)**

```yaml
DEPLOYMENT:
  purpose: "Intelligent deployment for NeonPro aesthetic platform with Brazilian compliance and business-grade reliability"

  neonpro_execution_flow:
    aesthetic_validation: "Pre-deployment testing, LGPD compliance scans, aesthetic device integration verification"
    clinic_infrastructure: "Multi-tenant isolation setup, no-show system deployment, audit logging activation"
    brazil_deployment: "São Paulo region deployment, Brazilian data sovereignty compliance"
    business_monitoring: "Real-time performance monitoring, no-show prediction validation, client data access tracking"
    compliance_verification: "Post-deployment LGPD validation, ANVISA device status, CFM license verification"

  aesthetic_deployment_strategies:
    blue_green_aesthetic: "Zero-downtime with instant rollback for business system reliability"
    rolling_clinic: "Gradual deployment with continuous client data access monitoring"
    canary_aesthetic: "Risk mitigation with gradual clinic rollout and compliance validation"

  neonpro_platform_support:
    frontend_clinic: "Vercel (São Paulo region), Brazilian edge optimization, aesthetic PWA"
    backend_aesthetic: "Supabase edge functions, multi-tenant RLS, aesthetic API endpoints"
    ai_aesthetic: "OpenAI GPT-4o integration, PII redaction, aesthetic compliance monitoring"

  aesthetic_validation_criteria:
    client_data_functionality: "Client records accessible, appointment scheduling operational"
    business_systems: "No-show predictions <100ms, booking systems functional"
    compliance_verification: "LGPD consent active, ANVISA devices validated, audit trails functional"
    performance_aesthetic: "AI chat <200ms, client booking <300ms, appointment scheduling <300ms"
```### **5. CODE REVIEW (review)**

```yaml
CODE_REVIEW:
  purpose: "Comprehensive code analysis for NeonPro aesthetic platform with automated validation and regulatory compliance"

  neonpro_execution_flow:
    aesthetic_planning: "Scope analysis, client data impact assessment, compliance requirements"
    automated_aesthetic: "Static analysis, LGPD compliance scanning, aesthetic security validation"
    manual_clinical: "Treatment terminology review, no-show system validation, client workflow analysis"
    compliance_reporting: "LGPD compliance report, ANVISA device integration status, CFM professional validation"

  aesthetic_review_types:
    client_data_security: "Client record encryption, access control validation, audit trail verification"
    no_show_system_performance: "No-show prediction accuracy, prevention workflows, system reliability"
    lgpd_compliance: "Consent management, data retention policies, client rights implementation"
    anvisa_device_integration: "Aesthetic device registration validation, compliance status monitoring"
    ai_aesthetic_safety: "AI chat PII redaction, aesthetic prompt validation, response accuracy"

  neonpro_technology_patterns:
    tanstack_router_clinic: "Clinic-specific routing, client access control, booking navigation patterns"
    react_19_aesthetic: "No-show component optimization, client data rendering, concurrent loading"
    hono_aesthetic_api: "Multi-tenant context validation, aesthetic endpoint security, audit logging"
    supabase_rls_patterns: "Client data isolation, clinic access policies, no-show override patterns"
    vercel_ai_compliance: "Aesthetic AI integration, PII redaction validation, audit trail compliance"

  aesthetic_error_resolution_integration:
    client_safety_detection: "Identify potential client data exposure, no-show system failures"
    compliance_analysis: "Apply LGPD/ANVISA/CFM compliance validation methodology"
    aesthetic_workflow_validation: "Ensure fixes maintain no-show prevention capabilities and client care workflows"
```

### **6. PERFORMANCE OPTIMIZATION (optimize)**

```yaml
PERFORMANCE_OPTIMIZATION:
  purpose: "Business-grade performance optimization for NeonPro with aesthetic SLA requirements and Brazilian compliance"

  neonpro_execution_flow:
    aesthetic_performance_analysis: "Business bottleneck identification, client data flow optimization"
    no_show_system_optimization: "Prediction engine performance, prevention workflow time validation"
    ai_aesthetic_optimization: "AI chat streaming optimization, aesthetic prompt efficiency"
    brazil_edge_optimization: "São Paulo edge performance, Brazilian data sovereignty compliance"

  aesthetic_performance_targets:
    ai_chat_aesthetic: "≤200ms first token for aesthetic AI consultations"
    client_booking: "≤300ms for appointment booking and conflict detection"
    appointment_scheduling: "≤300ms for appointment booking and conflict detection"
    no_show_predictions: "≤100ms for ML-powered no-show risk assessment"
    treatment_search: "≤200ms for treatment catalog and pricing queries"

  neonpro_optimization_areas:
    bun_aesthetic_setup: "Bun runtime optimization for 3-5x performance improvements in aesthetic workflows"
    clinic_data_caching: "Multi-tenant data caching with clinic isolation and client data security"
    no_show_system_performance: "Sub-100ms no-show prediction delivery and prevention coordination"
    ai_streaming_optimization: "Aesthetic AI chat streaming with PII redaction and audit logging"

  aesthetic_core_web_vitals:
    client_interface_performance: "Aesthetic interface loading <1.5s, client data rendering <300ms"
    booking_response_metrics: "Booking confirmation display <300ms, scheduling system <300ms"
    clinic_dashboard_optimization: "Multi-tenant dashboard loading <2s, real-time updates <100ms"
    mobile_aesthetic_performance: "Aesthetic mobile app optimization for clinic tablets and phones"

  proven_neonpro_results:
    typescript_error_elimination: "51+ TypeScript errors → 0 (100% reduction achieved)"
    aesthetic_infrastructure: "2,475+ lines of production-ready aesthetic infrastructure deployed"
    compliance_automation: "Complete LGPD + ANVISA + CFM compliance automation implemented"
    aesthetic_performance_validation: "All aesthetic SLA targets met and validated in production"
```

## 🔧 **NeonPro-Specific Usage Patterns**

### **Aesthetic Error Resolution Operations**

```bash
# Systematic TypeScript error resolution for aesthetic system
/dev-lifecycle error-fix client-data --batch-size=3 --validate-lgpd
# → Fix client data type errors while maintaining LGPD compliance

# React 19 compatibility for no-show systems
/dev-lifecycle typescript-patterns no-show-components --validate-performance
# → Update no-show prediction components with <100ms performance validation

# Multi-tenant clinic error resolution
/dev-lifecycle error-fix multi-tenant --clinic-isolation --audit-trail
# → Fix multi-tenant issues while preserving clinic data isolation
```

### **Aesthetic Infrastructure Setup**

```bash
# Complete NeonPro production infrastructure deployment
/dev-lifecycle infrastructure neonpro-complete --aesthetic --monitoring
# → Deploy with full aesthetic monitoring, LGPD compliance, and no-show systems

# Brazilian compliance infrastructure
/dev-lifecycle infrastructure brazil-compliance --lgpd --anvisa --cfm
# → Setup Brazilian aesthetic compliance with regulatory validation

# AI aesthetic integration infrastructure
/dev-lifecycle infrastructure ai-aesthetic --pii-redaction --audit-logging
# → Deploy AI infrastructure with aesthetic compliance and audit trails
```

### **Business-Grade Deployment Operations**

```bash
# Production aesthetic deployment with comprehensive validation
/dev-lifecycle deploy neonpro-production --strategy=blue-green --business-validation
# → Zero-downtime deployment with no-show system validation and client data integrity

# Multi-tenant clinic deployment
/dev-lifecycle deploy multi-clinic --tenant-isolation --lgpd-validation
# → Deploy with clinic isolation and LGPD compliance verification

# No-show system deployment with performance validation
/dev-lifecycle deploy no-show-systems --performance-critical --sub-100ms
# → Deploy no-show prediction systems with sub-100ms performance requirements
```## 💎 **NeonPro Aesthetic & Compliance Integration**

```yaml
AESTHETIC_OPTIMIZATION:
  neonpro_lgpd_compliance:
    - "Automated LGPD compliance validation with client consent management"
    - "Client data handling with branded types (ClientId, CPF, AppointmentId, TreatmentId)"
    - "Aesthetic audit trail integration with immutable business records"
    - "Real-time compliance monitoring with /scripts/monitoring/setup-alerts.sh"
    - "Data retention policies for client records and treatment history"

  neonpro_performance_aesthetic:
    - "≤200ms AI chat first token for aesthetic consultations (implemented and validated)"
    - "≤300ms client booking for aesthetic workflows (proven implementation)"
    - "≤300ms appointment scheduling with conflict detection (validated)"
    - "≤100ms no-show prediction system for business optimization (aesthetic-grade)"
    - "Treatment search and pricing with ≤200ms response time"

  neonpro_security_aesthetic:
    - "Multi-tenant clinic isolation with Supabase RLS policies"
    - "Client privacy protection with encryption at rest and in transit"
    - "Aesthetic professional access control (CFM license validation)"
    - "Aesthetic device integration security (ANVISA compliance)"
    - "Business continuity systems with complete audit trails"

  neonpro_production_infrastructure:
    - "Complete aesthetic-compliant deployment pipeline with Brazilian data sovereignty"
    - "Automated LGPD validation in E2E testing with client data scenarios"
    - "Aesthetic-specific performance monitoring with business SLA requirements"
    - "São Paulo edge deployment for Brazilian aesthetic regulations"
    - "24/7 monitoring with no-show system reliability and business-grade uptime"
```

## 📊 **NeonPro Quality Standards & Metrics**

```yaml
QUALITY_ENFORCEMENT:
  neonpro_code_quality:
    L1-L3: "≥9.0/10 - Healthcare basic quality with LGPD compliance and patient data safety"
    L4-L6: "≥9.3/10 - Medical professional quality with emergency handling and audit trails"
    L7-L10: "≥9.7/10 - Medical enterprise quality with regulatory compliance and emergency systems"

  proven_neonpro_performance_targets:
    ai_chat_medical: "≤200ms first token for healthcare AI consultations (implemented and validated)"
    patient_data_access: "≤500ms for patient record retrieval and medical history (proven)"
    appointment_scheduling: "≤300ms for booking with conflict detection and no-show prediction"
    emergency_alerts: "≤100ms for critical emergency notifications and escalation (medical-grade)"
    build_performance: "≥50% improvement with Bun runtime optimization (healthcare workflows)"

  healthcare_security_compliance:
    patient_data_encryption: "AES-256 encryption for patient records and medical history"
    multi_tenant_isolation: "Complete clinic data separation with Supabase RLS policies"
    lgpd_anvisa_cfm_compliance: "Full Brazilian healthcare regulatory compliance (implemented)"
    audit_trail_system: "Immutable healthcare audit logs with complete patient data access tracking"

  neonpro_infrastructure_metrics:
    deployment_reliability: "Zero-downtime deployments with medical-grade rollback (blue-green strategy)"
    monitoring_coverage: "Complete healthcare monitoring (511 lines alerts + 362 lines E2E tests)"
    emergency_system_testing: "Comprehensive emergency response validation and performance testing"
    ai_healthcare_monitoring: "AI chat compliance monitoring with PII redaction and audit logging"
    brazil_edge_performance: "São Paulo edge optimization with data sovereignty compliance"
```

## 🤝 **NeonPro Agent Orchestration & MCP Integration**

```yaml
AGENT_COORDINATION:
  neonpro_archon_integration:
    - "Healthcare task-driven development with Archon MCP workflow and medical compliance"
    - "Research-first implementation using perform_rag_query for medical best practices"
    - "Healthcare code examples integration with search_code_examples for clinic workflows"
    - "Medical project management with task status updates and compliance tracking"

  healthcare_quality_agents:
    apex_dev: "Primary healthcare implementation with medical terminology and compliance patterns"
    apex_ui_ux_designer: "Healthcare UI/UX with emergency systems and patient-focused design"
    apex_qa_debugger: "Medical-grade quality assurance with patient data safety validation"
    apex_researcher: "Healthcare technology research and Brazilian regulatory compliance"

  neonpro_tool_integration:
    desktop_commander: "Healthcare file operations and medical project management"
    context7: "Medical documentation and Brazilian healthcare regulatory best practices"
    sequential_thinking: "Complex healthcare problem solving with patient safety analysis"
    serena: "NeonPro codebase analysis with healthcare semantic code operations"
    supabase: "Multi-tenant clinic database operations with patient data management"
    tavily: "Real-time healthcare information and Brazilian medical regulatory updates"

  healthcare_error_resolution_agents:
    systematic_correction: "Proven TypeScript error resolution with healthcare compliance preservation"
    react_19_migration: "Specialized React 19 + TypeScript compatibility for emergency systems"
    healthcare_compliance: "LGPD, ANVISA, and CFM medical compliance validation and automation"
    performance_optimization: "Healthcare Core Web Vitals and medical-grade performance monitoring"
```

## 🌐 **Bilingual Support**

### **Portuguese Commands (Comandos em Português)**

- **`/ciclo-dev init neonpro-saude`** - Inicialização completa de projeto de saúde
- **`/ciclo-dev feature paciente-emergencia`** - Desenvolvimento de funcionalidades de emergência
- **`/ciclo-dev refatorar dados-paciente`** - Refatoração com conformidade LGPD
- **`/ciclo-dev deploy clinica-producao`** - Orquestração de deployment médico
- **`/ciclo-dev revisar seguranca-medica`** - Revisão de segurança de dados de saúde
- **`/ciclo-dev otimizar performance-clinica`** - Otimização de performance para clínicas
- **`/ciclo-dev corrigir-erros dados-saude`** - Resolução de erros em dados de saúde
- **`/ciclo-dev infraestrutura anvisa-cfm`** - Setup de infraestrutura com compliance regulatório

### **English Commands (Healthcare-Optimized)**

- **`/dev-lifecycle init neonpro-healthcare`** - Complete healthcare project initialization
- **`/dev-lifecycle feature patient-emergency`** - Emergency healthcare feature development
- **`/dev-lifecycle refactor patient-data`** - Patient data refactoring with LGPD compliance
- **`/dev-lifecycle deploy medical-production`** - Medical-grade production deployment
- **`/dev-lifecycle review healthcare-security`** - Healthcare security and compliance review
- **`/dev-lifecycle optimize clinic-performance`** - Clinic performance optimization
- **`/dev-lifecycle error-fix healthcare-types`** - Healthcare TypeScript error resolution
- **`/dev-lifecycle infrastructure brazil-compliance`** - Brazilian healthcare compliance setup
```## 🎯 **NeonPro Success Criteria & Validation**

```yaml
LIFECYCLE_VALIDATION:
  neonpro_init_success: "Complete healthcare project setup with LGPD compliance, emergency systems, and medical-grade infrastructure"
  healthcare_feature_delivery: "Working medical features meeting complexity-appropriate quality with patient data safety"
  patient_data_refactor: "Measurable improvements in patient data security, performance, and compliance preservation"
  medical_deployment_reliability: "Successful deployment with healthcare validation, emergency system testing, and LGPD compliance"
  healthcare_review_completeness: "Comprehensive medical code analysis with Brazilian regulatory compliance validation"
  clinic_performance_optimization: "Significant performance improvements meeting medical SLA requirements (AI <200ms, Patient data <500ms)"
  healthcare_error_resolution: "100% TypeScript error elimination while maintaining patient data safety and emergency systems"
  medical_infrastructure_deployment: "Complete production-ready healthcare infrastructure with regulatory compliance"

NEONPRO_HEALTHCARE_COMPLIANCE:
  medical_performance_targets: "≤200ms AI chat, ≤500ms patient records, ≤300ms scheduling, ≤100ms emergency alerts ✓"
  lgpd_compliance_automation: "Automated LGPD validation throughout development lifecycle ✓ (complete infrastructure)"
  anvisa_cfm_compliance: "Medical device and professional license validation ✓ (regulatory automation)"
  security_validation_medical: "Medical-grade security standards with multi-tenant isolation ✓ (511 lines monitoring)"
  audit_readiness_healthcare: "Complete healthcare audit trail with immutable patient data logging ✓ (automated)"
  production_monitoring_medical: "24/7 healthcare-compliant monitoring with emergency SLA ✓ (Core Web Vitals + alerts)"
  e2e_validation_clinic: "Business critical healthcare flows validated ✓ (362 lines E2E tests with patient scenarios)"

PROVEN_NEONPRO_RESULTS:
  healthcare_error_reduction: "51+ TypeScript errors → 0 (100% elimination with patient data safety preserved)"
  medical_infrastructure_completeness: "2,475+ lines of production-ready healthcare infrastructure deployed"
  healthcare_monitoring_coverage: "Complete medical monitoring: alerts (511), E2E (362), performance (1042), workflow (482)"
  medical_deployment_automation: "Zero-downtime deployments with emergency system validation and patient data integrity"
  brazilian_healthcare_compliance: "Full LGPD + ANVISA + CFM compliance automation implemented and validated"
  clinic_performance_optimization: "All medical SLA targets met: AI <200ms, patient data <500ms, emergency <100ms"
```

---

## 🚀 **Ready for Complete NeonPro Healthcare Development Lifecycle**

**Dev Lifecycle Command** activated with comprehensive healthcare development workflow orchestration and battle-tested medical implementations:

✅ **Healthcare Project Initialization** - Intelligent setup with LGPD + ANVISA + CFM compliance and emergency systems\
✅ **Medical Feature Development** - Progressive complexity handling with patient data safety and regulatory validation\
✅ **Healthcare Code Refactoring** - Multi-type optimization with patient data integrity and compliance preservation\
✅ **Medical Deployment Orchestration** - Zero-downtime strategies with emergency system validation and audit trails\
✅ **Healthcare Code Review System** - Medical-grade analysis with regulatory compliance and patient safety validation\
✅ **Clinic Performance Optimization** - Healthcare SLA compliance with AI <200ms and patient data <500ms targets\
✅ **Healthcare Error Resolution** - **Proven systematic TypeScript error resolution with patient data safety (51+ → 0 errors)**\
✅ **Medical Production Infrastructure** - **Complete healthcare-compliant infrastructure with 2,475+ lines of medical automation**\
✅ **Healthcare TypeScript Patterns** - **Production-tested React 19 + TypeScript patterns for emergency systems**

**🏥 Healthcare Ready**: LGPD + ANVISA + CFM compliance integrated with automated validation and medical monitoring\
**🎯 Quality Enforced**: L1-L10 progressive medical quality standards (≥9.0-9.7/10) with patient safety validation\
**🚀 Technology Universal**: NeonPro stack optimization with TanStack Router + React 19 + Hono.dev + Supabase healthcare integration\
**🤖 Archon Integrated**: Seamless healthcare task-driven development workflow with medical compliance MCP orchestration\
**🇧🇷 Production Proven**: **2,475+ lines of battle-tested medical infrastructure with 100% healthcare compliance**

**Status**: 🟢 **NEONPRO MEGA HEALTHCARE COMMAND** | **Coverage**: Complete Medical Lifecycle + Production Infrastructure | **Quality**: L1-L10 Healthcare Progressive | **Compliance**: ✅ LGPD + ANVISA + CFM Fully Compliant | **Bilingual**: 🇧🇷 🇺🇸 | **Error Resolution**: ✅ 100% Medical Safety Proven | **Infrastructure**: ✅ Healthcare Production Ready | **Performance**: ✅ Medical SLA Validated