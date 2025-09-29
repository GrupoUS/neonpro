import { featureFlags } from '@neonpro/config';
import { Context, Next } from 'hono';

export const withFeatureFlags = (requiredFlags: string[] = []) => {
  return async (c: Context, next: Next) => {
    // Check if all required feature flags are enabled
    for (const flag of requiredFlags) {
      if (!featureFlags[flag as keyof typeof featureFlags]) {
        return c.json(
          { 
            error: 'Feature not available',
            message: `Feature flag ${flag} is not enabled`
          }, 
          503
        );
      }
    }

    // Add feature flags to context for use in handlers
    c.set('featureFlags', featureFlags);
    
    await next();
  };
};

export const withEdgeRuntime = () => {
  return async (c: Context, next: Next) => {
    if (!featureFlags.EDGE_RUNTIME_ENABLED) {
      // Fallback to existing implementation or return error
      return c.json(
        { 
          error: 'Edge runtime disabled',
          message: 'This endpoint requires Edge runtime to be enabled'
        }, 
        503
      );
    }
    
    await next();
  };
};