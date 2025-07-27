import type { EdgeRouteHandler } from '../edge/types';
/**
 * Wraps Next.js middleware with Sentry error and performance instrumentation.
 *
 * @param middleware The middleware handler.
 * @returns a wrapped middleware handler.
 */
export declare function wrapMiddlewareWithSentry<H extends EdgeRouteHandler>(middleware: H): (...params: Parameters<H>) => Promise<ReturnType<H>>;
//# sourceMappingURL=wrapMiddlewareWithSentry.d.ts.map