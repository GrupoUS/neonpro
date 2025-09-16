# Feature: Enhanced AI Chatbot System with Multi-Model Support

**Last Updated**: September 15, 2025  
**Status**: Specification Complete, Implementation Pending  
**Archon Project**: b9bc15e9-d82d-4d22-a5e7-f6d55f00147a  
**PRD Document**: af0cd577-057a-4cf9-8f3b-4eaabb1ce6f1  
**Implementation Plan**: f68482f2-0d6b-4adc-949b-333b0fa7a678  

## Feature Overview and Business Context

This enhancement transforms NeonPro's existing AI chat capability into a comprehensive business intelligence assistant. The system integrates multiple premium AI models (Claude 3 Haiku, Gemini 2.5 Flash, GPT-5 mini) with sophisticated business plan-based access control, enabling natural language CRUD operations across all business data domains (Clients, Finance, Agenda) while maintaining strict healthcare compliance standards.

**Business Value**: Reduces manual data query time by 80%, drives premium subscription conversions through exclusive model access, and positions NeonPro as market leader in AI-powered healthcare administration.

## Technical Architecture Decisions from Research

### AI SDK v5 Integration Strategy
- **Decision**: Upgrade to AI SDK v5 for enhanced streaming and tool calling capabilities
- **Rationale**: v5 provides improved UIMessage types, better streaming performance, and comprehensive tool integration patterns
- **Implementation**: Use `streamText`, `convertToModelMessages`, and tool framework for database operations

### Multi-Provider Architecture
- **Decision**: Implement unified provider interface with automatic failover
- **Providers**: OpenAI (GPT-5 mini), Anthropic (Claude 3 Haiku), Google AI (Gemini 2.5 Flash)
- **Failover Logic**: Primary → Secondary → Tertiary with health monitoring and circuit breaker patterns

### UI Component Library Strategy
- **AI SDK Elements**: Core chat components (Context, Conversation, Image, PromptInput, Reasoning, Response, Suggestion, Task, OpenInChat)
- **KokonutUI**: Enhanced AI interface elements (ai-prompt, ai-input-search, ai-loading)
- **Integration**: Unified theming with NeonPro design system, responsive behavior across devices

### Business Plan Gating Architecture
- **Free Plan**: GPT-5 mini access only, read-only operations, daily query limits
- **Premium Plan**: All models available, full CRUD operations, unlimited queries
- **Implementation**: Middleware-based plan validation with seamless upgrade prompts

## Implementation Approach and Key Components

### Core System Architecture
```
Frontend (Next.js 15 + React 19)
├── AI Chat Interface (AI SDK Elements + KokonutUI)
├── Settings & Configuration Page
└── Upgrade Flow Components

API Layer (Hono Framework)
├── /v1/ai-chat/stream - Enhanced streaming endpoint
├── /v1/ai-chat/suggestions - Context-aware suggestions  
├── /v1/tools/* - CRUD operation endpoints
└── /v1/settings/* - Configuration management

AI Services Layer
├── Multi-Provider Manager (OpenAI, Anthropic, Google)
├── Business Plan Gating Logic
├── Natural Language Query Parser
└── Tool Execution Framework

Data Layer (Supabase + RLS)
├── Enhanced Message Storage
├── User Preferences & Settings
├── Audit Logging & Compliance
└── Cross-Domain Query Engine
```

### Key Technical Components

#### 1. Enhanced Message Types (`packages/types/src/ai-chat.ts`)
```typescript
interface EnhancedUIMessage extends UIMessage {
  metadata: {
    modelUsed: 'claude-3-haiku' | 'gemini-2.5-flash' | 'gpt-5-mini';
    userPlan: 'free' | 'premium';
    queryDomains: ('clients' | 'finance' | 'agenda')[];
    processingTime: number;
  };
  businessContext?: {
    clinicId: string;
    userId: string;
    permissions: string[];
  };
}
```

#### 2. Multi-Provider Interface (`packages/core-services/src/ai/providers/`)
```typescript
interface AIProvider {
  name: string;
  model: string;
  isHealthy(): Promise<boolean>;
  streamText(params: StreamTextParams): Promise<StreamTextResult>;
  supportedFeatures: ('tools' | 'streaming' | 'reasoning')[];
}
```

#### 3. CRUD Tool Framework (`packages/core-services/src/ai/tools/`)
```typescript
const createDataTool = (domain: 'clients' | 'finance' | 'agenda') => tool({
  description: `Perform CRUD operations on ${domain} data`,
  inputSchema: z.object({
    operation: z.enum(['create', 'read', 'update', 'delete']),
    query: z.string(),
    data: z.object({}).optional()
  }),
  execute: async ({ operation, query, data }, context) => {
    // Validate permissions, execute operation, log audit trail
  }
});
```

## API Endpoints and Data Models

### Enhanced Chat Streaming API
- **Endpoint**: `POST /v1/ai-chat/stream`
- **Features**: Multi-model support, tool calling, business context injection
- **Headers**: `X-Chat-Model`, `X-User-Plan`, `X-Processing-Time`
- **Response**: Server-Sent Events with text and tool execution results

### CRUD Operation Tools
- **Clients**: `/v1/tools/clients` - Customer data management and queries
- **Finance**: `/v1/tools/finance` - Financial operations, reporting, analytics
- **Agenda**: `/v1/tools/agenda` - Calendar management, scheduling optimization
- **Cross-Domain**: `/v1/tools/business-intelligence` - Multi-domain analytical queries

### Configuration Management
- **Settings**: `/v1/settings/ai` - Model preferences, usage limits, API configurations
- **User Preferences**: `/v1/settings/user` - Interface customization, notification preferences

