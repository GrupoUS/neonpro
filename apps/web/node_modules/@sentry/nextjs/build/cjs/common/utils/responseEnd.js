Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const debugBuild = require('../debug-build.js');

/**
 * Flushes pending Sentry events with a 2 second timeout and in a way that cannot create unhandled promise rejections.
 */
async function flushSafelyWithTimeout() {
  try {
    debugBuild.DEBUG_BUILD && core.logger.log('Flushing events...');
    await core.flush(2000);
    debugBuild.DEBUG_BUILD && core.logger.log('Done flushing events');
  } catch (e) {
    debugBuild.DEBUG_BUILD && core.logger.log('Error while flushing events:\n', e);
  }
}

exports.flushSafelyWithTimeout = flushSafelyWithTimeout;
//# sourceMappingURL=responseEnd.js.map
