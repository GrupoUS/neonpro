import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

// Integration: Audit logging for chat and tools

describe('Integration: audit events', () => {
  it('emits audit logs for chat', async () => {
    const { default: chat } = await import('../../src/routes/ai-chat')
    const { auditMiddleware } = await import('../../src/middleware/audit')
    const app = new Hono(
    // spy on console
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}

    app.use('/v1/ai-chat/*', auditMiddleware('ai.chat')
    app.route('/v1/ai-chat', chat

    const res = await app.request(
      'http://local.test/v1/ai-chat/stream?mock=true',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          text: 'oi',
          locale: 'pt-BR',
          sessionId: 'sess',
        }),
      },
    
    expect(res.ok).toBe(true);
    expect(spy).toHaveBeenCalled(
    const calls = spy.mock.calls.map(args => args.join(' ')
    expect(calls.find(s => s.includes('AUDIT_EVENT'))).toBeTruthy(
    spy.mockRestore(
  }

  it('emits audit logs for finance tools', async () => {
    const { default: finance } = await import('../../src/routes/tools-finance')
    const { auditMiddleware } = await import('../../src/middleware/audit')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}
    const app = new Hono(
    app.use('/v1/tools/finance/*', auditMiddleware('tools.finance')
    app.route('/v1/tools/finance', finance

    const res = await app.request(
      'http://local.test/v1/tools/finance/overdue?clinicId=c1',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-clinic-id': 'c1' },
        body: JSON.stringify({ clinicId: 'c1' }),
      },
    
    expect(res.ok).toBe(true);
    expect(spy).toHaveBeenCalled(
    spy.mockRestore(
  }
}
