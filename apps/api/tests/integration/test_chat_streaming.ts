import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

async function api(path: string, init?: RequestInit) {
  process.env.SUPABASE_URL ??= 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service_role_test_key';
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon_test_key';
  const { default: chat } = await import('../../src/routes/chat');
  const app = new Hono();
  app.route('/v1/chat', chat);
  const url = new URL(`http://local.test${path}`);
  return app.request(url, init);
}

describe('Integration: SSE streaming', () => {
  it('emits text delta frames and final done event', async () => {
    const res = await api('/v1/chat/query?mock=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u-stream',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
      body: JSON.stringify({
        question: 'mock:balance',
        sessionId: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
      }),
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('data:');
    expect(text).toContain('"type":"text"');
    expect(text).toContain('"type":"done"');
    expect(res.headers.get('content-type') || '').toContain('text/event-stream');
    expect(res.headers.get('x-chat-started-at')).toBeTruthy();
  });
});
