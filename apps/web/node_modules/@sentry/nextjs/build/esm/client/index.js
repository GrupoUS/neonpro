import { _optionalChain } from '@sentry/core';
import { applySdkMetadata, addEventProcessor, GLOBAL_OBJ } from '@sentry/core';
import { init as init$1, getDefaultIntegrations as getDefaultIntegrations$1 } from '@sentry/react';
export * from '@sentry/react';
import { devErrorSymbolicationEventProcessor } from '../common/devErrorSymbolicationEventProcessor.js';
import { getVercelEnv } from '../common/getVercelEnv.js';
import { isRedirectNavigationError } from '../common/nextNavigationErrorUtils.js';
import { browserTracingIntegration } from './browserTracingIntegration.js';
import { nextjsClientStackFrameNormalizationIntegration } from './clientNormalizationIntegration.js';
import { INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME } from './routing/appRouterRoutingInstrumentation.js';
import { applyTunnelRouteOption } from './tunnelRoute.js';
export { wrapGetStaticPropsWithSentry } from '../common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js';
export { wrapGetInitialPropsWithSentry } from '../common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js';
export { wrapAppGetInitialPropsWithSentry } from '../common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js';
export { wrapDocumentGetInitialPropsWithSentry } from '../common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js';
export { wrapErrorGetInitialPropsWithSentry } from '../common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js';
export { wrapGetServerSidePropsWithSentry } from '../common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js';
export { wrapServerComponentWithSentry } from '../common/wrapServerComponentWithSentry.js';
export { wrapRouteHandlerWithSentry } from '../common/wrapRouteHandlerWithSentry.js';
export { wrapApiHandlerWithSentryVercelCrons } from '../common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js';
export { wrapMiddlewareWithSentry } from '../common/wrapMiddlewareWithSentry.js';
export { wrapPageComponentWithSentry } from '../common/pages-router-instrumentation/wrapPageComponentWithSentry.js';
export { wrapGenerationFunctionWithSentry } from '../common/wrapGenerationFunctionWithSentry.js';
export { withServerActionInstrumentation } from '../common/withServerActionInstrumentation.js';
export { captureRequestError, experimental_captureRequestError } from '../common/captureRequestError.js';
export { captureUnderscoreErrorException } from '../common/pages-router-instrumentation/_error.js';

const globalWithInjectedValues = GLOBAL_OBJ

;

// Treeshakable guard to remove all code related to tracing

/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
function init(options) {
  const opts = {
    environment: getVercelEnv(true) || process.env.NODE_ENV,
    defaultIntegrations: getDefaultIntegrations(options),
    ...options,
  } ;

  applyTunnelRouteOption(opts);
  applySdkMetadata(opts, 'nextjs', ['nextjs', 'react']);

  const client = init$1(opts);

  const filterTransactions = event =>
    event.type === 'transaction' && event.transaction === '/404' ? null : event;
  filterTransactions.id = 'NextClient404Filter';
  addEventProcessor(filterTransactions);

  const filterIncompleteNavigationTransactions = event =>
    event.type === 'transaction' && event.transaction === INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME
      ? null
      : event;
  filterIncompleteNavigationTransactions.id = 'IncompleteTransactionFilter';
  addEventProcessor(filterIncompleteNavigationTransactions);

  const filterNextRedirectError = (event, hint) =>
    isRedirectNavigationError(_optionalChain([hint, 'optionalAccess', _ => _.originalException])) ? null : event;
  filterNextRedirectError.id = 'NextRedirectErrorFilter';
  addEventProcessor(filterNextRedirectError);

  if (process.env.NODE_ENV === 'development') {
    addEventProcessor(devErrorSymbolicationEventProcessor);
  }

  return client;
}

function getDefaultIntegrations(options) {
  const customDefaultIntegrations = getDefaultIntegrations$1(options);
  // This evaluates to true unless __SENTRY_TRACING__ is text-replaced with "false",
  // in which case everything inside will get tree-shaken away
  if (typeof __SENTRY_TRACING__ === 'undefined' || __SENTRY_TRACING__) {
    customDefaultIntegrations.push(browserTracingIntegration());
  }

  // This value is injected at build time, based on the output directory specified in the build config. Though a default
  // is set there, we set it here as well, just in case something has gone wrong with the injection.
  const assetPrefixPath =
    process.env._sentryRewriteFramesAssetPrefixPath ||
    globalWithInjectedValues._sentryRewriteFramesAssetPrefixPath ||
    '';
  customDefaultIntegrations.push(nextjsClientStackFrameNormalizationIntegration({ assetPrefixPath }));

  return customDefaultIntegrations;
}

/**
 * Just a passthrough in case this is imported from the client.
 */
function withSentryConfig(exportedUserNextConfig) {
  return exportedUserNextConfig;
}

export { browserTracingIntegration, init, withSentryConfig };
//# sourceMappingURL=index.js.map
