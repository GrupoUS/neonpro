# Client Dashboard API Documentation (T081)

## Overview

The Client Dashboard API provides comprehensive client management capabilities with Brazilian aesthetic clinic compliance (LGPD, ANVISA, Professional Councils), AI integration, and real-time features.

**Base URL**: `/api/v2`

## Authentication

All endpoints require authentication with a valid JWT token. Aesthetic professionals must have valid professional council license.

```
Authorization: Bearer <jwt-token>
License-Number: <professional-license>
License-Type: <council-type>
```

## Client Management

### List Clients

**GET** `/clients`

Retrieve a paginated list of clients with filtering and search capabilities.

**Query Parameters**:

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search term for name, CPF, or email
- `status` (string) - Filter by client status
- `dateFrom` (string) - Filter by registration date (ISO format)
- `dateTo` (string) - Filter by registration date (ISO format)

**Response**:

```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "name": "Maria Silva",
        "cpf": "***.123.456-**",
        "email": "maria.silva@email.com",
        "phone": "(11) 99999-8888",
        "status": "active",
        "registeredAt": "2024-01-15T10:30:00Z",
        "lastVisit": "2024-01-20T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Create Client

**POST** `/clients`

Register a new client with comprehensive validation and LGPD consent.

**Request Body**:

```json
{
  "name": "Maria Silva",
  "cpf": "123.456.789-09",
  "email": "maria.silva@email.com",
  "phone": "(11) 99999-8888",
  "birthDate": "1985-05-15",
  "gender": "female",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Vila Madalena",
    "city": "São Paulo",
    "state": "SP",
    "cep": "05432-100"
  },
  "preferences": {
    "contactMethod": "whatsapp",
    "notificationFrequency": "weekly",
    "skinType": "mixed",
    "concerns": ["acne", "aging"]
  },
  "emergencyContact": {
    "name": "José Silva",
    "relationship": "spouse",
    "phone": "(11) 98888-7777"
  },
  "lgpdConsent": {
    "dataProcessing": true,
    "dataSharing": true,
    "retentionPeriod": "10_years"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Maria Silva",
    "cpf": "***.123.456-**",
    "status": "active",
    "registeredAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Client

**GET** `/clients/{id}`

Retrieve detailed information about a specific client.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Maria Silva",
    "cpf": "***.123.456-**",
    "email": "maria.silva@email.com",
    "phone": "(11) 99999-8888",
    "birthDate": "1985-05-15",
    "gender": "female",
    "status": "active",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Vila Madalena",
      "city": "São Paulo",
      "state": "SP",
      "cep": "05432-100"
    },
    "preferences": {
      "skinType": "mixed",
      "concerns": ["acne", "aging"],
      "contactMethod": "whatsapp"
    },
    "registeredAt": "2024-01-15T10:30:00Z",
    "lastVisit": "2024-01-20T14:00:00Z",
    "aestheticSummary": {
      "skinConditions": ["acne"],
      "previousTreatments": ["chemical_peel"],
      "productPreferences": ["hypoallergenic"],
      "contraindications": ["pregnancy"]
    }
  }
}
```

### Update Client

**PUT** `/clients/{id}`

Update client information with audit trail.

**Request Body**:

```json
{
  "name": "Maria Silva Santos",
  "phone": "(11) 97777-6666",
  "address": {
    "street": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "cep": "01310-100"
  }
}
```

### Delete Client

**DELETE** `/clients/{id}`

Soft delete a client with LGPD compliance.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "deleted",
    "deletedAt": "2024-01-20T15:30:00Z"
  }
}
```

### Search Clients

**POST** `/clients/search`

Advanced client search with multiple filters.

**Request Body**:

```json
{
  "filters": {
    "name": "Maria",
    "cpf": "123.456.789",
    "email": "@email.com",
    "phone": "99999",
    "city": "São Paulo",
    "state": "SP",
    "skinType": "mixed"
  },
  "dateRange": {
    "registeredFrom": "2024-01-01",
    "registeredTo": "2024-01-31"
  },
  "sortBy": "name",
  "sortOrder": "asc",
  "page": 1,
  "limit": 20
}
```

### Bulk Actions

**POST** `/clients/bulk-actions`

Perform bulk operations on multiple clients.

**Request Body**:

