import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../tests/mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Polyfill fetch for Node.js environment
(async () => {
  if (!globalThis.fetch) {
    const { fetch, Headers, Request, Response } = await import('undici');
    Object.assign(globalThis, {
      fetch,
      Headers,
      Request,
      Response,
    });
  }
})();
