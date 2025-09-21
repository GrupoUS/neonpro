import { describe, expect, it } from 'vitest';

// RED: no implementation yet; we assert that importing a guard throws until implemented

describe(_'AI Chat — error handling',_() => {
  it(_'placeholder error helper returns generic message',_async () => {
    const mod = await import('@/lib/ai-chat/errors');
    expect(typeof mod.toUserMessage).toBe('function');
    expect(mod.toUserMessage(new Error('x'))).toContain('unavailable');
  });
});
