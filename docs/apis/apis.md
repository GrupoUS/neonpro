---
title: "NeonPro API Implementation Guide"
last_updated: 2025-09-10
form: reference
tags: [api, implementation, neonpro, aesthetic-clinics, hono, tanstack-router]
related:
  - ./AGENTS.md
  - ./ai-sdk-v5.0.md
  - ../architecture/tech-stack.md
---

# NeonPro API Implementation Guide

Essential API patterns for NeonPro aesthetic clinic management platform.

**Tech Stack**: TanStack Router + Vite + Hono + Supabase + Vercel AI SDK v5.0
**Focus**: Brazilian aesthetic clinics with LGPD compliance

## Core API Endpoints

### **Authentication**

- `POST /api/auth/login` - CFM license validation
- `POST /api/auth/register` - LGPD compliant registration
- `POST /api/auth/refresh` - Token refresh

### **Patient Management**

- `GET /api/patients` - List with pagination
- `POST /api/patients` - Create with LGPD consent
- `GET /api/patients/:id` - Get details + history

### **Appointments**

- `GET /api/appointments` - List with filters
- `POST /api/appointments` - Schedule with conflict detection
- `PUT /api/appointments/:id` - Update appointment

### **Compliance**

- `GET /api/audit/logs` - LGPD audit trail
- `POST /api/compliance/consent` - Consent management

## Tech Stack & Performance

```yaml
Backend: Hono.dev + Bun + Supabase
Frontend: TanStack Router + Vite + React 19
AI: Vercel AI SDK 5.0 + OpenAI GPT-4o
Validation: Zod schemas
```

**Performance Targets:**

- Patient Record Access: <500ms
- Appointment Scheduling: <300ms
- API Availability: 99.9%

## Authentication Setup

```typescript
import { createClient } from '@supabase/supabase-js';
import { Hono } from 'hono';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// Auth middleware
const authMiddleware = async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return c.json({ error: 'Invalid token' }, 401);

  c.set('user', user);
  await next();
};

const app = new Hono();
app.use('/api/*', authMiddleware);
```

## Patient Management

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const CreatePatientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/),
  birth_date: z.string().date(),
  consent_given: z.boolean(), // LGPD compliance
});

// Create patient
app.post('/api/patients', zValidator('json', CreatePatientSchema), async c => {
  const data = c.req.valid('json');
  const user = c.get('user');

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({ ...data, id: crypto.randomUUID(), created_by: user.id })
    .select()
    .single();

  if (error) return c.json({ error: 'Failed to create patient' }, 500);
  return c.json({ data: patient });
});

// Get patient with history
app.get('/api/patients/:id', async c => {
  const { data, error } = await supabase
    .from('patients')
    .select('*, appointments(id, scheduled_at, procedure_type)')
    .eq('id', c.req.param('id'))
    .single();

  if (error) return c.json({ error: 'Patient not found' }, 404);
  return c.json({ data });
});
```

## Appointment Management

```typescript
const AppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  procedure_type: z.enum(['consultation', 'botox_treatment', 'dermal_filler']),
  duration_minutes: z.number().min(15).max(240).default(60),
});

// Schedule appointment with conflict detection
app.post('/api/appointments', zValidator('json', AppointmentSchema), async c => {
  const data = c.req.valid('json');

  // Check conflicts
  const endTime = new Date(
    new Date(data.scheduled_at).getTime() + data.duration_minutes * 60000,
  ).toISOString();

  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', data.professional_id)
    .eq('status', 'scheduled')
    .overlaps('time_slot', `[${data.scheduled_at}, ${endTime}]`);

  if (conflicts?.length) {
    return c.json({ error: 'Time slot unavailable' }, 409);
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({ ...data, id: crypto.randomUUID(), status: 'scheduled' })
    .select()
    .single();

  if (error) return c.json({ error: 'Failed to create appointment' }, 500);
  return c.json({ data: appointment });
});

// List appointments with pagination
app.get('/api/appointments', async c => {
  const page = parseInt(c.req.query('page') || '1');
  const per_page = Math.min(parseInt(c.req.query('per_page') || '20'), 50);
  const from = (page - 1) * per_page;

  const { data, count } = await supabase
    .from('appointments')
    .select('*, patient:patients(name), professional:professionals(name)', { count: 'exact' })
    .range(from, from + per_page - 1);

  return c.json({
    data,
    pagination: { page, per_page, total_count: count || 0 },
  });
});
```

## LGPD Compliance

```typescript
// Consent middleware
const withConsent = async (c, next) => {
  const { patient_id } = await c.req.json();

  if (patient_id) {
    const { data } = await supabase
      .from('patients')
      .select('consent_given')
      .eq('id', patient_id)
      .single();

    if (!data?.consent_given) {
      return c.json({ error: 'Patient consent required' }, 403);
    }
  }

  await next();
};

// Audit logging
const logAccess = async (user_id, resource, action, resource_id) => {
  await supabase.from('audit_logs').insert({
    user_id,
    resource,
    action,
    resource_id,
    timestamp: new Date().toISOString(),
  });
};
```

## Response Patterns

### **Success Response Format**

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationInfo;
    requestId: string;
    timestamp: string;
  };
}
```

### **Error Response Format**

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    healthcareContext?: {
      patientId?: string;
      appointmentId?: string;
      action?: string;
    };
  };
}
```

### **Environment Setup**

```bash
# Install with Bun (3-5x faster than npm)
bun install

# Environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ENCRYPTION_KEY=your_encryption_key

# Development with Hono
bun run dev

# Production build
bun run build
```

### Common Schemas

```typescript
// Request validation patterns
const PatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  birth_date: z.string().date(),
  consent_given: z.boolean(),
});

const AppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  procedure_type: z.enum(['consultation', 'botox_treatment']),
});
```

### Error Codes

| Code               | Status | Meaning             |
| ------------------ | ------ | ------------------- |
| `VALIDATION_ERROR` | 400    | Invalid input       |
| `UNAUTHORIZED`     | 401    | Missing token       |
| `CONSENT_REQUIRED` | 403    | Need consent        |
| `NOT_FOUND`        | 404    | Resource missing    |
| `CONFLICT`         | 409    | Scheduling conflict |

## Essential Endpoints

| Endpoint                  | Method   | Purpose                |
| ------------------------- | -------- | ---------------------- |
| `/api/patients`           | GET/POST | Patient management     |
| `/api/appointments`       | GET/POST | Appointment scheduling |
| `/api/auth/login`         | POST     | CFM authentication     |
| `/api/compliance/consent` | POST     | LGPD consent           |

## Quick Reference

**Performance Tips:**

- Use Bun for faster installs
- Validate with Zod schemas
- Monitor API latency
- Test coverage ≥90%

**Production Checklist:**

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Error tracking enabled

---

**Focus**: Essential API patterns for NeonPro aesthetic clinic platform
**Compliance**: LGPD, ANVISA, CFM requirements
**Target**: Backend developers using Hono + Supabase
**Version**: 4.0.0 - KISS optimized
