import type { EdgeRouteHandler } from './types';
/**
 * Wraps a Next.js edge route handler with Sentry error and performance instrumentation.
 */
export declare function wrapApiHandlerWithSentry<H extends EdgeRouteHandler>(handler: H, parameterizedRoute: string): (...params: Parameters<H>) => Promise<ReturnType<H>>;
//# sourceMappingURL=wrapApiHandlerWithSentry.d.ts.map