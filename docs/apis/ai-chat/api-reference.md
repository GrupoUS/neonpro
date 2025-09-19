# AI Chat API Documentation

**Version**: Phase 1  
**Last Updated**: 2025-01-27  
**Status**: Implementation Complete  

## Overview

The AI Chat API provides LGPD-compliant conversational AI capabilities for healthcare professionals in Brazil. It supports contextual medical consultations, patient explanations, and treatment guidance while maintaining strict data privacy and audit requirements.

## Core Features

- **Multi-Provider AI**: OpenAI GPT-4 + Anthropic Claude with automatic failover
- **LGPD Compliance**: Automatic PII redaction, consent validation, audit logging
- **Session Management**: Secure session handling with automatic expiration
- **Rate Limiting**: Per-user and per-clinic limits to prevent abuse
- **Real-time Streaming**: Streaming responses for better user experience
- **Brazilian Healthcare Context**: Portuguese language, medical terminology, CFM compliance

## Base URL

```
Production: https://neonpro.com.br/api/v1/ai-chat
Development: http://localhost:3000/api/v1/ai-chat
```

## Authentication

All endpoints require valid authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

## Rate Limiting

- **Per User**: 60 requests per minute, 500 per hour
- **Per Clinic**: 1000 requests per minute, 5000 per hour
- **Streaming**: Separate limits for real-time interactions

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642781400
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Taxa de uso excedida. Tente novamente em alguns minutos.",
    "details": {
      "retryAfter": 60,
      "limit": "60/minute"
    }
  }
}
```

Common error codes:
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INVALID_INPUT`: Malformed request data
- `SESSION_EXPIRED`: Chat session expired
- `CONTENT_FILTERED`: Content blocked by safety filters
- `PROVIDER_ERROR`: AI provider service error
- `COMPLIANCE_VIOLATION`: LGPD or content policy violation

## Endpoints

### POST /sessions

Create a new AI chat session.

**Request Body:**
```json
{
  "context": {
    "type": "consultation" | "explanation" | "general",
    "patientId": "uuid", // Optional, for patient-specific context
    "clinicId": "uuid",
    "specialty": "string", // Medical specialty context
    "metadata": {} // Additional context
  },
  "preferences": {
    "provider": "openai" | "anthropic", // Optional, defaults to best available
    "language": "pt-BR", // Portuguese (Brazil)
    "streaming": true // Enable real-time streaming
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "expiresAt": "2025-01-27T15:30:00Z",
  "context": {
    "type": "consultation",
    "specialty": "cardiologia",
    "clinicId": "uuid"
  },
  "limits": {
    "maxMessages": 50,
    "maxTokens": 4000,
    "timeoutSeconds": 3600
  }
}
```

### POST /sessions/{sessionId}/messages

Send a message to an AI chat session.

**Request Body:**
```json
{
  "message": "Como interpretar este exame de ECG?",
  "attachments": [], // Future: support for image/document attachments
  "options": {
    "maxTokens": 500,
    "temperature": 0.7,
    "streaming": true
  }
}
```

**Response (Non-streaming):**
```json
{
  "messageId": "uuid",
  "response": "Para interpretar um ECG, observe primeiro o ritmo...",
  "metadata": {
    "tokensUsed": 245,
    "responseTime": 1200,
    "provider": "openai",
    "filtered": false,
    "piiDetected": false
  },
  "suggestions": [
    "Gostaria de mais detalhes sobre arritmias?",
    "Precisa de ajuda com outros exames?"
  ]
}
```

**Response (Streaming):**
```
data: {"type": "start", "messageId": "uuid"}

data: {"type": "token", "content": "Para"}

data: {"type": "token", "content": " interpretar"}

data: {"type": "token", "content": " um"}

data: {"type": "done", "metadata": {"tokensUsed": 245, "responseTime": 1200}}
```

### GET /sessions/{sessionId}

Get session details and message history.

**Response:**
```json
{
  "sessionId": "uuid",
  "createdAt": "2025-01-27T14:30:00Z",
  "expiresAt": "2025-01-27T15:30:00Z",
  "status": "active" | "expired" | "terminated",
  "context": {
    "type": "consultation",
    "specialty": "cardiologia",
    "clinicId": "uuid"
  },
  "messages": [
    {
      "messageId": "uuid",
      "timestamp": "2025-01-27T14:32:00Z",
      "role": "user",
      "content": "Como interpretar este exame de ECG?",
      "metadata": {}
    },
    {
      "messageId": "uuid", 
      "timestamp": "2025-01-27T14:32:02Z",
      "role": "assistant",
      "content": "Para interpretar um ECG...",
      "metadata": {
        "tokensUsed": 245,
        "provider": "openai"
      }
    }
  ],
  "usage": {
    "totalMessages": 2,
    "totalTokens": 245,
    "remainingMessages": 48
  }
}
```

### DELETE /sessions/{sessionId}

