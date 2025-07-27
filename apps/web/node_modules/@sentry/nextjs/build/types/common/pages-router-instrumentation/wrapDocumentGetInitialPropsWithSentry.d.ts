import type Document from 'next/document';
type DocumentGetInitialProps = typeof Document.getInitialProps;
/**
 * Create a wrapped version of the user's exported `getInitialProps` function in
 * a custom document ("_document.js").
 *
 * @param origDocumentGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
export declare function wrapDocumentGetInitialPropsWithSentry(origDocumentGetInitialProps: DocumentGetInitialProps): DocumentGetInitialProps;
export {};
//# sourceMappingURL=wrapDocumentGetInitialPropsWithSentry.d.ts.map