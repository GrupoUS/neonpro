# NeonPro API Documentation - Version: 1.0.0

## Overview

Comprehensive API documentation for NeonPro Advanced Aesthetic Clinics Platform, targeting aesthetic clinic developers implementing AI-powered aesthetic consultation chat, no-show prediction, and LGPD-compliant patient management.

### Target Audience

- Advanced aesthetic clinic software developers
- System integrators for aesthetic clinics
- DevOps engineers implementing aesthetic clinic solutions
- Compliance officers validating LGPD requirements

### API Design Philosophy

- **Security First**: All endpoints implement encryption and audit trails
- **LGPD Native**: Built-in compliance validation and consent management
- **Performance Optimized**: Sub-200ms response times for critical operations
- **Extensible**: Plugin architecture for future AI models and regulations

## Prerequisites

- Node.js 18+ with TypeScript
- Next.js 15 + React 19 knowledge
- Supabase account and project setup
- OpenAI API key with GPT-4 access
- Basic understanding of LGPD compliance requirements

## Tech Stack

```yaml
Frontend: Next.js 15 + React 19 + TypeScript
AI: Vercel AI SDK + OpenAI GPT-4 + TensorFlow.js
Database: Supabase (PostgreSQL) + Row Level Security
Auth: Supabase Auth + MFA for PHI access
Compliance: LGPD automático + Audit trail
Validation: Zod + Server-side validation
Security: Encryption at rest + Data anonymization
```

## Performance Targets

- **Chat IA Response**: < 200ms first token
- **Patient Records Access**: < 500ms query time
- **No-Show Prediction**: < 100ms inference time
- **API Availability**: 99.9% uptime SLA

## Development Standards

### Code Quality Requirements

- **TypeScript Strict Mode**: All APIs must use strict TypeScript
- **Input Validation**: Zod schemas for all request/response validation
- **Error Handling**: Structured error responses with correlation IDs
- **Testing**: Minimum 80% code coverage with integration tests

### Security Standards

- **Authentication**: JWT + MFA for aesthetic patient data access
- **Encryption**: AES-256 for data at rest, TLS 1.3 for transit
- **Audit Logging**: All aesthetic patient data access logged with user context
- **Rate Limiting**: Configurable per-endpoint rate limits

### LGPD Compliance Patterns

```typescript
// Standard LGPD validation middleware for aesthetic procedures
export async function validateLGPDConsent(
  patientId: string,
  purpose: ConsentPurpose,
  req: Request,
) {
  const consent = await getPatientConsent(patientId, purpose);
  if (!consent.isValid()) {
    await auditLog("lgpd_violation_attempt", {
      patientId,
      purpose,
      user: req.user,
    });
    throw new LGPDViolationError(
      "Missing or expired consent for aesthetic procedure",
    );
  }
  return consent;
}
```

---

## 🤖 Chat IA para Estética Avançada

### Streaming Chat Endpoint

**POST** `/api/v1/chat/stream`

```typescript
// Request
interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  patient_id?: string;
  context_type: "general" | "aesthetic_consultation" | "procedure_planning";
}

// Response (Streaming)
interface ChatResponse {
  id: string;
  object: "chat.completion.chunk";
  choices: Array<{
    delta: { content?: string; };
    finish_reason?: "stop" | "length";
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; };
}
```

### Implementation Example

```typescript
// app/api/v1/chat/stream/route.ts
export async function POST(req: Request) {
  const { messages, patient_id, context_type } = await req.json();

  // LGPD Validation
  if (patient_id) {
    await validateLGPDConsent(patient_id, "aesthetic_consultation");
  }

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: [
      { role: "system", content: getSystemPrompt(context_type) },
      ...messages,
    ],
    temperature: 0.1,
    maxTokens: 1000,
  });

  return result.toAIStreamResponse();
}
```

### Features

- **LGPD Compliance**: Automatic consent validation before PHI access
- **Aesthetic Context**: Patient aesthetic history integration with privacy controls
- **Audit Trail**: All interactions logged with user identification
- **Safety Guardrails**: Aesthetic procedure disclaimer injection and harmful content filtering

---

## 🎯 Predição Anti-No-Show

### Prediction Endpoint

**POST** `/api/v1/ml/no-show-prediction`

```typescript
// Request
interface NoShowRequest {
  appointment_id: string;
  features?: {
    patient_age?: number;
    procedure_value?: number;
    days_until_appointment?: number;
    appointment_hour?: number;
    payment_method?: "private" | "cash" | "card";
    weather_forecast?: "sunny" | "rainy" | "cloudy";
  };
}

// Response
interface NoShowResponse {
  appointment_id: string;
  no_show_probability: number; // 0-1
  confidence_score: number; // 0-1
  risk_level: "low" | "medium" | "high";
  contributing_factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  model_version: string;
  prediction_timestamp: string;
}
```

