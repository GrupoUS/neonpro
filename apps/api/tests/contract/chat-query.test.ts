import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// Contract: POST /api/v1/chat/query (SSE)
// Source: /specs/002-phase-1-ai/contracts/chat-query.openapi.json

async function api(path: string, init?: RequestInit) {
  process.env.SUPABASE_URL ??= 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service_role_test_key';
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon_test_key';
  const { default: chat } = await import('../../src/routes/chat');
  const app = new Hono();
  app.route('/v1/chat', chat);
  const url = new URL(`http://local.test/v1${path}`);
  return app.request(url, init);
}

describe('Contract: POST /api/v1/chat/query', () => {
  it('returns SSE 200 with mock response when mock=true', async () => {
    const res = await api('/chat/query?mock=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u1',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
      body: JSON.stringify({
        question: 'mock:balance',
        sessionId: '6e9b5f24-7b4d-4db8-9d1b-0db6b7f5a0e0',
      }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toContain(
      'text/event-stream',
    );
    expect(res.headers.get('x-chat-started-at')).toBeTruthy();
  });

  it('returns 403 when consent missing (non-mock)', async () => {
    const res = await api('/chat/query', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u2',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
      },
      body: JSON.stringify({
        question: 'Qual saldo?',
        sessionId: 'ddc7b807-8a42-4f5f-bafc-0f10e2d5d6c2',
      }),
    });
    expect(res.status).toBe(403);
  });
});
