Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const responseEnd = require('./utils/responseEnd.js');

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
      return core.withIsolationScope(isolationScope => {
        const req = args[0];
        const currentScope = core.getCurrentScope();

        let spanName;
        let spanSource;

        if (req instanceof Request) {
          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: core.winterCGRequestToRequestData(req),
          });
          spanName = `middleware ${req.method} ${new URL(req.url).pathname}`;
          spanSource = 'url';
        } else {
          spanName = 'middleware';
          spanSource = 'component';
        }

        currentScope.setTransactionName(spanName);

        const activeSpan = core.getActiveSpan();

        if (activeSpan) {
          // If there is an active span, it likely means that the automatic Next.js OTEL instrumentation worked and we can
          // rely on that for parameterization.
          spanName = 'middleware';
          spanSource = 'component';

          const rootSpan = core.getRootSpan(activeSpan);
          if (rootSpan) {
            core.setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
          }
        }

        return core.startSpan(
          {
            name: spanName,
            op: 'http.server.middleware',
            attributes: {
              [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: spanSource,
              [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.wrapMiddlewareWithSentry',
            },
          },
          () => {
            return core.handleCallbackErrors(
              () => wrappingTarget.apply(thisArg, args),
              error => {
                core.captureException(error, {
                  mechanism: {
                    type: 'instrument',
                    handled: false,
                  },
                });
              },
              () => {
                core.vercelWaitUntil(responseEnd.flushSafelyWithTimeout());
              },
            );
          },
        );
      });
    },
  });
}

exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry;
//# sourceMappingURL=wrapMiddlewareWithSentry.js.map
