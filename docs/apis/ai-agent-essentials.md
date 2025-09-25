---
title: "AI Agent API Essentials - AG-UI Protocol Integration"
last_updated: 2025-09-24
form: reference
tags: [ai-agent, api, ag-ui, copilotkit, healthcare]
related:
  - ./AGENTS.md
  - ./core-api.md
  - ./ai-sdk-essentials.md
---

# AI Agent API Essentials — AG-UI Protocol Integration

## Overview

NeonPro AI services implement the **AG-UI Protocol** for lightweight, event-based communication between AI agents and healthcare applications. This protocol enables real-time agentic chat, bi-directional state sync, and generative UI components.

## Core Architecture

### AG-UI Protocol Integration
- **Event-based communication** with standard event types
- **Loose event format matching** for flexibility
- **Multi-transport support** (SSE, WebSockets, HTTP)
- **Healthcare-compliant** event handling with PII protection

### CopilotKit Integration
- **React UI components** for healthcare interfaces
- **useCoAgent hooks** for state synchronization
- **useCopilotAction** for streaming healthcare operations
- **Prompt injection protection** for security

## Core Endpoints

### Chat Interface (AG-UI Protocol)

```bash
POST /api/ai/chat         # Send message to AI agent
GET  /api/ai/sessions/:id # Get session history
WS   /api/ai/ws          # Real-time AG-UI events
```

### Healthcare Data Queries

```bash
POST /api/ai/query        # Natural language healthcare queries
GET  /api/ai/status       # Agent health check
POST /api/ai/tools       # Tool execution for healthcare operations
```

## Authentication & Security

```bash
Authorization: Bearer <JWT_TOKEN>
X-Healthcare-Context: clinic_id|patient_id|role
```

## AG-UI Event Types

### Core Healthcare Events

```typescript
// Patient inquiry events
interface PatientInquiryEvent {
  type: 'patient.inquiry'
  payload: {
    patientId: string
    inquiry: string
    context: 'medical_history' | 'appointments' | 'treatment'
  }
}

// Appointment management events
interface AppointmentEvent {
  type: 'appointment.create' | 'appointment.update' | 'appointment.cancel'
  payload: {
    patientId: string
    dateTime: string
    procedure: string
    providerId: string
  }
}

// Clinical decision support events
interface ClinicalSupportEvent {
  type: 'clinical.support'
  payload: {
    patientId: string
    symptoms: string[]
    medicalHistory: string[]
    recommendations: string[]
  }
}
```

## Basic Usage

### Send Chat Message with AG-UI Protocol

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-AG-UI-Version': '1.0',
    'X-Healthcare-Context': 'clinic_123|patient_456|doctor',
  },
  body: JSON.stringify({
    type: 'chat',
    message: 'Quais os próximos agendamentos do paciente João?',
    sessionId: 'session_123',
    context: {
      patientId: 'patient_456',
      clinicId: 'clinic_123',
      userId: 'doctor_789',
    },
    metadata: {
      urgency: 'normal',
      category: 'appointment_inquiry',
    },
  }),
})

const data = await response.json()
```

### AG-UI Response Format

```typescript
interface AGUIResponse {
  id: string
  type: 'text' | 'table' | 'list' | 'form' | 'clinical_ui'
  content: {
    title: string
    text?: string
    data?: any[]
    ui?: AGUIComponent[]
  }
  metadata: {
    processingTime: number
    confidence: number
    compliance: {
      lgpd: boolean
      hippa: boolean
      anvisa: boolean
    }
  }
  events: AGUIEvent[]
}

interface AGUIComponent {
  type: 'patient_card' | 'appointment_form' | 'medical_summary'
  props: Record<string, any>
  actions: string[]
}
```

## WebSocket Real-time Communication

```typescript
const ws = new WebSocket('wss://api.neonpro.com/ai/ws')

// Send AG-UI compliant event
ws.send(JSON.stringify({
  type: 'chat',
  message: 'Verificar histórico de alergias do paciente',
  sessionId: 'session_123',
  context: {
    patientId: 'patient_456',
    clinicId: 'clinic_123',
  },
  metadata: {
    urgency: 'high',
    category: 'medical_inquiry',
  },
}))

// Listen for real-time updates
ws.addEventListener('message', (event) => {
  const aguiEvent = JSON.parse(event.data)
  
  switch (aguiEvent.type) {
    case 'patient.data':
      updatePatientUI(aguiEvent.payload)
      break
    case 'appointment.update':
      refreshAppointments(aguiEvent.payload)
      break
    case 'clinical.alert':
      showClinicalAlert(aguiEvent.payload)
      break
  }
})
```

## CopilotKit Integration

### React Hook Integration

```typescript
import { useCoAgent, useCopilotAction } from '@copilotkit/react'

