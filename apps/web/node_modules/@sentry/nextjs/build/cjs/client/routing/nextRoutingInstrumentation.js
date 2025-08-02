Object.defineProperty(exports, '__esModule', { value: true });

const react = require('@sentry/react');
const appRouterRoutingInstrumentation = require('./appRouterRoutingInstrumentation.js');
const pagesRouterRoutingInstrumentation = require('./pagesRouterRoutingInstrumentation.js');

/**
 * Instruments the Next.js Client Router for page loads.
 */
function nextRouterInstrumentPageLoad(client) {
  const isAppRouter = !react.WINDOW.document.getElementById('__NEXT_DATA__');
  if (isAppRouter) {
    appRouterRoutingInstrumentation.appRouterInstrumentPageLoad(client);
  } else {
    pagesRouterRoutingInstrumentation.pagesRouterInstrumentPageLoad(client);
  }
}

/**
 * Instruments the Next.js Client Router for navigation.
 */
function nextRouterInstrumentNavigation(client) {
  const isAppRouter = !react.WINDOW.document.getElementById('__NEXT_DATA__');
  if (isAppRouter) {
    appRouterRoutingInstrumentation.appRouterInstrumentNavigation(client);
  } else {
    pagesRouterRoutingInstrumentation.pagesRouterInstrumentNavigation(client);
  }
}

exports.nextRouterInstrumentNavigation = nextRouterInstrumentNavigation;
exports.nextRouterInstrumentPageLoad = nextRouterInstrumentPageLoad;
//# sourceMappingURL=nextRoutingInstrumentation.js.map
