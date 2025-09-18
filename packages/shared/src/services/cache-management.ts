/**
 * @fileoverview Cache Management System
 * 
 * Comprehensive cache management system for healthcare applications with:
 * - Healthcare data sensitivity awareness and LGPD compliance
 * - Multi-tier caching with performance optimization
 * - Intelligent cache invalidation and TTL management
 * - Integration with authorization and session systems
 * - Audit logging for healthcare data access
 * - Support for multiple cache backends (memory, Redis, etc.)
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Cache data sensitivity levels
 */
export enum CacheDataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

/**
 * Cache invalidation strategies
 */
export enum CacheInvalidationStrategy {
  TTL = 'ttl',
  LRU = 'lru',
  LFU = 'lfu',
  MANUAL = 'manual',
  EVENT_DRIVEN = 'event_driven'
}

/**
 * Cache tier types
 */
export enum CacheTier {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
  CDN = 'cdn'
}

/**
 * Healthcare cache context schema
 */
export const HealthcareCacheContextSchema = z.object({
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  facilityId: z.string().optional(),
  departmentId: z.string().optional(),
  clinicalContext: z.enum(['consultation', 'surgery', 'emergency', 'administrative', 'research']).optional(),
  dataClassification: z.nativeEnum(CacheDataSensitivity).default(CacheDataSensitivity.INTERNAL),
  lgpdConsentId: z.string().optional(),
  auditTrailId: z.string().optional(),
  retentionRequirement: z.enum(['session', 'temporary', 'standard', 'extended']).default('standard')
});

export type HealthcareCacheContext = z.infer<typeof HealthcareCacheContextSchema>;

/**
 * Cache entry schema
 */
export const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  
  // Metadata
  createdAt: z.date(),
  lastAccessedAt: z.date(),
  accessCount: z.number().default(0),
  size: z.number().optional(),
  
  // TTL and expiration
  ttl: z.number().optional(), // Time to live in seconds
  expiresAt: z.date().optional(),
  
  // Healthcare context
  sensitivity: z.nativeEnum(CacheDataSensitivity).default(CacheDataSensitivity.INTERNAL),
  healthcareContext: HealthcareCacheContextSchema.optional(),
  
  // Access control
  ownerId: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Compliance
  lgpdCompliant: z.boolean().default(true),
  auditRequired: z.boolean().default(false),
  encryptionRequired: z.boolean().default(false),
  
  // Tier information
  tier: z.nativeEnum(CacheTier).default(CacheTier.MEMORY),
  upstream: z.string().optional(),
  
  // Metadata
  metadata: z.record(z.any()).default({})
});

export type CacheEntry = z.infer<typeof CacheEntrySchema>;

/**
 * Cache configuration schema
 */
