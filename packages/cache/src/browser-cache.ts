import type { CacheEntry, CacheOperation, CacheStats, HealthcareDataPolicy } from "./types";

type BrowserCacheEntry = CacheEntry<unknown> & {
  lastAccessed: number;
  sensitiveData?: boolean;
  lgpdConsent?: boolean;
  auditRequired?: boolean;
  dataClassification?: HealthcareDataPolicy["dataClassification"];
  compressed?: boolean;
};

export class BrowserCacheLayer implements CacheOperation {
  private cache = new Map<string, BrowserCacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
  };
  private responseTimeBuffer: number[] = [];

  constructor(
    private readonly config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      storageQuota: 50 * 1024 * 1024, // 50MB
      lgpdCompliant: true,
      compressionEnabled: true,
    },
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // Check TTL expiration
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // LGPD compliance check
    if (entry.sensitiveData && !entry.lgpdConsent) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // Update last accessed for LRU
    entry.lastAccessed = Date.now();
    this.cache.set(key, entry);

    this.stats.hits++;
    this.updateStats(startTime);

    // Retrieve raw string (decompress if necessary), then parse JSON into T
    try {
      let raw: string;
      if (entry.compressed) {
        if (typeof entry.value !== "string") {
          console.warn("BrowserCacheLayer.get: compressed entry but non-string value", {
            key,
            typeofValue: typeof entry.value,
          });
          return null;
        }
        raw = await this.decompress(entry.value);
      } else {
        raw = String(entry.value ?? "");
      }
      const parsed = JSON.parse(raw) as T;
      return parsed;
    } catch (err) {
      // On any failure, treat as cache miss for safety
      console.warn("BrowserCacheLayer.get: failed to deserialize entry", {
        key,
        compressed: entry.compressed,
        error: (err as Error)?.message ?? err,
      });
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    policy?: HealthcareDataPolicy,
  ): Promise<void> {
    // Check storage quota before adding new entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const effectiveTTL = ttl || this.config.defaultTTL;
    const sensitiveData = policy?.dataClassification === "CONFIDENTIAL"
      || policy?.dataClassification === "RESTRICTED";

    // Don't store highly sensitive data in browser cache
    if (policy?.dataClassification === "RESTRICTED") {
      return; // Skip browser caching for restricted data
    }

    const serialized = JSON.stringify(value);

    let storedValue: string = serialized;
    let compressed = false;

    if (this.config.compressionEnabled) {
      try {
        storedValue = await this.compress(serialized);
        // If compression returned identical value without base64 markers, assume no compression
        compressed = storedValue !== serialized;
      } catch (e) {
        console.warn("BrowserCacheLayer.set: compression failed, storing uncompressed", {
          key,
          error: (e as Error)?.message ?? e,
        });
        storedValue = serialized;
        compressed = false;
      }
    }

    const entry: BrowserCacheEntry = {
      value: storedValue,
      timestamp: Date.now(),
      ttl: effectiveTTL,
      lastAccessed: Date.now(),
      sensitiveData,
      lgpdConsent: policy?.requiresConsent ?? true, // Default to true unless explicit consent is required
      auditRequired: policy?.auditRequired || false,
      compressed,
      ...(policy && policy.dataClassification
        ? { dataClassification: policy.dataClassification }
        : {}),
    };

    this.cache.set(key, entry);

    // Audit log for healthcare data
    if (policy?.auditRequired) {
      this.logCacheOperation(key, "SET", policy);
    }
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    this.cache.delete(key);

    // Audit log if required
    if (entry?.auditRequired) {
      this.logCacheOperation(key, "DELETE", {
        dataClassification: entry.dataClassification ?? "INTERNAL",
        auditRequired: true,
        requiresConsent: entry.lgpdConsent ?? false,
      } as HealthcareDataPolicy);
    }
  }

  async clear(): Promise<void> {
    // Audit log for mass deletion
    const auditRequiredEntries = Array.from(this.cache.entries()).filter(
      ([, entry]) => entry.auditRequired,
    );

    this.cache.clear();
    this.resetStats();

    // Log mass deletion for audit
    if (auditRequiredEntries.length > 0) {
      this.logCacheOperation("*", "CLEAR", {
        auditRequired: true,
        requiresConsent: true,
        dataClassification: "INTERNAL",
      } as HealthcareDataPolicy);
    }
  }

  async getStats(): Promise<CacheStats> {
    this.stats.hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests) * 100
      : 0;
    return { ...this.stats };
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.some((tag: string) => tags.includes(tag))) {
        await this.delete(key);
      }
    }
  }

  // LGPD compliance methods
  async grantConsent(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry && entry.sensitiveData) {
      entry.lgpdConsent = true;
      this.cache.set(key, entry);

      if (entry.auditRequired) {
        this.logCacheOperation(key, "CONSENT_GRANTED", {
          auditRequired: true,
          requiresConsent: true,
          dataClassification: entry.dataClassification ?? "INTERNAL",
        } as HealthcareDataPolicy);
      }
    }
  }

  async revokeConsent(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry && entry.sensitiveData) {
      // Delete data when consent is revoked
      await this.delete(key);

      this.logCacheOperation(key, "CONSENT_REVOKED", {
        auditRequired: true,
        requiresConsent: false,
        dataClassification: entry.dataClassification ?? "INTERNAL",
      } as HealthcareDataPolicy);
    }
  }

  async clearPatientData(patientId: string): Promise<void> {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.includes(`patient_${patientId}`)
    );

    for (const key of keysToDelete) {
      await this.delete(key);
    }

    this.logCacheOperation(`patient_${patientId}:*`, "PATIENT_DATA_CLEARED", {
      auditRequired: true,
      requiresConsent: true,
      dataClassification: "CONFIDENTIAL",
    } as HealthcareDataPolicy);
  }

  // Browser-specific utilities
  getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    const used = this.calculateStorageUsed();
    const available = this.config.storageQuota - used;
    const percentage = (used / this.config.storageQuota) * 100;

    return { used, available, percentage };
  }

  async optimizeStorage(): Promise<{
    cleaned: number;
    sizeBefore: number;
    sizeAfter: number;
  }> {
    const sizeBefore = this.calculateStorageUsed();
    let cleaned = 0;

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    const sizeAfter = this.calculateStorageUsed();
    return { cleaned, sizeBefore, sizeAfter };
  }

  // Utility methods
  private async compress(data: string): Promise<string> {
    try {
      // Prefer Web Compression Streams when available
      const CompressionStreamCtor = (globalThis as any).CompressionStream;
      if (CompressionStreamCtor) {
        const cs = new CompressionStreamCtor("gzip");
        const encoder = new TextEncoder();
        const inputStream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode(data));
            controller.close();
          },
        });
        const compressedStream = inputStream.pipeThrough(cs);
        const compressedBuffer = await new Response(compressedStream).arrayBuffer();
        const bytes = new Uint8Array(compressedBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(Number(bytes[i]));
        return btoa(binary);
      }

      // Fallback to pako if available globally
      const pako = (globalThis as any).pako;
      if (pako?.deflate) {
        const bytes: Uint8Array = pako.deflate(data);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(Number(bytes[i]));
        return btoa(binary);
      }
    } catch (e) {
      // Swallow and fallback to uncompressed
      console.warn("BrowserCacheLayer.compress: compression failed", (e as Error)?.message ?? e);
    }
    // Fallback: return original (uncompressed)
    return data;
  }

  private async decompress(data: string): Promise<string> {
    try {
      // Base64 decode into bytes
      let bytes: Uint8Array | null = null;
      try {
        const binary = atob(data);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        bytes = arr;
      } catch {
        // Not base64 (likely uncompressed original), return as-is
        return data;
      }

      const DecompressionStreamCtor = (globalThis as any).DecompressionStream;
      if (DecompressionStreamCtor && bytes) {
        const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(
          new DecompressionStreamCtor("gzip"),
        );
        const decompressedBuffer = await new Response(stream).arrayBuffer();
        return new TextDecoder().decode(decompressedBuffer);
      }

      const pako = (globalThis as any).pako;
      if (pako?.inflate && bytes) {
        const out: string = pako.inflate(bytes, { to: "string" });
        return out;
      }
    } catch (e) {
      console.warn(
        "BrowserCacheLayer.decompress: decompression failed",
        (e as Error)?.message ?? e,
      );
    }
    // Fallback: return original
    return data;
  }

  private calculateStorageUsed(): number {
    // Rough estimation of storage used
    let total = 0;
    for (const [, entry] of this.cache.entries()) {
      const json = JSON.stringify(entry.value ?? "");
      total += json.length;
    }
    return total;
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed && entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.responseTimeBuffer.push(responseTime);

    if (this.responseTimeBuffer.length > 100) {
      this.responseTimeBuffer.shift();
    }

    this.stats.averageResponseTime = this.responseTimeBuffer.reduce((a, b) => a + b, 0)
      / this.responseTimeBuffer.length;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    };
    this.responseTimeBuffer = [];
  }

  private logCacheOperation(_key: string, _op: string, _policy: HealthcareDataPolicy): void {
    // Placeholder for integration with audit service
  }
}
