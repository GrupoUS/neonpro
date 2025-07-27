import type { NextPageContext } from 'next';
import type { ErrorProps } from 'next/error';
type ErrorGetInitialProps = (context: NextPageContext) => Promise<ErrorProps>;
/**
 * Create a wrapped version of the user's exported `getInitialProps` function in
 * a custom error page ("_error.js").
 *
 * @param origErrorGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapErrorGetInitialPropsWithSentry(origErrorGetInitialProps: ErrorGetInitialProps): ErrorGetInitialProps;
export {};
//# sourceMappingURL=wrapErrorGetInitialPropsWithSentry.d.ts.map