export const CacheConfigSchema = z.object({
  // Basic settings
  maxSize: z.number().positive().default(1000),
  defaultTTL: z.number().positive().default(3600), // 1 hour
  maxTTL: z.number().positive().default(86400), // 24 hours
  
  // Eviction policy
  evictionStrategy: z.nativeEnum(CacheInvalidationStrategy).default(CacheInvalidationStrategy.LRU),
  maxMemoryUsage: z.number().positive().default(100 * 1024 * 1024), // 100MB
  
  // Healthcare specific
  healthcareRetentionPolicy: z.object({
    [CacheDataSensitivity.PUBLIC]: z.number().default(86400), // 24 hours
    [CacheDataSensitivity.INTERNAL]: z.number().default(3600), // 1 hour
    [CacheDataSensitivity.CONFIDENTIAL]: z.number().default(1800), // 30 minutes
    [CacheDataSensitivity.RESTRICTED]: z.number().default(900) // 15 minutes
  }).default({}),
  
  // LGPD compliance
  lgpdSettings: z.object({
    enableAuditLogging: z.boolean().default(true),
    requireConsent: z.boolean().default(false),
    autoAnonymization: z.boolean().default(true),
    dataRetentionDays: z.number().default(2555) // 7 years
  }).default({}),
  
  // Performance
  performanceSettings: z.object({
    enableCompression: z.boolean().default(true),
    enableEncryption: z.boolean().default(false),
    enableMetrics: z.boolean().default(true),
    batchOperations: z.boolean().default(true)
  }).default({})
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

/**
 * Cache operation result schema
 */
export const CacheOperationResultSchema = z.object({
  success: z.boolean(),
  key: z.string(),
  value: z.any().optional(),
  
  // Performance metrics
  hit: z.boolean().optional(),
  latency: z.number().optional(),
  size: z.number().optional(),
  
  // Compliance
  auditLogged: z.boolean().default(false),
  lgpdCompliant: z.boolean().default(true),
  
  // Error information
  error: z.string().optional(),
  errorCode: z.string().optional(),
  
  // Metadata
  timestamp: z.date().default(() => new Date()),
  tier: z.nativeEnum(CacheTier).optional(),
  metadata: z.record(z.any()).default({})
});

export type CacheOperationResult = z.infer<typeof CacheOperationResultSchema>;

/**
 * Cache statistics schema
 */
export const CacheStatisticsSchema = z.object({
  // Basic metrics
  totalEntries: z.number().default(0),
  memoryUsage: z.number().default(0),
  hitRate: z.number().min(0).max(1).default(0),
  missRate: z.number().min(0).max(1).default(0),
  
  // Performance metrics
  averageLatency: z.number().default(0),
  operationsPerSecond: z.number().default(0),
  
  // Healthcare metrics
  sensitiveDataEntries: z.number().default(0),
  lgpdCompliantEntries: z.number().default(0),
  auditedOperations: z.number().default(0),
  
  // Tier distribution
  tierDistribution: z.object({
    [CacheTier.MEMORY]: z.number().default(0),
    [CacheTier.REDIS]: z.number().default(0),
    [CacheTier.DATABASE]: z.number().default(0),
    [CacheTier.CDN]: z.number().default(0)
  }).default({}),
  
  // Time-based metrics
  lastResetTime: z.date().default(() => new Date()),
  uptime: z.number().default(0)
});

export type CacheStatistics = z.infer<typeof CacheStatisticsSchema>;

/**
 * Cache audit event schema
 */
export const CacheAuditEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.date(),
  operation: z.enum(['get', 'set', 'delete', 'clear', 'invalidate', 'expire']),
  
  // Cache information
  key: z.string(),
  tier: z.nativeEnum(CacheTier),
  sensitivity: z.nativeEnum(CacheDataSensitivity),
  
  // User context
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  
  // Healthcare context
  healthcareContext: HealthcareCacheContextSchema.optional(),
  
  // Result
  success: z.boolean(),
  latency: z.number().optional(),
  errorMessage: z.string().optional(),
  
  // Compliance
  lgpdCompliant: z.boolean().default(true),
  auditReason: z.string().optional(),
  
  // Metadata
  metadata: z.record(z.any()).default({})
});

export type CacheAuditEvent = z.infer<typeof CacheAuditEventSchema>;

// ============================================================================
// CACHE BACKEND INTERFACE
// ============================================================================

/**
 * Interface for cache backend implementations
 */
export interface CacheBackend {
  /**
   * Get a value from cache
   */
  get(key: string): Promise<CacheEntry | null>;
  
  /**
   * Set a value in cache
   */
  set(key: string, entry: CacheEntry): Promise<void>;
  
  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Check if key exists
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;
  
  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStatistics>;
  
  /**
   * Get keys matching pattern
   */
  getKeys(pattern?: string): Promise<string[]>;
  
  /**
   * Get entries by sensitivity level
   */
  getEntriesBySensitivity(sensitivity: CacheDataSensitivity): Promise<CacheEntry[]>;
  