### Implementation Example

```typescript
// app/api/v1/ml/no-show-prediction/route.ts
export async function POST(req: Request) {
  const { appointment_id, features } = await req.json();

  const model = await tf.loadLayersModel("/models/no-show-v2.json");
  const appointmentFeatures = await getAppointmentFeatures(
    appointment_id,
    features,
  );
  const prediction = model.predict(tf.tensor2d([appointmentFeatures]));
  const probability = await prediction.data();

  return Response.json({
    appointment_id,
    no_show_probability: probability[0],
    confidence_score: calculateConfidence(appointmentFeatures),
    risk_level: probability[0] > 0.7 ? "high" : probability[0] > 0.4 ? "medium" : "low",
    contributing_factors: calculateRiskFactors(
      appointmentFeatures,
      probability[0],
    ),
    model_version: "v2.1.0",
  });
}
```

### Model Features

- **Patient Demographics**: Age, gender, location distance
- **Historical Behavior**: Previous no-show rate, cancellation patterns
- **Appointment Context**: Time, day of week, aesthetic procedure type, cost
- **External Factors**: Weather, traffic, seasonal patterns
- **Payment Method**: Private vs. self-pay correlation

---

## 👥 Gestão de Pacientes

### Patient Creation

**POST** `/api/v1/patients`

```typescript
// Request
interface PatientCreateRequest {
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  birth_date: string; // ISO date
  lgpd_consent: {
    medical_treatment: boolean;
    appointment_scheduling: boolean;
    marketing_communications?: boolean;
    data_sharing_research?: boolean;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Response
interface PatientCreateResponse {
  patient_id: string;
  created_at: string;
  consent_id: string;
  encrypted_fields: string[];
}
```

### Patient Retrieval

**GET** `/api/v1/patients/{patient_id}`

```typescript
// Response
interface PatientResponse {
  patient_id: string;
  name: string; // Decrypted if authorized
  cpf_masked: string; // "***.***.***-**"
  email_masked: string; // "j***@***.com"
  phone_masked?: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
  consent_status: {
    medical_treatment: { granted: boolean; date: string; };
    appointment_scheduling: { granted: boolean; date: string; };
    marketing_communications: { granted: boolean; date: string; };
  };
  access_log: Array<{
    accessed_by: string;
    access_time: string;
    purpose: string;
    fields_accessed: string[];
  }>;
}
```

### Implementation Example

```typescript
// app/api/v1/patients/route.ts
export async function POST(req: Request) {
  const validatedData = PatientSchema.parse(await req.json());

  // Validate CPF uniqueness
  const existing = await supabase
    .from("patients")
    .select("id")
    .eq("cpf_hash", hashCPF(validatedData.cpf))
    .single();

  if (existing.data) throw new Error("CPF already registered");

  // Encrypt and insert patient
  const { data: patient } = await supabase
    .from("patients")
    .insert({
      name: encrypt(validatedData.name),
      cpf_hash: hashCPF(validatedData.cpf),
      email: encrypt(validatedData.email),
      birth_date: encrypt(validatedData.birth_date),
    })
    .select()
    .single();

  // Record LGPD consent and audit log
  await Promise.all([
    recordLGPDConsent(patient.id, validatedData.lgpd_consent, req),
    createAuditLog("patient_created", patient.id, req.user?.id),
  ]);

  return Response.json({
    patient_id: patient.id,
    created_at: patient.created_at,
    encrypted_fields: ["name", "email", "birth_date"],
  });
}
```

---

## 📅 Agendamentos Inteligentes

### Appointment Creation

**POST** `/api/v1/appointments`

```typescript
// Request
interface AppointmentRequest {
  patient_id: string;
  professional_id: string;
  datetime: string; // ISO datetime
  aesthetic_procedure_type: string;
  estimated_duration: number; // minutes
  priority: "routine" | "urgent" | "emergency";
  notes?: string;
}

// Response
interface AppointmentResponse {
  appointment_id: string;
  scheduled_datetime: string;
  estimated_end_time: string;
  no_show_risk: {
    probability: number;
    level: "low" | "medium" | "high";
    factors: string[];
  };
  confirmation_required: boolean;
  reminder_schedule: Array<{
    type: "sms" | "email" | "whatsapp";
    send_at: string;
  }>;
}
```

---

## 🔒 Compliance & Auditoria

### LGPD Consent Management

**POST** `/api/v1/compliance/consent`

