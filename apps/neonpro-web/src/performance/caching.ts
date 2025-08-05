// Temporary caching module for build compatibility
export const cacheConfig = {
  defaultTTL: 300,
  maxSize: 1000,
};

export const performanceCache = {
  get: (_key: string) => null,
  set: (_key: string, _value: any) => true,
  clear: () => true,
};

// Additional exports to fix build errors
export const CacheHeaders = {
  NO_CACHE: "no-cache",
  NO_STORE: "no-store",
  MAX_AGE: "max-age",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
} as const;

export type CacheHeadersType = typeof CacheHeaders;
