---
title: "NeonPro API Documentation - Aesthetic Clinics"
last_updated: 2025-09-22
form: reference
tags: [api, aesthetic-clinics, neonpro, hono, tanstack-router, compliance]
related:
  - ./apis.md
  - ./ai-sdk-v5.0.md
  - ../architecture/tech-stack.md
---

# NeonPro API Documentation - Aesthetic Clinics

## Overview

The NeonPro API provides comprehensive aesthetic clinic management services with full LGPD compliance, performance optimization, and security features. This documentation covers all available endpoints, authentication, and implementation details specifically designed for aesthetic clinic operations.

**Target Audience**: Aesthetic clinics, beauty professionals, cosmetic treatment centers  
**Compliance**: LGPD for aesthetic treatments and client data protection  
**Tech Stack**: TanStack Router + Vite + Hono + Supabase + Vercel AI SDK v5.0

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

### Client Management

#### Client Registration

```http
POST /clients
```

Register new clients with LGPD-compliant consent for aesthetic treatments.

**Request Body:**

```json
{
  "name": "Client Name",
  "email": "client@email.com",
  "phone": "+5511999999999",
  "birthDate": "1990-01-01",
  "consentGiven": true,
  "treatmentInterest": ["botox", "fillers", "laser"]
}
```

**Response:**

```json
{
  "id": "client-uuid",
  "name": "Client Name",
  "email": "client@email.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "consentStatus": "active"
}
```

#### Get Client Profile

```http
GET /clients/{id}
```

Retrieve client profile with treatment history and preferences.

**Response:**

```json
{
  "id": "client-uuid",
  "name": "Client N.",
  "treatmentHistory": [
    {
      "type": "botox",
      "date": "2024-01-01",
      "professional": "Dr. Smith",
      "results": "satisfactory"
    }
  ],
  "preferences": {
    "contactMethod": "whatsapp",
    "reminderFrequency": "weekly"
  },
  "accessLog": {
    "accessedAt": "2024-01-01T00:00:00Z",
    "accessedBy": "professional-id",
    "purpose": "treatment_consultation"
  }
}
```

### Appointment Scheduling

#### Schedule Appointment

```http
POST /appointments
```

Schedule aesthetic treatment appointments with conflict detection.

**Request Body:**

```json
{
  "clientId": "client-uuid",
  "professionalId": "professional-uuid",
  "scheduledAt": "2024-01-01T14:00:00Z",
  "treatmentType": "botox",
  "duration": 60,
  "notes": "Client prefers afternoon appointments"
}
```

**Response:**

```json
{
  "id": "appointment-uuid",
  "clientId": "client-uuid",
  "professionalId": "professional-uuid",
  "scheduledAt": "2024-01-01T14:00:00Z",
  "status": "confirmed",
  "treatmentType": "botox",
  "duration": 60,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Financial Management

#### Treatment Pricing

```http
GET /pricing/{treatmentType}
```

Get current pricing for aesthetic treatments.

**Response:**

```json
{
  "treatmentType": "botox",
  "basePrice": 800.0,
  "currency": "BRL",
  "duration": 30,
  "requirements": ["consultation", "aftercare"],
  "packageOptions": [
    {
      "sessions": 3,
      "discount": 10,
      "totalPrice": 2160.0
    }
  ]
}
```

#### Create Invoice

```http
POST /invoices
```

Generate invoice for treatments and products.

**Request Body:**

```json
{
  "clientId": "client-uuid",
  "items": [
    {
      "type": "treatment",
      "description": "Botox Application",
      "quantity": 1,
      "unitPrice": 800.0
    }
  ],
  "paymentMethod": "credit_card",
  "installments": 3
}
```

### AI Chat with Semantic Caching

#### Treatment Consultation

```http
POST /ai-chat/consultation
```

AI-powered treatment consultation with semantic caching.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What treatments are recommended for fine lines?"
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "enableCache": true,
    "aestheticContext": {
      "clientId": "hashed-client-id",
      "professionalId": "professional-id",
      "focus": "treatment_recommendation"
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
        "content": "For fine lines, I recommend considering..."
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

### Observability

#### Telemetry Events

```http
POST /telemetry/events
```

Submit aesthetic clinic-specific telemetry events with LGPD compliance.

**Request Body:**

```json
{
  "eventType": "client_interaction",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "clientId": "hashed-client-id",
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

Retrieve system performance metrics with aesthetic clinic context.

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

### Security & Compliance

#### LGPD Compliance Check

```http
POST /compliance/lgpd/check
```

Validate data processing against LGPD requirements for aesthetic clinics.

**Request Body:**

```json
{
  "processingContext": {
    "operation": "client_data_access",
    "dataSubject": "client-id",
    "dataTypes": ["treatment_history", "personal_data", "photos"],
    "legalBasis": "consent",
    "purpose": "aesthetic_treatment"
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
    "Ensure client consent is documented",
    "Apply data minimization principles for treatment photos"
  ]
}
```

#### Security Headers Validation

```http
GET /security/headers/validate
```

Validate security headers compliance for aesthetic clinic applications.

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

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "clientId",
        "message": "Client ID is required"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "request-uuid"
  }
}
```

### Aesthetic Clinic-Specific Errors

```json
{
  "error": {
    "code": "LGPD_COMPLIANCE_ERROR",
    "message": "Data processing violates LGPD requirements",
    "details": {
      "violation": "missing_legal_basis",
      "required": "consent or legitimate_interest",
      "recommendation": "Obtain explicit client consent for treatment photos"
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

### Aesthetic Clinic Operations

- **Client Data Access**: 500 requests per hour
- **AI Consultation**: 100 requests per hour
- **Appointment Scheduling**: 1000 requests per hour
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
    "affectedData": ["client_records", "treatment_photos"],
    "recommendation": "Immediate investigation required"
  }
}
```

### Appointment Events

```http
POST /webhooks/appointments
```

Receive appointment-related notifications.

**Event Payload:**

```json
{
  "event": "appointment.scheduled",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "appointmentId": "appointment-uuid",
    "clientId": "client-uuid",
    "professionalId": "professional-uuid",
    "treatmentType": "botox",
    "scheduledAt": "2024-01-01T14:00:00Z"
  }
}
```

## SDKs

### JavaScript/TypeScript SDK

```typescript
import { NeonProAPI } from "@neonpro/sdk";