```typescript
// Request
interface ConsentRequest {
  patient_id: string;
  purposes: Array<
    "medical_treatment" | "appointment_scheduling" | "marketing" | "research"
  >;
  action: "grant" | "revoke" | "update";
  legal_basis: "consent" | "legitimate_interest" | "legal_obligation";
}

// Response
interface ConsentResponse {
  consent_id: string;
  patient_id: string;
  status: "active" | "revoked" | "expired";
  purposes: Record<
    string,
    {
      granted: boolean;
      granted_at?: string;
      revoked_at?: string;
      legal_basis: string;
    }
  >;
  data_retention_until: string;
  anonymization_scheduled: boolean;
}
```

---

## 📊 Monitoramento & Métricas

### System Health

**GET** `/api/v1/monitoring/health`

```typescript
interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: { status: string; response_time_ms: number; };
    ai_service: { status: string; response_time_ms: number; };
    ml_model: { status: string; model_version: string; };
  };
  metrics: {
    active_sessions: number;
    requests_per_minute: number;
    error_rate_percent: number;
    avg_response_time_ms: number;
  };
}
```

---

## 🔐 Autenticação & Segurança

### MFA for PHI Access

**POST** `/api/v1/auth/mfa/verify`

```typescript
interface MFARequest {
  user_id: string;
  mfa_code: string;
  access_purpose: "patient_data" | "medical_records" | "financial_data";
  requested_patient_id?: string;
}

interface MFAResponse {
  access_token: string;
  expires_in: number;
  scope: string[];
  audit_id: string;
}
```

---

## Troubleshooting

### Common Issues

- **LGPD Consent Error** → Verify patient has granted specific consent for the requested operation
- **High No-Show Prediction** → Check if model features are correctly extracted and normalized
- **Slow Chat Response** → Monitor OpenAI API latency and consider response caching
- **Encryption Errors** → Ensure encryption keys are properly configured in environment

### Error Codes

- `LGPD_001`: Missing or revoked consent
- `ML_001`: Model prediction failed
- `AUTH_001`: MFA required for PHI access
- `VAL_001`: Input validation failed

---

## Architecture Patterns & Future Extensibility

### Design Principles

- **Domain-Driven Design**: APIs organized by aesthetic clinic domains (Patient, Appointment, Aesthetic)
- **Event-Driven Architecture**: Async processing for audit trails and notifications
- **CQRS Pattern**: Separate read/write models for performance optimization
- **Microservices Ready**: Each domain can be extracted to independent services

### Future Extension Points

- **Plugin Architecture**: Modular AI model integration (GPT-4, Claude, local models)
- **Extensible Compliance Framework**: Support for HIPAA, GDPR, and regional regulations
- **Multi-tenant Architecture**: Hospital/clinic isolation with shared infrastructure

### Integration Patterns

- **Webhook System**: Real-time notifications for external systems
- **GraphQL Gateway**: Unified API layer for complex client requirements
- **Message Queue Integration**: Async processing with Redis/RabbitMQ
- **CDC (Change Data Capture)**: Real-time data synchronization

### Extensibility Guidelines

#### AI Model Integration

```typescript
// Future AI provider interface
interface AIProvider {
  name: string;
  capabilities: AICapability[];
  process(input: AestheticContext): Promise<AIResponse>;
  validateCompliance(region: ComplianceRegion): boolean;
}

// Plugin registration system
class AIModelRegistry {
  static register(provider: AIProvider): void;
  static getProvider(capability: AICapability): AIProvider;
}
```

#### Compliance Framework Extension

```typescript
// Extensible compliance rules
interface ComplianceRule {
  region: string; // 'BR-LGPD', 'US-HIPAA', 'EU-GDPR'
  validate(data: PatientData, context: AccessContext): ComplianceResult;
  encrypt(data: SensitiveData): EncryptedData;
  auditRequirements(): AuditRequirement[];
}

// Auto-discovery of compliance rules
class ComplianceEngine {
  static loadRules(region: string): ComplianceRule[];
  static validateAccess(request: APIRequest): Promise<ComplianceResult>;
}
```

#### Multi-tenant Architecture

```typescript
// Tenant isolation patterns
interface TenantContext {
  tenantId: string;
  region: string;
  complianceRules: ComplianceRule[];
  aiProviders: AIProvider[];
  customFields: Record<string, any>;
}

// Middleware for tenant resolution
export function withTenantContext(handler: APIHandler): APIHandler {
  return async (req: Request) => {
    const tenant = await resolveTenant(req);
    req.tenant = tenant;
    return handler(req);
  };
}
```

---

## Related Documentation

- [Database Schema](/docs/database-schema/README.md) - Aesthetic clinic database design
- [Architecture Decision Records](/docs/architecture/) - Aesthetic platform architecture decisions
- [ai-sdk](/docs/apis/ai-sdk-v5.0.md/) - Aesthetic clinic AI SDK
- [api-specification](/docs/apis/api-specification.yaml) - Aesthetic clinic API specification
