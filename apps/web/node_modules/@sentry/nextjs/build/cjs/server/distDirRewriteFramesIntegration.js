var {
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const path = require('path');
const core = require('@sentry/core');

const distDirRewriteFramesIntegration = core.defineIntegration(({ distDirName }) => {
  // nextjs always puts the build directory at the project root level, which is also where you run `next start` from, so
  // we can read in the project directory from the currently running process
  const distDirAbsPath = path.resolve(distDirName).replace(/(\/|\\)$/, ''); // We strip trailing slashes because "app:///_next" also doesn't have one

  // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- user input is escaped
  const SOURCEMAP_FILENAME_REGEX = new RegExp(core.escapeStringForRegex(distDirAbsPath));

  const rewriteFramesInstance = core.rewriteFramesIntegration({
    iteratee: frame => {
      frame.filename = _optionalChain([frame, 'access', _ => _.filename, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(SOURCEMAP_FILENAME_REGEX, 'app:///_next')]);
      return frame;
    },
  });

  return {
    ...rewriteFramesInstance,
    name: 'DistDirRewriteFrames',
  };
});

exports.distDirRewriteFramesIntegration = distDirRewriteFramesIntegration;
//# sourceMappingURL=distDirRewriteFramesIntegration.js.map
