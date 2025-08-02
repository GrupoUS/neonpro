Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');

/**
 * Determines whether input is a Next.js not-found error.
 * https://beta.nextjs.org/docs/api-reference/notfound#notfound
 */
function isNotFoundNavigationError(subject) {
  return (
    core.isError(subject) &&
    ['NEXT_NOT_FOUND', 'NEXT_HTTP_ERROR_FALLBACK;404'].includes(
      (subject ).digest ,
    )
  );
}

/**
 * Determines whether input is a Next.js redirect error.
 * https://beta.nextjs.org/docs/api-reference/redirect#redirect
 */
function isRedirectNavigationError(subject) {
  return (
    core.isError(subject) &&
    typeof (subject ).digest === 'string' &&
    (subject ).digest.startsWith('NEXT_REDIRECT;') // a redirect digest looks like "NEXT_REDIRECT;[redirect path]"
  );
}

exports.isNotFoundNavigationError = isNotFoundNavigationError;
exports.isRedirectNavigationError = isRedirectNavigationError;
//# sourceMappingURL=nextNavigationErrorUtils.js.map
