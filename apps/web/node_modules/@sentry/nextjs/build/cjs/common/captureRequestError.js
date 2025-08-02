Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');

/**
 * Reports errors passed to the the Next.js `onRequestError` instrumentation hook.
 */
function captureRequestError(error, request, errorContext) {
  core.withScope(scope => {
    scope.setSDKProcessingMetadata({
      normalizedRequest: {
        headers: core.headersToDict(request.headers),
        method: request.method,
      } ,
    });

    scope.setContext('nextjs', {
      request_path: request.path,
      router_kind: errorContext.routerKind,
      router_path: errorContext.routePath,
      route_type: errorContext.routeType,
    });

    scope.setTransactionName(errorContext.routePath);

    core.captureException(error, {
      mechanism: {
        handled: false,
      },
    });
  });
}

/**
 * Reports errors passed to the the Next.js `onRequestError` instrumentation hook.
 *
 * @deprecated Use `captureRequestError` instead.
 */
// TODO(v9): Remove this export
const experimental_captureRequestError = captureRequestError;

exports.captureRequestError = captureRequestError;
exports.experimental_captureRequestError = experimental_captureRequestError;
//# sourceMappingURL=captureRequestError.js.map