Terminate a chat session immediately.

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "terminated",
  "terminatedAt": "2025-01-27T14:35:00Z"
}
```

### GET /sessions

List user's active chat sessions.

**Query Parameters:**
- `limit`: Number of sessions to return (default: 10, max: 50)
- `offset`: Pagination offset
- `status`: Filter by status (active, expired, terminated)
- `clinicId`: Filter by clinic

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "uuid",
      "createdAt": "2025-01-27T14:30:00Z",
      "expiresAt": "2025-01-27T15:30:00Z",
      "status": "active",
      "context": {
        "type": "consultation",
        "specialty": "cardiologia"
      },
      "messageCount": 5
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## WebSocket API (Real-time)

For real-time streaming interactions, connect to the WebSocket endpoint:

```
wss://neonpro.com.br/api/v1/ai-chat/ws
```

**Connection:**
```javascript
const ws = new WebSocket('wss://neonpro.com.br/api/v1/ai-chat/ws', {
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});
```

**Message Types:**

**Client → Server:**
```json
{
  "type": "create_session",
  "data": {
    "context": { "type": "consultation", "clinicId": "uuid" }
  }
}

{
  "type": "send_message", 
  "sessionId": "uuid",
  "data": {
    "message": "Como interpretar este ECG?"
  }
}
```

**Server → Client:**
```json
{
  "type": "session_created",
  "sessionId": "uuid",
  "data": { "expiresAt": "2025-01-27T15:30:00Z" }
}

{
  "type": "message_start",
  "sessionId": "uuid", 
  "messageId": "uuid"
}

{
  "type": "message_token",
  "sessionId": "uuid",
  "messageId": "uuid",
  "data": { "content": "Para" }
}

{
  "type": "message_complete",
  "sessionId": "uuid",
  "messageId": "uuid",
  "data": { "tokensUsed": 245, "responseTime": 1200 }
}
```

## Security & Compliance

### LGPD Compliance

- **Automatic PII Detection**: CPF, email, phone numbers automatically redacted
- **Consent Validation**: User consent verified before processing
- **Audit Logging**: All interactions logged for compliance
- **Data Retention**: Messages automatically deleted per retention policy
- **Right to Erasure**: Support for complete data deletion

### Content Safety

- **Medical Context Validation**: Ensures responses are appropriate for healthcare
- **Professional Boundaries**: Maintains doctor-patient relationship boundaries  
- **Harmful Content Filtering**: Blocks inappropriate medical advice
- **Brazilian Medical Standards**: Adheres to CFM professional guidelines

### Data Privacy

- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Session Isolation**: Each session cryptographically isolated
- **No Data Persistence**: AI providers do not retain conversation data
- **Local Processing**: Sensitive operations performed locally when possible

## Monitoring & Metrics

The API provides comprehensive metrics for monitoring:

### Performance Metrics
- Response time percentiles (p50, p95, p99)
- Token usage and costs
- Provider availability and failover rates
- Streaming latency and completion rates

### Compliance Metrics  
- PII detection rates
- Consent validation coverage
- Audit event generation
- Data retention compliance

### Usage Metrics
- Request volume per clinic/user
- Rate limiting effectiveness
- Session duration and message counts
- Feature adoption rates

Access metrics via the `/metrics` endpoint (admin only) or integrated monitoring dashboards.

## SDKs & Integration

### JavaScript/TypeScript SDK

```bash
npm install @neonpro/ai-chat-sdk
```

```typescript
import { AIChatClient } from '@neonpro/ai-chat-sdk';

const client = new AIChatClient({
  apiKey: 'your-jwt-token',
  baseUrl: 'https://neonpro.com.br/api/v1/ai-chat'
});

// Create session
const session = await client.createSession({
  context: { type: 'consultation', clinicId: 'uuid' }
});

// Send message with streaming
const response = client.sendMessage(session.sessionId, {
  message: 'Como interpretar este ECG?',
  streaming: true
});

response.on('token', (token) => console.log(token));
response.on('complete', (metadata) => console.log('Done:', metadata));
```

### React Hooks

```typescript
import { useAIChat } from '@neonpro/ai-chat-react';

function ConsultationChat() {
  const { session, sendMessage, messages, isLoading } = useAIChat({
    context: { type: 'consultation', clinicId: 'uuid' }
  });

  const handleSend = (message: string) => {
    sendMessage(message, { streaming: true });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.messageId}>{msg.content}</div>
      ))}
      {isLoading && <div>Pensando...</div>}
    </div>
  );
}
```

## Testing & Development

### Test Environment

```
Base URL: https://staging-neonpro.com.br/api/v1/ai-chat
WebSocket: wss://staging-neonpro.com.br/api/v1/ai-chat/ws
```

### Mock Responses

For development, enable mock mode:

```http
X-Mock-Mode: true
```

This returns pre-defined responses without calling AI providers.

### Rate Limit Testing

Test environments have relaxed rate limits:
- Per User: 1000 requests per minute
- Per Clinic: 10000 requests per minute

## Migration & Versioning

### API Versioning

- Current version: `v1`
- Backwards compatibility maintained for 12 months
- Deprecation notices provided 6 months in advance

### Migration Path

When upgrading from pre-Phase 1 implementations:

1. Update authentication to use JWT tokens
2. Migrate to new session-based architecture  
3. Update error handling for new error format
4. Implement new rate limiting logic
5. Add LGPD compliance checks

## Support & Resources

- **API Status**: https://status.neonpro.com.br
- **Documentation**: https://docs.neonpro.com.br/ai-chat
- **Support**: dev@neonpro.com.br
- **GitHub**: https://github.com/neonpro/ai-chat-api

---

**Next Phase**: Phase 2 will include multi-modal capabilities (image/document analysis), advanced medical reasoning, and integration with electronic health records (EHR).