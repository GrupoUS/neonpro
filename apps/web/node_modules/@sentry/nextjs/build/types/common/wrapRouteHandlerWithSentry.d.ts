import type { RouteHandlerContext } from './types';
/**
 * Wraps a Next.js App Router Route handler with Sentry error and performance instrumentation.
 *
 * NOTICE: This wrapper is for App Router API routes. If you are looking to wrap Pages Router API routes use `wrapApiHandlerWithSentry` instead.
 */
export declare function wrapRouteHandlerWithSentry<F extends (...args: any[]) => any>(routeHandler: F, context: RouteHandlerContext): (...args: Parameters<F>) => ReturnType<F> extends Promise<unknown> ? ReturnType<F> : Promise<ReturnType<F>>;
//# sourceMappingURL=wrapRouteHandlerWithSentry.d.ts.map