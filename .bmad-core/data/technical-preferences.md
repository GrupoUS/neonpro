<!-- Powered by BMAD™ Core -->

# Technical Preferences - NeonPro AI-First Healthcare Platform

> **Enhanced by Winston (Architect) - Constitutional Architecture Principles + AI-First Healthcare Optimization**

## 🏗️ **Architectural Decision Framework**

### **Core Philosophy**
- **AI-First by Design**: Every component optimized for AI integration and streaming performance
- **Healthcare-Centric**: Brazilian compliance (LGPD/ANVISA/CFM) built into every architectural decision
- **Constitutional Thinking**: Multi-perspective validation (Technical, Security, User, Future, Ethics)
- **Living Architecture**: Designed for continuous evolution and adaptation
- **Performance Excellence**: Sub-2s load times, 99.95% uptime, real-time streaming

### **Decision-Making Criteria (Weighted Priority)**
```yaml
ARCHITECTURE_PRIORITIES:
  Patient_Safety: 100%        # Highest priority - healthcare compliance
  Performance: 95%            # Real-time healthcare requires speed
  Security: 95%               # Medical data protection critical
  Scalability: 90%            # Support 10x growth requirements
  Maintainability: 85%        # Long-term sustainability
  Developer_Experience: 80%   # Productivity and code quality
  Cost_Efficiency: 75%        # Sustainable business model
```

## 🤖 **AI Integration Standards**

### **AI-First Technology Stack**
```yaml
AI_TECHNOLOGIES:
  Primary_AI_SDK: 
    choice: "Vercel AI SDK 5.0"
    reasoning: "Healthcare-grade streaming, constitutional compliance, Edge runtime optimization"
    
  Streaming_Architecture:
    pattern: "Start/Delta/End with unique IDs"
    real_time_requirement: "<500ms latency"
    healthcare_optimization: "Critical patient data prioritization"
    
  LLM_Providers:
    primary: "OpenAI GPT-4.1 (healthcare-trained)"
    secondary: "Anthropic Claude (constitutional AI)"
    reasoning: "Healthcare expertise + ethical reasoning capabilities"
    
  Vector_Database:
    choice: "Supabase pgvector"
    reasoning: "Healthcare data sovereignty + LGPD compliance"
    
  AI_Caching:
    strategy: "Multi-layer with healthcare context awareness"
    layers: ["Edge cache", "Vector similarity", "Medical knowledge base"]
```

### **Streaming Performance Standards**
```yaml
STREAMING_REQUIREMENTS:
  Patient_Critical_Data: "<200ms first response"
  General_AI_Chat: "<500ms first response" 
  Background_Analysis: "<2s completion"
  Bulk_Operations: "<30s with progress streaming"
  
AI_STREAMING_PATTERNS:
  tool_input_streaming: true     # Real-time tool parameter building
  reasoning_streaming: true      # Transparent AI decision process
  custom_data_streaming: true    # Healthcare-specific data types
  error_recovery: true           # Graceful degradation for patient safety
```

## 🏥 **Healthcare-Specific Patterns**

### **Brazilian Compliance Architecture**
```yaml
COMPLIANCE_PATTERNS:
  LGPD_Integration:
    approach: "Privacy by Design"
    audit_trail: "Immutable blockchain logging"
    consent_management: "Granular + Real-time"
    
  ANVISA_Compliance:
    reporting: "Automated regulatory compliance"
    validation: "Real-time compliance monitoring"
    audit_frequency: "Continuous"
    
  CFM_Medical_Standards:
    telemedicine: "CFM 2.314/2022 compliant"
    data_retention: "Medical record standards"
    professional_validation: "CRM integration required"
```

### **Healthcare UX Patterns**
```yaml
HEALTHCARE_UX_STANDARDS:
  Emergency_Access: 
    requirement: "≤10 seconds to critical patient data"
    pattern: "Emergency button always visible"
    
  Workflow_Preservation:
    approach: "Mirror existing clinical workflows"
    disruption_tolerance: "≤5% workflow change"
    
  Accessibility:
    standard: "WCAG 2.1 AA + Healthcare accessibility"
    reasoning: "Healthcare professionals diverse abilities"
    
  Progressive_Disclosure:
    pattern: "Critical info first, details on-demand"
    depth_limit: "≤3 clicks to any patient information"
```

## 🔧 **Technology Selection Criteria**

