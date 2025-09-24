# Performance Optimization Strategies

## ⚡ Performance Architecture Overview

The aesthetic clinic system implements a multi-layered performance optimization strategy focusing on scalability, responsiveness, and resource efficiency while maintaining healthcare compliance requirements.

## 🏗️ Performance Architecture

### Optimization Layers

```
Frontend: Lazy Loading, Code Splitting, Caching, Optimized Rendering
API: Response Compression, Query Optimization, Rate Limiting, Caching
Database: Indexing, Query Optimization, Connection Pooling, Caching
Infrastructure: Load Balancing, Auto-scaling, CDN, Monitoring
```

## 🚀 Frontend Performance Optimization

### Code Splitting & Lazy Loading

```typescript
// apps/web/src/router/index.tsx
import { createRoute, createRouter } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy loading route components
const ClientManagement = lazy(() =>
  import('~/components/aesthetic/client-management/ClientManagement').then(m => ({
    default: m.ClientManagement,
  }))
)

const TreatmentPlanner = lazy(() =>
  import('~/components/aesthetic/treatment-planning/TreatmentPlanner').then(m => ({
    default: m.TreatmentPlanner,
  }))
)

const AICalendarScheduler = lazy(() =>
  import('~/components/aesthetic/scheduling/AICalendarScheduler').then(m => ({
    default: m.AICalendarScheduler,
  }))
)

const ComplianceDashboard = lazy(() =>
  import('~/components/aesthetic/compliance/ComplianceDashboard').then(m => ({
    default: m.ComplianceDashboard,
  }))
)

// Route configuration with performance optimizations
const routeTree = createRoute({
  path: '/',
  component: lazy(() => import('~/components/layout/Layout')),
}).createChildren([
  createRoute({
    path: '/clients',
    component: ClientManagement,
    loader: () => import('~/hooks/useClients').then(m => ({ default: m.useClients })),
    shouldReload: () => false, // Prevent unnecessary reloads
  }),
  createRoute({
    path: '/treatments',
    component: TreatmentPlanner,
    loader: () => import('~/hooks/useTreatments').then(m => ({ default: m.useTreatments })),
    shouldReload: () => false,
  }),
  createRoute({
    path: '/scheduling',
    component: AICalendarScheduler,
    loader: () => import('~/hooks/useScheduling').then(m => ({ default: m.useScheduling })),
    shouldReload: () => false,
  }),
  createRoute({
    path: '/compliance',
    component: ComplianceDashboard,
    loader: () => import('~/hooks/useCompliance').then(m => ({ default: m.useCompliance })),
    shouldReload: () => false,
  }),
])

// Create router with performance optimizations
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // Only preload when user intends to navigate
  defaultPreloadStaleTime: 5 * 60 * 1000, // 5 minutes
  context: {
    // Shared context for performance
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          cacheTime: 10 * 60 * 1000, // 10 minutes
          refetchOnWindowFocus: false,
          refetchOnMount: false,
        },
      },
    }),
  },
})
```

### Component Optimization

