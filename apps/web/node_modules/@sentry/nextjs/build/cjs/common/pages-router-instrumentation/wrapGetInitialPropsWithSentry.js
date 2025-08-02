var {
  _asyncNullishCoalesce
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const isBuild = require('../utils/isBuild.js');
const wrapperUtils = require('../utils/wrapperUtils.js');

/**
 * Create a wrapped version of the user's exported `getInitialProps` function
 *
 * @param origGetInitialProps The user's `getInitialProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
function wrapGetInitialPropsWithSentry(origGetInitialProps) {
  return new Proxy(origGetInitialProps, {
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
          dataFetcherRouteName: context.pathname,
          requestedRouteName: context.pathname,
          dataFetchingMethodName: 'getInitialProps',
        });

        const {
          data: initialProps,
          baggage,
          sentryTrace,
        }

 = await _asyncNullishCoalesce((await tracedGetInitialProps.apply(thisArg, args)), async () => ( {})); // Next.js allows undefined to be returned from a getInitialPropsFunction.

        if (typeof initialProps === 'object' && initialProps !== null) {
          // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
          if (sentryTrace) {
            (initialProps )._sentryTraceData = sentryTrace;
          }

          // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
          if (baggage) {
            (initialProps )._sentryBaggage = baggage;
          }
        }

        return initialProps;
      } else {
        return errorWrappedGetInitialProps.apply(thisArg, args);
      }
    },
  });
}

exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry;
//# sourceMappingURL=wrapGetInitialPropsWithSentry.js.map
