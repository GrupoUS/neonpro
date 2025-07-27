export { init, withSentryConfig } from './client/index.js';
export { captureUnderscoreErrorException } from './common/pages-router-instrumentation/_error.js';
export { browserTracingIntegration } from './client/browserTracingIntegration.js';
export { wrapGetStaticPropsWithSentry } from './common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js';
export { wrapGetInitialPropsWithSentry } from './common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js';
export { wrapAppGetInitialPropsWithSentry } from './common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js';
export { wrapDocumentGetInitialPropsWithSentry } from './common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js';
export { wrapErrorGetInitialPropsWithSentry } from './common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js';
export { wrapGetServerSidePropsWithSentry } from './common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js';
export { wrapServerComponentWithSentry } from './common/wrapServerComponentWithSentry.js';
export { wrapRouteHandlerWithSentry } from './common/wrapRouteHandlerWithSentry.js';
export { wrapApiHandlerWithSentryVercelCrons } from './common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js';
export { wrapMiddlewareWithSentry } from './common/wrapMiddlewareWithSentry.js';
export { wrapPageComponentWithSentry } from './common/pages-router-instrumentation/wrapPageComponentWithSentry.js';
export { wrapGenerationFunctionWithSentry } from './common/wrapGenerationFunctionWithSentry.js';
export { withServerActionInstrumentation } from './common/withServerActionInstrumentation.js';
export { captureRequestError, experimental_captureRequestError } from './common/captureRequestError.js';
export * from '@sentry/react';
//# sourceMappingURL=index.client.js.map
