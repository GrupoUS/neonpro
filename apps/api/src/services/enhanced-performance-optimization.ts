/**
 * Enhanced Performance Optimization Service
 * Advanced caching strategies, pagination improvements, and performance monitoring for healthcare platform
 */

import { createHash } from "crypto";
import { type HealthcarePrismaClient } from "../clients/prisma";
import {
  HealthcareQueryOptimizer,
  type PerformanceMetrics,
} from "../utils/healthcare-performance.js";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cursor?: string;
  includeCursor?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPageCursor?: string;
    previousPageCursor?: string;
  };
  performance: {
    queryTime: number;
    cacheHit: boolean;
    fromCache: boolean;
  };
  metadata?: {
    sortBy: string;
    sortOrder: string;
    filters: Record<string, any>;
  };
}

export interface CacheStrategy {
  key: string;
  ttl: number;
  tags: string[];
  varyBy?: string[];
  compressionEnabled?: boolean;
  invalidationRules?: string[];
}

export interface PerformanceConfig {
  cacheEnabled: boolean;
  cacheTTLSec: number;
  compressionEnabled: boolean;
  queryTimeoutMs: number;
  maxPageSize: number;
  defaultPageSize: number;
  enableQueryLogging: boolean;
  enablePerformanceMonitoring: boolean;
  slowQueryThresholdMs: number;
  cacheWarmerEnabled: boolean;
}

export class EnhancedPerformanceOptimizationService {
  private prisma: HealthcarePrismaClient;
  private queryOptimizer: HealthcareQueryOptimizer;
  private config: PerformanceConfig;
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private cacheStats: Map<
    string,
    { hits: number; misses: number; size: number }
  > = new Map();

  constructor(
    prisma: HealthcarePrismaClient,
    config: Partial<PerformanceConfig> = {},
  ) {
    this.prisma = prisma;
    this.config = {
      cacheEnabled: true,
      cacheTTLSec: 300, // 5 minutes
      compressionEnabled: true,
      queryTimeoutMs: 10000, // 10 seconds
      maxPageSize: 100,
      defaultPageSize: 20,
      enableQueryLogging: process.env.NODE_ENV === "development",
      enablePerformanceMonitoring: true,
      slowQueryThresholdMs: 1000,
      cacheWarmerEnabled: true,
      ...config,
    };

    this.queryOptimizer = new HealthcareQueryOptimizer(prisma, {
      cacheEnabled: this.config.cacheEnabled,
      cacheTTL: this.config.cacheTTLSec,
      slowQueryThreshold: this.config.slowQueryThresholdMs,
      maxBatchSize: this.config.maxPageSize,
      enableQueryLogging: this.config.enableQueryLogging,
      enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
    });

    this.initializePerformanceMonitoring();
  }

  /**
   * Enhanced paginated query with advanced caching and performance optimization
   */
  async executePaginatedQuery<T>(
    queryKey: string,
    queryBuilder: (
      params: PaginationParams,
    ) => Promise<{ data: T[]; total: number }>,
    params: PaginationParams = {},
    cacheStrategy?: Partial<CacheStrategy>,
  ): Promise<PaginatedResult<T>> {
    const startTime = performance.now();
    const {
      page = 1,
      limit = Math.min(
        params.limit || this.config.defaultPageSize,
        this.config.maxPageSize,
      ),
      sortBy = "updatedAt",
      sortOrder = "desc",
      cursor,
      includeCursor = false,
    } = params;

    // Create comprehensive cache key
    const cacheKey = this.generateCacheKey(queryKey, {
      page,
      limit,
      sortBy,
      sortOrder,
      cursor,
      filters: params as any,
    });

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = await this.getFromCache<PaginatedResult<T>>(cacheKey);
      if (cached) {
        this.updateCacheStats(queryKey, true);
        return {
          ...cached,
          performance: {
            ...cached.performance,
            fromCache: true,
          },
        };
      }
    }

