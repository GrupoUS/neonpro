# NEONPRO API Documentation

**Advanced Aesthetic Clinics Platform - Version 2.0**

## Overview

This file contains instructions and examples for documenting APIs in the NEONPRO project. Complete endpoint documentation is organized in individual files within the `docs/apis/` folder. API documentation for NeonPro Advanced Aesthetic Clinics Platform with AI-powered consultation, appointment optimization, and modern clinic management.

## API Documentation Instructions

### File Organization

- **Location**: All API documentation files must be in the `docs/apis/` folder
- **Naming**: Use descriptive names that reflect functionality (e.g., `events-crud.md`, `auth.md`)
- **Multiple Endpoints**: A single file can document multiple related endpoints
- **Size Limit**: Each file must not exceed **250 lines** to maintain readability
- **Grouping**: Group endpoints by functionality or domain (e.g., events, authentication, participants)

### Required Structure for Each Endpoint

Each documented endpoint must contain:

1. **Title**: `### [METHOD] /api/path`
2. **Purpose**: Clear description of what the endpoint does
3. **Authentication**: Authentication requirements (if applicable)
4. **Parameters**: Query parameters, path parameters, headers
5. **Request Body**: Expected JSON structure (if applicable)
6. **Responses**: Status codes and response structures
7. **Notes**: Additional important information
8. **File Path**: Location of the route file in the codebase

## Endpoint Documentation Example

### [GET] /api/events

**Purpose:** Lists all events from the authenticated organizer with support for filters and pagination.

**Authentication:** Requires Supabase authentication (Bearer token)

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by event name or description
- `category` (string, optional): Filter by category
- `status` (string, optional): Filter by status (`draft`, `published`, `cancelled`)
- `date_from` (string, optional): Start date (ISO 8601 format)
- `date_to` (string, optional): End date (ISO 8601 format)

**Success Response (200):**

```json
{
  "events": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "date": "2024-01-15T10:00:00Z",
      "location": "string",
      "category": "string",
      "status": "published",
      "max_participants": 100,
      "current_participants": 25,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have permission to access events
- `422 Unprocessable Entity`: Invalid query parameters
- `500 Internal Server Error`: Internal server error

**Route File Path:** `src/app/api/events/route.ts`

### Tech Stack

```yaml
Framework: Next.js 15 + React 19 + TypeScript
Package_Manager: Bun
Database: Supabase (PostgreSQL + Auth + Storage)
AI: Vercel AI SDK 5.0 + OpenAI GPT-4o + TensorFlow.js
UI: shadcn/ui + Tailwind CSS
Build: Turbo (monorepo)
Testing: Vitest + Playwright
Validation: Zod + TypeScript strict
```

### Performance Targets

- **AI Chat First Token**: <200ms
- **Patient Record Access**: <500ms
- **Appointment Scheduling**: <300ms
- **No-Show Prediction**: <100ms
- **API Availability**: 99.9% uptime

---

## Vercel AI SDK 5.0 Patterns

### Core Implementation

```typescript
import { InferUITools, UIMessage, } from 'ai'

// Custom message types for aesthetic clinics
type AestheticMetadata = {
  patient_id?: string
  procedure_type?: string
  professional_id?: string
  total_tokens?: number
}

type AestheticDataParts = {
  'patient-history': {
    patient_id: string
    procedures?: Array<{ date: string; type: string }>
    status: 'loading' | 'success' | 'error'
  }
  'risk-assessment': {
    risk_level: 'low' | 'medium' | 'high'
    factors: string[]
    status: 'analyzing' | 'complete'
  }
}

// Aesthetic clinic tools
const aestheticTools = {
  get_patient_history: tool({
    description: "Retrieve patient's aesthetic treatment history",
    inputSchema: z.object({ patient_id: z.string(), },),
    execute: async ({ patient_id, },) => {
      const { data, } = await supabase
        .from('treatments',)
        .select('procedure_type, treatment_date, notes',)
        .eq('patient_id', patient_id,)
        .order('treatment_date', { ascending: false, },)
      return data
    },
  },),

  schedule_consultation: tool({
    description: 'Schedule aesthetic consultation appointment',
    inputSchema: z.object({
      patient_id: z.string(),
      procedure_type: z.string(),
      preferred_date: z.string(),
    },),
    execute: async ({ patient_id, procedure_type, preferred_date, },) => {
      // Implementation
      return { scheduled: true, appointment_id: crypto.randomUUID(), }
    },
  },),
}

type AestheticUITools = InferUITools<typeof aestheticTools>
type AestheticUIMessage = UIMessage<AestheticMetadata, AestheticDataParts, AestheticUITools>
```

### Streaming Chat Implementation

```typescript
// app/api/chat/route.ts
export async function POST(request: Request,) {
  const { messages, patient_id, } = await request.json()

  const result = await streamText({
    model: openai('gpt-4o',),
    messages: [
      {
        role: 'system',
        content: 'AI assistant for advanced aesthetic clinics. Prioritize patient safety.',
      },
      ...convertToModelMessages(messages,),
    ],
    tools: aestheticTools,
    temperature: 0.3,
    maxTokens: 1000,
  },)

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages, },) => {
      if (patient_id) {
        await saveChatHistory({ patient_id, messages, },)
      }
    },
  },)
}