  /**
   * Cleanup expired entries
   */
  cleanup(): Promise<number>;
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Calculate cache TTL based on data sensitivity
 */
export function calculateHealthcareTTL(
  sensitivity: CacheDataSensitivity,
  config: CacheConfig,
  context?: HealthcareCacheContext
): number {
  const basePolicy = config.healthcareRetentionPolicy;
  let ttl = basePolicy[sensitivity] || config.defaultTTL;
  
  // Adjust based on clinical context
  if (context?.clinicalContext === 'emergency') {
    ttl = Math.min(ttl, 1800); // Max 30 minutes for emergency data
  } else if (context?.clinicalContext === 'surgery') {
    ttl = Math.min(ttl, 3600); // Max 1 hour for surgical data
  }
  
  // Adjust based on retention requirement
  if (context?.retentionRequirement === 'session') {
    ttl = Math.min(ttl, 3600); // Max 1 hour for session data
  } else if (context?.retentionRequirement === 'temporary') {
    ttl = Math.min(ttl, 900); // Max 15 minutes for temporary data
  }
  
  return Math.min(ttl, config.maxTTL);
}

/**
 * Determine if cache entry requires encryption
 */
export function requiresEncryption(
  sensitivity: CacheDataSensitivity,
  context?: HealthcareCacheContext
): boolean {
  // Always encrypt restricted data
  if (sensitivity === CacheDataSensitivity.RESTRICTED) {
    return true;
  }
  
  // Encrypt confidential patient data
  if (sensitivity === CacheDataSensitivity.CONFIDENTIAL && context?.patientId) {
    return true;
  }
  
  // Encrypt emergency clinical data
  if (context?.clinicalContext === 'emergency') {
    return true;
  }
  
  return false;
}

/**
 * Determine if operation requires audit logging
 */
export function requiresAuditLogging(
  operation: string,
  sensitivity: CacheDataSensitivity,
  context?: HealthcareCacheContext
): boolean {
  // Always audit restricted data
  if (sensitivity === CacheDataSensitivity.RESTRICTED) {
    return true;
  }
  
  // Audit patient data access
  if (context?.patientId && ['get', 'set'].includes(operation)) {
    return true;
  }
  
  // Audit clinical operations
  if (context?.clinicalContext && context.clinicalContext !== 'administrative') {
    return true;
  }
  
  return false;
}

/**
 * Generate cache key with healthcare context
 */
export function generateHealthcareCacheKey(
  baseKey: string,
  context?: HealthcareCacheContext,
  userScope?: string
): string {
  const parts = [baseKey];
  
  if (userScope) {
    parts.push(`user:${userScope}`);
  }
  
  if (context?.patientId) {
    parts.push(`patient:${context.patientId}`);
  }
  
  if (context?.providerId) {
    parts.push(`provider:${context.providerId}`);
  }
  
  if (context?.facilityId) {
    parts.push(`facility:${context.facilityId}`);
  }
  
  if (context?.clinicalContext) {
    parts.push(`context:${context.clinicalContext}`);
  }
  
  return parts.join(':');
}

/**
 * Anonymize cache entry for LGPD compliance
 */
export function anonymizeCacheEntry(entry: CacheEntry): CacheEntry {
  return {
    ...entry,
    value: '[ANONYMIZED]',
    ownerId: undefined,
    healthcareContext: {
      ...entry.healthcareContext,
      patientId: undefined,
      providerId: undefined,
      lgpdConsentId: undefined
    },
    metadata: {}
  };
}

/**
 * Estimate cache entry size
 */
export function estimateCacheEntrySize(entry: CacheEntry): number {
  try {
    const serialized = JSON.stringify(entry);
    return new Blob([serialized]).size;
  } catch {
    // Fallback estimation
    return JSON.stringify(entry.value || '').length * 2; // Rough UTF-16 estimation
  }
}

// ============================================================================
// IN-MEMORY CACHE BACKEND
// ============================================================================

/**
 * In-memory cache backend implementation
 */
export class InMemoryCacheBackend implements CacheBackend {
  private entries: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private config: CacheConfig;
  private stats: CacheStatistics;
  private startTime: Date;
  
  constructor(config: CacheConfig) {
    this.config = CacheConfigSchema.parse(config);
    this.stats = CacheStatisticsSchema.parse({});
    this.startTime = new Date();
  }
  
  async get(key: string): Promise<CacheEntry | null> {
    const entry = this.entries.get(key);
    
    if (!entry) {
      this.stats.missRate = this.updateRate(this.stats.missRate, false);
      return null;
    }
    
    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key);
      this.updateAccessOrder(key, true);
      this.stats.missRate = this.updateRate(this.stats.missRate, false);
      return null;
    }
    
    // Update access information
    entry.lastAccessedAt = new Date();
    entry.accessCount++;
    this.updateAccessOrder(key);
    
    this.stats.hitRate = this.updateRate(this.stats.hitRate, true);
    this.stats.totalEntries = this.entries.size;
    
