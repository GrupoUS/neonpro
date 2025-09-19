# NeonPro API Documentation

## Overview

The NeonPro API provides comprehensive healthcare platform services with full LGPD compliance, performance optimization, and security features. This documentation covers all available endpoints, authentication, and implementation details.

## Base URL

```
https://api.neonpro.com.br/v1
```

## Authentication

### Bearer Token Authentication
```http
Authorization: Bearer <your-jwt-token>
```

### API Key Authentication
```http
X-API-Key: <your-api-key>
```

## Core Endpoints

### Health Check
```http
GET /health
```

Returns the current health status of all platform services.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_services": "healthy"
  },
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Observability

#### Submit Telemetry Event
```http
POST /telemetry/events
```

Submit healthcare-specific telemetry events with LGPD compliance.

**Request Body:**
```json
{
  "eventType": "patient_interaction",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "patientId": "hashed-patient-id",
    "professionalId": "professional-id",
    "interactionType": "consultation",
    "duration": 1800,
    "dataClassification": "sensitive"
  }
}
```

**Response:**
```json
{
  "eventId": "event-uuid",
  "status": "processed",
  "compliance": {
    "lgpdCompliant": true,
    "dataAnonymized": true
  }
}
```

#### Performance Metrics
```http
GET /telemetry/metrics
```

Retrieve system performance metrics with healthcare-specific context.

**Query Parameters:**
- `timeRange`: `1h`, `24h`, `7d`, `30d`
- `metricType`: `response_time`, `error_rate`, `throughput`

**Response:**
```json
{
  "metrics": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "response_time": 245,
      "error_rate": 0.001,
      "throughput": 1250
    }
  ],
  "summary": {
    "avg_response_time": 245,
    "total_errors": 12,
    "total_requests": 12500
  }
}
```

### AI Chat with Semantic Caching

#### Chat Completion
```http
POST /ai-chat/completion
```

Generate AI responses with semantic caching for cost optimization.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How to treat hypertension?"
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "enableCache": true,
    "healthcareContext": {
      "patientId": "hashed-patient-id",
      "professionalId": "professional-id",
      "dataClassification": "sensitive"
    }
  }
}
```

**Response:**
```json
{
  "id": "chat-uuid",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hypertension treatment involves..."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 25,
    "completionTokens": 150,
    "totalTokens": 175
  },
  "cache": {
    "hit": true,
    "cacheKey": "generated-cache-key",
    "ttl": 3600
  }
}
```

#### Streaming Chat
```http
POST /ai-chat/stream
```

Stream AI responses with real-time semantic caching.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain diabetes management"
    }
  ],
  "stream": true,
  "options": {
    "temperature": 0.7,
    "enableCache": true,
    "healthcareContext": {
      "patientId": "hashed-patient-id",
      "professionalId": "professional-id"
    }
  }
}
```

**Response (Streaming):**
```
data: {"type": "content", "content": "Diabetes management involves..."}
data: {"type": "content", "content": " regular blood glucose monitoring..."}
data: {"type": "done", "usage": {"promptTokens": 30, "completionTokens": 200, "totalTokens": 230}}
```

### Security & Compliance

#### LGPD Compliance Check
```http
POST /compliance/lgpd/check
```

Validate data processing against LGPD requirements.

**Request Body:**
```json
{
  "processingContext": {
    "operation": "patient_data_access",
    "dataSubject": "patient-id",
    "dataTypes": ["medical_history", "personal_data"],
    "legalBasis": "consent",
    "purpose": "medical_treatment"
  }
}
```

**Response:**
```json
{
  "compliant": true,
  "validation": {
    "legalBasisValid": true,
    "dataMinimization": true,
    "purposeLimitation": true,
    "retentionCompliant": true
  },
  "recommendations": [
    "Ensure patient consent is documented",
    "Apply data minimization principles"
  ]
}
```

#### Security Headers Validation
```http
GET /security/headers/validate
```

Validate security headers compliance for healthcare applications.

**Response:**
```json
{
  "headers": {
    "content-security-policy": {
      "present": true,
      "score": 10,
      "recommendations": []
    },
    "strict-transport-security": {
      "present": true,
      "score": 10,
      "recommendations": []
    },
    "x-content-type-options": {
      "present": true,
      "score": 10,
      "recommendations": []
    }
  },
  "overallScore": 9.8,
  "compliant": true
}
```

### Database Operations

#### Patient Data Query (LGPD Compliant)
```http
GET /patients/{id}
```

Retrieve patient data with LGPD compliance and PII protection.

**Headers:**
```
Authorization: Bearer <token>
X-Data-Subject-Request: true
X-Purpose: medical_treatment
```

**Response:**
```json
{
  "id": "patient-id",
  "name": "John D.",  // PII masked
  "medicalHistory": {
    "conditions": ["hypertension"],
    "allergies": ["penicillin"],
    "lastVisit": "2024-01-01"
  },
  "accessLog": {
    "accessedAt": "2024-01-01T00:00:00Z",
    "accessedBy": "professional-id",
    "purpose": "medical_treatment",
    "legalBasis": "consent"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "patientId",
        "message": "Patient ID is required"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "request-uuid"
  }
}
```

