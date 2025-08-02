var {
  _nullishCoalesce,
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const nextNavigationErrorUtils = require('./nextNavigationErrorUtils.js');
const spanAttributesWithLogicAttached = require('./span-attributes-with-logic-attached.js');
const tracingUtils = require('./utils/tracingUtils.js');

/**
 * Wraps a generation function (e.g. generateMetadata) with Sentry error and performance instrumentation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapGenerationFunctionWithSentry(
  generationFunction,
  context,
) {
  const { requestAsyncStorage, componentRoute, componentType, generationFunctionIdentifier } = context;
  return new Proxy(generationFunction, {
    apply: (originalFunction, thisArg, args) => {
      const requestTraceId = _optionalChain([core.getActiveSpan, 'call', _ => _(), 'optionalAccess', _2 => _2.spanContext, 'call', _3 => _3(), 'access', _4 => _4.traceId]);
      let headers = undefined;
      // We try-catch here just in case anything goes wrong with the async storage here goes wrong since it is Next.js internal API
      try {
        headers = _optionalChain([requestAsyncStorage, 'optionalAccess', _5 => _5.getStore, 'call', _6 => _6(), 'optionalAccess', _7 => _7.headers]);
      } catch (e) {
        /** empty */
      }

      const isolationScope = tracingUtils.commonObjectToIsolationScope(headers);

      const activeSpan = core.getActiveSpan();
      if (activeSpan) {
        const rootSpan = core.getRootSpan(activeSpan);
        const { scope } = core.getCapturedScopesOnSpan(rootSpan);
        core.setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new core.Scope())), isolationScope);
      }

      let data = undefined;
      if (_optionalChain([core.getClient, 'call', _8 => _8(), 'optionalAccess', _9 => _9.getOptions, 'call', _10 => _10(), 'access', _11 => _11.sendDefaultPii])) {
        const props = args[0];
        const params = props && typeof props === 'object' && 'params' in props ? props.params : undefined;
        const searchParams =
          props && typeof props === 'object' && 'searchParams' in props ? props.searchParams : undefined;
        data = { params, searchParams };
      }

      const headersDict = headers ? core.winterCGHeadersToDict(headers) : undefined;

      return core.withIsolationScope(isolationScope, () => {
        return core.withScope(scope => {
          scope.setTransactionName(`${componentType}.${generationFunctionIdentifier} (${componentRoute})`);

          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: {
              headers: headersDict,
            } ,
          });

          const activeSpan = core.getActiveSpan();
          if (activeSpan) {
            const rootSpan = core.getRootSpan(activeSpan);
            const sentryTrace = _optionalChain([headersDict, 'optionalAccess', _12 => _12['sentry-trace']]);
            if (sentryTrace) {
              rootSpan.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL, sentryTrace);
            }
          }

          const propagationContext = tracingUtils.commonObjectToPropagationContext(
            headers,
            _optionalChain([headersDict, 'optionalAccess', _13 => _13['sentry-trace']])
              ? core.propagationContextFromHeaders(headersDict['sentry-trace'], headersDict['baggage'])
              : {
                  traceId: requestTraceId || core.generateTraceId(),
                  spanId: core.generateSpanId(),
                },
          );
          scope.setPropagationContext(propagationContext);

          scope.setExtra('route_data', data);

          return core.startSpanManual(
            {
              op: 'function.nextjs',
              name: `${componentType}.${generationFunctionIdentifier} (${componentRoute})`,
              attributes: {
                [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
                [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs',
              },
            },
            span => {
              return core.handleCallbackErrors(
                () => originalFunction.apply(thisArg, args),
                err => {
                  // When you read this code you might think: "Wait a minute, shouldn't we set the status on the root span too?"
                  // The answer is: "No." - The status of the root span is determined by whatever status code Next.js decides to put on the response.
                  if (nextNavigationErrorUtils.isNotFoundNavigationError(err)) {
                    // We don't want to report "not-found"s
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'not_found' });
                    core.getRootSpan(span).setStatus({ code: core.SPAN_STATUS_ERROR, message: 'not_found' });
                  } else if (nextNavigationErrorUtils.isRedirectNavigationError(err)) {
                    // We don't want to report redirects
                    span.setStatus({ code: core.SPAN_STATUS_OK });
                  } else {
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
                    core.getRootSpan(span).setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
                    core.captureException(err, {
                      mechanism: {
                        handled: false,
                      },
                    });
                  }
                },
                () => {
                  span.end();
                },
              );
            },
          );
        });
      });
    },
  });
}

exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry;
//# sourceMappingURL=wrapGenerationFunctionWithSentry.js.map
