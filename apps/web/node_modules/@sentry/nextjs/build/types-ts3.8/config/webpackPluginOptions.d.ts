import { SentryWebpackPluginOptions } from '@sentry/webpack-plugin';
import { BuildContext, SentryBuildOptions } from './types';
/**
 * Combine default and user-provided SentryWebpackPlugin options, accounting for whether we're building server files or
 * client files.
 */
export declare function getWebpackPluginOptions(buildContext: BuildContext, sentryBuildOptions: SentryBuildOptions): SentryWebpackPluginOptions;
//# sourceMappingURL=webpackPluginOptions.d.ts.map
