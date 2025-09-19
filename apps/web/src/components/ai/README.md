# AI Chat Components for NeonPro

Comprehensive suite of AI chat components built with AI SDK foundation, enhanced with healthcare compliance and Brazilian Portuguese support.

## Components

### 🎯 EnhancedAIChat
The main chat interface component with full feature set.

**Features:**
- AI SDK integration for streaming responses
- tRPC agent backend integration
- Voice input with Brazilian Portuguese support
- File attachment capability
- Real-time search functionality
- LGPD compliance with consent management
- Mobile-optimized design
- Accessibility compliance (WCAG 2.1 AA+)
- Multiple AI model support
- Healthcare context awareness

**Usage:**
```tsx
import { EnhancedAIChat } from '@/components/ai';

<EnhancedAIChat
  patientContext={{
    patientId: '123',
    patientName: 'Maria Silva',
    cpf: '123.456.789-00',
  }}
  healthcareProfessional={{
    id: '456',
    name: 'Dr. Carlos Mendes',
    specialty: 'Clínico Geral',
    crmNumber: '12345-SP',
  }}
  sessionType="client"
  showVoiceInput={true}
  showFileAttachment={true}
  lgpdConsent={{
    canStoreHistory: true,
    dataRetentionDays: 30,
    requiresExplicitConsent: false,
  }}
/>
```

### 💬 AIChatInput
Enhanced input component with voice and file attachment capabilities.

**Features:**
- Auto-resizing textarea
- Voice recognition (Portuguese BR)
- File attachment with preview
- Model selection dropdown
- Search integration
- Healthcare compliance indicators

**Usage:**
```tsx
import { AIChatInput } from '@/components/ai';

<AIChatInput
  value={input}
  onChange={setInput}
  onSubmit={handleSubmit}
  showVoiceInput={true}
  showFileAttachment={true}
  availableModels={availableModels}
  selectedModel={selectedModel}
  onModelChange={setModel}
/>
```

### 📨 AIMessageDisplay
Advanced message display component with streaming and markdown support.

**Features:**
- Real-time streaming text
- Safe markdown rendering
- Source citations
- Message actions (copy, speak, edit, delete)
- Healthcare context indicators
- Accessibility features

**Usage:**
```tsx
import { AIMessageDisplay } from '@/components/ai';

<AIMessageDisplay
  content={message.content}
  role={message.role}
  timestamp={message.timestamp}
  messageId={message.id}
  isStreaming={message.isStreaming}
  healthcareContext={message.healthcareContext}
  sources={message.sources}
  showActions={true}
/>
```

### 🎪 AIChatDemo
Comprehensive demo component showcasing all features.

**Features:**
- Interactive scenario selection
- Context switching
- Feature demonstration
- Test mode capabilities

**Usage:**
```tsx
import { AIChatDemo } from '@/components/ai';

<AIChatDemo
  showScenarios={true}
  testMode={false}
/>
```

## Types

All components include comprehensive TypeScript types:

```typescript
import type {
  ChatMessage,
  AIModel,
  ChatSession,
  HealthcareContext,
  LGPDSettings,
  // ... many more types
} from '@/components/ai';
```

## Key Features

### 🏥 Healthcare Compliance
- **LGPD Compliant**: Full compliance with Brazilian data protection laws
- **Consent Management**: Explicit consent mechanisms with audit trails
- **Data Retention**: Configurable retention policies
- **Patient Privacy**: Automatic data masking and anonymization
- **Healthcare Context**: Specialized handling of medical information

### 🎤 Voice Input
- **Brazilian Portuguese**: Optimized for PT-BR recognition
- **Medical Terminology**: Handles medical terms accurately
- **Privacy**: Local processing when possible
- **Fallback**: Text input always available

### 🔍 Search & Knowledge
- **Real-time Search**: Search across conversations and knowledge base
- **RAG Integration**: Retrieval-Augmented Generation capabilities
- **Source Citations**: Automatic citation of information sources
- **Medical Guidelines**: Access to up-to-date medical guidelines

