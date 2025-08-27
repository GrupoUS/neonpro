// ============================================================================
// NeonPro AI Healthcare Platform - Consolidated Cache Package
// Supabase-first multi-layer caching with LGPD/ANVISA compliance
// ============================================================================

// Core types and interfaces
export * from "./types";

// Multi-layer cache manager (main entry point)
export { MultiLayerCacheManager } from "./cache-manager";

// Individual cache layers
export { AIContextCacheLayer } from "./ai-context-cache";
export { BrowserCacheLayer } from "./browser-cache";
export { EdgeCacheLayer } from "./edge-cache";
export { SupabaseCacheLayer } from "./supabase-cache";

// Enterprise features
export * from "./enterprise";

// Default cache manager instance for easy consumption
import { MultiLayerCacheManager } from "./cache-manager";
import type { MultiLayerCacheConfig } from "./cache-manager";
import type { CacheConfig } from "./types";
import { CacheLayer } from "./types";

// Healthcare-optimized default configuration for MultiLayerCacheManager
const defaultMultiLayerConfig: MultiLayerCacheConfig = {
  supabase: {
    projectId: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "ownkoxryswokcdanrdgj",
    apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ownkoxryswokcdanrdgj.supabase.co",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    tableName: "cache_entries",
    defaultTTL: 60 * 60 * 1000, // 1 hour
    compressionEnabled: true,
    encryptionEnabled: true,
  },
  browser: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000,
    storageQuota: 50 * 1024 * 1024,
    lgpdCompliant: true,
    compressionEnabled: true,
  },
  edge: {
    endpoint: process.env.EDGE_CACHE_ENDPOINT || "https://edge.neonpro.app",
    region: process.env.EDGE_CACHE_REGION || "us-east-1",
    defaultTTL: 15 * 60 * 1000,
    maxTTL: 24 * 60 * 60 * 1000,
    compressionThreshold: 1024,
    maxSize: 1000,
    encryption: true,
  },
  aiContext: {
    maxContextSize: 10000,
    defaultTTL: 24 * 60 * 60 * 1000,
    maxTTL: 7 * 24 * 60 * 60 * 1000,
    compressionEnabled: true,
    targetHitRate: 95,
    contextRetention: true,
    maxTokensPerContext: 32000,
  },
};

// Legacy CacheConfig for backward compatibility
const defaultConfig: CacheConfig = {
  layers: [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.SUPABASE, CacheLayer.AI_CONTEXT],
  ttl: {
    [CacheLayer.BROWSER]: 5 * 60 * 1000, // 5 minutes
    [CacheLayer.EDGE]: 15 * 60 * 1000, // 15 minutes
    [CacheLayer.SUPABASE]: 60 * 60 * 1000, // 1 hour
    [CacheLayer.AI_CONTEXT]: 24 * 60 * 60 * 1000, // 24 hours
  },
  healthcare: {
    encryptSensitiveData: true,
    auditTrailEnabled: true,
    lgpdCompliant: true,
    anvisaCompliant: true,
    patientDataTTL: 5 * 60 * 1000, // 5 minutes for patient data
    maxSensitiveItems: 100,
    clearOnPrivacyRequest: true,
  },
  performance: {
    batchSize: 50,
    debounceMs: 100,
    maxRetries: 3,
    circuitBreaker: true,
    metricsEnabled: true,
  },
  fallback: {
    enableGracefulDegradation: true,
    fallbackLayers: [CacheLayer.BROWSER, CacheLayer.EDGE],
    errorThreshold: 5,
    recoveryTimeMs: 30000,
  },
};

// Default cache manager instance
export const healthcareCache = new MultiLayerCacheManager(defaultMultiLayerConfig);

// Convenience functions for common healthcare use cases
export const cacheKeys = {
  // Patient-related cache keys
  patient: (id: string) => `patient_${id}`,
  patientHistory: (id: string) => `patient_history_${id}`,
  patientConsent: (id: string) => `patient_consent_${id}`,

  // Appointment cache keys
  appointment: (id: string) => `appointment_${id}`,
  appointmentSlots: (providerId: string, date: string) => `slots_${providerId}_${date}`,

  // Compliance cache keys
  compliance: (type: string) => `compliance_${type}`,
  anvisaReport: (type: string, date: string) => `anvisa_${type}_${date}`,
  lgpdConsent: (patientId: string) => `lgpd_consent_${patientId}`,

  // AI context cache keys
  aiConversation: (userId: string, sessionId: string) => `ai_conv_${userId}_${sessionId}`,
  aiKnowledge: (topic: string) => `ai_knowledge_${topic}`,

  // General cache keys
  report: (type: string, date: string) => `report_${type}_${date}`,
  metrics: (type: string) => `metrics_${type}`,
  config: (module: string) => `config_${module}`,
} as const;

// Healthcare-specific cache utilities
export const healthcareUtils = {
  // Clear all patient-related data for LGPD compliance
  clearPatientData: async (patientId: string): Promise<void> => {
    await healthcareCache.clearPatientData(patientId);
  },

  // Emergency cache clear for ANVISA audits
  emergencyClear: async (): Promise<void> => {
    await healthcareCache.clear();
  },

  // Get healthcare audit trail
  getAuditTrail: (): any[] => {
    return healthcareCache.getHealthcareAuditTrail();
  },

  // Check cache health for monitoring
  getHealthStatus: () => {
    return healthcareCache.getStats();
  },
} as const;
