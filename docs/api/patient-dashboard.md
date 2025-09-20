# Patient Dashboard API Documentation (T081)

## Overview

The Patient Dashboard API provides comprehensive patient management capabilities with Brazilian healthcare compliance (LGPD, ANVISA, CFM), AI integration, and real-time features.

**Base URL**: `/api/v2`

## Authentication

All endpoints require authentication with a valid JWT token. Healthcare professionals must have valid CFM/CRM number.

```
Authorization: Bearer <jwt-token>
CFM-Number: <professional-license>
```

## Patient Management

### List Patients

**GET** `/patients`

Retrieve a paginated list of patients with filtering and search capabilities.

**Query Parameters**:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search term for name, CPF, or email
- `status` (string) - Filter by patient status
- `dateFrom` (string) - Filter by registration date (ISO format)
- `dateTo` (string) - Filter by registration date (ISO format)

**Response**:
```json
{
  "success": true,
  "data": {
    "patients": [
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

### Create Patient

**POST** `/patients`

Register a new patient with comprehensive validation and LGPD consent.

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
  "healthInsurance": {
    "provider": "Unimed",
    "plan": "Plano Ouro",
    "cardNumber": "1234567890"
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

### Get Patient

**GET** `/patients/{id}`

Retrieve detailed information about a specific patient.

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
    "healthInsurance": {
      "provider": "Unimed",
      "plan": "Plano Ouro"
    },
    "registeredAt": "2024-01-15T10:30:00Z",
    "lastVisit": "2024-01-20T14:00:00Z",
    "medicalSummary": {
      "conditions": ["Hipertensão"],
      "allergies": ["Penicilina"],
      "medications": ["Losartana 50mg"]
    }
  }
}
```

### Update Patient

**PUT** `/patients/{id}`

Update patient information with audit trail.

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

### Delete Patient

**DELETE** `/patients/{id}`

Soft delete a patient with LGPD compliance.

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

### Search Patients

**POST** `/patients/search`

Advanced patient search with multiple filters.

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
    "insuranceProvider": "Unimed"
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

**POST** `/patients/bulk-actions`

Perform bulk operations on multiple patients.

**Request Body**:
```json
{
  "action": "export",
  "patientIds": ["uuid1", "uuid2", "uuid3"],
  "format": "csv",
  "fields": ["name", "cpf", "email", "phone", "status"]
}
```

### Patient History

**GET** `/patients/{id}/history`

Retrieve patient audit trail and history.

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
          "name": "Dr. João Santos",
          "cfm": "123456/SP"
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
  "message": "Paciente apresenta dor abdominal há 3 dias",
  "context": {
    "patientId": "optional-patient-id",
    "medicalHistory": true,
    "currentMedications": true
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
  "content": "Analisando os sintomas...",
  "timestamp": "2024-01-20T15:00:00Z"
}
```

### Get Patient Insights

**GET** `/ai/insights/{patientId}`

Retrieve AI-generated insights for a patient.

**Response**:
```json
{
  "success": true,
  "data": {
    "patientId": "uuid",
    "insights": [
      {
        "type": "risk_alert",
        "title": "Risco de Diabetes Tipo 2",
        "description": "Paciente apresenta múltiplos fatores de risco",
        "confidence": 0.85,
        "recommendations": [
          "Solicitar exame de glicemia de jejum",
          "Orientar sobre dieta e exercícios"
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
  "data": "Relatório de exames do paciente",
  "patientId": "optional-patient-id",
  "analysisType": "medical_summary"
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
        "capabilities": ["text", "medical_analysis"],
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

- Healthcare professionals: 1000 requests/hour
- AI features: 100 requests/hour
- Bulk operations: 10 requests/hour

## Compliance

- **LGPD**: All patient data is handled according to Brazilian data protection laws
- **ANVISA**: Compliance with medical device regulations
- **CFM**: Professional license validation and audit logging
- **Audit Trail**: All actions are logged with professional identification

## WebSockets

Real-time features available at:
- `wss://api.example.com/ws/chat` - AI chat streaming
- `wss://api.example.com/ws/patients` - Patient data updates
- `wss://api.example.com/ws/notifications` - Real-time notifications

## SDK Examples

### JavaScript/TypeScript

```typescript
import { PatientAPI } from '@neonpro/api';

const api = new PatientAPI({
  baseURL: 'https://api.example.com/api/v2',
  token: 'your-jwt-token',
  cfmNumber: '123456/SP'
});

// List patients
const patients = await api.patients.list({
  search: 'Maria',
  limit: 10
});

// Create patient
const patient = await api.patients.create({
  name: 'Maria Silva',
  cpf: '123.456.789-09',
  email: 'maria.silva@email.com'
});

// Chat with AI
const response = await api.ai.chat({
  message: 'Paciente apresenta dor abdominal',
  context: { patientId: patient.id }
});
```

## Testing

Contract tests available in `/apps/api/tests/contract/`:
- Patient API tests: `test_patients_*.ts`
- AI API tests: `test_ai_*.ts`
- Integration tests: `/tests/integration/`