    return { ...entry };
  }
  
  async set(key: string, entry: CacheEntry): Promise<void> {
    const validatedEntry = CacheEntrySchema.parse(entry);
    
    // Calculate size
    validatedEntry.size = estimateCacheEntrySize(validatedEntry);
    
    // Check memory limits
    await this.enforceMemoryLimits(validatedEntry.size);
    
    // Set expiration if TTL provided
    if (validatedEntry.ttl) {
      validatedEntry.expiresAt = new Date(Date.now() + (validatedEntry.ttl * 1000));
    }
    
    this.entries.set(key, validatedEntry);
    this.updateAccessOrder(key);
    
    // Update statistics
    this.stats.totalEntries = this.entries.size;
    this.updateMemoryUsage();
  }
  
  async delete(key: string): Promise<boolean> {
    const deleted = this.entries.delete(key);
    if (deleted) {
      this.updateAccessOrder(key, true);
      this.stats.totalEntries = this.entries.size;
      this.updateMemoryUsage();
    }
    return deleted;
  }
  
  async has(key: string): Promise<boolean> {
    const entry = this.entries.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key);
      this.updateAccessOrder(key, true);
      return false;
    }
    
    return true;
  }
  
  async clear(): Promise<void> {
    this.entries.clear();
    this.accessOrder = [];
    this.stats = CacheStatisticsSchema.parse({});
  }
  
  async getStats(): Promise<CacheStatistics> {
    this.stats.uptime = Date.now() - this.startTime.getTime();
    this.updateMemoryUsage();
    this.updateSensitivityStats();
    return { ...this.stats };
  }
  
  async getKeys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.entries.keys());
    
    if (!pattern) {
      return keys;
    }
    
    // Simple pattern matching (in production, use proper regex)
    const regex = new RegExp(pattern.replace('*', '.*'));
    return keys.filter(key => regex.test(key));
  }
  
  async getEntriesBySensitivity(sensitivity: CacheDataSensitivity): Promise<CacheEntry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.sensitivity === sensitivity)
      .map(entry => ({ ...entry }));
  }
  
  async cleanup(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.entries.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.entries.delete(key);
        this.updateAccessOrder(key, true);
        cleanedCount++;
      }
    }
    
    this.stats.totalEntries = this.entries.size;
    this.updateMemoryUsage();
    
    return cleanedCount;
  }
  
  private async enforceMemoryLimits(newEntrySize: number): Promise<void> {
    while (this.getCurrentMemoryUsage() + newEntrySize > this.config.maxMemoryUsage) {
      if (this.config.evictionStrategy === CacheInvalidationStrategy.LRU) {
        await this.evictLRU();
      } else if (this.config.evictionStrategy === CacheInvalidationStrategy.LFU) {
        await this.evictLFU();
      } else {
        break; // No automatic eviction
      }
    }
  }
  
  private async evictLRU(): Promise<void> {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder[0];
    await this.delete(oldestKey);
  }
  
  private async evictLFU(): Promise<void> {
    if (this.entries.size === 0) return;
    
    let minAccessCount = Infinity;
    let lfuKey = '';
    
    for (const [key, entry] of this.entries.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lfuKey = key;
      }
    }
    
    if (lfuKey) {
      await this.delete(lfuKey);
    }
  }
  
  private updateAccessOrder(key: string, remove = false): void {
    // Remove from current position
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    
    // Add to end if not removing
    if (!remove) {
      this.accessOrder.push(key);
    }
  }
  
  private updateRate(currentRate: number, hit: boolean): number {
    const weight = 0.1; // Exponential moving average weight
    return currentRate * (1 - weight) + (hit ? 1 : 0) * weight;
  }
  
  private getCurrentMemoryUsage(): number {
    let total = 0;
    for (const entry of this.entries.values()) {
      total += entry.size || 0;
    }
    return total;
  }
  
  private updateMemoryUsage(): void {
    this.stats.memoryUsage = this.getCurrentMemoryUsage();
  }
  
  private updateSensitivityStats(): void {
    this.stats.sensitiveDataEntries = Array.from(this.entries.values())
      .filter(entry => 
        entry.sensitivity === CacheDataSensitivity.CONFIDENTIAL ||
        entry.sensitivity === CacheDataSensitivity.RESTRICTED
      ).length;
    
    this.stats.lgpdCompliantEntries = Array.from(this.entries.values())
      .filter(entry => entry.lgpdCompliant).length;
  }
}

