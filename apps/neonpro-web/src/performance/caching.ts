// Temporary caching module for build compatibility
export const cacheConfig = {
  defaultTTL: 300,
  maxSize: 1000
};

export const performanceCache = {
  get: (key: string) => null,
  set: (key: string, value: any) => true,
  clear: () => true
};