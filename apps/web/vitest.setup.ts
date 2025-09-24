import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './src/test/mocks/handlers';

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
