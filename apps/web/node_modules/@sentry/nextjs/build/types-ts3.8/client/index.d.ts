import { Client } from '@sentry/core';
import { BrowserOptions } from '@sentry/react';
export * from '@sentry/react';
export * from '../common';
export { captureUnderscoreErrorException } from '../common/pages-router-instrumentation/_error';
export { browserTracingIntegration } from './browserTracingIntegration';
/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
export declare function init(options: BrowserOptions): Client | undefined;
/**
 * Just a passthrough in case this is imported from the client.
 */
export declare function withSentryConfig<T>(exportedUserNextConfig: T): T;
//# sourceMappingURL=index.d.ts.map
