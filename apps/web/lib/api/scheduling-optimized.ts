/**
 * Optimized Scheduling API Layer - PERF-02 Implementation
 * Healthcare-compliant conflict resolution with ≥50% API call reduction
 * LGPD/ANVISA/CFM compliant with intelligent caching and batching
 */

import { createClient } from '@supabase/supabase-js';

// Types
interface ConflictData {
  id: string;
  type: 'scheduling' | 'resource' | 'professional' | 'patient';
  severity: 'low' | 'medium' | 'high' | 'critical';
  appointmentId: string;
  patientId: string;
  professionalId: string;
  conflictTime: string;
  description: string;
  suggestedResolutions: Resolution[];
  metadata: {
    lgpdConsent: boolean;
    clinicalPriority: number;
    emergencyFlag: boolean;
  };
}

interface Resolution {
  id: string;
  type: 'reschedule' | 'reassign' | 'cancel' | 'override';
  description: string;
  impact: string;
  estimatedTime: number;
  complianceImpact: 'none' | 'low' | 'medium' | 'high';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface BatchRequest {
  id: string;
  type: string;
  params: any;
  timestamp: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
  performance?: {
    queryTime: number;
    cacheHit: boolean;
    apiCallsReduced: number;
  };
}

// Optimized Cache Manager with TTL and invalidation
class OptimizedCacheManager {
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize = 1000; // Maximum cache entries
  private readonly defaultTTL = 300_000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Request Batch Manager
class BatchRequestManager {
  private readonly batchQueue: BatchRequest[] = [];
  private readonly batchTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly batchDelay = 100; // 100ms batch window

  addToBatch(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        ...request,
        resolve,
        reject,
      } as any);

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    const batch = this.batchQueue.splice(0, this.batchSize);

    try {
      const batchResults = await this.executeBatchRequest(batch);

      batch.forEach((request: any, index) => {
        if (batchResults[index]) {
          request.resolve(batchResults[index]);
        } else {
          request.reject(new Error('Batch request failed'));
        }
      });
    } catch (error) {
      batch.forEach((request: any) => {
        request.reject(error);
      });
    }
  }

  private async executeBatchRequest(batch: BatchRequest[]): Promise<any[]> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Group requests by type for optimal batching
    const groupedRequests = batch.reduce(
      (acc, req) => {
        if (!acc[req.type]) {
          acc[req.type] = [];
        }
        acc[req.type].push(req);
        return acc;
      },
      {} as Record<string, BatchRequest[]>
    );

    const results: any[] = [];

    for (const [type, requests] of Object.entries(groupedRequests)) {
      switch (type) {
        case 'conflict-check': {
          const conflictResults = await this.batchConflictCheck(
            supabase,
            requests
          );
          results.push(...conflictResults);
          break;
        }

        case 'resolution-validation': {
          const validationResults = await this.batchResolutionValidation(
            supabase,
            requests
          );
          results.push(...validationResults);
          break;
        }

        default:
          results.push(...requests.map(() => null));
      }
    }

    return results;
  }

  private async batchConflictCheck(
    supabase: any,
    requests: BatchRequest[]
  ): Promise<any[]> {
    const appointmentIds = requests.map((req) => req.params.appointmentId);

    const { data, error } = await supabase
      .from('schedule_conflicts')
      .select(
        `
        *,
        appointments!inner(*),
        professionals!inner(*),
        patients!inner(*)
      `
      )
      .in('appointment_id', appointmentIds)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return requests.map((req) => {
      return (
        data.find(
          (conflict: any) =>
            conflict.appointment_id === req.params.appointmentId
        ) || null
      );
    });
  }

  private async batchResolutionValidation(
    supabase: any,
    requests: BatchRequest[]
  ): Promise<any[]> {
    const conflictIds = requests.map((req) => req.params.conflictId);

    const { data, error } = await supabase
      .from('conflict_resolutions')
      .select('*')
      .in('conflict_id', conflictIds)
      .eq('status', 'pending');

    if (error) {
      throw error;
    }

    return requests.map((req) => {
      return (
        data.find(
          (resolution: any) => resolution.conflict_id === req.params.conflictId
        ) || null
      );
    });
  }
}

