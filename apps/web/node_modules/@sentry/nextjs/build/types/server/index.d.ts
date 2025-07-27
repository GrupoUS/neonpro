/// <reference types="react" />
import type { NodeClient, NodeOptions } from '@sentry/node';
export * from '@sentry/node';
export { captureUnderscoreErrorException } from '../common/pages-router-instrumentation/_error';
/**
 * A passthrough error boundary for the server that doesn't depend on any react. Error boundaries don't catch SSR errors
 * so they should simply be a passthrough.
 */
export declare const ErrorBoundary: (props: React.PropsWithChildren<unknown>) => React.ReactNode;
/**
 * A passthrough redux enhancer for the server that doesn't depend on anything from the `@sentry/react` package.
 */
export declare function createReduxEnhancer(): (createStore: unknown) => unknown;
/**
 * A passthrough error boundary wrapper for the server that doesn't depend on any react. Error boundaries don't catch
 * SSR errors so they should simply be a passthrough.
 */
export declare function withErrorBoundary<P extends Record<string, any>>(WrappedComponent: React.ComponentType<P>): React.FC<P>;
/**
 * Just a passthrough since we're on the server and showing the report dialog on the server doesn't make any sense.
 */
export declare function showReportDialog(): void;
/** Inits the Sentry NextJS SDK on node. */
export declare function init(options: NodeOptions): NodeClient | undefined;
export * from '../common';
export { wrapApiHandlerWithSentry } from '../common/pages-router-instrumentation/wrapApiHandlerWithSentry';
//# sourceMappingURL=index.d.ts.map