import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function buildApp() {
  // Minimal env defaults used by tests
  process.env.SUPABASE_URL ??= 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service_role_test_key';
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon_test_key';

  const { default: chat } = await import('../../src/routes/chat');
  const app = new Hono();
  app.route('/v1/chat', chat);
  return app;
}

describe('Contract: POST /api/v1/chat/explanation (real mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 403 without consent when not in mock mode', async () => {
    const app = await buildApp();
    const res = await app.request('http://local.test/v1/chat/explanation', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-role': 'CLINICAL_STAFF',
        // deliberately no x-consent header
      },
      body: JSON.stringify({ text: 'texto de teste', locale: 'pt-BR' }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toMatch(/consentimento|consent/i);
  });

  it('redacts provider output before returning to client', async () => {
    const hoisted = vi.hoisted(() => ({
      generate: vi.fn(async () => ({
        text: 'CPF 123.456.789-10, email user@example.com, tel 11 99999-8888',
        headers: new Headers({ 'X-Chat-Model': 'openai:gpt-5-mini' }),
      })),
    }));

    vi.mock('../../src/config/ai', () => ({
      DEFAULT_PRIMARY: 'gpt-5-mini',
      generateWithFailover: hoisted.generate,
    }));

    const app = await buildApp();
    const res = await app.request('http://local.test/v1/chat/explanation', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u1',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
      body: JSON.stringify({
        text: 'Paciente com CPF 123.456.789-10; email user@example.com; tel 11 99999-8888',
        locale: 'pt-BR',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json.explanation).toBe('string');
    // Ensure sensitive patterns are not present
    expect(json.explanation).not.toContain('123.456.789-10');
    expect(json.explanation).not.toContain('user@example.com');
    expect(json.explanation).not.toMatch(/\b\d{2} \d{5}-\d{4}\b/);
    expect(json.traceId).toMatch(/[0-9a-f-]{36}/);
    // Ensure provider function was called
    expect(hoisted.generate).toHaveBeenCalledTimes(1);
  });
});