const api = new NeonProAPI({
  apiKey: "your-api-key",
  baseUrl: "https://api.neonpro.com.br/v1",
});

// AI consultation with semantic caching
const response = await api.ai.consultation({
  messages: [{ role: "user", content: "Treatment recommendations?" }],
  options: {
    enableCache: true,
    aestheticContext: {
      clientId: "hashed-client-id",
    },
  },
});

// LGPD compliance check
const compliance = await api.compliance.lgpd.check({
  processingContext: {
    operation: "client_data_access",
    legalBasis: "consent",
  },
});

// Schedule appointment
const appointment = await api.appointments.schedule({
  clientId: "client-uuid",
  professionalId: "professional-uuid",
  scheduledAt: "2024-01-01T14:00:00Z",
  treatmentType: "botox",
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
    'eventType': 'client_interaction',
    'data': {
        'clientId': 'hashed-client-id',
        'interactionType': 'consultation'
    }
})

# Create client
client = api.clients.create({
    'name': 'Client Name',
    'email': 'client@email.com',
    'consentGiven': True
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
import { useNeonProAPI } from "@neonpro/react";

function ClientConsultation() {
  const {
    data: client,
    loading,
    error,
  } = useNeonProAPI(`/clients/${clientId}`, {
    headers: {
      "X-Data-Subject-Request": "true",
      "X-Purpose": "aesthetic_treatment",
    },
  });

  const [consultationMessage, setConsultationMessage] = useState("");

  const sendConsultation = async () => {
    const response = await fetch("/ai-chat/consultation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: consultationMessage }],
        options: {
          enableCache: true,
          aestheticContext: {
            clientId: client?.id,
            professionalId: currentUser.id,
          },
        },
      }),
    });
  };

  return <div>{/* Client consultation interface */}</div>;
}
```

### Backend Integration

```typescript
import { Hono } from "hono";
import { NeonProAPI } from "@neonpro/hono";

const app = new Hono();
const neonpro = new NeonProAPI({
  apiKey: process.env.NEONPRO_API_KEY,
});

// Enhanced AI consultation with semantic caching
app.post("/consultation", async (c) => {
  const { messages, aestheticContext } = await c.req.json();

  const response = await neonpro.ai.consultation({
    messages,
    options: {
      enableCache: true,
      aestheticContext,
    },
  });

  return c.json(response);
});

// LGPD compliance validation
app.post("/validate-processing", async (c) => {
  const { processingContext } = await c.req.json();

  const compliance = await neonpro.compliance.lgpd.check({
    processingContext,
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

- Initial API release for aesthetic clinics
- LGPD compliance implementation
- AI consultation with semantic caching
- Client management and appointment scheduling
- Security headers validation
- Performance optimization features

### v1.1.0 (2024-01-15)

- Enhanced PII redaction for client photos
- Improved semantic caching for treatment recommendations
- Additional aesthetic clinic metrics
- Webhook support for appointments
- SDK releases for JavaScript/Python

This API documentation provides comprehensive information for integrating with the NeonPro aesthetic clinic platform, ensuring compliance with data protection regulations while providing optimal performance and security.

## Quick Reference

**Performance Tips:**

- Use Bun for faster installs (3-5x improvement)
- Validate with Zod schemas for type safety
- Monitor API latency with Sentry
- Test coverage ≥90% for business logic
- Cache frequently accessed data with Redis
- Use connection pooling for database queries

**Production Checklist:**

- [x] Environment variables configured
- [x] Database migrations applied
- [x] Error tracking enabled (Sentry)
- [x] Performance monitoring active
- [x] Security headers implemented
- [x] Rate limiting configured
- [x] Backup procedures tested
- [x] Health checks operational
- [x] LGPD compliance validated
- [x] OpenAPI documentation complete

### Essential Endpoints

| Endpoint                  | Method   | Purpose                     | Status         |
| ------------------------- | -------- | --------------------------- | -------------- |
| `/api/clients`            | GET/POST | Client management           | ✅ Implemented |
| `/api/appointments`       | GET/POST | Appointment scheduling      | ✅ Implemented |
| `/api/auth/login`         | POST     | Professional authentication | ✅ Implemented |
| `/api/compliance/consent` | POST     | LGPD consent management     | ✅ Implemented |
| `/api/treatments`         | GET/POST | Treatment catalog           | ✅ Implemented |
| `/api/invoices`           | GET/POST | Financial management        | ✅ Implemented |
| `/api/health`             | GET      | Health check                | ✅ Implemented |

---

**Focus**: Production-ready API for NeonPro aesthetic clinics platform  
**Compliance**: LGPD compliant for aesthetic treatments and client data  
**Target**: Aesthetic clinic platform developers  
**Version**: 1.1.0 - Production Ready  
**Last Updated**: 2025-09-22  
**Next Review**: 2025-12-22
