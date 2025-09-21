/**
 * Healthcare Performance Optimization Utilities
 *
 * Advanced performance optimization features for healthcare platform including:
 * - Query optimization and caching strategies
 * - Connection pool management and monitoring
 * - Healthcare-specific performance metrics
 * - Memory optimization for large patient datasets
 * - Batch operations for bulk healthcare data processing
 * - Performance monitoring and alerting
 */

import { type HealthcarePrismaClient } from '../clients/prisma';
import { HealthcareLogger } from './healthcare-errors.js';

// Performance metrics interface
interface PerformanceMetrics {
  queryCount: number;
  avgQueryTime: number;
  totalQueryTime: number;
  slowQueries: Array<{
    _query: string;
    duration: number;
    timestamp: Date;
  }>;
  cacheHitRate: number;
  connectionPoolStatus: {
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
  };
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

// Query optimization configuration
interface QueryOptimizationConfig {
  cacheEnabled: boolean;
  cacheTTL: number; // Cache time-to-live in seconds
  slowQueryThreshold: number; // Milliseconds
  maxBatchSize: number;
  enableQueryLogging: boolean;
  enablePerformanceMonitoring: boolean;
}

// Cache interface for query results
interface QueryCache {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): { hits: number; misses: number; size: number };
}

// Simple in-memory cache implementation
class InMemoryQueryCache implements QueryCache {
  private cache = new Map<string, { value: unknown; expires: number }>();
  private stats = { hits: 0, misses: 0 };

  async get(key: string): Promise<unknown | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  async set(key: string, value: unknown, ttl = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): { hits: number; misses: number; size: number } {
    return {
      ...this.stats,
      size: this.cache.size,
    };
  }
}

// Healthcare query optimizer
export class HealthcareQueryOptimizer {
  private prisma: HealthcarePrismaClient;
  private cache: QueryCache;
  private config: QueryOptimizationConfig;
  private logger: HealthcareLogger;
  private metrics: PerformanceMetrics;

