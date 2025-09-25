---
title: "AI Agents Architecture"
last_updated: 2025-01-25
form: reference
tags: [ai-agents, architecture, copilotkit, ag-ui, healthcare, compliance]
related:
  - ./architecture.md
  - ./tech-stack.md
  - ../apis/ai-agent-api.md
  - ../AGENTS.md
---

# AI Agents Architecture — Reference

## Overview

The NeonPro AI Agents Architecture provides comprehensive AI-powered clinical decision support for Brazilian aesthetic clinics through a unified, compliant, and scalable system. Built on CopilotKit v1.10.5 <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference> and AG-UI Protocol <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>, the architecture consolidates multiple AI services into a cohesive platform supporting multi-professional collaboration while maintaining strict Brazilian healthcare compliance.

### Core Objectives

- **Healthcare Specialization**: Medical + aesthetic AI services with Brazilian compliance (LGPD, ANVISA, CFM)
- **Real-time Communication**: AG-UI protocol integration with ~16 standard event types for seamless interactions <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **React Integration**: CopilotKit v1.10.5 hooks with advanced generative UI and human-in-the-loop capabilities <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **Multi-Provider Support**: OpenAI GPT-5-mini + Gemini Flash 2.5 with intelligent failover
- **Compliance First**: Built-in Brazilian healthcare regulations at every layer

### Key Design Principles

- **Modularity**: Clear separation of concerns with cohesive AI service modules
- **Type Safety**: End-to-end TypeScript with strict typing for data integrity
- **Extensibility**: Easy addition of new AI providers and specialized services with framework-agnostic approach <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **Performance**: Optimized for real-time healthcare applications (<2s response time)
- **Security**: End-to-end encryption with comprehensive audit trails

## Unified AI Services Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React 19)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   CopilotKit    │  │    AG-UI        │  │   AI Chat UI    │ │
│  │   Integration   │  │    Protocol     │  │   Components    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌──────────────▼───────────────┐
                    │         AI Gateway           │
                    │    (tRPC + Vercel AI SDK)   │
                    └──────────────┬───────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
    ┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
    │   Provider   │        │   Clinical   │        │   Protocol  │
    │   Factory    │        │   Services   │        │   Handler   │
    │              │        │              │        │              │
    │ • OpenAI     │        │ • Assessment │        │ • WebSocket │
    │ • Gemini     │        │ • Planning   │        │ • AG-UI     │
    │ • Fallback   │        │ • Decision   │        │ • Real-time │
    └──────┬───────┘        └──────┬───────┘        └──────┬───────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │      Compliance Layer        │
                    │   (LGPD + ANVISA + CFM)     │
                    └───────────────────────────────┘
