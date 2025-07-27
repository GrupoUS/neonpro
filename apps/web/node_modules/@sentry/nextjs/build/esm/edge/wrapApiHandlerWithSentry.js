import { withIsolationScope, getCurrentScope, winterCGRequestToRequestData, getActiveSpan, getRootSpan, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, setCapturedScopesOnSpan, startSpan, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, handleCallbackErrors, captureException, vercelWaitUntil } from '@sentry/core';
import { flushSafelyWithTimeout } from '../common/utils/responseEnd.js';

/**
 * Wraps a Next.js edge route handler with Sentry error and performance instrumentation.
 */
function wrapApiHandlerWithSentry(
  handler,
  parameterizedRoute,
) {
  return new Proxy(handler, {
    apply: async (wrappingTarget, thisArg, args) => {
      // TODO: We still should add central isolation scope creation for when our build-time instrumentation does not work anymore with turbopack.

      return withIsolationScope(isolationScope => {
        const req = args[0];
        const currentScope = getCurrentScope();

        if (req instanceof Request) {
          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: winterCGRequestToRequestData(req),
          });
          currentScope.setTransactionName(`${req.method} ${parameterizedRoute}`);
        } else {
          currentScope.setTransactionName(`handler (${parameterizedRoute})`);
        }

        let spanName;
        let op = 'http.server';

        // If there is an active span, it likely means that the automatic Next.js OTEL instrumentation worked and we can
        // rely on that for parameterization.
        const activeSpan = getActiveSpan();
        if (activeSpan) {
          spanName = `handler (${parameterizedRoute})`;
          op = undefined;

          const rootSpan = getRootSpan(activeSpan);
          if (rootSpan) {
            rootSpan.updateName(
              req instanceof Request ? `${req.method} ${parameterizedRoute}` : `handler ${parameterizedRoute}`,
            );
            rootSpan.setAttributes({
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'http.server',
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
            });
            setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
          }
        } else if (req instanceof Request) {
          spanName = `${req.method} ${parameterizedRoute}`;
        } else {
          spanName = `handler ${parameterizedRoute}`;
        }

        return startSpan(
          {
            name: spanName,
            op: op,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.wrapApiHandlerWithSentry',
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

export { wrapApiHandlerWithSentry };
//# sourceMappingURL=wrapApiHandlerWithSentry.js.map
