import { startChatStream } from '@/lib/ai-chat/streaming';
import { describe, expect, it } from 'vitest';

// This test exercises mock mode iterator behavior without hitting network

describe('AI Chat — streaming util (mock mode)', () => {
  it(_'yields text chunks then done',async () => {
    // Force mock mode via env simulation is tricky in browser env; rely on default export behavior
    const itr = await startChatStream({ sessionId: 's1', text: 'Olá' });
    const received: string[] = [];
    for await (const ev of itr) {
      if (ev.type === 'text') received.push(ev.delta);
      if (ev.type === 'done') break;
    }
    expect(received.join('')).toContain('tratamentos');
  });
});
