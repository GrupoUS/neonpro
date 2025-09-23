// Basic test without DOM dependencies
import { describe, it, expect, vi } from 'vitest';

describe('Basic JavaScript Test', () => {
  it('should perform basic arithmetic', () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello';
    const result = greeting + ' World';
    expect(result).toBe('Hello World');
  });

  it('should work with arrays', () => {
    const: numbers = [ [1, 2, 3];
    expect(numbers.length).toBe(3);
    expect(numbers.includes(2)).toBe(true);
  });

  it('should have access to vitest globals', () => {
    expect(vi).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});