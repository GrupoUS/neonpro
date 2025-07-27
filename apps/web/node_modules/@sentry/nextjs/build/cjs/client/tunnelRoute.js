Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const debugBuild = require('../common/debug-build.js');

const globalWithInjectedValues = core.GLOBAL_OBJ

;

/**
 * Applies the `tunnel` option to the Next.js SDK options based on `withSentryConfig`'s `tunnelRoute` option.
 */
function applyTunnelRouteOption(options) {
  const tunnelRouteOption = process.env._sentryRewritesTunnelPath || globalWithInjectedValues._sentryRewritesTunnelPath;
  if (tunnelRouteOption && options.dsn) {
    const dsnComponents = core.dsnFromString(options.dsn);
    if (!dsnComponents) {
      return;
    }
    const sentrySaasDsnMatch = dsnComponents.host.match(/^o(\d+)\.ingest(?:\.([a-z]{2}))?\.sentry\.io$/);
    if (sentrySaasDsnMatch) {
      const orgId = sentrySaasDsnMatch[1];
      const regionCode = sentrySaasDsnMatch[2];
      let tunnelPath = `${tunnelRouteOption}?o=${orgId}&p=${dsnComponents.projectId}`;
      if (regionCode) {
        tunnelPath += `&r=${regionCode}`;
      }
      options.tunnel = tunnelPath;
      debugBuild.DEBUG_BUILD && core.logger.info(`Tunneling events to "${tunnelPath}"`);
    } else {
      debugBuild.DEBUG_BUILD && core.logger.warn('Provided DSN is not a Sentry SaaS DSN. Will not tunnel events.');
    }
  }
}

exports.applyTunnelRouteOption = applyTunnelRouteOption;
//# sourceMappingURL=tunnelRoute.js.map
