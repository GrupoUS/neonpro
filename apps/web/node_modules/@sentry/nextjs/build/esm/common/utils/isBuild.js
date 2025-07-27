import { PHASE_PRODUCTION_BUILD } from 'next/constants';

/**
 * Decide if the currently running process is part of the build phase or happening at runtime.
 */
function isBuild() {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}

export { isBuild };
//# sourceMappingURL=isBuild.js.map
