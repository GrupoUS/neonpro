Object.defineProperty(exports, '__esModule', { value: true });

const isBuild = require('../utils/isBuild.js');
const wrapperUtils = require('../utils/wrapperUtils.js');

/**
 * Create a wrapped version of the user's exported `getStaticProps` function
 *
 * @param origGetStaticProps The user's `getStaticProps` function
 * @param parameterizedRoute The page's parameterized route
 * @returns A wrapped version of the function
 */
function wrapGetStaticPropsWithSentry(
  origGetStaticPropsa,
  _parameterizedRoute,
) {
  return new Proxy(origGetStaticPropsa, {
    apply: async (wrappingTarget, thisArg, args) => {
      if (isBuild.isBuild()) {
        return wrappingTarget.apply(thisArg, args);
      }

      const errorWrappedGetStaticProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
      return wrapperUtils.callDataFetcherTraced(errorWrappedGetStaticProps, args);
    },
  });
}

exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry;
//# sourceMappingURL=wrapGetStaticPropsWithSentry.js.map
