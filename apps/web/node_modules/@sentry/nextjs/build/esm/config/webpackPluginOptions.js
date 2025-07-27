import { _nullishCoalesce, _optionalChain } from '@sentry/core';
import * as path from 'path';
import { getSentryRelease } from '@sentry/node';

/**
 * Combine default and user-provided SentryWebpackPlugin options, accounting for whether we're building server files or
 * client files.
 */
function getWebpackPluginOptions(
  buildContext,
  sentryBuildOptions,
) {
  const { buildId, isServer, config: userNextConfig, dir, nextRuntime } = buildContext;

  const prefixInsert = !isServer ? 'Client' : nextRuntime === 'edge' ? 'Edge' : 'Node.js';

  // We need to convert paths to posix because Glob patterns use `\` to escape
  // glob characters. This clashes with Windows path separators.
  // See: https://www.npmjs.com/package/glob
  const projectDir = dir.replace(/\\/g, '/');
  // `.next` is the default directory
  const distDir = _nullishCoalesce(_optionalChain([(userNextConfig ), 'access', _ => _.distDir, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/\\/g, '/')]), () => ( '.next'));
  const distDirAbsPath = path.posix.join(projectDir, distDir);

  let sourcemapUploadAssets = [];
  const sourcemapUploadIgnore = [];

  if (isServer) {
    sourcemapUploadAssets.push(
      path.posix.join(distDirAbsPath, 'server', '**'), // This is normally where Next.js outputs things
      path.posix.join(distDirAbsPath, 'serverless', '**'), // This was the output location for serverless Next.js
    );
  } else {
    if (sentryBuildOptions.widenClientFileUpload) {
      sourcemapUploadAssets.push(path.posix.join(distDirAbsPath, 'static', 'chunks', '**'));
    } else {
      sourcemapUploadAssets.push(
        path.posix.join(distDirAbsPath, 'static', 'chunks', 'pages', '**'),
        path.posix.join(distDirAbsPath, 'static', 'chunks', 'app', '**'),
      );
    }

    // TODO: We should think about uploading these when `widenClientFileUpload` is `true`. They may be useful in some situations.
    sourcemapUploadIgnore.push(
      path.posix.join(distDirAbsPath, 'static', 'chunks', 'framework-*'),
      path.posix.join(distDirAbsPath, 'static', 'chunks', 'framework.*'),
      path.posix.join(distDirAbsPath, 'static', 'chunks', 'main-*'),
      path.posix.join(distDirAbsPath, 'static', 'chunks', 'polyfills-*'),
      path.posix.join(distDirAbsPath, 'static', 'chunks', 'webpack-*'),
    );
  }

  if (_optionalChain([sentryBuildOptions, 'access', _4 => _4.sourcemaps, 'optionalAccess', _5 => _5.disable])) {
    sourcemapUploadAssets = [];
  }

  return {
    authToken: sentryBuildOptions.authToken,
    headers: sentryBuildOptions.headers,
    org: sentryBuildOptions.org,
    project: sentryBuildOptions.project,
    telemetry: sentryBuildOptions.telemetry,
    debug: sentryBuildOptions.debug,
    reactComponentAnnotation: {
      ...sentryBuildOptions.reactComponentAnnotation,
      ..._optionalChain([sentryBuildOptions, 'access', _6 => _6.unstable_sentryWebpackPluginOptions, 'optionalAccess', _7 => _7.reactComponentAnnotation]),
    },
    silent: sentryBuildOptions.silent,
    url: sentryBuildOptions.sentryUrl,
    sourcemaps: {
      rewriteSources(source) {
        if (source.startsWith('webpack://_N_E/')) {
          return source.replace('webpack://_N_E/', '');
        } else if (source.startsWith('webpack://')) {
          return source.replace('webpack://', '');
        } else {
          return source;
        }
      },
      assets: _nullishCoalesce(_optionalChain([sentryBuildOptions, 'access', _8 => _8.sourcemaps, 'optionalAccess', _9 => _9.assets]), () => ( sourcemapUploadAssets)),
      ignore: _nullishCoalesce(_optionalChain([sentryBuildOptions, 'access', _10 => _10.sourcemaps, 'optionalAccess', _11 => _11.ignore]), () => ( sourcemapUploadIgnore)),
      filesToDeleteAfterUpload: _optionalChain([sentryBuildOptions, 'access', _12 => _12.sourcemaps, 'optionalAccess', _13 => _13.deleteSourcemapsAfterUpload])
        ? [
            // We only care to delete client bundle source maps because they would be the ones being served.
            // Removing the server source maps crashes Vercel builds for (thus far) unknown reasons:
            // https://github.com/getsentry/sentry-javascript/issues/13099
            path.posix.join(distDirAbsPath, 'static', '**', '*.js.map'),
            path.posix.join(distDirAbsPath, 'static', '**', '*.mjs.map'),
            path.posix.join(distDirAbsPath, 'static', '**', '*.cjs.map'),
          ]
        : undefined,
      ..._optionalChain([sentryBuildOptions, 'access', _14 => _14.unstable_sentryWebpackPluginOptions, 'optionalAccess', _15 => _15.sourcemaps]),
    },
    release: {
      inject: false, // The webpack plugin's release injection breaks the `app` directory - we inject the release manually with the value injection loader instead.
      name: _nullishCoalesce(_optionalChain([sentryBuildOptions, 'access', _16 => _16.release, 'optionalAccess', _17 => _17.name]), () => ( getSentryRelease(buildId))),
      create: _optionalChain([sentryBuildOptions, 'access', _18 => _18.release, 'optionalAccess', _19 => _19.create]),
      finalize: _optionalChain([sentryBuildOptions, 'access', _20 => _20.release, 'optionalAccess', _21 => _21.finalize]),
      dist: _optionalChain([sentryBuildOptions, 'access', _22 => _22.release, 'optionalAccess', _23 => _23.dist]),
      vcsRemote: _optionalChain([sentryBuildOptions, 'access', _24 => _24.release, 'optionalAccess', _25 => _25.vcsRemote]),
      setCommits: _optionalChain([sentryBuildOptions, 'access', _26 => _26.release, 'optionalAccess', _27 => _27.setCommits]),
      deploy: _optionalChain([sentryBuildOptions, 'access', _28 => _28.release, 'optionalAccess', _29 => _29.deploy]),
      ..._optionalChain([sentryBuildOptions, 'access', _30 => _30.unstable_sentryWebpackPluginOptions, 'optionalAccess', _31 => _31.release]),
    },
    bundleSizeOptimizations: {
      ...sentryBuildOptions.bundleSizeOptimizations,
    },
    _metaOptions: {
      loggerPrefixOverride: `[@sentry/nextjs - ${prefixInsert}]`,
      telemetry: {
        metaFramework: 'nextjs',
      },
    },
    ...sentryBuildOptions.unstable_sentryWebpackPluginOptions,
  };
}

export { getWebpackPluginOptions };
//# sourceMappingURL=webpackPluginOptions.js.map
