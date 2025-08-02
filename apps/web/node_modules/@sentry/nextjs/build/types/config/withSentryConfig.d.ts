import type { SentryBuildOptions } from './types';
/**
 * Modifies the passed in Next.js configuration with automatic build-time instrumentation and source map upload.
 *
 * @param nextConfig A Next.js configuration object, as usually exported in `next.config.js` or `next.config.mjs`.
 * @param sentryBuildOptions Additional options to configure instrumentation and
 * @returns The modified config to be exported
 */
export declare function withSentryConfig<C>(nextConfig?: C, sentryBuildOptions?: SentryBuildOptions): C;
//# sourceMappingURL=withSentryConfig.d.ts.map