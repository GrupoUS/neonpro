import type { NextApiRequest } from 'next';
import type { NextApiHandler } from '../types';
export type AugmentedNextApiRequest = NextApiRequest & {
    __withSentry_applied__?: boolean;
};
/**
 * Wrap the given API route handler with error nad performance monitoring.
 *
 * @param apiHandler The handler exported from the user's API page route file, which may or may not already be
 * wrapped with `withSentry`
 * @param parameterizedRoute The page's parameterized route.
 * @returns The wrapped handler which will always return a Promise.
 */
export declare function wrapApiHandlerWithSentry(apiHandler: NextApiHandler, parameterizedRoute: string): NextApiHandler;
//# sourceMappingURL=wrapApiHandlerWithSentry.d.ts.map