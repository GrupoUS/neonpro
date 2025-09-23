# AI Agent API Documentation

## Overview

The AI Agent API provides natural language interface to NeonPro's healthcare data systems through secure, compliant endpoints. This documentation covers all available endpoints, authentication methods, and usage examples.

## Base URL

```
https://api.neonpro.com.br/v1
```

## Authentication

All API requests require authentication using JWT tokens obtained through the auth service.

### Header Format

```
Authorization: Bearer <JWT_TOKEN>
```

### Required Permissions

- `read_clients` - Access client data
- `read_appointments` - Access appointment data
- `read_financial` - Access financial data
- `ai_agent_access` - Use AI agent features

## Rate Limiting

- **Default**: 100 requests per minute
- **Burst**: 200 requests per minute
- **WebSocket**: 50 connections per user

## Endpoints

### POST /api/ai/data-agent

Process natural language queries and return structured responses.

**Request Body**

```typescript
interface AgentQueryRequest {
  query: string;
  sessionId: string;
  patientId?: string;
  context?: {
    previousQueries?: string[];
  };
}
```

**Response**

```typescript
interface AgentResponse {
  id: string;
  type: "text" | "table" | "list" | "chart";
  content: {
    title: string;
    text?: string;
    data?: any[];
    columns?: Array<{
      key: string;
      label: string;
      type: "string" | "number" | "date" | "currency";
    }>;
    chart?: {
      type: "bar" | "line" | "pie";
      data: Array<{
        label: string;
        value: number;
      }>;
      title: string;
    };
  };
  actions?: InteractiveAction[];
  metadata: {
    processingTime: number;
    confidence: number;
    sources: string[];
    intent: string;
  };
  timestamp: Date;
  processingTime: number;
}

interface InteractiveAction {
  id: string;
  type: "button" | "link" | "form";
  label: string;
  action: string;
  parameters?: Record<string, any>;
}
```

**Example Request**

```bash
curl -X POST "https://api.neonpro.com.br/api/ai/data-agent" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Quais os próximos agendamentos?",
    "sessionId": "session_123",
    "context": {
      "previousQueries": ["Quantos clientes temos cadastrados?"]
    }
  }'
```

**Example Response**

```json
{
  "id": "resp_123",
  "type": "list",
  "content": {
    "title": "Próximos Agendamentos",
    "text": "Encontrados 5 agendamentos:",
    "data": [
      {
        "id": "apt_1",
        "cliente": "João Silva",
        "data_hora": "21/09/2025 09:00",
        "status": "confirmado",
        "tipo": "consulta",
        "medico": "Dr. Carlos Santos"
      }
    ]
  },
  "actions": [
    {
      "id": "view_all",
      "label": "Ver todos os agendamentos",
      "type": "button",
      "action": "view_all_appointments"
    }
  ],
  "metadata": {
    "processingTime": 1250,
    "confidence": 0.92,
    "sources": ["appointments"],
    "intent": "appointments"
  },
  "timestamp": "2025-09-21T10:30:00.000Z",
  "processingTime": 1250
}
```

### GET /api/ai/sessions/{sessionId}

Retrieve session history and conversation context.

**Parameters**

- `sessionId` (path, required): Unique session identifier

**Response**

```typescript
interface SessionResponse {
  id: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  context: {
    userId: string;
    domain: string;
    role: string;
    permissions: string[];
    dataScope: string;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}
```

**Example Request**

```bash
curl -X GET "https://api.neonpro.com.br/api/ai/sessions/session_123" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### POST /api/ai/sessions/{sessionId}/feedback

Submit feedback for agent improvement and quality monitoring.

**Parameters**

- `sessionId` (path, required): Unique session identifier

**Request Body**

```typescript
interface FeedbackRequest {
  messageId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  category?: "accuracy" | "helpfulness" | "clarity" | "completeness" | "other";
  suggestions?: string;
}
```

**Response**

```typescript
interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId: string;
}
```

**Example Request**

```bash
curl -X POST "https://api.neonpro.com.br/api/ai/sessions/session_123/feedback" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg_456",
    "rating": 5,
    "feedback": "A resposta foi muito útil e precisa.",
    "category": "accuracy"
  }'
