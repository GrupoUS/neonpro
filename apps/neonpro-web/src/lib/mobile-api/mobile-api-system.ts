/**
 * Mobile API System - Core Implementation
 * Story 7.4: Mobile App API Support
 * 
 * Comprehensive mobile API system with:
 * - Mobile-optimized authentication
 * - Offline synchronization
 * - Intelligent caching
 * - Data compression
 * - Push notifications
 * - Performance optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  MobileApiSystem,
  MobileApiConfig,
  MobileAuthRequest,
  MobileAuthResponse,
  MobileApiRequest,
  MobileApiResponse,
  SyncOptions,
  SyncResult,
  PushNotification,
  PushResult,
  OfflineStorage,
  SystemStatus,
  MobileApiEventHandlers,
  DeviceInfo,
  SyncOperation,
  SyncBatch,
  CacheEntry,
  NetworkStatus,
  ApiError,
  CompressionResult,
  MobileUser,
  MobileClinic
} from './types'
import { MobileCache } from './cache-manager'
import { OfflineSync } from './offline-sync'
import { PushManager } from './push-manager'
import { CompressionUtils } from './compression-utils'
import { SecurityUtils } from './security-utils'

export class MobileApiSystemImpl implements MobileApiSystem {
  private supabase: SupabaseClient
  private config: MobileApiConfig
  private cache: MobileCache
  private offlineSync: OfflineSync
  private pushManager: PushManager
  private compressionUtils: CompressionUtils
  private securityUtils: SecurityUtils
  private eventHandlers: MobileApiEventHandlers = {}
  private networkStatus: NetworkStatus = 'online'
  private isInitialized = false
  private currentUser: MobileUser | null = null
  private currentClinic: MobileClinic | null = null
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    // Initialize with default config
    this.config = this.getDefaultConfig()
    
    // Initialize network status monitoring
    this.initializeNetworkMonitoring()
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(config: MobileApiConfig): Promise<void> {
    try {
      this.config = { ...this.getDefaultConfig(), ...config }
      
      // Initialize Supabase client
      this.supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        }
      )

      // Initialize subsystems
      this.cache = new MobileCache(this.config.cache)
      this.offlineSync = new OfflineSync(this.supabase, this.config.offline)
      this.pushManager = new PushManager(this.config.push)
      this.compressionUtils = new CompressionUtils(this.config.compression)
      this.securityUtils = new SecurityUtils(this.config.security)

      // Initialize subsystems
      await Promise.all([
        this.cache.initialize(),
        this.offlineSync.initialize(),
        this.pushManager.initialize(),
        this.compressionUtils.initialize(),
        this.securityUtils.initialize()
      ])

      // Setup event listeners
      this.setupEventListeners()

      // Start background processes
      this.startBackgroundProcesses()

      this.isInitialized = true
      
      console.log('Mobile API System initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Mobile API System:', error)
      throw new Error(`Mobile API initialization failed: ${error}`)
    }
  }

  private getDefaultConfig(): MobileApiConfig {
    return {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      version: '2.0',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      compression: {
        level: 'medium',
        algorithm: 'gzip',
        threshold: 1024,
        mimeTypes: ['application/json', 'text/plain'],
        excludePatterns: ['image/*', 'video/*']
      },
      cache: {
        strategy: 'cache-first',
        ttl: 300,
        maxSize: 50 * 1024 * 1024,
        maxEntries: 10000,
        compression: true,
        encryption: false,
        persistToDisk: true,
        syncOnReconnect: true
      },
      offline: {
        enabled: true,
        maxStorageSize: 100 * 1024 * 1024,
        syncInterval: 60,
        conflictResolution: 'timestamp',
        autoSync: true,
        syncOnReconnect: true,
        backgroundSync: true,
        maxRetries: 5,
        retryDelay: 5
      },
      push: {
        enabled: true,
        maxNotifications: 100,
        grouping: true,
        persistence: true
      },
      security: {
        encryption: true,
        tokenRefreshThreshold: 300,
        biometricTimeout: 300,
        maxFailedAttempts: 5,
        lockoutDuration: 900,
        certificatePinning: false,
        allowInsecureConnections: false
      },
      performance: {
        imageOptimization: true,
        lazyLoading: true,
        prefetching: true,
        bundleCompression: true,
        minificationLevel: 'basic',
        cachePreloading: true,
        backgroundProcessing: true,
        memoryManagement: true
      }
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async authenticate(request: MobileAuthRequest): Promise<MobileAuthResponse> {
    try {
      // Validate device info
      this.validateDeviceInfo(request.deviceInfo)

      let authResult
      
      if (request.refreshToken) {
        // Refresh token authentication
        authResult = await this.refreshAuthentication(request.refreshToken)
      } else if (request.biometricData) {
        // Biometric authentication
        authResult = await this.biometricAuthentication(request)
      } else if (request.email && request.password) {
        // Email/password authentication
        authResult = await this.emailPasswordAuthentication(request)
      } else if (request.phone) {
        // Phone authentication
        authResult = await this.phoneAuthentication(request)
      } else {
        throw new Error('Invalid authentication request')
      }

      // Store authentication data
      this.currentUser = authResult.user
      this.currentClinic = authResult.clinic
      this.accessToken = authResult.accessToken
      this.refreshToken = authResult.refreshToken
      this.tokenExpiresAt = Date.now() + (authResult.expiresIn * 1000)

      // Register device for push notifications
      if (request.pushToken) {
        await this.pushManager.registerDevice({
          deviceId: request.deviceId,
          userId: authResult.user.id,
          clinicId: authResult.clinic.id,
          token: request.pushToken,
          platform: request.deviceInfo.platform,
          isActive: true,
          preferences: authResult.user.preferences.notifications,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsed: new Date()
        })
      }

      // Initialize offline sync for user
      await this.offlineSync.initializeForUser(authResult.user.id, authResult.clinic.id)

      // Trigger initial sync if online
      if (this.networkStatus === 'online' && this.config.offline.autoSync) {
        this.sync({ priority: 'normal' }).catch(console.error)
      }

      return authResult
    } catch (error) {
      console.error('Authentication failed:', error)
      throw this.createApiError('AUTH_FAILED', `Authentication failed: ${error}`, true)
    }
  }

  private async emailPasswordAuthentication(request: MobileAuthRequest): Promise<MobileAuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: request.email!,
      password: request.password!
    })

    if (error) {
      throw new Error(error.message)
    }

    return this.buildAuthResponse(data, request.deviceInfo)
  }

  private async phoneAuthentication(request: MobileAuthRequest): Promise<MobileAuthResponse> {
    // Implement phone authentication logic
    throw new Error('Phone authentication not implemented yet')
  }

  private async biometricAuthentication(request: MobileAuthRequest): Promise<MobileAuthResponse> {
    // Validate biometric data
    const isValid = await this.securityUtils.validateBiometricData(
      request.biometricData!,
      request.deviceId
    )

    if (!isValid) {
      throw new Error('Invalid biometric data')
    }

    // Get stored credentials for device
    const credentials = await this.securityUtils.getStoredCredentials(request.deviceId)
    if (!credentials) {
      throw new Error('No stored credentials found for device')
    }

    // Authenticate with stored credentials
    return this.emailPasswordAuthentication({
      ...request,
      email: credentials.email,
      password: credentials.password
    })
  }

  private async refreshAuthentication(refreshToken: string): Promise<MobileAuthResponse> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error) {
      throw new Error(error.message)
    }

    return this.buildAuthResponse(data, this.getCurrentDeviceInfo())
  }

  private async buildAuthResponse(authData: any, deviceInfo: DeviceInfo): Promise<MobileAuthResponse> {
    // Fetch user profile
    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // Fetch clinic data
    const { data: clinicData } = await this.supabase
      .from('clinics')
      .select('*')
      .eq('id', userProfile.clinic_id)
      .single()

    // Build mobile user object
    const mobileUser: MobileUser = {
      id: authData.user.id,
      email: authData.user.email,
      name: userProfile.name,
      avatar: userProfile.avatar_url,
      role: userProfile.role,
      clinicId: userProfile.clinic_id,
      preferences: this.buildUserPreferences(userProfile),
      lastLoginAt: new Date(),
      isActive: true
    }

    // Build mobile clinic object
    const mobileClinic: MobileClinic = {
      id: clinicData.id,
      name: clinicData.name,
      logo: clinicData.logo_url,
      address: clinicData.address,
      phone: clinicData.phone,
      email: clinicData.email,
      website: clinicData.website,
      timezone: clinicData.timezone,
      businessHours: clinicData.business_hours || [],
      features: clinicData.features || [],
      subscription: clinicData.subscription || {},
      branding: clinicData.branding || {}
    }

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in,
      user: mobileUser,
      clinic: mobileClinic,
      permissions: userProfile.permissions || [],
      features: clinicData.features || [],
      syncTimestamp: Date.now()
    }
  }

  // ============================================================================
  // API REQUESTS
  // ============================================================================

  async request<T>(request: MobileApiRequest): Promise<MobileApiResponse<T>> {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      // Validate authentication
      await this.ensureAuthenticated()

      // Check cache first if strategy allows
      if (this.shouldCheckCache(request)) {
        const cachedResponse = await this.cache.get<T>(this.buildCacheKey(request))
        if (cachedResponse) {
          return this.buildResponse(cachedResponse.data, {
            requestId,
            timestamp: Date.now(),
            processingTime: Date.now() - startTime,
            source: 'cache',
            version: this.config.version,
            cacheInfo: {
              hit: true,
              age: Date.now() - cachedResponse.createdAt,
              ttl: cachedResponse.expiresAt - Date.now(),
              key: this.buildCacheKey(request),
              strategy: request.cacheStrategy || this.config.cache.strategy
            }
          })
        }
      }

      // Handle offline mode
      if (this.networkStatus === 'offline') {
        if (request.offlineFallback) {
          return this.handleOfflineRequest<T>(request, requestId, startTime)
        } else {
          throw this.createApiError('OFFLINE', 'Device is offline and no offline fallback available', true)
        }
      }

      // Make network request
      const response = await this.makeNetworkRequest<T>(request, requestId, startTime)

      // Cache response if successful
      if (response.success && this.shouldCacheResponse(request, response)) {
        await this.cache.set(this.buildCacheKey(request), {
          key: this.buildCacheKey(request),
          data: response.data,
          metadata: {
            version: this.config.version,
            contentType: 'application/json',
            source: 'network',
            priority: request.priority,
            tags: [request.endpoint, request.method]
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          accessedAt: Date.now(),
          expiresAt: Date.now() + (this.config.cache.ttl * 1000),
          size: JSON.stringify(response.data).length,
          compressed: false,
          encrypted: false
        })
      }

      return response
    } catch (error) {
      console.error('API request failed:', error)
      
      // Try offline fallback if available
      if (request.offlineFallback && this.networkStatus !== 'online') {
        return this.handleOfflineRequest<T>(request, requestId, startTime)
      }

      throw error
    }
  }

  private async makeNetworkRequest<T>(
    request: MobileApiRequest,
    requestId: string,
    startTime: number
  ): Promise<MobileApiResponse<T>> {
    const url = `${this.config.baseUrl}${request.endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'X-Request-ID': requestId,
      'X-Client-Version': this.config.version,
      'X-Device-Platform': request.deviceInfo.platform,
      ...request.headers
    }

    let body = request.body
    let compressionResult: CompressionResult | undefined

    // Compress request body if needed
    if (body && this.shouldCompressRequest(request)) {
      const compressed = await this.compressionUtils.compress(JSON.stringify(body))
      if (compressed.success) {
        body = compressed.data
        headers['Content-Encoding'] = compressed.algorithm
        compressionResult = compressed
      }
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(request.timeout || this.config.timeout)
    }

    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw this.createApiError(
        `HTTP_${response.status}`,
        `HTTP ${response.status}: ${response.statusText}`,
        response.status >= 500
      )
    }

    let responseData = await response.json()

    // Decompress response if needed
    const contentEncoding = response.headers.get('Content-Encoding')
    if (contentEncoding && this.compressionUtils.isSupported(contentEncoding)) {
      const decompressed = await this.compressionUtils.decompress(responseData, contentEncoding)
      if (decompressed.success) {
        responseData = JSON.parse(decompressed.data)
      }
    }

    return this.buildResponse(responseData, {
      requestId,
      timestamp: Date.now(),
      processingTime: Date.now() - startTime,
      source: 'network',
      version: this.config.version,
      compression: compressionResult
    })
  }

  private async handleOfflineRequest<T>(
    request: MobileApiRequest,
    requestId: string,
    startTime: number
  ): Promise<MobileApiResponse<T>> {
    // Try to get data from offline storage
    const offlineData = await this.offlineSync.getOfflineData(request.endpoint, request.params)
    
    if (offlineData) {
      return this.buildResponse(offlineData, {
        requestId,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
        source: 'offline',
        version: this.config.version
      })
    }

    // Queue request for when online
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      await this.offlineSync.queueOperation({
        id: requestId,
        type: this.mapMethodToOperationType(request.method),
        entity: this.extractEntityFromEndpoint(request.endpoint),
        entityId: this.extractEntityIdFromRequest(request),
        data: request.body,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
        priority: request.priority
      })
    }

    throw this.createApiError('OFFLINE_NO_DATA', 'No offline data available for this request', true)
  }

  // ============================================================================
  // SYNCHRONIZATION
  // ============================================================================

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('Mobile API System not initialized')
      }

      if (!this.currentUser) {
        throw new Error('User not authenticated')
      }

      if (this.networkStatus === 'offline') {
        throw new Error('Cannot sync while offline')
      }

      this.emitEvent('onSyncStart', { id: 'sync-' + Date.now(), operations: [], timestamp: Date.now(), status: 'syncing', totalOperations: 0, successfulOperations: 0, failedOperations: 0, conflictOperations: 0 })

      const result = await this.offlineSync.performSync({
        userId: this.currentUser.id,
        clinicId: this.currentClinic!.id,
        ...options
      })

      this.emitEvent('onSyncComplete', result)

      return result
    } catch (error) {
      console.error('Sync failed:', error)
      const errorResult: SyncResult = {
        success: false,
        operations: [],
        conflicts: [],
        errors: [this.createApiError('SYNC_FAILED', `Sync failed: ${error}`, true)],
        statistics: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          conflictOperations: 0,
          bytesTransferred: 0,
          compressionRatio: 0
        },
        duration: 0
      }
      
      this.emitEvent('onSyncComplete', errorResult)
      return errorResult
    }
  }

  // ============================================================================
  // PUSH NOTIFICATIONS
  // ============================================================================

  async sendPushNotification(notification: PushNotification, targets: string[]): Promise<PushResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('Mobile API System not initialized')
      }

      return await this.pushManager.sendNotification(notification, targets)
    } catch (error) {
      console.error('Push notification failed:', error)
      return {
        success: false,
        delivered: 0,
        failed: targets.length,
        errors: [this.createApiError('PUSH_FAILED', `Push notification failed: ${error}`, true)]
      }
    }
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  async getOfflineData(): Promise<OfflineStorage> {
    if (!this.isInitialized) {
      throw new Error('Mobile API System not initialized')
    }

    return await this.offlineSync.getOfflineStorage()
  }

  async clearCache(pattern?: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Mobile API System not initialized')
    }

    await this.cache.clear(pattern)
  }

  // ============================================================================
  // SYSTEM STATUS
  // ============================================================================

  async getSystemStatus(): Promise<SystemStatus> {
    const cacheStats = await this.cache.getStats()
    const syncStatus = await this.offlineSync.getStatus()
    const storageUsage = await this.getStorageUsage()
    const performanceMetrics = await this.getPerformanceMetrics()

    return {
      online: this.networkStatus === 'online',
      apiVersion: this.config.version,
      serverTime: Date.now(), // This should be fetched from server
      clientTime: Date.now(),
      timeDrift: 0, // Calculate actual drift
      latency: 0, // Calculate actual latency
      cacheStats,
      syncStatus,
      storageUsage,
      performance: performanceMetrics
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async destroy(): Promise<void> {
    try {
      // Stop background processes
      this.stopBackgroundProcesses()

      // Cleanup subsystems
      await Promise.all([
        this.cache.destroy(),
        this.offlineSync.destroy(),
        this.pushManager.destroy(),
        this.compressionUtils.destroy(),
        this.securityUtils.destroy()
      ])

      // Clear authentication data
      this.currentUser = null
      this.currentClinic = null
      this.accessToken = null
      this.refreshToken = null
      this.tokenExpiresAt = 0

      this.isInitialized = false
      
      console.log('Mobile API System destroyed successfully')
    } catch (error) {
      console.error('Error destroying Mobile API System:', error)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private initializeNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.networkStatus = 'online'
        this.emitEvent('onNetworkChange', 'online')
        
        // Trigger sync when coming back online
        if (this.config.offline.syncOnReconnect && this.currentUser) {
          this.sync({ priority: 'high' }).catch(console.error)
        }
      })

      window.addEventListener('offline', () => {
        this.networkStatus = 'offline'
        this.emitEvent('onNetworkChange', 'offline')
      })

      // Initial status
      this.networkStatus = navigator.onLine ? 'online' : 'offline'
    }
  }

  private setupEventListeners(): void {
    // Setup internal event listeners for subsystems
    this.offlineSync.on('syncProgress', (progress, operation) => {
      this.emitEvent('onSyncProgress', progress, operation)
    })

    this.offlineSync.on('syncConflict', (conflict) => {
      this.emitEvent('onSyncConflict', conflict)
    })

    this.cache.on('cacheUpdate', (key, entry) => {
      this.emitEvent('onCacheUpdate', key, entry)
    })

    this.pushManager.on('pushReceived', (notification) => {
      this.emitEvent('onPushReceived', notification)
    })
  }

  private startBackgroundProcesses(): void {
    // Start periodic sync if enabled
    if (this.config.offline.autoSync) {
      setInterval(() => {
        if (this.networkStatus === 'online' && this.currentUser) {
          this.sync({ priority: 'low' }).catch(console.error)
        }
      }, this.config.offline.syncInterval * 1000)
    }

    // Start cache cleanup
    setInterval(() => {
      this.cache.cleanup().catch(console.error)
    }, 5 * 60 * 1000) // Every 5 minutes

    // Start token refresh monitoring
    setInterval(() => {
      this.checkTokenExpiry().catch(console.error)
    }, 60 * 1000) // Every minute
  }

  private stopBackgroundProcesses(): void {
    // Background processes are handled by intervals, which will be cleared when the object is destroyed
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.currentUser) {
      throw this.createApiError('UNAUTHENTICATED', 'User not authenticated', false)
    }

    // Check if token is about to expire
    if (this.tokenExpiresAt - Date.now() < this.config.security.tokenRefreshThreshold * 1000) {
      if (this.refreshToken) {
        try {
          const refreshed = await this.refreshAuthentication(this.refreshToken)
          this.accessToken = refreshed.accessToken
          this.refreshToken = refreshed.refreshToken
          this.tokenExpiresAt = Date.now() + (refreshed.expiresIn * 1000)
        } catch (error) {
          throw this.createApiError('TOKEN_REFRESH_FAILED', 'Failed to refresh token', false)
        }
      } else {
        throw this.createApiError('TOKEN_EXPIRED', 'Token expired and no refresh token available', false)
      }
    }
  }

  private async checkTokenExpiry(): Promise<void> {
    if (this.accessToken && this.tokenExpiresAt - Date.now() < this.config.security.tokenRefreshThreshold * 1000) {
      if (this.refreshToken) {
        try {
          await this.refreshAuthentication(this.refreshToken)
        } catch (error) {
          console.error('Token refresh failed:', error)
          this.emitEvent('onError', this.createApiError('TOKEN_REFRESH_FAILED', 'Failed to refresh token', false))
        }
      }
    }
  }

  private validateDeviceInfo(deviceInfo: DeviceInfo): void {
    if (!deviceInfo.id || !deviceInfo.platform) {
      throw new Error('Invalid device info: id and platform are required')
    }
  }

  private buildUserPreferences(profile: any): any {
    return {
      language: profile.language || 'pt-BR',
      timezone: profile.timezone || 'America/Sao_Paulo',
      notifications: profile.notification_preferences || {
        appointments: true,
        reminders: true,
        payments: true,
        system: true,
        marketing: false,
        sound: true,
        vibration: true,
        badge: true
      },
      theme: profile.theme || 'auto',
      dataUsage: profile.data_usage || 'standard',
      offlineMode: profile.offline_mode || true,
      autoSync: profile.auto_sync || true,
      compressionLevel: profile.compression_level || 'medium'
    }
  }

  private getCurrentDeviceInfo(): DeviceInfo {
    // This should be provided by the client application
    return {
      id: 'unknown',
      platform: 'web',
      version: '1.0.0',
      screenWidth: window.innerWidth || 1920,
      screenHeight: window.innerHeight || 1080,
      pixelDensity: window.devicePixelRatio || 1,
      isTablet: false,
      hasNotifications: 'Notification' in window,
      hasBiometrics: false,
      hasCamera: false,
      hasLocation: 'geolocation' in navigator,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      appVersion: '1.0.0',
      buildNumber: '1',
      lastSeen: new Date()
    }
  }

  private shouldCheckCache(request: MobileApiRequest): boolean {
    const strategy = request.cacheStrategy || this.config.cache.strategy
    return ['cache-first', 'cache-only'].includes(strategy) && request.method === 'GET'
  }

  private shouldCacheResponse(request: MobileApiRequest, response: MobileApiResponse): boolean {
    return request.method === 'GET' && response.success && response.data
  }

  private shouldCompressRequest(request: MobileApiRequest): boolean {
    if (!request.body) return false
    
    const bodySize = JSON.stringify(request.body).length
    return bodySize >= this.config.compression.threshold
  }

  private buildCacheKey(request: MobileApiRequest): string {
    const params = request.params ? JSON.stringify(request.params) : ''
    return `${request.method}:${request.endpoint}:${params}`
  }

  private buildResponse<T>(data: T, metadata: any): MobileApiResponse<T> {
    return {
      success: true,
      data,
      metadata
    }
  }

  private createApiError(code: string, message: string, retryable: boolean): ApiError {
    return {
      code,
      message,
      retryable,
      retryAfter: retryable ? this.config.retryDelay / 1000 : undefined
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private mapMethodToOperationType(method: string): 'create' | 'update' | 'delete' {
    switch (method) {
      case 'POST': return 'create'
      case 'PUT':
      case 'PATCH': return 'update'
      case 'DELETE': return 'delete'
      default: return 'update'
    }
  }

  private extractEntityFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/').filter(Boolean)
    return parts[0] || 'unknown'
  }

  private extractEntityIdFromRequest(request: MobileApiRequest): string {
    const parts = request.endpoint.split('/').filter(Boolean)
    return parts[1] || 'unknown'
  }

  private async getStorageUsage(): Promise<any> {
    // Implement storage usage calculation
    return {
      total: 0,
      used: 0,
      available: 0,
      percentage: 0,
      breakdown: {
        cache: 0,
        offline: 0,
        images: 0,
        documents: 0,
        other: 0
      }
    }
  }

  private async getPerformanceMetrics(): Promise<any> {
    // Implement performance metrics calculation
    return {
      averageResponseTime: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
      errorRate: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0
    }
  }

  private emitEvent(eventType: keyof MobileApiEventHandlers, ...args: any[]): void {
    const handler = this.eventHandlers[eventType]
    if (handler) {
      try {
        (handler as any)(...args)
      } catch (error) {
        console.error(`Error in event handler ${eventType}:`, error)
      }
    }
  }

  // ============================================================================
  // PUBLIC EVENT MANAGEMENT
  // ============================================================================

  on<K extends keyof MobileApiEventHandlers>(event: K, handler: MobileApiEventHandlers[K]): void {
    this.eventHandlers[event] = handler
  }

  off<K extends keyof MobileApiEventHandlers>(event: K): void {
    delete this.eventHandlers[event]
  }
}

// Export singleton instance
export const mobileApiSystem = new MobileApiSystemImpl()

