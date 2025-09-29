export const featureFlags = {
  NEW_DATABASE_LAYER: process.env.NEW_DATABASE_LAYER === 'true',
  EDGE_RUNTIME_ENABLED: process.env.EDGE_RUNTIME_ENABLED === 'true',
  REALTIME_UPDATES: process.env.REALTIME_UPDATES === 'true',
  COPILOTKIT_INTEGRATION: process.env.COPILOTKIT_INTEGRATION !== 'false', // Default enabled
  AGUI_PROTOCOL: process.env.AGUI_PROTOCOL !== 'false', // Default enabled
  MULTI_TENANT_RLS: process.env.MULTI_TENANT_RLS !== 'false', // Default enabled
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return featureFlags[flag];
};

export const getFeatureFlags = () => {
  return { ...featureFlags };
};