// ============================================================================
// CACHE MANAGEMENT SERVICE
// ============================================================================

/**
 * Comprehensive Cache Management Service
 */
export class CacheManagementService {
  private backends: Map<CacheTier, CacheBackend> = new Map();
  private config: CacheConfig;
  private auditLog: CacheAuditEvent[] = [];
  
  constructor(config: CacheConfig) {
    this.config = CacheConfigSchema.parse(config);
    
    // Initialize default in-memory backend
    this.backends.set(CacheTier.MEMORY, new InMemoryCacheBackend(config));
  }
  
  /**
   * Register cache backend
   */
  registerBackend(tier: CacheTier, backend: CacheBackend): void {
    this.backends.set(tier, backend);
  }
  
  /**
   * Get value from cache
   */
  async get(
    key: string,
    context?: HealthcareCacheContext,
    userContext?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      // Generate scoped key
      const scopedKey = generateHealthcareCacheKey(key, context, userContext?.userId);
      
      // Try each tier in order
      for (const [tier, backend] of this.backends.entries()) {
        const entry = await backend.get(scopedKey);
        
        if (entry) {
          const latency = Date.now() - startTime;
          
          // Check permissions
          if (!this.checkPermissions(entry, userContext?.userId)) {
            continue;
          }
          
          // Audit if required
          const auditRequired = requiresAuditLogging('get', entry.sensitivity, context);
          if (auditRequired) {
            await this.logAudit({
              eventId: crypto.randomUUID(),
              timestamp: new Date(),
              operation: 'get',
              key: scopedKey,
              tier,
              sensitivity: entry.sensitivity,
              userId: userContext?.userId,
              sessionId: userContext?.sessionId,
              ipAddress: userContext?.ipAddress,
              healthcareContext: context,
              success: true,
              latency,
              lgpdCompliant: entry.lgpdCompliant
            });
          }
          
          return {
            success: true,
            key: scopedKey,
            value: entry.value,
            hit: true,
            latency,
            size: entry.size,
            auditLogged: auditRequired,
            lgpdCompliant: entry.lgpdCompliant,
            tier
          };
        }
      }
      
      // Cache miss
      const latency = Date.now() - startTime;
      return {
        success: true,
        key: scopedKey,
        hit: false,
        latency
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency
      };
    }
  }
  
  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    options: {
      ttl?: number;
      sensitivity?: CacheDataSensitivity;
      context?: HealthcareCacheContext;
      tier?: CacheTier;
      userContext?: {
        userId?: string;
        sessionId?: string;
        ipAddress?: string;
      };
    } = {}
  ): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      const {
        ttl,
        sensitivity = CacheDataSensitivity.INTERNAL,
        context,
        tier = CacheTier.MEMORY,
        userContext
      } = options;
      
      // Generate scoped key
      const scopedKey = generateHealthcareCacheKey(key, context, userContext?.userId);
      
      // Calculate TTL
      const calculatedTTL = ttl || calculateHealthcareTTL(sensitivity, this.config, context);
      
      // Create cache entry
      const entry: CacheEntry = {
        key: scopedKey,
        value,
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 0,
        ttl: calculatedTTL,
        expiresAt: new Date(Date.now() + (calculatedTTL * 1000)),
        sensitivity,
        healthcareContext: context,
        ownerId: userContext?.userId,
        permissions: [],
        tags: [],
        lgpdCompliant: !context?.patientId || !!context?.lgpdConsentId,
        auditRequired: requiresAuditLogging('set', sensitivity, context),
        encryptionRequired: requiresEncryption(sensitivity, context),
        tier,
        metadata: {}
      };
      
      // Get backend
      const backend = this.backends.get(tier);
      if (!backend) {
        throw new Error(`Cache backend not available for tier: ${tier}`);
      }
      
      // Store entry
      await backend.set(scopedKey, entry);
      
      const latency = Date.now() - startTime;
      
      // Audit if required
      if (entry.auditRequired) {
        await this.logAudit({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'set',
          key: scopedKey,
          tier,
          sensitivity,
          userId: userContext?.userId,
          sessionId: userContext?.sessionId,
          ipAddress: userContext?.ipAddress,
          healthcareContext: context,
          success: true,
          latency,
          lgpdCompliant: entry.lgpdCompliant
        });
      }
      
      return {
        success: true,
        key: scopedKey,
        value,
        latency,
        size: entry.size,
        auditLogged: entry.auditRequired,
        lgpdCompliant: entry.lgpdCompliant,
        tier
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency
      };
    }
  }
  
  /**
   * Delete value from cache
   */
  async delete(
    key: string,
    context?: HealthcareCacheContext,
    userContext?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      const scopedKey = generateHealthcareCacheKey(key, context, userContext?.userId);
      let deleted = false;
      let deletedTier: CacheTier | undefined;
      
      // Try to delete from all tiers
      for (const [tier, backend] of this.backends.entries()) {
        const result = await backend.delete(scopedKey);
        if (result) {
          deleted = true;
          deletedTier = tier;
        }
      }
      
      const latency = Date.now() - startTime;
      
      // Audit if required
      if (deleted && context) {
        await this.logAudit({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'delete',
          key: scopedKey,
          tier: deletedTier!,
          sensitivity: CacheDataSensitivity.INTERNAL, // Default
          userId: userContext?.userId,
          sessionId: userContext?.sessionId,
          ipAddress: userContext?.ipAddress,
          healthcareContext: context,
          success: true,
          latency
        });
      }
      
      return {
        success: deleted,
        key: scopedKey,
        latency,
        auditLogged: !!context,
        tier: deletedTier
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency
      };
    }
  }
  
  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(
    pattern: string,
    context?: HealthcareCacheContext,
    userContext?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): Promise<number> {
    let invalidatedCount = 0;
    
    for (const [tier, backend] of this.backends.entries()) {
      const keys = await backend.getKeys(pattern);
      
      for (const key of keys) {
        const result = await this.delete(key, context, userContext);
        if (result.success) {
          invalidatedCount++;
        }
      }
    }
    
    return invalidatedCount;
  }
  
  /**
   * Get cache statistics
   */
  async getStatistics(): Promise<Map<CacheTier, CacheStatistics>> {
    const stats = new Map<CacheTier, CacheStatistics>();
    
    for (const [tier, backend] of this.backends.entries()) {
      const tierStats = await backend.getStats();
      stats.set(tier, tierStats);
    }
    
    return stats;
  }
  
  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<Map<CacheTier, number>> {
    const results = new Map<CacheTier, number>();
    
    for (const [tier, backend] of this.backends.entries()) {
      const cleanedCount = await backend.cleanup();
      results.set(tier, cleanedCount);
    }
    
    return results;
  }
  
  /**
   * LGPD compliance cleanup
   */
  async lgpdCleanup(): Promise<number> {
    let anonymizedCount = 0;
    
    for (const [tier, backend] of this.backends.entries()) {
      const sensitiveEntries = await backend.getEntriesBySensitivity(CacheDataSensitivity.RESTRICTED);
      
      for (const entry of sensitiveEntries) {
        if (entry.healthcareContext?.patientId && !entry.healthcareContext.lgpdConsentId) {
          // Anonymize entry without consent
          const anonymizedEntry = anonymizeCacheEntry(entry);
          await backend.set(entry.key, anonymizedEntry);
          anonymizedCount++;
        }
      }
    }
    
    return anonymizedCount;
  }
  
  /**
   * Check permissions for cache entry access
   */
  private checkPermissions(entry: CacheEntry, userId?: string): boolean {
    // Owner can always access
    if (entry.ownerId === userId) {
      return true;
    }
    
    // Check if user has required permissions
    if (userId && entry.permissions.includes(userId)) {
      return true;
    }
    
    // Public data can be accessed by anyone
    if (entry.sensitivity === CacheDataSensitivity.PUBLIC) {
      return true;
    }
    
    // Restrict access to sensitive data without explicit permission
    return false;
  }
  
  /**
   * Log audit event
   */
  private async logAudit(event: CacheAuditEvent): Promise<void> {
    const validatedEvent = CacheAuditEventSchema.parse(event);
    this.auditLog.push(validatedEvent);
    
    // In a real implementation, this would integrate with your audit system
    if (this.config.lgpdSettings.enableAuditLogging) {
      console.log('Cache Audit:', JSON.stringify(validatedEvent, null, 2));
    }
  }
  
  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    userId?: string;
    sessionId?: string;
    operation?: string;
    sensitivity?: CacheDataSensitivity;
    startDate?: Date;
    endDate?: Date;
  }): CacheAuditEvent[] {
    return this.auditLog.filter(event => {
      if (filters?.userId && event.userId !== filters.userId) return false;
      if (filters?.sessionId && event.sessionId !== filters.sessionId) return false;
      if (filters?.operation && event.operation !== filters.operation) return false;
      if (filters?.sensitivity && event.sensitivity !== filters.sensitivity) return false;
      if (filters?.startDate && event.timestamp < filters.startDate) return false;
      if (filters?.endDate && event.timestamp > filters.endDate) return false;
      return true;
    });
  }
}