  constructor(
    prisma: HealthcarePrismaClient,
    config: Partial<QueryOptimizationConfig> = {},
    cache?: QueryCache,
  ) {
    this.prisma = prisma;
    this.cache = cache || new InMemoryQueryCache();
    this.config = {
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes default
      slowQueryThreshold: 1000, // 1 second
      maxBatchSize: 100,
      enableQueryLogging: process.env.NODE_ENV === 'development',
      enablePerformanceMonitoring: true,
      ...config,
    };
    this.logger = new HealthcareLogger(prisma);
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      queryCount: 0,
      avgQueryTime: 0,
      totalQueryTime: 0,
      slowQueries: [],
      cacheHitRate: 0,
      connectionPoolStatus: {
        active: 0,
        idle: 0,
        total: 0,
        maxConnections: 20,
      },
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
      },
    };
  }

  /**
   * Optimized patient search with caching and pagination
   */
  async searchPatientsOptimized(
    clinicId: string,
    searchParams: {
      _query?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: Record<string, unknown>;
    },
  ): Promise<{
    patients: Array<Record<string, unknown>>;
    total: number;
    page: number;
    totalPages: number;
    fromCache: boolean;
  }> {
    const startTime = Date.now();
    const {
      query,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      filters,
    } = searchParams;

    // Create cache key
    const cacheKey = `patients:${clinicId}:${JSON.stringify(searchParams)}`;

    // Try cache first
    if (this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.updateMetrics(Date.now() - startTime, false, true);
        return { ...cached, fromCache: true };
      }
    }

    try {
      // Build optimized query
      const whereClause: Record<string, unknown> = {
        clinicId,
        isActive: true,
      };

      // Add filters if they exist
      if (filters && typeof filters === 'object') {
        Object.assign(whereClause, filters);
      }

      // Add search conditions
      if (_query) {
        whereClause.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phonePrimary: { contains: query } },
          { medicalRecordNumber: { contains: query } },
        ];
      }

      // Execute optimized queries in parallel
      const [patients, total] = await Promise.all([
        this.prisma.patient.findMany({
          where: whereClause,
          select: {
            id: true,
            medicalRecordNumber: true,
            fullName: true,
            email: true,
            phonePrimary: true,
            birthDate: true,
            gender: true,
            patientStatus: true,
            lastVisitDate: true,
            nextAppointmentDate: true,
            noShowRiskScore: true,
            updatedAt: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.patient.count({ where: whereClause }),
      ]);

      const result = {
        patients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        fromCache: false,
      };

      // Cache the result
      if (this.config.cacheEnabled) {
        await this.cache.set(cacheKey, result, this.config.cacheTTL);
      }

      this.updateMetrics(Date.now() - startTime, false, false);
      return result;
    } catch (_error) {
      this.updateMetrics(Date.now() - startTime, true, false);
      throw error;
    }
  }

  /**
   * Optimized appointment listing with preloaded relationships
   */
  async getAppointmentsOptimized(
    clinicId: string,
    options: {
      professionalId?: string;
      patientId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: string[];
      includePatientDetails?: boolean;
      includeProfessionalDetails?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    appointments: Array<Record<string, unknown>>;
    total: number;
    fromCache: boolean;
  }> {
    const startTime = Date.now();
    const {
      professionalId: _professionalId,
      patientId: _patientId,
      startDate: _startDate,
      endDate: _endDate,
      status: _status,
      includePatientDetails = true,
      includeProfessionalDetails = true,
      page = 1,
      limit = 50,
    } = options;

    const cacheKey = `appointments:${clinicId}:${JSON.stringify(options)}`;

    // Try cache first
    if (this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.updateMetrics(Date.now() - startTime, false, true);
        return { ...cached, fromCache: true };
      }
    }

    try {
      const whereClause = {
        clinicId,
        isActive: true,
      };

      // Add filters if they exist
      if (filters && typeof filters === 'object') {
        Object.assign(whereClause, filters);
      }

      // Build optimized include clause
      const include: Record<string, unknown> = {
        serviceType: {
          select: {
            id: true,
            name: true,
            duration_minutes: true,
            price: true,
          },
        },
      };

      if (includePatientDetails) {
        include.patient = {
          select: {
            id: true,
            fullName: true,
            phonePrimary: true,
            email: true,
            birthDate: true,
            noShowRiskScore: true,
          },
        };
      }

      if (includeProfessionalDetails) {
        include.professional = {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            color: true,
          },
        };
      }

      const [appointments, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where: whereClause,
          include,
          orderBy: { startTime: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.appointment.count({ where: whereClause }),
      ]);

      const result = { appointments, total, fromCache: false };

      // Cache with shorter TTL for real-time data
      if (this.config.cacheEnabled) {
        await this.cache.set(cacheKey, result, 60); // 1 minute for appointments
      }

      this.updateMetrics(Date.now() - startTime, false, false);
      return result;
    } catch (_error) {
      this.updateMetrics(Date.now() - startTime, true, false);
      throw error;
    }
  }

  /**
   * Batch operations for bulk data processing
   */
  async batchCreatePatients(
    clinicId: string,
    patientsData: Array<Record<string, unknown>>,
  ): Promise<{
    created: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    const startTime = Date.now();
    const batchSize = Math.min(this.config.maxBatchSize, patientsData.length);
    const results = {
      created: 0,
      errors: [] as Array<{ index: number; error: string }>,
    };

    try {
      // Process in batches to avoid overwhelming the database
      for (let i = 0; i < patientsData.length; i += batchSize) {
        const batch = patientsData.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(_batch.map(async (patientData,_batchIndex) => {
            const actualIndex = i + batchIndex;
            try {
              // Ensure patientData is a valid object before spreading
              const validPatientData: Record<string, unknown> = {};
              if (patientData && typeof patientData === 'object') {
                Object.assign(validPatientData, patientData);
              }

              await this.prisma.patient.create({
                data: {
                  ...validPatientData,
                  clinicId,
                },
              });
              return { success: true, index: actualIndex };
            } catch (_error) {
              return {
                success: false,
                index: actualIndex,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          }),
        );

        // Process batch results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              results.created++;
            } else {
              results.errors.push({
                index: result.value.index,
                error: result.value.error,
              });
            }
          } else {
            results.errors.push({
              index: -1,
              error: result.reason?.message || 'Batch processing failed',
            });
          }
        });
      }

      this.updateMetrics(Date.now() - startTime, false, false);
      return results;
    } catch (_error) {
      this.updateMetrics(Date.now() - startTime, true, false);
      throw error;
    }
  }

  /**
   * Optimized dashboard metrics calculation
   */
  async getDashboardMetricsOptimized(clinicId: string): Promise<{
    metrics: Record<string, unknown>;
    fromCache: boolean;
  }> {
    const startTime = Date.now();
    const cacheKey = `dashboard:${clinicId}`;

    // Try cache first (dashboard metrics can be cached longer)
    if (this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.updateMetrics(Date.now() - startTime, false, true);
        return { metrics: cached, fromCache: true };
      }
    }

    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Execute all queries in parallel for maximum performance
      const [
        totalPatients,
        activePatients,
        todayAppointments,
        monthlyAppointments,
        completedAppointments,
        cancelledAppointments,
        averageNoShowRate,
        activeProfessionals,
      ] = await Promise.all([
        this.prisma.patient.count({
          where: { clinicId, isActive: true },
        }),
        this.prisma.patient.count({
          where: {
            clinicId,
            isActive: true,
            lastVisitDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        this.prisma.appointment.count({
          where: {
            clinicId,
            startTime: { gte: startOfDay },
            status: { not: 'cancelled' },
          },
        }),
        this.prisma.appointment.count({
          where: {
            clinicId,
            startTime: { gte: startOfMonth },
            status: { not: 'cancelled' },
          },
        }),
        this.prisma.appointment.count({
          where: {
            clinicId,
            status: 'completed',
            startTime: { gte: startOfMonth },
          },
        }),
        this.prisma.appointment.count({
          where: {
            clinicId,
            status: 'cancelled',
            startTime: { gte: startOfMonth },
          },
        }),
        this.prisma.appointment.aggregate({
          where: { clinicId },
          _avg: { noShowRiskScore: true },
        }),
        this.prisma.professional.count({
          where: { clinicId, isActive: true },
        }),
      ]);

      const metrics = {
        patients: {
          total: totalPatients,
          active: activePatients,
          inactiveRate: totalPatients > 0
            ? ((totalPatients - activePatients) / totalPatients) * 100
            : 0,
        },
        appointments: {
          today: todayAppointments,
          thisMonth: monthlyAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          completionRate: monthlyAppointments > 0
            ? (completedAppointments / monthlyAppointments) * 100
            : 0,
          cancellationRate: monthlyAppointments > 0
            ? (cancelledAppointments / monthlyAppointments) * 100
            : 0,
        },
        professionals: {
          active: activeProfessionals,
        },
        quality: {
          averageNoShowRisk: averageNoShowRate._avg.noShowRiskScore || 0,
        },
        timestamp: new Date().toISOString(),
      };

      // Cache for 5 minutes
      if (this.config.cacheEnabled) {
        await this.cache.set(cacheKey, metrics, 300);
      }

      this.updateMetrics(Date.now() - startTime, false, false);
      return { metrics, fromCache: false };
    } catch (_error) {
      this.updateMetrics(Date.now() - startTime, true, false);
      throw error;
    }
  }

  /**
   * Query performance monitoring
   */
  private updateMetrics(
    duration: number,
    isError: boolean,
    isFromCache: boolean,
  ): void {
    if (!this.config.enablePerformanceMonitoring) return;

    this.metrics.queryCount++;

    if (!isFromCache) {
      this.metrics.totalQueryTime += duration;
      this.metrics.avgQueryTime = this.metrics.totalQueryTime / this.metrics.queryCount;

      // Track slow queries
      if (duration > this.config.slowQueryThreshold) {
        this.metrics.slowQueries.push({
          _query: 'Query details would be captured here',
          duration,
          timestamp: new Date(),
        });

        // Keep only last 50 slow queries
        if (this.metrics.slowQueries.length > 50) {
          this.metrics.slowQueries = this.metrics.slowQueries.slice(-50);
        }
      }
    }

    // Update cache hit rate
    const cacheStats = this.cache.getStats();
    const totalCacheRequests = cacheStats.hits + cacheStats.misses;
    this.metrics.cacheHitRate = totalCacheRequests > 0
      ? (cacheStats.hits / totalCacheRequests) * 100
      : 0;

    // Update memory usage
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
    };

    // Log slow queries
    if (
      duration > this.config.slowQueryThreshold
      && this.config.enableQueryLogging
    ) {
      console.warn(`Slow query detected: ${duration}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache and reset metrics
   */
  async reset(): Promise<void> {
    await this.cache.clear();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateCache(_pattern: string): Promise<void> {
    // This would need to be implemented based on the cache implementation
    // For now, just clear all cache
    await this.cache.clear();
  }
}

// Connection pool monitor
export class ConnectionPoolMonitor {
  private prisma: HealthcarePrismaClient;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(prisma: HealthcarePrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Start monitoring connection pool
   */
  startMonitoring(intervalMs = 30000): void {
    this.monitoringInterval = setInterval(_async () => {
      try {
        const metrics = await this.getConnectionMetrics();

        // Log connection pool status
        console.info('Connection Pool Status:', metrics);

        // Alert if connection pool is under stress
        if (metrics.utilization > 80) {
          console.warn(
            'High connection pool utilization:',
            metrics.utilization + '%',
          );
        }
      } catch (_error) {
        console.error('Connection pool monitoring failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Get connection pool metrics
   */
  async getConnectionMetrics(): Promise<{
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
    utilization: number;
    status: 'healthy' | 'warning' | 'critical';
  }> {
    // This would need to be implemented based on your Prisma setup
    // For now, return mock data
    const mockMetrics = {
      active: 5,
      idle: 3,
      total: 8,
      maxConnections: 20,
      utilization: 40,
      status: 'healthy' as const,
    };

    return mockMetrics;
  }
}

// Export performance optimization utilities
export {
  InMemoryQueryCache,
  type PerformanceMetrics,
  type QueryCache,
  type QueryOptimizationConfig,
};
