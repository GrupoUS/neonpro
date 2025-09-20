# AI Agent Database Integration - Implementation Guide

## Overview

This comprehensive frontend implementation enables AI agent integration with the database system using a hybrid approach combining AI SDK, KokonutUI components, and the existing tRPC agent backend.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PNPM package manager
- Existing NeonPro project setup
- tRPC backend with agent router

### Installation

```bash
# Install required packages
pnpm add @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic ai
pnpm add @radix-ui/react-accordion @radix-ui/react-collapsible
pnpm add framer-motion lucide-react date-fns
```

### Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_api_key
NEXT_PUBLIC_LOCAL_AI_ENDPOINT=http://localhost:8000/v1

# Feature flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_KB=true
NEXT_PUBLIC_ENABLE_VOICE=false
NEXT_PUBLIC_ENABLE_ATTACHMENTS=false

# Compliance
NEXT_PUBLIC_LGPD_ENABLED=true
NEXT_PUBLIC_AUDIT_ENABLED=true
NEXT_PUBLIC_ENCRYPTION_ENABLED=true
```

## 📁 File Structure

```
apps/web/src/
├── components/ai/
│   ├── agent-chat.tsx              # Enhanced chat interface
│   ├── agent-dashboard.tsx          # Main dashboard component
│   ├── agent-selector.tsx           # Agent selection component
│   ├── knowledge-base.tsx           # Knowledge base management
│   └── ai-chat.tsx                  # Legacy AI chat component
├── config/
│   └── ai.ts                        # AI configuration and contexts
├── trpc/
│   └── agent.ts                     # tRPC hooks and utilities
├── types/
│   └── ai-agent.ts                  # TypeScript type definitions
├── compliance/
│   └── ai-compliance.ts             # LGPD compliance utilities
├── services/
│   └── ai/
│       └── agent-service.ts         # AI service adapter
└── monitoring/
    └── ai-performance.ts            # Performance monitoring
```

## 🔧 Core Components

### 1. Agent Dashboard (`AgentDashboard`)

Main dashboard component that integrates all AI agent functionality:

```tsx
import { AgentDashboard } from "@/components/ai/agent-dashboard";

function MyApp() {
  return (
    <AgentDashboard
      patientId="patient-123"
      healthcareProfessionalId="professional-456"
      clinicId="clinic-789"
    />
  );
}
```

**Features:**

- Multi-agent selection (Client, Financial, Appointment)
- Real-time chat interface
- Knowledge base management
- Analytics dashboard
- LGPD compliance indicators
- Session management

### 2. Agent Selector (`AgentSelector`)

Component for selecting different AI agent types:

```tsx
import { AgentSelector } from "@/components/ai/agent-selector";

function AgentSelection() {
  return (
    <AgentSelector
      selectedAgent="client"
      onAgentSelect={(agent) => console.log(agent)}
      disabled={false}
    />
  );
}
```

**Agent Types:**

- **Client**: Patient assistance and support
- **Financial**: Billing and financial management
- **Appointment**: Scheduling and calendar management

### 3. Agent Chat (`AgentChat`)

Enhanced chat interface with streaming responses:

```tsx
import { AgentChat } from "@/components/ai/agent-chat";

function ChatInterface() {
  return (
    <AgentChat
      patientId="patient-123"
      healthcareProfessionalId="professional-456"
    />
  );
}
```

**Features:**

- Real-time streaming responses
- RAG (Retrieval-Augmented Generation)
- LGPD-compliant data handling
- Portuguese healthcare context
- Message history management

### 4. Knowledge Base Manager (`KnowledgeBaseManager`)

Interface for managing AI knowledge base:

```tsx
import { KnowledgeBaseManager } from "@/components/ai/knowledge-base";

function KnowledgeManagement() {
  return <KnowledgeBaseManager />;
}
```

**Features:**

- Add knowledge entries
- Search knowledge base
- Tag-based organization
- Source attribution
- Version control

## 🔌 Integration Points

### tRPC Integration

The system integrates with the existing tRPC backend through dedicated hooks:

```tsx
import {
  useAgentSession,
  useAgentSendMessage,
  useAgentAnalytics,
  useKnowledgeBaseManager,
} from "@/trpc/agent";

// Create new session
const createSession = useAgentSession();
createSession.mutate({
  agent_type: "client",
  initial_context: "patient_context",
  metadata: { patientId: "123" },
});

