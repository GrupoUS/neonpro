import { _optionalChain } from '@sentry/core';
import * as Sentry from '@sentry/nextjs';
import * as origModule from '__SENTRY_NEXTJS_REQUEST_ASYNC_STORAGE_SHIM__';
import * as serverComponentModule from '__SENTRY_WRAPPING_TARGET_FILE__';
export * from '__SENTRY_WRAPPING_TARGET_FILE__';
export { default } from '__SENTRY_WRAPPING_TARGET_FILE__';

const asyncStorageModule = { ...origModule } ;

const requestAsyncStorage =
  'workUnitAsyncStorage' in asyncStorageModule
    ? asyncStorageModule.workUnitAsyncStorage
    : 'requestAsyncStorage' in asyncStorageModule
      ? asyncStorageModule.requestAsyncStorage
      : undefined;

function wrapHandler(handler, method) {
  // Running the instrumentation code during the build phase will mark any function as "dynamic" because we're accessing
  // the Request object. We do not want to turn handlers dynamic so we skip instrumentation in the build phase.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return handler;
  }

  if (typeof handler !== 'function') {
    return handler;
  }

  return new Proxy(handler, {
    apply: (originalFunction, thisArg, args) => {
      let headers = undefined;

      // We try-catch here just in case the API around `requestAsyncStorage` changes unexpectedly since it is not public API
      try {
        const requestAsyncStore = _optionalChain([requestAsyncStorage, 'optionalAccess', _ => _.getStore, 'call', _2 => _2()]) ;
        headers = _optionalChain([requestAsyncStore, 'optionalAccess', _3 => _3.headers]);
      } catch (e) {
        /** empty */
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Sentry.wrapRouteHandlerWithSentry(originalFunction , {
        method,
        parameterizedRoute: '__ROUTE__',
        headers,
      }).apply(thisArg, args);
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const GET = wrapHandler(serverComponentModule.GET , 'GET');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const POST = wrapHandler(serverComponentModule.POST , 'POST');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const PUT = wrapHandler(serverComponentModule.PUT , 'PUT');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const PATCH = wrapHandler(serverComponentModule.PATCH , 'PATCH');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const DELETE = wrapHandler(serverComponentModule.DELETE , 'DELETE');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const HEAD = wrapHandler(serverComponentModule.HEAD , 'HEAD');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const OPTIONS = wrapHandler(serverComponentModule.OPTIONS , 'OPTIONS');

export { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT };
