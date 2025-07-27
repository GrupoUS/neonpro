import type { GetStaticProps } from 'next';
type Props = {
    [key: string]: unknown;
};
/**
 * Create a wrapped version of the user's exported `getStaticProps` function
 *
 * @param origGetStaticProps The user's `getStaticProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapGetStaticPropsWithSentry(origGetStaticPropsa: GetStaticProps<Props>, _parameterizedRoute: string): GetStaticProps<Props>;
export {};
//# sourceMappingURL=wrapGetStaticPropsWithSentry.d.ts.map