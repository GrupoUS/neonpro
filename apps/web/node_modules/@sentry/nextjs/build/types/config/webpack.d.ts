import type { NextConfigObject, SentryBuildOptions, WebpackConfigFunction } from './types';
/**
 * Construct the function which will be used as the nextjs config's `webpack` value.
 *
 * Sets:
 *   - `devtool`, to ensure high-quality sourcemaps are generated
 *   - `entry`, to include user's sentry config files (where `Sentry.init` is called) in the build
 *   - `plugins`, to add SentryWebpackPlugin
 *
 * @param userNextConfig The user's existing nextjs config, as passed to `withSentryConfig`
 * @param userSentryOptions The user's SentryWebpackPlugin config, as passed to `withSentryConfig`
 * @returns The function to set as the nextjs config's `webpack` value
 */
export declare function constructWebpackConfigFunction(userNextConfig?: NextConfigObject, userSentryOptions?: SentryBuildOptions): WebpackConfigFunction;
/**
 * Searches for a `sentry.client.config.ts|js` file and returns its file name if it finds one. (ts being prioritized)
 *
 * @param projectDir The root directory of the project, where config files would be located
 */
export declare function getClientSentryConfigFile(projectDir: string): string | void;
//# sourceMappingURL=webpack.d.ts.map