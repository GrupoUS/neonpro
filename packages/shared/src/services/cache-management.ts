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

import { z } from 'zod'
import { auditLogger, logHealthcareError } from '../logging/healthcare-logger'

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
  RESTRICTED = 'restricted',
}

/**
 * Cache invalidation strategies
 */
export enum CacheInvalidationStrategy {
  TTL = 'ttl',
  LRU = 'lru',
  LFU = 'lfu',
  MANUAL = 'manual',
  EVENT_DRIVEN = 'event_driven',
}

/**
 * Cache tier types
 */
export enum CacheTier {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
  CDN = 'cdn',
}

/**
 * Healthcare cache context schema
 */
export const HealthcareCacheContextSchema = z.object({
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  facilityId: z.string().optional(),
  departmentId: z.string().optional(),
  clinicalContext: z
    .enum([
      'consultation',
      'surgery',
      'emergency',
      'administrative',
      'research',
    ])
    .optional(),
  dataClassification: z
    .nativeEnum(CacheDataSensitivity)
    .default(CacheDataSensitivity.INTERNAL),
  lgpdConsentId: z.string().optional(),
  auditTrailId: z.string().optional(),
  retentionRequirement: z
    .enum(['session', 'temporary', 'standard', 'extended'])
    .default('standard'),
})

export type HealthcareCacheContext = z.infer<
  typeof HealthcareCacheContextSchema
>

/**
 * Cache entry schema
 */
export const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),

  // Metadata
  createdAt: z.date(),
  lastAccessedAt: z.date(),
  accessCount: z.number().default(0),
  size: z.number().optional(),

  // TTL and expiration
  ttl: z.number().optional(), // Time to live in seconds
  expiresAt: z.date().optional(),

  // Healthcare context
  sensitivity: z
    .nativeEnum(CacheDataSensitivity)
    .default(CacheDataSensitivity.INTERNAL),
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
  metadata: z.record(z.unknown()).default({}),
})

export type CacheEntry = z.infer<typeof CacheEntrySchema>

/**
 * Cache configuration schema
 */
export const CacheConfigSchema = z.object({
  // Basic settings
  maxSize: z.number().positive().default(1000),
  defaultTTL: z.number().positive().default(3600), // 1 hour
  maxTTL: z.number().positive().default(86400), // 24 hours

  // Eviction policy
  evictionStrategy: z
    .nativeEnum(CacheInvalidationStrategy)
    .default(CacheInvalidationStrategy.LRU),
  maxMemoryUsage: z
    .number()
    .positive()
    .default(100 * 1024 * 1024), // 100MB

  // Healthcare specific
  healthcareRetentionPolicy: z
    .object({
      [CacheDataSensitivity.PUBLIC]: z.number().default(86400), // 24 hours
      [CacheDataSensitivity.INTERNAL]: z.number().default(3600), // 1 hour
      [CacheDataSensitivity.CONFIDENTIAL]: z.number().default(1800), // 30 minutes
      [CacheDataSensitivity.RESTRICTED]: z.number().default(900), // 15 minutes
    })
    .default({}),

  // LGPD compliance
  lgpdSettings: z
    .object({
      enableAuditLogging: z.boolean().default(true),
      requireConsent: z.boolean().default(false),
      autoAnonymization: z.boolean().default(true),
      dataRetentionDays: z.number().default(2555), // 7 years
    })
    .default({}),

  // Performance
  performanceSettings: z
    .object({
      enableCompression: z.boolean().default(true),
      enableEncryption: z.boolean().default(false),
      enableMetrics: z.boolean().default(true),
      batchOperations: z.boolean().default(true),
    })
    .default({}),
})

export type CacheConfig = z.infer<typeof CacheConfigSchema>

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
  metadata: z.record(z.unknown()).default({}),
})

export type CacheOperationResult = z.infer<typeof CacheOperationResultSchema>

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
  tierDistribution: z
    .object({
      [CacheTier.MEMORY]: z.number().default(0),
      [CacheTier.REDIS]: z.number().default(0),
      [CacheTier.DATABASE]: z.number().default(0),
      [CacheTier.CDN]: z.number().default(0),
    })
    .default({}),

  // Time-based metrics
  lastResetTime: z.date().default(() => new Date()),
  uptime: z.number().default(0),
})

