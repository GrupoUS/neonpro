var {
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const react = require('@sentry/react');
const devErrorSymbolicationEventProcessor = require('../common/devErrorSymbolicationEventProcessor.js');
const getVercelEnv = require('../common/getVercelEnv.js');
const nextNavigationErrorUtils = require('../common/nextNavigationErrorUtils.js');
const browserTracingIntegration = require('./browserTracingIntegration.js');
const clientNormalizationIntegration = require('./clientNormalizationIntegration.js');
const appRouterRoutingInstrumentation = require('./routing/appRouterRoutingInstrumentation.js');
const tunnelRoute = require('./tunnelRoute.js');
const wrapGetStaticPropsWithSentry = require('../common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js');
const wrapGetInitialPropsWithSentry = require('../common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js');
const wrapAppGetInitialPropsWithSentry = require('../common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js');
const wrapDocumentGetInitialPropsWithSentry = require('../common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js');
const wrapErrorGetInitialPropsWithSentry = require('../common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js');
const wrapGetServerSidePropsWithSentry = require('../common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js');
const wrapServerComponentWithSentry = require('../common/wrapServerComponentWithSentry.js');
const wrapRouteHandlerWithSentry = require('../common/wrapRouteHandlerWithSentry.js');
const wrapApiHandlerWithSentryVercelCrons = require('../common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js');
const wrapMiddlewareWithSentry = require('../common/wrapMiddlewareWithSentry.js');
const wrapPageComponentWithSentry = require('../common/pages-router-instrumentation/wrapPageComponentWithSentry.js');
const wrapGenerationFunctionWithSentry = require('../common/wrapGenerationFunctionWithSentry.js');
const withServerActionInstrumentation = require('../common/withServerActionInstrumentation.js');
const captureRequestError = require('../common/captureRequestError.js');
const _error = require('../common/pages-router-instrumentation/_error.js');

const globalWithInjectedValues = core.GLOBAL_OBJ

;

// Treeshakable guard to remove all code related to tracing

/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
function init(options) {
  const opts = {
    environment: getVercelEnv.getVercelEnv(true) || process.env.NODE_ENV,
    defaultIntegrations: getDefaultIntegrations(options),
    ...options,
  } ;

  tunnelRoute.applyTunnelRouteOption(opts);
  core.applySdkMetadata(opts, 'nextjs', ['nextjs', 'react']);

  const client = react.init(opts);

  const filterTransactions = event =>
    event.type === 'transaction' && event.transaction === '/404' ? null : event;
  filterTransactions.id = 'NextClient404Filter';
  core.addEventProcessor(filterTransactions);

  const filterIncompleteNavigationTransactions = event =>
    event.type === 'transaction' && event.transaction === appRouterRoutingInstrumentation.INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME
      ? null
      : event;
  filterIncompleteNavigationTransactions.id = 'IncompleteTransactionFilter';
  core.addEventProcessor(filterIncompleteNavigationTransactions);

  const filterNextRedirectError = (event, hint) =>
    nextNavigationErrorUtils.isRedirectNavigationError(_optionalChain([hint, 'optionalAccess', _ => _.originalException])) ? null : event;
  filterNextRedirectError.id = 'NextRedirectErrorFilter';
  core.addEventProcessor(filterNextRedirectError);

  if (process.env.NODE_ENV === 'development') {
    core.addEventProcessor(devErrorSymbolicationEventProcessor.devErrorSymbolicationEventProcessor);
  }

  return client;
}

function getDefaultIntegrations(options) {
  const customDefaultIntegrations = react.getDefaultIntegrations(options);
  // This evaluates to true unless __SENTRY_TRACING__ is text-replaced with "false",
  // in which case everything inside will get tree-shaken away
  if (typeof __SENTRY_TRACING__ === 'undefined' || __SENTRY_TRACING__) {
    customDefaultIntegrations.push(browserTracingIntegration.browserTracingIntegration());
  }

  // This value is injected at build time, based on the output directory specified in the build config. Though a default
  // is set there, we set it here as well, just in case something has gone wrong with the injection.
  const assetPrefixPath =
    process.env._sentryRewriteFramesAssetPrefixPath ||
    globalWithInjectedValues._sentryRewriteFramesAssetPrefixPath ||
    '';
  customDefaultIntegrations.push(clientNormalizationIntegration.nextjsClientStackFrameNormalizationIntegration({ assetPrefixPath }));

  return customDefaultIntegrations;
}

/**
 * Just a passthrough in case this is imported from the client.
 */
function withSentryConfig(exportedUserNextConfig) {
  return exportedUserNextConfig;
}

exports.browserTracingIntegration = browserTracingIntegration.browserTracingIntegration;
exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry.wrapGetStaticPropsWithSentry;
exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry.wrapGetInitialPropsWithSentry;
exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry.wrapAppGetInitialPropsWithSentry;
exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry.wrapDocumentGetInitialPropsWithSentry;
exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry.wrapErrorGetInitialPropsWithSentry;
exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry.wrapGetServerSidePropsWithSentry;
exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry.wrapServerComponentWithSentry;
exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry.wrapRouteHandlerWithSentry;
exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons.wrapApiHandlerWithSentryVercelCrons;
exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry.wrapMiddlewareWithSentry;
exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry.wrapPageComponentWithSentry;
exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry.wrapGenerationFunctionWithSentry;
exports.withServerActionInstrumentation = withServerActionInstrumentation.withServerActionInstrumentation;
exports.captureRequestError = captureRequestError.captureRequestError;
exports.experimental_captureRequestError = captureRequestError.experimental_captureRequestError;
exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
exports.init = init;
exports.withSentryConfig = withSentryConfig;
Object.prototype.hasOwnProperty.call(react, '__proto__') &&
  !Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
  Object.defineProperty(exports, '__proto__', {
    enumerable: true,
    value: react['__proto__']
  });

Object.keys(react).forEach(k => {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = react[k];
});
//# sourceMappingURL=index.js.map