    try {
      // Execute query with timeout
      const result = await this.executeWithTimeout(async () => {
        if (cursor && includeCursor) {
          // Cursor-based pagination
          return this.executeCursorPagination(queryBuilder, {
            ...params,
            limit,
            cursor,
          });
        } else {
          // Offset-based pagination
          return queryBuilder({
            page,
            limit,
            sortBy,
            sortOrder,
          });
        }
      }, this.config.queryTimeoutMs);

      const { data, total } = result;

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const paginatedResult: PaginatedResult<T> = {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          nextPageCursor: hasNextPage
            ? this.generateCursor(data[data.length - 1])
            : undefined,
          previousPageCursor: hasPreviousPage
            ? this.generateCursor(data[0], true)
            : undefined,
        },
        performance: {
          queryTime: performance.now() - startTime,
          cacheHit: false,
          fromCache: false,
        },
        metadata: {
          sortBy,
          sortOrder,
          filters: params as any,
        },
      };

      // Cache the result
      if (this.config.cacheEnabled) {
        await this.setCache(
          cacheKey,
          paginatedResult,
          cacheStrategy?.ttl || this.config.cacheTTLSec,
          cacheStrategy?.tags || [],
        );
      }

      this.updateCacheStats(queryKey, false);
      this.updatePerformanceMetrics(
        queryKey,
        performance.now() - startTime,
        false,
      );

