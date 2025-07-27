import { _nullishCoalesce, _optionalChain } from '@sentry/core';
import { getActiveSpan, getRootSpan, getCapturedScopesOnSpan, setCapturedScopesOnSpan, winterCGHeadersToDict, withIsolationScope, withScope, propagationContextFromHeaders, generateTraceId, generateSpanId, startSpanManual, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, handleCallbackErrors, SPAN_STATUS_ERROR, SPAN_STATUS_OK, captureException, Scope, getClient } from '@sentry/core';
import { isNotFoundNavigationError, isRedirectNavigationError } from './nextNavigationErrorUtils.js';
import { TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL } from './span-attributes-with-logic-attached.js';
import { commonObjectToIsolationScope, commonObjectToPropagationContext } from './utils/tracingUtils.js';

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
      const requestTraceId = _optionalChain([getActiveSpan, 'call', _ => _(), 'optionalAccess', _2 => _2.spanContext, 'call', _3 => _3(), 'access', _4 => _4.traceId]);
      let headers = undefined;
      // We try-catch here just in case anything goes wrong with the async storage here goes wrong since it is Next.js internal API
      try {
        headers = _optionalChain([requestAsyncStorage, 'optionalAccess', _5 => _5.getStore, 'call', _6 => _6(), 'optionalAccess', _7 => _7.headers]);
      } catch (e) {
        /** empty */
      }

      const isolationScope = commonObjectToIsolationScope(headers);

      const activeSpan = getActiveSpan();
      if (activeSpan) {
        const rootSpan = getRootSpan(activeSpan);
        const { scope } = getCapturedScopesOnSpan(rootSpan);
        setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new Scope())), isolationScope);
      }

      let data = undefined;
      if (_optionalChain([getClient, 'call', _8 => _8(), 'optionalAccess', _9 => _9.getOptions, 'call', _10 => _10(), 'access', _11 => _11.sendDefaultPii])) {
        const props = args[0];
        const params = props && typeof props === 'object' && 'params' in props ? props.params : undefined;
        const searchParams =
          props && typeof props === 'object' && 'searchParams' in props ? props.searchParams : undefined;
        data = { params, searchParams };
      }

      const headersDict = headers ? winterCGHeadersToDict(headers) : undefined;

      return withIsolationScope(isolationScope, () => {
        return withScope(scope => {
          scope.setTransactionName(`${componentType}.${generationFunctionIdentifier} (${componentRoute})`);

          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: {
              headers: headersDict,
            } ,
          });

          const activeSpan = getActiveSpan();
          if (activeSpan) {
            const rootSpan = getRootSpan(activeSpan);
            const sentryTrace = _optionalChain([headersDict, 'optionalAccess', _12 => _12['sentry-trace']]);
            if (sentryTrace) {
              rootSpan.setAttribute(TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL, sentryTrace);
            }
          }

          const propagationContext = commonObjectToPropagationContext(
            headers,
            _optionalChain([headersDict, 'optionalAccess', _13 => _13['sentry-trace']])
              ? propagationContextFromHeaders(headersDict['sentry-trace'], headersDict['baggage'])
              : {
                  traceId: requestTraceId || generateTraceId(),
                  spanId: generateSpanId(),
                },
          );
          scope.setPropagationContext(propagationContext);

          scope.setExtra('route_data', data);

          return startSpanManual(
            {
              op: 'function.nextjs',
              name: `${componentType}.${generationFunctionIdentifier} (${componentRoute})`,
              attributes: {
                [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
                [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs',
              },
            },
            span => {
              return handleCallbackErrors(
                () => originalFunction.apply(thisArg, args),
                err => {
                  // When you read this code you might think: "Wait a minute, shouldn't we set the status on the root span too?"
                  // The answer is: "No." - The status of the root span is determined by whatever status code Next.js decides to put on the response.
                  if (isNotFoundNavigationError(err)) {
                    // We don't want to report "not-found"s
                    span.setStatus({ code: SPAN_STATUS_ERROR, message: 'not_found' });
                    getRootSpan(span).setStatus({ code: SPAN_STATUS_ERROR, message: 'not_found' });
                  } else if (isRedirectNavigationError(err)) {
                    // We don't want to report redirects
                    span.setStatus({ code: SPAN_STATUS_OK });
                  } else {
                    span.setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                    getRootSpan(span).setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                    captureException(err, {
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

export { wrapGenerationFunctionWithSentry };
//# sourceMappingURL=wrapGenerationFunctionWithSentry.js.map