### ♿ Accessibility
- **WCAG 2.1 AA+**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard support
- **Screen Reader**: Optimized for screen readers
- **High Contrast**: High contrast mode support
- **Text-to-Speech**: Built-in speech synthesis

### 📱 Mobile Optimization
- **Touch-Friendly**: Optimized for touch interactions
- **Responsive**: Adapts to all screen sizes
- **Performance**: Optimized for mobile networks
- **Gesture Support**: Swipe and tap gestures

## Integration

### Backend Requirements

The components integrate with your existing tRPC agent backend:

```typescript
// tRPC router setup
import { agentRouter } from '@/server/api/routers/agent';

// App Router
export const appRouter = t.router({
  agent: agentRouter,
});
```

### AI SDK Setup

Install required dependencies:

```bash
npm install @ai-sdk/react @ai-sdk/openai
# or
pnpm add @ai-sdk/react @ai-sdk/openai
```

### API Routes

Create API routes for AI chat:

```typescript
// app/api/ai/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful AI assistant for NeonPro aesthetic clinic...`,
  });

  return result.toDataStreamResponse();
}
```

## Healthcare Context

### Patient Information
```typescript
const patientContext = {
  patientId: '123',
  patientName: 'Maria Silva',
  cpf: '123.456.789-00',
  dateOfBirth: new Date('1980-05-15'),
  medicalConditions: ['Hipertensão', 'Diabetes Tipo 2'],
  allergies: ['Penicilina'],
  currentMedications: ['Losartana', 'Metformina'],
};
```

### Professional Context
```typescript
const professionalContext = {
  id: '456',
  name: 'Dr. Carlos Mendes',
  specialty: 'Clínico Geral',
  crmNumber: '12345-SP',
  contact: {
    email: 'carlos.mendes@neonpro.com.br',
    phone: '(11) 98765-4321',
  },
};
```

## LGPD Compliance

### Consent Management
```typescript
const lgpdConsent = {
  canStoreHistory: true,
  dataRetentionDays: 30,
  requiresExplicitConsent: true,
  consentGiven: false, // Initially false
};
```

### Data Processing
The components automatically handle:
- Explicit consent before data collection
- Automatic data deletion after retention period
- Audit logging of all data access
- Patient data anonymization
- Secure data transmission

## Voice Recognition

### Browser Support
Voice recognition requires:
- Chrome/Edge (best support)
- Modern browser with Web Speech API
- Microphone permissions
- HTTPS connection

### Fallback
If voice recognition is not available:
- Shows clear error message
- Provides text input alternative
- Maintains full functionality

## Performance Optimization

### Streaming
- Real-time response streaming
- Chunked processing for large responses
- Progressive content rendering
- Caching of repeated queries

### Bundle Size
- Tree-shaking for unused features
- Lazy loading of heavy components
- Optimized imports
- Code splitting

## Testing

### Demo Component
Use the included demo component for testing:

```tsx
import { AIChatDemo } from '@/components/ai';

// Full feature demo
<AIChatDemo showScenarios={true} testMode={true} />

// Simple integration test
<EnhancedAIChat sessionType="general" />
```

### Test Scenarios
The demo includes predefined scenarios:
- General consultation
- Client service
- Appointment scheduling
- Financial inquiries

## Accessibility

### Keyboard Navigation
- Tab navigation through all elements
- Enter/Space for activation
- Escape for closing modals
- Arrow keys for navigation

### Screen Reader Support
- Proper ARIA labels
- Live regions for dynamic content
- Screen reader announcements
- Semantic HTML structure

## Customization

### Theming
Components use Tailwind CSS and support:
- Dark mode
- Custom color schemes
- Font size adjustments
- Contrast modes

### Styling
All components include:
- Consistent spacing
- Responsive design
- Hover states
- Focus indicators
- Loading states

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to these components:
1. Follow the established code patterns
2. Maintain accessibility standards
3. Update TypeScript types
4. Add comprehensive tests
5. Update documentation

## License

These components are part of the NeonPro platform and are subject to the project's license terms.

## Support

For issues or questions:
- Check the demo component for usage examples
- Review the TypeScript types for API documentation
- Test with different scenarios in the demo
- Contact the development team