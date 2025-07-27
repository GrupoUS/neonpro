import type { Client } from '@sentry/core';
/**
 * Instruments the Next.js pages router for pageloads.
 * Only supported for client side routing. Works for Next >= 10.
 *
 * Leverages the SingletonRouter from the `next/router` to
 * generate pageload/navigation transactions and parameterize
 * transaction names.
 */
export declare function pagesRouterInstrumentPageLoad(client: Client): void;
/**
 * Instruments the Next.js pages router for navigation.
 * Only supported for client side routing. Works for Next >= 10.
 *
 * Leverages the SingletonRouter from the `next/router` to
 * generate pageload/navigation transactions and parameterize
 * transaction names.
 */
export declare function pagesRouterInstrumentNavigation(client: Client): void;
//# sourceMappingURL=pagesRouterRoutingInstrumentation.d.ts.map