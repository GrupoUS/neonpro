import type { NextPage } from 'next';
type GetInitialProps = Required<NextPage>['getInitialProps'];
/**
 * Create a wrapped version of the user's exported `getInitialProps` function
 *
 * @param origGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapGetInitialPropsWithSentry(origGetInitialProps: GetInitialProps): GetInitialProps;
export {};
//# sourceMappingURL=wrapGetInitialPropsWithSentry.d.ts.map