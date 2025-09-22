import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// Contract for Chat API streaming
// Source: /home/vibecode/neonpro/specs/001-ai-chat-with/contracts/chat.md

async function api(path: string, init?: RequestInit) {
  const { default: chat } = await import('../../src/routes/ai-chat')
  const app = new Hono(
  app.route('/v1/ai-chat', chat
  const url = new URL(`http://local.test/v1${path}`
  return app.request(url, init
}

describe('Contract: Chat API streaming', () => {
  it('streams text with metadata headers', async () => {
    const res = await api('/ai-chat/stream?mock=true', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [],
        text: 'Olá, quais tratamentos faciais vocês oferecem?',
        locale: 'pt-BR',
        sessionId: 'sess_test_001',
      }),
    }

    expect(res.ok).toBe(true);

    // Minimal metadata contract using headers for now
    expect(res.headers.get('X-Chat-Started-At')).toBeTruthy(
    expect(res.headers.get('X-Chat-Model')).toBeTruthy(
    expect(res.headers.get('X-Data-Freshness')).toBe('as-of-now')

    const text = await res.text(
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(0
  }
}
