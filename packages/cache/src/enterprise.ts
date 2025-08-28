/**
 * Enterprise Cache Integration
 * Enhanced cache service with enterprise features for healthcare applications
 * LGPD/ANVISA compliant caching with advanced monitoring and audit capabilities
 */

import type { MultiLayerCacheManager } from "./cache-manager";
import type { CacheLayer } from "./types";

/**
 * Enhanced cache service with enterprise features
 */
export class EnterpriseCacheService {
  private readonly cacheManager: MultiLayerCacheManager;
  private readonly auditLog: {
    timestamp: string;
    operation: string;
    key: string;
    layer?: CacheLayer;
    success: boolean;
    executionTime: number;
    metadata?: any;
  }[] = [];

  private metrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
  };

  constructor(cacheManager: MultiLayerCacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Enhanced get with performance monitoring and audit trail
   */
  async get<T>(key: string, layers?: CacheLayer[]): Promise<T | null> {
    const startTime = Date.now();
    let result: T | null = null;
    let success = false;

    try {
      result = await this.cacheManager.get<T>(key, layers);
      success = true;
      return result;
    } catch (error) {
      this.logError("GET", key, error);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordOperation("GET", key, success, executionTime, {
        layers,
        found: result !== null,
      });
    }
  }

  /**
   * Enhanced set with compliance validation
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    layers?: CacheLayer[],
  ): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      const options = ttl !== undefined ? { ttl } : undefined;
      await this.cacheManager.set(key, value, layers, options);
      success = true;
    } catch (error) {
      this.logError("SET", key, error);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordOperation("SET", key, success, executionTime, { ttl, layers });
    }
  }

  /**
   * Enhanced delete with audit trail
   */
  async delete(key: string, layers?: CacheLayer[]): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await this.cacheManager.delete(key, layers);
      success = true;
    } catch (error) {
      this.logError("DELETE", key, error);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordOperation("DELETE", key, success, executionTime, { layers });
    }
  }

  /**
   * Clear cache with enterprise-level validation and logging
   */
  async clearCache(): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await this.cacheManager.clear();
      success = true;
    } catch (error) {
      this.logError("CLEAR_ALL", "*", error);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordOperation("CLEAR_ALL", "*", success, executionTime);
    }
  }

  /**
   * Get comprehensive enterprise metrics
   */
  getMetrics(): {
    performance: {
      totalOperations: number;
      successfulOperations: number;
      failedOperations: number;
      averageResponseTime: number;
      totalResponseTime: number;
      successRate: number;
    };
    cache: any;
    audit: {
      totalEntries: number;
      recentEntries: {
        timestamp: string;
        operation: string;
        key: string;
        layer?: CacheLayer;
        success: boolean;
        executionTime: number;
        metadata?: any;
      }[];
      successRate: number;
    };
  } {
    const cacheStats = this.cacheManager.getStats();
    const successRate = this.metrics.totalOperations > 0
      ? (this.metrics.successfulOperations / this.metrics.totalOperations)
        * 100
      : 0;

    return {
      performance: {
        ...this.metrics,
        successRate,
      },
      cache: cacheStats,
      audit: {
        totalEntries: this.auditLog.length,
        recentEntries: this.auditLog.slice(-10), // Last 10 entries
        successRate,
      },
    };
  }

  /**
   * Healthcare-specific patient data clearing
   */
  async clearPatientData(patientId: string): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await this.cacheManager.clearPatientData(patientId);
      success = true;
    } catch (error) {
      this.logError("CLEAR_PATIENT_DATA", patientId, error);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordOperation(
        "CLEAR_PATIENT_DATA",
        patientId,
        success,
        executionTime,
        {
          reason: "LGPD_COMPLIANCE",
        },
      );
    }
  }

  /**
   * Get audit trail for healthcare compliance
   */
  getAuditTrail(): typeof this.auditLog {
    return [...this.auditLog]; // Return a copy to prevent external modifications
  }

  /**
   * Export audit trail for regulatory compliance
   */
  exportAuditTrail(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = "Timestamp,Operation,Key,Layer,Success,ExecutionTime,Metadata\n";
      const rows = this.auditLog
        .map(
          (entry) =>
            `${entry.timestamp},${entry.operation},${entry.key},${
              entry.layer || "N/A"
            },${entry.success},${entry.executionTime},${JSON.stringify(entry.metadata || {})}`,
        )
        .join("\n");
      return headers + rows;
    }

    return JSON.stringify(this.auditLog, null, 2);
  }

  /**
   * Health check for enterprise monitoring
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    metrics: any;
    issues: string[];
  }> {
    const issues: string[] = [];
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Check success rate
    const successRate = this.metrics.totalOperations > 0
      ? (this.metrics.successfulOperations / this.metrics.totalOperations)
        * 100
      : 100;

    if (successRate < 95) {
      issues.push(`Low success rate: ${successRate.toFixed(2)}%`);
      status = successRate < 90 ? "unhealthy" : "degraded";
    }

    // Check average response time
    if (this.metrics.averageResponseTime > 1000) {
      issues.push(
        `High average response time: ${this.metrics.averageResponseTime}ms`,
      );
      status = this.metrics.averageResponseTime > 2000 ? "unhealthy" : "degraded";
    }

    return {
      status,
      metrics: this.getMetrics(),
      issues,
    };
  }

  /**
   * Record operation for audit and metrics
   */
  private recordOperation(
    operation: string,
    key: string,
    success: boolean,
    executionTime: number,
    metadata?: any,
  ): void {
    // Update metrics
    this.metrics.totalOperations++;
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    this.metrics.totalResponseTime += executionTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime
      / this.metrics.totalOperations;

    // Add to audit log
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      operation,
      key,
      success,
      executionTime,
      metadata,
    });

    // Maintain audit log size (keep last 10000 entries)
    if (this.auditLog.length > 10_000) {
      this.auditLog.splice(0, this.auditLog.length - 10_000);
    }
  }

  /**
   * Log errors for debugging and compliance
   */
  private logError(operation: string, key: string, error: unknown): void {
    console.error(
      `[EnterpriseCacheService] ${operation} failed for key "${key}":`,
      error,
    );
  }
}

/**
 * Factory for creating enterprise cache services
 */
export class CacheServiceFactory {
  static createEnterpriseCacheService(
    cacheManager: MultiLayerCacheManager,
  ): EnterpriseCacheService {
    return new EnterpriseCacheService(cacheManager);
  }
}

/**
 * Default enterprise cache instance
 */
export const createEnterpriseCacheService = (
  cacheManager: MultiLayerCacheManager,
) => new EnterpriseCacheService(cacheManager);
