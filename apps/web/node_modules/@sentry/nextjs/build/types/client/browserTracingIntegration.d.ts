import type { Integration } from '@sentry/core';
import { browserTracingIntegration as originalBrowserTracingIntegration } from '@sentry/react';
/**
 * A custom browser tracing integration for Next.js.
 */
export declare function browserTracingIntegration(options?: Parameters<typeof originalBrowserTracingIntegration>[0]): Integration;
//# sourceMappingURL=browserTracingIntegration.d.ts.map