```typescript
// apps/web/src/components/shared/optimized-components.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { memo, useCallback, useMemo, useState } from 'react'

// Optimized client list component
export const OptimizedClientList: React.FC<ClientListProps> = memo(
  ({ clients, onClientSelect }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'treatments'>('name')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

    // Memoized filtered and sorted clients
    const filteredClients = useMemo(() => {
      return clients
        .filter(client => {
          const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesStatus = filterStatus === 'all' || client.status === filterStatus
          return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'name':
              return a.fullName.localeCompare(b.fullName)
            case 'date':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            case 'treatments':
              return (b.treatmentCount || 0) - (a.treatmentCount || 0)
            default:
              return 0
          }
        })
    }, [clients, searchTerm, sortBy, filterStatus])

    // Virtual list implementation for large datasets
    const parentRef = React.useRef<HTMLDivElement>(null)

    const rowVirtualizer = useVirtualizer({
      count: filteredClients.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 80, // Estimated row height
      overscan: 5, // Number of items to render outside viewport
    })

    const handleClientSelect = useCallback((clientId: string) => {
      onClientSelect(clientId)
    }, [onClientSelect])

    return (
      <div className='space-y-4'>
        {/* Search and filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder='Buscar clientes...'
              className='w-full'
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Ordenar por' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name'>Nome</SelectItem>
              <SelectItem value='date'>Data</SelectItem>
              <SelectItem value='treatments'>Tratamentos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos</SelectItem>
              <SelectItem value='active'>Ativos</SelectItem>
              <SelectItem value='inactive'>Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Virtual list container */}
        <div
          ref={parentRef}
          className='h-[600px] overflow-auto border rounded-lg'
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const client = filteredClients[virtualRow.index]
              return (
                <div
                  key={virtualRow.index}
                  className='absolute top-0 left-0 w-full p-4 border-b hover:bg-muted/50'
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => handleClientSelect(client.id)}
                >
                  <ClientListItem client={client} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Results summary */}
        <div className='text-sm text-muted-foreground'>
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </div>
    )
  },
)

OptimizedClientList.displayName = 'OptimizedClientList'

// Optimized client list item component
const ClientListItem: React.FC<{ client: AestheticClientProfile }> = memo(({ client }) => {
  const initials = useMemo(() => {
    return client.fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }, [client.fullName])

  const lastVisitDate = useMemo(() => {
    return client.lastVisitDate
      ? format(new Date(client.lastVisitDate), 'dd/MM/yyyy')
      : 'Nunca'
  }, [client.lastVisitDate])

  return (
    <div className='flex items-center space-x-4'>
      <Avatar className='h-10 w-10'>
        <AvatarImage src={client.profilePhotoUrl} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <h3 className='font-medium truncate'>{client.fullName}</h3>
          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
            {client.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
          <span>{client.email}</span>
          <span>•</span>
          <span>{formatCPF(client.cpf)}</span>
          <span>•</span>
          <span>Última visita: {lastVisitDate}</span>
        </div>
      </div>

      <div className='text-right'>
        <div className='font-medium'>{client.treatmentCount || 0} tratamentos</div>
        <div className='text-sm text-muted-foreground'>
          {formatCurrency(client.totalSpent || 0)}
        </div>
      </div>
    </div>
  )
})

ClientListItem.displayName = 'ClientListItem'
```

### Image Optimization

```typescript
// apps/web/src/components/shared/optimized-image.tsx
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
  quality?: number
  priority?: boolean
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  loading = 'lazy',
  placeholder = 'blur',
  quality = 80,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority && imgRef.current) {
      // Preload priority images
      const img = new Image()
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setHasError(true)
      img.src = src
    }
  }, [src, priority])

  const optimizedSrc = useMemo(() => {
    // Generate optimized image URL with quality parameters
    const url = new URL(src, window.location.origin)
    url.searchParams.set('width', width.toString())
    url.searchParams.set('height', height.toString())
    url.searchParams.set('quality', quality.toString())
    url.searchParams.set('format', 'webp')
    return url.toString()
  }, [src, width, height, quality])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div className='absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse' />
      )}

      {hasError
        ? (
          <div className='absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground'>
            <div className='text-center'>
              <ImageOff className='h-12 w-12 mx-auto mb-2' />
              <span className='text-sm'>Imagem não disponível</span>
            </div>
          </div>
        )
        : (
          <img
            ref={imgRef}
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              objectFit: 'cover',
            }}
          />
        )}
    </div>
  )
}
```

## 🚀 API Performance Optimization

### Response Compression & Caching

```typescript
// apps/api/src/middleware/compression-middleware.ts
import compression from 'compression'
import { NextFunction, Request, Response } from 'express'

export class CompressionMiddleware {
  private compression: any
  private cacheService: CacheService

  constructor() {
    this.compression = compression({
      level: 6, // Balance between compression ratio and speed
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req: Request, res: Response) => {
        // Don't compress images or already compressed content
        if (res.getHeader('Content-Type')?.includes('image')) {
          return false
        }
        return compression.filter(req, res)
      },
    })

    this.cacheService = new CacheService()
  }

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Apply compression
    this.compression(req, res, async () => {
      // Apply caching for GET requests
      if (req.method === 'GET' && this.isCacheable(req)) {
        const cacheKey = this.generateCacheKey(req)
        const cachedResponse = await this.cacheService.get(cacheKey)

        if (cachedResponse) {
          res.setHeader('X-Cache', 'HIT')
          res.setHeader('Content-Type', cachedResponse.contentType)
          return res.send(cachedResponse.data)
        }

        // Cache the response
        const originalSend = res.send
        res.send = (data: any) => {
          this.cacheService.set(cacheKey, {
            data,
            contentType: res.getHeader('Content-Type'),
            timestamp: Date.now(),
          })
          return originalSend.call(res, data)
        }

        res.setHeader('X-Cache', 'MISS')
      }

      next()
    })
  }

  private isCacheable(req: Request): boolean {
    const nonCacheablePaths = [
      '/api/v1/auth',
      '/api/v1/compliance',
      '/api/v1/analytics/realtime',
    ]

    return !nonCacheablePaths.some(path => req.path.startsWith(path))
  }

  private generateCacheKey(req: Request): string {
    const url = new URL(req.url, `${req.protocol}://${req.get('host')}`)
    return `cache:${req.method}:${url.pathname}:${url.search}`
  }
}

