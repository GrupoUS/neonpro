import type App from 'next/app';
type AppGetInitialProps = (typeof App)['getInitialProps'];
/**
 * Create a wrapped version of the user's exported `getInitialProps` function in
 * a custom app ("_app.js").
 *
 * @param origAppGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapAppGetInitialPropsWithSentry(origAppGetInitialProps: AppGetInitialProps): AppGetInitialProps;
export {};
//# sourceMappingURL=wrapAppGetInitialPropsWithSentry.d.ts.map