// Client implementation
export function AestheticChat({ patient_id, }: { patient_id: string },) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat<
    AestheticUIMessage
  >({
    api: '/api/chat',
    body: { patient_id, },
  },)

  return (
    <div>
      <div className="messages">
        {messages.map((message,) => (
          <div key={message.id}>
            <div>{message.content}</div>
            {message.toolInvocations?.map((tool,) => (
              <div key={tool.toolCallId}>
                {tool.toolName === 'get_patient_history' && (
                  <PatientHistoryDisplay data={tool.result} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about procedures, appointments..."
          disabled={isLoading}
        />
        <button type="submit">{isLoading ? 'Thinking...' : 'Send'}</button>
      </form>
    </div>
  )
}
```

---

## Core API Endpoints

### Authentication Setup

```typescript
import { createClient, } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Auth middleware
export function withAuth(handler: Function,) {
  return async (req: Request,) => {
    const token = req.headers.get('authorization',)?.replace('Bearer ', '',)
    if (!token) return Response.json({ error: 'Unauthorized', }, { status: 401, },)

    const { data: { user, }, error, } = await supabase.auth.getUser(token,)
    if (error || !user) return Response.json({ error: 'Invalid token', }, { status: 401, },)

    req.user = user
    return handler(req,)
  }
}
```

### Patient Management

```typescript
// POST /api/patients
const CreatePatientSchema = z.object({
  name: z.string().min(2,).max(100,),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/,),
  birth_date: z.string().date(),
  consent_given: z.boolean(),
},)

export const POST = withAuth(async (req: Request,) => {
  const data = CreatePatientSchema.parse(await req.json(),)

  const { data: patient, error, } = await supabase
    .from('patients',)
    .insert({ ...data, id: crypto.randomUUID(), created_by: req.user.id, },)
    .select()
    .single()

  if (error) throw error
  return Response.json({ data: patient, },)
},)

// GET /api/patients/[id]
export const GET = withAuth(async (req: Request,) => {
  const patient_id = new URL(req.url,).pathname.split('/',).pop()

  const { data, error, } = await supabase
    .from('patients',)
    .select(`
      *, 
      appointments(id, scheduled_at, procedure_type, status),
      treatments(procedure_type, treatment_date)
    `,)
    .eq('id', patient_id,)
    .single()

  if (error) return Response.json({ error: 'Not found', }, { status: 404, },)
  return Response.json({ data, },)
},)
```

### Appointment Management

```typescript
// POST /api/appointments
const AppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  procedure_type: z.enum([
    'consultation',
    'botox_treatment',
    'dermal_filler',
    'facial_harmonization',
  ],),
  duration_minutes: z.number().min(15,).max(240,).default(60,),
},)

export const POST = withAuth(async (req: Request,) => {
  const data = AppointmentSchema.parse(await req.json(),)

  // Check conflicts
  const { data: conflicts, } = await supabase
    .from('appointments',)
    .select('id',)
    .eq('professional_id', data.professional_id,)
    .eq('status', 'scheduled',)
    .overlaps(
      'time_slot',
      `[${data.scheduled_at}, ${
        new Date(
          new Date(data.scheduled_at,).getTime() + data.duration_minutes * 60000,
        ).toISOString()
      })`,
    )

  if (conflicts?.length) {
    return Response.json({ error: 'Time slot unavailable', }, { status: 409, },)
  }

  const { data: appointment, } = await supabase
    .from('appointments',)
    .insert({ ...data, id: crypto.randomUUID(), status: 'scheduled', },)
    .select()
    .single()

  return Response.json({ data: appointment, },)
},)

// GET /api/appointments
export const GET = withAuth(async (req: Request,) => {
  const { searchParams, } = new URL(req.url,)
  const page = parseInt(searchParams.get('page',) || '1',)
  const per_page = Math.min(parseInt(searchParams.get('per_page',) || '20',), 50,)

  const from = (page - 1) * per_page
  const { data, count, } = await supabase
    .from('appointments',)
    .select(
      `
      *, 
      patient:patients(name, email),
      professional:professionals(name, specialization)
    `,
      { count: 'exact', },
    )
    .range(from, from + per_page - 1,)

  return Response.json({
    data,
    pagination: {
      page,
      per_page,
      total_count: count || 0,
      has_next: (count || 0) > from + per_page,
    },
  },)
},)
```

### No-Show Prediction

```typescript
// POST /api/ml/no-show-prediction
export const POST = withAuth(async (req: Request,) => {
  const { appointment_id, } = await req.json()

  const { data: appointment, } = await supabase
    .from('appointments',)
    .select('*, patient:patients(birth_date)',)
    .eq('id', appointment_id,)
    .single()

  if (!appointment) {
    return Response.json({ error: 'Not found', }, { status: 404, },)
  }

  // Extract ML features
  const features = {
    patient_age: calculateAge(appointment.patient.birth_date,),
    days_until: Math.ceil(
      (new Date(appointment.scheduled_at,).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
    appointment_hour: new Date(appointment.scheduled_at,).getHours(),
    procedure_cost: getProcedureCost(appointment.procedure_type,),
  }

  const prediction = await predictNoShow(features,)

  return Response.json({
    data: {
      appointment_id,
      no_show_probability: prediction.probability,
      risk_level: prediction.probability > 0.7
        ? 'high'
        : prediction.probability > 0.4
        ? 'medium'
        : 'low',
      contributing_factors: prediction.factors,
    },
  },)
},)
```

---

## Performance & Compliance

### Health Check

```typescript
// GET /api/health
export async function GET() {
  const startTime = Date.now()

  // Test database
  const { error: dbError, } = await supabase
    .from('patients',).select('id',).limit(1,)

  // Test AI service
  const aiStart = Date.now()
  await openai('gpt-4o',).generateText({
    prompt: 'Health check',
    maxTokens: 1,
  },)
  const aiTime = Date.now() - aiStart

  return Response.json({
    status: dbError || aiTime > 5000 ? 'degraded' : 'healthy',
    response_time_ms: Date.now() - startTime,
    services: {
      database: { status: dbError ? 'unhealthy' : 'healthy', },
      ai_service: { status: aiTime > 5000 ? 'degraded' : 'healthy', },
    },
  },)
}
```

### Data Privacy

```typescript
// Privacy utilities
export class DataPrivacy {
  static encrypt(data: string,): string {
    return encrypt(data, process.env.ENCRYPTION_KEY!,)
  }

  static maskPII(data: string, type: 'email' | 'phone',): string {
    if (type === 'email') {
      const [user, domain,] = data.split('@',)
      return `${user[0]}***@${domain}`
    }
    return `***-***-${data.slice(-4,)}`
  }
}

// Consent middleware
export function withConsent(handler: Function,) {
  return async (req: Request,) => {
    const { patient_id, } = await req.json()

    if (patient_id) {
      const { data, } = await supabase
        .from('patients',)
        .select('consent_given',)
        .eq('id', patient_id,)
        .single()

      if (!data?.consent_given) {
        return Response.json({
          error: 'Patient consent required',
        }, { status: 403, },)
      }
    }

    return handler(req,)
  }
}

// Audit logging
export async function logAccess(
  user_id: string,
  resource: string,
  action: string,
  resource_id: string,
) {
  await supabase.from('audit_logs',).insert({
    user_id,
    resource,
    action,
    resource_id,
    timestamp: new Date().toISOString(),
  },)
}
```

### Error Handling

```typescript
export function handleAPIError(error: any,): Response {
  const requestId = crypto.randomUUID()

  console.error('API Error:', { requestId, error: error.message, },)

  if (error.name === 'ValidationError') {
    return Response.json({
      error: 'Validation failed',
      request_id: requestId,
    }, { status: 400, },)
  }

  return Response.json({
    error: 'Internal server error',
    request_id: requestId,
  }, { status: 500, },)
}
```

---

## Quick Reference

### Essential Endpoints

| Endpoint                     | Method   | Purpose             |
| ---------------------------- | -------- | ------------------- |
| `/api/patients`              | GET      | List patients       |
| `/api/patients`              | POST     | Create patient      |
| `/api/patients/[id]`         | GET      | Get patient         |
| `/api/appointments`          | GET/POST | Manage appointments |
| `/api/chat`                  | POST     | AI consultation     |
| `/api/ml/no-show-prediction` | POST     | Predict no-show     |
| `/api/health`                | GET      | System health       |

### Environment Setup

```bash
# Install with Bun
bun install

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key  
OPENAI_API_KEY=your_openai_key

# Development
bun dev

# Production
bun build
```

### Common Schemas

```typescript
// Request validation patterns
const PatientSchema = z.object({
  name: z.string().min(2,),
  email: z.string().email(),
  birth_date: z.string().date(),
  consent_given: z.boolean(),
},)

const AppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  procedure_type: z.enum(['consultation', 'botox_treatment',],),
},)
```

### Error Codes

| Code               | Status | Meaning             |
| ------------------ | ------ | ------------------- |
| `VALIDATION_ERROR` | 400    | Invalid input       |
| `UNAUTHORIZED`     | 401    | Missing token       |
| `CONSENT_REQUIRED` | 403    | Need consent        |
| `NOT_FOUND`        | 404    | Resource missing    |
| `CONFLICT`         | 409    | Scheduling conflict |

### Performance Tips

- Use **Bun** for 2-3x faster installs than npm
- Implement **streaming** for better UX
- **Type validation** with Zod schemas
- **Monitor** API latency and AI response times
- **Test coverage** ≥90% for business logic

---

## Troubleshooting

### Common Issues

```typescript
// AI service not responding
const health = await fetch('/api/health',)
console.log(await health.json(),)

// Database connection
const { error, } = await supabase.from('patients',).select('count',).limit(1,)
if (error) console.error('DB failed:', error,)
```

### Production Checklist

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Error tracking enabled
- [ ] API rate limiting configured

---

_NeonPro Advanced Aesthetic Clinics API - Built with Next.js 15, Bun, and Vercel AI SDK 5.0_
