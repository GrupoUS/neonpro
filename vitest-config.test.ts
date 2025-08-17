import { describe, it, expect } from 'vitest';

describe('Vitest Configuration Test', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });

  it('should have access to global vi mocks', () => {
    expect(typeof vi).toBe('object');
    expect(typeof vi.fn).toBe('function');
  });

  it('should have DOM environment available', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});