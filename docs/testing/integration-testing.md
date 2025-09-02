# Integration Testing Guide (NeonPro Healthcare)

> Purpose: Strategy and patterns for integration tests across APIs, database, and external services in the NeonPro monorepo.

## Principles

- Validate contracts between modules/packages and external systems
- Use real infrastructure where safe (local DB), mock third‑party/network for determinism
- Seed/teardown data per suite; keep tests independent/idempotent
- Security & compliance first: auth, RLS (Supabase), data privacy (LGPD)

## Stack Overview

- Test Runner: Vitest (node + browser environments)
- API: Next.js Route Handlers or Hono; supertest/fetch for HTTP
- Database: Supabase Postgres (test schema or ephemeral DB)
- Realtime: Supabase Realtime (optional in CI stage)
- AI: Mock providers or local adapters for deterministic outputs

## Project Structure (example)

```
packages/
  api/               # services, handlers
  db/                # prisma/sql, migrations, seed
  ai/                # ai service adapters
  auth/              # auth utils/middleware
  domain/            # business logic

tests/integration/
  api/
  database/
  auth/
  ai/
  realtime/
```

## Supabase Integration Patterns

```ts
// tests/integration/database/patient.create.spec.ts
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, serviceRole, { auth: { persistSession: false } })

beforeAll(async () => {
  // migrate/seed if needed
})

afterAll(async () => {
  // cleanup
})

describe('patients table', () => {
  it('inserts patient with RLS bypass via service role (setup)', async () => {
    const { data, error } = await supabase.from('patients').insert({
      name: 'Maria Souza',
      cpf: '123.456.789-00',
      birth_date: '1990-01-10',
    }).select('*').single()
    expect(error).toBeNull()
    expect(data?.name).toBe('Maria Souza')
  })
})
```

## Authentication & RLS Flow

```ts
// tests/integration/auth/login.spec.ts
import { describe, expect, it } from 'vitest'

async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res
}

describe('auth', () => {
  it('returns JWT on valid credentials', async () => {
    const res = await login('pro@clinic.com', 'password123')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBeTruthy()
  })
})
```

## API Endpoint Contracts

```ts
// tests/integration/api/patients.get.spec.ts
import { describe, expect, it } from 'vitest'

async function getPatients(token: string) {
  const res = await fetch('http://localhost:3000/api/patients', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res
}

describe('GET /api/patients', () => {
  it('enforces auth and returns list', async () => {
    const res = await getPatients('valid.jwt.token')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})
```

## Realtime Subscriptions (optional)

```ts
// tests/integration/realtime/appointments.realtime.spec.ts
import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

describe('appointments realtime', () => {
  it('receives notifications on new appointments', async () => {
    const events: any[] = []
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, payload => {
        events.push(payload)
      })
      .subscribe()

    // ...insert appointment via API or direct DB

    await new Promise(r => setTimeout(r, 1000))
    expect(events.length).toBeGreaterThan(0)
    await supabase.removeChannel(channel)
  })
})
```

## AI Service Integrations

```ts
// tests/integration/ai/chat.spec.ts
import { describe, expect, it, vi } from 'vitest'
import { chat } from '@/packages/ai/chat'

describe('AI chat integration', () => {
  it('assembles prompt with patient safety constraints', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      messages: [{ role: 'assistant', content: 'Instruções seguras personalizadas.' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } }))

    const result = await chat([{ role: 'user', content: 'Cuidados pós-procedimento' }])
    expect(result.content).toContain('seguras')
  })
})
```

## Cross-Package Dependencies (Monorepo)

```ts
// tests/integration/monorepo/deps.spec.ts
import { describe, expect, it } from 'vitest'
import { calculateRisk } from '@neonpro/domain/risk'
import { getPatient } from '@neonpro/core-services/patients'

describe('cross-package', () => {
  it('calculates risk using domain model and service layer', async () => {
    const patient = await getPatient('patient-id')
    const risk = calculateRisk(patient)
    expect(risk.score).toBeGreaterThanOrEqual(0)
  })
})
```

## Compliance & Privacy

- Validate RLS and authorization on all sensitive endpoints
- Mask/omit PII in logs and snapshots
- Enforce consent flows where applicable (LGPD)

