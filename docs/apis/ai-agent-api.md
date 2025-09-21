# AI Agent Database Integration API Documentation

## Overview

The AI Agent Database Integration API provides a comprehensive interface for healthcare AI agents to securely access and manipulate patient data, appointments, financial records, and medical information through Supabase integration with LGPD compliance.

**Version**: 1.0.0  
**Base URL**: `https://api.neonpro.com.br/api/v2`  
**Authentication**: Bearer Token (JWT)  
**Compliance**: LGPD, ANVISA, CFM, ISO 27001

## Table of Contents

1. [Authentication](#authentication)
2. [AI Agent Endpoints](#ai-agent-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Security](#security)
7. [Examples](#examples)
8. [WebSocket API](#websocket-api)

## Authentication

### Bearer Token Authentication

```bash
Authorization: Bearer <your-jwt-token>
```

### Token Generation

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@neonpro.com.br",
  "password": "password"
}
```

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@neonpro.com.br",
    "role": "healthcare_provider"
  },
  "expiresIn": 3600
}
```

## AI Agent Endpoints

### Data Agent Query

**POST** `/api/v2/ai/data-agent`

Processes natural language queries about healthcare data with intelligent caching and permission validation.

#### Request Body

```json
{
  "query": "List upcoming appointments for patient John Doe",
  "context": {
    "patientId": "patient-123",
    "date": "2024-01-15",
    "providerId": "provider-456"
  },
  "options": {
    "maxResults": 10,
    "timeout": 2000,
    "includeSources": true,
    "streaming": false
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language query to process |
| `context.patientId` | string | No | Specific patient identifier |
| `context.date` | string | No | Date context for query |
| `context.providerId` | string | No | Healthcare provider identifier |
| `options.maxResults` | number | No | Maximum results to return (default: 10) |
| `options.timeout` | number | No | Query timeout in milliseconds (default: 2000) |
| `options.includeSources` | boolean | No | Include data sources in response |
| `options.streaming` | boolean | No | Enable streaming response |

#### Response

```json
{
  "id": "response-123",
  "type": "structured",
  "content": "Found 3 upcoming appointments for patient John Doe:",
  "data": {
    "appointments": [
      {
        "id": "apt-123",
        "date": "2024-01-15T10:00:00Z",
        "provider": "Dr. Smith",
        "type": "consultation",
        "status": "confirmed"
      }
    ]
  },
  "sources": [
    {
      "id": "appointments-db",
      "type": "appointment",
      "title": "Appointments Database",
      "relevanceScore": 0.95
    }
  ],
  "confidence": 0.92,
  "usage": {
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350,
    "processingTimeMs": 850,
    "databaseQueryTimeMs": 120
  }
}
```

### Chat Session Management

#### Create Session

**POST** `/api/v2/ai/chat`

```json
{
  "title": "Patient Consultation - John Doe",
  "context": {
    "patientId": "patient-123",
    "sessionType": "consultation"
  },
  "initialMessage": "Review patient history for upcoming appointment"
}
```

#### Get Session

**GET** `/api/v2/ai/sessions/{sessionId}`

```json
{
  "id": "session-123",
  "userId": "user-456",
  "title": "Patient Consultation - John Doe",
  "context": {
    "patientId": "patient-123",
    "sessionType": "consultation"
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T12:00:00Z",
  "isActive": true,
  "messageCount": 15,
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

#### Session Feedback

**POST** `/api/v2/ai/sessions/{sessionId}/feedback`

```json
{
  "messageId": "msg-123",
  "rating": 4,
  "feedback": "Helpful information, but could be more detailed",
  "category": "completeness"
}
```

### AI Insights

**GET** `/api/v2/ai/insights`

```json
{
  "insights": [
    {
      "id": "insight-123",
      "type": "appointment_pattern",
      "title": "Increased Morning Appointments",
      "description": "Patient appointments show 40% increase in morning slots",
      "data": {
        "percentage": 40,
        "timeRange": "08:00-12:00",
        "patientCount": 25
      },
      "confidence": 0.87,
      "generatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

## Data Models

### UserQuery

```typescript
interface UserQuery {
  query: string;
  context?: {
    patientId?: string;
    userId: string;
    sessionHistory?: AguiSessionMessage[];
    userPreferences?: Record<string, any>;
    previousTopics?: string[];
  };
  options?: {
    maxResults?: number;
    timeout?: number;
    includeSources?: boolean;
    streaming?: boolean;
    temperature?: number;
    model?: string;
  };
}
```

### AgentResponse

```typescript
interface AgentResponse {
  id: string;
  content: string;
  type: 'text' | 'structured' | 'error';
  sources?: AguiSource[];
  confidence?: number;
  usage?: AguiUsageStats;
  actions?: AguiAction[];
  data?: any;
}
```

### ChatSession

```typescript
interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  messageCount: number;
  lastActivity: string;
}
```

### PermissionContext

```typescript
interface PermissionContext {
  userId: string;
  role: 'admin' | 'healthcare_provider' | 'patient' | 'staff';
  clinicId?: string;
  department?: string;
  permissions: string[];
  dataAccessLevel: 'full' | 'restricted' | 'minimal';
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "AUTHORIZATION_FAILED",
    "message": "User does not have permission to access this patient data",
    "details": {
      "requiredRole": "healthcare_provider",
      "userRole": "patient",
      "resource": "patient-123"
    },
    "retryable": false
  },
  "requestId": "req-123",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_FAILED` | 401 | Invalid or missing authentication token |
| `AUTHORIZATION_FAILED` | 403 | User lacks required permissions |
| `INVALID_MESSAGE` | 400 | Malformed request or invalid parameters |
| `TIMEOUT` | 408 | Query processing exceeded timeout limit |
| `RATE_LIMITED` | 429 | Too many requests in time window |
| `INTERNAL_ERROR` | 500 | Server-side error occurred |
| `SESSION_EXPIRED` | 401 | Chat session has expired |
| `PATIENT_NOT_FOUND` | 404 | Requested patient record not found |
| `DATABASE_ERROR` | 503 | Database connection or query error |
| `AI_SERVICE_ERROR` | 502 | AI processing service unavailable |

## Rate Limiting

### Default Limits

| Role | Requests/Minute | Requests/Hour | Burst Limit |
|------|-----------------|---------------|-------------|
| Admin | 1000 | 50000 | 100 |
| Healthcare Provider | 500 | 25000 | 50 |
| Patient | 100 | 5000 | 20 |
| Staff | 200 | 10000 | 30 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642244400
Retry-After: 60
```

## Security

### Data Encryption

- **In Transit**: TLS 1.3 with perfect forward secrecy
- **At Rest**: AES-256-GCM encryption for sensitive data
- **Key Management**: Automated key rotation every 90 days

### LGPD Compliance

- **Data Minimization**: Only collect necessary healthcare data
- **Purpose Limitation**: Clear audit trails for data access
- **Storage Limitation**: Automated data retention policies
- **Access Control**: Role-based permissions with audit logging

### Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Examples

### Basic Patient Query

```bash
curl -X POST "https://api.neonpro.com.br/api/v2/ai/data-agent" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What medications is patient John Doe currently taking?",
    "context": {
      "patientId": "patient-123"
    }
  }'
```

### Financial Summary Request

```bash
curl -X POST "https://api.neonpro.com.br/api/v2/ai/data-agent" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Generate monthly financial summary for December 2023",
    "options": {
      "includeSources": true,
      "maxResults": 50
    }
  }'
```

### Appointment Analysis

```bash
curl -X POST "https://api.neonpro.com.br/api/v2/ai/data-agent" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze appointment no-show patterns for the last 3 months",
    "context": {
      "dateRange": "2023-10-01,2023-12-31"
    },
    "options": {
      "streaming": true
    }
  }'
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('wss://api.neonpro.com.br/api/v2/ai/chat');
```

### Message Format

```json
{
  "id": "msg-123",
  "type": "query",
  "timestamp": "2024-01-15T10:00:00Z",
  "sessionId": "session-456",
  "payload": {
    "query": "Help me understand this patient''s lab results",
    "context": {
      "patientId": "patient-123"
    }
  },
  "metadata": {
    "userId": "user-789",
    "version": "1.0.0"
  }
}
```

### Response Types

#### Streaming Response

```json
{
  "id": "resp-123",
  "type": "streaming_chunk",
  "timestamp": "2024-01-15T10:00:01Z",
  "sessionId": "session-456",
  "payload": {
    "chunkId": "chunk-1",
    "content": "Based on the lab results...",
    "isFinal": false
  }
}
```

#### Final Response

```json
{
  "id": "resp-123",
  "type": "response",
  "timestamp": "2024-01-15T10:00:05Z",
  "sessionId": "session-456",
  "payload": {
    "content": "Complete analysis of lab results",
    "type": "structured",
    "confidence": 0.94,
    "sources": [...]
  }
}
```

## Monitoring and Metrics

### Performance Metrics

**GET** `/api/v2/ai/performance`

```json
{
  "performance": {
    "averageResponseTimeMs": 850,
    "requestsPerSecond": 25.5,
    "errorRate": 0.02,
    "cacheHitRate": 0.78
  },
  "aiService": {
    "modelLatencyMs": 450,
    "tokenUsage": {
      "promptTokens": 15420,
      "completionTokens": 23850
    }
  },
  "database": {
    "averageQueryTimeMs": 120,
    "activeConnections": 15
  }
}
```

### Health Check

**GET** `/api/v2/ai/health`

```json
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "ai_service": "healthy",
    "cache": "healthy",
    "websocket_server": "healthy"
  },
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## SDK Integration

### JavaScript/TypeScript

```typescript
import { AIAgentClient } from '@neonpro/ai-agent-sdk';

const client = new AIAgentClient({
  baseURL: 'https://api.neonpro.com.br/api/v2',
  token: 'your-jwt-token'
});

// Query patient data
const response = await client.query({
  query: 'List upcoming appointments',
  context: { patientId: 'patient-123' }
});

// Create chat session
const session = await client.createSession({
  title: 'Patient Consultation',
  context: { patientId: 'patient-123' }
});
```

### Python

```python
from neonpro_ai import AIAgentClient

client = AIAgentClient(
    base_url="https://api.neonpro.com.br/api/v2",
    token="your-jwt-token"
)

# Query patient data
response = client.query(
    query="List upcoming appointments",
    context={"patientId": "patient-123"}
)

# Create chat session
session = client.create_session(
    title="Patient Consultation",
    context={"patientId": "patient-123"}
)
```

## Best Practices

1. **Query Optimization**: Use specific queries rather than broad requests
2. **Context Management**: Provide relevant context for better results
3. **Error Handling**: Implement proper error handling for rate limits and timeouts
4. **Data Privacy**: Only request necessary patient information
5. **Session Management**: Use sessions for related queries to maintain context
6. **Caching**: Leverage built-in caching for frequently accessed data
7. **Streaming**: Use streaming for long-running queries to improve UX

## Support

- **API Documentation**: [https://docs.neonpro.com.br](https://docs.neonpro.com.br)
- **Support Email**: api-support@neonpro.com.br
- **Status Page**: [https://status.neonpro.com.br](https://status.neonpro.com.br)
- **Emergency Support**: For healthcare emergencies, contact support directly

## Version History

- **v1.0.0** (2024-01-15): Initial release with AI agent database integration
- **v0.9.0** (2023-12-01): Beta release with core functionality
- **v0.8.0** (2023-11-15): Alpha release for testing

---

*This documentation is for the NeonPro Healthcare AI Agent API. For the most up-to-date information, please refer to the online documentation.*