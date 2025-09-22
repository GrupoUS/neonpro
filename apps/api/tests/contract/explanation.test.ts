import { describe, expect, it } from 'vitest';

// GREEN (1/5): Minimal contract for Explanation Summary API
// Source: /specs/001-ai-chat-with/contracts/explanation.md

import { Hono } from 'hono';

// Minimal in-process app mounting only the route under test
async function api(path: string, init?: RequestInit) {
  const { default: explanation } = await import(
    '../../src/routes/ai-explanation')
  
  const app = new Hono(
  app.route('/v1/ai-explain', explanation
  const url = new URL(`http://local.test/v1${path}`
  const res = await app.request(url, init
  return res;
}

describe('Contract: Explanation Summary', () => {
  it('returns concise, LGPD-safe explanation with trace id', async () => {
    const res = await api('/ai-explain/summary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: 'Tratamento estético facial focado em limpeza de pele profunda e rejuvenescimento.',
        audience: 'patient',
        locale: 'pt-BR',
      }),
    }
    expect(res.ok).toBe(true);
    const json = await res.json(
    expect(json.summary).toBeTypeOf('string')
    expect(json.summary.length).toBeGreaterThan(10
    expect(json.wordCount).toBeGreaterThan(3
    expect(json.traceId).toMatch(/[0-9a-f-]{36}/
  }
}
