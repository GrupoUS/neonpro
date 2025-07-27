import * as Sentry from '@sentry/nextjs';
import * as serverComponentModule from '__SENTRY_WRAPPING_TARGET_FILE__';
export * from '__SENTRY_WRAPPING_TARGET_FILE__';

/*
 * This file is a template for the code which will be substituted when our webpack loader handles middleware files.
 *
 * We use `__SENTRY_WRAPPING_TARGET_FILE__` as a placeholder for the path to the file being wrapped. Because it's not a real package,
 * this causes both TS and ESLint to complain, hence the pragma comments below.
 */


const userApiModule = serverComponentModule ;

// Default to undefined. It's possible for Next.js users to not define any exports/handlers in an API route. If that is
// the case Next.js wil crash during runtime but the Sentry SDK should definitely not crash so we need tohandle it.
let userProvidedNamedHandler = undefined;
let userProvidedDefaultHandler = undefined;

if ('middleware' in userApiModule && typeof userApiModule.middleware === 'function') {
  // Handle when user defines via named ESM export: `export { middleware };`
  userProvidedNamedHandler = userApiModule.middleware;
} else if ('default' in userApiModule && typeof userApiModule.default === 'function') {
  // Handle when user defines via ESM export: `export default myFunction;`
  userProvidedDefaultHandler = userApiModule.default;
} else if (typeof userApiModule === 'function') {
  // Handle when user defines via CJS export: "module.exports = myFunction;"
  userProvidedDefaultHandler = userApiModule;
}

const middleware = userProvidedNamedHandler
  ? Sentry.wrapMiddlewareWithSentry(userProvidedNamedHandler)
  : undefined;
const middlewareWrapperTemplate = userProvidedDefaultHandler ? Sentry.wrapMiddlewareWithSentry(userProvidedDefaultHandler) : undefined;

export { middlewareWrapperTemplate as default, middleware };
