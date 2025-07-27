var {
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const api = require('@opentelemetry/api');
const semanticConventions = require('@opentelemetry/semantic-conventions');
const core = require('@sentry/core');
const node = require('@sentry/node');
const opentelemetry = require('@sentry/opentelemetry');
const debugBuild = require('../common/debug-build.js');
const devErrorSymbolicationEventProcessor = require('../common/devErrorSymbolicationEventProcessor.js');
const getVercelEnv = require('../common/getVercelEnv.js');
const spanAttributesWithLogicAttached = require('../common/span-attributes-with-logic-attached.js');
const isBuild = require('../common/utils/isBuild.js');
const distDirRewriteFramesIntegration = require('./distDirRewriteFramesIntegration.js');
const _error = require('../common/pages-router-instrumentation/_error.js');
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
const wrapApiHandlerWithSentry = require('../common/pages-router-instrumentation/wrapApiHandlerWithSentry.js');

const globalWithInjectedValues = core.GLOBAL_OBJ

;

/**
 * A passthrough error boundary for the server that doesn't depend on any react. Error boundaries don't catch SSR errors
 * so they should simply be a passthrough.
 */
const ErrorBoundary = (props) => {
  if (!props.children) {
    return null;
  }

  if (typeof props.children === 'function') {
    return (props.children )();
  }

  // since Next.js >= 10 requires React ^16.6.0 we are allowed to return children like this here
  return props.children ;
};

/**
 * A passthrough redux enhancer for the server that doesn't depend on anything from the `@sentry/react` package.
 */
function createReduxEnhancer() {
  return (createStore) => createStore;
}

/**
 * A passthrough error boundary wrapper for the server that doesn't depend on any react. Error boundaries don't catch
 * SSR errors so they should simply be a passthrough.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withErrorBoundary(
  WrappedComponent,
) {
  return WrappedComponent ;
}

/**
 * Just a passthrough since we're on the server and showing the report dialog on the server doesn't make any sense.
 */
function showReportDialog() {
  return;
}

/** Inits the Sentry NextJS SDK on node. */
function init(options) {
  if (isBuild.isBuild()) {
    return;
  }

  const customDefaultIntegrations = node.getDefaultIntegrations(options)
    .filter(integration => integration.name !== 'Http')
    .concat(
      // We are using the HTTP integration without instrumenting incoming HTTP requests because Next.js does that by itself.
      node.httpIntegration({
        disableIncomingRequestSpans: true,
      }),
    );

  // Turn off Next.js' own fetch instrumentation
  // https://github.com/lforst/nextjs-fork/blob/1994fd186defda77ad971c36dc3163db263c993f/packages/next/src/server/lib/patch-fetch.ts#L245
  process.env.NEXT_OTEL_FETCH_DISABLED = '1';

  // This value is injected at build time, based on the output directory specified in the build config. Though a default
  // is set there, we set it here as well, just in case something has gone wrong with the injection.
  const distDirName = process.env._sentryRewriteFramesDistDir || globalWithInjectedValues._sentryRewriteFramesDistDir;
  if (distDirName) {
    customDefaultIntegrations.push(distDirRewriteFramesIntegration.distDirRewriteFramesIntegration({ distDirName }));
  }

  const opts = {
    environment: process.env.SENTRY_ENVIRONMENT || getVercelEnv.getVercelEnv(false) || process.env.NODE_ENV,
    defaultIntegrations: customDefaultIntegrations,
    ...options,
    // Right now we only capture frontend sessions for Next.js
    autoSessionTracking: false,
  };

  if (debugBuild.DEBUG_BUILD && opts.debug) {
    core.logger.enable();
  }

  debugBuild.DEBUG_BUILD && core.logger.log('Initializing SDK...');

  if (sdkAlreadyInitialized()) {
    debugBuild.DEBUG_BUILD && core.logger.log('SDK already initialized');
    return;
  }

  core.applySdkMetadata(opts, 'nextjs', ['nextjs', 'node']);

  const client = node.init(opts);
  _optionalChain([client, 'optionalAccess', _ => _.on, 'call', _2 => _2('beforeSampling', ({ spanAttributes }, samplingDecision) => {
    // There are situations where the Next.js Node.js server forwards requests for the Edge Runtime server (e.g. in
    // middleware) and this causes spans for Sentry ingest requests to be created. These are not exempt from our tracing
    // because we didn't get the chance to do `suppressTracing`, since this happens outside of userland.
    // We need to drop these spans.
    if (
      // eslint-disable-next-line deprecation/deprecation
      (typeof spanAttributes[semanticConventions.SEMATTRS_HTTP_TARGET] === 'string' &&
        // eslint-disable-next-line deprecation/deprecation
        spanAttributes[semanticConventions.SEMATTRS_HTTP_TARGET].includes('sentry_key') &&
        // eslint-disable-next-line deprecation/deprecation
        spanAttributes[semanticConventions.SEMATTRS_HTTP_TARGET].includes('sentry_client')) ||
      (typeof spanAttributes[semanticConventions.ATTR_URL_QUERY] === 'string' &&
        spanAttributes[semanticConventions.ATTR_URL_QUERY].includes('sentry_key') &&
        spanAttributes[semanticConventions.ATTR_URL_QUERY].includes('sentry_client'))
    ) {
      samplingDecision.decision = false;
    }
  })]);

  _optionalChain([client, 'optionalAccess', _3 => _3.on, 'call', _4 => _4('spanStart', span => {
    const spanAttributes = core.spanToJSON(span).data;

    // What we do in this glorious piece of code, is hoist any information about parameterized routes from spans emitted
    // by Next.js via the `next.route` attribute, up to the transaction by setting the http.route attribute.
    if (typeof _optionalChain([spanAttributes, 'optionalAccess', _5 => _5['next.route']]) === 'string') {
      const rootSpan = core.getRootSpan(span);
      const rootSpanAttributes = core.spanToJSON(rootSpan).data;

      // Only hoist the http.route attribute if the transaction doesn't already have it
      if (
        // eslint-disable-next-line deprecation/deprecation
        (_optionalChain([rootSpanAttributes, 'optionalAccess', _6 => _6[semanticConventions.ATTR_HTTP_REQUEST_METHOD]]) || _optionalChain([rootSpanAttributes, 'optionalAccess', _7 => _7[semanticConventions.SEMATTRS_HTTP_METHOD]])) &&
        !_optionalChain([rootSpanAttributes, 'optionalAccess', _8 => _8[semanticConventions.ATTR_HTTP_ROUTE]])
      ) {
        const route = spanAttributes['next.route'].replace(/\/route$/, '');
        rootSpan.updateName(route);
        rootSpan.setAttribute(semanticConventions.ATTR_HTTP_ROUTE, route);
      }
    }

    // We want to skip span data inference for any spans generated by Next.js. Reason being that Next.js emits spans
    // with patterns (e.g. http.server spans) that will produce confusing data.
    if (_optionalChain([spanAttributes, 'optionalAccess', _9 => _9['next.span_type']]) !== undefined) {
      span.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, 'auto');
    }

    // We want to fork the isolation scope for incoming requests
    if (_optionalChain([spanAttributes, 'optionalAccess', _10 => _10['next.span_type']]) === 'BaseServer.handleRequest' && span === core.getRootSpan(span)) {
      const scopes = core.getCapturedScopesOnSpan(span);

      const isolationScope = (scopes.isolationScope || core.getIsolationScope()).clone();
      const scope = scopes.scope || core.getCurrentScope();

      const currentScopesPointer = opentelemetry.getScopesFromContext(api.context.active());
      if (currentScopesPointer) {
        currentScopesPointer.isolationScope = isolationScope;
      }

      core.setCapturedScopesOnSpan(span, scope, isolationScope);
    }
  })]);

  core.getGlobalScope().addEventProcessor(
    Object.assign(
      (event => {
        if (event.type === 'transaction') {
          // Filter out transactions for static assets
          // This regex matches the default path to the static assets (`_next/static`) and could potentially filter out too many transactions.
          // We match `/_next/static/` anywhere in the transaction name because its location may change with the basePath setting.
          if (_optionalChain([event, 'access', _11 => _11.transaction, 'optionalAccess', _12 => _12.match, 'call', _13 => _13(/^GET (\/.*)?\/_next\/static\//)])) {
            return null;
          }

          // Filter out transactions for requests to the tunnel route
          if (
            (globalWithInjectedValues._sentryRewritesTunnelPath &&
              event.transaction === `POST ${globalWithInjectedValues._sentryRewritesTunnelPath}`) ||
            (process.env._sentryRewritesTunnelPath &&
              event.transaction === `POST ${process.env._sentryRewritesTunnelPath}`)
          ) {
            return null;
          }

          // Filter out requests to resolve source maps for stack frames in dev mode
          if (_optionalChain([event, 'access', _14 => _14.transaction, 'optionalAccess', _15 => _15.match, 'call', _16 => _16(/\/__nextjs_original-stack-frame/)])) {
            return null;
          }

          // Filter out /404 transactions which seem to be created excessively
          if (
            // Pages router
            event.transaction === '/404' ||
            // App router (could be "GET /404", "POST /404", ...)
            _optionalChain([event, 'access', _17 => _17.transaction, 'optionalAccess', _18 => _18.match, 'call', _19 => _19(/^(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH) \/(404|_not-found)$/)])
          ) {
            return null;
          }

          // Filter transactions that we explicitly want to drop.
          if (_optionalChain([event, 'access', _20 => _20.contexts, 'optionalAccess', _21 => _21.trace, 'optionalAccess', _22 => _22.data, 'optionalAccess', _23 => _23[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION]])) {
            return null;
          }

          // Next.js 13 sometimes names the root transactions like this containing useless tracing.
          if (event.transaction === 'NextServer.getRequestHandler') {
            return null;
          }

          // Next.js 13 is not correctly picking up tracing data for trace propagation so we use a back-fill strategy
          if (typeof _optionalChain([event, 'access', _24 => _24.contexts, 'optionalAccess', _25 => _25.trace, 'optionalAccess', _26 => _26.data, 'optionalAccess', _27 => _27[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL]]) === 'string') {
            const traceparentData = core.extractTraceparentData(
              event.contexts.trace.data[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL],
            );

            if (_optionalChain([traceparentData, 'optionalAccess', _28 => _28.parentSampled]) === false) {
              return null;
            }
          }

          return event;
        } else {
          return event;
        }
      }) ,
      { id: 'NextLowQualityTransactionsFilter' },
    ),
  );

  core.getGlobalScope().addEventProcessor(
    Object.assign(
      ((event, hint) => {
        if (event.type !== undefined) {
          return event;
        }

        const originalException = hint.originalException;

        const isPostponeError =
          typeof originalException === 'object' &&
          originalException !== null &&
          '$$typeof' in originalException &&
          originalException.$$typeof === Symbol.for('react.postpone');

        if (isPostponeError) {
          // Postpone errors are used for partial-pre-rendering (PPR)
          return null;
        }

        // We don't want to capture suspense errors as they are simply used by React/Next.js for control flow
        const exceptionMessage = _optionalChain([event, 'access', _29 => _29.exception, 'optionalAccess', _30 => _30.values, 'optionalAccess', _31 => _31[0], 'optionalAccess', _32 => _32.value]);
        if (
          _optionalChain([exceptionMessage, 'optionalAccess', _33 => _33.includes, 'call', _34 => _34('Suspense Exception: This is not a real error!')]) ||
          _optionalChain([exceptionMessage, 'optionalAccess', _35 => _35.includes, 'call', _36 => _36('Suspense Exception: This is not a real error, and should not leak')])
        ) {
          return null;
        }

        return event;
      }) ,
      { id: 'DropReactControlFlowErrors' },
    ),
  );

  // Use the preprocessEvent hook instead of an event processor, so that the users event processors receive the most
  // up-to-date value, but also so that the logic that detects changes to the transaction names to set the source to
  // "custom", doesn't trigger.
  _optionalChain([client, 'optionalAccess', _37 => _37.on, 'call', _38 => _38('preprocessEvent', event => {
    // Enhance route handler transactions
    if (
      event.type === 'transaction' &&
      _optionalChain([event, 'access', _39 => _39.contexts, 'optionalAccess', _40 => _40.trace, 'optionalAccess', _41 => _41.data, 'optionalAccess', _42 => _42['next.span_type']]) === 'BaseServer.handleRequest'
    ) {
      event.contexts.trace.data = event.contexts.trace.data || {};
      event.contexts.trace.data[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] = 'http.server';
      event.contexts.trace.op = 'http.server';

      if (event.transaction) {
        event.transaction = core.stripUrlQueryAndFragment(event.transaction);
      }

      // eslint-disable-next-line deprecation/deprecation
      const method = event.contexts.trace.data[semanticConventions.SEMATTRS_HTTP_METHOD];
      // eslint-disable-next-line deprecation/deprecation
      const target = _optionalChain([event, 'access', _43 => _43.contexts, 'optionalAccess', _44 => _44.trace, 'optionalAccess', _45 => _45.data, 'optionalAccess', _46 => _46[semanticConventions.SEMATTRS_HTTP_TARGET]]);
      const route = event.contexts.trace.data[semanticConventions.ATTR_HTTP_ROUTE];

      if (typeof method === 'string' && typeof route === 'string') {
        event.transaction = `${method} ${route.replace(/\/route$/, '')}`;
        event.contexts.trace.data[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = 'route';
      }

      // backfill transaction name for pages that would otherwise contain unparameterized routes
      if (event.contexts.trace.data[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL] && event.transaction !== 'GET /_app') {
        event.transaction = `${method} ${event.contexts.trace.data[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL]}`;
      }

      // Next.js overrides transaction names for page loads that throw an error
      // but we want to keep the original target name
      if (event.transaction === 'GET /_error' && target) {
        event.transaction = `${method ? `${method} ` : ''}${target}`;
      }
    }

    // Next.js 13 is not correctly picking up tracing data for trace propagation so we use a back-fill strategy
    if (
      event.type === 'transaction' &&
      typeof _optionalChain([event, 'access', _47 => _47.contexts, 'optionalAccess', _48 => _48.trace, 'optionalAccess', _49 => _49.data, 'optionalAccess', _50 => _50[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL]]) === 'string'
    ) {
      const traceparentData = core.extractTraceparentData(event.contexts.trace.data[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL]);

      if (_optionalChain([traceparentData, 'optionalAccess', _51 => _51.traceId])) {
        event.contexts.trace.trace_id = traceparentData.traceId;
      }

      if (_optionalChain([traceparentData, 'optionalAccess', _52 => _52.parentSpanId])) {
        event.contexts.trace.parent_span_id = traceparentData.parentSpanId;
      }
    }
  })]);

  if (process.env.NODE_ENV === 'development') {
    core.getGlobalScope().addEventProcessor(devErrorSymbolicationEventProcessor.devErrorSymbolicationEventProcessor);
  }

  debugBuild.DEBUG_BUILD && core.logger.log('SDK successfully initialized');

  return client;
}

function sdkAlreadyInitialized() {
  return !!core.getClient();
}

exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
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
exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry.wrapApiHandlerWithSentry;
exports.ErrorBoundary = ErrorBoundary;
exports.createReduxEnhancer = createReduxEnhancer;
exports.init = init;
exports.showReportDialog = showReportDialog;
exports.withErrorBoundary = withErrorBoundary;
Object.prototype.hasOwnProperty.call(node, '__proto__') &&
  !Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
  Object.defineProperty(exports, '__proto__', {
    enumerable: true,
    value: node['__proto__']
  });

Object.keys(node).forEach(k => {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = node[k];
});
//# sourceMappingURL=index.js.map
