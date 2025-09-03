export { AIContextCacheLayer, type AIContextMetadata } from "./ai-context-cache";
export { type MultiLayerCacheConfig, MultiLayerCacheManager } from "./cache-manager";
export type { CacheEntry, CacheStats } from "./types";
export { CacheLayer } from "./types";

// Healthcare utilities wrapper
import type { MultiLayerCacheManager as _MLCM } from "./cache-manager";
export const healthcareUtils = {
  getAuditTrailAsRecords(cache: _MLCM): Record<string, unknown>[] {
    return cache.getHealthcareAuditTrail().map((entry) => ({ ...entry })) as unknown as Record<
      string,
      unknown
    >[];
  },
};