      return paginatedResult;
    } catch (error) {
      this.updatePerformanceMetrics(
        queryKey,
        performance.now() - startTime,
        true,
      );
      throw this.handleQueryError(error, queryKey);
    }
  }

  /**
   * Optimized patient search with advanced filtering and performance
   */
  async searchPatientsEnhanced(
    _clinicId: string,
    searchParams: {
      _query?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      filters?: {
        status?: string[];
        gender?: string[];
        ageRange?: { min: number; max: number };
        lastVisitAfter?: Date;
        nextAppointmentBefore?: Date;
        noShowRiskThreshold?: number;
        tags?: string[];
      };
      includeInactive?: boolean;
    },
  ): Promise<PaginatedResult<any>> {
    return this.executePaginatedQuery(
      `patients_search:${clinicId}`,
      async (params) => {
        const { page, limit, sortBy, sortOrder } = params;
        const { query, filters, includeInactive = false } = searchParams;

        // Build optimized where clause
        const whereClause: any = {
          clinicId,
          isActive: includeInactive ? undefined : true,
        };

        // Add search conditions
        if (query?.trim()) {
          whereClause.OR = [
            { fullName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phonePrimary: { contains: query } },
            { phoneSecondary: { contains: query } },
            { medicalRecordNumber: { contains: query } },
            { cpf: { contains: query } },
          ];
        }

        // Add filters
        if (filters) {
          if (filters.status?.length) {
            whereClause.patientStatus = { in: filters.status };
          }

          if (filters.gender?.length) {
            whereClause.gender = { in: filters.gender };
          }

          if (filters.ageRange) {
            const today = new Date();
            const maxBirthDate = new Date(
              today.getFullYear() - filters.ageRange.min,
              today.getMonth(),
              today.getDate(),
            );
            const minBirthDate = new Date(
              today.getFullYear() - filters.ageRange.max,
              today.getMonth(),
              today.getDate(),
            );
            whereClause.birthDate = {
              gte: minBirthDate,
              lte: maxBirthDate,
            };
          }

          if (filters.lastVisitAfter) {
            whereClause.lastVisitDate = { gte: filters.lastVisitAfter };
          }

          if (filters.nextAppointmentBefore) {
            whereClause.nextAppointmentDate = {
              lte: filters.nextAppointmentBefore,
            };
          }

          if (filters.noShowRiskThreshold !== undefined) {
            whereClause.noShowRiskScore = { gte: filters.noShowRiskThreshold };
          }

          if (filters.tags?.length) {
            whereClause.tags = { hasSome: filters.tags };
          }
        }

        // Execute optimized queries in parallel
        const [patients, total] = await Promise.all([
          this.prisma.patient.findMany({
            where: whereClause,
            select: this.getPatientSelectFields(),
            orderBy: this.buildOrderBy(sortBy, sortOrder),
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.patient.count({ where: whereClause }),
        ]);

        return { data: patients, total };
      },
      searchParams,
      {
        key: `patients_search:${clinicId}`,
        ttl: 180, // 3 minutes for patient search (frequent updates)
        tags: ["patients", "search", `clinic:${clinicId}`],
      },
    );
  }

  /**
   * Optimized appointment scheduling view with performance optimizations
   */
  async getAppointmentsCalendar(
    clinicId: string,
    params: {
      startDate: Date;
      endDate: Date;
      professionalId?: string;
      status?: string[];
      includeCancelled?: boolean;
      includePatientDetails?: boolean;
      groupBy?: "day" | "week" | "professional";
    },
  ): Promise<{
    appointments: any[];
    summary: {
      total: number;
      byStatus: Record<string, number>;
      byProfessional: Record<
        string,
        { total: number; completed: number; cancelled: number }
      >;
      revenue: number;
      occupancy: number;
    };
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
  }> {
    const cacheKey = `appointments_calendar:${clinicId}:${JSON.stringify(params)}`;
    const startTime = performance.now();

    // Check cache
    if (this.config.cacheEnabled) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            ...cached.performance,
            fromCache: true,
          },
        };
      }
    }

    try {
      const {
        startDate,
        endDate,
        professionalId,
        status,
        includeCancelled = false,
        includePatientDetails = true,
        groupBy,
      } = params;

      const whereClause: any = {
        clinicId,
        startTime: { gte: startDate, lte: endDate },
        status: includeCancelled ? undefined : { not: "cancelled" },
      };

      if (professionalId) whereClause.professionalId = professionalId;
      if (status?.length) whereClause.status = { in: status };

      const [appointments, _total] = await Promise.all([
        this.prisma.appointment.findMany({
          where: whereClause,
          include: this.getAppointmentInclude(includePatientDetails),
          orderBy: { startTime: "asc" },
        }),
        this.prisma.appointment.count({ where: whereClause }),
      ]);

      // Generate summary statistics
      const summary = this.generateAppointmentSummary(appointments, groupBy);

      const result = {
        appointments,
        summary,
        performance: {
          queryTime: performance.now() - startTime,
          cacheHit: false,
          fromCache: false,
        },
      };

      // Cache with shorter TTL for calendar data (frequent updates)
      if (this.config.cacheEnabled) {
        await this.setCache(cacheKey, result, 60, [
          "appointments",
          "calendar",
          `clinic:${clinicId}`,
        ]);
      }

      return result;
    } catch (error) {
      throw this.handleQueryError(error, "appointments_calendar");
    }
  }

  /**
   * Enhanced dashboard metrics with caching and real-time updates
   */
  async getDashboardMetricsEnhanced(
    clinicId: string,
    options?: {
      forceRefresh?: boolean;
      includeHistorical?: boolean;
      includeProjections?: boolean;
    },
  ): Promise<{
    current: Record<string, any>;
    historical?: Array<{ date: string; metrics: Record<string, any> }>;
    projections?: Record<string, any>;
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
  }> {
    const cacheKey = `dashboard_metrics:${clinicId}:enhanced`;
    const startTime = performance.now();

    // Check cache unless force refresh
    if (this.config.cacheEnabled && !options?.forceRefresh) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            ...cached.performance,
            fromCache: true,
          },
        };
      }
    }

    try {
      // Get current metrics using the existing optimizer
      const { metrics: currentMetrics } =
        await this.queryOptimizer.getDashboardMetricsOptimized(clinicId);

      let historical, projections;

      if (options?.includeHistorical) {
        historical = await this.getHistoricalMetrics(clinicId, 30); // Last 30 days
      }

      if (options?.includeProjections) {
        projections = await this.generateProjections(clinicId, currentMetrics);
      }

      const result = {
        current: currentMetrics,
        historical,
        projections,
        performance: {
          queryTime: performance.now() - startTime,
          cacheHit: false,
          fromCache: false,
        },
      };

      // Cache dashboard metrics for 5 minutes
      if (this.config.cacheEnabled) {
        await this.setCache(cacheKey, result, 300, [
          "dashboard",
          `clinic:${clinicId}`,
        ]);
      }

      return result;
    } catch (error) {
      throw this.handleQueryError(error, "dashboard_metrics");
    }
  }

  /**
   * Batch operations with optimized performance and error handling
   */
  async executeBatchOperation<T>(
    operation: string,
    items: T[],
    processFn: (item: T, index: number) => Promise<any>,
    options?: {
      batchSize?: number;
      continueOnError?: boolean;
      progressCallback?: (
        processed: number,
        total: number,
        errors: number,
      ) => void;
    },
  ): Promise<{
    results: any[];
    errors: Array<{ index: number; error: string; item: T }>;
    processed: number;
    failed: number;
    performance: {
      totalTime: number;
      averageTimePerItem: number;
    };
  }> {
    const startTime = performance.now();
    const batchSize =
      options?.batchSize || Math.min(this.config.maxPageSize, 50);
    const continueOnError = options?.continueOnError || false;
    const results: any[] = [];
    const errors: Array<{ index: number; error: string; item: T }> = [];
    let processed = 0;
    let failed = 0;

    try {
      // Process in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Process batch with concurrency control
        const batchResults = await Promise.allSettled(
          _batch.map(async (item, _batchIndex) => {
            const actualIndex = i + batchIndex;
            try {
              const result = await processFn(item, actualIndex);
              processed++;

              if (options?.progressCallback) {
                options.progressCallback(processed, items.length, failed);
              }

              return { success: true, result, index: actualIndex };
            } catch (error) {
              failed++;
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

              if (!continueOnError) {
                throw error;
              }

              return {
                success: false,
                error: errorMessage,
                item,
                index: actualIndex,
              };
            }
          }),
        );

        // Process batch results
        batchResults.forEach((batchResult) => {
          if (batchResult.status === "fulfilled") {
            const result = batchResult.value;
            if (result.success) {
              results.push(result.result);
            } else {
              errors.push({
                index: result.index,
                error: result.error,
                item: result.item,
              });
            }
          } else {
            failed++;
            errors.push({
              index: -1,
              error: batchResult.reason?.message || "Batch processing failed",
              item: items[i],
            });
          }
        });
      }

      const totalTime = performance.now() - startTime;
      const averageTimePerItem = totalTime / items.length;

      return {
        results,
        errors,
        processed,
        failed,
        performance: {
          totalTime,
          averageTimePerItem,
        },
      };
    } catch (error) {
      const totalTime = performance.now() - startTime;

      return {
        results,
        errors: [
          ...errors,
          {
            index: -1,
            error:
              error instanceof Error ? error.message : "Batch operation failed",
            item: items[0],
          },
        ],
        processed,
        failed: items.length - processed,
        performance: {
          totalTime,
          averageTimePerItem: totalTime / items.length,
        },
      };
    }
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache(clinicId: string): Promise<void> {
    if (!this.config.cacheWarmerEnabled) return;

    try {
      // Warm up dashboard metrics
      await this.getDashboardMetricsEnhanced(clinicId, { forceRefresh: true });

      // Warm up active patients list
      await this.searchPatientsEnhanced(clinicId, {
        page: 1,
        limit: 20,
        sortBy: "lastVisitDate",
        sortOrder: "desc",
        filters: { status: ["active"] },
      });

      // Warm up today's appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await this.getAppointmentsCalendar(clinicId, {
        startDate: today,
        endDate: tomorrow,
        includePatientDetails: false,
      });

      console.log(`Cache warming completed for clinic ${clinicId}`);
    } catch (error) {
      console.error("Cache warming failed:", error);
    }
  }

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport(options?: {
    clinicId?: string;
    timeRange?: { start: Date; end: Date };
    includeSlowQueries?: boolean;
    includeCacheStats?: boolean;
  }): Promise<{
    summary: {
      totalQueries: number;
      averageQueryTime: number;
      cacheHitRate: number;
      slowQueryCount: number;
    };
    slowQueries?: Array<{ _query: string; duration: number; timestamp: Date }>;
    cacheStats?: Record<
      string,
      { hits: number; misses: number; hitRate: number }
    >;
    recommendations: string[];
  }> {
    const metrics = this.queryOptimizer.getPerformanceMetrics();
    const cacheStats = this.getOverallCacheStats();

    const summary = {
      totalQueries: metrics.queryCount,
      averageQueryTime: metrics.avgQueryTime,
      cacheHitRate: metrics.cacheHitRate,
      slowQueryCount: metrics.slowQueries.length,
    };

    const recommendations = this.generatePerformanceRecommendations(
      summary,
      metrics,
    );

    return {
      summary,
      slowQueries: options?.includeSlowQueries
        ? metrics.slowQueries
        : undefined,
      cacheStats: options?.includeCacheStats ? cacheStats : undefined,
      recommendations,
    };
  }

  // Private helper methods

  private generateCacheKey(prefix: string, params: any): string {
    const keyData = {
      prefix,
      params,
      timestamp: Math.floor(Date.now() / (this.config.cacheTTLSec * 1000)), // Time-based key partitioning
    };

    const keyString = JSON.stringify(keyData);
    return createHash("sha256")
      .update(keyString)
      .digest("hex")
      .substring(0, 32);
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, _reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private async executeCursorPagination<T>(
    queryBuilder: (
      params: PaginationParams,
    ) => Promise<{ data: T[]; total: number }>,
    params: PaginationParams & { cursor?: string },
  ): Promise<{ data: T[]; total: number }> {
    // Implement cursor-based pagination logic
    // This is a simplified implementation - would need to be adapted based on your cursor strategy
    return queryBuilder(params);
  }

  private generateCursor(item: any, _reverse = false): string {
    if (!item) return "";

    // Simple cursor implementation using ID and timestamp
    const cursorData = {
      id: item.id,
      updatedAt: item.updatedAt || new Date().toISOString(),
    };

    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  }

  private getPatientSelectFields() {
    return {
      id: true,
      medicalRecordNumber: true,
      fullName: true,
      email: true,
      phonePrimary: true,
      phoneSecondary: true,
      birthDate: true,
      gender: true,
      patientStatus: true,
      lastVisitDate: true,
      nextAppointmentDate: true,
      noShowRiskScore: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  private getAppointmentInclude(includePatientDetails: boolean) {
    const include: any = {
      serviceType: {
        select: {
          id: true,
          name: true,
          duration_minutes: true,
          price: true,
          category: true,
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
          patientStatus: true,
        },
      };
    }

    include.professional = {
      select: {
        id: true,
        fullName: true,
        specialization: true,
        color: true,
        isActive: true,
      },
    };

    return include;
  }

  private buildOrderBy(sortBy: string, sortOrder: "asc" | "desc"): any {
    const orderBy: any = {};

    // Handle complex sort fields
    if (sortBy.includes(".")) {
      const [relation, field] = sortBy.split(".");
      orderBy[relation] = { [field]: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    return orderBy;
  }

  private generateAppointmentSummary(appointments: any[], _groupBy?: string) {
    const byStatus: Record<string, number> = {};
    const byProfessional: Record<
      string,
      { total: number; completed: number; cancelled: number }
    > = {};
    let revenue = 0;

    appointments.forEach((apt) => {
      // Count by status
      byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;

      // Count by professional
      const profId = apt.professionalId;
      if (!byProfessional[profId]) {
        byProfessional[profId] = { total: 0, completed: 0, cancelled: 0 };
      }
      byProfessional[profId].total++;
      if (apt.status === "completed") byProfessional[profId].completed++;
      if (apt.status === "cancelled") byProfessional[profId].cancelled++;

      // Calculate revenue
      if (apt.status === "completed" && apt.serviceType?.price) {
        revenue += apt.serviceType.price;
      }
    });

    // Calculate occupancy (simplified)
    const totalSlots = appointments.length;
    const completedSlots = byStatus["completed"] || 0;
    const occupancy = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 0;

    return {
      total: appointments.length,
      byStatus,
      byProfessional,
      revenue,
      occupancy,
    };
  }

  private async getHistoricalMetrics(_clinicId: string, _days: number) {
    // Implement historical data retrieval
    // This would query historical metrics tables
    return [];
  }

  private async generateProjections(
    _clinicId: string,
    _currentMetrics: Record<string, any>,
  ) {
    // Implement predictive analytics for future metrics
    // This would use machine learning or statistical models
    return {};
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      // Use the query optimizer's cache
      const cache = (this.queryOptimizer as any).cache;
      return cache ? await cache.get(key) : null;
    } catch (error) {
      console.warn("Cache get failed:", error);
      return null;
    }
  }

  private async setCache(
    key: string,
    value: any,
    ttl: number,
    _tags: string[],
  ): Promise<void> {
    try {
      // Use the query optimizer's cache
      const cache = (this.queryOptimizer as any).cache;
      if (cache) {
        await cache.set(key, value, ttl);
      }
    } catch (error) {
      console.warn("Cache set failed:", error);
    }
  }

  private updateCacheStats(key: string, isHit: boolean): void {
    const stats = this.cacheStats.get(key) || { hits: 0, misses: 0, size: 0 };

    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }

    stats.size = stats.hits + stats.misses;
    this.cacheStats.set(key, stats);
  }

  private updatePerformanceMetrics(
    key: string,
    duration: number,
    _isError: boolean,
  ): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const existing = this.performanceMetrics.get(key) || {
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

    existing.queryCount++;
    existing.totalQueryTime += duration;
    existing.avgQueryTime = existing.totalQueryTime / existing.queryCount;

    this.performanceMetrics.set(key, existing);
  }

  private handleQueryError(error: any, queryKey: string): Error {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown query error";

    if (this.config.enableQueryLogging) {
      console.error(`Query error for ${queryKey}:`, errorMessage);
    }

    if (errorMessage.includes("timeout")) {
      return new Error(
        `Query timeout for ${queryKey}. Please try again or refine your search criteria.`,
      );
    }

    return error instanceof Error ? error : new Error(errorMessage);
  }

  private getOverallCacheStats(): Record<
    string,
    { hits: number; misses: number; hitRate: number }
  > {
    const stats: Record<
      string,
      { hits: number; misses: number; hitRate: number }
    > = {};

    this.cacheStats.forEach((value, _key) => {
      const total = value.hits + value.misses;
      stats[key] = {
        hits: value.hits,
        misses: value.misses,
        hitRate: total > 0 ? (value.hits / total) * 100 : 0,
      };
    });

    return stats;
  }

  private generatePerformanceRecommendations(
    summary: any,
    metrics: PerformanceMetrics,
  ): string[] {
    const recommendations: string[] = [];

    // Cache recommendations
    if (summary.cacheHitRate < 50) {
      recommendations.push(
        "Consider increasing cache TTL or adding more cacheable endpoints",
      );
    }

    // Query performance recommendations
    if (summary.averageQueryTime > this.config.slowQueryThresholdMs) {
      recommendations.push(
        "Average query time is high - consider query optimization or indexing",
      );
    }

    // Slow query recommendations
    if (summary.slowQueryCount > 10) {
      recommendations.push(
        "Multiple slow queries detected - review and optimize database queries",
      );
    }

    // Memory usage recommendations
    if (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal > 0.8) {
      recommendations.push(
        "High memory usage detected - consider implementing memory optimization",
      );
    }

    return recommendations;
  }

  private initializePerformanceMonitoring(): void {
    // Set up periodic performance monitoring
    setInterval(
      () => {
        this.cleanupPerformanceMetrics();
      },
      5 * 60 * 1000,
    ); // Clean up every 5 minutes
  }

  private cleanupPerformanceMetrics(): void {
    // Remove old metrics data
    const cutoff = Date.now() - 60 * 60 * 1000; // Keep last hour

    for (const [_key, _metrics] of this.performanceMetrics.entries()) {
      // Implement cleanup logic based on your requirements
    }
  }
}

// Export singleton instance
export const enhancedPerformanceOptimizationService =
  new EnhancedPerformanceOptimizationService(
    // Prisma client would be injected from the application context
    {} as HealthcarePrismaClient,
  );

// Export types
export type {
  CacheStrategy,
  PaginatedResult,
  PaginationParams,
  PerformanceConfig,
};
