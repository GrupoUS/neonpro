Object.defineProperty(exports, '__esModule', { value: true });

const isBuild = require('../utils/isBuild.js');
const wrapperUtils = require('../utils/wrapperUtils.js');

/**
 * Create a wrapped version of the user's exported `getInitialProps` function in
 * a custom document ("_document.js").
 *
 * @param origDocumentGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
function wrapDocumentGetInitialPropsWithSentry(
  origDocumentGetInitialProps,
) {
  return new Proxy(origDocumentGetInitialProps, {
    apply: async (wrappingTarget, thisArg, args) => {
      if (isBuild.isBuild()) {
        return wrappingTarget.apply(thisArg, args);
      }

      const [context] = args;
      const { req, res } = context;

      const errorWrappedGetInitialProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
      // Generally we can assume that `req` and `res` are always defined on the server:
      // https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#context-object
      // This does not seem to be the case in dev mode. Because we have no clean way of associating the the data fetcher
      // span with each other when there are no req or res objects, we simply do not trace them at all here.
      if (req && res) {
        const tracedGetInitialProps = wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetInitialProps, req, res, {
          dataFetcherRouteName: '/_document',
          requestedRouteName: context.pathname,
          dataFetchingMethodName: 'getInitialProps',
        });

        const { data } = await tracedGetInitialProps.apply(thisArg, args);
        return data;
      } else {
        return errorWrappedGetInitialProps.apply(thisArg, args);
      }
    },
  });
}

exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry;
//# sourceMappingURL=wrapDocumentGetInitialPropsWithSentry.js.map
