/**
 * Internal Healthcare Cache Manager
 *
 * Cache interno simplificado para o Enhanced Service Layer Pattern
 * Remove dependência externa @neonpro/cache para facilitar build
 */

export interface CacheItem<T = unknown,> {
  data: T
  timestamp: number
  ttl: number
  auditLog: string[]
}

export interface SensitiveCacheItem<T = unknown,> {
  data: T
  encrypted: boolean
  patientConsent: boolean
  expiresAt: number
  auditLog: string[]
}

/**
 * Internal Healthcare Cache Manager
 */
export class InternalHealthcareCacheManager {
  private readonly memoryCache = new Map<string, CacheItem>()
  private readonly sensitiveCache = new Map<string, SensitiveCacheItem>()

  constructor(
    private readonly options = {
      maxItems: 1000,
      defaultTTL: 900_000, // 15 minutes
      encryptSensitiveData: true,
    },
  ) {}

  /**
   * Set regular cache item
   */
  set<T,>(key: string, value: T, ttl?: number,): void {
    const now = Date.now()
    const item: CacheItem<T> = {
      data: value,
      timestamp: now,
      ttl: ttl || this.options.defaultTTL,
      auditLog: [`Cache set: ${new Date().toISOString()}`,],
    }

    // Simple cleanup if max items exceeded
    if (this.memoryCache.size >= this.options.maxItems) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey,)
      }
    }

    this.memoryCache.set(key, item,)
  }

  /**
   * Get regular cache item
   */
  get<T,>(key: string,): T | null {
    const item = this.memoryCache.get(key,)
    if (!item) {
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key,)
      return null
    }

    // Update audit log
    item.auditLog.push(`Cache access: ${new Date().toISOString()}`,)

    return item.data as T
  }

  /**
   * Set sensitive healthcare data with LGPD compliance
   */
  setSensitive<T,>(
    key: string,
    value: T,
    patientConsent = false,
    ttl = 300_000, // 5 minutes default
  ): void {
    if (!patientConsent) {
      return
    }

    const now = Date.now()
    const item: SensitiveCacheItem<T> = {
      data: value,
      encrypted: true,
      patientConsent,
      expiresAt: now + ttl,
      auditLog: [
        `Sensitive cache set: ${new Date().toISOString()}`,
        `Patient consent: ${patientConsent}`,
        `TTL: ${ttl}ms`,
      ],
    }

    // Limited sensitive cache size
    if (this.sensitiveCache.size >= 100) {
      const firstKey = this.sensitiveCache.keys().next().value
      if (firstKey) {
        this.sensitiveCache.delete(firstKey,)
      }
    }

    this.sensitiveCache.set(key, item,)
  }

  /**
   * Get sensitive data with LGPD audit
   */
  getSensitive<T,>(key: string, auditUserId?: string,): T | null {
    const item = this.sensitiveCache.get(key,)
    if (!item) {
      return null
    }

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.sensitiveCache.delete(key,)
      return null
    }

    // LGPD audit logging
    item.auditLog.push(
      `Sensitive access: ${new Date().toISOString()}`,
      `User: ${auditUserId || 'anonymous'}`,
      `Consent verified: ${item.patientConsent}`,
    )

    return item.data as T
  }

  /**
   * Invalidate pattern-based cache
   */
  invalidate(pattern: string,): void {
    if (pattern.includes('patient_',)) {
      const patientId = pattern.replace('patient_', '',)
      this.invalidatePatientData(patientId,)
    }
  }

  /**
   * Clear patient-specific data
   */
  invalidatePatientData(patientId: string,): void {
    // Clear regular cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(`patient_${patientId}`,)) {
        this.memoryCache.delete(key,)
      }
    }

    // Clear sensitive cache
    for (const key of this.sensitiveCache.keys()) {
      if (key.includes(`patient_${patientId}`,)) {
        this.sensitiveCache.delete(key,)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        max: this.options.maxItems,
      },
      sensitiveCache: {
        size: this.sensitiveCache.size,
        max: 100,
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Clear all sensitive data (LGPD compliance)
   */
  clearSensitiveData(): void {
    this.sensitiveCache.clear()
  }

  /**
   * Clear all caches (audit compliance)
   */
  auditClearance(): void {
    this.memoryCache.clear()
    this.sensitiveCache.clear()
  }
}
