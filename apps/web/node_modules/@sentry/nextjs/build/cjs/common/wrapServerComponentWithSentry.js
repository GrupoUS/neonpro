var {
  _nullishCoalesce,
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const nextNavigationErrorUtils = require('./nextNavigationErrorUtils.js');
const spanAttributesWithLogicAttached = require('./span-attributes-with-logic-attached.js');
const responseEnd = require('./utils/responseEnd.js');
const tracingUtils = require('./utils/tracingUtils.js');

/**
 * Wraps an `app` directory server component with Sentry error instrumentation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapServerComponentWithSentry(
  appDirComponent,
  context,
) {
  const { componentRoute, componentType } = context;
  // Even though users may define server components as async functions, for the client bundles
  // Next.js will turn them into synchronous functions and it will transform any `await`s into instances of the `use`
  // hook. 🤯
  return new Proxy(appDirComponent, {
    apply: (originalFunction, thisArg, args) => {
      const requestTraceId = _optionalChain([core.getActiveSpan, 'call', _ => _(), 'optionalAccess', _2 => _2.spanContext, 'call', _3 => _3(), 'access', _4 => _4.traceId]);
      const isolationScope = tracingUtils.commonObjectToIsolationScope(context.headers);

      const activeSpan = core.getActiveSpan();
      if (activeSpan) {
        const rootSpan = core.getRootSpan(activeSpan);
        const { scope } = core.getCapturedScopesOnSpan(rootSpan);
        core.setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new core.Scope())), isolationScope);
      }

      const headersDict = context.headers ? core.winterCGHeadersToDict(context.headers) : undefined;

      isolationScope.setSDKProcessingMetadata({
        normalizedRequest: {
          headers: headersDict,
        } ,
      });

      return core.withIsolationScope(isolationScope, () => {
        return core.withScope(scope => {
          scope.setTransactionName(`${componentType} Server Component (${componentRoute})`);

          if (process.env.NEXT_RUNTIME === 'edge') {
            const propagationContext = tracingUtils.commonObjectToPropagationContext(
              context.headers,
              _optionalChain([headersDict, 'optionalAccess', _5 => _5['sentry-trace']])
                ? core.propagationContextFromHeaders(headersDict['sentry-trace'], headersDict['baggage'])
                : {
                    traceId: requestTraceId || core.generateTraceId(),
                    spanId: core.generateSpanId(),
                  },
            );

            scope.setPropagationContext(propagationContext);
          }

          const activeSpan = core.getActiveSpan();
          if (activeSpan) {
            const rootSpan = core.getRootSpan(activeSpan);
            const sentryTrace = _optionalChain([headersDict, 'optionalAccess', _6 => _6['sentry-trace']]);
            if (sentryTrace) {
              rootSpan.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL, sentryTrace);
            }
          }

          return core.startSpanManual(
            {
              op: 'function.nextjs',
              name: `${componentType} Server Component (${componentRoute})`,
              attributes: {
                [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'component',
                [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs',
              },
            },
            span => {
              return core.handleCallbackErrors(
                () => originalFunction.apply(thisArg, args),
                error => {
                  // When you read this code you might think: "Wait a minute, shouldn't we set the status on the root span too?"
                  // The answer is: "No." - The status of the root span is determined by whatever status code Next.js decides to put on the response.
                  if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) {
                    // We don't want to report "not-found"s
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'not_found' });
                  } else if (nextNavigationErrorUtils.isRedirectNavigationError(error)) {
                    // We don't want to report redirects
                    span.setStatus({ code: core.SPAN_STATUS_OK });
                  } else {
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
                    core.captureException(error, {
                      mechanism: {
                        handled: false,
                      },
                    });
                  }
                },
                () => {
                  span.end();
                  core.vercelWaitUntil(responseEnd.flushSafelyWithTimeout());
                },
              );
            },
          );
        });
      });
    },
  });
}

exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry;
//# sourceMappingURL=wrapServerComponentWithSentry.js.map
