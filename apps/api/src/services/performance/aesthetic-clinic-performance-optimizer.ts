/**
 * Aesthetic Clinic Performance Optimizer
 * Comprehensive performance optimization service for aesthetic clinic features
 * Includes multi-level caching, query optimization, and real-time monitoring
 */

import { DatabasePerformanceService, type PerformanceConfig } from '@neonpro/database'
import { ErrorMapper } from '@neonpro/shared/errors'
import { SupabaseClient } from '@supabase/supabase-js'

// Performance monitoring interfaces
export interface AestheticPerformanceMetrics {
  queryMetrics: {
    averageQueryTime: number
    slowQueries: number
    totalQueries: number
    cacheHitRate: number
  }
  imageMetrics: {
    averageLoadTime: number
    optimizedImages: number
    totalBandwidthSaved: number
  }
  apiMetrics: {
    averageResponseTime: number
    compressionRatio: number
    successfulRequests: number
    failedRequests: number
  }
  websocketMetrics: {
    activeConnections: number
    averageLatency: number
    messagesPerSecond: number
  }
  timestamp: string
}

// Cache configuration for aesthetic clinic data
export interface AestheticCacheConfig {
  clientProfiles: {
    ttl: number
    maxSize: number
    strategy: 'lru' | 'fifo'
  }
  treatmentCatalog: {
    ttl: number
    maxSize: number
    strategy: 'lru'
  }
  beforeAfterPhotos: {
    ttl: number
    maxSize: number
    compressionEnabled: boolean
  }
  analytics: {
    ttl: number
    maxSize: number
    realtimeEnabled: boolean
  }
}

// Image optimization configuration
export interface ImageOptimizationConfig {
  maxWidth: number
  quality: number
  formats: ('webp' | 'avif' | 'jpeg')[]
  lazyLoading: boolean
  placeholderEnabled: boolean
  cdnEnabled: boolean
}

// Query optimization strategies
export interface QueryOptimizationConfig {
  enableBatching: boolean
  batchSize: number
  enableConnectionPooling: boolean
  poolSize: number
  enableReadReplicas: boolean
  indexHints: string[]
}

/**
 * Comprehensive performance optimizer for aesthetic clinic features
 */
export class AestheticClinicPerformanceOptimizer {
  private performanceService: DatabasePerformanceService
  private cache: Map<string, { data: any; timestamp: string; ttl: number }> = new Map()
  private metrics: AestheticPerformanceMetrics[] = []
  private config: {
    cache: AestheticCacheConfig
    images: ImageOptimizationConfig
    queries: QueryOptimizationConfig
  }

  constructor(
    private supabase: SupabaseClient,
    config?: Partial<{
      cache: AestheticCacheConfig
      images: ImageOptimizationConfig
      queries: QueryOptimizationConfig
      performance: PerformanceConfig
    }>,
  ) {
    // Initialize performance service
    this.performanceService = new DatabasePerformanceService(this.supabase, config?.performance)

    // Set default configurations
    this.config = {
      cache: {
        clientProfiles: {
          ttl: 300000, // 5 minutes
          maxSize: 1000,
          strategy: 'lru',
        },
        treatmentCatalog: {
          ttl: 3600000, // 1 hour
          maxSize: 500,
          strategy: 'lru',
        },
        beforeAfterPhotos: {
          ttl: 1800000, // 30 minutes
          maxSize: 2000,
          compressionEnabled: true,
        },
        analytics: {
          ttl: 60000, // 1 minute
          maxSize: 100,
          realtimeEnabled: true,
        },
        ...config?.cache,
      },
      images: {
        maxWidth: 1200,
        quality: 85,
        formats: ['webp', 'jpeg'],
        lazyLoading: true,
        placeholderEnabled: true,
        cdnEnabled: true,
        ...config?.images,
      },
      queries: {
        enableBatching: true,
        batchSize: 100,
        enableConnectionPooling: true,
        poolSize: 10,
        enableReadReplicas: false,
        indexHints: ['idx_aesthetic_clients_email', 'idx_treatment_sessions_date'],
        ...config?.queries,
      },
    }

    // Initialize performance monitoring
    this.initializePerformanceMonitoring()
  }

  /**
   * Optimized client profile retrieval with multi-level caching
   */
  async getOptimizedClientProfile(
    clientId: string,
    options: {
      includeTreatments?: boolean
      includePhotos?: boolean
      forceRefresh?: boolean
    } = {},
  ) {
    const cacheKey = `client_profile:${clientId}:${JSON.stringify(options)}`
    const startTime = performance.now()

    // Check cache first
    if (!options.forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.recordMetric('cache_hit', performance.now() - startTime)
        return cached
      }
    }