```

### Core Components

#### 1. AI Provider Factory

**Unified Provider Management**
- **Multi-Provider Support**: OpenAI GPT-5-mini (primary) + Gemini Flash 2.5 (secondary)
- **Health Monitoring**: Real-time provider health checks and performance metrics
- **Intelligent Failover**: Automatic provider switching with exponential backoff
- **Cost Optimization**: Dynamic provider selection based on query complexity

**Provider Capabilities**
- **Clinical Reasoning**: Medical assessment and treatment recommendations
- **Portuguese Language**: Native Brazilian Portuguese understanding and generation
- **Function Calling**: Structured data extraction and API interactions
- **Streaming Responses**: Real-time response generation for improved UX

#### 2. Clinical AI Services

**Specialized Healthcare Services**
- **Patient Assessment**: AI-powered clinical evaluation and risk scoring
- **Treatment Planning**: Evidence-based treatment recommendations with contraindication analysis
- **Clinical Decision Support**: Real-time guidance for aesthetic procedures
- **Outcome Prediction**: Treatment success probability and risk assessment

**Service Architecture**
- **Base Clinical Service**: Abstract foundation with compliance validation
- **Aesthetic Specialization**: Specialized services for aesthetic procedures
- **Multi-Professional Support**: Services tailored for CFM, COREN, CFF, CNEP professionals
- **Audit Integration**: Complete logging for regulatory compliance

#### 3. Compliance Management

**Brazilian Healthcare Compliance**
- **LGPD Compliance**: Automatic PII redaction and consent management
- **ANVISA Integration**: Medical device validation and compliance checking
- **CFM Standards**: Professional ethics and telemedicine compliance
- **Audit Logging**: Immutable audit trails for all AI interactions

**Data Protection**
- **PII Redaction**: Automatic identification and redaction of sensitive data
- **Consent Validation**: Real-time consent verification for data processing
- **Data Retention**: Automated lifecycle management with compliance policies
- **Access Control**: Role-based permissions with professional scope validation

## AG-UI Protocol Integration

### Protocol Architecture

The AG-UI Protocol is a lightweight, event-based protocol that standardizes how AI agents connect to user-facing applications <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>. Built for simplicity and flexibility, it enables seamless integration between AI agents, real-time user context, and healthcare interfaces with ~16 standard event types.

#### Core Protocol Features

**Event-Based Communication** <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **Standard Event Types**: ~16 predefined event types for consistent agent-user interaction
- **Flexible Middleware**: Ensures compatibility across diverse healthcare environments
- **Transport Agnostic**: Works with SSE, WebSockets, webhooks, and other transport methods
- **Loose Format Matching**: Enables broad agent and application interoperability

#### Message Structure

```typescript
interface AguiMessage {
  id: string                    // Unique message identifier
  type: AguiMessageType        // Message classification (~16 standard types)
  timestamp: string            // ISO timestamp
  sessionId: string           // Chat session identifier
  payload: Record<string, any> // Message content
  metadata: AguiMetadata      // Security and routing metadata
  compliance?: ComplianceMetadata // Brazilian compliance data
}

type AguiMessageType =
  | 'clinical_query'          // Clinical assessment request
  | 'treatment_recommendation' // Treatment planning request
  | 'compliance_validation'   // Compliance check request
  | 'ai_response'            // AI agent response
  | 'streaming_chunk'        // Streaming response chunk
  | 'generative_ui'          // Generative UI components
  | 'human_in_loop'          // Human intervention required
  | 'state_sync'             // Bi-directional state synchronization
  | 'error'                  // Error response
