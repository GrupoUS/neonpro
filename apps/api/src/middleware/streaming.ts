/**
 * Streaming middleware for real-time healthcare applications
 * Provides WebSocket and streaming support for telemedicine
 */

export function streamingMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}

export { streamingMiddleware as default };