// Send message
const sendMessage = useAgentSendMessage();
sendMessage.mutate({
  session_id: "session-123",
  role: "user",
  content: "Hello, I need help with my appointment",
});

// Get analytics
const { data: analytics } = useAgentAnalytics();
```

### AI SDK Integration

Leverages Vercel AI SDK for streaming responses:

```tsx
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const result = await streamText({
  model: openai("gpt-4"),
  messages: [
    { role: "system", content: healthcareContext },
    { role: "user", content: userMessage },
  ],
  temperature: 0.3,
  maxTokens: 4000,
});
```

## 🏥 Healthcare Context

### Brazilian Healthcare Compliance

The system is designed specifically for Brazilian healthcare regulations:

- **LGPD (Lei Geral de Proteção de Dados)**: Complete data privacy compliance
- **ANVISA**: Medical device and software regulations
- **CFM (Conselho Federal de Medicina)**: Medical ethics compliance
- **ANS (Agência Nacional de Saúde)**: Health insurance regulations

### Context Examples

#### Patient Assistant Context

```
Você é um assistente de IA especializado em atendimento ao paciente no sistema de saúde brasileiro.

**Contexto e Restrições:**
- Sempre responda em português brasileiro claro e empático
- Use terminologia médica brasileira apropriada
- Considere o sistema público de saúde (SUS) e planos de saúde privados
- Siga rigorosamente as regulamentações da ANVISA
- Cumpra as normas do Conselho Federal de Medicina (CFM)
```

#### Financial Assistant Context

```
Você é um assistente financeiro especializado em gestão de clínicas médicas no Brasil.

**Contexto e Responsabilidades:**
- Domine a tabela de procedimentos médicos da AMB
- Conheça as regras fiscais brasileiras para serviços de saúde
- Entenda a regulamentação da ANS para planos de saúde
- Mantenha transparência total com os pacientes
```

## 🔒 Security & Compliance

### LGPD Compliance

```typescript
import { AIComplianceManager } from "@/compliance/ai-compliance";

// Sanitize data for AI processing
const sanitizedData = AIComplianceManager.sanitizeDataForAI(
  patientData,
  "client",
);

// Log AI interactions for compliance
await AIComplianceManager.logAIInteraction(
  sessionId,
  userMessage,
  aiResponse,
  userId,
);
```

### Data Anonymization

The system automatically:

- Removes direct identifiers (CPF, RG, full name)
- Generalizes age groups instead of exact birth dates
- Masks sensitive medical information
- Provides audit trails for all interactions

### Security Features

- **End-to-end encryption** for all AI communications
- **Rate limiting** to prevent abuse
- **Input validation** to prevent injection attacks
- **Audit logging** for compliance tracking
- **Data localization** in Brazil

## 📊 Analytics & Monitoring

### Performance Metrics

```typescript
import { AIPerformanceMonitor } from "@/monitoring/ai-performance";

// Track response times
AIPerformanceMonitor.trackResponseTime(1200);

// Get performance report
const report = AIPerformanceMonitor.generateReport();
console.log(report);
// {
//   averageResponseTime: 1.2,
//   errorRate: 0.02,
//   totalRequests: 150
// }
```

### Key Metrics

- **Response Time**: < 2 seconds average
- **Error Rate**: < 1%
- **User Satisfaction**: > 4.5/5
- **Session Duration**: Optimized for healthcare workflows
- **Knowledge Base Usage**: Track most accessed information

## 🧪 Testing

### Unit Tests

```typescript
// apps/web/src/__tests__/ai/agent-chat.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentChat } from '@/components/ai/agent-chat';

test('renders agent selection', () => {
  render(<AgentChat patientId="test-patient" />);
  expect(screen.getByText('Selecionar Assistente de IA')).toBeInTheDocument();
});