```json
{
  "action": "export",
  "clientIds": ["uuid1", "uuid2", "uuid3"],
  "format": "csv",
  "fields": ["name", "cpf", "email", "phone", "status"]
}
```

### Client History

**GET** `/clients/{id}/history`

Retrieve client audit trail and history.

**Response**:

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "action": "PROFILE_UPDATED",
        "timestamp": "2024-01-20T14:30:00Z",
        "performedBy": {
          "id": "user123",
          "name": "João Santos",
          "license": "123456/SP",
          "councilType": "CNEP"
        },
        "changes": {
          "phone": {
            "from": "(11) 99999-8888",
            "to": "(11) 97777-6666"
          }
        }
      }
    ]
  }
}
```

## AI Features

### Chat with AI

**POST** `/ai/chat`

Initiate or continue a chat session with AI assistant.

**Request Body**:

```json
{
  "sessionId": "optional-session-id",
  "message": "Cliente apresenta acne inflamatória há 3 dias",
  "context": {
    "clientId": "optional-client-id",
    "aestheticHistory": true,
    "currentTreatments": true
  },
  "model": "gpt-4",
  "streaming": true
}
```

**Response** (Streaming):

```json
{
  "type": "message",
  "sessionId": "session-uuid",
  "messageId": "msg-uuid",
  "content": "Analisando as condições da pele...",
  "timestamp": "2024-01-20T15:00:00Z"
}
```

### Get Client Insights

**GET** `/ai/insights/{clientId}`

Retrieve AI-generated insights for a client.

**Response**:

```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "insights": [
      {
        "type": "treatment_recommendation",
        "title": "Recomendação de Tratamento para Pele Acneica",
        "description": "Cliente apresenta múltiplos fatores para tratamento combinado",
        "confidence": 0.85,
        "recommendations": [
          "Sugerir protocolo de limpeza profunda",
          "Recomendar sérum com ácido salicílico"
        ]
      }
    ],
    "generatedAt": "2024-01-20T15:00:00Z"
  }
}
```

### Analyze with AI

**POST** `/ai/analyze`

Perform multi-modal AI analysis.

**Request Body**:

```json
{
  "type": "text",
  "data": "Análise de condições da pele do cliente",
  "clientId": "optional-client-id",
  "analysisType": "aesthetic_assessment"
}
```

### Get AI Models

**GET** `/ai/models`

Retrieve available AI models.

**Response**:

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4",
        "name": "GPT-4",
        "provider": "OpenAI",
        "capabilities": ["text", "aesthetic_analysis"],
        "status": "available",
        "latency": 1500
      },
      {
        "id": "claude-3",
        "name": "Claude 3",
        "provider": "Anthropic",
        "capabilities": ["text", "multilingual"],
        "status": "available",
        "latency": 1200
      }
    ]
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "field": "cpf",
      "message": "CPF inválido"
    },
    "timestamp": "2024-01-20T15:00:00Z",
    "requestId": "req-uuid"
  }
}
```

## Rate Limiting

- Aesthetic professionals: 1000 requests/hour
- AI features: 100 requests/hour
- Bulk operations: 10 requests/hour

## Compliance

- **LGPD**: All client data is handled according to Brazilian data protection laws
- **ANVISA**: Compliance with cosmetic product regulations
- **Professional Councils**: Professional license validation and audit logging
- **Audit Trail**: All actions are logged with professional identification

## WebSockets

Real-time features available at:

- `wss://api.example.com/ws/chat` - AI chat streaming
- `wss://api.example.com/ws/clients` - Client data updates
- `wss://api.example.com/ws/notifications` - Real-time notifications

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ClientAPI } from "@neonpro/api";

const api = new ClientAPI({
  baseURL: "https://api.example.com/api/v2",
  token: "your-jwt-token",
  licenseNumber: "123456/SP",
  licenseType: "CNEP",
});

// List clients
const clients = await api.clients.list({
  search: "Maria",
  limit: 10,
});

// Create client
const client = await api.clients.create({
  name: "Maria Silva",
  cpf: "123.456.789-09",
  email: "maria.silva@email.com",
});

// Chat with AI
const response = await api.ai.chat({
  message: "Cliente apresenta acne inflamatória",
  context: { clientId: client.id },
});
```

## Testing

Contract tests available in `/apps/api/tests/contract/`:

- Client API tests: `test_clients_*.ts`
- AI API tests: `test_ai_*.ts`
- Integration tests: `/tests/integration/`
