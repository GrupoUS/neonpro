---
title: "🚀 API Orchestrator"
version: 5.0.0
last_updated: 2025-09-24
form: orchestrator
tags: [api-orchestrator, llm-hub, endpoints, coordination]
priority: CRITICAL
llm_instructions:
  mandatory_read: true
  api_entry_point: true
  execution_rules: |
    1. ALWAYS start here for API coordination
    2. Follow KISS/YAGNI principles
    3. Use only implemented endpoints
    4. Execute parallel operations when safe
---

# 🚀 API Orchestrator — Central Command

> **Coordenador central para todas as APIs do NeonPro Healthcare Platform**

## 🎯 CORE IDENTITY & MISSION

**Role**: API Resource Coordinator and Navigation Hub
**Mission**: Orchestrate efficient API usage with healthcare compliance and performance optimization
**Philosophy**: KISS + YAGNI - Simple, working solutions over complex specifications
**Quality Standard**: ≥99.9% uptime, <500ms response times, 100% compliance

### **Methodology Integration**

- **Analyze**: Identify API requirements and compliance needs
- **Plan**: Select appropriate endpoints and execution strategy
- **Execute**: Implement with parallel operations when safe
- **Validate**: Ensure compliance and performance targets

## 🧠 CORE PRINCIPLES

### **API Philosophy**

```yaml
CORE_PRINCIPLES:
  working_apis_only: "Document and use only implemented, tested endpoints"
  kiss_principle: "Simple, functional APIs over complex specifications"
  yagni_approach: "Build only APIs needed NOW, not speculative features"
  parallel_execution: "Concurrent API calls when operations are independent"

QUALITY_STANDARDS:
  accuracy_threshold: "100% functional endpoints with proper error handling"
  validation_process: "Healthcare compliance validation for all endpoints"
  output_quality: "Sub-500ms response times with proper LGPD compliance"
  success_metrics: "API uptime >99.9%, zero security violations"
```

## 🔍 SPECIALIZED METHODOLOGY

### **API Coordination Approach**

1. **Requirements Analysis** → Identify needed functionality and compliance requirements
2. **Resource Selection** → Choose appropriate API endpoints from available resources
3. **Execution Planning** → Plan sequential vs parallel operations for optimal performance
4. **Implementation** → Execute API calls with proper error handling and compliance
5. **Validation** → Verify results meet healthcare standards and performance targets

## 🛠️ API RESOURCE ORCHESTRATION

### **Available API Resources**

```yaml
API_CATEGORIES:
  core_operations:
    file: "core-api.md"
    purpose: "Essential CRUD operations for clients and appointments"
    priority: "Primary"
    endpoints: ["GET /api/clients", "POST /api/appointments", "authentication"]
    
  healthcare_compliance:
    file: "healthcare-compliance-api.md"
    purpose: "ANVISA, CFM, LGPD compliance validation and management"
    priority: "Critical"
    endpoints: ["POST /api/compliance/anvisa/validate", "GET /api/compliance/cfm/professional"]
    
  billing_financial:
    file: "billing-financial-api.md"
    purpose: "SUS integration, health plans, Brazilian tax processing"
    priority: "High"
    endpoints: ["POST /api/billing/create", "POST /api/billing/payment/pix"]
    
  telemedicine:
    file: "telemedicine-api.md"
    purpose: "Video consultations with CFM compliance and WebRTC"
    priority: "High"
    endpoints: ["POST /api/telemedicine/session/create", "WebSocket connections"]
    
  aesthetic_analysis:
    file: "aesthetic-analysis-api.md"
    purpose: "AI-powered skin analysis and treatment recommendations"
    priority: "Medium"
    endpoints: ["POST /api/aesthetic/analyze/skin", "POST /api/aesthetic/recommend"]
    
  ai_interface:
    file: "ai-agent-essentials.md"
    purpose: "Natural language chat and data queries"
    priority: "Secondary"
    endpoints: ["POST /api/ai/chat", "GET /api/ai/sessions"]
    
  realtime_features:
    file: "websocket-configuration.md"
    purpose: "WebSocket connections for live updates and notifications"
    priority: "Secondary"
    endpoints: ["WebSocket: wss://api.neonpro.com/ai/ws"]
    
  ai_sdk_patterns:
    file: "ai-sdk-essentials.md"
    purpose: "Vercel AI SDK implementation patterns and best practices"
    priority: "Reference"
    endpoints: ["AI SDK patterns", "streaming responses"]
```

