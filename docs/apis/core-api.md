---
title: "Core API Reference"
last_updated: 2025-09-24
form: reference
tags: [api, endpoints, core, essential]
related:
  - ./AGENTS.md
  - ./ai-agent-api.md
---

# Core API Reference — Essential Endpoints

## Tech Stack

- **Backend**: Hono + Bun + Supabase
- **Frontend**: TanStack Router + React 19
- **Auth**: Supabase Auth with JWT
- **Validation**: Zod schemas

## Essential Endpoints

### Authentication

```bash
POST /api/auth/login      # Professional login
POST /api/auth/refresh    # Token refresh
```

### Client Management

```bash
GET    /api/clients       # List clients
POST   /api/clients       # Create client
GET    /api/clients/:id   # Get client details
PUT    /api/clients/:id   # Update client
```

### Appointments

```bash
GET    /api/appointments       # List appointments
POST   /api/appointments       # Schedule appointment
PUT    /api/appointments/:id   # Update appointment
DELETE /api/appointments/:id   # Cancel appointment
```

### Treatments

```bash
GET    /api/treatments     # Available treatments
GET    /api/treatments/:id # Treatment details
```

## Authentication Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// Auth middleware
const auth = async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', user);
  await next();
};
```

## Example Implementation

```typescript
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Create client
app.post(
  '/api/clients',
  zValidator(
    'json',
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string(),
      consent_given: z.boolean(), // LGPD
    }),
  ),
  async c => {
    const data = c.req.valid('json');
    const { data: client, error } = await supabase
      .from('clients')
      .insert(data)
      .select()
      .single();

    if (error) return c.json({ error }, 500);
    return c.json({ data: client });
  },
);

// Schedule appointment
app.post(
  '/api/appointments',
  zValidator(
    'json',
    z.object({
      client_id: z.string().uuid(),
      scheduled_at: z.string().datetime(),
      treatment_type: z.string(),
    }),
  ),
  async c => {
    const data = c.req.valid('json');
    // Implementation here
    return c.json({ data: appointment });
  },
);
```

## Performance Targets

- **Client Access**: <500ms
- **Appointment Scheduling**: <300ms
- **API Availability**: >99.9%

## LGPD Compliance

- All client data requires explicit consent
- Audit logging enabled
- Data encryption at rest and in transit
- Right to erasure implemented

## See Also

- [API Control Hub](./AGENTS.md)
- [AI Agent API](./ai-agent-api.md)
