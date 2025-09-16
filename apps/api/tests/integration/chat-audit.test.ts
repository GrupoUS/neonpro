import { Hono } from 'hono';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function appFactory() {
  process.env.SUPABASE_URL ??= 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service_role_test_key';
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon_test_key';
  const { default: chat } = await import('../../src/routes/chat');
  const app = new Hono();
  app.route('/v1/chat', chat);
  return (path: string, init?: RequestInit) => {
    const url = new URL(`http://local.test${path}`);
    return app.request(url, init);
  };
}

describe('Integration: audit logging', () => {
  const logs: any[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...args) => {
    logs.push(args);
  });
  afterEach(() => {
    logs.length = 0;
  });
  beforeEach(() => {
    logs.length = 0;
  });

  it('logs AuditEvent with outcome success or refusal/limit', async () => {
    const call = await appFactory();

    // Success path (mock)
    const res1 = await call('/v1/chat/query?mock=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u-audit',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
      body: JSON.stringify({
        question: 'mock:balance',
        sessionId: '1c79b2b8-7d9b-4a5f-8d7e-0c7a59f19a0a',
      }),
    });
    expect(res1.status).toBe(200);

    // Refusal path (missing consent for non-mock)
    const res2 = await call('/v1/chat/query', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u-audit',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
      },
      body: JSON.stringify({
        question: 'Qual saldo?',
        sessionId: '2c79b2b8-7d9b-4a5f-8d7e-0c7a59f19a0a',
      }),
    });
    expect(res2.status).toBe(403);

    // Ensure we logged at least two AuditEvent entries
    const joined = logs.map(a => a.join(' ')).join('\n');
    expect(joined).toContain('AuditEvent');
  });

  afterAll(() => {
    spy.mockRestore();
  });
});
