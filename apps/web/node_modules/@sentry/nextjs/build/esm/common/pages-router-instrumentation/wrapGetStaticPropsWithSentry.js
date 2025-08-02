import { isBuild } from '../utils/isBuild.js';
import { callDataFetcherTraced, withErrorInstrumentation } from '../utils/wrapperUtils.js';

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
      if (isBuild()) {
        return wrappingTarget.apply(thisArg, args);
      }

      const errorWrappedGetStaticProps = withErrorInstrumentation(wrappingTarget);
      return callDataFetcherTraced(errorWrappedGetStaticProps, args);
    },
  });
}

export { wrapGetStaticPropsWithSentry };
//# sourceMappingURL=wrapGetStaticPropsWithSentry.js.map