// Response caching service
export class CacheService {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 1000 // Maximum cache entries
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  async get(key: string): Promise<CachedResponse | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  async set(key: string, data: any, ttl: number = this.defaultTTL): Promise<void> {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.calculateMemoryUsage(),
    }
  }

  private calculateHitRate(): number {
    // Implementation would track hits/misses
    return 0.85 // Example hit rate
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length
    }
    return totalSize
  }
}
```

### Query Optimization

```typescript
// apps/api/src/services/database/query-optimizer-service.ts
export class QueryOptimizerService {
  private queryCache: Map<string, QueryCacheEntry> = new Map()
  private slowQueryThreshold: number = 1000 // ms

  async optimizeQuery<T>(
    query: string,
    params: any[],
    options: QueryOptions = {},
  ): Promise<QueryResult<T>> {
    const startTime = Date.now()

    // Generate cache key
    const cacheKey = this.generateCacheKey(query, params, options)

    // Check cache
    if (options.cache !== false) {
      const cached = this.queryCache.get(cacheKey)
      if (cached && !this.isCacheExpired(cached)) {
        return cached.result
      }
    }

    // Analyze and optimize query
    const optimizedQuery = await this.analyzeAndOptimizeQuery(query)

    // Execute query with retry logic
    const result = await this.executeQueryWithRetry<T>(optimizedQuery, params, options)

    // Calculate execution time
    const executionTime = Date.now() - startTime

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      await this.logSlowQuery(query, executionTime, params)
    }