## 📋 EXECUTION WORKFLOW

### **Mandatory Coordination Process**

```yaml
EXECUTION_PHASES:
  phase_1_analysis:
    trigger: "API functionality request or integration need"
    primary_tool: "Requirements analysis and compliance check"
    process:
      - "Identify functional requirements and data needs"
      - "Check healthcare compliance requirements (ANVISA, CFM, LGPD)"
      - "Determine performance and security constraints"
    quality_gate: "100% compliance requirements identified"

  phase_2_planning:
    trigger: "Requirements validated and approved"
    process:
      - "Select appropriate API resources from orchestrator catalog"
      - "Plan execution sequence (parallel vs sequential operations)"
      - "Prepare authentication and error handling strategy"
    quality_gate: "Execution plan validates against performance targets"

  phase_3_implementation:
    trigger: "Execution plan approved"
    process:
      - "Execute API calls following planned sequence"
      - "Monitor performance and compliance during execution"
      - "Handle errors and edge cases according to healthcare standards"
    quality_gate: "All API calls successful with <500ms response times"

  phase_4_validation:
    trigger: "Implementation completed"
    process:
      - "Verify all functional requirements met"
      - "Validate healthcare compliance maintained"
      - "Check performance targets achieved"
    quality_gate: "100% functional success with zero compliance violations"
```

## 🎯 SPECIALIZED CAPABILITIES

### **Orchestration Competencies**

```yaml
SPECIALIZED_SKILLS:
  compliance_coordination:
    description: "Automatic integration of ANVISA, CFM, and LGPD compliance in all API operations"
    applications: "All healthcare-related API calls, patient data operations, professional validation"
    tools_used: "healthcare-compliance-api.md resources"
    success_criteria: "Zero compliance violations, 100% audit trail coverage"

  performance_optimization:
    description: "Intelligent parallel execution and caching strategies for optimal API performance"
    applications: "Multi-endpoint data fetching, bulk operations, real-time features"
    tools_used: "Parallel execution patterns, WebSocket coordination"
    success_criteria: "<500ms response times, >99.9% uptime"

  financial_integration:
    description: "Seamless integration of Brazilian healthcare billing, SUS, and payment processing"
    applications: "Billing operations, payment processing, tax calculations, health plan integration"
    tools_used: "billing-financial-api.md resources"
    success_criteria: "100% tax compliance, successful payment processing"
```

## 📊 COORDINATION MATRIX

### **API Selection Guide**

| Use Case                | Primary Resource             | Secondary Resources                           | Execution Pattern               |
| ----------------------- | ---------------------------- | --------------------------------------------- | ------------------------------- |
| **Client Management**   | core-api.md                  | healthcare-compliance-api.md                  | Sequential (auth → data)        |
| **Appointment Booking** | core-api.md                  | telemedicine-api.md, billing-financial-api.md | Parallel validation             |
| **Payment Processing**  | billing-financial-api.md     | healthcare-compliance-api.md                  | Sequential (validate → process) |
| **Video Consultation**  | telemedicine-api.md          | healthcare-compliance-api.md                  | Sequential (license → session)  |
| **Skin Analysis**       | aesthetic-analysis-api.md    | ai-agent-essentials.md                        | Parallel (analyze + chat)       |
| **AI Chat**             | ai-agent-essentials.md       | websocket-configuration.md                    | Parallel (REST + WebSocket)     |
| **Compliance Check**    | healthcare-compliance-api.md | All other resources                           | Sequential (validate first)     |
| **Real-time Updates**   | websocket-configuration.md   | ai-agent-essentials.md                        | Concurrent connections          |

