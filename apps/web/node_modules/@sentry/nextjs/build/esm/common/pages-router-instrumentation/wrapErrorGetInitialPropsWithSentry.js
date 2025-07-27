import { isBuild } from '../utils/isBuild.js';
import { withTracedServerSideDataFetcher, withErrorInstrumentation } from '../utils/wrapperUtils.js';

/**
 * Create a wrapped version of the user's exported `getInitialProps` function in
 * a custom error page ("_error.js").
 *
 * @param origErrorGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
function wrapErrorGetInitialPropsWithSentry(
  origErrorGetInitialProps,
) {
  return new Proxy(origErrorGetInitialProps, {
    apply: async (wrappingTarget, thisArg, args) => {
      if (isBuild()) {
        return wrappingTarget.apply(thisArg, args);
      }

      const [context] = args;
      const { req, res } = context;

      const errorWrappedGetInitialProps = withErrorInstrumentation(wrappingTarget);
      // Generally we can assume that `req` and `res` are always defined on the server:
      // https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#context-object
      // This does not seem to be the case in dev mode. Because we have no clean way of associating the the data fetcher
      // span with each other when there are no req or res objects, we simply do not trace them at all here.
      if (req && res) {
        const tracedGetInitialProps = withTracedServerSideDataFetcher(errorWrappedGetInitialProps, req, res, {
          dataFetcherRouteName: '/_error',
          requestedRouteName: context.pathname,
          dataFetchingMethodName: 'getInitialProps',
        });

        const {
          data: errorGetInitialProps,
          baggage,
          sentryTrace,
        }

 = await tracedGetInitialProps.apply(thisArg, args);

        if (typeof errorGetInitialProps === 'object' && errorGetInitialProps !== null) {
          if (sentryTrace) {
            // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
            (errorGetInitialProps )._sentryTraceData = sentryTrace;
          }

          // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
          if (baggage) {
            (errorGetInitialProps )._sentryBaggage = baggage;
          }
        }

        return errorGetInitialProps;
      } else {
        return errorWrappedGetInitialProps.apply(thisArg, args);
      }
    },
  });
}

export { wrapErrorGetInitialPropsWithSentry };
//# sourceMappingURL=wrapErrorGetInitialPropsWithSentry.js.map
