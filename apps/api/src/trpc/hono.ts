import { Hono } from 'hono';
import { router } from './trpc';

/**
 * TRPC Hono adapter for integration tests
 * This is a simplified adapter for testing purposes
 */
export function createTRPCHono() {
  const honoApp = new Hono();

  return {
    honoApp,
    router: (path: string, routes: any) => {
      honoApp.route(path, routes);
    },
  };
}
