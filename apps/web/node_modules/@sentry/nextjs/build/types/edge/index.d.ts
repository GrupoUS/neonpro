import type { VercelEdgeOptions } from '@sentry/vercel-edge';
export * from '@sentry/vercel-edge';
export * from '../common';
export { captureUnderscoreErrorException } from '../common/pages-router-instrumentation/_error';
export { wrapApiHandlerWithSentry } from './wrapApiHandlerWithSentry';
export type EdgeOptions = VercelEdgeOptions;
/** Inits the Sentry NextJS SDK on the Edge Runtime. */
export declare function init(options?: VercelEdgeOptions): void;
/**
 * Just a passthrough in case this is imported from the client.
 */
export declare function withSentryConfig<T>(exportedUserNextConfig: T): T;
//# sourceMappingURL=index.d.ts.map