export type CacheStatistics = z.infer<typeof CacheStatisticsSchema>

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
  _userId: z.string().optional(),
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
  metadata: z.record(z.unknown()).default({}),
})

export type CacheAuditEvent = z.infer<typeof CacheAuditEventSchema>

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
  get(key: string): Promise<CacheEntry | null>

  /**
   * Set a value in cache
   */
  set(key: string, entry: CacheEntry): Promise<void>

  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<boolean>

  /**
   * Check if key exists
   */
  has(key: string): Promise<boolean>

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStatistics>

  /**
   * Get keys matching pattern
   */
  getKeys(pattern?: string): Promise<string[]>

  /**
   * Get entries by sensitivity level
   */
  getEntriesBySensitivity(
    sensitivity: CacheDataSensitivity,
  ): Promise<CacheEntry[]>

  /**
   * Cleanup expired entries
   */
  cleanup(): Promise<number>
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
  _context?: HealthcareCacheContext,
): number {
  const basePolicy = config.healthcareRetentionPolicy
  let ttl = basePolicy[sensitivity] || config.defaultTTL

  // Adjust based on clinical context
  if (_context?.clinicalContext === 'emergency') {
    ttl = Math.min(ttl, 1800) // Max 30 minutes for emergency data
  } else if (_context?.clinicalContext === 'surgery') {
    ttl = Math.min(ttl, 3600) // Max 1 hour for surgical data
  }

  // Adjust based on retention requirement
  if (_context?.retentionRequirement === 'session') {
    ttl = Math.min(ttl, 3600) // Max 1 hour for session data
  } else if (_context?.retentionRequirement === 'temporary') {
    ttl = Math.min(ttl, 900) // Max 15 minutes for temporary data
  }

  return Math.min(ttl, config.maxTTL)
}

/**
 * Determine if cache entry requires encryption
 */
export function requiresEncryption(
  sensitivity: CacheDataSensitivity,
  _context?: HealthcareCacheContext,
): boolean {
  // Always encrypt restricted data
  if (sensitivity === CacheDataSensitivity.RESTRICTED) {
    return true
  }

  // Encrypt confidential patient data
  if (sensitivity === CacheDataSensitivity.CONFIDENTIAL && _context?.patientId) {
    return true
  }

  // Encrypt emergency clinical data
  if (_context?.clinicalContext === 'emergency') {
    return true
  }

  return false
}

/**
 * Determine if operation requires audit logging
 */
export function requiresAuditLogging(
  operation: string,
  sensitivity: CacheDataSensitivity,
  _context?: HealthcareCacheContext,
): boolean {
  // Always audit restricted data
  if (sensitivity === CacheDataSensitivity.RESTRICTED) {
    return true
  }

  // Audit patient data access
  if (_context?.patientId && ['get', 'set'].includes(operation)) {
    return true
  }

  // Audit clinical operations
  if (
    _context?.clinicalContext &&
    _context.clinicalContext !== 'administrative'
  ) {
    return true
  }

  return false
}

/**
 * Generate cache key with healthcare context
 */
export function generateHealthcareCacheKey(
  baseKey: string,
  _context?: HealthcareCacheContext,
  userScope?: string,
): string {
  const parts = [baseKey]

  if (userScope) {
    parts.push(`user:${userScope}`)
  }

  if (_context?.patientId) {
    parts.push(`patient:${_context.patientId}`)
  }

  if (_context?.providerId) {
    parts.push(`provider:${_context.providerId}`)
  }

  if (_context?.facilityId) {
    parts.push(`facility:${_context.facilityId}`)
  }

  if (_context?.clinicalContext) {
    parts.push(`context:${_context.clinicalContext}`)
  }

  return parts.join(':')
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
      lgpdConsentId: undefined,
      dataClassification: CacheDataSensitivity.PUBLIC, // Required field
      retentionRequirement: 'standard', // Required field
    },
    metadata: {},
  }
}

/**
 * Estimate cache entry size
 */
