/**
 * Test Helper Functions
 *
 * Common helper functions for testing across the NeonPro project.
 */

import { expect } from 'vitest';

/**
 * Assert that a function throws an error with a specific message
 */
export function expectToThrow(fn: () => void, expectedMessage?: string): void {
  let thrownError: Error | null = null;

  try {
    fn();
  } catch (error) {
    thrownError = error instanceof Error ? error : new Error(String(error));
  }

  expect(thrownError).not.toBeNull();

  if (expectedMessage && thrownError) {
    expect(thrownError.message).toContain(expectedMessage);
  }
}

/**
 * Assert that an async function throws an error
 */
export async function expectToThrowAsync(
  fn: () => Promise<void>,
  expectedMessage?: string,
): Promise<void> {
  let thrownError: Error | null = null;

  try {
    await fn();
  } catch (error) {
    thrownError = error instanceof Error ? error : new Error(String(error));
  }

  expect(thrownError).not.toBeNull();

  if (expectedMessage && thrownError) {
    expect(thrownError.message).toContain(expectedMessage);
  }
}

/**
 * Create a spy function for testing
 */
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T,
): T & { calls: Parameters<T>[][]; results: ReturnType<T>[] } {
  const calls: Parameters<T>[][] = [];
  const results: ReturnType<T>[] = [];

  const spy = ((...args: Parameters<T>) => {
    calls.push(args);

    if (implementation) {
      const result = implementation(...args);
      results.push(result);
      return result;
    }

    return undefined;
  }) as T & { calls: Parameters<T>[][]; results: ReturnType<T>[] };

  spy.calls = calls;
  spy.results = results;

  return spy;
}

/**
 * Create a mock object with specified methods
 */
export function createMock<T extends Record<string, any>>(
  methods: Partial<T> = {},
): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      if (prop in methods) {
        return methods[prop as keyof T];
      }

      if (typeof prop === 'string') {
        return createSpy();
      }

      return undefined;
    },
  });
}

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a deferred promise for testing async scenarios
 */
export function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Test utility for checking object properties
 */
export function expectObjectToHaveProperties<T extends Record<string, any>>(
  obj: T,
  properties: (keyof T)[],
): void {
  properties.forEach(prop => {
    expect(obj).toHaveProperty(prop as string);
    expect(obj[prop]).toBeDefined();
  });
}

/**
 * Test utility for checking array contents
 */
export function expectArrayToContainObjects<T>(
  array: T[],
  expectedObjects: Partial<T>[],
): void {
  expect(array).toHaveLength(expectedObjects.length);

  expectedObjects.forEach((expectedObj, index) => {
    expect(array[index]).toMatchObject(expectedObj);
  });
}

/**
 * Test utility for date comparisons
 */
export function expectDateToBeRecent(date: Date, maxAgeMs: number = 5000): void {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  expect(diff).toBeLessThanOrEqual(maxAgeMs);
  expect(diff).toBeGreaterThanOrEqual(0);
}

/**
 * Test utility for checking function execution time
 */
export async function expectExecutionTime<T>(
  fn: () => Promise<T> | T,
  maxTimeMs: number,
): Promise<T> {
  const startTime = Date.now();
  const result = await fn();
  const executionTime = Date.now() - startTime;

  expect(executionTime).toBeLessThanOrEqual(maxTimeMs);

  return result;
}

/**
 * Test utility for checking email format
 */
export function expectValidEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(emailRegex.test(email)).toBe(true);
}

/**
 * Test utility for checking Brazilian CPF format
 */
export function expectValidCPF(cpf: string): void {
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  expect(cpfRegex.test(cpf)).toBe(true);
}

/**
 * Test utility for checking Brazilian CNPJ format
 */
export function expectValidCNPJ(cnpj: string): void {
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  expect(cnpjRegex.test(cnpj)).toBe(true);
}
