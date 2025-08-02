var {
  _nullishCoalesce,
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const react = require('@sentry/react');

const INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME = 'incomplete-app-router-transaction';

/** Instruments the Next.js app router for pageloads. */
function appRouterInstrumentPageLoad(client) {
  react.startBrowserTracingPageLoadSpan(client, {
    name: react.WINDOW.location.pathname,
    // pageload should always start at timeOrigin (and needs to be in s, not ms)
    startTime: core.browserPerformanceTimeOrigin ? core.browserPerformanceTimeOrigin / 1000 : undefined,
    attributes: {
      [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'pageload',
      [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.pageload.nextjs.app_router_instrumentation',
      [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
    },
  });
}

// Yes, yes, I know we shouldn't depend on these internals. But that's where we are at. We write the ugly code, so you don't have to.
const GLOBAL_OBJ_WITH_NEXT_ROUTER = core.GLOBAL_OBJ

;

/*
 * The routing instrumentation needs to handle a few cases:
 * - Router operations:
 *  - router.push() (either explicitly called or implicitly through <Link /> tags)
 *  - router.replace() (either explicitly called or implicitly through <Link replace /> tags)
 *  - router.back()
 *  - router.forward()
 * - Browser operations:
 *  - native Browser-back / popstate event (implicitly called by router.back())
 *  - native Browser-forward / popstate event (implicitly called by router.forward())
 */

/** Instruments the Next.js app router for navigation. */
function appRouterInstrumentNavigation(client) {
  let currentNavigationSpan = undefined;

  react.WINDOW.addEventListener('popstate', () => {
    if (currentNavigationSpan && currentNavigationSpan.isRecording()) {
      currentNavigationSpan.updateName(react.WINDOW.location.pathname);
      currentNavigationSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'url');
    } else {
      currentNavigationSpan = react.startBrowserTracingNavigationSpan(client, {
        name: react.WINDOW.location.pathname,
        attributes: {
          [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
          [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.navigation.nextjs.app_router_instrumentation',
          [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
          'navigation.type': 'browser.popstate',
        },
      });
    }
  });

  let routerPatched = false;
  let triesToFindRouter = 0;
  const MAX_TRIES_TO_FIND_ROUTER = 500;
  const ROUTER_AVAILABILITY_CHECK_INTERVAL_MS = 20;
  const checkForRouterAvailabilityInterval = setInterval(() => {
    triesToFindRouter++;
    const router = _nullishCoalesce(_optionalChain([GLOBAL_OBJ_WITH_NEXT_ROUTER, 'optionalAccess', _ => _.next, 'optionalAccess', _2 => _2.router]), () => ( _optionalChain([GLOBAL_OBJ_WITH_NEXT_ROUTER, 'optionalAccess', _3 => _3.nd, 'optionalAccess', _4 => _4.router])));

    if (routerPatched || triesToFindRouter > MAX_TRIES_TO_FIND_ROUTER) {
      clearInterval(checkForRouterAvailabilityInterval);
    } else if (router) {
      clearInterval(checkForRouterAvailabilityInterval);
      routerPatched = true;
      (['back', 'forward', 'push', 'replace'] ).forEach(routerFunctionName => {
        if (_optionalChain([router, 'optionalAccess', _5 => _5[routerFunctionName]])) {
          // @ts-expect-error Weird type error related to not knowing how to associate return values with the individual functions - we can just ignore
          router[routerFunctionName] = new Proxy(router[routerFunctionName], {
            apply(target, thisArg, argArray) {
              const span = react.startBrowserTracingNavigationSpan(client, {
                name: INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME,
                attributes: {
                  [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
                  [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.navigation.nextjs.app_router_instrumentation',
                  [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
                },
              });

              currentNavigationSpan = span;

              if (routerFunctionName === 'push') {
                _optionalChain([span, 'optionalAccess', _6 => _6.updateName, 'call', _7 => _7(transactionNameifyRouterArgument(argArray[0]))]);
                _optionalChain([span, 'optionalAccess', _8 => _8.setAttribute, 'call', _9 => _9(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'url')]);
                _optionalChain([span, 'optionalAccess', _10 => _10.setAttribute, 'call', _11 => _11('navigation.type', 'router.push')]);
              } else if (routerFunctionName === 'replace') {
                _optionalChain([span, 'optionalAccess', _12 => _12.updateName, 'call', _13 => _13(transactionNameifyRouterArgument(argArray[0]))]);
                _optionalChain([span, 'optionalAccess', _14 => _14.setAttribute, 'call', _15 => _15(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'url')]);
                _optionalChain([span, 'optionalAccess', _16 => _16.setAttribute, 'call', _17 => _17('navigation.type', 'router.replace')]);
              } else if (routerFunctionName === 'back') {
                _optionalChain([span, 'optionalAccess', _18 => _18.setAttribute, 'call', _19 => _19('navigation.type', 'router.back')]);
              } else if (routerFunctionName === 'forward') {
                _optionalChain([span, 'optionalAccess', _20 => _20.setAttribute, 'call', _21 => _21('navigation.type', 'router.forward')]);
              }

              return target.apply(thisArg, argArray);
            },
          });
        }
      });
    }
  }, ROUTER_AVAILABILITY_CHECK_INTERVAL_MS);
}

function transactionNameifyRouterArgument(target) {
  try {
    // We provide an arbitrary base because we only care about the pathname and it makes URL parsing more resilient.
    return new URL(target, 'http://example.com/').pathname;
  } catch (e) {
    return '/';
  }
}

exports.INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME = INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME;
exports.appRouterInstrumentNavigation = appRouterInstrumentNavigation;
exports.appRouterInstrumentPageLoad = appRouterInstrumentPageLoad;
//# sourceMappingURL=appRouterRoutingInstrumentation.js.map
