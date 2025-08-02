import { withIsolationScope, getCurrentScope, winterCGRequestToRequestData, getActiveSpan, getRootSpan, setCapturedScopesOnSpan, startSpan, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, handleCallbackErrors, captureException, vercelWaitUntil } from '@sentry/core';
import { flushSafelyWithTimeout } from './utils/responseEnd.js';

/**
 * Wraps Next.js middleware with Sentry error and performance instrumentation.
 *
 * @param middleware The middleware handler.
 * @returns a wrapped middleware handler.
 */
function wrapMiddlewareWithSentry(
  middleware,
) {
  return new Proxy(middleware, {
    apply: async (wrappingTarget, thisArg, args) => {
      // TODO: We still should add central isolation scope creation for when our build-time instrumentation does not work anymore with turbopack.
      return withIsolationScope(isolationScope => {
        const req = args[0];
        const currentScope = getCurrentScope();

        let spanName;
        let spanSource;

        if (req instanceof Request) {
          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: winterCGRequestToRequestData(req),
          });
          spanName = `middleware ${req.method} ${new URL(req.url).pathname}`;
          spanSource = 'url';
        } else {
          spanName = 'middleware';
          spanSource = 'component';
        }

        currentScope.setTransactionName(spanName);

        const activeSpan = getActiveSpan();

        if (activeSpan) {
          // If there is an active span, it likely means that the automatic Next.js OTEL instrumentation worked and we can
          // rely on that for parameterization.
          spanName = 'middleware';
          spanSource = 'component';

          const rootSpan = getRootSpan(activeSpan);
          if (rootSpan) {
            setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
          }
        }

        return startSpan(
          {
            name: spanName,
            op: 'http.server.middleware',
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: spanSource,
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.wrapMiddlewareWithSentry',
            },
          },
          () => {
            return handleCallbackErrors(
              () => wrappingTarget.apply(thisArg, args),
              error => {
                captureException(error, {
                  mechanism: {
                    type: 'instrument',
                    handled: false,
                  },
                });
              },
              () => {
                vercelWaitUntil(flushSafelyWithTimeout());
              },
            );
          },
        );
      });
    },
  });
}

export { wrapMiddlewareWithSentry };
//# sourceMappingURL=wrapMiddlewareWithSentry.js.map