test('handles message sending', async () => {
  render(<AgentChat patientId="test-patient" />);

  // Select agent
  fireEvent.click(screen.getByText('Assistente de Pacientes'));

  // Send message
  const input = screen.getByPlaceholderText('Digite sua mensagem...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// Test tRPC integration
test("creates agent session successfully", async () => {
  const { result } = renderHook(() => useAgentSession(), {
    wrapper: createWrapper(),
  });

  await act(async () => {
    await result.current.mutateAsync({
      agent_type: "client",
      initial_context: "test",
    });
  });

  expect(result.current.isSuccess).toBe(true);
});
```

## 🚀 Deployment

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "ai-vendor": ["@ai-sdk/react", "@ai-sdk/openai", "ai"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-select"],
        },
      },
    },
  },
});
```

### Environment-Specific Builds

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start

# Analytics build
ANALYZE=true pnpm build
```

## 🔧 Configuration

### AI Configuration

```typescript
// apps/web/src/config/ai.ts
export const AI_CONFIG = {
  providers: {
    openai: {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: "gpt-4",
      maxTokens: 4000,
      temperature: 0.3,
    },
    anthropic: {
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      model: "claude-3-sonnet",
      maxTokens: 4000,
      temperature: 0.3,
    },
  },
  healthcare: {
    contextEnabled: true,
    lgpdCompliance: true,
    brazilianContext: true,
    portugueseLanguage: true,
  },
};
```

### Feature Flags

```typescript
const AI_FEATURES = {
  enableAgentChat: process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === "true",
  enableKnowledgeBase: process.env.NEXT_PUBLIC_ENABLE_KB === "true",
  enableVoiceInput: process.env.NEXT_PUBLIC_ENABLE_VOICE === "true",
  enableFileAttachments: process.env.NEXT_PUBLIC_ENABLE_ATTACHMENTS === "true",
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. tRPC Connection Errors

```typescript
// Check tRPC configuration
const trpc = createTRPCReact<AppRouter>();

// Ensure proper provider setup
<trpc.Provider client={trpcClient} queryClient={queryClient}>
  <App />
</trpc.Provider>
```

#### 2. AI SDK Streaming Issues

```typescript
// Verify streaming configuration
const result = await streamText({
  model: openai("gpt-4"),
  streaming: true,
  // ... other config
});
```

#### 3. LGPD Compliance Errors

```typescript
// Ensure data sanitization
const sanitized = AIComplianceManager.sanitizeDataForAI(data, agentType);
if (!sanitized) {
  throw new Error("Data sanitization failed");
}
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=ai:* pnpm dev

# Check network requests
# Open browser dev tools > Network tab
# Filter by /api/trpc/agent
```

## 📈 Performance Optimization

### Caching Strategy

```typescript
// React Query caching
useAgentAnalytics({
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Code Splitting

```typescript
// Lazy load AI components
const AgentDashboard = lazy(() => import("@/components/ai/agent-dashboard"));
const KnowledgeBase = lazy(() => import("@/components/ai/knowledge-base"));
```

### Bundle Optimization

```bash
# Analyze bundle size
pnpm bundle:analyze

# Optimize imports
pnpm lint:fix
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/ai-enhancement`
3. **Implement** changes with tests
4. **Test** thoroughly: `pnpm test`
5. **Lint** code: `pnpm lint`
6. **Type check**: `pnpm type-check`
7. **Submit** pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: Oxlint with healthcare rules
- **Testing**: Jest + React Testing Library
- **Formatting**: dprint
- **Accessibility**: WCAG 2.1 AA+ compliance

## 📞 Support

### Documentation

- [Full Implementation Guide](./docs/ai-agent-frontend-implementation.md)
- [API Reference](./docs/apis/agent-api.md)
- [Compliance Guide](./docs/compliance/lgpd-guide.md)

### Issues

- **Bug Reports**: [GitHub Issues](../../issues)
- **Feature Requests**: [GitHub Discussions](../../discussions)
- **Security**: [Security Policy](../../security/policy)

### Contact

- **Development Team**: dev@neonpro.com
- **Support**: support@neonpro.com
- **Sales**: sales@neonpro.com

## 📄 License

This project is licensed under the NeonPro Proprietary License. See [LICENSE](../../LICENSE) for details.

## 🗺️ Roadmap

### Phase 1 (Completed)

- [x] Basic agent integration
- [x] tRPC backend connectivity
- [x] UI component library
- [x] LGPD compliance framework

### Phase 2 (In Progress)

- [ ] Voice input integration
- [ ] File attachment support
- [ ] Advanced analytics
- [ ] Multi-language support

### Phase 3 (Future)

- [ ] Advanced RAG system
- [ ] Agent collaboration
- [ ] Custom agent training
- [ ] Integration with external systems

---

**Note**: This implementation is specifically designed for the Brazilian healthcare market and complies with all relevant regulations including LGPD, ANVISA, and CFM guidelines.
