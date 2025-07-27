var {
  _nullishCoalesce
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const nextNavigationErrorUtils = require('./nextNavigationErrorUtils.js');
const tracingUtils = require('./utils/tracingUtils.js');

/**
 * Wraps a Next.js App Router Route handler with Sentry error and performance instrumentation.
 *
 * NOTICE: This wrapper is for App Router API routes. If you are looking to wrap Pages Router API routes use `wrapApiHandlerWithSentry` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapRouteHandlerWithSentry(
  routeHandler,
  context,
) {
  const { method, parameterizedRoute, headers } = context;

  return new Proxy(routeHandler, {
    apply: async (originalFunction, thisArg, args) => {
      const activeSpan = core.getActiveSpan();
      const rootSpan = activeSpan ? core.getRootSpan(activeSpan) : undefined;

      let edgeRuntimeIsolationScopeOverride;
      if (rootSpan && process.env.NEXT_RUNTIME === 'edge') {
        const isolationScope = tracingUtils.commonObjectToIsolationScope(headers);
        const { scope } = core.getCapturedScopesOnSpan(rootSpan);
        core.setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new core.Scope())), isolationScope);

        edgeRuntimeIsolationScopeOverride = isolationScope;

        rootSpan.updateName(`${method} ${parameterizedRoute}`);
        rootSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'route');
        rootSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_OP, 'http.server');
      }

      return core.withIsolationScope(
        process.env.NEXT_RUNTIME === 'edge' ? edgeRuntimeIsolationScopeOverride : core.getIsolationScope(),
        () => {
          return core.withScope(async scope => {
            scope.setTransactionName(`${method} ${parameterizedRoute}`);

            if (process.env.NEXT_RUNTIME === 'edge') {
              const completeHeadersDict = headers ? core.winterCGHeadersToDict(headers) : {};
              const incomingPropagationContext = core.propagationContextFromHeaders(
                completeHeadersDict['sentry-trace'],
                completeHeadersDict['baggage'],
              );
              scope.setPropagationContext(incomingPropagationContext);
              scope.setSDKProcessingMetadata({
                normalizedRequest: {
                  method,
                  headers: completeHeadersDict,
                } ,
              });
            }

            const response = await core.handleCallbackErrors(
              () => originalFunction.apply(thisArg, args),
              error => {
                // Next.js throws errors when calling `redirect()`. We don't wanna report these.
                if (nextNavigationErrorUtils.isRedirectNavigationError(error)) ; else if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) {
                  if (activeSpan) {
                    core.setHttpStatus(activeSpan, 404);
                  }
                  if (rootSpan) {
                    core.setHttpStatus(rootSpan, 404);
                  }
                } else {
                  core.captureException(error, {
                    mechanism: {
                      handled: false,
                    },
                  });
                }
              },
            );

            try {
              if (response.status) {
                if (activeSpan) {
                  core.setHttpStatus(activeSpan, response.status);
                }
                if (rootSpan) {
                  core.setHttpStatus(rootSpan, response.status);
                }
              }
            } catch (e) {
              // best effort - response may be undefined?
            }

            return response;
          });
        },
      );
    },
  });
}

exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry;
//# sourceMappingURL=wrapRouteHandlerWithSentry.js.map
