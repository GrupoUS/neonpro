export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  version?: string;
  tags?: string[];
  sensitive?: boolean;
  lgpdConsent?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
}

export interface CacheLayerConfig {
  ttl: number;
  maxSize?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  lgpdCompliant?: boolean;
}

export interface CacheKey {
  layer: CacheLayer;
  namespace: string;
  key: string;
  tags?: string[];
}

export enum CacheLayer {
  BROWSER = "browser",
  EDGE = "edge",
  SUPABASE = "supabase", // Changed from DATABASE to SUPABASE
  AI_CONTEXT = "ai_context",
}

export interface CacheOperation {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  invalidateByTags(tags: string[]): Promise<void>;
}

export interface HealthcareDataPolicy {
  requiresConsent: boolean;
  dataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  retentionPeriod?: number;
  auditRequired: boolean;
}

export interface SupabaseCacheConfig {
  projectId: string;
  apiUrl: string;
  serviceKey: string;
  tableName: string;
  defaultTTL: number;
  maxSize?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

// Multi-layer cache configuration
export interface CacheConfig {
  layers: CacheLayer[];
  ttl: Record<CacheLayer, number>;
  healthcare: {
    encryptSensitiveData: boolean;
    auditTrailEnabled: boolean;
    lgpdCompliant: boolean;
    anvisaCompliant: boolean;
    patientDataTTL: number;
    maxSensitiveItems: number;
    clearOnPrivacyRequest: boolean;
  };
  performance: {
    batchSize: number;
    debounceMs: number;
    maxRetries: number;
    circuitBreaker: boolean;
    metricsEnabled: boolean;
  };
  fallback: {
    enableGracefulDegradation: boolean;
    fallbackLayers: CacheLayer[];
    errorThreshold: number;
    recoveryTimeMs: number;
  };
}

// Browser cache configuration
export interface BrowserCacheConfig {
  maxSize: number;
  defaultTTL: number;
  storageQuota: number;
  lgpdCompliant: boolean;
  compressionEnabled: boolean;
}

// Edge cache configuration
export interface EdgeCacheConfig {
  endpoint: string;
  region: string;
  defaultTTL: number;
  maxTTL: number;
  compressionThreshold: number;
  maxSize: number;
  encryption: boolean;
}

// AI Context cache configuration
export interface AIContextCacheConfig {
  maxContextSize: number;
  defaultTTL: number;
  maxTTL: number;
  compressionEnabled: boolean;
  targetHitRate: number;
  contextRetention: boolean;
  maxTokensPerContext: number;
}