### Healthcare-Specific Errors
```json
{
  "error": {
    "code": "LGPD_COMPLIANCE_ERROR",
    "message": "Data processing violates LGPD requirements",
    "details": {
      "violation": "missing_legal_basis",
      "required": "consent or legitimate_interest",
      "recommendation": "Obtain explicit patient consent"
    },
    "compliance": {
      "lgpdArticle": "Article 7",
      "severity": "high",
      "actionRequired": true
    }
  }
}
```

## Rate Limiting

### Standard Limits
- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **API Keys**: 10,000 requests per hour

### Healthcare Operations
- **Patient Data Access**: 500 requests per hour
- **AI Chat**: 100 requests per hour
- **Telemetry Events**: 5000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Compliance Events
```http
POST /webhooks/compliance
```

Receive real-time compliance event notifications.

**Event Payload:**
```json
{
  "event": "lgpd.violation.detected",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "violationType": "unauthorized_access",
    "severity": "high",
    "affectedData": ["patient_records"],
    "recommendation": "Immediate investigation required"
  }
}
```

### Security Events
```http
POST /webhooks/security
```

Receive security event notifications.

**Event Payload:**
```json
{
  "event": "security.breach.attempt",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "attackType": "injection_attempt",
    "sourceIp": "192.168.1.100",
    "targetEndpoint": "/api/patients",
    "blocked": true
  }
}
```

## SDKs

### JavaScript/TypeScript SDK
```typescript
import { NeonProAPI } from '@neonpro/sdk';

const api = new NeonProAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.neonpro.com.br/v1'
});

// AI Chat with semantic caching
const response = await api.ai.chat.completion({
  messages: [{ role: 'user', content: 'Hello' }],
  options: {
    enableCache: true,
    healthcareContext: {
      patientId: 'hashed-patient-id'
    }
  }
});

// LGPD compliance check
const compliance = await api.compliance.lgpd.check({
  processingContext: {
    operation: 'patient_data_access',
    legalBasis: 'consent'
  }
});
```

### Python SDK
```python
from neonpro import NeonProAPI

api = NeonProAPI(
    api_key='your-api-key',
    base_url='https://api.neonpro.com.br/v1'
)

# Submit telemetry event
response = api.telemetry.submit_event({
    'eventType': 'patient_interaction',
    'data': {
        'patientId': 'hashed-patient-id',
        'interactionType': 'consultation'
    }
})
```

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
```
https://api.neonpro.com.br/v1/openapi.yaml
```

### Interactive Documentation
Interactive API documentation is available at:
```
https://api.neonpro.com.br/v1/docs
```

## Implementation Examples

### React Frontend Integration
```tsx
import { useNeonProAPI } from '@neonpro/react';

function PatientConsultation() {
  const { data: patient, loading, error } = useNeonProAPI(
    `/patients/${patientId}`,
    {
      headers: {
        'X-Data-Subject-Request': 'true',
        'X-Purpose': 'medical_treatment'
      }
    }
  );

  const [chatMessage, setChatMessage] = useState('');
  
  const sendMessage = async () => {
    const response = await fetch('/ai-chat/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: chatMessage }],
        options: {
          enableCache: true,
          healthcareContext: {
            patientId: patient?.id,
            professionalId: currentUser.id
          }
        }
      })
    });
  };

  return (
    <div>
      {/* Patient consultation interface */}
    </div>
  );
}
```

### Backend Integration
```typescript
import { Hono } from 'hono';
import { NeonProAPI } from '@neonpro/hono';

const app = new Hono();
const neonpro = new NeonProAPI({
  apiKey: process.env.NEONPRO_API_KEY
});

// Enhanced AI chat with semantic caching
app.post('/chat', async (c) => {
  const { messages, healthcareContext } = await c.req.json();
  
  const response = await neonpro.ai.chat.completion({
    messages,
    options: {
      enableCache: true,
      healthcareContext
    }
  });
  
  return c.json(response);
});

// LGPD compliance validation
app.post('/validate-processing', async (c) => {
  const { processingContext } = await c.req.json();
  
  const compliance = await neonpro.compliance.lgpd.check({
    processingContext
  });
  
  return c.json(compliance);
});
```

## Support

### Documentation
- [API Reference](https://docs.neonpro.com.br/api)
- [LGPD Compliance Guide](https://docs.neonpro.com.br/compliance/lgpd)
- [Security Best Practices](https://docs.neonpro.com.br/security)

### Contact
- **API Support**: api-support@neonpro.com.br
- **Compliance Questions**: compliance@neonpro.com.br
- **Security Issues**: security@neonpro.com.br

### Status
- **API Status**: https://status.neonpro.com.br
- **Maintenance Schedule**: https://status.neonpro.com.br/maintenance

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- LGPD compliance implementation
- AI chat with semantic caching
- Healthcare-specific telemetry
- Security headers validation
- Performance optimization features

### v1.1.0 (2024-01-15)
- Enhanced PII redaction
- Improved semantic caching
- Additional healthcare metrics
- Webhook support
- SDK releases

This API documentation provides comprehensive information for integrating with the NeonPro healthcare platform, ensuring compliance with healthcare regulations while providing optimal performance and security.