// ============================================================================
// HEALTHCARE CACHE PATTERNS
// ============================================================================

/**
 * Healthcare-specific cache patterns and utilities
 */
export class HealthcareCachePatterns {
  private cache: CacheManagementService;
  
  constructor(cache: CacheManagementService) {
    this.cache = cache;
  }
  
  /**
   * Cache patient data with proper sensitivity
   */
  async cachePatientData(
    patientId: string,
    dataType: string,
    data: any,
    options: {
      providerId?: string;
      facilityId?: string;
      clinicalContext?: 'consultation' | 'surgery' | 'emergency' | 'administrative' | 'research';
      ttl?: number;
      lgpdConsentId?: string;
    } = {}
  ): Promise<CacheOperationResult> {
    const key = `patient:${patientId}:${dataType}`;
    
    return this.cache.set(key, data, {
      sensitivity: CacheDataSensitivity.CONFIDENTIAL,
      ttl: options.ttl,
      context: {
        patientId,
        providerId: options.providerId,
        facilityId: options.facilityId,
        clinicalContext: options.clinicalContext || 'consultation',
        dataClassification: CacheDataSensitivity.CONFIDENTIAL,
        lgpdConsentId: options.lgpdConsentId,
        retentionRequirement: 'standard'
      }
    });
  }
  
