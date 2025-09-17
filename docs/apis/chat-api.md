# AI Chat API Documentation

## Overview

The AI Chat API provides a comprehensive set of endpoints for implementing LGPD-compliant AI-powered chat functionality in healthcare applications. The API supports real-time streaming responses, rate limiting, audit logging, and PII redaction.

## Base URL

```
Production: https://api.neonpro.com.br/api/v1/chat
Development: http://localhost:3000/api/v1/chat
```

## Authentication

All endpoints require proper session authentication. Include your session token in the request headers:

```http
Authorization: Bearer <session-token>
X-Session-ID: <session-id>
```

## Rate Limits

The API implements LGPD-compliant rate limiting:

- **Short-term**: 10 requests per 5 minutes per user
- **Long-term**: 30 requests per hour per user
- **Burst**: 5 requests per 5 seconds per user

Rate limit information is included in response headers:

```http
X-Rate-Limit-Limit: 10
X-Rate-Limit-Remaining: 7
X-Rate-Limit-Reset: 1634567890
```

## Endpoints

### Health Check

**GET** `/health`

Check the health status of the AI Chat service.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "ai_provider": "healthy",
    "database": "healthy",
    "rate_limiter": "healthy"
  },
  "version": "1.0.0"
}
```

#### Status Codes

- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is experiencing issues

---

### Chat Query

**POST** `/query`

Send a message to the AI assistant and receive a response.

#### Request Body

```json
{
  "message": "Olá, gostaria de agendar uma consulta",
  "sessionId": "session_123456789",
  "userId": "user_abc123",
  "streaming": false,
  "context": {
    "previousMessages": 5,
    "userProfile": "patient",
    "language": "pt-BR"
  },
  "consent": {
    "dataProcessing": true,
    "aiInteraction": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The user's message (1-2000 characters) |
| `sessionId` | string | Yes | Unique session identifier |
| `userId` | string | Yes | User identifier for rate limiting and audit |
| `streaming` | boolean | No | Enable streaming response (default: false) |
| `context` | object | No | Additional context for the AI |
| `consent` | object | Yes | LGPD consent information |

#### Response (Non-streaming)

```json
{
  "id": "msg_789123456",
  "response": "Olá! Posso ajudá-lo a agendar sua consulta...",
  "sessionId": "session_123456789",
  "timestamp": "2024-01-15T10:30:15Z",
  "model": "gpt-4",
  "provider": "openai",
  "usage": {
    "inputTokens": 25,
    "outputTokens": 150,
    "totalTokens": 175
  },
  "metadata": {
    "responseTime": 1250,
    "confidence": 0.95,
    "languageDetected": "pt-BR"
  }
}
```

#### Response (Streaming)

When `streaming: true`, the response is sent as Server-Sent Events:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"id":"msg_123","content":"Olá! ","isComplete":false}

data: {"id":"msg_123","content":"Posso ","isComplete":false}

data: {"id":"msg_123","content":"ajudá-lo...","isComplete":true,"usage":{"inputTokens":25,"outputTokens":150}}
```

#### Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### Get Session

**GET** `/session/{sessionId}`

Retrieve chat session information and message history.

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | Session identifier (path parameter) |
| `limit` | number | No | Number of messages to return (default: 50) |
| `offset` | number | No | Offset for pagination (default: 0) |

#### Response

```json
{
  "id": "session_123456789",
  "userId": "user_abc123",
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:15Z",
  "metadata": {
    "language": "pt-BR",
    "context": "medical_consultation"
  },
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Olá, gostaria de agendar uma consulta",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Olá! Posso ajudá-lo a agendar sua consulta...",
      "timestamp": "2024-01-15T10:30:15Z",
      "model": "gpt-4",
      "usage": {
        "inputTokens": 25,
        "outputTokens": 150
      }
    }
  ],
  "totalMessages": 2
}
```

#### Status Codes

- `200 OK` - Session found
- `404 Not Found` - Session not found
- `401 Unauthorized` - Unauthorized access to session

---

### Request Explanation

**POST** `/explanation`

Request a detailed explanation of medical terms or procedures.

#### Request Body

```json
{
  "query": "hipertensão arterial",
  "context": "patient_education",
  "language": "pt-BR",
  "userId": "user_abc123",
  "consent": {
    "dataProcessing": true,
    "aiInteraction": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Response

```json
{
  "id": "exp_456789123",
  "explanation": {
    "title": "Hipertensão Arterial",
    "summary": "A hipertensão arterial é uma condição...",
    "details": "A pressão arterial é medida em...",
    "symptoms": ["dor de cabeça", "tontura", "visão turva"],
    "treatments": ["medicamentos", "dieta", "exercícios"],
    "prevention": ["alimentação saudável", "exercícios regulares"]
  },
  "sources": [
    {
      "title": "Diretrizes Brasileiras de Hipertensão",
      "url": "https://example.com/guidelines",
      "reliability": "high"
    }
  ],
  "metadata": {
    "complexity": "intermediate",
    "readingTime": 180,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Suggestions

**GET** `/suggestions`

Get contextual suggestions for follow-up questions or actions.

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | No | Session context for suggestions |
| `context` | string | No | Context type (medical, administrative, etc.) |
| `language` | string | No | Language for suggestions (default: pt-BR) |

#### Response

```json
{
  "suggestions": [
    {
      "id": "sug_001",
      "text": "Como posso marcar um exame?",
      "category": "appointment",
      "confidence": 0.9
    },
    {
      "id": "sug_002",
      "text": "Quais são os sintomas da hipertensão?",
      "category": "medical_info",
      "confidence": 0.85
    }
  ],
  "context": "medical_consultation",
  "generated_at": "2024-01-15T10:30:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error information:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Taxa de solicitações excedida. Tente novamente em 2 minutos.",
    "details": {
      "limit": 10,
      "window": "5 minutes",
      "resetTime": "2024-01-15T10:35:00Z"
    }
  },
  "requestId": "req_123456789",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `MISSING_CONSENT` | LGPD consent required |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `SESSION_NOT_FOUND` | Chat session not found |
| `AI_SERVICE_ERROR` | AI provider error |
| `INTERNAL_ERROR` | Internal server error |

## LGPD Compliance

### Data Processing Consent

All requests that process personal data require explicit consent:

```json
{
  "consent": {
    "dataProcessing": true,
    "aiInteraction": true,
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Data Retention

- Chat messages: Retained for 5 years for audit purposes
- Session data: Retained for 1 year
- Audit logs: Retained for 7 years
- Personal data: Can be deleted upon request

### Data Subject Rights

Users can exercise their LGPD rights through dedicated endpoints:

- **Right to Access**: `GET /data/user/{userId}`
- **Right to Rectification**: `PUT /data/user/{userId}`
- **Right to Deletion**: `DELETE /data/user/{userId}`
- **Right to Portability**: `GET /data/export/{userId}`

## Security

### PII Redaction

The API automatically redacts sensitive information:

- CPF/CNPJ numbers
- Email addresses
- Phone numbers
- Bank account information
- Full names (preserving first name only)

### Audit Logging

All API interactions are logged for compliance:

```json
{
  "event": "chat_query",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_abc123",
  "sessionId": "session_123456789",
  "requestId": "req_123456789",
  "action": "POST /api/v1/chat/query",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100",
    "consent": true,
    "piiRedacted": true
  }
}
```

## SDKs and Examples

### JavaScript/TypeScript

```typescript
import { NeonProChatAPI } from '@neonpro/chat-sdk';

const chatAPI = new NeonProChatAPI({
  baseURL: 'https://api.neonpro.com.br',
  sessionToken: 'your-session-token'
});

// Send a message
const response = await chatAPI.sendMessage({
  message: 'Olá, preciso de ajuda',
  sessionId: 'session_123',
  userId: 'user_abc',
  consent: {
    dataProcessing: true,
    aiInteraction: true,
    timestamp: new Date().toISOString()
  }
});

console.log(response.response);
```

### Python

```python
from neonpro_chat import ChatAPI

chat_api = ChatAPI(
    base_url='https://api.neonpro.com.br',
    session_token='your-session-token'
)

response = chat_api.send_message(
    message='Olá, preciso de ajuda',
    session_id='session_123',
    user_id='user_abc',
    consent={
        'dataProcessing': True,
        'aiInteraction': True,
        'timestamp': '2024-01-15T10:30:00Z'
    }
)

print(response['response'])
```

### cURL

```bash
curl -X POST https://api.neonpro.com.br/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-session-token" \
  -H "X-Session-ID: session_123" \
  -d '{
    "message": "Olá, preciso de ajuda",
    "sessionId": "session_123",
    "userId": "user_abc",
    "consent": {
      "dataProcessing": true,
      "aiInteraction": true,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'
```

## Monitoring and Analytics

### Health Monitoring

Monitor API health through the health endpoint and built-in metrics:

- Response time percentiles (p50, p95, p99)
- Error rate by endpoint
- Rate limit hit rate
- AI provider availability

### Usage Analytics

Track usage patterns while respecting privacy:

- Request volume by hour/day
- Popular query categories
- Session duration statistics
- User engagement metrics (anonymized)

## Support

For technical support and API questions:

- **Documentation**: https://docs.neonpro.com.br/chat-api
- **Support Email**: api-support@neonpro.com.br
- **Status Page**: https://status.neonpro.com.br
- **GitHub Issues**: https://github.com/neonpro/chat-api/issues

## Changelog

### v1.0.0 (2024-01-15)

- Initial release
- Basic chat functionality
- LGPD compliance features
- Rate limiting implementation
- Streaming responses support
- PII redaction system
- Audit logging

### Future Releases

- Multi-language support expansion
- Advanced analytics dashboard
- Webhook support for real-time events
- Enhanced AI model selection
- Voice-to-text integration