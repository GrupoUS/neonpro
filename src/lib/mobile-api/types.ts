/**
 * Mobile API Types & Interfaces
 * Story 7.4: Mobile App API Support Implementation
 * 
 * Comprehensive type definitions for mobile-optimized APIs:
 * - Offline synchronization types
 * - Push notification interfaces
 * - Mobile authentication types
 * - Data compression schemas
 * - Cache management types
 * - Mobile-specific request/response formats
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// CORE MOBILE API TYPES
// ============================================================================

export type MobileApiVersion = '1.0' | '1.1' | '2.0'
export type DevicePlatform = 'ios' | 'android' | 'web'
export type NetworkStatus = 'online' | 'offline' | 'slow'
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'
export type CompressionLevel = 'none' | 'low' | 'medium' | 'high'
export type CacheStrategy = 'cache-first' | 'network-first' | 'cache-only' | 'network-only'

// ============================================================================
// DEVICE & CLIENT INFORMATION
// ============================================================================

export interface DeviceInfo {
  id: string
  platform: DevicePlatform
  version: string
  model?: string
  manufacturer?: string
  screenWidth: number
  screenHeight: number
  pixelDensity: number
  isTablet: boolean
  hasNotifications: boolean
  hasBiometrics: boolean
  hasCamera: boolean
  hasLocation: boolean
  timezone: string
  locale: string
  appVersion: string
  buildNumber: string
  lastSeen: Date
}

export interface ClientCapabilities {
  supportsOffline: boolean
  supportsCompression: boolean
  supportsPushNotifications: boolean
  supportsBiometrics: boolean
  supportsCamera: boolean
  supportsLocation: boolean
  maxPayloadSize: number
  preferredImageFormat: 'webp' | 'jpeg' | 'png'
  supportedCompressionFormats: string[]
}

// ============================================================================
// MOBILE AUTHENTICATION
// ============================================================================

export interface MobileAuthRequest {
  email?: string
  phone?: string
  password?: string
  biometricData?: string
  deviceId: string
  deviceInfo: DeviceInfo
  pushToken?: string
  refreshToken?: string
}

export interface MobileAuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: MobileUser
  clinic: MobileClinic
  permissions: string[]
  features: string[]
  syncTimestamp: number
}

export interface MobileUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  clinicId: string
  preferences: MobileUserPreferences
  lastLoginAt: Date
  isActive: boolean
}

export interface MobileUserPreferences {
  language: string
  timezone: string
  notifications: NotificationPreferences
  theme: 'light' | 'dark' | 'auto'
  dataUsage: 'minimal' | 'standard' | 'full'
  offlineMode: boolean
  autoSync: boolean
  compressionLevel: CompressionLevel
}

export interface NotificationPreferences {
  appointments: boolean
  reminders: boolean
  payments: boolean
  system: boolean
  marketing: boolean
  sound: boolean
  vibration: boolean
  badge: boolean
}

// ============================================================================
// MOBILE CLINIC DATA
// ============================================================================

export interface MobileClinic {
  id: string
  name: string
  logo?: string
  address: string
  phone: string
  email: string
  website?: string
  timezone: string
  businessHours: BusinessHours[]
  features: string[]
  subscription: SubscriptionInfo
  branding: ClinicBranding
}

export interface BusinessHours {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  openTime: string // HH:mm
  closeTime: string // HH:mm
  isOpen: boolean
}

export interface SubscriptionInfo {
  plan: string
  features: string[]
  limits: {
    patients: number
    appointments: number
    storage: number // MB
    apiCalls: number
  }
  expiresAt: Date
}

export interface ClinicBranding {
  primaryColor: string
  secondaryColor: string
  logo?: string
  favicon?: string
  customCss?: string
}

// ============================================================================
// OFFLINE SYNCHRONIZATION
// ============================================================================

export interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  entityId: string
  data: any
  timestamp: number
  status: SyncStatus
  retryCount: number
  lastError?: string
  conflictData?: any
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface SyncBatch {
  id: string
  operations: SyncOperation[]
  timestamp: number
  status: SyncStatus
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  conflictOperations: number
}

export interface SyncConflict {
  id: string
  operationId: string
  entity: string
  entityId: string
  localData: any
  serverData: any
  conflictType: 'data' | 'version' | 'deleted'
  timestamp: number
  resolution?: 'local' | 'server' | 'merge' | 'manual'
  resolvedData?: any
}

export interface SyncStatus {
  isOnline: boolean
  lastSyncAt?: Date
  nextSyncAt?: Date
  pendingOperations: number
  conflictCount: number
  syncInProgress: boolean
  syncProgress: number // 0-100
  estimatedTimeRemaining?: number // seconds
}

export interface OfflineStorage {
  patients: OfflinePatient[]
  appointments: OfflineAppointment[]
  treatments: OfflineTreatment[]
  payments: OfflinePayment[]
  metadata: OfflineMetadata
}

export interface OfflineMetadata {
  lastSyncTimestamp: number
  version: string
  checksum: string
  totalRecords: number
  storageSize: number // bytes
  expiresAt: number
}

// ============================================================================
// MOBILE-OPTIMIZED DATA MODELS
// ============================================================================

export interface OfflinePatient {
  id: string
  name: string
  email?: string
  phone?: string
  birthDate?: string
  gender?: string
  avatar?: string
  address?: string
  emergencyContact?: string
  allergies?: string[]
  medications?: string[]
  notes?: string
  tags?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  lastModifiedBy: string
}

export interface OfflineAppointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  treatmentId?: string
  treatmentName?: string
  scheduledAt: string
  duration: number // minutes
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  type: 'consultation' | 'treatment' | 'follow_up' | 'emergency'
  notes?: string
  reminders: AppointmentReminder[]
  location?: string
  isVirtual: boolean
  meetingUrl?: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

export interface AppointmentReminder {
  id: string
  type: 'sms' | 'email' | 'push' | 'call'
  scheduledFor: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  message?: string
}

export interface OfflineTreatment {
  id: string
  name: string
  description?: string
  category: string
  duration: number // minutes
  price: number
  currency: string
  isActive: boolean
  requirements?: string[]
  contraindications?: string[]
  instructions?: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

export interface OfflinePayment {
  id: string
  appointmentId?: string
  patientId: string
  amount: number
  currency: string
  method: 'cash' | 'card' | 'pix' | 'boleto' | 'transfer'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  description?: string
  transactionId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

export interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  image?: string
  badge?: number
  sound?: string
  vibrate?: number[]
  data?: Record<string, any>
  actions?: NotificationAction[]
  category?: string
  priority: 'min' | 'low' | 'default' | 'high' | 'max'
  ttl?: number // seconds
  scheduledFor?: Date
  expiresAt?: Date
}

export interface NotificationAction {
  id: string
  title: string
  icon?: string
  type: 'button' | 'input'
  placeholder?: string
  options?: string[]
}

export interface PushSubscription {
  deviceId: string
  userId: string
  clinicId: string
  token: string
  platform: DevicePlatform
  isActive: boolean
  preferences: NotificationPreferences
  createdAt: Date
  updatedAt: Date
  lastUsed: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'appointment_reminder' | 'payment_due' | 'treatment_complete' | 'system_alert' | 'marketing'
  title: string
  body: string
  icon?: string
  sound?: string
  category?: string
  variables: string[]
  isActive: boolean
  clinicId?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// DATA COMPRESSION
// ============================================================================

export interface CompressionConfig {
  level: CompressionLevel
  algorithm: 'gzip' | 'brotli' | 'deflate'
  threshold: number // bytes - minimum size to compress
  mimeTypes: string[]
  excludePatterns: string[]
}

export interface CompressedPayload {
  data: string // base64 encoded compressed data
  algorithm: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  checksum: string
}

export interface CompressionResult {
  success: boolean
  originalSize: number
  compressedSize: number
  compressionRatio: number
  algorithm: string
  processingTime: number // milliseconds
  error?: string
}

// ============================================================================
// MOBILE CACHE MANAGEMENT
// ============================================================================

export interface CacheConfig {
  strategy: CacheStrategy
  ttl: number // seconds
  maxSize: number // bytes
  maxEntries: number
  compression: boolean
  encryption: boolean
  persistToDisk: boolean
  syncOnReconnect: boolean
}

export interface CacheEntry {
  key: string
  data: any
  metadata: CacheMetadata
  createdAt: number
  updatedAt: number
  accessedAt: number
  expiresAt: number
  size: number // bytes
  compressed: boolean
  encrypted: boolean
}

export interface CacheMetadata {
  version: string
  etag?: string
  lastModified?: string
  contentType?: string
  source: 'network' | 'cache' | 'offline'
  priority: 'low' | 'normal' | 'high'
  tags: string[]
}

export interface CacheStats {
  totalEntries: number
  totalSize: number // bytes
  hitRate: number // percentage
  missRate: number // percentage
  evictionCount: number
  oldestEntry?: Date
  newestEntry?: Date
  averageSize: number // bytes
  compressionRatio: number
}

// ============================================================================
// MOBILE API REQUESTS & RESPONSES
// ============================================================================

export interface MobileApiRequest {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: Record<string, string>
  params?: Record<string, any>
  body?: any
  deviceInfo: DeviceInfo
  clientCapabilities: ClientCapabilities
  cacheStrategy?: CacheStrategy
  compressionLevel?: CompressionLevel
  priority: 'low' | 'normal' | 'high' | 'critical'
  timeout?: number // milliseconds
  retryCount?: number
  offlineFallback?: boolean
}

export interface MobileApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  metadata: ResponseMetadata
  pagination?: PaginationInfo
  syncInfo?: SyncInfo
}

export interface ResponseMetadata {
  requestId: string
  timestamp: number
  processingTime: number // milliseconds
  source: 'network' | 'cache' | 'offline'
  version: MobileApiVersion
  compression?: CompressionResult
  cacheInfo?: CacheInfo
}

export interface CacheInfo {
  hit: boolean
  age: number // seconds
  ttl: number // seconds
  key: string
  strategy: CacheStrategy
}

export interface ApiError {
  code: string
  message: string
  details?: any
  retryable: boolean
  retryAfter?: number // seconds
  documentation?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  nextCursor?: string
  prevCursor?: string
}

export interface SyncInfo {
  lastSyncAt: number
  nextSyncAt?: number
  pendingChanges: number
  conflicts: number
  serverTimestamp: number
  clientTimestamp: number
}

// ============================================================================
// MOBILE API CONFIGURATION
// ============================================================================

export interface MobileApiConfig {
  baseUrl: string
  version: MobileApiVersion
  timeout: number // milliseconds
  retryAttempts: number
  retryDelay: number // milliseconds
  compression: CompressionConfig
  cache: CacheConfig
  offline: OfflineConfig
  push: PushConfig
  security: SecurityConfig
  performance: PerformanceConfig
}

export interface OfflineConfig {
  enabled: boolean
  maxStorageSize: number // bytes
  syncInterval: number // seconds
  conflictResolution: 'client' | 'server' | 'manual' | 'timestamp'
  autoSync: boolean
  syncOnReconnect: boolean
  backgroundSync: boolean
  maxRetries: number
  retryDelay: number // seconds
}

export interface PushConfig {
  enabled: boolean
  vapidKey?: string
  serviceWorkerPath?: string
  defaultIcon?: string
  defaultBadge?: string
  maxNotifications: number
  grouping: boolean
  persistence: boolean
}

export interface SecurityConfig {
  encryption: boolean
  encryptionKey?: string
  tokenRefreshThreshold: number // seconds before expiry
  biometricTimeout: number // seconds
  maxFailedAttempts: number
  lockoutDuration: number // seconds
  certificatePinning: boolean
  allowInsecureConnections: boolean
}

export interface PerformanceConfig {
  imageOptimization: boolean
  lazyLoading: boolean
  prefetching: boolean
  bundleCompression: boolean
  minificationLevel: 'none' | 'basic' | 'aggressive'
  cachePreloading: boolean
  backgroundProcessing: boolean
  memoryManagement: boolean
}

// ============================================================================
// MOBILE API SYSTEM INTERFACES
// ============================================================================

export interface MobileApiSystem {
  initialize(config: MobileApiConfig): Promise<void>
  authenticate(request: MobileAuthRequest): Promise<MobileAuthResponse>
  request<T>(request: MobileApiRequest): Promise<MobileApiResponse<T>>
  sync(options?: SyncOptions): Promise<SyncResult>
  sendPushNotification(notification: PushNotification, targets: string[]): Promise<PushResult>
  getOfflineData(): Promise<OfflineStorage>
  clearCache(pattern?: string): Promise<void>
  getSystemStatus(): Promise<SystemStatus>
  destroy(): Promise<void>
}

export interface SyncOptions {
  force?: boolean
  entities?: string[]
  direction?: 'up' | 'down' | 'both'
  batchSize?: number
  priority?: 'low' | 'normal' | 'high'
  timeout?: number // milliseconds
}

export interface SyncResult {
  success: boolean
  operations: SyncOperation[]
  conflicts: SyncConflict[]
  errors: ApiError[]
  statistics: SyncStatistics
  duration: number // milliseconds
}

export interface SyncStatistics {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  conflictOperations: number
  bytesTransferred: number
  compressionRatio: number
}

export interface PushResult {
  success: boolean
  delivered: number
  failed: number
  errors: ApiError[]
  messageId?: string
}

export interface SystemStatus {
  online: boolean
  apiVersion: MobileApiVersion
  serverTime: number
  clientTime: number
  timeDrift: number // milliseconds
  latency: number // milliseconds
  cacheStats: CacheStats
  syncStatus: SyncStatus
  storageUsage: StorageUsage
  performance: PerformanceMetrics
}

export interface StorageUsage {
  total: number // bytes
  used: number // bytes
  available: number // bytes
  percentage: number
  breakdown: {
    cache: number
    offline: number
    images: number
    documents: number
    other: number
  }
}

export interface PerformanceMetrics {
  averageResponseTime: number // milliseconds
  cacheHitRate: number // percentage
  compressionRatio: number
  errorRate: number // percentage
  throughput: number // requests per second
  memoryUsage: number // bytes
  cpuUsage: number // percentage
}

// ============================================================================
// EVENT HANDLERS & CALLBACKS
// ============================================================================

export interface MobileApiEventHandlers {
  onNetworkChange?: (status: NetworkStatus) => void
  onSyncStart?: (batch: SyncBatch) => void
  onSyncProgress?: (progress: number, operation: SyncOperation) => void
  onSyncComplete?: (result: SyncResult) => void
  onSyncConflict?: (conflict: SyncConflict) => void
  onCacheUpdate?: (key: string, entry: CacheEntry) => void
  onPushReceived?: (notification: PushNotification) => void
  onError?: (error: ApiError) => void
  onPerformanceAlert?: (metric: string, value: number, threshold: number) => void
}

export type MobileApiEventType = keyof MobileApiEventHandlers

export interface MobileApiEvent {
  type: MobileApiEventType
  timestamp: number
  data: any
  source: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type MobileApiCallback<T = any> = (error: ApiError | null, result?: T) => void

export type MobileApiPromise<T = any> = Promise<MobileApiResponse<T>>

// ============================================================================
// CONSTANTS
// ============================================================================

export const MOBILE_API_CONSTANTS = {
  VERSION: '2.0' as MobileApiVersion,
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  DEFAULT_CACHE_TTL: 300, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_OFFLINE_STORAGE: 100 * 1024 * 1024, // 100MB
  SYNC_INTERVAL: 60, // 1 minute
  COMPRESSION_THRESHOLD: 1024, // 1KB
  MAX_PUSH_NOTIFICATIONS: 100,
  BIOMETRIC_TIMEOUT: 300, // 5 minutes
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutes
} as const

export const SUPPORTED_PLATFORMS: DevicePlatform[] = ['ios', 'android', 'web']
export const SUPPORTED_COMPRESSION_ALGORITHMS = ['gzip', 'brotli', 'deflate'] as const
export const SUPPORTED_CACHE_STRATEGIES: CacheStrategy[] = ['cache-first', 'network-first', 'cache-only', 'network-only']
export const SUPPORTED_SYNC_DIRECTIONS = ['up', 'down', 'both'] as const
export const SUPPORTED_NOTIFICATION_TYPES = ['appointment_reminder', 'payment_due', 'treatment_complete', 'system_alert', 'marketing'] as const