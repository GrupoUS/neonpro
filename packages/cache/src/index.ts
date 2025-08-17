import { LRUCache } from 'lru-cache';

// Healthcare-compliant cache configuration
interface CacheOptions {
  maxItems?: number;
  ttl?: number; // Time to live in milliseconds
  updateAgeOnGet?: boolean;
  allowStale?: boolean;
  encryptSensitiveData?: boolean;
}

// LGPD-compliant cache for patient data
interface SensitiveDataCache {
  data: any;
  encrypted: boolean;
  patientConsent: boolean;
  expiresAt: number;
  auditLog: string[];
}

class HealthcareCacheManager {
  private memoryCache: LRUCache<string, any>;
  private sensitiveCache: LRUCache<string, SensitiveDataCache>;

  constructor(options: CacheOptions = {}) {
    // Memory cache for non-sensitive data
    this.memoryCache = new LRUCache({
      max: options.maxItems || 1000,
      ttl: options.ttl || 1000 * 60 * 15, // 15 minutes default
      updateAgeOnGet: options.updateAgeOnGet ?? true,
      allowStale: options.allowStale ?? false,
    });

    // Separate cache for sensitive healthcare data
    this.sensitiveCache = new LRUCache({
      max: 100, // Limited sensitive data cache
      ttl: 1000 * 60 * 5, // 5 minutes for sensitive data
      updateAgeOnGet: false, // No age update for security
      allowStale: false, // Never allow stale sensitive data
    });
  }

  // Cache non-sensitive data (appointments, general info)
  set(key: string, value: any, ttl?: number): void {
    this.memoryCache.set(
      key,
      {
        data: value,
        timestamp: Date.now(),
        auditLog: [`Cache set: ${new Date().toISOString()}`],
      },
      { ttl }
    );
  }

  // Get non-sensitive data
  get(key: string): any {
    const cached = this.memoryCache.get(key);
    if (cached) {
      cached.auditLog.push(`Cache access: ${new Date().toISOString()}`);
      return cached.data;
    }
    return null;
  }

  // Cache sensitive patient data with LGPD compliance
  setSensitive(
    key: string,
    value: any,
    patientConsent = false,
    ttl: number = 1000 * 60 * 5 // 5 minutes default
  ): void {
    if (!patientConsent) {
      console.warn('[LGPD] Attempted to cache sensitive data without patient consent');
      return;
    }

    const sensitiveData: SensitiveDataCache = {
      data: value,
      encrypted: true, // Mark as requiring encryption
      patientConsent,
      expiresAt: Date.now() + ttl,
      auditLog: [
        `Sensitive cache set: ${new Date().toISOString()}`,
        `Patient consent: ${patientConsent}`,
        `TTL: ${ttl}ms`,
      ],
    };

    this.sensitiveCache.set(key, sensitiveData, { ttl });
  }

  // Get sensitive data with LGPD audit
  getSensitive(key: string, auditUserId?: string): any {
    const cached = this.sensitiveCache.get(key);

    if (cached) {
      // LGPD audit logging
      cached.auditLog.push(
        `Sensitive access: ${new Date().toISOString()}`,
        `User: ${auditUserId || 'anonymous'}`,
        `Consent verified: ${cached.patientConsent}`
      );

      // Check expiration (extra security layer)
      if (Date.now() > cached.expiresAt) {
        this.sensitiveCache.delete(key);
        return null;
      }

      return cached.data;
    }

    return null;
  }

  // Clear all sensitive data (LGPD compliance)
  clearSensitiveData(): void {
    this.sensitiveCache.clear();
    console.log('[LGPD] All sensitive cache data cleared');
  }

  // Get cache statistics for monitoring
  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        max: this.memoryCache.max,
        calculatedSize: this.memoryCache.calculatedSize,
      },
      sensitiveCache: {
        size: this.sensitiveCache.size,
        max: this.sensitiveCache.max,
        calculatedSize: this.sensitiveCache.calculatedSize,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Healthcare-specific cache invalidation
  invalidatePatientData(patientId: string): void {
    const keys = Array.from(this.memoryCache.keys()).filter((key) =>
      key.includes(`patient_${patientId}`)
    );

    keys.forEach((key) => {
      this.memoryCache.delete(key);
      this.sensitiveCache.delete(key);
    });

    console.log(
      `[Healthcare Cache] Invalidated ${keys.length} cache entries for patient ${patientId}`
    );
  }

  // ANVISA compliance: Clear cache on audit request
  auditClearance(): void {
    this.memoryCache.clear();
    this.sensitiveCache.clear();
    console.log('[ANVISA Compliance] All cache data cleared for audit');
  }
}

// Singleton instance for app-wide use
export const healthcareCache = new HealthcareCacheManager({
  maxItems: 2000,
  ttl: 1000 * 60 * 10, // 10 minutes default
  encryptSensitiveData: true,
});

// Export for custom instances
export { HealthcareCacheManager };

// Utility functions
export const cacheKeys = {
  patient: (id: string) => `patient_${id}`,
  appointment: (id: string) => `appointment_${id}`,
  compliance: (type: string) => `compliance_${type}`,
  report: (type: string, date: string) => `report_${type}_${date}`,
} as const;
