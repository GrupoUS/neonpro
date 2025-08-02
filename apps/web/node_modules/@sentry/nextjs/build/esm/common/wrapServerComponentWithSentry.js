import { _nullishCoalesce, _optionalChain } from '@sentry/core';
import { getActiveSpan, getRootSpan, getCapturedScopesOnSpan, setCapturedScopesOnSpan, winterCGHeadersToDict, withIsolationScope, withScope, propagationContextFromHeaders, generateTraceId, generateSpanId, startSpanManual, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, handleCallbackErrors, SPAN_STATUS_ERROR, SPAN_STATUS_OK, captureException, vercelWaitUntil, Scope } from '@sentry/core';
import { isNotFoundNavigationError, isRedirectNavigationError } from './nextNavigationErrorUtils.js';
import { TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL } from './span-attributes-with-logic-attached.js';
import { flushSafelyWithTimeout } from './utils/responseEnd.js';
import { commonObjectToIsolationScope, commonObjectToPropagationContext } from './utils/tracingUtils.js';

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
      const requestTraceId = _optionalChain([getActiveSpan, 'call', _ => _(), 'optionalAccess', _2 => _2.spanContext, 'call', _3 => _3(), 'access', _4 => _4.traceId]);
      const isolationScope = commonObjectToIsolationScope(context.headers);

      const activeSpan = getActiveSpan();
      if (activeSpan) {
        const rootSpan = getRootSpan(activeSpan);
        const { scope } = getCapturedScopesOnSpan(rootSpan);
        setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new Scope())), isolationScope);
      }

      const headersDict = context.headers ? winterCGHeadersToDict(context.headers) : undefined;

      isolationScope.setSDKProcessingMetadata({
        normalizedRequest: {
          headers: headersDict,
        } ,
      });

      return withIsolationScope(isolationScope, () => {
        return withScope(scope => {
          scope.setTransactionName(`${componentType} Server Component (${componentRoute})`);

          if (process.env.NEXT_RUNTIME === 'edge') {
            const propagationContext = commonObjectToPropagationContext(
              context.headers,
              _optionalChain([headersDict, 'optionalAccess', _5 => _5['sentry-trace']])
                ? propagationContextFromHeaders(headersDict['sentry-trace'], headersDict['baggage'])
                : {
                    traceId: requestTraceId || generateTraceId(),
                    spanId: generateSpanId(),
                  },
            );

            scope.setPropagationContext(propagationContext);
          }

          const activeSpan = getActiveSpan();
          if (activeSpan) {
            const rootSpan = getRootSpan(activeSpan);
            const sentryTrace = _optionalChain([headersDict, 'optionalAccess', _6 => _6['sentry-trace']]);
            if (sentryTrace) {
              rootSpan.setAttribute(TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL, sentryTrace);
            }
          }

          return startSpanManual(
            {
              op: 'function.nextjs',
              name: `${componentType} Server Component (${componentRoute})`,
              attributes: {
                [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'component',
                [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs',
              },
            },
            span => {
              return handleCallbackErrors(
                () => originalFunction.apply(thisArg, args),
                error => {
                  // When you read this code you might think: "Wait a minute, shouldn't we set the status on the root span too?"
                  // The answer is: "No." - The status of the root span is determined by whatever status code Next.js decides to put on the response.
                  if (isNotFoundNavigationError(error)) {
                    // We don't want to report "not-found"s
                    span.setStatus({ code: SPAN_STATUS_ERROR, message: 'not_found' });
                  } else if (isRedirectNavigationError(error)) {
                    // We don't want to report redirects
                    span.setStatus({ code: SPAN_STATUS_OK });
                  } else {
                    span.setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                    captureException(error, {
                      mechanism: {
                        handled: false,
                      },
                    });
                  }
                },
                () => {
                  span.end();
                  vercelWaitUntil(flushSafelyWithTimeout());
                },
              );
            },
          );
        });
      });
    },
  });
}

export { wrapServerComponentWithSentry };
//# sourceMappingURL=wrapServerComponentWithSentry.js.map
