var {
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');

const nextjsClientStackFrameNormalizationIntegration = core.defineIntegration(
  ({ assetPrefixPath }) => {
    const rewriteFramesInstance = core.rewriteFramesIntegration({
      // Turn `<origin>/<path>/_next/static/...` into `app:///_next/static/...`
      iteratee: frame => {
        try {
          const { origin } = new URL(frame.filename );
          frame.filename = _optionalChain([frame, 'access', _ => _.filename, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(origin, 'app://'), 'access', _4 => _4.replace, 'call', _5 => _5(assetPrefixPath, '')]);
        } catch (err) {
          // Filename wasn't a properly formed URL, so there's nothing we can do
        }

        // We need to URI-decode the filename because Next.js has wildcard routes like "/users/[id].js" which show up as "/users/%5id%5.js" in Error stacktraces.
        // The corresponding sources that Next.js generates have proper brackets so we also need proper brackets in the frame so that source map resolving works.
        if (frame.filename && frame.filename.startsWith('app:///_next')) {
          frame.filename = decodeURI(frame.filename);
        }

        if (
          frame.filename &&
          frame.filename.match(
            /^app:\/\/\/_next\/static\/chunks\/(main-|main-app-|polyfills-|webpack-|framework-|framework\.)[0-9a-f]+\.js$/,
          )
        ) {
          // We don't care about these frames. It's Next.js internal code.
          frame.in_app = false;
        }

        return frame;
      },
    });

    return {
      ...rewriteFramesInstance,
      name: 'NextjsClientStackFrameNormalization',
    };
  },
);

exports.nextjsClientStackFrameNormalizationIntegration = nextjsClientStackFrameNormalizationIntegration;
//# sourceMappingURL=clientNormalizationIntegration.js.map
