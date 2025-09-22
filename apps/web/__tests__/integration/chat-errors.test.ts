import { streamAestheticResponse } from '@/lib/ai/ai-chat-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// T012: Integration — Error handling (provider/rate limit/timeout)

describe('Chat error handling', () => {
  beforeEach(() => {
    (globalThis as any).window = { location: { origin: 'http://local.test' } };
  }

  it('maps provider HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 500 })),
    
    await expect(
      streamAestheticResponse([{ _role: 'user', content: 'oi' }]),
<<<<<<< HEAD
    ).rejects.toThrow(/HTTP 500/
  }
=======
    ).rejects.toThrow(/HTTP 500/);
  });
>>>>>>> origin/main

  it('maps rate limit (429)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 429 })),
    
    await expect(
      streamAestheticResponse([{ _role: 'user', content: 'oi' }]),
<<<<<<< HEAD
    ).rejects.toThrow(/HTTP 429/
  }
=======
    ).rejects.toThrow(/HTTP 429/);
  });
>>>>>>> origin/main

  it('maps timeout when body is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 200 })),
    
    await expect(
      streamAestheticResponse([{ _role: 'user', content: 'oi' }]),
<<<<<<< HEAD
    ).rejects.toThrow(/missing body/
  }
}
=======
    ).rejects.toThrow(/missing body/);
  });
});
>>>>>>> origin/main