```

## Query Types & Examples

### Client Data Queries

**Supported Queries:**

- "Me mostre os clientes cadastrados"
- "Busque informações do cliente João Silva"
- "Clientes com email @gmail.com"
- "Pacientes cadastrados este mês"

**Response Type:** `table` with client information

### Appointment Queries

**Supported Queries:**

- "Quais os próximos agendamentos?"
- "Agendamentos para hoje"
- "Consultas com Dr. Carlos Santos"
- "Agendamentos cancelados esta semana"

**Response Type:** `list` with appointment details

### Financial Queries

**Supported Queries:**

- "Como está o faturamento?"
- "Resumo financeiro do mês"
- "Pagamentos recebidos hoje"
- "Despesas por categoria"

**Response Type:** `chart` or `table` with financial data

### General Inquiries

**Supported Queries:**

- "Oi, tudo bem?"
- "O que você pode fazer?"
- "Me ajude a encontrar informações"

**Response Type:** `text` with suggestions

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  response: {
    id: string;
    type: "error";
    content: {
      title: string;
      text: string;
      error: {
        code: string;
        message: string;
        suggestion: string;
      };
    };
    metadata: {
      processingTime: number;
      confidence: 0;
      sources: [];
    };
    timestamp: Date;
    processingTime: number;
  };
}
```

### Common Error Codes

| Code                 | HTTP Status | Description                                 |
| -------------------- | ----------- | ------------------------------------------- |
| `INVALID_QUERY`      | 400         | Query cannot be empty or malformed          |
| `INVALID_SESSION`    | 400         | Session ID is required or invalid           |
| `INVALID_PARAMETERS` | 400         | Invalid query parameters                    |
| `ACCESS_DENIED`      | 403         | Insufficient permissions for requested data |
| `SESSION_EXPIRED`    | 401         | Session has expired, please refresh         |
| `PROCESSING_ERROR`   | 500         | Error processing the query                  |
| `INTERNAL_ERROR`     | 500         | Internal server error                       |

### Error Response Example

```json
{
  "success": false,
  "response": {
    "id": "error_123",
    "type": "error",
    "content": {
      "title": "Erro de Validação",
      "text": "A consulta não pode estar vazia.",
      "error": {
        "code": "INVALID_QUERY",
        "message": "Query cannot be empty",
        "suggestion": "Por favor, digite uma pergunta sobre clientes, agendamentos ou dados financeiros."
      }
    },
    "metadata": {
      "processingTime": 15,
      "confidence": 0,
      "sources": []
    },
    "timestamp": "2025-09-21T10:30:00.000Z",
    "processingTime": 15
  }
}
```

## Security Features

### HTTPS/TLS 1.3+

- Perfect Forward Secrecy
- HSTS with max-age 31536000
- Content Security Policy
- Security headers implementation

### Data Access Control

- Row Level Security (RLS) enforcement
- Role-based access control
- Domain isolation
- Audit logging for all queries

### Input Validation

- Query sanitization
- Parameter validation
- SQL injection prevention
- XSS protection

## WebSocket Support

Real-time updates are available through WebSocket connections for enhanced interactivity.

### Connection URL

```
wss://api.neonpro.com.br/ai/realtime
```

### Message Format

```typescript
interface WebSocketMessage {
  type: "query" | "feedback" | "status";
  payload: any;
  sessionId: string;
}
```

## Performance

### Response Times

- **P50**: < 500ms
- **P95**: < 2000ms
- **P99**: < 5000ms

### HTTPS Handshake

- **Target**: ≤300ms
- **Current Average**: 125ms

## SDKs

### TypeScript/JavaScript

```typescript
import { NeonProAIAgent } from "@neonpro/ai-agent";

const agent = new NeonProAIAgent({
  baseUrl: "https://api.neonpro.com.br",
  token: "your-jwt-token",
});

const response = await agent.query({
  query: "Quais os próximos agendamentos?",
  sessionId: "session_123",
});
```

### Python

```python
from neonpro_ai import NeonProAIAgent

agent = NeonProAIAgent(
    base_url="https://api.neonpro.com.br",
    token="your-jwt-token"
)

response = agent.query(
    query="Quais os próximos agendamentos?",
    session_id="session_123"
)
```

## Compliance

### LGPD Compliance

- Data minimization
- Purpose limitation
- User access rights
- Audit trail maintenance

### Healthcare Standards

- ANVISA RDC 657/2022 compliance
- CFM ethical guidelines
- Patient data protection
- Clinical workflow validation

## Monitoring

### Available Metrics

- Response times by percentile
- Error rates by endpoint
- Query distribution by type
- User satisfaction scores
- System health indicators

### Health Check

```bash
curl -X GET "https://api.neonpro.com.br/health"
```

## Support

For API support and questions:

- **Documentation**: [docs.neonpro.com.br](https://docs.neonpro.com.br)
- **API Status**: [status.neonpro.com.br](https://status.neonpro.com.br)
- **Support**: suporte@neonpro.com.br

## Changelog

### v1.0.0 (2025-09-21)

- Initial API release
- Portuguese natural language processing
- Healthcare data access with compliance
- Real-time response formatting
- Interactive action support

---

**Last Updated**: September 21, 2025