  /**
   * Cache clinical session data
   */
  async cacheClinicalSession(
    sessionId: string,
    sessionData: any,
    options: {
      patientId?: string;
      providerId?: string;
      clinicalContext?: 'consultation' | 'surgery' | 'emergency' | 'administrative' | 'research';
    } = {}
  ): Promise<CacheOperationResult> {
    const key = `clinical:session:${sessionId}`;
    
    return this.cache.set(key, sessionData, {
      sensitivity: CacheDataSensitivity.CONFIDENTIAL,
      ttl: 3600, // 1 hour for clinical sessions
      context: {
        patientId: options.patientId,
        providerId: options.providerId,
        clinicalContext: options.clinicalContext || 'consultation',
        dataClassification: CacheDataSensitivity.CONFIDENTIAL,
        retentionRequirement: 'session'
      }
    });
  }
  
  /**
   * Cache emergency access data
   */
  async cacheEmergencyData(
    emergencyId: string,
    data: any,
    options: {
      patientId?: string;
      facilityId?: string;
      ttl?: number;
    } = {}
  ): Promise<CacheOperationResult> {
    const key = `emergency:${emergencyId}`;
    
    return this.cache.set(key, data, {
      sensitivity: CacheDataSensitivity.RESTRICTED,
      ttl: options.ttl || 1800, // 30 minutes for emergency data
      tier: CacheTier.MEMORY, // Keep in fastest tier
      context: {
        patientId: options.patientId,
        facilityId: options.facilityId,
        clinicalContext: 'emergency',
        dataClassification: CacheDataSensitivity.RESTRICTED,
        retentionRequirement: 'temporary'
      }
    });
  }
  
  /**
   * Invalidate patient-related cache
   */
  async invalidatePatientCache(patientId: string): Promise<number> {
    const pattern = `*patient:${patientId}*`;
    return this.cache.invalidatePattern(pattern, {
      patientId,
      dataClassification: CacheDataSensitivity.CONFIDENTIAL
    });
  }
  
  /**
   * Invalidate provider-related cache
   */
  async invalidateProviderCache(providerId: string): Promise<number> {
    const pattern = `*provider:${providerId}*`;
    return this.cache.invalidatePattern(pattern, {
      providerId,
      dataClassification: CacheDataSensitivity.INTERNAL
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
// Note: All classes are already exported above with their definitions
// No need to re-export them here to avoid TS2484 conflicts

export default CacheManagementService;