```

#### Security Features

**Authentication & Authorization**
- **JWT-based Authentication**: Secure session management with refresh tokens
- **Role-based Access**: Professional council validation (CFM, COREN, CFF, CNEP)
- **Session Management**: Secure WebSocket connections with timeout handling
- **Audit Integration**: Complete message logging for compliance

**Data Protection**
- **End-to-End Encryption**: TLS 1.3 for all communications
- **Message Validation**: Schema validation and sanitization
- **Rate Limiting**: Per-role rate limiting to prevent abuse
- **Compliance Checking**: Real-time LGPD and ANVISA validation

### WebSocket Implementation

**Connection Management**
- **Secure Connections**: WSS with certificate validation
- **Reconnection Logic**: Automatic reconnection with exponential backoff
- **Session Persistence**: Context preservation across reconnections
- **Health Monitoring**: Connection health checks and metrics

**Message Processing**
- **Async Processing**: Non-blocking message handling
- **Queue Management**: Message queuing for reliability
- **Error Handling**: Graceful error recovery and user notification
- **Performance Optimization**: Message batching and compression

## CopilotKit Integration

### React Hooks Architecture

CopilotKit v1.10.5 provides comprehensive React integration with advanced AI capabilities <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>, including generative UI, human-in-the-loop workflows, and seamless state management for healthcare applications.

**Core Hooks** <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **useCoAgent**: Advanced hook for AI agent interactions with healthcare context and state management
- **useCopilotAction**: Healthcare-specific actions with compliance validation and generative UI support
- **useCopilotChat**: Real-time chat interface with streaming and message management
- **useHealthcareState**: Specialized state management for clinical data with LGPD compliance
- **useCompliance**: Real-time compliance validation and monitoring

**Advanced Features** <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **Generative UI**: Dynamic UI generation based on AI responses and clinical context
- **Human-in-the-Loop**: Built-in approval workflows with `renderAndWaitForResponse` for critical healthcare decisions
- **Streaming Support**: Real-time response streaming with intermediate state updates
- **Framework Agnostic**: Works with React, Next.js, and AG-UI Protocol seamlessly

### Healthcare Actions

**Clinical Decision Support** <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **Patient Assessment**: AI-powered clinical evaluation with compliance validation
- **Treatment Planning**: Evidence-based recommendations with contraindication analysis
- **Risk Assessment**: Automated risk scoring with human oversight capabilities
- **Documentation**: AI-assisted clinical documentation with audit trails

**Human-in-the-Loop Workflows**
```typescript
// Example: Treatment approval workflow with human oversight
useCopilotAction({
  name: "treatment_approval",
  renderAndWaitForResponse: ({ args, status, respond }) => {
    return (
      <TreatmentApprovalDialog
        treatment={args.treatment}
        isExecuting={status === "executing"}
        onApprove={() => respond?.({ approved: true, timestamp: new Date() })}
        onReject={() => respond?.({ approved: false, reason: "Clinical contraindication" })}
      />
    );
  }
});
```

### State Management

**Healthcare Context**
- **Patient Context**: Secure patient data management with LGPD compliance
- **Session State**: Clinical session management with audit trails
- **Professional Context**: Role-based context with scope validation
- **Compliance State**: Real-time compliance status and validation

**Performance Optimization**
- **Selective Updates**: Optimized re-rendering for clinical workflows
- **Caching Strategy**: Intelligent caching of AI responses and clinical data
- **Background Sync**: Offline capability with background synchronization
- **Memory Management**: Efficient memory usage for long clinical sessions

## Security Architecture

### Multi-Layer Security

**Authentication Layer**
- **Primary**: Supabase Auth with MFA support for healthcare professionals
- **Biometric**: WebAuthn integration for passwordless authentication
- **Session Management**: Secure JWT tokens with healthcare-specific claims
- **Professional Validation**: Real-time professional council verification

**Authorization Layer**
- **Role-Based Access Control (RBAC)**: Professional council-based permissions
- **Attribute-Based Access Control (ABAC)**: Context-aware access decisions
- **Resource-Level Security**: Fine-grained access to clinical data
- **Audit Integration**: Complete access logging for compliance

**Data Security Layer**
- **Encryption at Rest**: AES-256 encryption for all sensitive healthcare data
- **Encryption in Transit**: TLS 1.3 for all communications
- **Key Management**: Secure key rotation and healthcare-specific key isolation
- **Data Masking**: Dynamic data masking for non-authorized access

### Compliance Implementation

**LGPD Compliance**
- **Consent Management**: Granular consent tracking with versioning
- **Data Subject Rights**: Automated data access, portability, and deletion
- **Purpose Limitation**: Strict data usage validation against specified purposes
- **Data Minimization**: Automatic validation of data collection necessity

**Healthcare Regulations**
- **ANVISA Compliance**: Medical device validation and regulatory reporting
- **CFM Standards**: Professional ethics and telemedicine compliance
- **Professional Councils**: Multi-council support (CFM, COREN, CFF, CNEP)
- **Audit Requirements**: Complete audit trails for regulatory inspections

## Performance & Monitoring

### Performance Targets

**Response Times**
- **AI Query Processing**: <2s for standard clinical queries
- **Real-time Updates**: <50ms latency for WebSocket communications
- **Database Queries**: <100ms for clinical data retrieval
- **Compliance Validation**: <200ms for regulatory checks

**Scalability Metrics**
- **Concurrent Users**: 1000+ simultaneous healthcare professionals
- **Message Throughput**: 10,000+ messages per minute
- **Uptime Target**: >99.9% availability for clinical operations
- **Error Rate**: <0.1% for critical healthcare functions

### Monitoring Implementation

**Application Monitoring**
- **Performance Metrics**: Response times, throughput, error rates
- **Business Metrics**: Clinical query success rates, compliance validation rates
- **User Experience**: Core Web Vitals, interaction metrics for healthcare workflows
- **AI Performance**: Model accuracy, response quality, token usage optimization

**Healthcare-Specific Monitoring**
- **Compliance Metrics**: LGPD validation success rates, audit trail completeness
- **Clinical Safety**: Error detection in AI recommendations, safety alert response times
- **Professional Usage**: Usage patterns by professional council type
- **Data Security**: Access pattern analysis, anomaly detection

**Alerting Strategy**
- **Critical Alerts**: System failures, security breaches, compliance violations
- **Performance Alerts**: Response time degradation, error rate increases
- **Business Alerts**: Unusual usage patterns, clinical safety concerns
- **Compliance Alerts**: Regulatory validation failures, audit trail gaps

### Integration Patterns

#### Framework Ecosystem Integration

**Supported Agent Frameworks** <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **LangGraph**: Partnership integration with comprehensive docs and demos
- **CrewAI**: Partnership integration for multi-agent workflows
- **Mastra**: 1st party integration for modern agent development
- **AG2**: 1st party integration for multi-agent systems
- **Pydantic AI**: 1st party integration with type-safe agent development
- **LlamaIndex**: 1st party integration for RAG-based agents
- **Vercel AI SDK**: Community integration (in progress)
- **OpenAI Agent SDK**: Community integration (in progress)

**Multi-Language SDK Support** <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **TypeScript/JavaScript**: Full-featured SDK with React integration
- **Python**: Comprehensive SDK for backend agent development
- **Kotlin**: Community-supported SDK for Android/JVM applications
- **Additional Languages**: .NET, Nim, Golang, Rust, Java (in progress)

#### AI Provider Integration

**Primary Providers**
- **OpenAI Integration**: GPT-5-mini for primary clinical reasoning with function calling
- **Google AI Integration**: Gemini Flash 2.5 for secondary processing and cost optimization
- **Vercel AI SDK**: Unified interface for multi-provider management with streaming support <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **Custom Models**: Integration points for specialized healthcare models

**Provider Management**
- **Health Monitoring**: Real-time provider health checks and performance metrics
- **Intelligent Failover**: Automatic provider switching with exponential backoff
- **Cost Optimization**: Dynamic provider selection based on query complexity
- **Usage Analytics**: Real-time monitoring of AI service usage and costs

**Healthcare System Integration**
- **Electronic Health Records**: FHIR-based integration for clinical data
- **Laboratory Systems**: Real-time lab result integration and analysis
- **Pharmacy Systems**: Prescription validation and drug interaction checking
- **Medical Device Integration**: ANVISA-compliant device data integration

**Brazilian Compliance Integration**
- **Government APIs**: Integration with Brazilian healthcare authorities
- **Professional Councils**: Real-time validation with CFM, COREN, CFF, CNEP
- **Tax Systems**: Integration with Brazilian tax and billing systems
- **Regulatory Reporting**: Automated compliance reporting and submission

### API Architecture

**tRPC Integration**
- **Type-Safe APIs**: End-to-end TypeScript for all AI service endpoints
- **Real-time Subscriptions**: WebSocket-based real-time updates
- **Middleware Composition**: Layered security, validation, and compliance checks
- **Error Handling**: Comprehensive error handling with healthcare-specific responses

**Endpoint Categories**
- **Clinical Endpoints**: Patient assessment, treatment planning, decision support
- **Compliance Endpoints**: LGPD validation, ANVISA checking, audit logging
- **Administrative Endpoints**: User management, professional validation, system health
- **Integration Endpoints**: External system integration and data synchronization

## Deployment Architecture

### Environment Strategy

**Production Environment**
- **High Availability**: Multi-region deployment with automatic failover
- **Load Balancing**: Intelligent traffic distribution across AI service instances
- **Auto-scaling**: Dynamic resource allocation based on clinical workload
- **Disaster Recovery**: Automated backup and recovery for healthcare continuity

**Security Deployment**
- **Network Security**: VPC isolation with healthcare-specific security groups
- **Certificate Management**: Automated SSL/TLS certificate management
- **Secrets Management**: Secure storage and rotation of API keys and credentials
- **Compliance Validation**: Automated compliance checking in deployment pipeline

### Infrastructure Components

**Core Infrastructure**
- **Vercel Platform**: Primary hosting with Brazilian edge locations (São Paulo)
- **Supabase**: PostgreSQL database with real-time capabilities
- **Redis Cache**: High-performance caching for AI responses and session data
- **CDN**: Global content delivery with healthcare data residency compliance

**AI Infrastructure**
- **Provider Endpoints**: Secure connections to OpenAI and Google AI services
- **Model Management**: Version control and deployment of custom healthcare models
- **Response Caching**: Intelligent caching of AI responses for performance
- **Usage Monitoring**: Real-time monitoring of AI service usage and costs

## Best Practices

### Development Guidelines

**Code Quality**
- **Type Safety**: Strict TypeScript configuration for healthcare data integrity
- **Testing Strategy**: Comprehensive testing including compliance validation
- **Security Reviews**: Mandatory security reviews for all AI-related code
- **Performance Testing**: Regular performance testing under clinical workloads

**Healthcare Compliance**
- **Data Handling**: Strict protocols for handling sensitive healthcare data
- **Audit Logging**: Complete audit trails for all AI interactions
- **Error Handling**: Healthcare-appropriate error messages and recovery
- **Documentation**: Comprehensive documentation for regulatory compliance

### Operational Excellence

**Monitoring & Alerting**
- **Proactive Monitoring**: Early detection of performance and security issues
- **Incident Response**: Rapid response procedures for healthcare-critical issues
- **Compliance Monitoring**: Continuous monitoring of regulatory compliance
- **Performance Optimization**: Regular optimization based on clinical usage patterns

**Security Operations**
- **Regular Security Audits**: Periodic security assessments and penetration testing
- **Vulnerability Management**: Rapid patching and vulnerability remediation
- **Access Reviews**: Regular review of user access and permissions
- **Incident Management**: Comprehensive incident response for security events

## Future Enhancements

### Planned Improvements

**Advanced AI Capabilities** <mcreference link="https://github.com/CopilotKit/CopilotKit" index="0">0</mcreference>
- **Custom Healthcare Models**: Fine-tuned models for Brazilian aesthetic procedures
- **Enhanced Generative UI**: More sophisticated UI generation based on clinical context
- **Advanced Human-in-the-Loop**: Expanded approval workflows for complex medical decisions
- **Multi-Modal AI**: Integration of text, image, and structured data processing

**Enhanced Integration** <mcreference link="https://github.com/ag-ui-protocol/ag-ui" index="1">1</mcreference>
- **Expanded Framework Support**: Additional agent frameworks and language SDKs
- **Mobile Applications**: Native mobile apps with offline AI capabilities
- **Enhanced Protocol**: Extended AG-UI event types for specialized healthcare workflows
- **Cross-Platform SDKs**: Broader language and platform support

**Compliance Evolution**
- **Regulatory Automation**: Automated compliance reporting and validation
- **International Standards**: Support for international healthcare standards
- **Advanced Audit**: Enhanced audit capabilities with AI-powered analysis
- **Privacy Enhancement**: Advanced privacy-preserving AI techniques

---

**Document Status**: ✅ Enhanced Architecture Reference  
**Enhanced With**: CopilotKit v1.10.5 + AG-UI Protocol latest features  
**Focus**: Modern AI agents architecture with advanced capabilities  
**Compliance**: Brazilian healthcare regulations (LGPD, ANVISA, CFM)  
**Last Updated**: 2025-01-25  
**Next Review**: 2025-04-25