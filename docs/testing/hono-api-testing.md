# Hono.dev API Testing Guide (NeonPro)

Purpose: Provide patterns for testing Hono route handlers, middleware, and validation in `apps/api`.

## Stack & Locations

- API framework: Hono.dev (edge/server)
- Tests: `apps/api/src/__tests__/` (or `tests/integration/api/` if centralized)
- Runner: Vitest; HTTP via `fetch` or `@hono/zod-validator` + `hono/testing`

## Route Handler Testing

```ts
// apps/api/src/__tests__/patients.get.test.ts
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app'; // your Hono app

it('GET /patients returns 200 with list', async () => {
  const res = await app.request('/patients', { method: 'GET' });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
});
```

## Middleware & Auth

- Test auth middleware with valid/invalid tokens
- Validate error shapes and status codes

```ts
// apps/api/src/__tests__/auth.middleware.test.ts
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';

it('rejects requests without Authorization header', async () => {
  const res = await app.request('/patients');
  expect(res.status).toBe(401);
});
```

## Validation with Zod

- Use `@hono/zod-validator` to enforce request/response schemas
- Assert 400 on invalid payloads; assert type-safe parsing on valid ones

## Database & RLS

- Prefer service-role for setup/seed
- For user flows, authenticate and assert RLS enforcement (see `./supabase-rls-testing.md`)

## Tips

- Keep handlers pure; inject deps for easier testing
- Mock externals (email, AI) for determinism
- Use small, focused tests per route