    try {
      // Build optimized query with column selection
      let query = this.supabase
        .from('aesthetic_clients')
        .select(`
          id,
          name,
          email,
          phone,
          date_of_birth,
          gender,
          skin_type,
          concerns,
          medical_history,
          created_at,
          updated_at
        `)
        .eq('id', clientId)
        .single()

      const { data: client, error } = await query

      if (error) {
        throw new Error(`Failed to fetch client profile: ${error.message}`)
      }

      let result: any = { ...client }

      // Fetch related data if requested
      if (options.includeTreatments) {
        const { data: treatments } = await this.supabase
          .from('treatment_sessions')
          .select(`
            id,
            treatment_type,
            date,
            practitioner_id,
            notes,
            before_photo_id,
            after_photo_id,
            results,
            created_at
          `)
          .eq('client_id', clientId)
          .order('date', { ascending: false })
          .limit(10)

        result.treatments = treatments || []
      }

      if (options.includePhotos) {
        const { data: photos } = await this.supabase
          .from('treatment_photos')
          .select('id, photo_url, thumbnail_url, treatment_type, created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(20)

        result.photos = await this.optimizePhotos(photos || [])
      }

      // Cache the result
      this.setToCache(
        cacheKey,
        result,
        this.config.cache.clientProfiles.ttl,
      )

      const duration = performance.now() - startTime
      this.recordMetric('client_profile_query', duration)

      return result
    } catch {
      const duration = performance.now() - startTime
      this.recordMetric('client_profile_error', duration)

      throw ErrorMapper.mapError(error, {
        action: 'get_optimized_client_profile',
        clientId,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Optimized treatment catalog with intelligent caching
   */
  async getOptimizedTreatmentCatalog(options: {
    category?: string
    forceRefresh?: boolean
  } = {}) {
    const cacheKey = `treatment_catalog:${options.category || 'all'}`
    const startTime = performance.now()

    if (!options.forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.recordMetric('cache_hit', performance.now() - startTime)
        return cached
      }
    }

    try {
      let query = this.supabase
        .from('treatment_catalog')
        .select(`
          id,
          name,
          category,
          description,
          duration,
          price,
          requirements,
          contraindications,
          recovery_time,
          effectiveness_rate,
          popularity_score,
          created_at,
          updated_at
        `)

      if (options.category) {
        query = query.eq('category', options.category)
      }

      query = query.order('popularity_score', { ascending: false })

      const { data: treatments, error } = await query

      if (error) {
        throw new Error(`Failed to fetch treatment catalog: ${error.message}`)
      }

      // Cache the result
      this.setToCache(
        cacheKey,
        treatments || [],
        this.config.cache.treatmentCatalog.ttl,
      )

      const duration = performance.now() - startTime
      this.recordMetric('treatment_catalog_query', duration)

      return treatments || []
    } catch {
      const duration = performance.now() - startTime
      this.recordMetric('treatment_catalog_error', duration)

      throw ErrorMapper.mapError(error, {
        action: 'get_optimized_treatment_catalog',
        category: options.category,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Optimized before/after photo retrieval with image processing
   */
  async getOptimizedBeforeAfterPhotos(
    clientId: string,
    options: {
      treatmentType?: string
      limit?: number
      includeThumbnails?: boolean
    } = {},
  ) {
    const cacheKey = `before_after_photos:${clientId}:${options.treatmentType || 'all'}:${
      options.limit || 20
    }`
    const startTime = performance.now()

    const cached = this.getFromCache(cacheKey)
    if (cached) {
      this.recordMetric('cache_hit', performance.now() - startTime)
      return cached
    }

    try {
      let query = this.supabase
        .from('treatment_photos')
        .select(`
          id,
          client_id,
          treatment_type,
          photo_url,
          thumbnail_url,
          photo_metadata,
          created_at,
          updated_at
        `)
        .eq('client_id', clientId)

      if (options.treatmentType) {
        query = query.eq('treatment_type', options.treatmentType)
      }

      query = query.order('created_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: photos, error } = await query

      if (error) {
        throw new Error(`Failed to fetch before/after photos: ${error.message}`)
      }

      // Optimize images
      const optimizedPhotos = await this.optimizePhotos(photos || [], options.includeThumbnails)

      // Cache the result
      this.setToCache(
        cacheKey,
        optimizedPhotos,
        this.config.cache.beforeAfterPhotos.ttl,
      )

      const duration = performance.now() - startTime
      this.recordMetric('before_after_photos_query', duration)

      return optimizedPhotos
    } catch {
      const duration = performance.now() - startTime
      this.recordMetric('before_after_photos_error', duration)

      throw ErrorMapper.mapError(error, {
        action: 'get_optimized_before_after_photos',
        clientId,
        treatmentType: options.treatmentType,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Optimized analytics with real-time updates
   */
  async getOptimizedClinicAnalytics(options: {
    dateRange?: { start: string; end: string }
    includeRealtime?: boolean
    forceRefresh?: boolean
  } = {}) {
    const cacheKey = `clinic_analytics:${JSON.stringify(options.dateRange)}`
    const startTime = performance.now()

    if (!options.forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.recordMetric('cache_hit', performance.now() - startTime)
        return cached
      }
    }

    try {
      // Execute multiple queries in parallel for better performance
      const [
        clientsQuery,
        sessionsQuery,
        revenueQuery,
        popularTreatmentsQuery,
      ] = await Promise.all([
        this.supabase
          .from('aesthetic_clients')
          .select('count', { count: 'exact', head: true }),
        this.supabase
          .from('treatment_sessions')
          .select('count', { count: 'exact', head: true })
          .gte('date', options.dateRange?.start || '1970-01-01')
          .lte('date', options.dateRange?.end || new Date().toISOString()),
        this.supabase
          .from('treatment_sessions')
          .select('total_amount')
          .gte('date', options.dateRange?.start || '1970-01-01')
          .lte('date', options.dateRange?.end || new Date().toISOString()),
        this.supabase
          .from('treatment_sessions')
          .select('treatment_type, count')
          .gte('date', options.dateRange?.start || '1970-01-01')
          .lte('date', options.dateRange?.end || new Date().toISOString())
          .group('treatment_type')
          .order('count', { ascending: false })
          .limit(5),
      ])

      const analytics = {
        totalClients: clientsQuery.count || 0,
        totalSessions: sessionsQuery.count || 0,
        totalRevenue: revenueQuery.data?.reduce((sum, session) =>
          sum + (session.total_amount || 0), 0) || 0,
        popularTreatments: popularTreatmentsQuery.data || [],
        timestamp: new Date().toISOString(),
      }

      // Cache the result with short TTL for real-time data
      this.setToCache(cacheKey, analytics, this.config.cache.analytics.ttl)

      const duration = performance.now() - startTime
      this.recordMetric('clinic_analytics_query', duration)

      return analytics
    } catch {
      const duration = performance.now() - startTime
      this.recordMetric('clinic_analytics_error', duration)

      throw ErrorMapper.mapError(error, {
        action: 'get_optimized_clinic_analytics',
        dateRange: options.dateRange,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Batch optimized client search with pagination
   */
  async searchClientsOptimized(params: {
    query: string
    page?: number
    pageSize?: number
    filters?: {
      skinType?: string
      treatmentType?: string
      dateRange?: { start: string; end: string }
    }
  }) {
    const cacheKey = `client_search:${JSON.stringify(params)}`
    const startTime = performance.now()

    try {
      let query = this.supabase
        .from('aesthetic_clients')
        .select(
          `
          id,
          name,
          email,
          phone,
          skin_type,
          concerns,
          created_at,
          treatment_sessions(count)
        `,
          { count: 'exact' },
        )

      // Apply search filters
      if (params.query) {
        query = query.or(
          `name.ilike.%${params.query}%,email.ilike.%${params.query}%,phone.ilike.%${params.query}%`,
        )
      }

      if (params.filters?.skinType) {
        query = query.eq('skin_type', params.filters.skinType)
      }

      if (params.filters?.treatmentType) {
        query = query.filter(
          'treatment_sessions.treatment_type',
          'eq',
          params.filters.treatmentType,
        )
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 20
      const offset = (page - 1) * pageSize

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      const { data: clients, count, error } = await query

      if (error) {
        throw new Error(`Failed to search clients: ${error.message}`)
      }

      const result = {
        clients: clients || [],
        pagination: {
          page,
          pageSize,
          totalItems: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      }

      // Cache search results
      this.setToCache(cacheKey, result, 300000) // 5 minutes

      const duration = performance.now() - startTime
      this.recordMetric('client_search_query', duration)

      return result
    } catch {
      const duration = performance.now() - startTime
      this.recordMetric('client_search_error', duration)

      throw ErrorMapper.mapError(error, {
        action: 'search_clients_optimized',
        params,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Image optimization with lazy loading and compression
   */
  private async optimizePhotos(photos: any[], includeThumbnails = true): Promise<any[]> {
    if (!this.config.images.compressionEnabled) {
      return photos
    }

    const optimizedPhotos = await Promise.all(
      photos.map(async photo => {
        const optimized: any = { ...photo }

        // Generate optimized image URLs
        if (photo.photo_url) {
          optimized.optimized_url = this.generateOptimizedImageUrl(
            photo.photo_url,
            this.config.images,
          )
        }

        // Generate thumbnail URLs
        if (includeThumbnails && photo.photo_url) {
          optimized.thumbnail_url = this.generateThumbnailUrl(photo.photo_url)
        }

        // Add lazy loading attributes
        if (this.config.images.lazyLoading) {
          optimized.loading = 'lazy'
        }

        return optimized
      }),
    )

    return optimizedPhotos
  }

  /**
   * Generate optimized image URL with compression parameters
   */
  private generateOptimizedImageUrl(originalUrl: string, config: ImageOptimizationConfig): string {
    if (!config.cdnEnabled) {
      return originalUrl
    }

    try {
      const url = new URL(originalUrl)

      // Add optimization parameters
      url.searchParams.set('width', config.maxWidth.toString())
      url.searchParams.set('quality', config.quality.toString())

      // Add format parameter
      if (config.formats.includes('webp')) {
        url.searchParams.set('format', 'webp')
      }

      return url.toString()
    } catch {
      return originalUrl
    }
  }

  /**
   * Generate thumbnail URL
   */
  private generateThumbnailUrl(originalUrl: string): string {
    try {
      const url = new URL(originalUrl)
      url.searchParams.set('width', '300')
      url.searchParams.set('height', '300')
      url.searchParams.set('fit', 'cover')
      return url.toString()
    } catch {
      return originalUrl
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    const entryTime = new Date(entry.timestamp).getTime()

    if (now - entryTime > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  private setToCache<T>(key: string, data: T, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= 2000) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: new Date().toISOString(),
      ttl,
    })
  }

  /**
   * Performance monitoring and metrics collection
   */
  private initializePerformanceMonitoring(): void {
    // Start periodic cleanup
    setInterval(() => this.cleanupCache(), 300000) // Every 5 minutes

    // Start metrics aggregation
    setInterval(() => this.aggregateMetrics(), 60000) // Every minute
  }

  private recordMetric(type: string, duration: number): void {
    // Simple metric recording - can be enhanced with proper monitoring
    console.warn(`[Performance] ${type}: ${duration.toFixed(2)}ms`)
  }

  private cleanupCache(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache) {
      const entryTime = new Date(entry.timestamp).getTime()
      if (now - entryTime > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private aggregateMetrics(): void {
    // Aggregate and store performance metrics
    const metrics: AestheticPerformanceMetrics = {
      queryMetrics: this.performanceService.getPerformanceStats(),
      imageMetrics: {
        averageLoadTime: 0,
        optimizedImages: 0,
        totalBandwidthSaved: 0,
      },
      apiMetrics: {
        averageResponseTime: 0,
        compressionRatio: 0,
        successfulRequests: 0,
        failedRequests: 0,
      },
      websocketMetrics: {
        activeConnections: 0,
        averageLatency: 0,
        messagesPerSecond: 0,
      },
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metrics)

    // Keep only last 24 hours of metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    this.metrics = this.metrics.filter(m => m.timestamp > oneDayAgo)
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(timeRange?: { start: string; end: string }): AestheticPerformanceMetrics[] {
    if (!timeRange) {
      return [...this.metrics]
    }

    const start = new Date(timeRange.start).getTime()
    const end = new Date(timeRange.end).getTime()

    return this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp).getTime()
      return metricTime >= start && metricTime <= end
    })
  }

  /**
   * Clear cache entries by pattern
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Warm up cache for frequently accessed data
   */
  async warmUpCache(): Promise<void> {
    try {
      // Warm up treatment catalog
      await this.getOptimizedTreatmentCatalog()

      // Warm up recent analytics
      await this.getOptimizedClinicAnalytics({
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      })

      console.warn('[Performance] Cache warm-up completed')
    } catch {
      console.error('[Performance] Cache warm-up failed:', error)
    }
  }
}

// Factory function for creating optimizer instances
export const createAestheticClinicPerformanceOptimizer = (
  supabase: SupabaseClient,
  config?: Parameters<typeof AestheticClinicPerformanceOptimizer>[1],
) => {
  return new AestheticClinicPerformanceOptimizer(supabase, config)
}

export default AestheticClinicPerformanceOptimizer