    // Cache result
    if (options.cache !== false && this.shouldCacheResult(result)) {
      this.queryCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        ttl: options.cacheTTL || 5 * 60 * 1000, // 5 minutes
      })
    }

    return {
      ...result,
      executionTime,
      cached: false,
    }
  }

  private async analyzeAndOptimizeQuery(query: string): Promise<string> {
    // Remove unnecessary whitespace
    let optimized = query.replace(/\s+/g, ' ').trim()

    // Add query hints for PostgreSQL
    if (this.isSelectQuery(optimized)) {
      optimized = this.addQueryHints(optimized)
    }

    // Optimize JOIN order if possible
    optimized = this.optimizeJoinOrder(optimized)

    // Add appropriate indexes suggestion
    await this.suggestIndexes(optimized)

    return optimized
  }

  private addQueryHints(query: string): string {
    // Add parallel query hint for large datasets
    if (this.isLargeDatasetQuery(query)) {
      return `/*+ Parallel(8) */ ${query}`
    }

    // Add index scan hint for filtered queries
    if (this.hasWhereClause(query)) {
      return `/*+ IndexScan */ ${query}`
    }

    return query
  }

  private optimizeJoinOrder(query: string): string {
    // Simple heuristic: put tables with smaller result sets first
    // This is a simplified version - real optimization would require statistics
    return query
  }

  private async suggestIndexes(query: string): Promise<void> {
    // Analyze query for missing indexes
    const tables = this.extractTablesFromQuery(query)
    const columns = this.extractColumnsFromQuery(query)

    for (const table of tables) {
      for (const column of columns[table] || []) {
        if (this.needsIndex(table, column)) {
          await this.logIndexSuggestion(table, column)
        }
      }
    }
  }

  private async executeQueryWithRetry<T>(
    query: string,
    params: any[],
    options: QueryOptions,
  ): Promise<QueryResult<T>> {
    const maxRetries = options.maxRetries || 3
    const baseDelay = options.baseDelay || 100

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeQuery<T>(query, params)
        return result
      } catch (error) {
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw error
        }

        const delay = baseDelay * Math.pow(2, attempt - 1)
        await this.sleep(delay)
      }
    }

    throw new Error('Max retries exceeded')
  }

  private generateCacheKey(query: string, params: any[], options: QueryOptions): string {
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim()
    const paramString = JSON.stringify(params)
    const optionsString = JSON.stringify(options)

    return `query:${hashCode(normalizedQuery)}:${hashCode(paramString)}:${hashCode(optionsString)}`
  }

  private isCacheExpired(entry: QueryCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private shouldCacheResult(result: QueryResult<any>): boolean {
    // Don't cache large results
    return JSON.stringify(result).length < 1024 * 1024 // 1MB
  }

  private async logSlowQuery(query: string, executionTime: number, params: any[]): Promise<void> {
    console.warn(`Slow query detected (${executionTime}ms):`, {
      query: query.substring(0, 200) + '...',
      params,
      timestamp: new Date().toISOString(),
    })

    // Send to monitoring service
    await this.monitoringService.logMetric('slow_query', {
      executionTime,
      queryLength: query.length,
      paramsCount: params.length,
    })
  }
}
```

## 🗄️ Database Performance Optimization

### Connection Pooling

```typescript
// apps/api/src/services/connection-pool-manager.ts
export class ConnectionPoolManager {
  private pools: Map<string, ConnectionPool> = new Map()
  private metrics: PoolMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    totalQueries: 0,
    averageQueryTime: 0,
    connectionErrors: 0,
  }

  constructor(private config: PoolConfig) {
    this.initializePools()
    this.startMetricsCollection()
  }

  private initializePools(): void {
    // Primary database pool
    this.pools.set(
      'primary',
      new ConnectionPool({
        ...this.config,
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        maxLifetime: 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    )

    // Read replica pool for analytics queries
    this.pools.set(
      'read_replica',
      new ConnectionPool({
        ...this.config,
        max: 10,
        min: 2,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 5000,
        readonly: true,
      }),
    )

    // Pool for compliance/audit queries
    this.pools.set(
      'audit',
      new ConnectionPool({
        ...this.config,
        max: 5,
        min: 1,
        idleTimeoutMillis: 120000,
        connectionTimeoutMillis: 10000,
        readonly: true,
      }),
    )
  }

  async getConnection(poolType: PoolType = 'primary'): Promise<Connection> {
    const pool = this.pools.get(poolType)
    if (!pool) {
      throw new Error(`Connection pool '${poolType}' not found`)
    }

    const startTime = Date.now()

    try {
      const connection = await pool.getConnection()
      const waitTime = Date.now() - startTime

      // Update metrics
      this.metrics.waitingRequests = Math.max(0, this.metrics.waitingRequests - 1)
      this.metrics.totalQueries++
      this.metrics.averageQueryTime =
        (this.metrics.averageQueryTime * (this.metrics.totalQueries - 1) + waitTime) /
        this.metrics.totalQueries

      return connection
    } catch (error) {
      this.metrics.connectionErrors++
      throw error
    }
  }

  async executeQuery<T>(
    query: string,
    params: any[] = [],
    options: QueryOptions = {},
  ): Promise<QueryResult<T>> {
    const poolType = this.determinePoolType(query, options)
    const connection = await this.getConnection(poolType)

    try {
      const result = await connection.query(query, params)
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields,
      }
    } finally {
      connection.release()
    }
  }

  private determinePoolType(query: string, options: QueryOptions): PoolType {
    if (options.readonly) {
      return 'read_replica'
    }

    if (options.compliance) {
      return 'audit'
    }

    if (this.isAnalyticsQuery(query)) {
      return 'read_replica'
    }

    return 'primary'
  }

  private isAnalyticsQuery(query: string): boolean {
    const analyticsKeywords = [
      'GROUP BY',
      'COUNT(',
      'SUM(',
      'AVG(',
      'analytics',
      'report',
      'statistics',
    ]

    const upperQuery = query.toUpperCase()
    return analyticsKeywords.some(keyword => upperQuery.includes(keyword))
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updatePoolMetrics()
    }, 10000) // Update every 10 seconds
  }

  private updatePoolMetrics(): void {
    let totalConnections = 0
    let activeConnections = 0
    let idleConnections = 0

    for (const pool of this.pools.values()) {
      const poolStats = pool.getStats()
      totalConnections += poolStats.total
      activeConnections += poolStats.active
      idleConnections += poolStats.idle
    }

    this.metrics = {
      ...this.metrics,
      totalConnections,
      activeConnections,
      idleConnections,
    }
  }

  getMetrics(): PoolMetrics {
    return { ...this.metrics }
  }

  async healthCheck(): Promise<PoolHealth> {
    const healthStatus: PoolHealth = {
      overall: 'healthy',
      pools: {},
    }

    for (const [poolType, pool] of this.pools) {
      try {
        const connection = await pool.getConnection()
        await connection.query('SELECT 1')
        connection.release()

        const stats = pool.getStats()
        healthStatus.pools[poolType] = {
          status: 'healthy',
          totalConnections: stats.total,
          activeConnections: stats.active,
          idleConnections: stats.idle,
          waitingRequests: stats.waiting,
        }
      } catch (error) {
        healthStatus.pools[poolType] = {
          status: 'unhealthy',
          error: error.message,
        }
        healthStatus.overall = 'degraded'
      }
    }

    return healthStatus
  }
}
```

### Query Caching

```typescript
// apps/api/src/services/cache/enhanced-query-cache.ts
export class EnhancedQueryCache {
  private cache: Map<string, CacheEntry> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    maxSize: 1000,
    hitRate: 0,
  }

  constructor(private config: CacheConfig) {
    this.startCleanupTask()
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.evictions++
      this.stats.size--
      return null
    }

    this.stats.hits++
    this.updateHitRate()

    // Update access time for LRU eviction
    entry.lastAccessed = Date.now()

    return entry.data
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    // Evict entries if cache is full
    if (this.cache.size >= this.stats.maxSize) {
      this.evictEntries()
    }

    const entry: CacheEntry<T> = {
      data,
      created: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      lastAccessed: Date.now(),
      accessCount: 1,
      priority: options.priority || 'normal',
    }

    this.cache.set(key, entry)
    this.stats.size++
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
      this.stats.size--
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.stats.size = 0
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.created > entry.ttl
  }

  private evictEntries(): void {
    // LRU eviction strategy
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    const evictionCount = Math.floor(this.stats.maxSize * 0.2) // Evict 20%

    for (let i = 0; i < evictionCount && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
      this.stats.size--
      this.stats.evictions++
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, this.config.cleanupInterval)
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      if (now - entry.created > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
      this.stats.size--
      this.stats.evictions++
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }
}
```

## 📊 Performance Monitoring

### Real-time Performance Monitoring

```typescript
// apps/api/src/services/monitoring-service.ts
export class PerformanceMonitoringService {
  private metrics: Map<string, Metric[]> = new Map()
  private alerts: PerformanceAlert[] = []
  private thresholds: PerformanceThresholds

