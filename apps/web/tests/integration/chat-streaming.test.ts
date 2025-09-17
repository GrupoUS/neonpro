import { streamAestheticResponse } from '@/lib/ai/ai-chat-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// T009: Integration — Chat streaming start ≤2s

describe('Chat streaming SLO', () => {
  beforeEach(() => {
    // Force mock streaming path
    (globalThis as any).window = { location: { origin: 'http://local.test' }, __AI_MOCK__: true };
    // Mock fetch to avoid real network
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['ok']), { status: 200 })));
  });

  it('starts streaming within 2s', async () => {
    const start = performance.now();
    const stream = await streamAestheticResponse(
      [{ role: 'user', content: 'Olá' }],
      'client_1',
      'gpt-5-mini',
      'sess',
    );
    const reader = stream.getReader();

    const firstChunk = await reader.read();
    const firstByteMs = performance.now() - start;

    expect(firstChunk.done).toBe(false);
    expect(firstByteMs).toBeLessThanOrEqual(2000);
  });
});
