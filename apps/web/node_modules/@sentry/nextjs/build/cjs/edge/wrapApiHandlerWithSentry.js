Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const responseEnd = require('../common/utils/responseEnd.js');

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

      return core.withIsolationScope(isolationScope => {
        const req = args[0];
        const currentScope = core.getCurrentScope();

        if (req instanceof Request) {
          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: core.winterCGRequestToRequestData(req),
          });
          currentScope.setTransactionName(`${req.method} ${parameterizedRoute}`);
        } else {
          currentScope.setTransactionName(`handler (${parameterizedRoute})`);
        }

        let spanName;
        let op = 'http.server';

        // If there is an active span, it likely means that the automatic Next.js OTEL instrumentation worked and we can
        // rely on that for parameterization.
        const activeSpan = core.getActiveSpan();
        if (activeSpan) {
          spanName = `handler (${parameterizedRoute})`;
          op = undefined;

          const rootSpan = core.getRootSpan(activeSpan);
          if (rootSpan) {
            rootSpan.updateName(
              req instanceof Request ? `${req.method} ${parameterizedRoute}` : `handler ${parameterizedRoute}`,
            );
            rootSpan.setAttributes({
              [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'http.server',
              [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
            });
            core.setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
          }
        } else if (req instanceof Request) {
          spanName = `${req.method} ${parameterizedRoute}`;
        } else {
          spanName = `handler ${parameterizedRoute}`;
        }

        return core.startSpan(
          {
            name: spanName,
            op: op,
            attributes: {
              [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
              [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.wrapApiHandlerWithSentry',
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

exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry;
//# sourceMappingURL=wrapApiHandlerWithSentry.js.map