  constructor() {
    this.thresholds = {
      responseTime: { warning: 1000, critical: 3000 }, // ms
      errorRate: { warning: 0.05, critical: 0.1 }, // 5%, 10%
      cpuUsage: { warning: 0.7, critical: 0.9 }, // 70%, 90%
      memoryUsage: { warning: 0.8, critical: 0.95 }, // 80%, 95%
      databaseConnections: { warning: 0.8, critical: 0.95 }, // 80%, 95%
    }

    this.startMonitoring()
  }

  async recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): Promise<void> {
    const metric: Metric = {
      timestamp: Date.now(),
      value,
      tags,
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metrics = this.metrics.get(name)!
    metrics.push(metric)

    // Keep only last 1000 data points
    if (metrics.length > 1000) {
      metrics.shift()
    }

    // Check for alerts
    await this.checkAlerts(name, value, tags)
  }

  private async checkAlerts(
    name: string,
    value: number,
    tags: Record<string, string>,
  ): Promise<void> {
    const threshold = this.thresholds[name as keyof PerformanceThresholds]
    if (!threshold) return

    const alertType = value >= threshold.critical
      ? 'critical'
      : value >= threshold.warning
      ? 'warning'
      : null

    if (alertType) {
      const alert: PerformanceAlert = {
        id: generateUUID(),
        metric: name,
        value,
        threshold: threshold[alertType],
        severity: alertType,
        timestamp: Date.now(),
        tags,
        resolved: false,
      }

      this.alerts.push(alert)
      await this.notifyTeam(alert)
    }
  }

  private async notifyTeam(alert: PerformanceAlert): Promise<void> {
    // Send notification to relevant teams
    await this.notificationService.send({
      type: 'performance_alert',
      severity: alert.severity,
      title: `Performance Alert: ${alert.metric}`,
      message: `${alert.metric} is ${alert.value} (threshold: ${alert.threshold})`,
      tags: alert.tags,
    })
  }

  private startMonitoring(): void {
    // Monitor response times
    setInterval(async () => {
      const responseTime = await this.measureResponseTime()
      await this.recordMetric('responseTime', responseTime)
    }, 60000) // Every minute

    // Monitor error rates
    setInterval(async () => {
      const errorRate = await this.calculateErrorRate()
      await this.recordMetric('errorRate', errorRate)
    }, 300000) // Every 5 minutes

    // Monitor system resources
    setInterval(async () => {
      const [cpuUsage, memoryUsage] = await Promise.all([
        this.getCPUUsage(),
        this.getMemoryUsage(),
      ])

      await this.recordMetric('cpuUsage', cpuUsage)
      await this.recordMetric('memoryUsage', memoryUsage)
    }, 30000) // Every 30 seconds

    // Monitor database connections
    setInterval(async () => {
      const connectionUsage = await this.getDatabaseConnectionUsage()
      await this.recordMetric('databaseConnections', connectionUsage)
    }, 60000) // Every minute
  }

  async getDashboard(): Promise<PerformanceDashboard> {
    const latestMetrics = new Map<string, Metric>()

    for (const [name, metrics] of this.metrics) {
      if (metrics.length > 0) {
        latestMetrics.set(name, metrics[metrics.length - 1])
      }
    }

    return {
      timestamp: Date.now(),
      metrics: Object.fromEntries(latestMetrics),
      alerts: this.alerts.filter(a => !a.resolved),
      summary: {
        overall: this.calculateOverallHealth(),
        responseTime: latestMetrics.get('responseTime')?.value || 0,
        errorRate: latestMetrics.get('errorRate')?.value || 0,
        cpuUsage: latestMetrics.get('cpuUsage')?.value || 0,
        memoryUsage: latestMetrics.get('memoryUsage')?.value || 0,
        databaseConnections: latestMetrics.get('databaseConnections')?.value || 0,
      },
    }
  }

  private calculateOverallHealth(): 'healthy' | 'warning' | 'critical' {
    const latestMetrics = new Map<string, Metric>()

    for (const [name, metrics] of this.metrics) {
      if (metrics.length > 0) {
        latestMetrics.set(name, metrics[metrics.length - 1])
      }
    }

    let criticalCount = 0
    let warningCount = 0

    for (const [name, metric] of latestMetrics) {
      const threshold = this.thresholds[name as keyof PerformanceThresholds]
      if (!threshold) continue

      if (metric.value >= threshold.critical) {
        criticalCount++
      } else if (metric.value >= threshold.warning) {
        warningCount++
      }
    }

    if (criticalCount > 0) return 'critical'
    if (warningCount > 2) return 'warning'
    return 'healthy'
  }

  async generateReport(timeRange: { start: Date; end: Date }): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      period: timeRange,
      generatedAt: new Date(),
      summary: {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        availability: 1,
      },
      metrics: {},
      recommendations: [],
    }

    // Calculate metrics for the time period
    for (const [name, metrics] of this.metrics) {
      const periodMetrics = metrics.filter(m =>
        m.timestamp >= timeRange.start.getTime() &&
        m.timestamp <= timeRange.end.getTime()
      )

      if (periodMetrics.length > 0) {
        report.metrics[name] = {
          count: periodMetrics.length,
          average: periodMetrics.reduce((sum, m) => sum + m.value, 0) / periodMetrics.length,
          min: Math.min(...periodMetrics.map(m => m.value)),
          max: Math.max(...periodMetrics.map(m => m.value)),
          percentile95: this.calculatePercentile(periodMetrics.map(m => m.value), 95),
        }
      }
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.metrics)

    return report
  }

  private generateRecommendations(metrics: Record<string, MetricStats>): string[] {
    const recommendations: string[] = []

    if (metrics.responseTime?.average > 2000) {
      recommendations.push('Consider implementing response caching for slow endpoints')
    }

    if (metrics.errorRate?.average > 0.05) {
      recommendations.push('High error rate detected - investigate root causes')
    }

    if (metrics.cpuUsage?.average > 0.8) {
      recommendations.push('High CPU usage - consider scaling or optimizing queries')
    }

    if (metrics.memoryUsage?.average > 0.85) {
      recommendations.push('High memory usage - check for memory leaks')
    }

    if (metrics.databaseConnections?.average > 0.9) {
      recommendations.push('Database connection pool near capacity - increase pool size')
    }

    return recommendations
  }
}
```

This comprehensive performance optimization strategy ensures the aesthetic clinic system delivers excellent user experience while maintaining scalability and reliability for healthcare operations.
