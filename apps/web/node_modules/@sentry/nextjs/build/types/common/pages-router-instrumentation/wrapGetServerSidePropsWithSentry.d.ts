import type { GetServerSideProps } from 'next';
/**
 * Create a wrapped version of the user's exported `getServerSideProps` function
 *
 * @param origGetServerSideProps The user's `getServerSideProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapGetServerSidePropsWithSentry(origGetServerSideProps: GetServerSideProps, parameterizedRoute: string): GetServerSideProps;
//# sourceMappingURL=wrapGetServerSidePropsWithSentry.d.ts.map