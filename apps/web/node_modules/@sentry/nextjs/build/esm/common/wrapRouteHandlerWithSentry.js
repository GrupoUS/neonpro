import { _nullishCoalesce } from '@sentry/core';
import { getActiveSpan, getRootSpan, getCapturedScopesOnSpan, setCapturedScopesOnSpan, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, SEMANTIC_ATTRIBUTE_SENTRY_OP, withIsolationScope, getIsolationScope, withScope, winterCGHeadersToDict, propagationContextFromHeaders, handleCallbackErrors, setHttpStatus, captureException, Scope } from '@sentry/core';
import { isRedirectNavigationError, isNotFoundNavigationError } from './nextNavigationErrorUtils.js';
import { commonObjectToIsolationScope } from './utils/tracingUtils.js';

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
      const activeSpan = getActiveSpan();
      const rootSpan = activeSpan ? getRootSpan(activeSpan) : undefined;

      let edgeRuntimeIsolationScopeOverride;
      if (rootSpan && process.env.NEXT_RUNTIME === 'edge') {
        const isolationScope = commonObjectToIsolationScope(headers);
        const { scope } = getCapturedScopesOnSpan(rootSpan);
        setCapturedScopesOnSpan(rootSpan, _nullishCoalesce(scope, () => ( new Scope())), isolationScope);

        edgeRuntimeIsolationScopeOverride = isolationScope;

        rootSpan.updateName(`${method} ${parameterizedRoute}`);
        rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'route');
        rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, 'http.server');
      }

      return withIsolationScope(
        process.env.NEXT_RUNTIME === 'edge' ? edgeRuntimeIsolationScopeOverride : getIsolationScope(),
        () => {
          return withScope(async scope => {
            scope.setTransactionName(`${method} ${parameterizedRoute}`);

            if (process.env.NEXT_RUNTIME === 'edge') {
              const completeHeadersDict = headers ? winterCGHeadersToDict(headers) : {};
              const incomingPropagationContext = propagationContextFromHeaders(
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

            const response = await handleCallbackErrors(
              () => originalFunction.apply(thisArg, args),
              error => {
                // Next.js throws errors when calling `redirect()`. We don't wanna report these.
                if (isRedirectNavigationError(error)) ; else if (isNotFoundNavigationError(error)) {
                  if (activeSpan) {
                    setHttpStatus(activeSpan, 404);
                  }
                  if (rootSpan) {
                    setHttpStatus(rootSpan, 404);
                  }
                } else {
                  captureException(error, {
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
                  setHttpStatus(activeSpan, response.status);
                }
                if (rootSpan) {
                  setHttpStatus(rootSpan, response.status);
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

export { wrapRouteHandlerWithSentry };
//# sourceMappingURL=wrapRouteHandlerWithSentry.js.map
