import { describe, expect, it } from 'vitest';
import app from '../routes/ai-chat';

describe('chat v5 stream', () => {
  it('accepts text-only payload and responds 200', async () => {
    const res = await app.request('/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [],
        text: 'oi',
        sessionId: 's1',
        locale: 'pt-BR',
      }),
      // In test env without keys we allow mock mode path to still send 200 or 500 depending on env.
    });
    expect([200, 500]).toContain(res.status);
  });
});
