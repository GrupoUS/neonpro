Object.defineProperty(exports, '__esModule', { value: true });

const isBuild = require('../utils/isBuild.js');
const wrapperUtils = require('../utils/wrapperUtils.js');

/**
 * Create a wrapped version of the user's exported `getServerSideProps` function
 *
 * @param origGetServerSideProps The user's `getServerSideProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
function wrapGetServerSidePropsWithSentry(
  origGetServerSideProps,
  parameterizedRoute,
) {
  return new Proxy(origGetServerSideProps, {
    apply: async (wrappingTarget, thisArg, args) => {
      if (isBuild.isBuild()) {
        return wrappingTarget.apply(thisArg, args);
      }

      const [context] = args;
      const { req, res } = context;

      const errorWrappedGetServerSideProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
      const tracedGetServerSideProps = wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetServerSideProps, req, res, {
        dataFetcherRouteName: parameterizedRoute,
        requestedRouteName: parameterizedRoute,
        dataFetchingMethodName: 'getServerSideProps',
      });

      const {
        data: serverSideProps,
        baggage,
        sentryTrace,
      }

 = await (tracedGetServerSideProps.apply(thisArg, args) );

      if (typeof serverSideProps === 'object' && serverSideProps !== null && 'props' in serverSideProps) {
        // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
        if (sentryTrace) {
          (serverSideProps.props )._sentryTraceData = sentryTrace;
        }

        // The Next.js serializer throws on undefined values so we need to guard for it (#12102)
        if (baggage) {
          (serverSideProps.props )._sentryBaggage = baggage;
        }
      }

      return serverSideProps;
    },
  });
}

exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry;
//# sourceMappingURL=wrapGetServerSidePropsWithSentry.js.map
