import { _nullishCoalesce, _optionalChain } from '@sentry/core';
import * as Sentry from '@sentry/nextjs';
import * as origModule from '__SENTRY_NEXTJS_REQUEST_ASYNC_STORAGE_SHIM__';
import * as serverComponentModule from '__SENTRY_WRAPPING_TARGET_FILE__';
export * from '__SENTRY_WRAPPING_TARGET_FILE__';

const asyncStorageModule = { ...origModule } ;

const requestAsyncStorage =
  'workUnitAsyncStorage' in asyncStorageModule
    ? asyncStorageModule.workUnitAsyncStorage
    : 'requestAsyncStorage' in asyncStorageModule
      ? asyncStorageModule.requestAsyncStorage
      : undefined;

const serverComponent = serverComponentModule.default;

let wrappedServerComponent;
if (typeof serverComponent === 'function') {
  // For some odd Next.js magic reason, `headers()` will not work if used inside `wrapServerComponentsWithSentry`.
  // Current assumption is that Next.js applies some loader magic to userfiles, but not files in node_modules. This file
  // is technically a userfile so it gets the loader magic applied.
  wrappedServerComponent = new Proxy(serverComponent, {
    apply: (originalFunction, thisArg, args) => {
      let sentryTraceHeader = undefined;
      let baggageHeader = undefined;
      let headers = undefined;

      // We try-catch here just in `requestAsyncStorage` is undefined since it may not be defined
      try {
        const requestAsyncStore = _optionalChain([requestAsyncStorage, 'optionalAccess', _ => _.getStore, 'call', _2 => _2()]) ;
        sentryTraceHeader = _nullishCoalesce(_optionalChain([requestAsyncStore, 'optionalAccess', _3 => _3.headers, 'access', _4 => _4.get, 'call', _5 => _5('sentry-trace')]), () => ( undefined));
        baggageHeader = _nullishCoalesce(_optionalChain([requestAsyncStore, 'optionalAccess', _6 => _6.headers, 'access', _7 => _7.get, 'call', _8 => _8('baggage')]), () => ( undefined));
        headers = _optionalChain([requestAsyncStore, 'optionalAccess', _9 => _9.headers]);
      } catch (e) {
        /** empty */
      }

      return Sentry.wrapServerComponentWithSentry(originalFunction, {
        componentRoute: '__ROUTE__',
        componentType: '__COMPONENT_TYPE__',
        sentryTraceHeader,
        baggageHeader,
        headers,
      }).apply(thisArg, args);
    },
  });
} else {
  wrappedServerComponent = serverComponent;
}

const generateMetadata = serverComponentModule.generateMetadata
  ? Sentry.wrapGenerationFunctionWithSentry(serverComponentModule.generateMetadata, {
      componentRoute: '__ROUTE__',
      componentType: '__COMPONENT_TYPE__',
      generationFunctionIdentifier: 'generateMetadata',
      requestAsyncStorage,
    })
  : undefined;

const generateImageMetadata = serverComponentModule.generateImageMetadata
  ? Sentry.wrapGenerationFunctionWithSentry(serverComponentModule.generateImageMetadata, {
      componentRoute: '__ROUTE__',
      componentType: '__COMPONENT_TYPE__',
      generationFunctionIdentifier: 'generateImageMetadata',
      requestAsyncStorage,
    })
  : undefined;

const generateViewport = serverComponentModule.generateViewport
  ? Sentry.wrapGenerationFunctionWithSentry(serverComponentModule.generateViewport, {
      componentRoute: '__ROUTE__',
      componentType: '__COMPONENT_TYPE__',
      generationFunctionIdentifier: 'generateViewport',
      requestAsyncStorage,
    })
  : undefined;

const wrappedServerComponent$1 = wrappedServerComponent;

export { wrappedServerComponent$1 as default, generateImageMetadata, generateMetadata, generateViewport };
