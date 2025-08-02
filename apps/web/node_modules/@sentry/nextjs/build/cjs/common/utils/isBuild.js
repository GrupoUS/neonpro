Object.defineProperty(exports, '__esModule', { value: true });

const constants = require('next/constants');

/**
 * Decide if the currently running process is part of the build phase or happening at runtime.
 */
function isBuild() {
  return process.env.NEXT_PHASE === constants.PHASE_PRODUCTION_BUILD;
}

exports.isBuild = isBuild;
//# sourceMappingURL=isBuild.js.map