### **Framework Selection Matrix**
```yaml
FRONTEND_FRAMEWORK:
  choice: "Next.js 15 + React 19"
  reasoning: "Server Components + streaming + healthcare performance"
  alternatives_considered: ["Remix", "SvelteKit", "Angular"]
  decision_factors: ["AI streaming support", "Healthcare compliance", "Performance"]
  
BACKEND_FRAMEWORK:
  choice: "Hono.dev 4.x"
  reasoning: "Edge-native + ultra-fast + minimal overhead"
  alternatives_considered: ["Express.js", "Fastify", "tRPC"]
  decision_factors: ["Edge deployment", "TypeScript-first", "Performance"]
  
DATABASE_ARCHITECTURE:
  choice: "Supabase PostgreSQL + Edge Functions"
  reasoning: "Healthcare data sovereignty + real-time + RLS"
  alternatives_considered: ["PlanetScale", "Railway", "Neon"]
  decision_factors: ["Brazilian data sovereignty", "Real-time", "RLS security"]
```

### **AI Technology Evaluation Criteria**
```yaml
AI_SELECTION_CRITERIA:
  Healthcare_Compliance: "Must support medical data requirements"
  Real_Time_Streaming: "Sub-500ms response times"
  Constitutional_AI: "Ethical reasoning capabilities"
  Brazilian_Deployment: "Data sovereignty compliance"
  Edge_Performance: "Vercel Edge Runtime compatibility"
  Cost_Efficiency: "Sustainable pricing for healthcare scale"
```

## 🚀 **Performance Standards**

### **Core Web Vitals (Healthcare Optimized)**
```yaml
PERFORMANCE_TARGETS:
  LCP_Largest_Contentious_Paint:
    target: "1.2s"
    threshold: "1.8s"
    reasoning: "Healthcare urgency requires faster load times"
    
  FID_First_Input_Delay:
    target: "30ms"
    threshold: "80ms"
    reasoning: "Medical decisions require immediate responsiveness"
    
  CLS_Cumulative_Layout_Shift:
    target: "0.03"
    threshold: "0.08"
    reasoning: "Patient data accuracy requires visual stability"
```

### **AI-Specific Performance Metrics**
```yaml
AI_PERFORMANCE_STANDARDS:
  Streaming_First_Token: "<200ms"
  Tool_Execution_Response: "<500ms"
  Vector_Search_Response: "<100ms"
  Real_Time_Sync: "<50ms"
  Background_AI_Processing: "<2s"
  
HEALTHCARE_SPECIFIC_METRICS:
  Emergency_Data_Access: "<5s"
  Patient_Search_Response: "<1s"
  Compliance_Validation: "<200ms"
  Audit_Log_Writing: "<100ms"
```

## 📊 **Quality Thresholds**

### **Code Quality Standards (≥9.8/10)**
```yaml
QUALITY_GATES:
  TypeScript_Coverage: "100%"
  Test_Coverage: "≥90%"
  Performance_Score: "≥95"
  Accessibility_Score: "≥95"
  Security_Score: "≥98"
  Healthcare_Compliance: "100%"
  
CODE_REVIEW_CRITERIA:
  Constitutional_Analysis: "Required for all healthcare features"
  Security_Review: "Required for all patient data handling"
  Performance_Impact: "≤5% regression tolerance"
  Accessibility_Compliance: "WCAG 2.1 AA required"
```

### **AI Quality Standards**
```yaml
AI_QUALITY_METRICS:
  Response_Accuracy: "≥95% for medical information"
  Hallucination_Rate: "≤2% for healthcare facts"
  Bias_Detection: "Continuous monitoring required"
  Ethical_Reasoning: "Constitutional AI principles"
  
HEALTHCARE_AI_STANDARDS:
  Medical_Accuracy: "Verified against medical databases"
  Patient_Safety: "Zero-risk response validation"
  Professional_Standards: "CFM guideline compliance"
  Error_Recovery: "Graceful degradation patterns"
```

## 🔒 **Security & Privacy Patterns**

### **Healthcare Data Security**
```yaml
SECURITY_ARCHITECTURE:
  Encryption_Standards:
    at_rest: "AES-256 with healthcare key management"
    in_transit: "TLS 1.3 with certificate pinning"
    client_side: "End-to-end encryption for sensitive data"
    
  Access_Control:
    pattern: "Zero-trust with role-based access"
    authentication: "Multi-factor required for medical data"
    session_management: "Healthcare-grade session timeouts"
    
  Audit_Requirements:
    logging: "Immutable audit trail for all patient data access"
    retention: "Medical record retention compliance"
    reporting: "Real-time compliance monitoring"
```