## 🎯 PERFORMANCE TARGETS

### **Orchestration Success Metrics**

- **Response Time**: <500ms for CRUD operations, <1000ms for AI operations
- **Availability**: >99.9% uptime across all coordinated endpoints
- **Compliance**: 100% ANVISA, CFM, LGPD compliance validation
- **Throughput**: 100 requests/minute (REST), 50 concurrent WebSocket connections
- **Error Rate**: <0.1% for coordinated operations

### **Quality Gates**

```yaml
QUALITY_VALIDATION:
  functional_validation:
    - "All endpoints respond correctly to valid requests"
    - "Error handling works for invalid/malformed requests"
    - "Authentication and authorization function properly"
    
  compliance_validation:
    - "LGPD consent verification for all patient data operations"
    - "ANVISA compliance for medical device software operations"
    - "CFM license validation for telemedicine operations"
    
  performance_validation:
    - "Response times under target thresholds"
    - "Concurrent operations handle without degradation"
    - "WebSocket connections stable under load"
```

## 🔄 INTEGRATION WORKFLOWS

### **Common Orchestration Patterns**

```yaml
ORCHESTRATION_WORKFLOWS:
  patient_onboarding:
    sequence:
      1. "healthcare-compliance-api.md → Validate LGPD consent"
      2. "core-api.md → Create patient record"
      3. "billing-financial-api.md → Setup billing profile"
      4. "ai-agent-essentials.md → Initialize AI interaction"
    output: "Complete patient profile with compliance validation"
    
  telemedicine_session:
    sequence:
      1. "healthcare-compliance-api.md → Validate physician license"
      2. "telemedicine-api.md → Create video session"
      3. "websocket-configuration.md → Establish real-time connection"
      4. "billing-financial-api.md → Process consultation billing"
    output: "Active telemedicine session with billing integration"
    
  aesthetic_consultation:
    sequence:
      1. "core-api.md → Fetch patient data"
      2. "aesthetic-analysis-api.md → Analyze skin condition"
      3. "ai-agent-essentials.md → Generate recommendations"
      4. "billing-financial-api.md → Calculate treatment costs"
    output: "Complete aesthetic consultation with treatment plan"
```

## 📚 RESOURCE DIRECTORY

### **Quick Access Links**

- [Core API](./core-api.md) - Essential CRUD operations
- [Healthcare Compliance](./healthcare-compliance-api.md) - ANVISA, CFM, LGPD
- [Billing & Financial](./billing-financial-api.md) - SUS, PIX, taxes
- [Telemedicine](./telemedicine-api.md) - Video consultations
- [Aesthetic Analysis](./aesthetic-analysis-api.md) - AI skin analysis
- [AI Agent Interface](./ai-agent-essentials.md) - Chat and queries
- [WebSocket Configuration](./websocket-configuration.md) - Real-time features
- [AI SDK Essentials](./ai-sdk-essentials.md) - Implementation patterns

## 🎯 SUCCESS CRITERIA

### **Orchestration Excellence Metrics**

- **Efficiency**: Optimal resource selection with minimal redundancy
- **Compliance**: 100% healthcare regulation adherence
- **Performance**: All operations meet or exceed target response times
- **Reliability**: Zero downtime in coordinated operations
- **Scalability**: Seamless handling of concurrent operations

### **Termination Criteria**

**Only stop when:**

- All API requirements fully satisfied
- Healthcare compliance validated (ANVISA, CFM, LGPD)
- Performance targets achieved (<500ms core operations)
- Error handling tested and validated
- Integration workflows documented

---

> **🎯 Orchestration Excellence**: Coordinating NeonPro's API ecosystem with healthcare compliance, optimal performance, and seamless integration across all platform capabilities.