export function estimateCacheEntrySize(entry: CacheEntry): number {
  try {
    const serialized = JSON.stringify(entry)
    return new Blob([serialized]).size
  } catch {
    // Fallback estimation
    return JSON.stringify(entry.value || '').length * 2 // Rough UTF-16 estimation
  }
}

// ============================================================================
// IN-MEMORY CACHE BACKEND
// ============================================================================

/**
 * In-memory cache backend implementation
 */
export class InMemoryCacheBackend implements CacheBackend {
  private entries: Map<string, CacheEntry> = new Map()
  private accessOrder: string[] = []
  private config: CacheConfig
  private stats: CacheStatistics
  private startTime: Date

  constructor(config: CacheConfig) {
    this.config = CacheConfigSchema.parse(config)
    this.stats = CacheStatisticsSchema.parse({})
    this.startTime = new Date()
  }

  async get(key: string): Promise<CacheEntry | null> {
    const entry = this.entries.get(key)

    if (!entry) {
      this.stats.missRate = this.updateRate(this.stats.missRate, false)
      return null
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key)
      this.updateAccessOrder(key, true)
      this.stats.missRate = this.updateRate(this.stats.missRate, false)
      return null
    }

    // Update access information
    entry.lastAccessedAt = new Date()
    entry.accessCount++
    this.updateAccessOrder(key)

    this.stats.hitRate = this.updateRate(this.stats.hitRate, true)
    this.stats.totalEntries = this.entries.size

    return { ...entry }
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    const validatedEntry = CacheEntrySchema.parse(entry)

    // Calculate size
    validatedEntry.size = estimateCacheEntrySize(validatedEntry)

    // Check memory limits
    await this.enforceMemoryLimits(validatedEntry.size)

    // Set expiration if TTL provided
    if (validatedEntry.ttl) {
      validatedEntry.expiresAt = new Date(
        Date.now() + validatedEntry.ttl * 1000,
      )
    }

    this.entries.set(key, validatedEntry)
    this.updateAccessOrder(key)

    // Update statistics
    this.stats.totalEntries = this.entries.size
    this.updateMemoryUsage()
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.entries.delete(key)
    if (deleted) {
      this.updateAccessOrder(key, true)
      this.stats.totalEntries = this.entries.size
      this.updateMemoryUsage()
    }
    return deleted
  }

  async has(key: string): Promise<boolean> {
    const entry = this.entries.get(key)
    if (!entry) return false

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key)
      this.updateAccessOrder(key, true)
      return false
    }

    return true
  }

  async clear(): Promise<void> {
    this.entries.clear()
    this.accessOrder = []
    this.stats = CacheStatisticsSchema.parse({})
  }

  async getStats(): Promise<CacheStatistics> {
    this.stats.uptime = Date.now() - this.startTime.getTime()
    this.updateMemoryUsage()
    this.updateSensitivityStats()
    return { ...this.stats }
  }

  async getKeys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.entries.keys())

    if (!pattern) {
      return keys
    }

    // Simple pattern matching (in production, use proper regex)
    const regex = new RegExp(pattern.replace('*', '.*'))
    return keys.filter(key => regex.test(key))
  }

  async getEntriesBySensitivity(
    sensitivity: CacheDataSensitivity,
  ): Promise<CacheEntry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.sensitivity === sensitivity)
      .map(entry => ({ ...entry }))
  }

  async cleanup(): Promise<number> {
    const now = new Date()
    let cleanedCount = 0

    for (const [key, entry] of Array.from(this.entries.entries())) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.entries.delete(key)
        this.updateAccessOrder(key, true)
        cleanedCount++
      }
    }

    this.stats.totalEntries = this.entries.size
    this.updateMemoryUsage()

    return cleanedCount
  }

  private async enforceMemoryLimits(newEntrySize: number): Promise<void> {
    while (
      this.getCurrentMemoryUsage() + newEntrySize >
        this.config.maxMemoryUsage
    ) {
      if (this.config.evictionStrategy === CacheInvalidationStrategy.LRU) {
        await this.evictLRU()
      } else if (
        this.config.evictionStrategy === CacheInvalidationStrategy.LFU
      ) {
        await this.evictLFU()
      } else {
        break // No automatic eviction
      }
    }
  }

  private async evictLRU(): Promise<void> {
    if (this.accessOrder.length === 0) return

    const oldestKey = this.accessOrder[0]
    if (oldestKey) {
      await this.delete(oldestKey)
    }
  }

  private async evictLFU(): Promise<void> {
    if (this.entries.size === 0) return

    let minAccessCount = Infinity
    let lfuKey = ''

    for (const [key, entry] of Array.from(this.entries.entries())) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount
        lfuKey = key
      }
    }

    if (lfuKey) {
      await this.delete(lfuKey)
    }
  }

  private updateAccessOrder(key: string, remove = false): void {
    // Remove from current position
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }

    // Add to end if not removing
    if (!remove) {
      this.accessOrder.push(key)
    }
  }

  private updateRate(currentRate: number, hit: boolean): number {
    const weight = 0.1 // Exponential moving average weight
    return currentRate * (1 - weight) + (hit ? 1 : 0) * weight
  }

  private getCurrentMemoryUsage(): number {
    let total = 0
    for (const entry of Array.from(this.entries.values())) {
      total += entry.size || 0
    }
    return total
  }

  private updateMemoryUsage(): void {
    this.stats.memoryUsage = this.getCurrentMemoryUsage()
  }

  private updateSensitivityStats(): void {
    this.stats.sensitiveDataEntries = Array.from(this.entries.values()).filter(
      entry =>
        entry.sensitivity === CacheDataSensitivity.CONFIDENTIAL ||
        entry.sensitivity === CacheDataSensitivity.RESTRICTED,
    ).length

    this.stats.lgpdCompliantEntries = Array.from(this.entries.values()).filter(
      entry => entry.lgpdCompliant,
    ).length
  }
}

