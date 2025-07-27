import type { VercelCronsConfig } from '../types';
/**
 * Wraps a function with Sentry crons instrumentation by automatically sending check-ins for the given Vercel crons config.
 */
export declare function wrapApiHandlerWithSentryVercelCrons<F extends (...args: any[]) => any>(handler: F, vercelCronsConfig: VercelCronsConfig): F;
//# sourceMappingURL=wrapApiHandlerWithSentryVercelCrons.d.ts.map