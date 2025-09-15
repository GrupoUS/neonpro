import { streamAestheticResponse } from '@/lib/ai/ai-chat-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Chat error handling (src)', () => {
  beforeEach(() => {
    (globalThis as any).window = { location: { origin: 'http://local.test' } };
  });

  it('maps provider HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));
    await expect(streamAestheticResponse([{ role: 'user', content: 'oi' }])).rejects.toThrow(
      /HTTP 500/,
    );
  });

  it('maps rate limit (429)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 429 })));
    await expect(streamAestheticResponse([{ role: 'user', content: 'oi' }])).rejects.toThrow(
      /HTTP 429/,
    );
  });

  it('maps timeout when body is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 200 })));
    await expect(streamAestheticResponse([{ role: 'user', content: 'oi' }])).rejects.toThrow(
      /missing body/,
    );
  });
});
