import { beforeEach, describe, expect, it, vi } from 'vitest';

// We will mock providers used internally by ai.ts by mocking generateText

describe('generateWithFailover', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('falls back to secondary model when primary throws', async () => {
    // Mock ai SDK generateText used by ai.ts
    vi.mock('ai', () => ({
      generateText: vi
        .fn()
        // First call (primary) throws
        .mockRejectedValueOnce(new Error('primary down'))
        // Second call (secondary) returns text
        .mockResolvedValueOnce({ text: 'fallback text' }),
      streamText: vi.fn(),
    }));

    const mod = await import('../ai');
    const result = await mod.generateWithFailover({
      model: mod.DEFAULT_PRIMARY as any,
      prompt: 'hello',
    });
    expect(result.text).toBe('fallback text');
    expect(result.headers.get('X-Chat-Model')).toMatch(
      /google:|anthropic:|openai:/,
    );
  });
});