### Data Models

#### Enhanced Chat Messages
```sql
-- Migration: Enhanced message storage with multi-model metadata
ALTER TABLE chat_messages ADD COLUMN metadata JSONB;
ALTER TABLE chat_messages ADD COLUMN business_context JSONB;
ALTER TABLE chat_messages ADD COLUMN tool_calls JSONB[];
CREATE INDEX idx_chat_messages_metadata ON chat_messages USING GIN (metadata);
```

#### User Preferences & Plan Data
```sql
-- Migration: User AI preferences and plan tracking
CREATE TABLE user_ai_preferences (
  user_id UUID REFERENCES auth.users(id),
  preferred_model TEXT DEFAULT 'gpt-5-mini',
  daily_query_count INTEGER DEFAULT 0,
  daily_query_limit INTEGER DEFAULT 20,
  plan_type TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}'::jsonb
);
```

## Testing Strategy and Acceptance Criteria

### Test-First Development Approach
1. **Contract Tests**: OpenAPI validation for all tool endpoints
2. **Integration Tests**: AI provider integration with mock responses
3. **E2E Tests**: Complete user workflows from UI to database
4. **Performance Tests**: Response time validation under load

### Acceptance Criteria
- **Model Access**: Free users limited to GPT-5 mini, premium users access all models
- **CRUD Operations**: Natural language successfully converts to database operations
- **Response Times**: <2s for simple queries, <5s for complex multi-domain operations
- **Accessibility**: WCAG 2.1 AA compliance for all UI components
- **Security**: LGPD/ANVISA compliance validated, audit trails functional

### Testing Commands
```bash
# Contract testing
pnpm --filter @neonpro/api test:contract

# Integration testing  
pnpm --filter @neonpro/api test:integration

# E2E testing
pnpm --filter @neonpro/web test:e2e

# Performance validation
pnpm --filter @neonpro/api test:performance
```

## Compliance Considerations

### LGPD (Brazilian Data Protection Law)
- **Data Minimization**: Only process healthcare data necessary for query execution
- **Consent Management**: Explicit consent for AI processing of patient data
- **Data Retention**: Configurable message retention with automatic cleanup
- **Access Controls**: Role-based access with audit logging

### ANVISA Healthcare Regulations
- **Equipment Compliance**: Ensure AI models meet healthcare software standards
- **Data Security**: End-to-end encryption for all patient information
- **Audit Requirements**: Comprehensive logging of all AI interactions

### Security Implementation
- **Authentication**: JWT-based with role validation
- **Authorization**: Plan-based feature gating with secure model access
- **Encryption**: TLS 1.3 for transport, AES-256 for data at rest
- **Monitoring**: Real-time security event detection and alerting

## Dependencies and Integration Points

### External Dependencies
- **AI Providers**: OpenAI, Anthropic, Google AI APIs with unified interface
- **UI Libraries**: AI SDK Elements v1.x, KokonutUI components
- **Framework**: Next.js 15, React 19, TypeScript 5, AI SDK v5

### Internal Integration Points
- **Authentication**: Existing Supabase Auth with role-based access control
- **Database**: Current Supabase schema with RLS policies for data security
- **Payment**: Integration with existing subscription management for plan gating
- **Monitoring**: Current observability stack enhanced with AI-specific metrics

## Risk Assessment and Mitigation Strategies

### Technical Risks
1. **AI Provider Outages** (High likelihood, Medium impact)
   - **Mitigation**: Multi-provider failover with health monitoring
   - **Fallback**: Graceful degradation to available models

2. **Performance Degradation** (Medium likelihood, High impact)
   - **Mitigation**: Caching layer, query optimization, connection pooling
   - **Monitoring**: Real-time performance dashboards with alerts

3. **Complex Query Parsing** (Medium likelihood, Medium impact)
   - **Mitigation**: Comprehensive test coverage, fallback to simple operations
   - **User Experience**: Clear error messages with suggested alternatives

### Business Risks
1. **Low Premium Conversion** (Medium likelihood, High impact)
   - **Mitigation**: Compelling premium features, trial periods, usage analytics
   - **Strategy**: A/B testing for upgrade prompts and feature showcasing

### Security Risks
1. **Data Privacy Violations** (Low likelihood, Very high impact)
   - **Mitigation**: Comprehensive compliance validation, regular audits
   - **Controls**: PII redaction, consent validation, access logging

## Links to Documentation

- **PRD Document**: [Archon Document af0cd577-057a-4cf9-8f3b-4eaabb1ce6f1](https://archon.link/af0cd577-057a-4cf9-8f3b-4eaabb1ce6f1)
- **Implementation Plan**: [Archon Document f68482f2-0d6b-4adc-949b-333b0fa7a678](https://archon.link/f68482f2-0d6b-4adc-949b-333b0fa7a678)
- **Archon Project**: [NeonPro Enhanced AI Chatbot System](https://archon.link/b9bc15e9-d82d-4d22-a5e7-f6d55f00147a)

## Next Steps

1. **Phase 1**: Begin contract development and AI SDK Elements installation
2. **Component Setup**: Install and configure all UI components with proper theming
3. **Provider Integration**: Implement multi-model provider interface with failover
4. **Tool Development**: Create CRUD operation tools for all business domains
5. **Testing & Deployment**: Comprehensive quality assurance and production rollout

This enhancement represents a significant leap forward in NeonPro's AI capabilities, providing users with a sophisticated, healthcare-compliant business intelligence assistant that drives both user satisfaction and business growth through premium model access.