export function HealthcareAssistant() {
  const { state, setState } = useCoAgent({
    name: 'healthcare-assistant',
    initialState: {
      patient: null,
      appointments: [],
      clinicalNotes: [],
    },
  })

  const bookAppointment = useCopilotAction({
    name: 'book-appointment',
    description: 'Book medical appointment',
    parameters: [
      {
        name: 'patientId',
        type: 'string',
        description: 'Patient identifier',
        required: true,
      },
      {
        name: 'dateTime',
        type: 'string',
        description: 'Appointment date and time',
        required: true,
      },
    ],
    handler: async ({ patientId, dateTime }) => {
      const appointment = await bookMedicalAppointment(patientId, dateTime)
      setState(prev => ({
        ...prev,
        appointments: [...prev.appointments, appointment],
      }))
      return appointment
    },
  })

  return (
    <div>
      {/* Healthcare UI components with real-time sync */}
      <PatientCard patient={state.patient} />
      <AppointmentList appointments={state.appointments} />
      
      <ChatInterface 
        onAction={bookAppointment}
        onStateChange={setState}
      />
    </div>
  )
}
```

## Healthcare-Specific Features

### LGPD Compliance

```typescript
// Automatic PII redaction in responses
interface LGPDComplianceConfig {
  redactPII: boolean
  auditLog: boolean
  dataRetention: number // days
  consentRequired: boolean
}

const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'X-LGPD-Compliance': JSON.stringify({
      redactPII: true,
      auditLog: true,
      dataRetention: 365,
      consentRequired: true,
    }),
  },
  // ... rest of request
})
```

### Clinical Decision Support

```typescript
interface ClinicalDecisionRequest {
  type: 'clinical.decision'
  payload: {
    patientId: string
    symptoms: string[]
    vitals: {
      bloodPressure: string
      heartRate: number
      temperature: number
    }
    medications: string[]
    allergies: string[]
  }
}

const response = await fetch('/api/ai/clinical-decision', {
  method: 'POST',
  body: JSON.stringify(clinicalDecisionRequest),
})
```

## Tool Calling for Healthcare Operations

```typescript
interface HealthcareTools {
  // Patient management
  getPatientInfo: (patientId: string) => Promise<Patient>
  updatePatientRecord: (patientId: string, data: Partial<Patient>) => Promise<void>
  
  // Appointment management
  getAppointments: (filters: AppointmentFilters) => Promise<Appointment[]>
  createAppointment: (appointment: NewAppointment) => Promise<Appointment>
  cancelAppointment: (appointmentId: string, reason: string) => Promise<void>
  
  // Clinical operations
  getMedicalHistory: (patientId: string) => Promise<MedicalRecord[]>
  prescribeMedication: (prescription: Prescription) => Promise<Prescription>
  generateClinicalSummary: (patientId: string) => Promise<ClinicalSummary>
  
  // Compliance and audit
  auditAccess: (action: AuditAction) => Promise<void>
  checkConsent: (patientId: string, action: string) => Promise<boolean>
}
```

## Rate Limits & Quotas

- **REST API**: 100 requests/minute per clinic
- **WebSocket**: 50 connections/user
- **AI Tool Calls**: 1000 calls/day per organization
- **Clinical Decisions**: 500 requests/day per provider

## Security Features

- **Prompt Injection Protection**: Advanced filtering for healthcare prompts
- **PII Detection**: Automatic detection and redaction of sensitive information
- **Audit Logging**: Complete audit trail for all AI interactions
- **Role-based Access**: Healthcare-specific role enforcement
- **Data Encryption**: End-to-end encryption for all communications

## Error Handling

```typescript
interface HealthcareAIError {
  code: 'PII_DETECTED' | 'CONSENT_REQUIRED' | 'CLINICAL_RISK' | 'RATE_LIMIT'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action_required: boolean
  resolution?: string
}

// Error handling example
try {
  const response = await fetch('/api/ai/chat', { /* ... */ })
} catch (error) {
  if (error.code === 'PII_DETECTED') {
    showPrivacyAlert('Informação confidencial detectada. Use dados anonimizados.')
  } else if (error.code === 'CONSENT_REQUIRED') {
    requestPatientConsent(patientId, action)
  }
}
```

## See Also

- [AI SDK Implementation Guide](./ai-sdk-essentials.md)
- [API Control Hub](./AGENTS.md)
- [Core API Reference](./core-api.md)
- [AG-UI Protocol Specification](https://github.com/ag-ui-protocol/ag-ui)
- [CopilotKit Documentation](https://github.com/CopilotKit/CopilotKit)
