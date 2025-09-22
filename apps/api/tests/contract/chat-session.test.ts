import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// Contract: GET /api/v1/chat/session/:id
// Source: /specs/002-phase-1-ai/contracts/chat-session.openapi.json

async function api(path: string, init?: RequestInit) {
  process.env.SUPABASE_URL ??= 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service_role_test_key';
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon_test_key';
  const { default: chat } = await import('../../src/routes/chat')
  const app = new Hono(
  app.route('/v1/chat', chat
  const url = new URL(`http://local.test/v1${path}`
  return app.request(url, init
}

describe('Contract: GET /api/v1/chat/session/:id', () => {
  it('returns 200 and session skeleton in mock mode', async () => {
    const sessionId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const res = await api(`/chat/session/${sessionId}?mock=true`, {
      method: 'GET',
      headers: {
        'x-user-id': 'u-session',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
    }
    expect(res.status).toBe(200
    const json = await res.json(
    expect(json.id).toBe(sessionId
    expect(json.locale).toMatch(/pt-BR|en-US/
    expect(json._userId).toBe('u-session')
  }
}