// ============================================================================
// CACHE MANAGEMENT SERVICE
// ============================================================================

/**
 * Comprehensive Cache Management Service
 */
export class CacheManagementService {
  private backends: Map<CacheTier, CacheBackend> = new Map()
  private config: CacheConfig
  private auditLog: CacheAuditEvent[] = []

  constructor(config: CacheConfig) {
    this.config = CacheConfigSchema.parse(config)

    // Initialize default in-memory backend
    this.backends.set(CacheTier.MEMORY, new InMemoryCacheBackend(config))
  }

  /**
   * Register cache backend
   */
  registerBackend(tier: CacheTier, backend: CacheBackend): void {
    this.backends.set(tier, backend)
  }

  /**
   * Get value from cache
   */
  async get(
    key: string,
    _context?: HealthcareCacheContext,
    userContext?: {
      _userId?: string
      sessionId?: string
      ipAddress?: string
    },
  ): Promise<CacheOperationResult> {
    const startTime = Date.now()

    try {
      // Generate scoped key
      const scopedKey = generateHealthcareCacheKey(
        key,
        _context,
        userContext?._userId,
      )

      // Try each tier in order
      for (const [tier, backend] of Array.from(this.backends.entries())) {
        const entry = await backend.get(scopedKey)

        if (entry) {
          const latency = Date.now() - startTime

          // Check permissions
          if (!this.checkPermissions(entry, userContext?._userId)) {
            continue
          }

          // Audit if required
          const auditRequired = requiresAuditLogging(
            'get',
            entry.sensitivity,
            _context,
          )
          if (auditRequired) {
            await this.logAudit({
              eventId: crypto.randomUUID(),
              timestamp: new Date(),
              operation: 'get',
              key: scopedKey,
              tier,
              sensitivity: entry.sensitivity,
              _userId: userContext?._userId,
              sessionId: userContext?.sessionId,
              ipAddress: userContext?.ipAddress,
              healthcareContext: _context,
              success: true,
              latency,
              lgpdCompliant: entry.lgpdCompliant,
              metadata: { operation: 'get', cacheHit: true }, // Required metadata field
            })
          }

          return {
            key: scopedKey,
            timestamp: new Date(),
            metadata: { operation: 'get', cacheHit: true, size: entry.size },
            success: true,
            lgpdCompliant: entry.lgpdCompliant,
            auditLogged: auditRequired,
            latency,
            tier,
          }
        }
      }

      // Cache miss
      const latency = Date.now() - startTime
      return {
        key: scopedKey,
        timestamp: new Date(),
        metadata: { operation: 'get', cacheHit: false },
        success: true,
        lgpdCompliant: true,
        auditLogged: false,
        latency,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        key,
        timestamp: new Date(),
        metadata: {
          operation: 'get',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        success: false,
        lgpdCompliant: true,
        auditLogged: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'CACHE_GET_ERROR',
        latency,
      }
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: unknown,
    options: {
      ttl?: number
      sensitivity?: CacheDataSensitivity
      _context?: HealthcareCacheContext
      tier?: CacheTier
      userContext?: {
        _userId?: string
        sessionId?: string
        ipAddress?: string
      }
    } = {},
  ): Promise<CacheOperationResult> {
    const startTime = Date.now()

    try {
      const {
        ttl,
        sensitivity = CacheDataSensitivity.INTERNAL,
        _context,
        tier = CacheTier.MEMORY,
        userContext,
      } = options

      // Generate scoped key
      const scopedKey = generateHealthcareCacheKey(
        key,
        _context,
        userContext?._userId,
      )

      // Calculate TTL
      const calculatedTTL = ttl || calculateHealthcareTTL(sensitivity, this.config, _context)

      // Create cache entry
      const entry: CacheEntry = {
        key: scopedKey,
        value,
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 0,
        ttl: calculatedTTL,
        expiresAt: new Date(Date.now() + calculatedTTL * 1000),
        sensitivity,
        healthcareContext: _context,
        ownerId: userContext?._userId,
        permissions: [],
        tags: [],
        lgpdCompliant: !_context?.patientId || !!_context?.lgpdConsentId,
        auditRequired: requiresAuditLogging('set', sensitivity, _context),
        encryptionRequired: requiresEncryption(sensitivity, _context),
        tier,
        metadata: {},
      }

      // Get backend
      const backend = this.backends.get(tier)
      if (!backend) {
        throw new Error(`Cache backend not available for tier: ${tier}`)
      }

      // Store entry
      await backend.set(scopedKey, entry)

      const latency = Date.now() - startTime

      // Audit if required
      if (entry.auditRequired) {
        await this.logAudit({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'set',
          key: scopedKey,
          tier,
          sensitivity,
          _userId: userContext?._userId,
          sessionId: userContext?.sessionId,
          ipAddress: userContext?.ipAddress,
          healthcareContext: _context,
          success: true,
          latency,
          lgpdCompliant: entry.lgpdCompliant,
          metadata: { operation: 'set', size: entry.size }, // Required metadata field
        })
      }

      return {
        key: scopedKey,
        timestamp: new Date(),
        metadata: { operation: 'set', size: entry.size },
        success: true,
        lgpdCompliant: entry.lgpdCompliant,
        auditLogged: entry.auditRequired,
        latency,
        tier,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        key,
        timestamp: new Date(),
        metadata: {
          operation: 'get',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        success: false,
        lgpdCompliant: true,
        auditLogged: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'CACHE_GET_ERROR',
        latency,
      }
    }
  }

  /**
   * Delete value from cache
   */
  async delete(
    key: string,
    _context?: HealthcareCacheContext,
    userContext?: {
      _userId?: string
      sessionId?: string
      ipAddress?: string
    },
  ): Promise<CacheOperationResult> {
    const startTime = Date.now()

    try {
      const scopedKey = generateHealthcareCacheKey(
        key,
        _context,
        userContext?._userId,
      )
      let deleted = false
      let deletedTier: CacheTier | undefined

      // Try to delete from all tiers
      for (const [_tier, backend] of Array.from(this.backends.entries())) {
        const result = await backend.delete(scopedKey)
        if (result) {
          deleted = true
          deletedTier = _tier
        }
      }

      const latency = Date.now() - startTime

      // Audit if required
      if (deleted && _context) {
        await this.logAudit({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'delete',
          key: scopedKey,
          tier: deletedTier!,
          sensitivity: CacheDataSensitivity.INTERNAL, // Default
          _userId: userContext?._userId,
          sessionId: userContext?.sessionId,
          ipAddress: userContext?.ipAddress,
          healthcareContext: _context,
          success: true,
          latency,
          lgpdCompliant: true, // Required field
          metadata: { operation: 'delete' }, // Required metadata field
        })
      }

      return {
        key: scopedKey,
        timestamp: new Date(),
        metadata: { operation: 'delete', deleted },
        success: deleted,
        lgpdCompliant: true,
        auditLogged: !!_context,
        latency,
        tier: deletedTier,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        key,
        timestamp: new Date(),
        metadata: {
          operation: 'get',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        success: false,
        lgpdCompliant: true,
        auditLogged: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'CACHE_GET_ERROR',
        latency,
      }
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(
    pattern: string,
    _context?: HealthcareCacheContext,
    userContext?: {
      _userId?: string
      sessionId?: string
      ipAddress?: string
    },
  ): Promise<number> {
    let invalidatedCount = 0

    for (const [_tier, backend] of Array.from(this.backends.entries())) {
      const keys = await backend.getKeys(pattern)

      for (const key of keys) {
        const result = await this.delete(key, _context, userContext)
        if (result.success) {
          invalidatedCount++
        }
      }
    }

    return invalidatedCount
  }

  /**
   * Get cache statistics
   */
  async getStatistics(): Promise<Map<CacheTier, CacheStatistics>> {
    const stats = new Map<CacheTier, CacheStatistics>()

    for (const [_tier, backend] of Array.from(this.backends.entries())) {
      const tierStats = await backend.getStats()
      stats.set(_tier, tierStats)
    }

    return stats
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<Map<CacheTier, number>> {
    const results = new Map<CacheTier, number>()

    for (const [_tier, backend] of Array.from(this.backends.entries())) {
      const cleanedCount = await backend.cleanup()
      results.set(_tier, cleanedCount)
    }

    return results
  }

  /**
   * LGPD compliance cleanup
   */
  async lgpdCleanup(): Promise<number> {
    let anonymizedCount = 0

    for (const [_tier, backend] of Array.from(this.backends.entries())) {
      const sensitiveEntries = await backend.getEntriesBySensitivity(
        CacheDataSensitivity.RESTRICTED,
      )

      for (const entry of sensitiveEntries) {
        if (
          entry.healthcareContext?.patientId &&
          !entry.healthcareContext.lgpdConsentId
        ) {
          // Anonymize entry without consent
          const anonymizedEntry = anonymizeCacheEntry(entry)
          await backend.set(entry.key, anonymizedEntry)
          anonymizedCount++
        }
      }
    }

    return anonymizedCount
  }

  /**
   * Check permissions for cache entry access
   */
  private checkPermissions(entry: CacheEntry, _userId?: string): boolean {
    // Owner can always access
    if (entry.ownerId === _userId) {
      return true
    }

    // Check if user has required permissions
    if (_userId && entry.permissions.includes(_userId)) {
      return true
    }

    // Public data can be accessed by anyone
    if (entry.sensitivity === CacheDataSensitivity.PUBLIC) {
      return true
    }

    // Restrict access to sensitive data without explicit permission
    return false
  }

  /**
   * Log audit event
   */
  private async logAudit(event: CacheAuditEvent): Promise<void> {
    const validatedEvent = CacheAuditEventSchema.parse(event)
    this.auditLog.push(validatedEvent)

    // In a real implementation, this would integrate with your audit system
    if (this.config.lgpdSettings.enableAuditLogging) {
      auditLogger.info('Cache audit event logged', {
        ...validatedEvent,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    _userId?: string
    sessionId?: string
    operation?: string
    sensitivity?: CacheDataSensitivity
    startDate?: Date
    endDate?: Date
  }): CacheAuditEvent[] {
    return this.auditLog.filter(event => {
      if (filters?._userId && event._userId !== filters._userId) return false
      if (filters?.sessionId && event.sessionId !== filters.sessionId) {
        return false
      }
      if (filters?.operation && event.operation !== filters.operation) {
        return false
      }
      if (filters?.sensitivity && event.sensitivity !== filters.sensitivity) {
        return false
      }
      if (filters?.startDate && event.timestamp < filters.startDate) {
        return false
      }
      if (filters?.endDate && event.timestamp > filters.endDate) return false
      return true
    })
  }
}

// ============================================================================
// HEALTHCARE CACHE PATTERNS
// ============================================================================

/**
 * Healthcare-specific cache patterns and utilities
 */
export class HealthcareCachePatterns {
  private cache: CacheManagementService

  constructor(cache: CacheManagementService) {
    this.cache = cache
  }

  /**
   * Cache patient data with proper sensitivity
   */
  async cachePatientData(
    patientId: string,
    dataType: string,
    data: unknown,
    options: {
      providerId?: string
      facilityId?: string
      clinicalContext?:
        | 'consultation'
        | 'surgery'
        | 'emergency'
        | 'administrative'
        | 'research'
      ttl?: number
      lgpdConsentId?: string
    } = {},
  ): Promise<CacheOperationResult> {
    const key = `patient:${patientId}:${dataType}`

    return this.cache.set(key, data, {
      sensitivity: CacheDataSensitivity.CONFIDENTIAL,
      ttl: options.ttl,
      _context: {
        patientId,
        providerId: options.providerId,
        facilityId: options.facilityId,
        clinicalContext: options.clinicalContext || 'consultation',
        dataClassification: CacheDataSensitivity.CONFIDENTIAL,
        lgpdConsentId: options.lgpdConsentId,
        retentionRequirement: 'standard',
      },
    })
  }

  /**
   * Cache clinical session data
   */
  async cacheClinicalSession(
    sessionId: string,
    sessionData: unknown,
    options: {
      patientId?: string
      providerId?: string
      clinicalContext?:
        | 'consultation'
        | 'surgery'
        | 'emergency'
        | 'administrative'
        | 'research'
    } = {},
  ): Promise<CacheOperationResult> {
    const key = `clinical:session:${sessionId}`

    return this.cache.set(key, sessionData, {
      sensitivity: CacheDataSensitivity.CONFIDENTIAL,
      ttl: 3600, // 1 hour for clinical sessions
      _context: {
        patientId: options.patientId,
        providerId: options.providerId,
        clinicalContext: options.clinicalContext || 'consultation',
        dataClassification: CacheDataSensitivity.CONFIDENTIAL,
        retentionRequirement: 'session',
      },
    })
  }

  /**
   * Cache emergency access data
   */
  async cacheEmergencyData(
    emergencyId: string,
    data: unknown,
    options: {
      patientId?: string
      facilityId?: string
      ttl?: number
    } = {},
  ): Promise<CacheOperationResult> {
    const key = `emergency:${emergencyId}`

    return this.cache.set(key, data, {
      sensitivity: CacheDataSensitivity.RESTRICTED,
      ttl: options.ttl || 1800, // 30 minutes for emergency data
      tier: CacheTier.MEMORY, // Keep in fastest tier
      _context: {
        patientId: options.patientId,
        facilityId: options.facilityId,
        clinicalContext: 'emergency',
        dataClassification: CacheDataSensitivity.RESTRICTED,
        retentionRequirement: 'temporary',
      },
    })
  }

  /**
   * Invalidate patient-related cache
   */
  async invalidatePatientCache(patientId: string): Promise<number> {
    const pattern = `*patient:${patientId}*`
    return this.cache.invalidatePattern(pattern, {
      patientId,
      dataClassification: CacheDataSensitivity.CONFIDENTIAL,
      retentionRequirement: 'standard', // Required field
    })
  }

  /**
   * Invalidate provider-related cache
   */
  async invalidateProviderCache(providerId: string): Promise<number> {
    const pattern = `*provider:${providerId}*`
    return this.cache.invalidatePattern(pattern, {
      providerId,
      dataClassification: CacheDataSensitivity.INTERNAL,
      retentionRequirement: 'standard', // Required field
    })
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
// Note: All classes are already exported above with their definitions
// No need to re-export them here to avoid TS2484 conflicts

export default CacheManagementService
