Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const spanAttributesWithLogicAttached = require('../span-attributes-with-logic-attached.js');

/**
 * Wraps a function that potentially throws. If it does, the error is passed to `captureException` and rethrown.
 *
 * Note: This function turns the wrapped function into an asynchronous one.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withErrorInstrumentation(
  origFunction,
) {
  return async function ( ...origFunctionArguments) {
    try {
      return await origFunction.apply(this, origFunctionArguments);
    } catch (e) {
      // TODO: Extract error logic from `withSentry` in here or create a new wrapper with said logic or something like that.
      core.captureException(e, { mechanism: { handled: false } });
      throw e;
    }
  };
}

/**
 * Calls a server-side data fetching function (that takes a `req` and `res` object in its context) with tracing
 * instrumentation. A transaction will be created for the incoming request (if it doesn't already exist) in addition to
 * a span for the wrapped data fetching function.
 *
 * All of the above happens in an isolated domain, meaning all thrown errors will be associated with the correct span.
 *
 * @param origDataFetcher The data fetching method to call.
 * @param origFunctionArguments The arguments to call the data fetching method with.
 * @param req The data fetching function's request object.
 * @param res The data fetching function's response object.
 * @param options Options providing details for the created transaction and span.
 * @returns what the data fetching method call returned.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTracedServerSideDataFetcher(
  origDataFetcher,
  req,
  res,
  options

,
) {
  return async function (

    ...args
  ) {
    const normalizedRequest = core.httpRequestToRequestData(req);
    core.getCurrentScope().setTransactionName(`${options.dataFetchingMethodName} (${options.dataFetcherRouteName})`);
    core.getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });

    const span = core.getActiveSpan();

    // Only set the route backfill if the span is not for /_error
    if (span && options.requestedRouteName !== '/_error') {
      const root = core.getRootSpan(span);
      root.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL, options.requestedRouteName);
    }

    const { 'sentry-trace': sentryTrace, baggage } = core.getTraceData();

    return {
      sentryTrace: sentryTrace,
      baggage: baggage,
      data: await origDataFetcher.apply(this, args),
    };
  };
}

/**
 * Call a data fetcher and trace it. Only traces the function if there is an active transaction on the scope.
 *
 * We only do the following until we move transaction creation into this function: When called, the wrapped function
 * will also update the name of the active transaction with a parameterized route provided via the `options` argument.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callDataFetcherTraced(
  origFunction,
  origFunctionArgs,
) {
  try {
    return await origFunction(...origFunctionArgs);
  } catch (e) {
    core.captureException(e, { mechanism: { handled: false } });
    throw e;
  }
}

exports.callDataFetcherTraced = callDataFetcherTraced;
exports.withErrorInstrumentation = withErrorInstrumentation;
exports.withTracedServerSideDataFetcher = withTracedServerSideDataFetcher;
//# sourceMappingURL=wrapperUtils.js.map