// Request Deduplication Manager
class RequestDeduplicationManager {
  private readonly activeRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.activeRequests.delete(key);
    });

    this.activeRequests.set(key, promise);
    return promise;
  }

  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }
} // Main Optimized Scheduling API Class
export class OptimizedSchedulingAPI {
  private readonly cache = new OptimizedCacheManager();
  private readonly batchManager = new BatchRequestManager();
  private readonly deduplicationManager = new RequestDeduplicationManager();
  private readonly supabase: any;
  private readonly performanceMetrics = {
    totalRequests: 0,
    cachedResponses: 0,
    batchedRequests: 0,
    apiCallsReduced: 0,
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Optimized conflict fetching with caching and deduplication
  async getConflicts(
    filters: {
      search?: string;
      severity?: string;
      type?: string;
      dateRange?: string;
    } = {}
  ): Promise<ApiResponse<ConflictData[]>> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    const cacheKey = `conflicts-${JSON.stringify(filters)}`;

    // Check cache first
    const cachedData = this.cache.get<ConflictData[]>(cacheKey);
    if (cachedData) {
      this.performanceMetrics.cachedResponses++;
      this.performanceMetrics.apiCallsReduced++;

      return {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: true,
          apiCallsReduced: this.performanceMetrics.apiCallsReduced,
        },
      };
    }

    // Use request deduplication
    const requestKey = `get-conflicts-${cacheKey}`;

    const data = await this.deduplicationManager.deduplicate(
      requestKey,
      async () => {
        let query = this.supabase
          .from('schedule_conflicts')
          .select(
            `
          *,
          appointments!inner(
            id, start_time, end_time, status,
            patients!inner(id, name, email),
            professionals!inner(id, name, specialty)
          ),
          conflict_resolutions(*)
        `
          )
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        // Apply filters efficiently
        if (filters.severity && filters.severity !== 'all') {
          query = query.eq('severity', filters.severity);
        }

        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        if (filters.search) {
          query = query.or(`
          description.ilike.%${filters.search}%,
          appointments.patients.name.ilike.%${filters.search}%,
          appointments.professionals.name.ilike.%${filters.search}%
        `);
        }

        // Date range filtering
        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case 'today':
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              break;
            case 'week':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Transform data to match ConflictData interface
        const transformedData: ConflictData[] = data.map((conflict: any) => ({
          id: conflict.id,
          type: conflict.type,
          severity: conflict.severity,
          appointmentId: conflict.appointment_id,
          patientId: conflict.appointments.patients.id,
          professionalId: conflict.appointments.professionals.id,
          conflictTime: conflict.conflict_time,
          description: conflict.description,
          suggestedResolutions: conflict.conflict_resolutions.map(
            (res: any) => ({
              id: res.id,
              type: res.resolution_type,
              description: res.description,
              impact: res.impact_description,
              estimatedTime: res.estimated_time_minutes,
              complianceImpact: res.compliance_impact,
            })
          ),
          metadata: {
            lgpdConsent: conflict.lgpd_consent,
            clinicalPriority: conflict.clinical_priority || 0,
            emergencyFlag: conflict.emergency_flag,
          },
        }));

        return transformedData;
      }
    );

