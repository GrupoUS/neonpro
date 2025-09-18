/**
 * tRPC Test Client Configuration
 * For testing with MSW (Mock Service Worker)
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCMsw } from 'msw-trpc';
import type { AppRouter } from '../../src/trpc';
import superjson from 'superjson';

// Create tRPC test client configuration
export const createTestTRPCClient = () => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
        headers: {
          'x-user-id': 'test-user-id',
          'x-clinic-id': 'test-clinic-id',
          'x-session-id': 'test-session-id',
        },
      }),
    ],
    transformer: superjson,
  });
};

// Create MSW tRPC mock with proper configuration
export const createTestTRPCMsw = () => {
  return createTRPCMsw<AppRouter>({
    baseUrl: 'http://localhost:3000/trpc',
    transformer: {
      input: superjson,
      output: superjson,
    },
  });
};