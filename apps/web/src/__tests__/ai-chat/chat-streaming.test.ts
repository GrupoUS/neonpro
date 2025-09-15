import { streamAestheticResponse } from '@/lib/ai/ai-chat-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mirror of T009 placed under src to be picked by curated include if needed

describe('Chat streaming SLO (src)', () => {
  beforeEach(() => {
    (globalThis as any).window = { location: { origin: 'http://local.test' }, __AI_MOCK__: true };
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
