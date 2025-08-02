import { _optionalChain } from '@sentry/core';
import { parseBaggageHeader, browserPerformanceTimeOrigin, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, stripUrlQueryAndFragment, logger } from '@sentry/core';
import { startBrowserTracingPageLoadSpan, startBrowserTracingNavigationSpan, WINDOW } from '@sentry/react';
import RouterImport from 'next/router';
import { DEBUG_BUILD } from '../../common/debug-build.js';

// next/router v10 is CJS
//
// For ESM/CJS interoperability 'reasons', depending on how this file is loaded, Router might be on the default export
const Router = RouterImport.events
  ? RouterImport
  : (RouterImport ).default;

const globalObject = WINDOW

;

/**
 * Describes data located in the __NEXT_DATA__ script tag. This tag is present on every page of a Next.js app.
 */

/**
 * Every Next.js page (static and dynamic ones) comes with a script tag with the id "__NEXT_DATA__". This script tag
 * contains a JSON object with data that was either generated at build time for static pages (`getStaticProps`), or at
 * runtime with data fetchers like `getServerSideProps.`.
 *
 * We can use this information to:
 * - Always get the parameterized route we're in when loading a page.
 * - Send trace information (trace-id, baggage) from the server to the client.
 *
 * This function extracts this information.
 */
function extractNextDataTagInformation() {
  let nextData;
  // Let's be on the safe side and actually check first if there is really a __NEXT_DATA__ script tag on the page.
  // Theoretically this should always be the case though.
  const nextDataTag = globalObject.document.getElementById('__NEXT_DATA__');
  if (nextDataTag && nextDataTag.innerHTML) {
    try {
      nextData = JSON.parse(nextDataTag.innerHTML);
    } catch (e) {
      DEBUG_BUILD && logger.warn('Could not extract __NEXT_DATA__');
    }
  }

  if (!nextData) {
    return {};
  }

  const nextDataTagInfo = {};

  const { page, query, props } = nextData;

  // `nextData.page` always contains the parameterized route - except for when an error occurs in a data fetching
  // function, then it is "/_error", but that isn't a problem since users know which route threw by looking at the
  // parent transaction
  // TODO: Actually this is a problem (even though it is not that big), because the DSC and the transaction payload will contain
  // a different transaction name. Maybe we can fix this. Idea: Also send transaction name via pageProps when available.
  nextDataTagInfo.route = page;
  nextDataTagInfo.params = query;

  if (props && props.pageProps) {
    nextDataTagInfo.sentryTrace = props.pageProps._sentryTraceData;
    nextDataTagInfo.baggage = props.pageProps._sentryBaggage;
  }

  return nextDataTagInfo;
}

/**
 * Instruments the Next.js pages router for pageloads.
 * Only supported for client side routing. Works for Next >= 10.
 *
 * Leverages the SingletonRouter from the `next/router` to
 * generate pageload/navigation transactions and parameterize
 * transaction names.
 */
function pagesRouterInstrumentPageLoad(client) {
  const { route, params, sentryTrace, baggage } = extractNextDataTagInformation();
  const parsedBaggage = parseBaggageHeader(baggage);
  let name = route || globalObject.location.pathname;

  // /_error is the fallback page for all errors. If there is a transaction name for /_error, use that instead
  if (parsedBaggage && parsedBaggage['sentry-transaction'] && name === '/_error') {
    name = parsedBaggage['sentry-transaction'];
    // Strip any HTTP method from the span name
    name = name.replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|TRACE|CONNECT)\s+/i, '');
  }

  startBrowserTracingPageLoadSpan(
    client,
    {
      name,
      // pageload should always start at timeOrigin (and needs to be in s, not ms)
      startTime: browserPerformanceTimeOrigin ? browserPerformanceTimeOrigin / 1000 : undefined,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'pageload',
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.pageload.nextjs.pages_router_instrumentation',
        [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: route ? 'route' : 'url',
        ...(params && client.getOptions().sendDefaultPii && { ...params }),
      },
    },
    { sentryTrace, baggage },
  );
}

/**
 * Instruments the Next.js pages router for navigation.
 * Only supported for client side routing. Works for Next >= 10.
 *
 * Leverages the SingletonRouter from the `next/router` to
 * generate pageload/navigation transactions and parameterize
 * transaction names.
 */
function pagesRouterInstrumentNavigation(client) {
  Router.events.on('routeChangeStart', (navigationTarget) => {
    const strippedNavigationTarget = stripUrlQueryAndFragment(navigationTarget);
    const matchedRoute = getNextRouteFromPathname(strippedNavigationTarget);

    let newLocation;
    let spanSource;

    if (matchedRoute) {
      newLocation = matchedRoute;
      spanSource = 'route';
    } else {
      newLocation = strippedNavigationTarget;
      spanSource = 'url';
    }

    startBrowserTracingNavigationSpan(client, {
      name: newLocation,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.navigation.nextjs.pages_router_instrumentation',
        [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: spanSource,
      },
    });
  });
}

function getNextRouteFromPathname(pathname) {
  const pageRoutes = (globalObject.__BUILD_MANIFEST || {}).sortedPages;

  // Page route should in 99.999% of the cases be defined by now but just to be sure we make a check here
  if (!pageRoutes) {
    return;
  }

  return pageRoutes.find(route => {
    const routeRegExp = convertNextRouteToRegExp(route);
    return pathname.match(routeRegExp);
  });
}

/**
 * Converts a Next.js style route to a regular expression that matches on pathnames (no query params or URL fragments).
 *
 * In general this involves replacing any instances of square brackets in a route with a wildcard:
 * e.g. "/users/[id]/info" becomes /\/users\/([^/]+?)\/info/
 *
 * Some additional edgecases need to be considered:
 * - All routes have an optional slash at the end, meaning users can navigate to "/users/[id]/info" or
 *   "/users/[id]/info/" - both will be resolved to "/users/[id]/info".
 * - Non-optional "catchall"s at the end of a route must be considered when matching (e.g. "/users/[...params]").
 * - Optional "catchall"s at the end of a route must be considered when matching (e.g. "/users/[[...params]]").
 *
 * @param route A Next.js style route as it is found in `global.__BUILD_MANIFEST.sortedPages`
 */
function convertNextRouteToRegExp(route) {
  // We can assume a route is at least "/".
  const routeParts = route.split('/');

  let optionalCatchallWildcardRegex = '';
  if (_optionalChain([routeParts, 'access', _ => _[routeParts.length - 1], 'optionalAccess', _2 => _2.match, 'call', _3 => _3(/^\[\[\.\.\..+\]\]$/)])) {
    // If last route part has pattern "[[...xyz]]" we pop the latest route part to get rid of the required trailing
    // slash that would come before it if we didn't pop it.
    routeParts.pop();
    optionalCatchallWildcardRegex = '(?:/(.+?))?';
  }

  const rejoinedRouteParts = routeParts
    .map(
      routePart =>
        routePart
          .replace(/^\[\.\.\..+\]$/, '(.+?)') // Replace catch all wildcard with regex wildcard
          .replace(/^\[.*\]$/, '([^/]+?)'), // Replace route wildcards with lazy regex wildcards
    )
    .join('/');

  // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- routeParts are from the build manifest, so no raw user input
  return new RegExp(
    `^${rejoinedRouteParts}${optionalCatchallWildcardRegex}(?:/)?$`, // optional slash at the end
  );
}

export { pagesRouterInstrumentNavigation, pagesRouterInstrumentPageLoad };
//# sourceMappingURL=pagesRouterRoutingInstrumentation.js.map