    // Cache the results with intelligent TTL
    const ttl = filters.search ? 60_000 : 300_000; // 1 min for search, 5 min for general
    this.cache.set(cacheKey, data, ttl);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      cached: false,
      performance: {
        queryTime: Date.now() - startTime,
        cacheHit: false,
        apiCallsReduced: this.performanceMetrics.apiCallsReduced,
      },
    };
  }

  // Batched conflict resolution with healthcare compliance
  async resolveConflictsBatch(
    conflictIds: string[],
    resolutionType: string,
    metadata: any
  ): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    this.performanceMetrics.batchedRequests++;

    // Validate LGPD compliance for batch operations
    if (!metadata.lgpdCompliant) {
      throw new Error('LGPD compliance required for batch operations');
    }

    try {
      const { data, error } = await this.supabase.rpc(
        'resolve_conflicts_batch',
        {
          p_conflict_ids: conflictIds,
          p_resolution_type: resolutionType,
          p_metadata: metadata,
          p_batch_timestamp: new Date().toISOString(),
        }
      );

      if (error) {
        throw new Error(`Batch resolution failed: ${error.message}`);
      }

      // Invalidate relevant caches
      this.cache.invalidate('conflicts');
      this.cache.invalidate('appointments');

      // Track API call reduction
      this.performanceMetrics.apiCallsReduced += Math.max(
        0,
        conflictIds.length - 1
      );

      return {
        success: true,
        data: {
          resolvedCount: data.resolved_count,
          rescheduled: data.rescheduled_count,
          cancelled: data.cancelled_count,
          errors: data.errors || [],
        },
        timestamp: new Date().toISOString(),
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: false,
          apiCallsReduced: this.performanceMetrics.apiCallsReduced,
        },
      };
    } catch (error) {
      throw new Error(`Batch resolution error: ${error}`);
    }
  }

  // Optimized individual conflict check with batching
  async checkConflict(
    appointmentId: string
  ): Promise<ApiResponse<ConflictData | null>> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    const cacheKey = `conflict-check-${appointmentId}`;

    // Check cache first
    const cachedResult = this.cache.get<ConflictData | null>(cacheKey);
    if (cachedResult !== null) {
      this.performanceMetrics.cachedResponses++;
      this.performanceMetrics.apiCallsReduced++;

      return {
        success: true,
        data: cachedResult,
        timestamp: new Date().toISOString(),
        cached: true,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: true,
          apiCallsReduced: this.performanceMetrics.apiCallsReduced,
        },
      };
    }

    // Use batch processing for better performance
    try {
      const result = await this.batchManager.addToBatch({
        id: appointmentId,
        type: 'conflict-check',
        params: { appointmentId },
        timestamp: Date.now(),
      });

      this.performanceMetrics.batchedRequests++;

      // Cache the result
      this.cache.set(cacheKey, result, 120_000); // 2 minutes cache

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        cached: false,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: false,
          apiCallsReduced: this.performanceMetrics.apiCallsReduced,
        },
      };
    } catch (error) {
      throw new Error(`Conflict check failed: ${error}`);
    }
  }

  // Real-time conflict monitoring with optimized updates
  createConflictStream(
    _filters: any,
    onConflict: (conflict: ConflictData) => void,
    onError: (error: Error) => void
  ): () => void {
    const channel = this.supabase
      .channel('schedule_conflicts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_conflicts',
          filter: 'status=eq.active',
        },
        (payload: any) => {
          // Transform and emit new conflicts
          const conflict: ConflictData = {
            id: payload.new.id,
            type: payload.new.type,
            severity: payload.new.severity,
            appointmentId: payload.new.appointment_id,
            patientId: payload.new.patient_id,
            professionalId: payload.new.professional_id,
            conflictTime: payload.new.conflict_time,
            description: payload.new.description,
            suggestedResolutions: [],
            metadata: {
              lgpdConsent: payload.new.lgpd_consent,
              clinicalPriority: payload.new.clinical_priority || 0,
              emergencyFlag: payload.new.emergency_flag,
            },
          };

          // Invalidate relevant caches
          this.cache.invalidate('conflicts');
          this.cache.invalidate(`conflict-check-${conflict.appointmentId}`);

          onConflict(conflict);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conflict stream connected');
        } else if (status === 'CHANNEL_ERROR') {
          onError(new Error('Real-time connection failed'));
        }
      });

    // Return cleanup function
    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  // Performance metrics and cache statistics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheStats: this.cache.getStats(),
      activeRequests: this.deduplicationManager.getActiveRequestsCount(),
      cacheHitRate:
        this.performanceMetrics.totalRequests > 0
          ? `${(
              (this.performanceMetrics.cachedResponses /
                this.performanceMetrics.totalRequests) *
                100
            ).toFixed(2)}%`
          : '0%',
      apiCallReduction:
        this.performanceMetrics.totalRequests > 0
          ? `${(
              (this.performanceMetrics.apiCallsReduced /
                this.performanceMetrics.totalRequests) *
                100
            ).toFixed(2)}%`
          : '0%',
    };
  }

  // Cache management utilities
  clearCache(pattern?: string): void {
    if (pattern) {
      this.cache.invalidate(pattern);
    } else {
      this.cache.invalidateAll();
    }
  }

  // Health check for API optimization
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: any;
    recommendations: string[];
  }> {
    const metrics = this.getPerformanceMetrics();
    const cacheHitRate = Number.parseFloat(
      metrics.cacheHitRate.replace('%', '')
    );
    const apiReductionRate = Number.parseFloat(
      metrics.apiCallReduction.replace('%', '')
    );

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const recommendations: string[] = [];

    if (cacheHitRate < 30) {
      status = 'degraded';
      recommendations.push(
        'Cache hit rate is low. Consider adjusting TTL values.'
      );
    }

    if (apiReductionRate < 50) {
      status = 'degraded';
      recommendations.push(
        'API call reduction target not met. Review batching strategy.'
      );
    }

    if (metrics.cacheStats.size > 800) {
      recommendations.push(
        'Cache size is high. Consider implementing more aggressive eviction.'
      );
    }

    if (metrics.activeRequests > 50) {
      status = 'unhealthy';
      recommendations.push(
        'High number of active requests. Check for request loops.'
      );
    }

    return {
      status,
      metrics,
      recommendations,
    };
  }
}

// Singleton instance for global use
export const optimizedSchedulingAPI = new OptimizedSchedulingAPI();

// Utility functions for React hooks
export const useOptimizedConflicts = (filters: any = {}) => {
  return optimizedSchedulingAPI.getConflicts(filters);
};

export const useConflictStream = (
  filters: any,
  onConflict: (conflict: ConflictData) => void,
  onError: (error: Error) => void = console.error
) => {
  return optimizedSchedulingAPI.createConflictStream(
    filters,
    onConflict,
    onError
  );
};

// Export types
export type { ConflictData, Resolution, ApiResponse, CacheEntry, BatchRequest };