### **AI Security Patterns**
```yaml
AI_SECURITY_STANDARDS:
  Model_Security:
    access_control: "Role-based AI model access"
    input_validation: "Medical data sanitization"
    output_filtering: "Healthcare compliance validation"
    
  Data_Privacy:
    vector_storage: "Healthcare-compliant embeddings"
    training_data: "No patient data in model training"
    inference_logging: "LGPD-compliant AI interaction logs"
```

## 🏗️ **Service Architecture Patterns**

### **Enhanced Service Layer Pattern**
```yaml
SERVICE_ARCHITECTURE:
  Pattern: "Constitutional Service Layer"
  Principles:
    - "Each service validates against constitutional principles"
    - "Multi-perspective validation (Technical, Security, User, Future, Ethics)"
    - "Healthcare compliance built into service contracts"
    
  Service_Types:
    Domain_Services: "Healthcare business logic"
    Infrastructure_Services: "Technical infrastructure"
    Integration_Services: "External system integration"
    AI_Services: "AI model integration and orchestration"
    
  Quality_Gates:
    - "Constitutional principle compliance"
    - "Healthcare regulation validation"
    - "Performance benchmark compliance"
    - "Security standard compliance"
```

### **AI Service Integration Patterns**
```yaml
AI_SERVICE_PATTERNS:
  Streaming_Services:
    pattern: "Real-time streaming with healthcare prioritization"
    implementation: "Vercel AI SDK 5.0 with custom healthcare middleware"
    
  Vector_Services:
    pattern: "Healthcare knowledge base with similarity search"
    implementation: "Supabase pgvector with medical ontology"
    
  Inference_Services:
    pattern: "Edge-native AI with healthcare compliance"
    implementation: "Vercel Edge Functions with constitutional validation"
    
  Anti_No_Show_Services:
    pattern: "Behavioral analysis with privacy protection"
    implementation: "ML prediction with LGPD compliance"
```

## 📈 **Monitoring & Observability**

### **Healthcare-Specific Monitoring**
```yaml
MONITORING_STANDARDS:
  Patient_Safety_Metrics:
    - "Emergency access response times"
    - "Critical data availability"
    - "Compliance violation detection"
    
  AI_Performance_Monitoring:
    - "Streaming latency per medical context"
    - "AI accuracy for healthcare decisions"
    - "Bias detection in AI responses"
    
  Business_Metrics:
    - "Patient satisfaction correlation"
    - "Healthcare outcome improvement"
    - "Compliance audit success rate"
```

### **Real-Time Dashboard Standards**
```yaml
DASHBOARD_REQUIREMENTS:
  Update_Frequency: "Real-time (<1s)"
  Healthcare_Context: "Patient-centric view prioritization"
  Compliance_Status: "Continuous LGPD/ANVISA/CFM monitoring"
  Performance_Health: "System health with healthcare SLA tracking"
  AI_Operations: "AI service health and performance metrics"
```

## 🎯 **Development Workflow Preferences**

### **AI-First Development Process**
```yaml
DEVELOPMENT_WORKFLOW:
  Constitutional_Analysis: "Required for all features"
  AI_Integration_First: "AI capabilities designed into every feature"
  Healthcare_Validation: "Medical professional review required"
  Performance_Benchmarking: "Continuous performance validation"
  
TESTING_STRATEGY:
  Constitutional_Testing: "Multi-perspective validation"
  Healthcare_Scenario_Testing: "Real clinical workflow testing"
  AI_Response_Testing: "Medical accuracy validation"
  Performance_Testing: "Healthcare urgency response testing"
```

### **Code Organization Standards**
```yaml
CODE_ORGANIZATION:
  Package_Boundaries: "Domain-driven with healthcare contexts"
  Service_Contracts: "Constitutional principle compliance"
  AI_Integration: "Streaming-first patterns"
  Healthcare_Modules: "Compliance-by-design architecture"
  
DOCUMENTATION_STANDARDS:
  Architecture_Decisions: "ADR with constitutional analysis"
  Healthcare_Compliance: "Regulation mapping documentation"
  AI_Integration: "Streaming pattern documentation"
  Performance_Standards: "Benchmark and optimization guides"
```

---

> **🏗️ Constitutional Architecture by Winston**: These preferences embody holistic system thinking with AI-first healthcare optimization. Every decision considers Technical Excellence + Security + User Experience + Future Evolution + Healthcare Ethics. This living document evolves with platform growth while maintaining constitutional principles and healthcare compliance excellence.

**Última atualização**: Agosto 2025 - Enhanced for AI-First Healthcare Platform Transformation